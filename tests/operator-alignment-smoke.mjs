import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage();
await page.addInitScript(()=>localStorage.setItem('schnie.identity.v1','{"version":1,"kind":"member","name":"墨薛"}'));
try {
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
  await page.setViewportSize(viewport);
  const rows=[];
  for(const id of ['moxue','ruifox','lifeng','fanxin']) {
   await page.goto((process.env.TEST_URL||'http://127.0.0.1:4321/')+'#operator/'+id);
   await page.waitForFunction(()=>document.querySelector('.operator-art')?.getAttribute('data-loading')==='false');
   await page.waitForTimeout(1400);
   rows.push(await page.evaluate(()=>{
    return ['.operator-figure','.operator-echo'].map(selector=>{
     const img=document.querySelector(selector),canvas=document.createElement('canvas');
     canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
     const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
     let left=canvas.width,right=0,top=canvas.height,bottom=0;
     for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(data[(y*canvas.width+x)*4+3]>0){left=Math.min(left,x);right=Math.max(right,x+1);top=Math.min(top,y);bottom=Math.max(bottom,y+1);}
     const r=img.getBoundingClientRect();return {source:img.getAttribute("src"),raw:[left,right,top,bottom],rect:[r.x,r.y,r.width,r.height],center:r.x+(left+right)/2/canvas.width*r.width,top:r.y+top/canvas.height*r.height,bottom:r.y+bottom/canvas.height*r.height};
    });
   }));
   await page.screenshot({path:`.screens/aligned-${id}-${viewport.width}.png`});
  }
  for(const layer of [0,1])for(const edge of ['center','top','bottom']) {
   const values=rows.map(row=>row[layer][edge]);
   assert.ok(Math.max(...values)-Math.min(...values)<2,`${viewport.width} ${layer===0?'figure':'silhouette'} ${edge}: ${values}`);
  }
  console.log(`PASS ${viewport.width}: all four figures and silhouettes share visible center, top and bottom within 2px`);
 }
 await page.getByRole('button',{name:'打开个人通行证'}).click();
 await page.locator('.owner-overlay[data-open="true"]').waitFor();
 const animation=await page.locator('.passport-stripe').first().evaluate(async el=>{
  const points=[];let last=performance.now();
  for(let i=0;i<45;i++){await new Promise(requestAnimationFrame);const now=performance.now();points.push({dt:now-last,x:new DOMMatrixReadOnly(getComputedStyle(el,'::after').transform).m41});last=now;}
  return {distinct:new Set(points.map(p=>p.x)).size,frames:points.length,medianFrameMs:points.map(p=>p.dt).sort((a,b)=>a-b)[22]};
 });
 assert.ok(animation.distinct>20,JSON.stringify(animation));console.log('PASS moving light strip',animation);
} finally {await browser.close();}
