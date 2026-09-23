import assert from 'node:assert/strict';
import fs from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const base = process.env.TEST_URL || 'http://127.0.0.1:4321/';
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
fs.mkdirSync('.screens', {recursive: true});
const dialog = page.getByRole('dialog', { name: '该如何称呼你？' });
const input = page.getByLabel('称呼 YOUR NAME');
const enter = page.getByRole('button', {name: '以此称呼进入'});
const switchIdentity = async () => {
  await page.getByRole('button', {name: '打开个人通行证'}).click();
  await page.getByRole('button', {name: /^(切换身份|登录)/}).click();
  await dialog.waitFor();
};
try {
  await page.goto(base + '#operator/fanxin');
  await dialog.waitFor();
  assert.equal(await page.locator('#site-shell').evaluate(el => el.inert), true);
  assert.equal(await page.locator('.identity-overlay').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(16, 17, 18)');
  await page.keyboard.press('Escape'); assert.equal(await dialog.isVisible(), true);
  assert.equal(await enter.isVisible(), false);
  await input.press('Enter'); assert.match(await page.locator('#identity-error').innerText(), /请输入/);
  await input.focus(); await page.keyboard.press('Shift+Tab');
  assert.equal(await page.getByRole('button', {name: /游客登录/}).evaluate(el => el === document.activeElement), true);
  await page.screenshot({path: '.screens/identity-final-desktop.png'});
  await page.getByRole('button', {name: /游客登录/}).click();
  await dialog.waitFor({state: 'hidden'});
  await page.reload(); await page.getByRole('button', {name: '打开个人通行证'}).waitFor();
  await page.waitForTimeout(1600); assert.equal(await dialog.count(), 0);
  assert.equal(await page.locator('.identity-brand > img').count(), 1);
  console.log('PASS first visit: opaque, inert, focus trap, blank validation, guest persisted');

  await switchIdentity();
  const longName='一位走过很长很长旅途的来访者'.repeat(4);
  await input.fill(longName); await enter.click();
  assert.equal(await page.locator('.identity-brand > img').count(), 0);
  assert.equal(await page.locator('.identity-brand strong').innerText(), longName);
  const truncation = await page.locator('.identity-brand strong').evaluate(el => ({scroll:el.scrollWidth,width:el.clientWidth,overflow:getComputedStyle(el).textOverflow,color:getComputedStyle(el).color}));
  assert.ok(truncation.scroll > truncation.width); assert.equal(truncation.overflow,'ellipsis'); assert.equal(truncation.color,'rgb(255, 255, 255)');
  await page.reload(); await page.waitForTimeout(1600);
  assert.equal(await dialog.count(),0); assert.equal(await page.locator('.identity-brand strong').innerText(),longName);
  for (const alias of ['MOXUE','墨薛']) {
    await switchIdentity(); await input.fill(alias); await enter.click();
    assert.equal(await page.locator('.identity-brand > img').count(),1);
    assert.equal(await page.locator('.identity-brand strong').innerText(),'墨薛');
    assert.equal(await page.locator('.identity-brand small').innerText(),'MO XUE');
    assert.equal(await page.locator('.identity-brand strong').evaluate(el=>getComputedStyle(el).color),'rgb(216, 189, 112)');
  }
  console.log('PASS member persistence, ordinary replacement, ellipsis, both special aliases');
  await page.locator('.operator-figure').waitFor();
  assert.equal(await page.locator('.thumbnail').count(),4);
  for(const name of ['墨薛','瑞','璃风','樊昕']) {
    await page.getByRole('button',{name:'选择'+name,exact:true}).click();
    await page.waitForTimeout(700);
    assert.equal(await page.locator('.cn-name-display').innerText(),name);
    const infoBounds = await page.locator('.operator-info').boundingBox();
    const figureBounds = await page.locator('.operator-figure').boundingBox();
    assert.ok(infoBounds.y > 100 && infoBounds.x > 0 && figureBounds.y > 50, JSON.stringify({name,infoBounds,figureBounds}));
    assert.ok(await page.locator('.operator-figure').evaluate(el=>el.complete && el.naturalWidth>0));
    await page.screenshot({path:'.screens/operator-'+name+'-final.png'});
  }
  console.log('PASS all four operators and artwork');
  await page.goto(base+'#media/visual_archive/Starry_Sky'); await page.waitForTimeout(1500);
  await page.getByRole('button',{name:'下一幅画作'}).click(); await page.waitForURL('**/meadow');
  await page.keyboard.press('ArrowRight'); await page.waitForURL('**/sea');
  await page.getByRole('button',{name:'查看 Starry Sky'}).click(); await page.waitForURL('**/Starry_Sky');
  await page.screenshot({path:'.screens/gallery-final-desktop.png'});
  await switchIdentity(); const hash=new URL(page.url()).hash;
  await input.fill('行者'); await page.keyboard.press('ArrowRight'); assert.equal(new URL(page.url()).hash,hash);
  await page.getByRole('button',{name:/游客登录/}).click();
  console.log('PASS gallery controls and no keyboard leakage through identity gate');

  for(const viewport of [{width:320,height:740},{width:390,height:844},{width:768,height:1024},{width:844,height:390}]) {
    await page.setViewportSize(viewport);
    for(const [name,route] of [['operator','#operator/fanxin'],['gallery','#media/visual_archive/Starry_Sky'],['information','#information'],['world','#world'],['media','#media'],['more','#more'],['world-list','world/'],['operator-list','operator/'],['docs','docs/']]) {
      await page.goto(base+route); await page.waitForTimeout(1200);
      assert.equal(await dialog.count(),0);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1), `${name} at ${viewport.width}: horizontal overflow`);
      await page.screenshot({path:`.screens/${name}-${viewport.width}-final.png`});
    }
    await page.getByRole('button',{name:'打开目录'}).click(); await page.waitForTimeout(700);
    await page.screenshot({path:`.screens/menu-${viewport.width}-final.png`});
    await page.getByRole('button',{name:'关闭目录'}).click();
    await switchIdentity(); await page.screenshot({path:`.screens/identity-${viewport.width}-final.png`});
    await page.getByRole('button',{name:/游客登录/}).click();
    console.log(`PASS ${viewport.width}x${viewport.height}: 9 routes, navigation, identity`);
  }
  await page.evaluate(()=>localStorage.setItem('schnie.identity.v1','corrupted'));
  await page.reload(); await dialog.waitFor(); await page.getByRole('button',{name:/游客登录/}).click();
  const blocked=await browser.newContext();
  await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}});});
  const blockedPage=await blocked.newPage(); await blockedPage.goto(base);
  await blockedPage.getByRole('button',{name:/游客登录/}).click();
  await blockedPage.getByRole('dialog',{name:'该如何称呼你？'}).waitFor({state:'hidden'});
  await blocked.close();
  assert.deepEqual(errors,[]);
  console.log('PASS corrupt / unavailable storage; no browser runtime errors');
} finally { await browser.close(); }
