import assert from 'node:assert/strict';
import fs from 'node:fs';
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({channel: 'msedge', headless: true});
const base = process.env.TEST_URL || 'http://127.0.0.1:4321/';
const context = await browser.newContext({viewport: {width:390,height:844}, isMobile:true, hasTouch:true});
await context.addInitScript(() => localStorage.setItem('schnie.identity.v1', '{"version":1,"kind":"guest"}'));
const page = await context.newPage();
const errors=[];
page.on('pageerror', e => errors.push(e.message));
fs.mkdirSync('.screens', {recursive:true});
const visit = async route => {
  await page.goto(base+'#'+route);
  await page.waitForTimeout(1900);
  await page.addStyleTag({content:'astro-dev-toolbar {display:none !important}'});
  await page.locator('.root-view[data-active="true"] *').evaluateAll(elements=>elements.forEach(el=>{if(el.scrollTop) el.scrollTop=0;}));
};
const session=await context.newCDPSession(page);
const swipe=async(x,from,to)=>{
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:from}]});
  for(let i=1;i<=10;i++) {
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:from+(to-from)*i/10}]});
    await page.waitForTimeout(20);
  }
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await page.waitForTimeout(450);
};
try {
  for(const id of ['moxue','ruifox','lifeng','fanxin']) {
    await visit('operator/'+id);
    const geometry=await page.evaluate(()=>{
      const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom};};
      return {art:rect('.operator-art'),copy:rect('.description-section'),roster:rect('.operator-roster')};
    });
    assert.ok(geometry.copy.top < geometry.art.bottom-40,'Biography and standing art must share the screen');
    assert.ok(geometry.roster.bottom <= 844,'Character selector must fit the first screen');
    const edges=await page.locator('.operator-biography').evaluate(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,containerRight:el.closest('.operator-view').getBoundingClientRect().right,background:getComputedStyle(el).backgroundColor}));
    assert.ok(Math.abs(edges.left)<1 && Math.abs(edges.right-edges.containerRight)<1,'Biography mask spans the art without side gaps');
    assert.match(edges.background,/rgba\(/,'Biography panel stays translucent');
    await page.screenshot({path:`.screens/refresh-operator-${id}.png`});
  }
  console.log('PASS four characters: artwork, biography and selector together');
  await visit('world');
  assert.equal(await page.locator('.world-view canvas').count(),0,'Mobile world should not run a hidden canvas');
  assert.equal(await page.locator('.world-overview-item-symbol:visible').count(),6,'Reuse the existing SVGs as diagram plates');
  await page.getByRole('button',{name:'下一页',exact:true}).click();
  await page.getByRole('link',{name:/宇宙机/}).click();
  await page.waitForTimeout(600);
  assert.match(page.url(),/#world\/UNIV_MCH/);
  await page.getByRole('button',{name:/BACK/}).click();
  await page.waitForTimeout(500);
  assert.match(page.url(),/page=2/);
  console.log('PASS world pagination, detail and return');
  await visit('index');
  await swipe(160,450,240);
  assert.match(page.url(),/#information/);
  await page.setViewportSize({width:390,height:568});
  await page.waitForTimeout(200);
  assert.ok(await page.locator('.information-view').evaluate(el=>el.scrollHeight>el.clientHeight),'Use a viewport with scrollable information');
  await page.locator('.information-view').evaluate(el=>el.scrollTop=0);
  await swipe(160,450,250);
  assert.match(page.url(),/#information/,'Reading scroll must not turn the page');
  console.log('PASS section swipe and native article scroll');
  assert.equal(await page.locator('.information-click-hint:visible').count(),0,'Artwork must not receive a duplicate click hint');
  await page.setViewportSize({width:390,height:844});
  await visit('media/books');
  assert.equal(await page.locator('.media-categories h2').isVisible(),false);
  for(const button of await page.locator('.media-categories button').all()) {
    await button.click();
    await page.waitForFunction(label=>[...document.querySelectorAll('.media-categories button')].some(el=>el.getAttribute('aria-label')===label && el.getAttribute('aria-pressed')==='true'),await button.getAttribute('aria-label'));
    const metrics=await button.evaluate(el=>{
      const box=el.getBoundingClientRect(),dot=getComputedStyle(el,'::before');
      return {width:box.width,dotLeft:parseFloat(dot.left),height:box.height,pressed:el.getAttribute('aria-pressed')};
    });
    assert.equal(metrics.pressed,'true');
    assert.ok(metrics.height>=40 && Math.abs(metrics.width/2-metrics.dotLeft)<1,'Dot is centered in a generous touch target');
  }
  const dots=await page.locator('.media-categories button').evaluateAll(elements=>elements.map(el=>el.getBoundingClientRect().y));
  assert.ok(Math.max(...dots)-Math.min(...dots)<1,'All four dots share one horizontal row');
  console.log('PASS About: four selectable dots, accessible labels, no redundant heading');
  await visit('more');
  const cards=await page.locator('.archive-card').evaluateAll(elements=>elements.map(el=>({height:el.getBoundingClientRect().height,bg:getComputedStyle(el).backgroundColor})));
  assert.ok(cards.every(card=>card.height<=150),'Resource cards stay compact');
  assert.ok(cards.every(card=>Math.abs(card.height-cards[0].height)<1 && card.bg===cards[0].bg),'All three resources use one visual style');
  const more=page.locator('[data-more-page] main');
  await more.evaluate(el=>el.scrollTop=el.scrollHeight);
  assert.equal(await page.locator('[data-more-page]').getAttribute('data-footer-visible'),'false');
  await swipe(160,620,380);
  assert.equal(await page.locator('[data-more-page]').getAttribute('data-footer-visible'),'true');
  assert.equal(await page.locator('.more-page-track').evaluate(el=>getComputedStyle(el).transitionDelay),'0.16s');
  await page.waitForTimeout(350);
  assert.ok(await page.getByRole('navigation',{name:'Footer links'}).isVisible());
  const footer=await page.getByRole('navigation',{name:'Footer links'}).boundingBox();
  assert.ok(footer.y>=76 && footer.y+footer.height<=844,'Footer must be visible after its separate entrance');
  await page.screenshot({path:'.screens/refresh-footer-390.png'});
  const copyright=await page.locator('.more-page-footer footer > div:last-child').boundingBox();
  assert.ok(copyright.y+copyright.height<=844,'Compact footer keeps its copyright visible');
  await swipe(160,560,740);
  assert.equal(await page.locator('[data-more-page]').getAttribute('data-footer-visible'),'false');
  assert.match(page.url(),/#more/);
  console.log('PASS archive footer: deliberate hold, separate entrance, return to More');
  for(const [width,height] of [[320,568],[390,844],[430,932],[768,1024],[844,390]]) {
    await page.setViewportSize({width,height});
    for(const route of ['index','information','operator','world','media','more']) {
      await visit(route);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route} overflow at ${width}`);
      await page.screenshot({path:`.screens/refresh-${route}-${width}.png`});
    }
  }
  console.log('PASS 30 viewport/section checks');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>location.hash='operator');
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.root-view[data-active="true"]').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  assert.deepEqual(errors,[]);
  console.log('PASS reduced motion and no runtime errors');
} finally {await browser.close();}
