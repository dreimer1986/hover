/* Local IndexedDB library and validated legacy geometry; no uploaded code is executed. */
(function(){
 'use strict';
 const de=hoverLocale.lang==='de',t=(a,b)=>de?a:b,format=HoverCraftFormat,entries=new Map(),native=new Map(),select=HoverEnhanced.controls.get('modern-craft');
 const panel=document.createElement('details');panel.id='craft-workshop';panel.className='enhanced-changes';
 panel.innerHTML=`<summary>${t('Eigene Schiffe · Import / Export','Custom crafts · Import / export')}</summary><p>${t('Statische OBJ + MTL + Texturen oder GLTF/GLB mit lokalen Ressourcen gemeinsam auswählen. Basisfarben werden übernommen; PBR-Effekte und Animationen nicht.','Select a static OBJ + MTL + textures, or GLTF/GLB with all local resources. Base colours are retained; PBR effects and animations are not.')}</p><input id="craft-files" type="file" multiple accept=".obj,.mtl,.gltf,.glb,.bin,.png,.jpg,.jpeg,.webp,.json"><div class="modern-options"><label>${t('Name','Name')}<input id="craft-name" maxlength="32" value="Custom craft"></label><label>${t('Oben-Achse','Up axis')}<select id="craft-up"><option value="y">Y</option><option value="z">Z</option></select></label><label>${t('Drehen','Rotate')}<select id="craft-rotation"><option>0</option><option>90</option><option>180</option><option>270</option></select></label><label>${t('Größe (% der Hülle)','Size (% of bounds)')}<input id="craft-size" type="number" min="10" max="100" value="90"></label></div><p id="craft-limits"></p><div id="craft-points"></div><p id="craft-budget"></p><button id="craft-convert" type="button">${t('Importieren und prüfen','Import and validate')}</button><button id="craft-preview-draft" type="button" disabled>${t('Werte in Vorschau übernehmen','Preview edited values')}</button><button id="craft-save" type="button" disabled>${t('Vorschau speichern','Save preview')}</button><button id="craft-edit" type="button">${t('Gewähltes Schiff bearbeiten','Edit selected craft')}</button><button id="craft-save-session" type="button">${t('Gewähltes Sitzungsschiff behalten','Keep selected session craft')}</button><button id="craft-export" type="button">${t('Gewähltes Schiff exportieren','Export selected craft')}</button><button id="craft-export-geometry" type="button">${t('Modell als Hover-JSON/JS','Model as Hover JSON/JS')}</button><button id="craft-delete" type="button">${t('Gewähltes Schiff löschen','Delete selected craft')}</button><p id="craft-status" role="status"></p>`;
 HoverEnhanced.controls.get('modern-launcher').querySelector('.modern-card').appendChild(panel);
 const $=id=>panel.querySelector('#'+id),message=text=>$('craft-status').textContent=text;
 let db=null,policy=null,draft=null,draftEntry=null,working=false;
 function profile(entry){const result={id:entry.id,modelName:'Custom_'+entry.hash};for(const [k,[a,b]]of Object.entries(policy.parameters))result[k]=a+(b-a)*entry.points[k]/10;return result;}
 const key=e=>'custom_'+e.hash;
 async function prepare(entry){
  if(native.has(entry.hash))return native.get(entry.hash);
  const promise=new Promise((resolve,reject)=>{
   const geometry=new THREE.JSONLoader().parse(entry.data.geometry,'').geometry;
   const image=new Image();image.onload=()=>{if(image.naturalWidth>policy.maxTexture||image.naturalHeight>policy.maxTexture)return reject(Error('Texture dimensions exceed limits'));const texture=new THREE.Texture(image);texture.needsUpdate=true;resolve({geometry,texture});};image.onerror=()=>reject(Error('Texture could not be decoded'));image.src=entry.data.texture;
  });native.set(entry.hash,promise);try{return await promise;}catch(e){native.delete(entry.hash);throw e;}
 }
 async function add(raw,persistent=false){
  const e=await format.validate(raw);if(entries.size>=64&&!entries.has(e.hash))throw Error('Session craft limit reached; export and reload');await prepare(e);e.persistent=persistent||entries.get(e.hash)?.persistent||false;entries.set(e.hash,e);Hover.Profiles[key(e)]=profile(e);
  let option=Array.from(select.options).find(o=>o.value===key(e));if(!option){option=document.createElement('option');option.value=key(e);select.appendChild(option);}option.textContent=e.name+(e.persistent?'':t(' · Sitzung',' · Session'));
  return e;
 }
 function transaction(mode,action){return new Promise((resolve,reject)=>{if(!db)return reject(Error(t('Lokaler Speicher nicht verfügbar. Bitte exportieren.','Local storage unavailable. Please export.')));const tx=db.transaction('crafts',mode),store=tx.objectStore('crafts');let result;const req=action(store);req.onsuccess=()=>result=req.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Storage operation aborted'));});}
 async function persist(e){if(!e.persistent&&[...entries.values()].filter(e=>e.persistent).length>=policy.maxStored)throw Error('Local craft limit reached');await transaction('readwrite',s=>s.put({hash:e.hash,json:e.json}));return add(e.json,true);}
 const selected=()=>entries.get(select.value.replace(/^custom_/,''));
 function download(name,text){const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 async function action(fn){if(working)return;working=true;panel.setAttribute('aria-busy','true');try{message(t('Bitte warten …','Please wait …'));await fn();}catch(e){message(e.message);}finally{working=false;panel.setAttribute('aria-busy','false');}}
 function points(){return Object.fromEntries(Object.keys(policy.parameters).map(k=>[k,Number($('point-'+k).value)]));}
 function budget(){const used=Object.values(points()).reduce((a,b)=>a+b,0);$('craft-budget').textContent=t('Punkte: ','Points: ')+used+' / '+policy.budget;$('craft-budget').classList.toggle('over-budget',used>policy.budget);for(const k of Object.keys(policy.parameters))$('point-value-'+k).textContent=$('point-'+k).value;}
 function fill(d){$('craft-name').value=d.name;for(const [k,v]of Object.entries(d.points))$('point-'+k).value=v;budget();}
 async function previewDraft(){
  if(!draft)throw Error('Import a model first');const data={...draft,name:$('craft-name').value.trim(),points:points()};
  const e=await add(JSON.stringify(data));draftEntry=e;select.value=key(e);select.dispatchEvent(new Event('change'));$('craft-save').disabled=false;
  message(t('Vorschau: ','Preview: ')+e.data.geometry.vertices.length/3+t(' Vertices · ',' vertices · ')+e.data.geometry.faces.length/10+t(' Dreiecke. Noch nicht gespeichert.',' triangles. Not saved yet.'));
 }
 $('craft-convert').onclick=()=>action(async()=>{
  await ready;const files=Array.from($('craft-files').files);if(!files.length)throw Error('Select model files');
  if(files.length===1&&/\.json$/i.test(files[0].name)){const e=await format.validate(await files[0].text());draft=e.data;fill(draft);}
  else{const size=Number($('craft-size').value);if(!Number.isFinite(size)||size<10||size>100)throw Error('Size must be 10–100%');const converter=await import('./craft-converter.mjs');draft=await converter.convert(files,{name:$('craft-name').value.trim(),points:points(),up:$('craft-up').value,rotation:$('craft-rotation').value,size},policy);}
  $('craft-preview-draft').disabled=false;await previewDraft();
 });
 $('craft-preview-draft').onclick=()=>action(previewDraft);
 $('craft-save').onclick=()=>action(async()=>{await previewDraft();draftEntry=await persist(draftEntry);message(t('Schiff im Browser gespeichert. Für eine dauerhafte Sicherung exportieren.','Craft saved in this browser. Export it for a durable backup.'));});
 $('craft-edit').onclick=()=>action(async()=>{const e=selected();if(!e)throw Error('Select a custom craft');draft=e.data;fill(draft);$('craft-preview-draft').disabled=false;message(t('Werte ändern und Vorschau aktualisieren.','Edit values and update the preview.'));});
 $('craft-save-session').onclick=()=>action(async()=>{const e=selected();if(!e)throw Error('Select a custom craft');await persist(e);message(t('Schiff gespeichert.','Craft saved.'));});
 $('craft-export').onclick=()=>action(async()=>{const e=selected();if(!e)throw Error('Select a custom craft');await format.validate(e.json);download(e.name.replace(/[^\w-]/g,'_')+'.hovercraft.json',e.json);message(t('Export erstellt.','Export created.'));});
 $('craft-export-geometry').onclick=()=>action(async()=>{const e=selected();if(!e)throw Error('Select a custom craft');download(e.name.replace(/[^\w-]/g,'_')+'.js',JSON.stringify(e.data.geometry));message(t('Geometrie exportiert. Das vollständige Paket enthält zusätzlich Textur und Fahrwerte.','Geometry exported. The complete package also includes texture and handling values.'));});
 $('craft-delete').onclick=()=>action(async()=>{const e=selected();if(!e)throw Error('Select a custom craft');if(e.persistent)await transaction('readwrite',s=>s.delete(e.hash));if(window.HoverMultiplayer?.room?.crafts.some(m=>m.hash===e.hash)){e.persistent=false;select.querySelector('option[value="'+key(e)+'"]').textContent=e.name+t(' · Sitzung',' · Session');}else{entries.delete(e.hash);delete Hover.Profiles[key(e)];select.querySelector('option[value="'+key(e)+'"]').remove();select.value='Easy';}select.dispatchEvent(new Event('change'));message(t('Lokale Kopie entfernt. Bereits geteilte Lobby-Kopien bleiben bis zum Sitzungsende bestehen.','Local copy removed. Shared lobby copies remain until the session ends.'));});
 const originalFromId=Hover.Profiles.fromId;Hover.Profiles.fromId=id=>{for(const e of entries.values())if(e.id===id)return profile(e);return originalFromId(id);};
 const ready=(async()=>{
  policy=await format.policyReady;
  $('craft-limits').textContent=t('Grenzen: ','Limits: ')+policy.bounds.join(' × ')+' · '+policy.maxVertices+t(' Vertices · ',' vertices · ')+policy.maxTriangles+t(' Dreiecke · 16 Materialien · 1,5 MB pro Schiff. Texturen werden auf einen 512²-Atlas reduziert.',' triangles · 16 materials · 1.5 MB per craft. Textures are reduced to a 512² atlas.');
  const labels={maxSpeed:t('Tempo','Speed'),acceleration:t('Beschleunigung','Acceleration'),turnSpeed:t('Lenkkraft','Steering power'),drag:t('Gleitfähigkeit','Coasting'),turnDrag:t('Direkte Lenkung','Steering response')};
  for(const k of Object.keys(policy.parameters)){const label=document.createElement('label');label.textContent=labels[k]+' ';const input=document.createElement('input');input.type='range';input.min=0;input.max=10;input.step=1;input.value=k==='turnDrag'?10:0;input.id='point-'+k;input.oninput=budget;const output=document.createElement('output');output.id='point-value-'+k;label.append(input,output);$('craft-points').appendChild(label);}budget();
  try{db=await new Promise((resolve,reject)=>{const req=indexedDB.open('hover-crafts',1);req.onupgradeneeded=()=>req.result.createObjectStore('crafts',{keyPath:'hash'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});for(const stored of await transaction('readonly',s=>s.getAll())){try{const checked=await format.validate(stored.json);if(checked.hash!==stored.hash)throw Error('Checksum mismatch');await add(stored.json,true);}catch(e){message(t('Ungültiges gespeichertes Schiff ignoriert: ','Invalid stored craft ignored: ')+e.message);}}}catch(e){message(e.message);}
 })();
 const onReady=Hover.views.GameView.prototype.onGameReady;
 Hover.views.GameView.prototype.onGameReady=function(){
  for(const e of entries.values()){const model=prepared.get(e.hash);if(model){model.texture.needsUpdate=true;Hover.Editor.schemeLoader.models['Custom_'+e.hash]={geometry:model.geometry,redDiffuseTexture:model.texture,blueDiffuseTexture:model.texture};}}
  return onReady.call(this);
 };
 const prepared=new Map();const oldPrepare=prepare;
 // add() awaits preparation; retain resolved data for the synchronous engine hook.
 async function resolved(e){const model=await oldPrepare(e);prepared.set(e.hash,model);return model;}
 prepare=resolved;
 window.HoverCrafts={ready,entry:k=>entries.get(k.replace(/^custom_/,'')),list:()=>[...entries.values()],add,persist,selected,
  profile:e=>profile(e),async preview(k){const e=entries.get(k.replace(/^custom_/,'')),m=await prepare(e),geometry=m.geometry;geometry.computeBoundingBox();const box=geometry.boundingBox,mesh=new THREE.Mesh(geometry,new THREE.MeshPhongMaterial({map:m.texture,shading:THREE.SmoothShading}));mesh.position.copy(box.min.clone().add(box.max).multiplyScalar(-.5));const group=new THREE.Object3D();group.add(mesh);group.rotation.y=Math.PI+Math.PI/6;return{group,radius:box.max.clone().sub(box.min).length()/2};}};
})();
