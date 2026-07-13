/**
 * fetch-bangumi.mjs
 *
 * 从 Bangumi API 拉取用户收藏数据（番剧 + 游戏），下载封面图到本地。
 * 增量更新：已有条目跳过封面下载，JSON 仅在数据变化时覆写。
 * 需要代理环境下运行（api.bgm.tv 在国内被墙）。
 *
 * 用法：node scripts/fetch-bangumi.mjs
 * 可选：--user=qwenvortex --refresh-covers --per-page=50
 * 环境变量：BANGUMI_USERNAME / BANGUMI_USER_AGENT / BANGUMI_API_BASE / BANGUMI_REFRESH_COVERS=1
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const args = new Map(
  process.argv.slice(2).flatMap((arg) => {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    return match ? [[match[1], match[2]]] : [];
  })
);

const flags = new Set(process.argv.slice(2).filter((arg) => arg.startsWith('--') && !arg.includes('=')));

const BANGUMI_USERNAME = args.get('user') || process.env.BANGUMI_USERNAME || 'qwenvortex';
const API_BASE = args.get('api-base') || process.env.BANGUMI_API_BASE || 'https://api.bgm.tv';
const USER_AGENT = args.get('user-agent') || process.env.BANGUMI_USER_AGENT || 'TorQuenBlog/1.0 (https://github.com/QwenVorTex/Blog)';
const REFRESH_COVERS = flags.has('--refresh-covers') || process.env.BANGUMI_REFRESH_COVERS === '1';
const PER_PAGE = Number(args.get('per-page') || process.env.BANGUMI_PER_PAGE || 50);

const SUBJECT_TYPE = { anime: 2, games: 4 };
const COLLECTION_TYPE = { 1: 'wish', 2: 'done', 3: 'doing', 4: 'on_hold', 5: 'dropped' };
const COVER_CACHE_DIR = resolve(ROOT, '.cache', 'bangumi-originals');
const COVER_VARIANTS = {
  anime: {
    small: { width: 320, height: 400 },
    large: { width: 640, height: 800 },
  },
  games: {
    small: { width: 420, height: 263 },
    large: { width: 840, height: 525 },
  },
};

async function fetchJSON(path) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function fetchAllCollections(type) {
  const subjectType = SUBJECT_TYPE[type];
  const all = [];
  let offset = 0;

  const first = await fetchJSON(
    `/v0/users/${BANGUMI_USERNAME}/collections?subject_type=${subjectType}&limit=${PER_PAGE}&offset=0`
  );
  const total = first.total ?? 0;
  console.log(`[${type}] total: ${total}`);
  all.push(...(first.data ?? []));

  while (all.length < total) {
    offset += PER_PAGE;
    const page = await fetchJSON(
      `/v0/users/${BANGUMI_USERNAME}/collections?subject_type=${subjectType}&limit=${PER_PAGE}&offset=${offset}`
    );
    all.push(...(page.data ?? []));
    console.log(`  fetched ${all.length}/${total}`);
  }

  return all;
}

async function downloadImage(imageUrl, destPath) {
  if (existsSync(destPath) && !REFRESH_COVERS) return false;
  try {
    const res = await fetch(imageUrl, {
      headers: { 'User-Agent': USER_AGENT, Referer: 'https://bgm.tv/' },
    });
    if (!res.ok) {
      console.warn(`  image download failed (${res.status}): ${imageUrl}`);
      return false;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(destPath, buffer);
    return true;
  } catch (e) {
    console.warn(`  image download error: ${imageUrl} — ${e.message}`);
    return false;
  }
}

function toPublicPath(absPath) {
  return `/${absPath.replace(resolve(ROOT, 'public'), '').replaceAll('\\', '/').replace(/^\/?/, '')}`;
}

function getCoverVariantPaths(type, subjectId) {
  return {
    small: resolve(ROOT, 'public', 'bangumi', type, `${subjectId}-sm.webp`),
    large: resolve(ROOT, 'public', 'bangumi', type, `${subjectId}-lg.webp`),
  };
}

async function optimizeCover(sourcePath, type, subjectId, { force = false } = {}) {
  const variants = COVER_VARIANTS[type];
  const output = getCoverVariantPaths(type, subjectId);
  mkdirSync(dirname(output.small), { recursive: true });

  const writeVariant = async (path, size, quality) => {
    if (!force && existsSync(path)) return;

    await sharp(sourcePath)
      .rotate()
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'centre',
        withoutEnlargement: true,
      })
      .webp({ quality, effort: 4 })
      .toFile(path);
  };

  await Promise.all([
    writeVariant(output.small, variants.small, 78),
    writeVariant(output.large, variants.large, 80),
  ]);

  const coverSmall = toPublicPath(output.small);
  const coverLarge = toPublicPath(output.large);

  return {
    cover: coverSmall,
    coverSmall,
    coverLarge,
    coverSrcSet: `${coverSmall} ${variants.small.width}w, ${coverLarge} ${variants.large.width}w`,
    coverWidth: variants.small.width,
    coverHeight: variants.small.height,
  };
}

/**
 * 加载已有 JSON 数据，构建 bangumiId → updatedAt 索引
 */
