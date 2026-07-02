import { animeEntries, gameEntries, type BangumiEntry } from '@/data/media';

export interface MediaInfo {
  bangumiId: number;
  name: string;
  nameCn: string;
  label: string;
  url: string;
  date: string;
  year: string;
  summary: string;
  score: number;
  rank: number;
  tags: string[];
  cover: string;
  collectionType: string;
  myRate: number;
  statusTone?: 'done' | 'doing' | 'wish' | 'paused' | 'neutral';
  displayScore?: string;
  coverAspect?: 'poster' | 'wide';
}

const ANIME_LABELS: Record<string, string> = {
  wish: '想看',
  done: '看过',
  doing: '在看',
  on_hold: '搁置',
  dropped: '抛弃',
};

const GAME_LABELS: Record<string, string> = {
  wish: '想玩',
  done: '玩过',
  doing: '在玩',
  on_hold: '搁置',
  dropped: '抛弃',
};

const STATUS_TONES: Record<string, MediaInfo['statusTone']> = {
  done: 'done',
  doing: 'doing',
  wish: 'wish',
  on_hold: 'paused',
  dropped: 'paused',
};

function formatDisplayScore(entry: BangumiEntry) {
  if (entry.myRate > 0) return `★${entry.myRate}`;
  if (entry.score > 0) return entry.score.toFixed(1);
  return 'NA';
}

function createNormalizer(labels: Record<string, string>, coverAspect: 'poster' | 'wide') {
  return (entry: BangumiEntry): MediaInfo => {
    const nameCn = entry.name_cn || entry.name;
    return {
      bangumiId: entry.bangumiId,
      name: entry.name,
      nameCn,
      label: nameCn,
      url: `https://bgm.tv/subject/${entry.bangumiId}`,
      date: entry.date,
      year: entry.date?.slice(0, 4) ?? '',
      summary: entry.summary,
      score: entry.score,
      rank: entry.rank,
      tags: entry.tags,
      cover: entry.cover,
      collectionType: labels[entry.collectionType] ?? entry.collectionType,
      myRate: entry.myRate,
      statusTone: STATUS_TONES[entry.collectionType] ?? 'neutral',
      displayScore: formatDisplayScore(entry),
      coverAspect,
    };
  };
}

const normalizeAnime = createNormalizer(ANIME_LABELS, 'poster');
const normalizeGame = createNormalizer(GAME_LABELS, 'wide');

export function getAnimeCollection(): MediaInfo[] {
  return animeEntries.map(normalizeAnime);
}

export function getGameCollection(): MediaInfo[] {
  return gameEntries.map(normalizeGame);
}
