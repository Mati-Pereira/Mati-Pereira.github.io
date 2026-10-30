import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type Post = CollectionEntry<'posts'>;

/** "pt/bem-vindo" -> "bem-vindo" */
export const slugOf = (post: Post) => post.id.split('/').slice(1).join('/');

export async function getPosts(lang: Lang): Promise<Post[]> {
  const all = await getCollection(
    'posts',
    (p) => p.id.startsWith(`${lang}/`) && (import.meta.env.DEV || !p.data.draft),
  );
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const tagsOf = (posts: Post[]) =>
  [...new Set(posts.flatMap((p) => p.data.tags))].sort((a, b) => a.localeCompare(b));

export const tagSlug = (tag: string) =>
  tag.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const formatDate = (d: Date, locale: string, opts: Intl.DateTimeFormatOptions = { dateStyle: 'long' }) =>
  new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...opts }).format(d);