function loadExistingIndex(type) {
  const jsonPath = resolve(ROOT, 'src', 'data', `bangumi-${type}.json`);
  if (!existsSync(jsonPath)) return new Map();
  try {
    const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));
    return new Map(data.map((item) => [item.bangumiId, item.updatedAt]));
  } catch {
    return new Map();
  }
}

async function processCollections(items, type) {
  const imageDir = resolve(ROOT, 'public', 'bangumi', type);
  mkdirSync(imageDir, { recursive: true });
  const cacheDir = resolve(COVER_CACHE_DIR, type);
  mkdirSync(cacheDir, { recursive: true });

  const existingIndex = loadExistingIndex(type);
  const results = [];
  let newCount = 0;
  let updatedCount = 0;

  for (const item of items) {
    const subj = item.subject ?? {};
    const subjectId = subj.id ?? item.subject_id;
    const images = subj.images ?? {};
    const coverUrl = images.large || images.medium || images.common || images.small || '';
    const ext = coverUrl.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)?.[1] || 'jpg';

    const updatedAt = item.updated_at ?? '';
    const prevUpdated = existingIndex.get(subjectId);

    // 判断是否需要下载封面（新条目或 updatedAt 变化）
    let coverInfo = {
      cover: '',
      coverSmall: '',
      coverLarge: '',
      coverSrcSet: '',
      coverWidth: 0,
      coverHeight: 0,
    };

    if (coverUrl) {
      const originalPath = resolve(cacheDir, `${subjectId}.${ext}`);
      const downloaded = await downloadImage(coverUrl, originalPath);
      if (downloaded) newCount++;
      const sourcePath = existsSync(originalPath)
        ? originalPath
        : resolve(cacheDir, `${subjectId}${extname(originalPath)}`);
      if (existsSync(sourcePath)) {
        coverInfo = await optimizeCover(sourcePath, type, subjectId, {
          force: downloaded || REFRESH_COVERS,
        });
      }
    }

    if (prevUpdated === undefined) {
      newCount++;
    } else if (prevUpdated !== updatedAt) {
      updatedCount++;
    }

    results.push({
      bangumiId: subjectId,
      name: subj.name ?? '',
      name_cn: subj.name_cn ?? '',
      date: subj.date ?? '',
      summary: (subj.short_summary ?? '').slice(0, 120),
      score: subj.score ?? 0,
      rank: subj.rank ?? 0,
      tags: (subj.tags ?? []).slice(0, 5).map((t) => t.name ?? t),
      ...coverInfo,
      collectionType: COLLECTION_TYPE[item.type] ?? 'unknown',
      myRate: item.rate ?? 0,
      epStatus: item.ep_status ?? 0,
      volStatus: item.vol_status ?? 0,
      updatedAt,
    });
  }

  results.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  console.log(`  new: ${newCount}, updated: ${updatedCount}, total: ${results.length}`);

  return results;
}

async function main() {
  console.log(`Fetching Bangumi collections for user: ${BANGUMI_USERNAME}`);
  console.log(`API: ${API_BASE}`);
  console.log(`Refresh covers: ${REFRESH_COVERS ? 'yes' : 'no'}\n`);

  for (const type of ['anime', 'games']) {
    console.log(`\n=== ${type} ===`);
    const items = await fetchAllCollections(type);
    const data = await processCollections(items, type);

    const outPath = resolve(ROOT, 'src', 'data', `bangumi-${type}.json`);
    writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Saved → ${outPath}`);
  }

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

