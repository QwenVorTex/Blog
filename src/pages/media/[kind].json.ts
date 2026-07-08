import type { APIContext } from 'astro';
import { createMediaClientItems } from '@/lib/media-client';
import { getAnimeCollection, getGameCollection, type MediaInfo } from '@/lib/media';

export function getStaticPaths() {
  return [
    { params: { kind: 'anime' }, props: { items: getAnimeCollection() } },
    { params: { kind: 'games' }, props: { items: getGameCollection() } },
  ];
}

export async function GET({ props }: APIContext) {
  const items = props.items as MediaInfo[];
  return new Response(JSON.stringify(createMediaClientItems(items)), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
