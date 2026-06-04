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

function createNormalizer(labels: Record<string, string>) {
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
    };
  };
}

const normalizeAnime = createNormalizer(ANIME_LABELS);
const normalizeGame = createNormalizer(GAME_LABELS);

export function getAnimeCollection(): MediaInfo[] {
  return animeEntries.map(normalizeAnime);
}

export function getGameCollection(): MediaInfo[] {
  return gameEntries.map(normalizeGame);
}
