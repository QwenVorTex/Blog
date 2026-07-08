import type { MediaInfo } from '@/lib/media';

export interface MediaClientItem {
  bangumiId: number;
  name: string;
  nameCn: string;
  label: string;
  url: string;
  date: string;
  year: string;
  score: number;
  rank: number;
  tags: string[];
  cover: string;
  coverLarge?: string;
  coverSrcSet?: string;
  coverWidth?: number;
  coverHeight?: number;
  collectionType: string;
  myRate: number;
  statusTone?: string;
  displayScore?: string;
  searchText: string;
}

export function createMediaClientItems(items: MediaInfo[]): MediaClientItem[] {
  return items.map((item) => ({
    bangumiId: item.bangumiId,
    name: item.name,
    nameCn: item.nameCn,
    label: item.label,
    url: item.url,
    date: item.date,
    year: item.year,
    score: item.score,
    rank: item.rank,
    tags: item.tags,
    cover: item.coverSmall || item.cover,
    coverLarge: item.coverLarge,
    coverSrcSet: item.coverSrcSet,
    coverWidth: item.coverWidth,
    coverHeight: item.coverHeight,
    collectionType: item.collectionType,
    myRate: item.myRate,
    statusTone: item.statusTone ?? 'neutral',
    displayScore: item.displayScore,
    searchText: [item.name, item.nameCn, item.year, item.collectionType, ...item.tags].filter(Boolean).join(' '),
  }));
}
