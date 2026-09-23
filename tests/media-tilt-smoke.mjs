import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  for (const permission of ['granted', 'denied', 'unsupported']) {
    const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    await page.addInitScript(permission=>{
      localStorage.setItem('schnie.identity.v1','{"version":1,"kind":"guest"}');
      window.permissionRequests=0;
      if(permission==='unsupported')Object.defineProperty(window,'DeviceOrientationEvent',{value:undefined});
      else Object.defineProperty(window.DeviceOrientationEvent,'requestPermission',{value:async()=>{window.permissionRequests++;return permission;}});
    },permission);
    await page.goto((process.env.TEST_URL || 'http://127.0.0.1:4321/')+'#media/books');
    await page.locator('.media-project-title').waitFor();
    await page.waitForTimeout(500);
    const button=page.getByRole('button',{name:'开启随动背景'});
    const bg=page.locator('.media-background');
    const emit=async(beta,gamma)=>page.evaluate(({beta,gamma})=>window.dispatchEvent(new DeviceOrientationEvent('deviceorientation',{beta,gamma})),{beta,gamma});
    const offsets=()=>bg.evaluate(el=>({x:parseFloat(el.style.getPropertyValue('--media-tilt-x'))||0,y:parseFloat(el.style.getPropertyValue('--media-tilt-y'))||0}));
    assert.equal(await page.evaluate(()=>window.permissionRequests),0);
    if(permission==='unsupported'){assert.equal(await button.count(),0);await page.close();continue;}
    assert.equal(await button.count(),1,'Mobile About offers an explicit tilt control');
    await button.click();
    assert.equal(await page.evaluate(()=>window.permissionRequests),1);
    if(permission==='denied'){
      await page.getByText('未获得方向访问权限，背景保持静止。').waitFor();
      assert.deepEqual(await offsets(),{x:0,y:0});await page.close();continue;
    }
    await emit(45,0);await emit(57,12);await page.waitForTimeout(700);
    const moved=await offsets();assert.ok(moved.x>1&&moved.y>1,'Both tilt axes move the background');
    const textBefore=await page.locator('.media-project-title').boundingBox();
    await emit(-80,-80);await page.waitForTimeout(700);
    const limited=await offsets();assert.ok(Math.abs(limited.x)<=28&&Math.abs(limited.y)<=5);
    assert.deepEqual(await page.locator('.media-project-title').boundingBox(),textBefore,'Text stays still');
    await page.getByRole('button',{name:'关闭随动背景'}).click();
    assert.deepEqual(await offsets(),{x:0,y:0});
    await emit(90,90);await page.waitForTimeout(150);assert.deepEqual(await offsets(),{x:0,y:0});
    await page.getByRole('button',{name:'开启随动背景'}).click();
    await emit(45,0);await emit(60,15);await page.waitForTimeout(200);
    await page.evaluate(()=>location.hash='#operator/fanxin');await page.waitForTimeout(500);
    assert.deepEqual(await offsets(),{x:0,y:0},'Leaving About resets and detaches motion');
    await page.setViewportSize({width:1440,height:900});
    await page.evaluate(()=>location.hash='#media/books');await page.waitForTimeout(500);
    assert.equal(await button.count(),0,'Desktop keeps its existing static background');
    console.log('PASS tilt permission, movement, limits, stable text, off/reset and desktop');
    await page.close();
  }
  console.log('PASS permission denial and unsupported fallback');
}finally{await browser.close();}
