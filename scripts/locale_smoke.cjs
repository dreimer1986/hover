const {chromium} = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const base = (process.env.HOVER_URL || 'http://127.0.0.1:8767/hover/').replace(/\/?$/, '/');
(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_PATH,
    args:['--no-sandbox','--enable-unsafe-swiftshader']});
  const results=[], errors=[];
  try {
    for (const [locale,lang] of [['de-DE','de'],['en-US','en'],['fr-FR','en']]) {
      const p=await browser.newPage({locale,viewport:{width:1280,height:800}});
      p.on('pageerror',e=>errors.push(e.message));
      await p.goto(base+'?view=archive');
      assert.equal(await p.locator('html').getAttribute('lang'),lang);
      assert.equal((await p.locator('.hero .button.primary').innerText()).replace('↗','').trim(),lang==='de'?'Jetzt spielen':'Play now');
      assert.equal(await p.locator('.versions article').count(),3);
      assert.equal((await p.locator('.download-row a').first().innerText()).replace(/\s+/g,' '),lang==='de'?'Bundle herunterladen ↓':'Download bundle ↓');
      assert.match(await p.locator('.archive-note details').innerText(),lang==='de'?/Was wurde ergänzt/:/What was restored/);
      assert.equal(await p.locator('nav').getAttribute('aria-label'),lang==='de'?'Hauptnavigation':'Main navigation');
      assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await p.goto(base+'play/modified/');await p.waitForSelector('#modern-play');
      assert.equal(await p.locator('html').getAttribute('lang'),lang);
      assert.equal(await p.locator('#modern-play').innerText(),lang==='de'?'Spiel starten →':'Start game →');
      assert.equal(await p.locator('#modern-craft option').first().innerText(),lang==='de'?'Einfach':'Easy');
      await p.click('#modern-play');await p.waitForFunction(()=>Hover.router.currentView.playing);
      await p.locator('.msgButton').click();await p.click('#modern-wide');await p.click('#modern-touch');
      await p.waitForTimeout(150);
      assert.match(await p.locator('#modern-readout').innerText(),lang==='de'?/Sprung .* Wand .* Tarnung .* Schild/:/Jump .* Wall .* Cloak .* Shield/);
      assert.equal((await p.locator('[data-action=jump]').innerText()).split('\n')[0],lang==='de'?'Sprung':'Jump');
      if(locale==='en-US') {
        await p.click('#modern-full');await p.waitForFunction(()=>!!document.fullscreenElement);
        assert.equal(await p.locator('#modern-full').innerText(),'⛶ Exit fullscreen');
        await p.click('#modern-full');await p.waitForFunction(()=>!document.fullscreenElement);
        assert.equal(await p.locator('#modern-full').innerText(),'⛶ Fullscreen');
      }
      await p.evaluate(()=>{document.documentElement.requestFullscreen=undefined;document.documentElement.webkitRequestFullscreen=undefined;});
      await p.click('#modern-full');assert.match(await p.locator('#modern-status').innerText(),lang==='de'?/nicht verfügbar/:/not available/);
      results.push({locale,language:lang,archive:true,launcher:true,game:true,fullscreenFeedback:true});
      console.log('PASS '+locale+' -> '+lang);await p.close();
    }
    const mobile=await browser.newPage({locale:'en-GB',isMobile:true,hasTouch:true,viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'});
    mobile.on('pageerror',e=>errors.push(e.message));
    await mobile.goto(base);await mobile.waitForURL(base+'play/modified/');await mobile.waitForSelector('#modern-play');
    assert.equal(await mobile.locator('html').getAttribute('lang'),'en');
    assert.equal(await mobile.locator('#modern-wide').getAttribute('aria-pressed'),'true');
    assert.equal(await mobile.locator('#modern-touch').getAttribute('aria-pressed'),'true');
    for(const viewport of [{width:390,height:844},{width:320,height:568},{width:844,height:390}]) {
      await mobile.setViewportSize(viewport);
      for(const element of await mobile.locator('#modern-toolbar > *:visible').all()) { const r=await element.boundingBox(); assert(r.x>=0&&r.x+r.width<=viewport.width,'Toolbar fits '+viewport.width); }
      assert(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    results.push({locale:'en-GB',mobileRedirect:true,toolbarWidths:[320,390,844]});console.log('PASS English mobile redirect and toolbar');
    assert.deepEqual(errors,[]);
    fs.writeFileSync(root+'/verification/locale-browser-results.json',JSON.stringify({base,results,errors},null,2)+'\n');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
