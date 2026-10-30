import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { t, link, type Lang } from '../i18n/ui';
import { getPosts, slugOf } from '../lib/posts';

export async function feed(context: APIContext, lang: Lang) {
  const ui = t(lang);
  const posts = await getPosts(lang);
  return rss({
    title: ui.siteTitle,
    description: ui.siteDescription,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: link(lang, `posts/${slugOf(post)}`),
    })),
    customData: `<language>${ui.locale}</language>`,
  });
}
