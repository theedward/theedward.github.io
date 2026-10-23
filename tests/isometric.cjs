// Run against a locally served draft: QA_URL=http://127.0.0.1:PORT node tests/isometric.cjs
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
  if(!process.env.QA_URL) throw new Error('QA_URL must point to the served draft (Pixi Assets requires HTTP).');
  const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(process.env.QA_URL);
  await page.waitForFunction(()=>window.playroom?.state.assetsReady || window.playroom?.state.error);
  assert.equal(await page.evaluate(()=>playroom.state.error),null);
  assert.deepEqual(await page.evaluate(()=>playroom.state.failedAssets),[]);
  assert.equal(await page.evaluate(()=>PIXI.VERSION),'8.22.0');
  assert(await page.evaluate(()=>playroom.getObject('chair-back').mask!==null));
  assert(await page.evaluate(()=>playroom.getObject('exterior').mask!==null));
  assert.equal(await page.evaluate(()=>playroom.application.ticker.started),true);
  assert(await page.locator('#ambience').evaluate(e=>e.paused && e.currentTime===0));
  for(let i=0;i<3;i++){
    const trigger=page.locator('.project-links button').nth(i);
    await trigger.click();await page.locator('#project-dialog').waitFor({state:'visible'});
    for(let j=0;j<6;j++){await page.keyboard.press('Tab');assert(await page.evaluate(()=>!!document.activeElement.closest('#project-dialog')));}
    await page.keyboard.press('Escape');await page.locator('#project-dialog').waitFor({state:'hidden'});
    await page.waitForFunction(()=>document.body.style.overflow==='');assert(await trigger.evaluate(e=>e===document.activeElement));
  }
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:950});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert(await page.locator('#about').isVisible());
  }
  await page.locator('#about').click();assert(await page.locator('#about-dialog').evaluate(e=>e.open));
  await page.keyboard.press('Escape');await page.locator('#about-dialog').waitFor({state:'hidden'});
  assert.deepEqual(errors,[]);
  console.log('PASS: Pixi initialization, assets, masks, passive ticker, HTML dialogs/focus, no-autoplay, responsive overflow.');
  await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
