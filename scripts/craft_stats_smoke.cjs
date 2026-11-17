const {chromium}=require('playwright-core'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const dir=process.env.HOVER_SHIPS_DIR||'/home/dreimer/.cache/hover-preview/import-fixtures';
 const packages=fs.readdirSync(dir).filter(f=>f.endsWith('.hovercraft.json')).map(f=>({file:path.join(dir,f),data:JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'))}));assert(packages.length);
 try{
  for(const locale of ['de-DE','en-US']){
   const page=await browser.newPage({locale}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>sessionStorage.setItem('hover-input-ready','1'));
   await page.goto(process.env.HOVER_URL||'http://127.0.0.1:8772/');await page.waitForSelector('#modern-play');await page.locator('#craft-workshop > summary').click();
   const idle=()=>page.waitForFunction(()=>document.querySelector('#craft-workshop').getAttribute('aria-busy')==='false');
   const shown=()=>page.locator('#craft-preview dd').evaluateAll(nodes=>Object.fromEntries(nodes.map(n=>[n.dataset.parameter,Number(n.textContent.split('/')[0])])));
   for(const entry of packages){
    await page.setInputFiles('#craft-files',entry.file);await page.click('#craft-convert');await idle();assert.deepEqual(await shown(),entry.data.points);
    await page.click('#craft-edit');await idle();assert.deepEqual(await page.locator('#craft-points input').evaluateAll(nodes=>Object.fromEntries(nodes.map(n=>[n.id.slice(6),Number(n.value)]))),entry.data.points);
    assert.deepEqual(await page.locator('#craft-preview dt').allTextContents(),await page.locator('#craft-points label').evaluateAll(nodes=>nodes.map(n=>n.firstChild.textContent.trim())));
    await page.click('#craft-save');await idle();assert.deepEqual(await shown(),entry.data.points);
    if(locale==='de-DE'){
     await page.evaluate(()=>{Hover.settings.setIntroMessageShown(true);Hover.settings.setSoundEnabled(false);Hover.audio.setEnabled(false)});await page.click('#modern-play');await page.waitForFunction(()=>Hover.router.currentView.playing);
     const physics=await page.evaluate(()=>{const craft=Hover.router.currentView.game.craft,entry=HoverCrafts.selected();return Object.keys(entry.points).map(k=>({key:k,actual:craft[k],profile:craft.profile[k]}));});
     const policy=await page.evaluate(()=>HoverCraftFormat.policyReady);for(const row of physics){const [lo,hi]=policy.parameters[row.key],expected=lo+(hi-lo)*entry.data.points[row.key]/10;assert.equal(row.actual,expected);assert.equal(row.profile,expected);}
     await page.click('#modern-menu');await page.click('[data-command=home]');await page.waitForSelector('#modern-play');
    }
    console.log('PASS',locale,entry.data.name,'editor/preview/saved points'+(locale==='de-DE'?' and actual game physics':''));
   }
   await page.evaluate(()=>HoverEnhanced.showHome());await page.reload();await page.waitForSelector('#modern-play');await page.waitForFunction(count=>HoverCrafts.list().filter(e=>e.persistent).length===count,packages.length);
   const last=packages.at(-1),hash=await page.evaluate(name=>HoverCrafts.list().find(e=>e.name===name).hash,last.data.name);await page.selectOption('#modern-craft','custom_'+hash);assert.deepEqual(await shown(),last.data.points);
   await page.locator('#craft-workshop > summary').click();await page.click('#craft-edit');await idle();
   const key=Object.keys(last.data.points).find(k=>last.data.points[k]>0);await page.locator('#point-'+key).evaluate((node,value)=>{node.value=value;node.dispatchEvent(new Event('input',{bubbles:true}));},String(last.data.points[key]-1));await page.click('#craft-preview-draft');await idle();assert.deepEqual(await shown(),{...last.data.points,[key]:last.data.points[key]-1});
   for(const key of ['Easy','Normal','Hard']){await page.selectOption('#modern-craft',key);await page.waitForFunction(k=>document.querySelector('#craft-preview').dataset.craft===k,key);const original=await page.evaluate(k=>JSON.stringify(Hover.Profiles[k]),key);const policy=await page.evaluate(()=>HoverCraftFormat.policyReady),profile=JSON.parse(original),format=new Intl.NumberFormat(locale,{maximumFractionDigits:1});const expected=Object.entries(policy.parameters).map(([k,[lo,hi]])=>format.format(Math.max(0,Math.min(10,(profile[k]-lo)/(hi-lo)*10)))+' / 10');await page.waitForFunction(()=>document.querySelectorAll('#craft-preview dd').length===5);assert.deepEqual(await page.locator('#craft-preview dd').allTextContents(),expected);assert.equal(await page.evaluate(k=>JSON.stringify(Hover.Profiles[k]),key),original);}
   assert.deepEqual(errors,[]);await page.close();
  }
  console.log('PASS persisted reload, edited preview and stock ratings on shared scale; original physics unchanged');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
