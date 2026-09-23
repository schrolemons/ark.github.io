import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => localStorage.setItem('schnie.identity.v1', '{"version":1,"kind":"guest"}'));
  await page.goto((process.env.TEST_URL || 'http://127.0.0.1:4321/') + '#world');
  await page.waitForFunction(() => window.particleCanvas?.ParticleArr.length > 0);
  async function checkRepulsion() {
    await page.waitForTimeout(2600);
    const target = await page.evaluate(() => {
      const p = window.particleCanvas;
      const particle = p.ParticleArr[Math.floor(p.ParticleArr.length / 2)];
      const rect = p.canvasEle.getBoundingClientRect();
      return { x: rect.left + (p.particleAreaX + 200 + (particle.totalX - 200) * p.scale) * rect.width / p.width,
        y: rect.top + (p.particleAreaY + 200 + (particle.totalY - 200) * p.scale) * rect.height / p.height };
    });
    await page.mouse.move(target.x + 8, target.y + 8);
    await page.waitForTimeout(350);
    const moved = await page.evaluate(() => {
      const p = window.particleCanvas;
      return { tracked: Number.isFinite(p.mouseX) && Number.isFinite(p.mouseY),
        displaced: p.ParticleArr.filter(v => Math.hypot(v.x - v.totalX, v.y - v.totalY) > 2).length };
    });
    assert.ok(moved.tracked, 'Real mouse movement must reach particles through decorative layers');
    assert.ok(moved.displaced > 5, 'Hover must visibly repel particles');
    await page.mouse.move(1, 1);
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => window.particleCanvas.mouseX), undefined, 'Leaving the world clears the pointer');
  }
  await checkRepulsion();
  await page.locator('.world-overview-item').first().click();
  await page.waitForFunction(() => document.querySelector('.world-particle-stage.is-detail'));
  await checkRepulsion();
  await page.goto((process.env.TEST_URL || 'http://127.0.0.1:4321/') + '#media');
  await page.waitForFunction(() => !window.particleCanvas);
  console.log('PASS world overview/detail repulsion, pointer reset, and disposal');
} finally { await browser.close(); }
