/* Integration tests against the generated site; no dependencies in the game itself. */
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = (process.env.HOVER_URL || 'http://127.0.0.1:8767/hover/').replace(/\/?$/, '/');
const root = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH,
    args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required']});
  const results = [], errors = [], missing = [];
  async function page(options = {}) {
    const p = await browser.newPage({locale:'de-DE', ...options});
    p.on('pageerror', e => errors.push(e.message));
    p.on('response', r => { if (r.status() >= 400) missing.push(r.status() + ' ' + r.url()); });
    await p.route('**/*', r => r.request().url().startsWith(base) ? r.continue() : (missing.push('external ' + r.request().url()), r.abort()));
    return p;
  }
  async function check(name, fn) { await fn(); results.push(name); console.log('PASS ' + name); }
  async function ready(p) { await p.waitForFunction(() => window.Hover && Hover.router); }
  async function play(p, arena = '44', craft = 'Easy') {
    await p.selectOption('#modern-arena', arena); await p.selectOption('#modern-craft', craft);
    await p.click('#modern-play'); await p.waitForFunction(() => Hover.router.currentView.playing);
    const intro = p.locator('.msg-intro .msgButton');
    if (await intro.isVisible()) await intro.click();
    await p.waitForTimeout(400);
  }
  async function touchState(p) { return p.evaluate(() => { const c = Hover.router.currentView.game.craftControllers.find(c => typeof c.dpadStart === 'function'); return {forward:c.forward,reverse:c.reverse,left:c.left,right:c.right,fire:c.fire}; }); }
  async function canvas(p, width, height) { const s = await p.evaluate(() => { const g = Hover.router.currentView.game; const r = g.renderer.domElement.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height,aspect:g.camera.aspect,short:g.shortCamera.aspect}; }); assert.equal(s.x,0);assert.equal(s.y,0);assert.equal(s.w,width);assert.equal(s.h,height);assert.equal(s.aspect,width/height);assert.equal(s.short,width/height); }
  try {
    const desktop = await page({viewport:{width:1280,height:800}});
    await check('Desktop keeps archive and original default', async () => {
      await desktop.goto(base); assert.equal(desktop.url(), base);
      assert.equal(await desktop.locator('.hero .button.primary').getAttribute('href'), 'play/latest/');
      assert.equal(await desktop.locator('.versions article').count(), 3);
    });
    const mobile = await page({viewport:{width:844,height:390},isMobile:true,hasTouch:true,
      userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'});
    await check('Mobile redirects; archive and original releases remain reachable', async () => {
      await mobile.goto(base); await mobile.waitForURL(base + 'play/modified/'); await ready(mobile);
      await mobile.click('#modern-toolbar a'); await mobile.waitForURL(base+'?view=archive');
      await mobile.goto(base+'#downloads'); assert.equal(mobile.url(),base+'#downloads');
      for (const v of ['early','latest']) { await mobile.goto(base+'play/'+v+'/'); assert.equal(mobile.url(),base+'play/'+v+'/'); assert.equal(await mobile.locator('#modern-ui').count(),0); }
      await mobile.goto(base+'play/modified/'); await ready(mobile);
    });
    await check('Mobile landscape fills viewport and intro remains dismissible', async () => { await play(mobile); await canvas(mobile,844,390); assert(await mobile.locator('#modern-controls').isVisible()); });
    const cdp = await mobile.context().newCDPSession(mobile);
    const pad = await mobile.locator('#modern-pad').boundingBox();
    const boost = await mobile.locator('[data-action=fire]').boundingBox();
    const finger = (id,x,y) => ({id,x,y,radiusX:2,radiusY:2,force:1});
    const up = finger(1,pad.x+pad.width/2,pad.y+10);
    const forwardRight = finger(1,pad.x+pad.width-10,pad.y+10);
    const booster = finger(2,boost.x+boost.width/2,boost.y+boost.height/2);
    const pos = () => mobile.evaluate(() => { const p=Hover.router.currentView.game.craft.position; return {x:p.x,y:p.y,z:p.z}; });
    await check('Real multi-touch drives, steers, holds the fire input and releases', async () => {
      const before=await pos();
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[up]});
      await mobile.waitForTimeout(500); assert((await touchState(mobile)).forward);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[up,booster]});
      await mobile.waitForTimeout(200); assert((await touchState(mobile)).fire);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[forwardRight,booster]});
      await mobile.waitForTimeout(500); const state=await touchState(mobile); assert(state.forward&&state.right&&state.fire);
      assert.notDeepEqual(await pos(),before);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[booster]});
      await mobile.waitForTimeout(80); assert(!(await touchState(mobile)).fire); assert((await touchState(mobile)).forward);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
      await mobile.waitForTimeout(80); assert(Object.values(await touchState(mobile)).every(v=>!v));
    });
    await check('All three extras reach the actual craft once per press', async () => {
      await mobile.evaluate(() => { window.actionCalls={}; const craft=Hover.router.currentView.game.craft;
        for(const name of ['jump','placeWall','cloak']) { const original=craft[name]; craft[name]=function(...args){ actionCalls[name]=(actionCalls[name]||0)+1; return original.apply(this,args); }; }
      });
      for(const action of ['jump','placeWall','cloak']) { const r=await mobile.locator('[data-action='+action+']').boundingBox();
        await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[finger(1,r.x+r.width/2,r.y+r.height/2)]});
        await mobile.waitForTimeout(150); await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      }
      assert.deepEqual(await mobile.evaluate(()=>actionCalls),{jump:1,placeWall:1,cloak:1});
    });
    await check('Blur releases held movement; changing orientation resizes camera', async () => {
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[up]}); await mobile.waitForTimeout(50);
      await mobile.evaluate(()=>window.dispatchEvent(new Event('blur'))); assert(Object.values(await touchState(mobile)).every(v=>!v));
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      await mobile.screenshot({path:root+'/verification/modified-landscape.png'});
      await mobile.setViewportSize({width:390,height:844});await mobile.waitForTimeout(300);await canvas(mobile,390,844);
      const bar=await mobile.locator('#modern-toolbar').boundingBox();assert(bar.x>=0&&bar.x+bar.width<=390);
      await mobile.screenshot({path:root+'/verification/modified-portrait.png'});
    });
    await check('Fullscreen unavailable: large view and understandable feedback', async () => {
      await mobile.evaluate(()=>{document.documentElement.requestFullscreen=undefined;document.documentElement.webkitRequestFullscreen=undefined;});
      await mobile.click('#modern-full'); assert.match(await mobile.locator('#modern-status').innerText(),/nicht verfügbar/);await canvas(mobile,390,844);
    });
    await check('Modified desktop options start off; fullscreen exits to classic layout', async () => {
      await desktop.goto(base+'play/modified/'); await ready(desktop); await play(desktop);
      assert.equal(await desktop.locator('#modern-wide').getAttribute('aria-pressed'),'false');
      assert(!(await desktop.locator('#modern-controls').isVisible()));
      await desktop.click('#modern-full'); await desktop.waitForFunction(()=>!!document.fullscreenElement);await desktop.waitForTimeout(200);await canvas(desktop,1280,800);
      await desktop.click('#modern-full');await desktop.waitForFunction(()=>!document.fullscreenElement);assert.equal(await desktop.locator('#modern-wide').getAttribute('aria-pressed'),'false');
      await desktop.click('#modern-wide');await desktop.click('#modern-touch');await desktop.waitForTimeout(200);await canvas(desktop,1280,800);
      const before=await desktop.evaluate(()=>JSON.stringify(Hover.router.currentView.game.craft.position));await desktop.keyboard.down('ArrowUp');await desktop.waitForTimeout(700);await desktop.keyboard.up('ArrowUp');assert.notEqual(await desktop.evaluate(()=>JSON.stringify(Hover.router.currentView.game.craft.position)),before);
      await desktop.screenshot({path:root+'/verification/modified-desktop.png'});
    });
    await check('Menu, all arenas and craft profiles survive repeated starts', async () => {
      for(const [arena,craft,id] of [['46','Normal',1],['47','Hard',2],['44','Easy',0]]) {
        await desktop.click('#modern-menu');await desktop.waitForSelector('#modern-play');await play(desktop,arena,craft);
        assert.equal(await desktop.evaluate(()=>Hover.router.currentView.game.craftProfile.id),id);
        assert.equal(await desktop.evaluate(()=>Hover.router.currentView.game.mazeId),Number(arena));
        await canvas(desktop,1280,800);
      }
    });
    await check('Retro and return to modern retain working controls and layout', async () => {
      await desktop.click('#modern-menu');await desktop.click('#modern-retro');await desktop.waitForFunction(()=>Hover.retro&&Hover.router.currentView.playing);
      await desktop.waitForTimeout(300);await canvas(desktop,1280,800);
      await desktop.screenshot({path:root+'/verification/modified-retro.png'});
      await desktop.click('#modern-menu');await play(desktop);assert.equal(await desktop.evaluate(()=>Hover.retro),false);await canvas(desktop,1280,800);
    });
    await check('No missing resources or JavaScript errors', async () => { assert.deepEqual(errors,[]);assert.deepEqual(missing,[]); });
  } finally {
    fs.writeFileSync(root+'/verification/modified-browser-results.json',JSON.stringify({base,checks:results,errors,missing},null,2)+'\n');
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1});
