export const languages = ['pt', 'en'] as const;
export type Lang = (typeof languages)[number];

export const ui = {
  pt: {
    siteTitle: 'Aprendendo em Público',
    siteDescription: 'Meu progresso nos estudos, explicado de forma simples.',
    locale: 'pt-BR',
    nav: { home: 'Início', tags: 'Tags', timeline: 'Linha do tempo', about: 'Sobre', search: 'Buscar' },
    aboutPath: 'sobre',
    latest: 'Posts recentes',
    noPosts: 'Nenhum post ainda.',
    postsTagged: 'Posts com a tag',
    allTags: 'Todas as tags',
    timelineTitle: 'Linha do tempo',
    timelineIntro: 'A evolução dos meus estudos, post a post.',
    level: { beginner: 'iniciante', intermediate: 'intermediário', advanced: 'avançado' },
    readIn: 'Ler em English',
    searchTitle: 'Buscar nos posts',
    toggleTheme: 'Alternar tema',
    rss: 'RSS',
  },
  en: {
    siteTitle: 'Learning in Public',
    siteDescription: 'My study progress, explained simply.',
    locale: 'en-US',
    nav: { home: 'Home', tags: 'Tags', timeline: 'Timeline', about: 'About', search: 'Search' },
    aboutPath: 'about',
    latest: 'Latest posts',
    noPosts: 'No posts yet.',
    postsTagged: 'Posts tagged',
    allTags: 'All tags',
    timelineTitle: 'Timeline',
    timelineIntro: 'How my studies evolved, post by post.',
    level: { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' },
    readIn: 'Ler em Português',
    searchTitle: 'Search posts',
    toggleTheme: 'Toggle theme',
    rss: 'RSS',
  },
} as const;

export const t = (lang: Lang) => ui[lang];
/** Prefixo de rota: '' para pt, '/en' para en. */
export const prefix = (lang: Lang) => (lang === 'pt' ? '' : '/en');
export const other = (lang: Lang): Lang => (lang === 'pt' ? 'en' : 'pt');

/** Monta um link interno respeitando `base` e o idioma. */
export const link = (lang: Lang, path = '') => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const p = `${base}${prefix(lang)}/${path}`.replace(/\/+$/, '');
  return `${p}/`.replace(/^\/\//, '/');
};
