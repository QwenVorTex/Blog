import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroColor: z.enum(['yellow', 'red', 'blue', 'black']).default('yellow'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    keywords: z.array(z.string()).default([]),
    ogImage: z.string().optional(),
    canonical: z.url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
