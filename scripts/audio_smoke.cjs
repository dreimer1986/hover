const {click:navigationClick}=require('./navigation_helpers.cjs');
const pw=require('playwright-core'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const engine=process.env.BROWSER_ENGINE||'chromium';
const base=(process.env.HOVER_URL||'http://127.0.0.1:8767/hover/').replace(/\/?$/,'/');
(async()=>{
  // Deliberately use normal autoplay policy: audio must unlock from real input.
  const browser=await pw[engine].launch(engine==='chromium'?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']}:{headless:true});
  const errors=[],missing=[],results=[];
  try {
    const p=await browser.newPage({viewport:{width:844,height:390},deviceScaleFactor:3,isMobile:true,hasTouch:true,locale:'en-US',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'});
    p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)missing.push(r.status()+' '+r.url())});
    await p.addInitScript(()=>sessionStorage.setItem('hover-input-ready','1'));await p.goto(base+'play/modified/');await p.waitForSelector('#modern-play');
    await p.evaluate(()=>{Hover.settings.setIntroMessageShown(true);Hover.settings.setSoundEnabled(true);Hover.audio.setEnabled(true);});
    const energy=()=>p.evaluate(()=>{const a=HoverAudio.analyser;a.fftSize=2048;const data=new Float32Array(a.fftSize);a.getFloatTimeDomainData(data);return Math.sqrt(data.reduce((s,n)=>s+n*n,0)/data.length);});
    async function audible(){await p.waitForFunction(()=>{const a=HoverAudio.analyser;if(!a)return false;const data=new Float32Array(a.fftSize);a.getFloatTimeDomainData(data);return data.some(v=>Math.abs(v)>.0001);},{},{timeout:5000});return energy();}
    for(const retro of [false,true]) {
      await p.locator(retro?'#modern-retro':'#modern-play').tap();await p.waitForFunction(()=>Hover.router.currentView.playing);await p.waitForFunction(()=>HoverAudio.context.state==='running',null,{timeout:10000}).catch(async e=>{console.log('audio state',await p.evaluate(()=>({state:HoverAudio.context?.state,errors:HoverAudio.errors})));throw e;});
      await p.waitForTimeout(2200); // let the original delayed music start settle
      assert.deepEqual(await p.evaluate(()=>HoverAudio.errors),[]);
      const music=await p.evaluate(()=>{const s=Hover.audio.getSound('MUSIC');return {present:!!s.buffer,playing:s.playing};});
      if(!retro)assert(music.present&&music.playing);
      await p.evaluate(()=>Hover.audio.getSound('MUSIC').stop());
      const engines=[];
      await p.waitForFunction(()=>Hover.router.currentView.game.craft.enginePlaying.name==='ENG_IDLE',null,{timeout:10000});
      engines.push({name:'ENG_IDLE',rms:await audible()});
      const loopChecks=await p.evaluate(async()=>{
        const results=[];
        for(const name of ['ENG_IDLE','ENG_NORM','ENG_LOW','ENG_HIGH']) {
          const sound=Hover.audio.getSound(name);
          if(!sound.file.endsWith('.pcm-v1.wav')||sound.loopStart!==0)throw Error('Prepared PCM loop not selected: '+name);
          for(const rate of [44100,48000]) {
            const offline=new OfflineAudioContext(sound.buffer.numberOfChannels,Math.ceil(sound.buffer.duration*4*rate),rate);
            const source=offline.createBufferSource();source.buffer=sound.buffer;source.loop=true;source.loopStart=sound.loopStart;source.loopEnd=sound.buffer.duration;
            source.connect(offline.destination);source.start();const rendered=await offline.startRendering();
            const size=Math.round(rate*.010);let minRms=Infinity;
            for(let start=0;start+size<=rendered.length;start+=size) {
              let sum=0;
              for(let ch=0;ch<rendered.numberOfChannels;ch++){const data=rendered.getChannelData(ch);for(let i=start;i<start+size;i++)sum+=data[i]*data[i];}
              minRms=Math.min(minRms,Math.sqrt(sum/(size*rendered.numberOfChannels)));
            }
            if(minRms<.001)throw Error('Silent loop window: '+name+' '+rate+' '+minRms);
            results.push({name,rate,cycles:4,min10msRms:minRms,duration:sound.buffer.duration});
          }
        }
        return results;
      });
      const continuousIdle=await p.evaluate(async()=>{
        const sound=Hover.audio.getSound('ENG_IDLE'),source=sound.source,a=HoverAudio.analyser;
        const end=performance.now()+sound.buffer.duration*3200,values=[];
        while(performance.now()<end){const data=new Float32Array(a.fftSize);a.getFloatTimeDomainData(data);values.push(Math.sqrt(data.reduce((sum,x)=>sum+x*x,0)/data.length));await new Promise(resolve=>setTimeout(resolve,25));}
        return {samples:values.length,minRms:Math.min(...values),sameSource:source===sound.source};
      });
      assert(continuousIdle.samples>30&&continuousIdle.minRms>.001&&continuousIdle.sameSource);
      await p.keyboard.down('ArrowUp');
      for(const [name,factor] of [['ENG_NORM',1],['ENG_LOW',.5],['ENG_HIGH',1.5]]) {
        await p.evaluate(factor=>{const c=Hover.router.currentView.game.craft;c.maxSpeedModifier=factor;c.maxSpeedModifierTime=20;},factor);
        await p.waitForFunction(name=>{const s=Hover.router.currentView.game.craft.enginePlaying;return s.name===name&&s.playing;},name,{timeout:10000});
        engines.push({name,rms:await audible()});
      }
      await p.keyboard.up('ArrowUp');
      await p.evaluate(()=>{const c=Hover.router.currentView.game.craft;c.player=false;Hover.audio.stopAll();});
      await p.waitForTimeout(150);assert(await energy()<.00001);
      // Exercise the actual wall collision sound path, with a deterministic
      // collision result for this one physics call rather than teleporting blindly.
      await p.evaluate(()=>{const g=Hover.router.currentView.game,c=g.craft,w=g.world,check=w.checkCraftAgainstStaticGeometry;
        w.checkCraftAgainstStaticGeometry=()=>[{intersectNormal:new THREE.Vector3(1,0,0)}];c.player=true;
        try{c.applyAccel(.01,0)}finally{w.checkCraftAgainstStaticGeometry=check;c.player=false;}
        c.enginePlaying.stop();
      });
      assert(await p.evaluate(()=>Hover.audio.getSound('HIT_WALL').playing));const wallRms=await audible();
      await p.evaluate(()=>Hover.audio.stopAll());await p.waitForTimeout(100);
      const item=await p.evaluate(()=>{const g=Hover.router.currentView.game,pod=g.world.pods.find(p=>p.sound==='OBT_JUMP')||g.world.pods.find(p=>/^OBT_/.test(p.sound));if(!pod)throw new Error('No collectible found');pod.onHit(g.craft);return pod.sound;});
      assert(await p.evaluate(name=>Hover.audio.getSound(name).playing,item));const itemRms=await audible();
      await navigationClick(p,'#modern-settings');await p.locator('#modern-sound').tap();await p.click('[data-command=resume]');assert.equal(await p.evaluate(()=>Hover.audio.enabled),false);await p.waitForTimeout(150);assert(await energy()<.00001);
      await p.evaluate(()=>{const c=Hover.router.currentView.game.craft;c.player=true;c.enginePlaying=null;});
      await navigationClick(p,'#modern-settings');await p.locator('#modern-sound').tap();await p.click('[data-command=resume]');await audible();
      await p.evaluate(()=>HoverAudio.context.suspend());assert.equal(await p.evaluate(()=>HoverAudio.context.state),'suspended');
      await navigationClick(p,'#modern-wide');await p.waitForFunction(()=>HoverAudio.context.state==='running');await audible();
      const contextState=await p.evaluate(()=>HoverAudio.context.state);
      await navigationClick(p,'#modern-settings');await p.locator('[data-command=home]').tap();await p.waitForSelector('#modern-play');await p.waitForTimeout(2200);assert(await energy()<.00001);
      results.push({retro,engines,loopChecks,continuousIdle,music,wallRms,item,itemRms,mute:true,resume:contextState,menuSilent:true});console.log('PASS '+engine+' '+(retro?'retro':'modern')+' engine/effects/mute/resume/menu');
    }
    assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    fs.writeFileSync(path.resolve(__dirname,'../verification/audio-'+engine+'-results.json'),JSON.stringify({base,engine,autoplayPolicy:'browser default',results,errors,missing},null,2)+'\n');
  } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
