/* Data-only map packages. Reject geometry that can hang the legacy triangulator. */
(function(root){
 'use strict';
 const limits={bytes:16*1024*1024,walls:2048,floors:1024,stored:8,extent:50000};
 function validate(input){
  const text=typeof input==='string'?input:JSON.stringify(input);if(new TextEncoder().encode(text).length>limits.bytes)throw Error('Map exceeds 16 MiB');
  const raw=JSON.parse(text);if(raw.format!=='hover-map'||raw.version!==1)throw Error('Expected a hover-map version 1 package');
  const label=(s,max)=>{if(typeof s!=='string'||!s.trim()||s.length>max||/[\x00-\x1f]/.test(s))throw Error('Invalid map text');return s.trim();};
  const n=v=>{if(typeof v!=='number'||!Number.isFinite(v)||Math.abs(v)>limits.extent)throw Error('Map coordinate outside limits');return v;};
  const point=p=>({X:n(p.X),Y:n(p.Y),Z:n(p.Z)}),team=p=>{if(!['RED','BLUE'].includes(p.Team))throw Error('Unknown team');return {...point(p),Team:p.Team};};
  const array=(v,min,max)=>{if(!Array.isArray(v)||v.length<min||v.length>max)throw Error('Invalid map object count');return v;};
  const assets={};for(const key of ['wall','floor','sky']){const data=raw.assets?.[key];if(typeof data!=='string'||data.length>8*1024*1024||!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(data))throw Error('Map textures must be embedded PNG/JPEG images');assets[key]=data;}
  const m=raw.maze;
  const Walls=array(m.Walls,4,limits.walls).map(w=>{const A=point(w.A),B=point(w.B);if(A.Y>=B.Y||Math.hypot(A.X-B.X,A.Z-B.Z)<1)throw Error('Invalid wall');if(w.Step&&B.Y-A.Y>64)throw Error('Step risers must be at most 64 units high');return {A,B,Step:w.Step===true,Texture:'CUSTOM_WALL',DoubleSided:true,Scale:1,UOff:0,VOff:0,DecalMode:false};});
  const footprints=new Set();for(const w of Walls){const ends=[w.A.X+','+w.A.Z,w.B.X+','+w.B.Z].sort().join(':');if(footprints.has(ends))throw Error('Combine vertically stacked walls with the same footprint');footprints.add(ends);}
  const cross=(a,b,c)=>(b.X-a.X)*(c.Z-b.Z)-(b.Z-a.Z)*(c.X-b.X);
  const Floors=array(m.Floors,1,limits.floors).map(f=>{
   const Points=array(f.Points,4,17).map(point),vertices=Points.slice(0,-1),first=Points[0],last=Points.at(-1);
   if(first.X!==last.X||first.Z!==last.Z||Points.some(p=>p.Y!==first.Y))throw Error('Floors must be closed, flat polygons');
   if(new Set(vertices.map(p=>p.X+','+p.Z)).size!==vertices.length)throw Error('Duplicate floor vertices');
   const turns=vertices.map((p,i)=>cross(p,vertices[(i+1)%vertices.length],vertices[(i+2)%vertices.length])).filter(v=>Math.abs(v)>1e-6);
   if(!turns.length||turns.some(v=>Math.sign(v)!==Math.sign(turns[0])))throw Error('Use convex floor polygons');
   for(let i=0;i<vertices.length;i++)for(let j=i+2;j<vertices.length;j++){if(i===0&&j===vertices.length-1)continue;const a=vertices[i],b=vertices[(i+1)%vertices.length],c=vertices[j],d=vertices[(j+1)%vertices.length];if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)throw Error('Self-intersecting floor');}
   return {Texture:'CUSTOM_FLOOR',Points};
  });
  const Spawns=array(m.Spawns,7,32).map(team),Flags=array(m.Flags,12,48).map(team),Pods=array(m.Pods,0,128).map(point),Beacons=array(m.Beacons,8,256).map(point);
  if(Spawns.filter(p=>p.Team==='RED').length<1||Spawns.filter(p=>p.Team==='BLUE').length<6||['RED','BLUE'].some(t=>Flags.filter(p=>p.Team===t).length<6))throw Error('Need one red/six blue spawns and six flags per team');
  function onFloor(p){return Floors.some(f=>{if(p.Y<f.Points[0].Y||p.Y>f.Points[0].Y+256)return false;const sides=f.Points.slice(0,-1).map((v,i)=>cross(v,f.Points[i+1],p)).filter(x=>Math.abs(x)>1e-6);return !sides.length||sides.every(x=>Math.sign(x)===Math.sign(sides[0]));});}
  if([...Spawns,...Flags,...Pods,...Beacons].some(p=>!onFloor(p)))throw Error('Spawn, flag, pickup or beacon has no supporting floor');
  const points=Floors.flatMap(f=>f.Points).concat(Walls.flatMap(w=>[w.A,w.B]));const bounds={minX:Math.min(...points.map(p=>p.X)),maxX:Math.max(...points.map(p=>p.X)),minZ:Math.min(...points.map(p=>p.Z)),maxZ:Math.max(...points.map(p=>p.Z))};
  if(bounds.maxX-bounds.minX>limits.extent||bounds.maxZ-bounds.minZ>limits.extent)throw Error('Map span exceeds 50,000 units');
  return {format:'hover-map',version:1,name:label(raw.name,60),author:label(raw.author||'Unknown',100),description:label(raw.description||raw.name,500),assets,maze:{Name:raw.name,Scheme:'Maze1',Order:0,Walls,Floors,Spawns,Flags,Pods,Beacons},bounds};
 }
 const api={limits,validate};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HoverMapFormat=api;
})(typeof window==='undefined'?globalThis:window);
