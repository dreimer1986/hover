/* Local IndexedDB library and validated legacy geometry; no uploaded code is executed. */
(function(){
 'use strict';
 const de=hoverLocale.lang==='de',t=(a,b)=>de?a:b,format=HoverCraftFormat,entries=new Map(),native=new Map(),prepared=new Map(),select=HoverEnhanced.controls.get('modern-craft');
  const labels={maxSpeed:t('Tempo','Speed'),acceleration:t('Beschleunigung','Acceleration'),turnSpeed:t('Lenkkraft','Steering power'),drag:t('Gleitfähigkeit','Coasting'),turnDrag:t('Nachdrehen','Turn coasting')};
 const descriptions={
  maxSpeed:t('Mehr Punkte erhöhen die normale Höchstgeschwindigkeit. Weniger Tempo lässt mehr Zeit zum Reagieren.','More points raise normal top speed. Lower speed leaves more time to react.'),
  acceleration:t('Mehr Punkte lassen das Schiff beim Gasgeben schneller Fahrt aufnehmen. Weniger Punkte machen das Anfahren sanfter.','More points make the craft gain speed faster under power. Fewer points make acceleration gentler.'),
  turnSpeed:t('Mehr Punkte bauen die Drehbewegung schneller auf und erlauben schnelleres Drehen bei gedrückter Lenkung. Das Schiff reagiert kräftiger auf Lenkeingaben.','More points build up rotation faster and allow faster turning while steering. The craft responds more strongly to steering input.'),
  drag:t('Mehr Punkte bedeuten weniger Abbremsen ohne Gas: Das Schiff gleitet länger weiter. Weniger Punkte bremsen es beim Loslassen stärker ab.','More points mean less slowing when power is released: the craft coasts farther. Fewer points slow it down more quickly when you let go.'),
  turnDrag:t('Mehr Punkte bedeuten weniger Drehdämpfung: Nach dem Loslassen der Lenkung dreht das Schiff länger weiter. Weniger Punkte bringen die Drehbewegung schneller zur Ruhe.','More points mean less rotational damping: the craft keeps turning longer after steering is released. Fewer points bring its rotation to rest sooner.')
 };
 function createStatsHelp(id){
  const details=document.createElement('details');details.id=id;details.className='craft-stats-help';const summary=document.createElement('summary');summary.textContent=t('Was bedeuten die Werte?','What do these values mean?');details.appendChild(summary);
  const intro=document.createElement('p');intro.textContent=t('0–10 beschreibt den Bereich der Originalschiffe. 0 heißt Minimum, nicht keine Leistung. Mehr Punkte bedeuten nicht automatisch leichteres oder besseres Fahren.','0–10 describes the range of the original crafts. Zero means the minimum, not no performance. More points do not automatically make a craft easier or better to drive.');details.appendChild(intro);
  for(const key of Object.keys(labels)){const paragraph=document.createElement('p'),name=document.createElement('strong');paragraph.id=id+'-'+key;name.textContent=labels[key]+': ';paragraph.append(name,document.createTextNode(descriptions[key]));details.appendChild(paragraph);}
  const budget=document.createElement('p');budget.textContent=t('40 ist die Obergrenze für eigene Schiffe, abgeleitet vom höchsten umgerechneten Originalwert (Bambi). Du musst die Punkte nicht ausschöpfen. Die Summe ist keine objektive Leistungs- oder Schwierigkeitsnote.','40 is the custom-craft limit, derived from the highest converted original total (Bambi). You do not have to spend every point. The total is not an objective performance or difficulty rating.');details.appendChild(budget);
  const easy=document.createElement('p');easy.textContent=t('Chicago ist trotz 10 von 40 Punkten anfängerfreundlich: Es fährt langsamer, beschleunigt sanfter, dreht langsamer und bremst ohne Gas stärker ab. Unterschiedliche Fahrzeugmassen sind in diesen Profilen nicht hinterlegt.','Chicago is beginner-friendly despite using 10 of 40 points: it is slower, accelerates more gently, turns more slowly and slows down more strongly without power. These profiles do not define different vehicle masses.');details.appendChild(easy);return details;
 }
 const panel=document.createElement('details');panel.id='craft-workshop';panel.className='enhanced-changes';
 panel.innerHTML=`<summary>${t('Eigene Schiffe · Import / Export','Custom crafts · Import / export')}</summary><p>${t('OBJ, FBX oder GLTF/GLB samt lokalen Texturen auswählen. OBJ funktioniert auch ohne MTL; Farbtexturen lassen sich unten zuordnen. Basisfarben werden übernommen; PBR-Effekte und Animationen nicht.','Select OBJ, FBX or GLTF/GLB with local textures. OBJ also works without MTL; assign colour textures below. Base colours are retained; PBR effects and animations are not.')}</p><input id="craft-files" type="file" multiple accept=".obj,.fbx,.mtl,.gltf,.glb,.bin,.png,.jpg,.jpeg,.webp,.bmp,.tga,.dds,.json,.max"><label id="craft-model-label" hidden>${t('Hauptmodell','Main model')}<select id="craft-model"></select></label><div id="craft-materials"></div><div class="modern-options"><label>${t('Name','Name')}<input id="craft-name" maxlength="32" value="Custom craft"></label><label>${t('Oben-Achse','Up axis')}<select id="craft-up"><option value="y">Y</option><option value="z">Z</option></select></label><label>${t('Drehen','Rotate')}<select id="craft-rotation"><option>0</option><option>90</option><option>180</option><option>270</option></select></label><label>${t('Größe (% der Hülle)','Size (% of bounds)')}<input id="craft-size" type="number" min="10" max="100" value="90"></label></div><p id="craft-limits"></p><figure id="craft-import-preview" hidden><figcaption></figcaption></figure><div id="craft-points"></div><p id="craft-budget"></p><button id="craft-convert" type="button">${t('Importieren und prüfen','Import and validate')}</button><button id="craft-preview-draft" type="button" disabled>${t('Werte in Vorschau übernehmen','Preview edited values')}</button><button id="craft-save" type="button" disabled>${t('Vorschau speichern','Save preview')}</button><button id="craft-edit" type="button">${t('Gewähltes Schiff bearbeiten','Edit selected craft')}</button><button id="craft-save-session" type="button">${t('Gewähltes Sitzungsschiff behalten','Keep selected session craft')}</button><button id="craft-export" type="button">${t('Gewähltes Schiff exportieren','Export selected craft')}</button><button id="craft-export-geometry" type="button">${t('Modell als Hover-JSON/JS','Model as Hover JSON/JS')}</button><button id="craft-delete" type="button">${t('Gewähltes Schiff löschen','Delete selected craft')}</button><p id="craft-status" role="status"></p>`;
 HoverEnhanced.controls.get('modern-launcher').querySelector('.modern-card').appendChild(panel);
 const $=id=>panel.querySelector('#'+id),message=text=>$('craft-status').textContent=text;
 let db=null,policy=null,draft=null,draftEntry=null,sourceDraft=null,pendingTransform=false,pendingImport=false,working=false,importRenderer=null,importScene,importCamera,importGroup=null;
 function profile(entry){const result={id:entry.id,modelName:'Custom_'+entry.hash};for(const [k,[a,b]]of Object.entries(policy.parameters))result[k]=a+(b-a)*entry.points[k]/10;return result;}
 const key=e=>'custom_'+e.hash;
 async function prepare(entry){
  if(native.has(entry.hash))return native.get(entry.hash);
  const promise=new Promise((resolve,reject)=>{
   const geometry=new THREE.JSONLoader().parse(entry.data.geometry,'').geometry;
   const image=new Image();image.onload=()=>{if(image.naturalWidth>policy.maxTexture||image.naturalHeight>policy.maxTexture)return reject(Error('Texture dimensions exceed limits'));const texture=new THREE.Texture(image);texture.needsUpdate=true;resolve({geometry,texture});};image.onerror=()=>reject(Error('Texture could not be decoded'));image.src=entry.data.texture;
  });native.set(entry.hash,promise);try{const model=await promise;prepared.set(entry.hash,model);return model;}catch(e){native.delete(entry.hash);throw e;}
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
 async function action(fn){if(working)return;working=true;panel.setAttribute('aria-busy','true');try{message(t('Bitte warten …','Please wait …'));await fn();}catch(e){message(e.message);}finally{working=false;panel.setAttribute('aria-busy','false');if(pendingImport){pendingImport=pendingTransform=false;action(importModel);}else if(pendingTransform){pendingTransform=false;action(refreshTransform);}}}
 function points(){return Object.fromEntries(Object.keys(policy.parameters).map(k=>[k,Number($('point-'+k).value)]));}
 function budget(){const used=Object.values(points()).reduce((a,b)=>a+b,0);$('craft-budget').textContent=t('Punkte: ','Points: ')+used+' / '+policy.budget;$('craft-budget').classList.toggle('over-budget',used>policy.budget);for(const k of Object.keys(policy.parameters))$('point-value-'+k).textContent=$('point-'+k).value;}
 function fill(d){$('craft-name').value=d.name;for(const [k,v]of Object.entries(d.points))$('point-'+k).value=v;budget();}
 function disposePreview(group){group.traverse(o=>{o.geometry?.dispose();o.material?.map?.dispose();o.material?.dispose();});}
 async function previewImported(e){
  const figure=$('craft-import-preview');figure.hidden=false;
  if(!importRenderer){
   importRenderer=new THREE.WebGLRenderer({alpha:true,antialias:true});importRenderer.setClearColor(0,0);importRenderer.setSize(640,360);figure.prepend(importRenderer.domElement);
   importScene=new THREE.Scene();importCamera=new THREE.PerspectiveCamera(35,640/360,.1,10000);importScene.add(new THREE.AmbientLight(0xaaaaaa));const light=new THREE.PointLight(0xffffff,.9);light.position.set(200,400,600);importScene.add(light);
   let drag=null;const canvas=importRenderer.domElement;canvas.style.touchAction='none';
   canvas.onpointerdown=event=>{drag={x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);};
   canvas.onpointermove=event=>{if(!drag||!importGroup)return;importGroup.rotation.y+=(event.clientX-drag.x)*.01;importGroup.rotation.x=Math.max(-1,Math.min(1,importGroup.rotation.x+(event.clientY-drag.y)*.01));drag={x:event.clientX,y:event.clientY};importRenderer.render(importScene,importCamera);};
   canvas.onpointerup=canvas.onpointercancel=()=>{drag=null;};
  }
  const model=await window.HoverCrafts.preview(key(e));if(importGroup){importScene.remove(importGroup);disposePreview(importGroup);}importGroup=model.group;const arrow=new THREE.ArrowHelper(new THREE.Vector3(0,0,-1),new THREE.Vector3(0,-45,0),160,0xffa328,35,18);importGroup.add(arrow);importScene.add(importGroup);
  const distance=Math.hypot(...policy.bounds)/2/Math.sin(THREE.Math.degToRad(importCamera.fov/2))*.75;importCamera.position.set(0,distance*.38,distance);importCamera.lookAt(new THREE.Vector3());importRenderer.render(importScene,importCamera);
  const bounds=entries.get(e.hash).data.geometry.vertices,axes=[0,1,2].map(axis=>{const values=bounds.filter((_,i)=>i%3===axis);return (Math.max(...values)-Math.min(...values)).toFixed(1);});
  figure.querySelector('figcaption').textContent=e.name+' · '+axes.join(' × ')+t(' · Orange Pfeil = vorne (−Z). Ziehen dreht nur die Ansicht; „Drehen“ ändert das Schiff',' · Orange arrow = forward (−Z). Drag changes the view only; Rotate changes the craft');figure.dataset.hash=e.hash;
 }
 async function previewDraft(){
  if(!draft)throw Error('Import a model first');const data={...draft,name:$('craft-name').value.trim(),points:points()};
  const e=await add(JSON.stringify(data));await previewImported(e);draftEntry=e;select.value=key(e);select.dispatchEvent(new Event('change'));$('craft-save').disabled=false;
  message(t('Vorschau: ','Preview: ')+e.data.geometry.vertices.length/3+t(' Vertices · ',' vertices · ')+e.data.geometry.faces.length/10+t(' Dreiecke. Noch nicht gespeichert.',' triangles. Not saved yet.'));
 }
 function scheduleImport(){if(working)pendingImport=true;else action(importModel);}
 let materialChoices={};
 $('craft-files').onchange=()=>{materialChoices={};$('craft-materials').replaceChildren();const models=Array.from($('craft-files').files).filter(f=>/\.(obj|fbx|gltf|glb)$/i.test(f.name));$('craft-model').replaceChildren(...models.map(f=>{const o=document.createElement('option');o.value=o.textContent=f.name;return o;}));$('craft-model-label').hidden=models.length<2;};
 function materialOptions(materials,files){
  const box=$('craft-materials');box.replaceChildren();const note=document.createElement('p');note.textContent=t('Farbtextur je Material wählen. Automatisch nutzt vorhandene Zuordnungen oder eine eindeutige Albedo-/Diffuse-Datei. Normal-, Höhen-, Metall-, Glanz- und Emissionskarten werden nicht als PBR-Effekte übernommen.','Choose a colour texture per material. Automatic uses existing assignments or an unambiguous albedo/diffuse file. Normal, height, metal, gloss and emission maps are not retained as PBR effects.');box.appendChild(note);
  for(const m of materials){const label=document.createElement('label');label.textContent=m.name;const select=document.createElement('select');select.dataset.material=m.index;
   for(const [value,text]of [['',t('Automatisch','Automatic')],['__none__',t('Nur Materialfarbe','Material colour only')],...files.map(f=>[f,f])]){const o=document.createElement('option');o.value=value;o.textContent=text;select.appendChild(o);}select.value=materialChoices[m.index]||'';
   select.onchange=()=>{materialChoices[m.index]=select.value;scheduleImport();};label.appendChild(select);box.appendChild(label);
  }return materialChoices;
 }
 $('craft-model').onchange=()=>{materialChoices={};scheduleImport();};
 function sourceSize(data){const v=data.geometry.vertices;return Math.max(...policy.bounds.map((bound,axis)=>{const a=v.filter((_,i)=>i%3===axis);return (Math.max(...a)-Math.min(...a))/bound;}))*100;}
 function transformSource(){
  if(!sourceDraft)throw Error('Import a model first');
  const size=Number($('craft-size').value),angle=Number($('craft-rotation').value)*Math.PI/180,zUp=$('craft-up').value==='z';
  if(!Number.isFinite(size)||size<10||size>100)throw Error('Size must be 10–100%');
  const geometry=JSON.parse(JSON.stringify(sourceDraft.geometry)),c=Math.cos(angle),s=Math.sin(angle);
  for(const values of [geometry.vertices,geometry.normals])for(let i=0;i<values.length;i+=3){const x=values[i],y=zUp?values[i+2]:values[i+1],z=zUp?-values[i+1]:values[i+2];values[i]=c*x+s*z;values[i+1]=y;values[i+2]=-s*x+c*z;}
  const axes=[0,1,2].map(axis=>geometry.vertices.filter((_,i)=>i%3===axis)),lo=axes.map(a=>Math.min(...a)),hi=axes.map(a=>Math.max(...a)),factor=Math.min(...policy.bounds.map((b,i)=>hi[i]-lo[i]>1e-8?b/(hi[i]-lo[i]):Infinity))*size/100;
  for(let i=0;i<geometry.vertices.length;i++){const axis=i%3,center=axis===1?lo[axis]:(lo[axis]+hi[axis])/2;geometry.vertices[i]=Math.round((geometry.vertices[i]-center)*factor*1e5)/1e5;}
  for(let i=0;i<geometry.normals.length;i++)geometry.normals[i]=Math.round(geometry.normals[i]*1e5)/1e5;
  draft={...sourceDraft,geometry};
 }
 async function refreshTransform(){transformSource();await previewDraft();}
 for(const id of ['craft-up','craft-rotation','craft-size'])$(id).onchange=()=>{if(!sourceDraft)return;if(working){pendingTransform=true;return;}action(refreshTransform);};
 async function importModel(){
  await ready;const files=Array.from($('craft-files').files);if(!files.length)throw Error('Select model files');
  let source;
  if(files.length===1&&/\.json$/i.test(files[0].name)){const e=await format.validate(await files[0].text());source=e.data;fill(source);$('craft-size').value=Math.max(10,Math.min(100,sourceSize(source)));}
  else{const converter=await import('./craft-converter.mjs');source=await converter.convert(files,{name:$('craft-name').value.trim(),points:points(),up:'y',rotation:'0',size:100,model:$('craft-model').value,onMaterials:materialOptions},policy);}
  sourceDraft=source;$('craft-preview-draft').disabled=false;if(files.length===1&&/\.json$/i.test(files[0].name)&&$('craft-up').value==='y'&&$('craft-rotation').value==='0'){draft=source;await previewDraft();}else await refreshTransform();
 }
 $('craft-convert').onclick=()=>action(importModel);
 const test=document.createElement('button');test.id='craft-test-drive';test.textContent=t('Testfahrt mit Vorschau','Test drive preview');panel.append(test);test.onclick=()=>action(async()=>{await previewDraft();await HoverEnhanced.startPractice('workshop',!!document.getElementById('practice-retro')?.checked);});
 $('craft-preview-draft').onclick=()=>action(previewDraft);
 $('craft-save').onclick=()=>action(async()=>{await previewDraft();draftEntry=await persist(draftEntry);message(t('Schiff im Browser gespeichert. Für eine dauerhafte Sicherung exportieren.','Craft saved in this browser. Export it for a durable backup.'));});
 $('craft-edit').onclick=()=>action(async()=>{const e=selected();if(!e)throw Error('Select a custom craft');sourceDraft=draft=e.data;$('craft-materials').replaceChildren();$('craft-model-label').hidden=true;fill(draft);$('craft-up').value='y';$('craft-rotation').value='0';$('craft-size').value=Math.max(10,Math.min(100,sourceSize(draft)));await previewImported(e);$('craft-preview-draft').disabled=false;message(t('Werte ändern und Vorschau aktualisieren.','Edit values and update the preview.'));});
 $('craft-save-session').onclick=()=>action(async()=>{const e=selected();if(!e)throw Error('Select a custom craft');await persist(e);message(t('Schiff gespeichert.','Craft saved.'));});
 $('craft-export').onclick=()=>action(async()=>{const e=selected();if(!e)throw Error('Select a custom craft');await format.validate(e.json);download(e.name.replace(/[^\w-]/g,'_')+'.hovercraft.json',e.json);message(t('Export erstellt.','Export created.'));});
 $('craft-export-geometry').onclick=()=>action(async()=>{const e=selected();if(!e)throw Error('Select a custom craft');download(e.name.replace(/[^\w-]/g,'_')+'.js',JSON.stringify(e.data.geometry));message(t('Geometrie exportiert. Das vollständige Paket enthält zusätzlich Textur und Fahrwerte.','Geometry exported. The complete package also includes texture and handling values.'));});
 $('craft-delete').onclick=()=>action(async()=>{const e=selected();if(!e)throw Error('Select a custom craft');if(e.persistent)await transaction('readwrite',s=>s.delete(e.hash));if(window.HoverMultiplayer?.room?.crafts.some(m=>m.hash===e.hash)){e.persistent=false;select.querySelector('option[value="'+key(e)+'"]').textContent=e.name+t(' · Sitzung',' · Session');}else{entries.delete(e.hash);delete Hover.Profiles[key(e)];select.querySelector('option[value="'+key(e)+'"]').remove();select.value='Easy';}select.dispatchEvent(new Event('change'));message(t('Lokale Kopie entfernt. Bereits geteilte Lobby-Kopien bleiben bis zum Sitzungsende bestehen.','Local copy removed. Shared lobby copies remain until the session ends.'));});
 const originalFromId=Hover.Profiles.fromId;Hover.Profiles.fromId=id=>{for(const e of entries.values())if(e.id===id)return profile(e);return originalFromId(id);};
 const ready=(async()=>{
  policy=await format.policyReady;$('craft-budget').after(createStatsHelp('craft-editor-help'));
  $('craft-limits').textContent=t('Grenzen: ','Limits: ')+policy.bounds.join(' × ')+' · '+policy.maxVertices+t(' Vertices · ',' vertices · ')+policy.maxTriangles+t(' Dreiecke · 16 Materialien · 1,5 MB pro Schiff. Texturen werden auf einen 512²-Atlas reduziert.',' triangles · 16 materials · 1.5 MB per craft. Textures are reduced to a 512² atlas.');

  for(const k of Object.keys(policy.parameters)){const label=document.createElement('label');label.textContent=labels[k]+' ';const input=document.createElement('input');input.type='range';input.min=0;input.max=10;input.step=1;input.value=k==='turnDrag'?10:0;input.id='point-'+k;input.oninput=budget;input.title=descriptions[k];input.setAttribute('aria-describedby','craft-editor-help-'+k);const output=document.createElement('output');output.id='point-value-'+k;label.append(input,output);$('craft-points').appendChild(label);}budget();
  try{db=await new Promise((resolve,reject)=>{const req=indexedDB.open('hover-crafts',1);req.onupgradeneeded=()=>req.result.createObjectStore('crafts',{keyPath:'hash'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});for(const stored of await transaction('readonly',s=>s.getAll())){try{const checked=await format.validate(stored.json);if(checked.hash!==stored.hash)throw Error('Checksum mismatch');await add(stored.json,true);}catch(e){message(t('Ungültiges gespeichertes Schiff ignoriert: ','Invalid stored craft ignored: ')+e.message);}}}catch(e){message(e.message);}
 })();
 const onReady=Hover.views.GameView.prototype.onGameReady;
 Hover.views.GameView.prototype.onGameReady=function(){
  for(const e of entries.values()){const model=prepared.get(e.hash);if(model){const texture=model.texture.clone();texture.needsUpdate=true;Hover.Editor.schemeLoader.models['Custom_'+e.hash]={geometry:model.geometry.clone(),redDiffuseTexture:texture,blueDiffuseTexture:texture};}}
  return onReady.call(this);
 };
 async function importLibrary(raws){
  if(!Array.isArray(raws)||raws.length>policy.maxStored)throw Error('Library exceeds storage limit');
  const validated=await Promise.all(raws.map(raw=>format.validate(raw)));
  if(new Set([...entries.values()].filter(e=>e.persistent).map(e=>e.hash).concat(validated.map(e=>e.hash))).size>policy.maxStored)throw Error('Combined library exceeds storage limit');
  if(new Set([...entries.keys(),...validated.map(e=>e.hash)]).size>64)throw Error('Session craft limit reached');
  await Promise.all(validated.map(prepare));
  await new Promise((resolve,reject)=>{if(!db)return reject(Error('Local storage unavailable'));const tx=db.transaction('crafts','readwrite');for(const e of validated)tx.objectStore('crafts').put({hash:e.hash,json:e.json});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
  for(const e of validated)await add(e.json,true);
 }
 window.HoverCrafts={ready,importLibrary,disposePreview,createStatsHelp,entry:k=>entries.get(k.replace(/^custom_/,'')),list:()=>[...entries.values()],add,persist,selected,
  pointBudget:()=>policy.budget,
  profileStats:profile=>Object.entries(policy.parameters).map(([k,[lo,hi]])=>({key:k,label:labels[k],value:Math.max(0,Math.min(10,(profile[k]-lo)/(hi-lo)*policy.steps))})),
  stats:e=>Object.keys(policy.parameters).map(k=>({key:k,label:labels[k],value:e.points[k]})),
  profile:e=>profile(e),async preview(k){const e=entries.get(k.replace(/^custom_/,'')),m=await prepare(e),geometry=m.geometry.clone(),texture=m.texture.clone();texture.needsUpdate=true;geometry.computeBoundingBox();const box=geometry.boundingBox,mesh=new THREE.Mesh(geometry,new THREE.MeshPhongMaterial({map:texture,shading:THREE.SmoothShading}));mesh.position.copy(box.min.clone().add(box.max).multiplyScalar(-.5));const group=new THREE.Object3D();group.userData.customPreview=true;group.add(mesh);group.rotation.y=Math.PI+Math.PI/6;return{group,radius:box.max.clone().sub(box.min).length()/2};}};
 ready.then(()=>select.dispatchEvent(new Event('change'))).catch(()=>{});
})();
