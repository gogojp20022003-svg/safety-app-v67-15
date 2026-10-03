// 図解HTMLの各 <section class="fig"> を PNG に書き出す
// 実行: NODE_PATH=$(npm root -g) node src/render.mjs
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(here, 'diagrams.html');
const OUT = path.join(here, '..', 'images');
const FIGS = {
  f00: '00_eyecatch.png',
  f01: '01_steps.png',
  f02a: '02a_coffee_retake.png',
  f02c: '02c_coffee_label.png',
  f02e: '02e_coffee_check.png',
  f03: '03_detergent.png',
  f04: '04_cosmetics.png',
  f05: '05_supplement.png',
  f06: '06_summary.png',
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
await page.goto('file://' + SRC, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
for (const [id, file] of Object.entries(FIGS)) {
  await page.locator('#' + id).screenshot({ path: path.join(OUT, file) });
  console.log('wrote', file);
}
await browser.close();
