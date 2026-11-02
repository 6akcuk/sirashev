# Ryab portfolio images

Source: `Pets/ryab/data/design_handoff_ryab`, specifically `Карта - живая.dc.html`
and `Карточка сигнала.dc.html`. The source project is read only.

These are English design previews using the handoff's sample data. They are not
screenshots of the current dev.ryab.io application. UI copy is translated via
`ryab-translations.json`; MapLibre symbol layers use English/Latin map labels.
Original thumbnail placeholders remain neutral glyphs. The original app and
handoff files are not changed.

To regenerate, serve the handoff locally:

```sh
python3 -m http.server 8766 --bind 127.0.0.1 --directory /path/to/ryab/data/design_handoff_ryab
```

Then run `node scripts/portfolio/render-ryab.cjs` with `playwright` and `sharp`
available through `NODE_PATH`. Set `CHROME_PATH` if Chrome is not at the default
macOS location. The handoff runtime loads its original CDN dependencies and map
tiles, so this authoring step needs internet. The portfolio itself serves only
static WebP images and has no dependency on that runtime or the map tile service.

Output: `public/images/ryab`. Map attribution is displayed with the portfolio images.
