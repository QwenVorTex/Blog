# Repository Guidelines

## Project Structure & Module Organization

This is an Astro-based personal blog. Source code lives in `src/`: pages in `src/pages`, layouts in `src/layouts`, reusable UI in `src/components`, shared helpers in `src/lib`, site settings in `src/config`, and global CSS in `src/styles`. Blog posts are Markdown/MDX files under `src/content/posts` and must follow the schema in `src/content.config.ts`. Static assets live in `public/`, including favicons, images, and Bangumi cover art. `scripts/fetch-bangumi.mjs` updates the static media data in `src/data` and `public/bangumi`.

## Build, Test, and Development Commands

- `npm run dev` starts the local Astro development server.
- `npm run build` builds the static site into `dist/` and validates Astro content.
- `npm run preview` serves the production build locally.
- `npm run fetch-bangumi` refreshes Bangumi anime/game collections and cover images.

There is no dedicated test script at present; use `npm run build` as the required validation step before submitting changes.

## Coding Style & Naming Conventions

Use TypeScript, Astro components, and plain CSS modules/styles consistent with the existing codebase. Keep imports using the `@/` alias where already used. Prefer concise component names in PascalCase, such as `PostCard.astro` and `MediaPage.astro`. CSS classes generally use BEM-like names, for example `home-archive-wall__ticket` and `site-header__dropdown-menu`. Keep indentation at two spaces in Astro, TypeScript, and CSS.

## Content Guidelines

Post frontmatter must include `title`, `description`, and `pubDate`. Optional fields include `updatedDate`, `heroColor`, `tags`, `featured`, `keywords`, `ogImage`, `canonical`, and `draft`. Use `heroColor` values from `yellow`, `red`, `blue`, or `black`.

## Commit & Pull Request Guidelines

Recent history uses Conventional Commit-style prefixes such as `feat:`, `fix:`, and `chore:`. Keep commit subjects imperative and scoped, for example `feat: refine homepage archive wall`. Pull requests should include a short summary, screenshots for visual changes, build results, and notes about content or data updates.

## Agent-Specific Instructions

Do not overwrite existing content files or generated media data unless the task explicitly requires it. Preserve the neo-brutalist visual language and verify responsive behavior when changing UI.
