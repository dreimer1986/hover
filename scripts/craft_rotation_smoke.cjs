const {chromium}=require('playwright-core'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({locale:'en-US'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>sessionStorage.setItem('hover-input-ready','1'));
  await page.goto(process.env.HOVER_URL||'http://127.0.0.1:8772/');await page.locator('#craft-workshop > summary').click();
  const idle=()=>page.waitForFunction(()=>document.querySelector('#craft-workshop').getAttribute('aria-busy')==='false');
  async function checkRotation(){
   await idle();const before=await page.evaluate(()=>HoverCrafts.selected().data);
   await page.selectOption('#craft-rotation','180');await idle();
   const after=await page.evaluate(()=>HoverCrafts.selected().data);
   for(const field of ['vertices','normals'])for(let i=0;i<before.geometry[field].length;i++)assert(Math.abs(after.geometry[field][i]-before.geometry[field][i]*(i%3===1?1:-1))<.0001,field+' '+i);
   assert.notDeepEqual(after.geometry.vertices,before.geometry.vertices);
   await page.selectOption('#craft-rotation','0');await idle();
   const reset=await page.evaluate(()=>HoverCrafts.selected().data.geometry.vertices);reset.forEach((v,i)=>assert(Math.abs(v-before.geometry.vertices[i])<.0001));
   await page.selectOption('#craft-rotation','180');await idle();await page.click('#craft-save');await idle();
   const saved=await page.evaluate(()=>({hash:HoverCrafts.selected().hash,json:HoverCrafts.selected().json}));
   await page.reload();await page.waitForFunction(hash=>HoverCrafts.list().some(e=>e.hash===hash&&e.persistent),saved.hash);
   await page.selectOption('#modern-craft','custom_'+saved.hash);
   assert.deepEqual(await page.evaluate(()=>HoverCrafts.selected().data.geometry.vertices),after.geometry.vertices);
   await page.locator('#craft-workshop > summary').click();
   const [download]=await Promise.all([page.waitForEvent('download'),page.click('#craft-export')]);await idle();
   assert.equal(require('node:fs').readFileSync(await download.path(),'utf8'),saved.json);
   return saved;
  }
  await page.setInputFiles('#craft-files',process.env.HOVER_MODEL||'/home/dreimer/.cache/hover-preview/import-fixtures/chicago.obj');await page.click('#craft-convert');await idle();
  const saved=await checkRotation();console.log('PASS model rotation updates immediately; vertices/normals, reset, save/reload and export');
  await page.setInputFiles('#craft-files',process.env.HOVER_PACKAGE||{name:'test.hovercraft.json',mimeType:'application/json',buffer:Buffer.from(saved.json)});
  await page.click('#craft-convert');await idle();await checkRotation();console.log('PASS existing craft package rotation and persistence');
  await page.click('#craft-edit');await idle();await page.selectOption('#craft-rotation','180');await idle();assert.equal(await page.locator('#craft-rotation').inputValue(),'180');
  assert.deepEqual(errors,[]);console.log('PASS stored craft editing without source model');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
