/* Identical constraints are enforced independently by server/crafts.py. */
(function(){
 const policyReady=fetch('craft-policy.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Craft policy unavailable');return r.json();});
 const fail=message=>{throw Error(message);};
 async function validate(raw){
  const p=await policyReady;if(typeof raw!=='string'||new TextEncoder().encode(raw).length>p.maxBytes)fail('Craft file too large');
  const d=JSON.parse(raw),keys=(obj,list)=>obj&&typeof obj==='object'&&!Array.isArray(obj)&&Object.keys(obj).sort().join()===list.sort().join();
  if(!keys(d,['schema','name','points','geometry','texture'])||d.schema!==1)fail('Invalid craft schema');
  if(typeof d.name!=='string'||!d.name.trim()||d.name.length>32||/[\x00-\x1f\x7f]/.test(d.name))fail('Invalid craft name');
  if(!keys(d.points,Object.keys(p.parameters))||Object.values(d.points).some(v=>!Number.isInteger(v)||v<0||v>10)||Object.values(d.points).reduce((a,b)=>a+b,0)>p.budget)fail('Craft point budget exceeded');
  const g=d.geometry;if(!keys(g,['metadata','scale','vertices','normals','uvs','faces'])||!keys(g.metadata,['formatVersion'])||g.metadata.formatVersion!==3.1||g.scale!==1)fail('Invalid geometry schema');
  const v=g.vertices,n=g.normals,f=g.faces,uv=g.uvs?.[0];
  if(![v,n,f,g.uvs,uv].every(Array.isArray)||g.uvs.length!==1||v.length<9||v.length>p.maxVertices*3||v.length%3||n.length!==v.length||uv.length!==v.length/3*2||!f.length||f.length%10||f.length>p.maxTriangles*10)fail('Geometry complexity limit');
  for(const [a,limit]of [[v,237],[n,1.0001],[uv,1.0001]])if(a.some(x=>typeof x!=='number'||!Number.isFinite(x)||Math.abs(x)>limit))fail('Invalid geometry coordinates');
  if(uv.some(x=>x<0))fail('Invalid UV');
  for(let axis=0;axis<3;axis++){const bound=p.bounds[axis],lo=axis===1?0:-bound/2,hi=axis===1?bound:bound/2;for(let i=axis;i<v.length;i+=3)if(v[i]<lo-.001||v[i]>hi+.001)fail('Craft dimensions exceed limits');}
  for(let i=0;i<f.length;i+=10)if(f[i]!==40||f.slice(i+1,i+10).some(x=>!Number.isInteger(x)||x<0||x>=v.length/3))fail('Invalid triangle index');
  if(typeof d.texture!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(d.texture))fail('PNG texture required');
  const image=atob(d.texture.split(',')[1]);if(image.length<33||image.slice(0,8)!=='\x89PNG\r\n\x1a\n'||image.slice(12,16)!=='IHDR')fail('Invalid PNG');
  const bytes=Uint8Array.from(image,c=>c.charCodeAt(0)),view=new DataView(bytes.buffer);if(![view.getUint32(16),view.getUint32(20)].every(x=>x>=1&&x<=p.maxTexture))fail('Texture dimensions exceed limits');
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))),b=>b.toString(16).padStart(2,'0')).join('');
  return {hash,id:parseInt(hash.slice(0,12),16)+100,name:d.name,points:d.points,json:raw,data:d};
 }
 window.HoverCraftFormat={policyReady,validate};
})();
