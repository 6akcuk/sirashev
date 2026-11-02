// Serve StarTrack's docs/design_handoff_startrack_v2 on localhost:8767.
// NODE_PATH must contain playwright and sharp. Source designs are read-only.
const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const dict = require('./startrack-translations.json');
const output = path.resolve(__dirname, '../../public/images/startrack');
(async () => {
 fs.mkdirSync(output, { recursive: true });
 const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
 try {
 for (const [file, label, name] of [['01 Ребёнок.dc.html', 'Ребёнок: главная', 'child'], ['03 Родитель.dc.html', 'Запросы', 'parent']]) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:8767/' + encodeURIComponent(file));
  const screen = page.locator(`[data-screen-label="${label}"]`).first();
  await screen.waitFor({ timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  const remaining = await screen.evaluate((root, dict) => {
   const keys = Object.keys(dict).sort((a,b) => b.length-a.length);
   const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
   const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
   for (const node of nodes) {
    if (!/[А-Яа-яЁё]/.test(node.textContent)) continue;
    let text = node.textContent;
    for (const key of keys) {
     const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
     text = text.replace(new RegExp(escaped, 'gi'), () => dict[key]);
    }
    node.textContent = text;
   }
   return root.innerText.split('\n').filter(x=>/[А-Яа-яЁё]/.test(x));
  }, dict);
  if (remaining.length) throw new Error(remaining.join(' | '));
  await sharp(await screen.screenshot({ animations: 'disabled' })).extract({left:0,top:54,width:780,height:1688}).webp({ quality: 90 }).toFile(path.join(output, name+'.webp'));
  await page.close();
 }
 const page = await browser.newPage({ viewport: { width: 1440, height: 1160 } });
 const src = name => 'data:image/webp;base64,' + fs.readFileSync(path.join(output,name+'.webp')).toString('base64');
 await page.setContent(`<html><style>*{box-sizing:border-box}body{margin:0;background:#f2e8dc;color:#493a2c;font-family:Arial,sans-serif}.board{padding:48px 76px}.head{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:36px}.head strong{font-size:40px}.head span{font-size:18px}.screens{display:flex;justify-content:center;gap:76px}.screens img{width:390px;height:844px;border-radius:36px;box-shadow:0 16px 35px #493a2c18}.label{text-align:center;font-size:16px;margin:20px 0 0}.foot{margin-top:32px;font-size:13px;color:#7c6b58}</style><div class="board"><div class="head"><strong>StarTrack</strong><span>Small tasks. Shared progress. Meaningful rewards.</span></div><div class="screens"><div><img src="${src('child')}"><p class="label">Child · tasks and stars</p></div><div><img src="${src('parent')}"><p class="label">Parent · approvals and rewards</p></div></div><div class="foot">English design previews · illustrative family and sample data</div></div></html>`);
 await page.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));
 await sharp(await page.screenshot()).webp({quality:90}).toFile(path.join(output,'overview.webp'));
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
