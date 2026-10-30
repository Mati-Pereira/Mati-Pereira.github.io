#!/usr/bin/env node
// Traduz posts PT -> EN usando o Claude Code (`claude -p`), sem chave de API extra.
// Uso: npm run translate            (traduz todos os posts PT sem versão EN)
//      npm run translate -- <slug>  (só esse post)
//      npm run translate -- --force (refaz mesmo se já existir)
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../src/content/posts/', import.meta.url).pathname;
const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.find((a) => !a.startsWith('--'));

const list = (lang) =>
  readdirSync(join(root, lang)).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
const field = (src, key) => src.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1].trim().replace(/^['"]|['"]$/g, '');

/** Adiciona/atualiza `translationOf` no frontmatter. */
function link(src, slug) {
  if (/^translationOf:/m.test(src)) return src.replace(/^translationOf:.*$/m, `translationOf: ${slug}`);
  return src.replace(/^---\n([\s\S]*?)\n---/, (_, fm) => `---\n${fm}\ntranslationOf: ${slug}\n---`);
}

const enPosts = list('en').map((f) => ({ file: f, slug: f.slice(0, -3), src: readFileSync(join(root, 'en', f), 'utf8') }));
const existingFor = (ptSlug) =>
  enPosts.find((p) => field(p.src, 'translationOf') === ptSlug);

const todo = list('pt')
  .map((f) => f.slice(0, -3))
  .filter((slug) => (only ? slug === only : true))
  .filter((slug) => force || !existingFor(slug));

if (!todo.length) {
  console.log(only ? `Nada a fazer para "${only}" (use --force para refazer).` : 'Todos os posts já têm versão em inglês.');
  process.exit(0);
}

const prompt = (md) => `Translate this Brazilian Portuguese blog post (Markdown with YAML frontmatter) into natural, simple English. The blog is a personal study journal, so keep the friendly, first-person tone.

Rules:
- Translate title, description, tags and body. Keep tag values lowercase.
- Keep the other frontmatter keys (date, level, draft) unchanged. Drop any translationOf line.
- Do NOT translate code, identifiers, URLs or file paths; translate only code comments and string literals meant for humans.
- Keep the Markdown structure exactly (headings, lists, code fences).
- Output format: first line "SLUG: <short-kebab-case-english-slug>", then a line with only "===", then the full translated Markdown file. Nothing else, no code fences around it.

--- POST ---
${md}`;

for (const slug of todo) {
  const ptPath = join(root, 'pt', `${slug}.md`);
  const ptSrc = readFileSync(ptPath, 'utf8');
  console.log(`Traduzindo pt/${slug}.md ...`);
  const r = spawnSync('claude', ['-p', '--tools', '', '--no-session-persistence', '--disable-slash-commands'], {
    input: prompt(ptSrc), encoding: 'utf8', maxBuffer: 10 * 1024 * 1024,
  });
  if (r.status !== 0) { console.error(r.stderr || 'claude falhou'); process.exit(1); }

  const m = r.stdout.trim().match(/^SLUG:\s*([a-z0-9-]+)\s*\n===\s*\n([\s\S]+)$/);
  if (!m || !m[2].startsWith('---')) { console.error(`Resposta em formato inesperado para ${slug}:\n${r.stdout}`); process.exit(1); }
  const [, enSlug0, body] = m;
  const prev = existingFor(slug);
  const enSlug = prev ? prev.slug : enSlug0;
  const enPath = join(root, 'en', `${enSlug}.md`);
  if (!prev && existsSync(enPath)) { console.error(`en/${enSlug}.md já existe; escolha outro nome.`); process.exit(1); }

  writeFileSync(enPath, link(body.trim() + '\n', slug));
  writeFileSync(ptPath, link(ptSrc, enSlug));
  console.log(`  -> en/${enSlug}.md (revise antes de commitar)`);
}
