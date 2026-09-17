import assert from 'node:assert/strict';
import fs from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
fs.mkdirSync('.screens', { recursive: true });
const base = process.env.TEST_URL || 'http://127.0.0.1:4321/';
const go = async hash => {
  await page.goto(base + hash);
  await page.getByRole('button', { name: '打开个人通行证' }).waitFor();
  await page.waitForTimeout(3800);
};
try {
  await go('#operator/lifeng');
  await page.locator('.cn-name-display').filter({ hasText: '璃风' }).waitFor();
  assert.equal(await page.locator('.thumbnail').count(), 3);
  assert.equal(await page.locator('.thumbnail.active').innerText(), '璃风');
  assert.ok(await page.locator('img[alt="璃风"]').first().evaluate(img => img.complete && img.naturalWidth > 0));
  await page.screenshot({ path: '.screens/operator-lifeng.png' });
  await page.locator('.thumbnail').filter({ hasText: '瑞' }).click();
  await page.waitForURL('**/#operator/ruifox');
  await page.goBack();
  await page.waitForURL('**/#operator/lifeng');
  console.log('PASS operator selection, direct link, browser back');

  await go('#world');
  await page.getByRole('button', { name: '下一页', exact: true }).click();
  await page.waitForURL('**/#world?page=2');
  await page.reload();
  await page.getByRole('button', { name: '上一页', exact: true }).waitFor();
  await page.waitForTimeout(1600);
  await page.getByRole('button', { name: '上一页', exact: true }).click();
  await page.waitForTimeout(350);
  const rows = await page.locator('[data-world-overview] a').evaluateAll(elements => elements.map(el => ({
    opacity: Number(getComputedStyle(el).opacity), parentOpacity: Number(getComputedStyle(el.parentElement).opacity), label: el.textContent,
  })));
  assert.equal(rows.length, 6);
  assert.ok(rows.every(row => row.opacity === 1 && row.parentOpacity > 0.99), JSON.stringify(rows));
  console.log('PASS page 2 -> 1: all six entries visible at 350ms');
  await page.getByRole('link', { name: '文明库 - CIV DB', exact: true }).click();
  await page.waitForURL('**/#world/CIV_DB');
  await page.waitForTimeout(3600);
  const sprite = await page.evaluate(() => ({ count: window.particleCanvas?.ParticleArr.length, src: window.particleCanvas?.currentLogo?.src }));
  assert.ok(sprite.count > 0 && sprite.count <= 4000, JSON.stringify(sprite));
  assert.equal(sprite.src, '/images/03-world/civ-db.svg');
  await page.screenshot({ path: '.screens/world-civ-db.png' });
  assert.equal(await page.getByRole('button', { name: '复制当前网页链接' }).count(), 0);
  assert.equal(await page.getByText('TOOLBOX', { exact: true }).count(), 0);

  for (const [slug, asset] of [['Fictional_CIV','fictional-civ'], ['Cosmic_MVT','cosmic-mvt'], ['CIV_TRANS','civ-trans'], ['AI_Exist','ai-exist'], ['CIV_TWR','civ-twr'], ['LIFE_MCH','life-mch'], ['UNIV_MCH','univ-mch']]) {
    await page.evaluate(hash => { location.hash = hash; }, '#world/' + slug);
    await page.waitForFunction(asset => window.particleCanvas?.currentLogo?.src === `/images/03-world/${asset}.svg` && window.particleCanvas.ParticleArr.length > 0, asset);
  }
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '.screens/world-univ-mch.png' });
  console.log('PASS all eight distinct particle shapes load');

  await go('#media/visual_archive/Starry_Sky');
  await page.keyboard.press('ArrowRight');
  await page.waitForURL('**/#media/visual_archive/meadow');
  await page.reload();
  await page.waitForTimeout(2800);
  assert.equal(new URL(page.url()).hash, '#media/visual_archive/meadow');
  await page.screenshot({ path: '.screens/gallery-meadow.png' });
  await go('#media/web_modules');
  await page.getByText('网站模块', { exact: true }).first().waitFor();
  await page.keyboard.press('ArrowRight');
  assert.equal(new URL(page.url()).hash, '#media/web_modules');
  console.log('PASS media, gallery selection and reload; hidden gallery keyboard inactive');

  await go('#information/events?slide=The_Ninth_World');
  assert.ok(await page.getByText('事件', { exact: true }).first().evaluate(el => el.parentElement.className.includes('text-black')));
  assert.ok(await page.locator('.swiper-slide-active').filter({ has: page.locator('a[href="/world/"]') }).count() > 0);
  console.log('PASS information category and English slide link');


  await page.setViewportSize({width:390,height:844});
  await go('#operator/lifeng');
  await page.screenshot({ path: '.screens/operator-mobile.png' });
  await go('#world/CIV_DB');
  await page.screenshot({ path: '.screens/world-mobile.png' });
  console.log('PAGE ERRORS', JSON.stringify(errors));
  assert.equal(errors.length, 0);
} finally {
  await browser.close();
}
