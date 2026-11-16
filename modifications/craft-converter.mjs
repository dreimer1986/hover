import * as T from './vendor/three/three.module.js';
import {OBJLoader} from './vendor/three/OBJLoader.js';
import {MTLLoader} from './vendor/three/MTLLoader.js';
import {GLTFLoader} from './vendor/three/GLTFLoader.js';
import {FBXLoader} from './vendor/three/FBXLoader.js';
import {RasterTextureLoader} from './craft-textures.mjs';
export async function convert(files,options,policy){
 files=Array.from(files);if(!files.length||files.reduce((s,f)=>s+f.size,0)>24*1024*1024)throw Error('Select at most 24 MiB of local model and texture files');
 if(files.some(f=>/\.max$/i.test(f.name))&&!files.some(f=>/\.(obj|fbx|gltf|glb)$/i.test(f.name)))throw Error('MAX requires an export from 3ds Max to FBX, OBJ or GLTF');
 const models=files.filter(f=>/\.(obj|fbx|gltf|glb)$/i.test(f.name)),chosen=options.model?models.find(f=>f.name===options.model):models.length===1?models[0]:null;if(!chosen)throw Error('Choose one OBJ, FBX, GLTF or GLB as the main model');
 const main=chosen,lookup=new Map(),urls=[];for(const f of files){if(lookup.has(f.name))throw Error('Resource filenames must be unique');lookup.set(f.name,f);}
 const manager=new T.LoadingManager();let loading=false,finish,failed=[];const loaded=new Promise(r=>finish=r);
 manager.onStart=()=>{loading=true;};manager.onLoad=()=>finish();manager.onError=url=>failed.push(url);
 manager.setURLModifier(url=>{
  if(url.startsWith('blob:'))return url;
  if(url.startsWith('data:')){if(url.length>24*1024*1024||!/^data:(image\/(png|jpeg|webp|bmp|tga)|application\/(octet-stream|gltf-buffer));base64,/.test(url))throw Error('Unsupported embedded resource');return url;}
  const name=decodeURIComponent(url.replace(/\\/g,'/').split('/').pop());const matches=files.filter(f=>f.name.toLowerCase()===name.toLowerCase()),file=lookup.get(name)||(matches.length===1?matches[0]:null);if(!file)throw Error((matches.length>1?'Ambiguous local resource: ':'Missing local resource: ')+name);
  const object=URL.createObjectURL(file);urls.push(object);return object;
 });
 manager.addHandler(/\.tga$/i,new RasterTextureLoader(manager,'tga'));manager.addHandler(/\.dds$/i,new RasterTextureLoader(manager,'dds'));
 let root;const extraTextures=[];
 try{
  if(/\.obj$/i.test(main.name)){
   const loader=new OBJLoader(manager),mtl=files.filter(f=>/\.mtl$/i.test(f.name));if(mtl.length>1)throw Error('Select one MTL file');
   if(mtl.length){const materials=new MTLLoader(manager).parse(await mtl[0].text(),'');materials.preload();loader.setMaterials(materials);}
   root=loader.parse(await main.text());
  }else if(/\.fbx$/i.test(main.name)){root=new FBXLoader(manager).parse(await main.arrayBuffer(),'');if(root.animations?.length)throw Error('Animated FBX is not supported; export a static mesh');
  }else{
   const raw=/\.glb$/i.test(main.name)?await main.arrayBuffer():await main.text();
   const gltf=await new GLTFLoader(manager).parseAsync(raw,'');if(gltf.animations.length)throw Error('Animated models are not supported; export a static mesh');root=gltf.scene;
  }
  if(loading)await loaded;if(failed.length)throw Error('A texture or buffer could not be loaded');
  const rotation=new T.Group();rotation.add(root);if(options.up==='z')root.rotation.x-=Math.PI/2;rotation.rotation.y=Number(options.rotation)*Math.PI/180;rotation.updateMatrixWorld(true);
  const meshes=[],materials=[];let triangles=0;
  root.traverse(node=>{
   if(node.isSkinnedMesh||node.isInstancedMesh||node.morphTargetInfluences?.length)throw Error('Skinning, instances and morph targets must be applied before export');
   if(!node.isMesh)return;const g=node.geometry,pos=g.getAttribute('position');if(!pos)throw Error('Mesh has no positions');
   const count=g.index?g.index.count:pos.count;if(count%3)throw Error('Only triangles are supported');triangles+=count/3;
   if(triangles>policy.maxTriangles||meshes.length>=64)throw Error('Model exceeds '+policy.maxTriangles+' triangles or 64 meshes ('+triangles+' triangles counted); simplify before import');
   const mats=Array.isArray(node.material)?node.material:[node.material];for(const m of mats)if(!materials.includes(m))materials.push(m);
   meshes.push({node,g,count,mats});
  });
  if(!triangles||materials.length>policy.maxMaterials)throw Error('Empty model or too many materials');
  const textureFiles=files.filter(f=>/\.(png|jpe?g|webp|bmp|tga|dds)$/i.test(f.name));
  const suggestions=textureFiles.filter(f=>/(albedo|base.?color|diffuse|(^|[_. -])diff([_. -]|$)|_c\.)/i.test(f.name));
  const assignments=options.onMaterials?.(materials.map((m,i)=>({index:i,name:m.name||'Material '+(i+1),hasMap:!!m.map})),textureFiles.map(f=>f.name))||options.materialTextures||{};
  for(let i=0;i<materials.length;i++){
   const m=materials[i],choice=assignments[i];if(choice==='__none__'){m.map=null;continue;}
   const name=choice||(!m.map&&suggestions.length===1?suggestions[0].name:null);if(!name)continue;
   if(!lookup.has(name))throw Error('Selected colour texture is missing: '+name);
   const loader=manager.getHandler(name)||new T.TextureLoader(manager);
   const texture=await new Promise((resolve,reject)=>loader.load(name,resolve,undefined,reject));extraTextures.push(texture);texture.colorSpace=T.SRGBColorSpace;
   // Explicit assignments use the model's UV convention, not the source image extension.
   texture.flipY=m.map?.flipY??!(/\.(gltf|glb)$/i.test(main.name));m.map=texture;m.color.set(0xffffff);
  }
  const bounds=new T.Box3().setFromObject(rotation),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
  if(![size.x,size.y,size.z].every(Number.isFinite)||size.length()<1e-6)throw Error('Invalid model bounds');
  const factor=Math.min(...policy.bounds.map((b,i)=>size.getComponent(i)>1e-8?b/size.getComponent(i):Infinity))*Number(options.size)/100;
  const atlas=document.createElement('canvas');atlas.width=atlas.height=512;const ctx=atlas.getContext('2d'),columns=Math.ceil(Math.sqrt(materials.length)),cell=Math.floor(512/columns),pad=2;
  for(let i=0;i<materials.length;i++){
   const m=materials[i],x=i%columns*cell,y=Math.floor(i/columns)*cell;
   ctx.fillStyle=m.color?.getStyle(T.SRGBColorSpace)||'#ffffff';ctx.fillRect(x,y,cell,cell);
   if(m.map){
    const image=m.map.image;if(!image||!image.width||!image.height||Math.max(image.width,image.height)>4096)throw Error('Texture missing or larger than 4096 pixels');
    ctx.save();ctx.drawImage(image,x+pad,y+pad,cell-2*pad,cell-2*pad);ctx.globalCompositeOperation='multiply';ctx.fillStyle=m.color?.getStyle(T.SRGBColorSpace)||'#ffffff';ctx.fillRect(x+pad,y+pad,cell-2*pad,cell-2*pad);ctx.restore();
   }
  }
  const vertices=[],normals=[],uvs=[],faces=[],dedup=new Map(),round=x=>Math.round(x*1e5)/1e5;
  for(const {node,g,count,mats}of meshes){
   const geom=g.clone();geom.applyMatrix4(node.matrixWorld);if(!geom.attributes.normal)geom.computeVertexNormals();
   const pos=geom.attributes.position,norm=geom.attributes.normal,uv=geom.attributes.uv,reverse=node.matrixWorld.determinant()<0;
   for(let i=0;i<count;i+=3){
    const group=g.groups.find(group=>i>=group.start&&i<group.start+group.count),material=mats[group?.materialIndex||0],mi=materials.indexOf(material),ids=[];
    for(const offset of (reverse?[0,2,1]:[0,1,2])){
     const idx=g.index?g.index.getX(i+offset):i+offset;
     const v=new T.Vector3().fromBufferAttribute(pos,idx);v.x=(v.x-center.x)*factor;v.y=(v.y-bounds.min.y)*factor;v.z=(v.z-center.z)*factor;
     const n=new T.Vector3().fromBufferAttribute(norm,idx).normalize(),tex=uv?new T.Vector2().fromBufferAttribute(uv,idx):new T.Vector2(.5,.5);
     if(material.map){material.map.updateMatrix();tex.applyMatrix3(material.map.matrix);if(tex.x<-.001||tex.x>1.001||tex.y<-.001||tex.y>1.001)throw Error('Repeated/out-of-range UVs must be baked to 0–1 in Blender');}
     tex.clampScalar(0,1);const u=(mi%columns*cell+pad+tex.x*(cell-2*pad))/512;
     const tv=material.map?.flipY===false?tex.y:1-tex.y,vv=1-(Math.floor(mi/columns)*cell+pad+tv*(cell-2*pad))/512;
     const values=[v.x,v.y,v.z,n.x,n.y,n.z,u,vv].map(round);if(values.some(x=>!Number.isFinite(x)))throw Error('Invalid model coordinates');
     const key=values.join(',');let id=dedup.get(key);if(id===undefined){id=vertices.length/3;if(id>=policy.maxVertices)throw Error('Too many vertices; simplify in Blender');dedup.set(key,id);vertices.push(...values.slice(0,3));normals.push(...values.slice(3,6));uvs.push(...values.slice(6));}ids.push(id);
    }
    faces.push(40,...ids,...ids,...ids);
   }
   geom.dispose();
  }
  return {schema:1,name:options.name,points:options.points,geometry:{metadata:{formatVersion:3.1},scale:1,vertices,normals,uvs:[uvs],faces},texture:atlas.toDataURL('image/png')};
 }finally{for(const texture of extraTextures)texture.dispose();for(const u of urls)URL.revokeObjectURL(u);if(root)root.traverse(o=>{if(o.geometry)o.geometry.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material])){m?.map?.dispose();m?.dispose();}});}
}
