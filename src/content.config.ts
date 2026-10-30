import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '{pt,en}/[!_]*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
    // slug do mesmo post no outro idioma (ex.: "bem-vindo" <-> "welcome")
    translationOf: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
