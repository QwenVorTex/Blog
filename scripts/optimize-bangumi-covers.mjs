/**
 * Optimize existing Bangumi covers for static publishing.
 *
 * Reads src/data/bangumi-*.json, generates WebP card-sized variants into public/bangumi,
 * updates JSON cover fields, and optionally moves original downloaded files out of public.
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const MOVE_ORIGINALS = process.argv.includes('--move-originals');
const TYPES = ['anime', 'games'];

const PUBLIC_DIR = resolve(ROOT, 'public', 'bangumi');
const CACHE_DIR = resolve(ROOT, '.cache', 'bangumi-originals');

const VARIANTS = {
  anime: {
    small: { width: 320, height: 400 },
    large: { width: 640, height: 800 },
  },
  games: {
    small: { width: 420, height: 263 },
    large: { width: 840, height: 525 },
  },
};

function normalizePublicPath(path) {
  return path.replaceAll('\\', '/').replace(/^public\//, '/');
}

function getOptimizedPaths(type, bangumiId) {
  const small = `/bangumi/${type}/${bangumiId}-sm.webp`;
  const large = `/bangumi/${type}/${bangumiId}-lg.webp`;
  return {
    small,
    large,
    smallAbs: resolve(ROOT, 'public', small.slice(1)),
    largeAbs: resolve(ROOT, 'public', large.slice(1)),
  };
}

function findSourceCover(type, entry) {
  const candidates = [];
  const currentCover = entry.cover?.replace(/^\//, '');
  if (currentCover) candidates.push(resolve(ROOT, 'public', currentCover));

  for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'gif']) {
    candidates.push(resolve(PUBLIC_DIR, type, `${entry.bangumiId}.${ext}`));
    candidates.push(resolve(CACHE_DIR, type, `${entry.bangumiId}.${ext}`));
  }

  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

async function writeVariant(sourcePath, outputPath, size) {
  mkdirSync(dirname(outputPath), { recursive: true });
  await sharp(sourcePath)
    .rotate()
    .resize(size.width, size.height, {
      fit: 'cover',
      position: 'centre',
      withoutEnlargement: true,
    })
    .webp({ quality: 78, effort: 4 })
    .toFile(outputPath);
}

async function optimizeEntry(type, entry) {
  const sourcePath = findSourceCover(type, entry);
  if (!sourcePath) return entry;

  const paths = getOptimizedPaths(type, entry.bangumiId);
  const sizes = VARIANTS[type];

  await writeVariant(sourcePath, paths.smallAbs, sizes.small);
  await writeVariant(sourcePath, paths.largeAbs, sizes.large);

  if (MOVE_ORIGINALS && sourcePath.startsWith(resolve(PUBLIC_DIR, type))) {
    const ext = extname(sourcePath);
    const destination = resolve(CACHE_DIR, type, `${entry.bangumiId}${ext}`);
    mkdirSync(dirname(destination), { recursive: true });
    if (!existsSync(destination)) {
      renameSync(sourcePath, destination);
    }
  }

  return {
    ...entry,
    cover: normalizePublicPath(paths.small),
    coverSmall: normalizePublicPath(paths.small),
    coverLarge: normalizePublicPath(paths.large),
    coverSrcSet: `${normalizePublicPath(paths.small)} ${sizes.small.width}w, ${normalizePublicPath(paths.large)} ${sizes.large.width}w`,
    coverWidth: sizes.small.width,
    coverHeight: sizes.small.height,
  };
}

async function optimizeType(type) {
  const jsonPath = resolve(ROOT, 'src', 'data', `bangumi-${type}.json`);
  const entries = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  const nextEntries = [];

  for (const entry of entries) {
    nextEntries.push(await optimizeEntry(type, entry));
  }

  writeFileSync(jsonPath, `${JSON.stringify(nextEntries, null, 2)}\n`, 'utf-8');
  console.log(`[${type}] optimized ${nextEntries.length} entries`);
}

for (const type of TYPES) {
  await optimizeType(type);
}
