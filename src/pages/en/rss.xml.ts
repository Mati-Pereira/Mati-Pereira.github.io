import type { APIContext } from 'astro';
import { feed } from '/src/views/rss';

export const GET = (context: APIContext) => feed(context, 'en');
