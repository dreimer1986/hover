const {chromium}=require('playwright-core'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
 const base=process.env.HOVER_URL||'http://127.0.0.1:8772/',errors=[],missing=[],results=[];
 try{
  for(const [locale,mobile]of [['de-DE',false],['en-US',true]]){
   const p=await b.newPage({locale,viewport:mobile?{width:844,height:390}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile});p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)missing.push(r.status()+' '+r.url())});
   await p.addInitScript(()=>sessionStorage.setItem('hover-input-ready','1'));await p.goto(base);await p.waitForSelector('#homeTitle');assert(p.url().includes('/play/modified/'));
   assert(await p.locator('#enhanced-level-control').isHidden());
   await p.click('#enhanced-unlock');await p.waitForSelector('#modern-arena');assert.match(await p.locator('#enhanced-unlock-message').innerText(),locale==='de-DE'?/freigeschaltet/:/unlocked/);
   await p.waitForFunction(()=>Hover.audio.getSound('WINLEVEL').playing);
   await p.selectOption('#modern-flags','6');await p.selectOption('#modern-arena','46');
   await p.evaluate(()=>{Hover.settings.setIntroMessageShown(true);Hover.settings.setSoundEnabled(false);Hover.audio.setEnabled(false);});
   await p.click('#modern-retro');await p.waitForFunction(()=>Hover.router.currentView.playing);
   assert.equal(await p.evaluate(()=>Hover.router.currentView.options.mazeId),46);assert.equal(await p.evaluate(()=>Hover.router.currentView.game.world.flags.length),12);
   if(!mobile)await p.click('#modern-wide');
   await p.waitForFunction(()=>document.querySelector('#flag_counts').width===150);
   await p.evaluate(()=>Hover.router.currentView.game.world.onWin.call());
   await p.waitForFunction(()=>Hover.router.currentView.options.mazeId===47&&Hover.router.currentView.playing,null,{timeout:20000});assert(await p.evaluate(()=>Hover.retro));assert.equal(await p.evaluate(()=>Hover.router.currentView.game.world.flags.length),12);
   await p.click('#modern-menu');await p.waitForSelector('#modern-play');
   await p.selectOption('#modern-flags','3');await p.selectOption('#modern-arena','44');await p.click('#modern-retro');await p.waitForFunction(()=>Hover.router.currentView.playing);await p.waitForFunction(()=>document.querySelector('#flag_counts').width===75);
   await p.click('#modern-menu');await p.waitForSelector('#modern-play');await p.click('#modern-play');await p.waitForFunction(()=>Hover.router.currentView.playing);
   await p.evaluate(()=>Hover.router.currentView.game.world.onWin.call());await p.waitForFunction(()=>Hover.router.currentView.options.mazeId===46&&Hover.router.currentView.playing,null,{timeout:20000});
   await p.click('#modern-menu');await p.waitForSelector('#modern-play');await p.waitForTimeout(4300);assert.equal(await p.evaluate(()=>Hover.router.currentView.id),'homeView');
   await p.addInitScript(()=>sessionStorage.setItem('hover-input-ready','1'));await p.goto(base+'?view=archive');await p.waitForSelector('main');assert(!p.url().includes('/play/'));
   results.push({locale,mobile,originalHome:true,secretUnlock:true,flags:[3,6],retroProgression:true,modernProgression:true,archive:true});console.log('PASS extended '+locale);await p.close();
  }
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);fs.writeFileSync('verification/extended-browser-results.json',JSON.stringify({results,errors,missing},null,2)+'\n');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
