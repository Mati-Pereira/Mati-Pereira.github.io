#!/usr/bin/env node
// Corrige ortografia/gramática dos posts usando o Claude Code (`claude -p`), sem chave de API extra.
// Comando separado da tradução: rode `spellcheck` ANTES de `translate`.
// Uso: npm run spellcheck                 (todos os posts PT)
//      npm run spellcheck -- <slug>       (só esse post)
//      npm run spellcheck -- --lang en    (posts em inglês)
//      npm run spellcheck -- --dry        (só mostra as mudanças, não grava)
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const root = new URL('../src/content/posts/', import.meta.url).pathname;
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const langIdx = args.indexOf('--lang');
const lang = langIdx >= 0 ? args[langIdx + 1] : 'pt';
const only = args.find((a, i) => !a.startsWith('--') && i !== langIdx + 1);

if (!['pt', 'en'].includes(lang)) { console.error('--lang deve ser "pt" ou "en".'); process.exit(1); }

const languageName = lang === 'pt' ? 'Brazilian Portuguese' : 'English';

const slugs = readdirSync(join(root, lang))
  .filter((f) => f.endsWith('.md') && !f.startsWith('_'))
  .map((f) => f.slice(0, -3))
  .filter((slug) => (only ? slug === only : true));

if (!slugs.length) { console.log(only ? `Post "${only}" não encontrado em ${lang}/.` : 'Nenhum post encontrado.'); process.exit(0); }

const prompt = (md) => `Proofread this ${languageName} blog post (Markdown with YAML frontmatter). Fix ONLY spelling, accents, typos, punctuation and clear grammar mistakes (agreement, wrong word forms).

Rules:
- Do NOT rewrite, rephrase, reorder or "improve" the style. Keep the author's voice, wording and first-person tone; change as little as possible.
- Do NOT touch code blocks, inline code, identifiers, URLs or file paths. Fix typos only in code comments and human-facing strings.
- Keep the Markdown structure and the frontmatter keys/values exactly as they are, except for typos in title, description and tags (keep tag values lowercase).
- Output the full corrected file and nothing else: no explanations, no code fences around it. If there is nothing to fix, output the file unchanged.

--- POST ---
${md}`;

const tmp = mkdtempSync(join(tmpdir(), 'spellcheck-'));
let changed = 0;

for (const slug of slugs) {
  const path = join(root, lang, `${slug}.md`);
  const src = readFileSync(path, 'utf8');
  console.log(`Revisando ${lang}/${slug}.md ...`);
  const r = spawnSync('claude', ['-p', '--tools', '', '--no-session-persistence', '--disable-slash-commands'], {
    input: prompt(src), encoding: 'utf8', maxBuffer: 10 * 1024 * 1024,
  });
  if (r.status !== 0) { console.error(r.stderr || 'claude falhou'); process.exit(1); }

  const out = r.stdout.trim() + '\n';
  if (!out.startsWith('---') || out.length < src.length * 0.7 || out.length > src.length * 1.3) {
    console.error(`Resposta em formato inesperado para ${slug}; arquivo mantido.\n${r.stdout}`);
    process.exit(1);
  }
  if (out === src.trim() + '\n' || out === src) { console.log('  sem erros'); continue; }

  changed++;
  const before = join(tmp, `${slug}.antes.md`);
  const after = join(tmp, `${slug}.depois.md`);
  writeFileSync(before, src);
  writeFileSync(after, out);
  const d = spawnSync('diff', ['-u', '--label', `${lang}/${slug}.md (antes)`, '--label', `${lang}/${slug}.md (depois)`, before, after], { encoding: 'utf8' });
  console.log(d.stdout);

  if (!dry) { writeFileSync(path, out); console.log('  -> corrigido'); }
}

console.log(dry ? `\n${changed} post(s) com sugestões (nada gravado, --dry).` : `\n${changed} post(s) corrigido(s). Revise as mudanças acima.`);
