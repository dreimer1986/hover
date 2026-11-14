const {chromium} = require('playwright-core');
const assert = require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');
const base=(process.env.HOVER_URL||'http://127.0.0.1:8767/hover/').replace(/\/?$/,'/');
const screenshots=process.env.SCREENSHOT_DIR||'/home/dreimer/.cache/hover-preview/display-tests';
(async()=>{
  fs.mkdirSync(screenshots,{recursive:true});
  const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
  const results=[],errors=[],missing=[];
  try {
    for(const [name,viewport,dpr,mobile] of [['pixel-like',{width:1300,height:600},2.4,true],['iphone-like',{width:844,height:390},3,true],['desktop',{width:1920,height:1080},1,false],['fractional-high',{width:900,height:500},3.5,true]]) {
      const p=await b.newPage({viewport,deviceScaleFactor:dpr,isMobile:mobile,hasTouch:mobile,locale:'de-DE',...(mobile?{userAgent:'Mozilla/5.0 (Linux; Android 17) AppleWebKit/537.36 Chrome/142.0.0.0 Mobile Safari/537.36'}:{})});
      p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)missing.push(r.status()+' '+r.url())});
      await p.goto(base+'play/modified/');await p.waitForSelector('#modern-play');
      await p.evaluate(()=>{Hover.settings.setIntroMessageShown(true);Hover.settings.setSoundEnabled(false);Hover.audio.setEnabled(false);});
      if(!mobile)await p.click('#modern-wide');
      for(const retro of [false,true]) {
        await p.click(retro?'#modern-retro':'#modern-play');await p.waitForFunction(()=>Hover.router.currentView.playing);await p.waitForTimeout(250);
        const checkFrame=()=>p.evaluate(()=>{const g=Hover.router.currentView.game,gl=g.renderer.getContext(),r=g.renderer.domElement.getBoundingClientRect();return{buffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],viewport:Array.from(gl.getParameter(gl.VIEWPORT)),dimensions:[g.dimensions.WIDTH,g.dimensions.HEIGHT],rect:[r.x,r.y,r.width,r.height],screen:[innerWidth,innerHeight],dpr:devicePixelRatio};});
        let state=await checkFrame();assert.deepEqual(state.buffer,state.dimensions);assert.deepEqual(state.viewport,[0,0,...state.buffer]);assert.deepEqual(state.rect,[0,0,...state.screen]);
        if(!retro) {
          await p.evaluate(()=>Hover.settings.setHyperColorEnabled(true));await p.waitForTimeout(200);state=await checkFrame();assert.deepEqual(state.viewport,[0,0,...state.buffer]);
          await p.evaluate(()=>Hover.settings.setHyperColorEnabled(false));
          if(mobile) {
            await p.setViewportSize({width:390,height:844});await p.waitForTimeout(200);
            const portrait=await checkFrame();assert.deepEqual(portrait.buffer,portrait.dimensions);assert.deepEqual(portrait.viewport,[0,0,...portrait.buffer]);assert.deepEqual(portrait.rect,[0,0,...portrait.screen]);
            await p.setViewportSize(viewport);await p.waitForTimeout(200);
          }
          await p.click('#modern-full');await p.waitForFunction(()=>!!document.fullscreenElement);await p.waitForTimeout(200);
          const fullscreen=await checkFrame();assert.deepEqual(fullscreen.buffer,fullscreen.dimensions);assert.deepEqual(fullscreen.viewport,[0,0,...fullscreen.buffer]);assert.deepEqual(fullscreen.rect,[0,0,...fullscreen.screen]);
          await p.click('#modern-full');await p.waitForFunction(()=>!document.fullscreenElement);await p.waitForTimeout(100);
        }
        await p.screenshot({path:path.join(screenshots,name+'-'+(retro?'retro':'modern')+'.png'),scale:'css'});
        if(retro) {
          const flags=await p.locator('#flag_counts').boundingBox();assert(flags.x<30&&flags.y<120);
          assert(await p.locator('#modern-retro-hud').isVisible());
          assert.equal(await p.locator('.retro-meter-label').allTextContents().then(x=>x.join(',')),'Sprunghöhe,Wanddauer,Tarnung');
          // Trigger the actual win event from inside the physics update, as flag
          // capture does. This exercises cleanup followed by the last render.
          await p.evaluate(()=>{const g=Hover.router.currentView.game,update=g.updatePhysics;g.updatePhysics=function(dt){g.updatePhysics=update;g.onWin.call();};});
          await p.waitForSelector('.msg-game-won .msgButton');await p.waitForTimeout(200);
          assert.equal(await p.locator('.modern-frozen-scene').count(),1);
          const dialog=await p.locator('.msgLarge').boundingBox();assert(Math.abs(dialog.x+dialog.width/2-viewport.width/2)<2);assert(Math.abs(dialog.y+dialog.height/2-viewport.height/2)<2);
          const button=await p.locator('.msgButton').boundingBox();assert(button.x>=0&&button.y>=0&&button.x+button.width<=viewport.width&&button.y+button.height<=viewport.height);
          await p.screenshot({path:path.join(screenshots,name+'-retro-win.png'),scale:'css'});
          await p.locator('.msgButton').click();await p.waitForSelector('#modern-play');
          // Losing must also leave a usable centered retry/return button.
          await p.click('#modern-retro');await p.waitForFunction(()=>Hover.router.currentView.playing);await p.waitForTimeout(100);
          await p.evaluate(()=>Hover.router.currentView.onGameLost());await p.waitForSelector('.msg-level-lost .msgButton');await p.locator('.msgButton').click();await p.waitForSelector('#modern-play');
        } else await p.click('#modern-menu');
        results.push({name,retro,state,passed:true});console.log('PASS '+name+' '+(retro?'retro + win/loss':'modern + glow'));
      }
      await p.close();
    }
    assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    fs.writeFileSync(root+'/verification/display-browser-results.json',JSON.stringify({base,audioEnabled:false,results,errors,missing},null,2)+'\n');
  } finally {await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
