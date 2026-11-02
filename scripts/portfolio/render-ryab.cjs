// Run with NODE_PATH pointing to an installation containing playwright and sharp.
// Serve the original handoff directory on localhost:8766 before running.
const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const translations = require('./ryab-translations.json');
const output = path.resolve(__dirname, '../../public/images/ryab');
(async () => {
 const browser = await chromium.launch({headless:true, executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try {
  for (const [file, screens] of [
   ['Карта - живая.dc.html', [['день','map-day'],['ночь','map-night']]],
   ['Карточка сигнала.dc.html', [['день','event-card']]],
  ]) {
   if (process.env.SKIP_MAP && file.startsWith('Карта')) continue;
   const page = await browser.newPage({viewport:{width:1800,height:1200},deviceScaleFactor:2});
   await page.goto('http://127.0.0.1:8766/'+encodeURIComponent(file),{waitUntil:'domcontentloaded'});
   await page.locator('[data-screen-label]').first().waitFor({state:'visible',timeout:60000});
   await page.waitForTimeout(8000);
   for (const [label,name] of screens) {
    const screen = page.locator(`[data-screen-label="${label}"]`);
    await screen.scrollIntoViewIfNeeded();
    await screen.evaluate(root => {
     // Set English map labels on the actual MapLibre instances, not overlaid text.
     for (const el of root.querySelectorAll('*')) if (el._map) {
      const map = el._map;
      for (const layer of map.getStyle().layers) if (layer.type==='symbol' && layer.layout?.['text-field'])
       map.setLayoutProperty(layer.id,'text-field',['coalesce',['get','name:en'],['get','name:latin'],'']);
     }
    });
    await page.waitForTimeout(2000);
    const remaining = await screen.evaluate((root,dict) => {
     const entries=Object.entries(dict).sort((a,b)=>b[0].length-a[0].length);
     const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
     const nodes=[];while(walker.nextNode()) nodes.push(walker.currentNode);
     for(const node of nodes) {
      let value=node.textContent;
      if(!/[А-Яа-яЁё]/.test(value))continue;
      // Translate in one pass so translated text is never translated again.
      const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const exact=dict[value.trim()];
      if(exact) value=value.replace(value.trim(),exact);
      else { const parts=entries.filter(([k])=>k.length>1); const re=new RegExp(parts.map(([k])=>escape(k)).join('|'),'g'); value=value.replace(re,match=>dict[match]); }
      node.textContent=value;
     }
     // Thumbnail slots in the handoff are placeholders; use a camera glyph.
     for(const slot of root.querySelectorAll('image-slot')) { const placeholder=document.createElement('span');placeholder.style.cssText=slot.style.cssText+';display:flex;align-items:center;justify-content:center;background:#cbc8c0;color:#67655f;font:20px system-ui';placeholder.textContent='▧';slot.replaceWith(placeholder); }
     return root.innerText.split('\n').filter(s=>/[А-Яа-яЁё]/.test(s));
    },translations);
    if(remaining.length) throw new Error(name+': untranslated: '+remaining.join(' | '));
    const png = await screen.screenshot({animations:'disabled'});
    await sharp(png).webp({quality:90}).toFile(path.join(output,name+'.webp'));
    console.log('Rendered',name);
   }
   await page.close();
  }
  const page=await browser.newPage({viewport:{width:1440,height:1160},deviceScaleFactor:1});
  const data=name=>'data:image/webp;base64,'+fs.readFileSync(path.join(output,name+'.webp')).toString('base64');
  await page.setContent(`<html><head><style>*{box-sizing:border-box}body{margin:0;background:#e8e5de;font-family:Arial,sans-serif;color:#232825}.board{padding:54px 80px 34px}.top{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:38px}.brand{font-size:42px;letter-spacing:-2px;font-weight:600}.sub{font-size:17px;color:#626860}.screens{display:flex;justify-content:center;gap:70px}.screen img{width:402px;height:874px;border-radius:48px;box-shadow:0 20px 45px #18211920;display:block}.label{font-size:13px;color:#626860;text-align:center;margin-top:22px}.foot{display:flex;justify-content:space-between;color:#70766e;font-size:12px;margin-top:28px}</style></head><body><div class="board"><div class="top"><span class="brand">Ryab</span><span class="sub">A living map of what's happening nearby</span></div><div class="screens"><div class="screen"><img src="${data('map-day')}"><div class="label">Live signals · day</div></div><div class="screen"><img src="${data('map-night')}"><div class="label">The same city · after dark</div></div></div><div class="foot"><span>English design preview · sample data</span><span>Map data © OpenStreetMap contributors · OpenFreeMap</span></div></div></body></html>`);
  await page.evaluate(()=>document.fonts.ready);
  await sharp(await page.screenshot()).webp({quality:90}).toFile(path.join(output,'overview.webp'));
  await page.close();
 } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
