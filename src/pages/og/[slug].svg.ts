import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { siteConfig } from '@/config/site';
import { getPublishedPosts } from '@/lib/posts';

export async function getStaticPaths() {
  const posts = getPublishedPosts(await getCollection('posts'));
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function wrapText(value: string, maxChars: number) {
  const chars = Array.from(value);
  const lines: string[] = [];
  let line = '';

  for (const char of chars) {
    line += char;
    if (line.length >= maxChars) {
      lines.push(line);
      line = '';
    }
  }
  if (line) lines.push(line);

  return lines.slice(0, 3);
}

export async function GET({ props }: APIContext) {
  const post = props.post;
  const titleLines = wrapText(post.data.title, 18);
  const description = post.data.description;

  const titleMarkup = titleLines
    .map((line, index) => `<tspan x="96" dy="${index === 0 ? 0 : 78}">${escapeXml(line)}</tspan>`)
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F9F8F4"/>
  <rect x="72" y="72" width="1056" height="486" fill="#FFFFFF" stroke="#000000" stroke-width="12"/>
  <rect x="72" y="72" width="1056" height="52" fill="#FFCB2F" stroke="#000000" stroke-width="12"/>
  <rect x="872" y="214" width="168" height="168" fill="#1578EA" stroke="#000000" stroke-width="12"/>
  <rect x="938" y="316" width="128" height="128" fill="#E32A2A" stroke="#000000" stroke-width="12"/>
  <text x="96" y="198" font-family="Arial Black, Impact, sans-serif" font-size="64" font-weight="900" fill="#111111">${titleMarkup}</text>
  <text x="96" y="486" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#444444">${escapeXml(description.slice(0, 52))}</text>
  <text x="96" y="538" font-family="Consolas, monospace" font-size="22" font-weight="700" fill="#111111">${escapeXml(siteConfig.shortName)} / Blog Post</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
