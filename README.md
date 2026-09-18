# sirashev.com

Personal site — a static [Astro](https://astro.build) build, zero client-side
JavaScript, deployed to Cloudflare Pages.

## Development

```sh
pnpm install
pnpm dev      # local dev server
pnpm build    # static build into dist/
pnpm preview  # serve the built site
```

## Layout

- `src/pages` — routes (`/`, `/projects`, `/experience`)
- `src/layouts` — the page shell
- `src/components` — one component per file
- `src/site/{types,consts,rules}` — site data and the rules over it
- `src/styles` — design tokens and base styles
- `docs/design-reference.html` — source of truth for layout, tokens and spacing
