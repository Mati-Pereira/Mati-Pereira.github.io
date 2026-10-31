# Aprendendo em Público / Learning in Public

Blog bilíngue (PT-BR + EN) feito com [Astro](https://astro.build).

## Rodar

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/ + índice de busca (Pagefind)
```

## Novo post

Crie `src/content/posts/pt/meu-post.md` (e/ou `en/`). Copie o frontmatter de `src/content/posts/_template.md`.
Para ligar as traduções, use `translationOf: <slug-do-outro-idioma>` nos dois posts. `draft: true` esconde o post no build.

## Correção ortográfica

Comando separado da tradução. Corrige só ortografia, acentos, pontuação e erros gramaticais claros, sem reescrever o estilo, e mostra um diff do que mudou:

```sh
npm run spellcheck                 # todos os posts PT
npm run spellcheck -- meu-post     # só esse post
npm run spellcheck -- --dry        # só mostra as mudanças, não grava
npm run spellcheck -- --lang en    # posts em inglês
```

Fluxo sugerido: `npm run spellcheck` e depois `npm run translate`. Também usa o Claude Code (`claude -p`).

## Tradução automática PT → EN

Escreva o post só em português (`src/content/posts/pt/`) e rode:

```sh
npm run translate              # traduz todos os posts PT sem versão EN
npm run translate -- meu-post  # só esse post
npm run translate -- --force   # refaz traduções existentes
```

Usa o Claude Code (`claude -p`), então não precisa de chave de API. Cria o `.md` em `en/` e liga os dois com `translationOf`. Revise o resultado antes de commitar.

## Publicar (GitHub Pages)

1. Edite `site` (e `base`, se o repo não for `usuario.github.io`) em `astro.config.mjs`.
2. Crie o repo no GitHub, faça push na branch `main`.
3. Em *Settings → Pages*, escolha **Source: GitHub Actions**.
