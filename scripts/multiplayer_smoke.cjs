const {chromium}=require('playwright-core'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
 const base=process.env.HOVER_URL||'http://127.0.0.1:8772/';
 const errors=[],missing=[],pages=[],rounds=[];
 try{
  for(let i=0;i<2;i++){
   const p=await browser.newPage({viewport:{width:1100,height:700},locale:'en-US'});pages.push(p);p.setDefaultTimeout(30000);
   p.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message)});p.on('response',r=>{if(r.status()>=400)missing.push(r.status()+' '+r.url())});
   await p.goto(base+'play/modified/');await p.waitForSelector('#enhanced-multiplayer');await p.click('#enhanced-multiplayer');
   await p.fill('#mp-name','Pilot '+i);await p.evaluate(()=>{Hover.settings.setSoundEnabled(false);Hover.audio.setEnabled(false);for(const key of Object.values(Hover.messageTypes||{}))Hover.settings.setPickupMessageShown(key,true);});
  }
  const [a,b]=pages;
  await a.click('#mp-create');await a.waitForFunction(()=>HoverMultiplayer.room?.players.length===1);
  const code=await a.evaluate(()=>HoverMultiplayer.room.code);
  await b.fill('#mp-code',code);await b.click('#mp-join');await a.waitForFunction(()=>HoverMultiplayer.room?.players.length===2);await b.waitForFunction(()=>!!HoverMultiplayer.playerId);
  assert(await b.locator('#mp-begin').isDisabled());
  for(const [maze,count,mode] of [['44','3','modern'],['47','6','retro']]){
   if(mode==='retro'){
    console.log('TEAM swap start');
    await a.selectOption('#mp-team','BLUE');await a.waitForFunction(()=>HoverMultiplayer.room.players.every(p=>p.team==='BLUE'));
    console.log('TEAM A swapped');assert(await a.locator('#mp-begin').isDisabled());
    await b.selectOption('#mp-team','RED');await a.waitForFunction(()=>new Set(HoverMultiplayer.room.players.map(p=>p.team)).size===2);
   }
   console.log('CONFIG '+mode);await a.selectOption('#mp-arena',maze);await a.waitForFunction(maze=>HoverMultiplayer.room.maze===Number(maze),maze);
   await a.selectOption('#mp-flags',count);await a.waitForFunction(n=>HoverMultiplayer.room.flagCount===Number(n),count);
   await a.selectOption('#mp-mode',mode);await a.waitForFunction(mode=>HoverMultiplayer.room.retro===(mode==='retro'),mode);
   await a.click('#mp-begin');
   for(const p of pages){await p.waitForFunction(()=>HoverMultiplayer.game?.connected&&Hover.router.currentView.playing,null,{timeout:45000});await p.waitForFunction(()=>Object.keys(HoverMultiplayer.game.players.players).length===1);assert.equal(await p.evaluate(()=>HoverMultiplayer.game.world.flags.length),Number(count)*2);}
   console.log('PASS room '+code+' '+mode+' arena '+maze+' flags '+count);
   const before=await a.evaluate(()=>HoverMultiplayer.game.craft.position.z);await a.keyboard.down('ArrowUp');await a.waitForTimeout(500);await a.keyboard.up('ArrowUp');
   const after=await a.evaluate(()=>HoverMultiplayer.game.craft.position.z);assert(Math.abs(after-before)>5);
   await b.waitForFunction(z=>Math.abs(Object.values(HoverMultiplayer.game.players.players)[0].Position.z-z)<300,after);
   if(mode==='modern'){
    const item=await a.evaluate(()=>{const g=HoverMultiplayer.game,p=g.world.pods.find(p=>p.sound==='OBT_JUMP');if(!p)throw Error('No jump pod');g.craft.position.copy(p.location);g.craft.velocity.set(0,0,0);return {x:p.location.x,z:p.location.z};});
    await a.waitForFunction(()=>HoverMultiplayer.game.craft.springCount>0);
    await b.waitForFunction(pos=>!HoverMultiplayer.game.world.pods.some(p=>p.location.x===pos.x&&p.location.z===pos.z),item);
    await a.evaluate(()=>{const c=HoverMultiplayer.game.craft;c.wallCount=1;c.placeWall();});await b.waitForFunction(()=>HoverMultiplayer.game.world.tempWalls.length>0);
   } else {
    await a.click('#modern-wide');await a.waitForFunction(()=>document.querySelector('#flag_counts').width===150);
   }
   const flags=await a.evaluate(()=>HoverMultiplayer.game.world.flags.filter(f=>f.team!==HoverMultiplayer.game.craft.team).map(f=>({x:f.location.x,y:f.location.y,z:f.location.z})));
   for(let i=0;i<flags.length;i++){
    await a.evaluate(pos=>{const g=HoverMultiplayer.game;g.craft.position.set(pos.x,Math.max(96,pos.y),pos.z);g.craft.velocity.set(0,0,0);},flags[i]);
    if(i<flags.length-1)for(const p of pages)await p.waitForFunction(pos=>HoverMultiplayer.game?.world.flags.some(f=>f.location.x===pos.x&&f.location.z===pos.z&&f.captured),flags[i]);
   }
   for(const p of pages){await p.waitForFunction(()=>HoverMultiplayer.room?.phase==='waiting'&&!HoverMultiplayer.game);await p.waitForSelector('#mp-begin');assert.equal(await p.evaluate(()=>HoverMultiplayer.room.code),code);}
   rounds.push({maze,count,mode});console.log('PASS round ends in same lobby');
  }
  await a.click('#mp-finish');
  for(const p of pages){await p.waitForSelector('#mp-scores');assert.equal(await p.evaluate(()=>HoverMultiplayer.room),null);assert.match(await p.locator('#mp-scores tbody').innerText(),/Pilot 0\s+9\s+2/);}
  console.log('PASS lobby close and cumulative scores on both clients');
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  fs.writeFileSync('verification/multiplayer-browser-results.json',JSON.stringify({base,players:2,rounds,teamChoice:true,persistentLobby:true,movement:true,items:true,walls:true,flags:true,finalScores:true,errors,missing},null,2)+'\n');
 }catch(e){for(const p of pages)console.log('FAILSTATE',await p.evaluate(()=>({room:HoverMultiplayer.room,status:document.getElementById('mp-status')?.textContent,view:Hover.router.currentView.id,playing:Hover.router.currentView.playing,game:!!HoverMultiplayer.game,connected:HoverMultiplayer.game?.connected})));throw e;}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
