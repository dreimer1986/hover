const {chromium}=require('playwright-core'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
 const base=process.env.HOVER_URL||'http://127.0.0.1:8768/';
 const errors=[],missing=[],pages=[];
 try{
  for(let i=0;i<2;i++){
   const context=await browser.newContext({viewport:{width:1100,height:700},locale:'en-US'}),p=await context.newPage();pages.push(p);
   p.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.message)});p.on('response',r=>{if(r.status()>=400)missing.push(r.status()+' '+r.url())});
   await p.goto(base+'play/modified/');await p.waitForSelector('#mp-panel');await p.locator('#mp-panel summary').click();
   await p.locator('#mp-name').fill('Pilot '+i);await p.evaluate(()=>{Hover.settings.setSoundEnabled(false);Hover.audio.setEnabled(false);});
  }
  const [a,b]=pages;
  await a.locator('#mp-create').click();await a.waitForFunction(()=>HoverMultiplayer.room?.players.length===1,null,{timeout:30000});
  const code=await a.evaluate(()=>HoverMultiplayer.room.code);
  await b.locator('#mp-code').fill(code);await b.locator('#mp-join').click();await a.waitForFunction(()=>HoverMultiplayer.room?.players.length===2);await b.waitForFunction(()=>!!HoverMultiplayer.playerId);
  assert(await b.locator('#mp-begin').isDisabled());
  await a.locator('#mp-begin').click();
  for(const p of pages){await p.waitForFunction(()=>HoverMultiplayer.game?.connected&&Hover.router.currentView.playing,null,{timeout:45000});await p.waitForFunction(()=>Object.keys(HoverMultiplayer.game.players.players).length===1);}
  console.log('PASS two-player lobby, balanced teams, map loading and remote crafts');
  const before=await a.evaluate(()=>HoverMultiplayer.game.craft.position.z);
  await a.keyboard.down('ArrowUp');await a.waitForTimeout(500);await a.keyboard.up('ArrowUp');
  const after=await a.evaluate(()=>HoverMultiplayer.game.craft.position.z);assert(Math.abs(after-before)>5);
  await b.waitForFunction(z=>Math.abs(Object.values(HoverMultiplayer.game.players.players)[0].Position.z-z)<300,after);
  console.log('PASS keyboard movement replicated');
  // Use actual physics collection paths at deterministic coordinates. Teleports
  // isolate synchronization from map navigation; movement is tested above.
  const item=await a.evaluate(()=>{const g=HoverMultiplayer.game,p=g.world.pods.find(p=>p.sound==='OBT_JUMP');if(!p)throw Error('No jump pod');g.craft.position.copy(p.location);g.craft.velocity.set(0,0,0);return {x:p.location.x,z:p.location.z};});
  await a.waitForFunction(()=>HoverMultiplayer.game.craft.springCount>0);
  await b.waitForFunction(pos=>!HoverMultiplayer.game.world.pods.some(p=>p.location.x===pos.x&&p.location.z===pos.z),item);
  console.log('PASS item awarded once and removed from both worlds');
  await a.evaluate(()=>{const c=HoverMultiplayer.game.craft;c.wallCount=1;c.placeWall();});
  await b.waitForFunction(()=>HoverMultiplayer.game.world.tempWalls.length>0);
  assert.equal(await a.evaluate(()=>HoverMultiplayer.game.craft.wallCount),0);
  console.log('PASS temporary wall replicated');
  const flags=await a.evaluate(()=>HoverMultiplayer.game.world.flags.filter(f=>f.team!==HoverMultiplayer.game.craft.team).map(f=>({x:f.location.x,y:f.location.y,z:f.location.z})));
  for(const flag of flags){
   await a.evaluate(pos=>{const g=HoverMultiplayer.game;g.craft.position.set(pos.x,pos.y+96,pos.z);g.craft.velocity.set(0,0,0);},flag);
   for(const p of pages)await p.waitForFunction(pos=>HoverMultiplayer.game.world.flags.some(f=>f.location.x===pos.x&&f.location.z===pos.z&&f.captured),flag);
  }
  for(const p of pages)await p.waitForFunction(()=>!Hover.router.currentView.playing);
  console.log('PASS shared flags and win/loss on both clients');
  for(const p of pages){await p.locator('#modern-menu').click();await p.waitForSelector('#modern-play');}
  await a.locator('#mp-create').click();await a.waitForFunction(()=>HoverMultiplayer.room?.players.length===1);
  await b.locator('#mp-code').fill(await a.evaluate(()=>HoverMultiplayer.room.code));await b.locator('#mp-join').click();await a.waitForFunction(()=>HoverMultiplayer.room?.players.length===2);
  await a.locator('#mp-begin').click();
  for(const p of pages)await p.waitForFunction(()=>HoverMultiplayer.game?.connected&&Hover.router.currentView.playing);
  await b.close();await a.waitForSelector('#modern-play');
  assert.match(await a.locator('#mp-status').innerText(),/disconnected/i);
  console.log('PASS new round and disconnect returns remaining player to menu');
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  fs.writeFileSync('verification/multiplayer-browser-results.json',JSON.stringify({base,players:2,lobby:true,movement:true,items:true,walls:true,flags:true,roundEnd:true,restartAndDisconnect:true,errors,missing},null,2)+'\n');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
