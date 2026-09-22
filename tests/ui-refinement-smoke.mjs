import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({channel: 'msedge', headless: true});
const base = process.env.TEST_URL || 'http://127.0.0.1:4321/';
const context = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
const page = await context.newPage();
const errors = [], failures = [];
page.on('pageerror', e => errors.push(e.message));
fs.mkdirSync('.screens', {recursive: true});
const check = async (name, action) => {
  try { await action(); console.log('PASS', name); }
  catch(e) { failures.push(name + ': ' + e.message); console.error('FAIL', name, e.message); }
};
const visit = async route => { await page.goto(base + route); await page.waitForTimeout(1800); };
const swipe = async (selector, from = 620, to = 330) => {
  const session = await context.newCDPSession(page);
  const box = await page.locator(selector).boundingBox();
  const x = Math.min(190, box.x + box.width / 2);
  await session.send('Input.dispatchTouchEvent', {type:'touchStart', touchPoints:[{x, y:from}]});
  for (let i=1;i<=8;i++) {
    await session.send('Input.dispatchTouchEvent', {type:'touchMove', touchPoints:[{x, y:from+(to-from)*i/8}]});
    await page.waitForTimeout(25);
  }
  await session.send('Input.dispatchTouchEvent', {type:'touchEnd', touchPoints:[]});
  await session.detach();
  await page.waitForTimeout(1000);
};
try {
  await visit('#index');
  await check('entry fills screen without a boxed panel', async () => {
    const style=await page.locator('.identity-dialog').evaluate(el=>({border:getComputedStyle(el).borderTopWidth,shadow:getComputedStyle(el).boxShadow}));
    assert.equal(style.border,'0px'); assert.equal(style.shadow,'none');
  });
  await page.getByLabel('称呼 YOUR NAME').fill('墨薛');
  await page.getByRole('button',{name:'以此称呼进入'}).click();
  await check('special bilingual name stays on one line', async () => {
    const a=await page.locator('.identity-brand strong').boundingBox(), b=await page.locator('.identity-brand small').boundingBox();
    assert.ok(Math.abs(a.y+a.height/2-b.y-b.height/2)<8);
  });
  await check('vertical phone swipe changes root section', async () => {
    await swipe('.home-view'); assert.match(page.url(), /#information/);
  });
  await visit('#information');
  await check('phone subtitle visible without hover', async () => {
    const sub=page.locator('.information-summary').getByText(/Help Documentation|The Ninth World|Character Appears/).first();
    assert.ok(await sub.isVisible());
  });
  await check('inner content scroll does not change root section', async () => {
    await page.locator('.information-view').evaluate(el=>{el.scrollTop=0;});
    await swipe('.information-view',650,430); assert.match(page.url(),/#information/);
  });
  await visit('#operator/moxue');
  await check('roster is next to artwork before the biography', async () => {
    const roster=await page.locator('.operator-roster').boundingBox(), desc=await page.locator('.description-section').boundingBox();
    assert.ok(roster.y < desc.y); assert.ok(roster.y+roster.height<844);
  });
  await page.getByRole('button',{name:'打开个人通行证'}).click();
  await page.locator('.owner-overlay[data-open="true"] .passport-label').first().waitFor();
  await check('special passport has archive marker and video controls', async () => {
    assert.ok(await page.getByText('SCHNIE ARCHIVE',{exact:true}).isVisible());
    assert.ok(await page.getByText('009',{exact:true}).isVisible());
    await page.getByRole('button',{name:/播放.*SCHNIE/}).click({timeout:2500});
    assert.match(await page.locator('.passport-video iframe').getAttribute('src'),/BV1QWYi6MEh3/);
    assert.ok(await page.getByText('外部信息源',{exact:false}).isVisible());
  });
  await page.getByRole('button',{name:'关闭个人通行证'}).click();
  await check('closing passport unmounts video',async()=>assert.equal(await page.locator('.passport-video iframe').count(),0));
  await check('article returns to selected character', async () => {
    await page.getByRole('link',{name:/查看人物档案/}).click();
    await page.waitForURL(/\/operator\/moxue\/?$/);
    await page.waitForFunction(() => document.querySelector('.go-back-tool')?.getAttribute('href')?.includes('#operator/moxue'));
    await page.evaluate(() => { location.hash = 'reading-position'; });
    await page.waitForFunction(() => Boolean(history.state?.archiveReturn));
    await page.reload();
    await page.waitForFunction(() => document.querySelector('.go-back-tool')?.getAttribute('href')?.includes('#operator/moxue'));
    await page.getByRole('link',{name:/返回上一级/}).click({timeout:2500});
    await page.waitForURL('**/#operator/moxue',{timeout:4000});
    await page.waitForFunction(() => document.querySelector('.operator-view')?.scrollTop > 0);
  });
  await visit('#media/visual_archive');
  await check('media copy remains within the illustrated area',async()=>{
    const sizes=await page.locator('.media-overview').evaluate(el=>{
      const bg=el.querySelector('.media-background') || el.firstElementChild;
      return {bg:bg.getBoundingClientRect().height,content:el.scrollHeight};
    });
    assert.ok(sizes.bg >= sizes.content-2,JSON.stringify(sizes));
  });
  await visit('#media/visual_archive/Starry_Sky');
  await check('gallery back has its own space beside previous/next',async()=>{
    assert.ok(await page.getByRole('button',{name:'上一幅画作'}).isVisible());
    const a=await page.locator('.gallery-thumbnails').boundingBox(), b=await page.locator('.gallery-controls').boundingBox();
    assert.ok(b.y>=a.y+a.height);
  });
  await page.screenshot({path:'.screens/refinement-mobile-gallery.png'});
  assert.deepEqual(errors,[]);
  if(failures.length) throw new Error(failures.join('\n'));
} finally { await browser.close(); }
