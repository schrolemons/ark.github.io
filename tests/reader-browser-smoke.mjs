import assert from 'node:assert/strict';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({channel:'msedge', headless:true});
const context = await browser.newContext({viewport:{width:1440,height:1000}});
await context.addInitScript(()=>localStorage.setItem('schnie.identity.v1','{"version":1,"kind":"guest"}'));
const page = await context.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.TEST_URL||'http://127.0.0.1:4321/';
try {
  await page.goto(base+'world/?category='+encodeURIComponent('世界观'));
  const article=page.locator('.world-item:visible a').first();
  await article.click(); await page.locator('.reader-contents h2').waitFor();
  const title=await page.locator('.reader-contents h2').innerText(); assert.ok(title.length>0);
  const before=await page.locator('.reader-contents h2').boundingBox();
  await page.locator('#info-layout-main-slot').evaluate(el=>el.scrollTop=600);
  const after=await page.locator('.reader-contents h2').boundingBox();assert.equal(before.y,after.y);
  assert.ok(await page.getByRole('link',{name:'分类总览 ALL RECORDS',exact:true}).isVisible());
  await page.screenshot({path:'.screens/reader-desktop-final.png'});
  console.log('PASS desktop: persistent article title, independent contents, overview');
  for(const viewport of [{width:320,height:740},{width:390,height:844},{width:844,height:390}]) {
    await page.setViewportSize(viewport);
    await page.getByRole('button',{name:'展开文章目录',exact:true}).click();
    await page.locator('.reader-contents[data-open="true"]').waitFor();
    await page.waitForTimeout(350);
    assert.equal(await page.locator('.reader-contents h2').innerText(),title);
    await page.screenshot({path:`.screens/reader-drawer-${viewport.width}.png`});
    const last=page.locator('.reader-toc-links a').last();
    await last.click();
    await page.waitForFunction(()=>document.querySelector('.reader-contents')?.getAttribute('data-open')==='false');
    await page.waitForTimeout(500);
    assert.ok(new URL(page.url()).hash);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:`.screens/reader-mobile-${viewport.width}.png`});
    await page.getByRole('button',{name:'展开文章目录',exact:true}).click();
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>document.querySelector('.reader-contents')?.getAttribute('data-open')==='false');
    console.log(`PASS ${viewport.width}: drawer opens, jumps, closes, keyboard escape, no overflow`);
  }
  await page.reload();
  await page.waitForFunction(()=>document.querySelector('.go-back-tool')?.getAttribute('href')?.includes('category='));
  await page.getByRole('link',{name:'返回上一级 GO BACK',exact:true}).click();
  await page.waitForURL(/world\/\?category=/);
  console.log('PASS reader return retains category after heading navigation and reload');
  assert.deepEqual(errors,[]);
} finally {await browser.close();}
