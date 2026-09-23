import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const width of [390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4321/');
    const input = page.locator('#identity-name');
    const enter = page.getByRole('button', { name: '以此称呼进入' });
    await input.waitFor();
    assert.equal(await enter.isVisible(), false, 'Empty name has no submit arrow');
    await input.fill('   ');
    assert.equal(await enter.isVisible(), false, 'Whitespace has no submit arrow');
    await input.focus(); await page.keyboard.press('Shift+Tab');
    assert.equal(await page.getByRole('button', {name: /游客登录/}).evaluate(el => el === document.activeElement), true);
    await input.fill('旅人');
    await enter.waitFor();
    await input.dispatchEvent('compositionstart');
    assert.equal(await enter.isVisible(), false, 'IME composition does not expose submit yet');
    await input.dispatchEvent('compositionend');
    await enter.waitFor();
    const field = await input.boundingBox(), arrow = await enter.boundingBox();
    assert.ok(arrow.x >= field.x + field.width - 55 && arrow.y >= field.y && arrow.y + arrow.height <= field.y + field.height);
    assert.equal(await enter.evaluate(el => getComputedStyle(el).backgroundColor), 'rgba(0, 0, 0, 0)');
    assert.equal(await enter.evaluate(el => getComputedStyle(el).color), 'rgb(255, 215, 0)');
    await input.fill(''); assert.equal(await enter.isVisible(), false);
    await input.fill('旅人');
    if (width === 390) await enter.click(); else await input.press('Enter');
    await page.getByRole('dialog').waitFor({state: 'hidden'});
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('schnie.identity.v1')).name), '旅人');
    console.log('PASS identity inline arrow, IME, focus trap, submit', width);
    await page.close();
  }
} finally { await browser.close(); }
