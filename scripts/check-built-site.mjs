import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';
async function walk(dir) {
  const files = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(files.map(f => f.isDirectory() ? walk(join(dir,f.name)) : [join(dir,f.name)]));
  return nested.flat();
}
const files = (await walk('dist')).filter(f => f.endsWith('.html'));
const titles = new Set();
for (const file of files) {
  const html = await readFile(file,'utf8');
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  assert(title && !titles.has(title), `${file}: unique title required`); titles.add(title);
  assert(/name="description" content="[^"]+"/.test(html), `${file}: description missing`);
  assert(/property="og:image" content="[^"]+"/.test(html), `${file}: social image missing`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: one main heading required`);
  assert(!/<script\b/.test(html), `${file}: static pages must not ship client scripts`);
  const nav = html.match(/<nav\b[^>]*>(.*?)<\/nav>/s)?.[1] || '';
  assert.equal((nav.match(/<a\b/g) || []).length, 5, `${file}: five navigation links required`);
  for (const img of html.matchAll(/<img\b[^>]*>/g)) {
    assert(/alt="[^"]+"/.test(img[0]), `${file}: image needs descriptive alt text`);
    const src = img[0].match(/src="([^"]+)"/)?.[1];
    if (src?.startsWith('/')) assert(await stat(join('dist', src)).catch(()=>null), `${file}: image missing ${src}`);
  }
  for (const [,href] of html.matchAll(/href="([^"]*)"/g)) {
    assert(href && href !== '#', `${file}: placeholder link`);
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const path = href.split(/[?#]/)[0];
    const target = join('dist',path);
    const exists = await stat(target).catch(()=>null);
    assert(exists, `${file}: broken internal link ${href}`);
    if (exists.isDirectory()) assert(await stat(join(target,'index.html')).catch(()=>null), `${file}: page missing ${href}`);
  }
}
assert.equal(files.length, 26);
const ryab = await readFile('dist/projects/ryab/index.html','utf8');
assert(ryab.includes('Working development preview'));
assert(ryab.includes('https://dev.ryab.io'));
assert(ryab.includes('/images/ryab/overview.webp'));
assert(ryab.includes('English design preview'));
assert(ryab.includes('development benchmarks, not production traffic metrics'));
console.log(`Verified ${files.length} static pages: metadata, navigation, local links, release status and zero client JS.`);
