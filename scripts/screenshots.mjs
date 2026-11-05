// Regenerates docs/screenshots/*.png. Needs Playwright (`npm i -D playwright` or a global install).
// Usage: npm start  (in another terminal)  then  npm run screenshots
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:8803/';
const OUT = new URL('../docs/screenshots/', import.meta.url).pathname;
const VP = { width: 1600, height: 983 };

// seed a believable plan: move/resize a few boxes, add notes + an animation path
async function seed(page, items) {
  await page.evaluate(items => {
    for (const it of items) {
      track(it.sel);
      const lr = liveRect(it.sel), rec = DB.elements[it.sel];
      if (lr && it.d) rec.plan = { x: +(lr.x + it.d[0]).toFixed(1), y: +(lr.y + it.d[1]).toFixed(1), w: +(lr.w + it.d[2]).toFixed(1), h: +(lr.h + it.d[3]).toFixed(1) };
      if (it.notes) rec.notes = it.notes;
      if (it.anim && lr) {
        const cx = lr.x + lr.w / 2, cy = lr.y + lr.h / 2;
        rec.anims = [{ ...it.anim, path: Array.from({ length: 24 }, (_, i) => [+(cx + i * it.anim.k[0] + Math.sin(i / 3) * 2).toFixed(1), +(cy + i * it.anim.k[1] - Math.sin(i / 4) * 3).toFixed(1)]) }];
      }
    }
    save(); renderList(); redraw();
  }, items);
}

const browser = await chromium.launch();
const errors = [];
const page = await browser.newPage({ viewport: VP });
page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(() => { try { localStorage.clear(); } catch {} });

// 1. demo desk + radio view
await page.goto(BASE + 'demo.html'); await page.waitForTimeout(400);
await page.screenshot({ path: OUT + 'demo-desk.png' });
await page.click('#tabs button[data-v="radio"]'); await page.click('#power'); await page.waitForTimeout(1500);
await page.screenshot({ path: OUT + 'demo-radio.png' });

// 2. blueprint on the book view
await page.goto(BASE + 'blueprint.html?site=demo.html'); await page.waitForTimeout(1800);
await seed(page, [
  { sel: '#polaroid', d: [-3, 6, 2, 2], notes: ['tilt less (3°)', 'pin with washi tape'] },
  { sel: '#jars', d: [0, 34, 0, 0], notes: ['move under the polaroid row'] },
  { sel: '#radio', d: [-4, -6, 2, 1], anim: { name: 'wobble-in', trigger: 'hover', dur: '600ms', ease: 'ease-out', desc: 'little shake when hovered', k: [-.35, -.25] } },
  { sel: '#scissors' }, { sel: '#book' },
]);
await page.click('[data-m="layout"]');
await page.evaluate(() => select('#polaroid'));
await page.waitForTimeout(500);
await page.screenshot({ path: OUT + 'blueprint-book.png' });

// 3. blueprint on the radio view
await page.click('#vRadio'); await page.waitForTimeout(1200);
await seed(page, [
  { sel: '.wrf-turn', d: [-5, 6, 2, 0], notes: ['sits ON the slab, not floating'], anim: { name: 'spin-up', trigger: 'power-on', dur: '2s', ease: 'friction', desc: 'record ramps to speed', k: [-.6, .9] } },
  { sel: '.wrf-grid', d: [8, -3, -9, 0], notes: ['shrink 10% on mobile'] },
  { sel: '.wrf-tape', d: [4, -8, 0, 0] }, { sel: '.wrf-title' },
]);
await page.click('[data-m="anim"]');
await page.evaluate(() => select('.wrf-turn'));
await page.waitForTimeout(500);
await page.screenshot({ path: OUT + 'blueprint-radio.png' });

// 4. radio-plan
await page.goto(BASE + 'radio-plan.html'); await page.waitForTimeout(800);
await page.click('.item[data-id="turntable"]'); await page.waitForTimeout(200);
await page.screenshot({ path: OUT + 'radio-plan.png' });

// 5. landing + mobile
await page.goto(BASE + 'index.html'); await page.waitForTimeout(600);
await page.screenshot({ path: OUT + 'home.png' });
const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
phone.on('pageerror', e => errors.push(e.message));
await phone.goto(BASE + 'blueprint.html?site=demo.html'); await phone.waitForTimeout(1800);
await phone.screenshot({ path: OUT + 'mobile-blueprint.png' });
await phone.goto(BASE + 'index.html'); await phone.waitForTimeout(500);
await phone.screenshot({ path: OUT + 'mobile-home.png' });

await browser.close();
if (errors.length) { console.error('page errors:\n' + errors.join('\n')); process.exit(1); }
console.log('screenshots written to docs/screenshots/');
