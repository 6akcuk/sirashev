# sirashev.com

Denis Sirashev's personal site: a static Astro build with no client JavaScript.
English copy follows the October 5, 2026 résumé. Commercial delivery and personal
projects are explicitly distinguished; Ryab links to its working development preview; Herald has no public release.
Ryab images are English design previews with sample data, rendered from the original handoff.

## Development

```sh
pnpm install
pnpm dev
pnpm test     # build and verify the generated site
pnpm preview
```

## Content and design

- `src/content/cases/*.json`: project descriptions. Set `published: false` to
  remove a case from listings and prevent its route from being generated.
- `src/content/jobs/*.json`: experience, sorted by the `order` date.
- `src/content.config.ts`: validates content at build time.
- `src/styles`: shared design tokens and responsive styles, with system dark mode.
- `public/Denis-Sirashev-Resume.pdf`: downloadable résumé.
- `public/fonts`: locally served, subset Instrument Sans and JetBrains Mono, with licenses.
- `scripts/check-built-site.mjs`: metadata, routes, navigation and static-output checks.

`docs/design-reference.html` and GitHub issue #1 describe the original direction.
The newer résumé supersedes their earlier factual claims and AI-first positioning.
The site retains the sidebar, three main sections and quiet visual style.

## Deployment

Build command: `pnpm build`. Output directory: `dist`. Intended host: Cloudflare Pages.
The public address is https://sirashev.com (Cloudflare Pages: https://sirashev.pages.dev). Deploy with `pnpm deploy` after
authenticating using `wrangler login`. This builds, checks and uploads `dist` to
the production branch of the `sirashev` Pages project.

Set `SITE_URL=https://your-domain.example` when building for a custom domain;
this controls canonical and social URLs. Analytics are not configured.
