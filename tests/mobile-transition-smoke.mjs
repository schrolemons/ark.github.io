import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await page.addInitScript(()=>localStorage.setItem('schnie.identity.v1','{"version":1,"kind":"guest"}'));
  await page.goto((process.env.TEST_URL || 'http://127.0.0.1:4321/')+'#index');
  await page.waitForTimeout(1800);
  const change=async(route,leaving,entering,direction)=>{
    await page.evaluate(route=>location.hash='#'+route,route);
    await page.waitForTimeout(180);
    const state=await page.evaluate(({leaving,entering})=>{
      const read=index=>{const e=document.querySelector(`.root-view[data-section="${index}"]`);const c=getComputedStyle(e);return {y:new DOMMatrixReadOnly(c.transform).m42,opacity:Number(c.opacity),inert:e.inert}};
      return {out:read(leaving),into:read(entering)};
    },{leaving,entering});
    assert.ok(Math.abs(state.out.y)>60 && Math.abs(state.out.y)<844,'Outgoing page travels visibly during the transition');
    assert.equal(Math.sign(state.out.y),-direction);assert.equal(Math.sign(state.into.y),direction);
    assert.equal(state.out.opacity,1,'Outgoing content does not flash to black');
    assert.equal(state.out.inert,true);assert.equal(state.into.inert,false);
    await page.waitForTimeout(600);
  };
  await change('information',0,1,1);
  assert.equal(await page.locator('.information-swiper img').first().evaluate(el=>getComputedStyle(el).objectFit),'contain');
  await change('index',1,0,-1);
  assert.equal(await page.locator('.home-mobile-footer a span').count(),0);
  assert.equal(await page.locator('.home-mobile-footer a').evaluate(el=>getComputedStyle(el).animationName),'mobile-explore-pulse');
  assert.equal(await page.locator('.home-view > .bg-mask-block').first().evaluate(el=>getComputedStyle(el).display),'none');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.evaluate(()=>location.hash='#information');await page.waitForTimeout(100);
  assert.equal(await page.locator('.root-view[data-section="0"]').evaluate(el=>getComputedStyle(el).opacity),'0');
  assert.equal(await page.locator('.root-view[data-section="1"]').evaluate(el=>getComputedStyle(el).opacity),'1');
  assert.equal(await page.locator('.home-mobile-footer a').evaluate(el=>getComputedStyle(el).animationName),'none');
  console.log('PASS directional slide, opaque outgoing page, inert state, complete images, hint and reduced motion');
}finally{await browser.close();}
