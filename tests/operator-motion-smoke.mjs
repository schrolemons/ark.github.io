import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  for (const width of [390, 1440]) {
    const page=await browser.newPage({viewport:{width,height:900}});
    await page.addInitScript(()=>localStorage.setItem('schnie.identity.v1','{"version":1,"kind":"guest"}'));
    await page.goto((process.env.TEST_URL || 'http://127.0.0.1:4321/')+'#operator/moxue');
    await page.waitForTimeout(1800);
    const old=await page.locator('.operator-figure').boundingBox();
    await page.getByRole('button',{name:'选择瑞',exact:true}).click();
    await page.waitForTimeout(65);
    const outgoing=await page.locator('.operator-figure[alt="墨薛"]').boundingBox();
    assert.ok(outgoing && Math.abs(outgoing.height-old.height)<1,'Outgoing art must retain its own scale');
    assert.ok(Math.abs(outgoing.y-old.y)<1,'Outgoing art must retain its vertical anchor');
    assert.ok(Math.abs(outgoing.x-old.x)<1,'Outgoing art fades in place without a sideways jump');
    await page.locator('.operator-figure[alt="瑞"]').waitFor();
    const samples=await page.locator('.operator-figure[alt="瑞"]').evaluate(async el=>{
      const points=[];
      for(let i=0;i<28;i++){await new Promise(requestAnimationFrame);points.push(new DOMMatrixReadOnly(getComputedStyle(el.closest('.operator-art-frame')).transform).m41);}
      return points;
    });
    assert.ok(Math.max(...samples)>10 && samples.at(-1)<samples[0]-8,'New character must slide in from the right');
    await page.waitForTimeout(700);
    await page.evaluate(()=>location.hash='#media/books');
    await page.waitForTimeout(50);
    assert.equal(await page.locator('.operator-figure').getAttribute('alt'),'瑞','Leaving the section must not briefly swap back to the first character');
    await page.waitForTimeout(600);
    assert.equal(await page.locator('.media-tilt-controls').count(),0);
    await page.evaluate(()=>location.hash='#operator/ruifox');
    await page.waitForTimeout(70);
    assert.ok(await page.locator('.operator-art-frame').evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).m41)>10,'Returning to the section replays the entrance');
    await page.waitForTimeout(700);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.getByRole('button',{name:'选择璃风',exact:true}).click();await page.waitForTimeout(200);
    assert.equal(await page.locator('.operator-art-frame').evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).m41),0);
    console.log('PASS operator entrance, outgoing scale/anchor, section return, no tilt, reduced motion',width);
    await page.close();
  }
}finally{await browser.close();}
