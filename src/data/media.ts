/** Bangumi 收藏条目结构（由 fetch-bangumi.mjs 生成） */
export interface BangumiEntry {
  bangumiId: number;
  name: string;
  name_cn: string;
  date: string;
  summary: string;
  score: number;
  rank: number;
  tags: string[];
  cover: string;
  collectionType: 'wish' | 'done' | 'doing' | 'on_hold' | 'dropped';
  myRate: number;
  epStatus: number;
  volStatus: number;
  updatedAt: string;
}

import animeData from './bangumi-anime.json';
import gameData from './bangumi-games.json';

export const animeEntries: BangumiEntry[] = animeData as BangumiEntry[];
export const gameEntries: BangumiEntry[] = gameData as BangumiEntry[];
