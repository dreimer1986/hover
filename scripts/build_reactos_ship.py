#!/usr/bin/env python3
"""Build the rounded silver derivative as an embedded GLB (source remains untouched)."""
import argparse
import json
import math
import struct
from pathlib import Path
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--source',type=Path,default=ROOT/'models/reactos-silver/source')
p.add_argument('--output',type=Path,default=ROOT/'models/reactos-silver/ReactOS-Silver.glb')
a=p.parse_args();src=json.loads((a.source/'scene.gltf').read_text());binary=(a.source/'scene.bin').read_bytes()
def read(i):
 acc=src['accessors'][i];view=src['bufferViews'][acc['bufferView']];dt={5126:'<f4',5123:'<u2',5125:'<u4'}[acc['componentType']];size={'VEC3':3,'VEC2':2,'SCALAR':1}[acc['type']]
 return np.frombuffer(binary,dt,count=acc['count']*size,offset=view.get('byteOffset',0)+acc.get('byteOffset',0)).reshape(-1,size)
positions=read(0);faces=read(3).reshape(-1,3);uv=read(2)
tex=Image.open(a.source/'textures/Material_baseColor.png').convert('RGB')
materials=[]
for face in faces:
 u,v=uv[face].mean(0);r,g,b=tex.getpixel((min(tex.width-1,int(u*tex.width)),min(tex.height-1,int(v*tex.height))))
 materials.append(2 if b>r*1.35 and g>r*1.3 else 1 if max(r,g,b)<100 else 3 if g>r*1.4 else 0)
# Weld UV seams before one Loop subdivision; retain most original silhouette.
v,remap=np.unique(np.round(positions,5),axis=0,return_inverse=True);f=remap[faces];edges={};neighbors=[set() for _ in v]
for tri in f:
 for i in range(3):
  x,y,z=map(int,[tri[i],tri[(i+1)%3],tri[(i+2)%3]]);edges.setdefault(tuple(sorted((x,y))),[]).append(z);neighbors[x].add(y);neighbors[y].add(x)
out=[]
for i,old in enumerate(v):
 n=len(neighbors[i]);beta=3/16 if n==3 else 3/(8*n);smooth=(1-n*beta)*old+beta*v[list(neighbors[i])].sum(0);out.append(old*.45+smooth*.55)
edge_ids={}
for (x,y),other in edges.items():
 value=(v[x]+v[y])*.375+v[other].sum(0)*.125 if len(other)==2 else (v[x]+v[y])*.5
 edge_ids[(x,y)]=len(out);out.append(value)
new_faces=[];new_material=[]
for tri,mat in zip(f,materials):
 x,y,z=map(int,tri);xy=edge_ids[tuple(sorted((x,y)))];yz=edge_ids[tuple(sorted((y,z)))];zx=edge_ids[tuple(sorted((z,x)))];new_faces.extend([[x,xy,zx],[y,yz,xy],[z,zx,yz],[xy,yz,zx]]);new_material.extend([mat]*4)
# Original GLTF faces +Z. Hover forward is -Z; bake the correct orientation.
vertices=np.array(out)[:,[0,2,1]];vertices[:,0]*=-1;triangles=np.array(new_faces);normal=np.zeros_like(vertices)
for tri in triangles:
 q=vertices[tri];cross=np.cross(q[1]-q[0],q[2]-q[0]);normal[tri]+=cross
normal/=np.maximum(np.linalg.norm(normal,axis=1)[:,None],1e-9)
parts=[{'p':[],'n':[],'uv':[]} for _ in range(7)]
def triangle(points,normals,mat,uvs=None):
 part=parts[mat];part['p'].extend(points);part['n'].extend(normals);part['uv'].extend(uvs or [[.5,.5]]*3)
for tri,mat in zip(triangles,new_material):triangle(vertices[tri].tolist(),normal[tri].tolist(),mat)
def tube(cx,cy,z,rx,ry,direction,engine=False):
 # Rounded, beveled housing and recessed dark/blue opening (24-sided).
 rings=[(1.0,z-.14*direction), (1.08,z),(.80,z+.025*direction),(.73,z-.11*direction)]
 N=24
 for j in range(len(rings)-1):
  for k in range(N):
   ids=[(j,k),(j,(k+1)%N),(j+1,(k+1)%N),(j+1,k)];pts=[]
   for row,col in ids:
    radius,depth=rings[row];ang=2*math.pi*col/N;pts.append([cx+rx*radius*math.cos(ang),cy+ry*radius*math.sin(ang),depth])
   for ids2 in [[0,1,2],[0,2,3]]:
    q=np.array([pts[i] for i in ids2]);n=np.cross(q[1]-q[0],q[2]-q[0]);n/=max(np.linalg.norm(n),1e-9);triangle(q.tolist(),[n.tolist()]*3,0 if j==0 else 4 if j==1 else 1)
 for k in range(N):
  q=[[cx,cy,z-.115*direction]]+[[cx+rx*.73*math.cos(2*math.pi*i/N),cy+ry*.73*math.sin(2*math.pi*i/N),z-.115*direction] for i in [k,(k+1)%N]];triangle(q if direction>0 else q[::-1],[[0,0,direction]]*3,2 if engine else 1)
for side in [-1,1]:
 tube(side*.53,.75,1.35,.27,.40,1,True)
 tube(side*.55,.85,-1.03,.19,.21,-1)
# Project logo patches onto the rounded wing upper surface instead of floating labels.
def cross2(a,b):return a[0]*b[1]-a[1]*b[0]
def wing_height(x,z):
 hits=[]
 for tri in triangles:
  q=vertices[tri];a,b,c=q[:,[0,2]];den=cross2(b-a,c-a)
  if abs(den)<1e-9:continue
  u=cross2(np.array([x,z])-a,c-a)/den;w=cross2(b-a,np.array([x,z])-a)/den
  if u>=-.001 and w>=-.001 and u+w<=1.001:hits.append(q[0,1]+u*(q[1,1]-q[0,1])+w*(q[2,1]-q[0,1]))
 return max(hits) if hits else None
for side in [-1,1]:
 # Twelve-by-twelve decal grid follows the wing slope and avoids intersections.
 for ix in range(12):
  for iz in range(12):
   quads=[];coords=[]
   for u,w in [(ix/12,iz/12),((ix+1)/12,iz/12),((ix+1)/12,(iz+1)/12),(ix/12,(iz+1)/12)]:
    x=side*(1.12+u*.65);z=.05+w*.65;y=wing_height(x,z)
    if y is None:break
    quads.append([x,y+.025,z]);coords.append([1-u if side<0 else u,w])
   if len(quads)==4:
    for ids in ([[0,2,1],[0,3,2]] if side>0 else [[0,1,2],[0,2,3]]):triangle([quads[i] for i in ids],[[0,1,0]]*3,5,[coords[i] for i in ids])
# Official text-only wordmark projected onto both fuselage sides.
def side_x(y,z,side):
 hits=[]
 for tri in triangles:
  q=vertices[tri];a,b,c=q[:,[1,2]];den=cross2(b-a,c-a)
  if abs(den)<1e-9:continue
  u=cross2(np.array([y,z])-a,c-a)/den;w=cross2(b-a,np.array([y,z])-a)/den
  if u>=-.001 and w>=-.001 and u+w<=1.001:hits.append(q[0,0]+u*(q[1,0]-q[0,0])+w*(q[2,0]-q[0,0]))
 return (max(hits) if side>0 else min(hits)) if hits else None
for side in [-1,1]:
 for iz in range(32):
  for iy in range(8):
   pts=[];coords=[]
   for u,w in [(iz/32,iy/8),((iz+1)/32,iy/8),((iz+1)/32,(iy+1)/8),(iz/32,(iy+1)/8)]:
    z=-.3+u*.9;y=.80+w*.25;x=side_x(y,z,side)
    if x is None:break
    pts.append([x+side*.08,y,z]);coords.append([1-u if side>0 else u,1-w])
   if len(pts)==4:
    for ids in ([[0,2,1],[0,3,2]] if side>0 else [[0,1,2],[0,2,3]]):triangle([pts[i] for i in ids],[[side,0,0]]*3,6,[coords[i] for i in ids])
blob=bytearray();views=[];accessors=[]
def append(data,target=None):
 while len(blob)%4:blob.append(0)
 index=len(views);view={'buffer':0,'byteOffset':len(blob),'byteLength':len(data)}
 if target:view['target']=target
 views.append(view);blob.extend(data);return index
def acc(values,kind):
 data=np.array(values,dtype='<f4');view=append(data.tobytes(),34962);index=len(accessors);item={'bufferView':view,'componentType':5126,'count':len(values),'type':kind}
 if kind=='VEC3':item.update(min=data.min(0).tolist(),max=data.max(0).tolist())
 accessors.append(item);return index
primitives=[]
for i,part in enumerate(parts):
 if part['p']:primitives.append({'attributes':{'POSITION':acc(part['p'],'VEC3'),'NORMAL':acc(part['n'],'VEC3'),'TEXCOORD_0':acc(part['uv'],'VEC2')},'material':i})
logos=[append((ROOT/'models/reactos-silver'/name).read_bytes()) for name in ['reactos-orb.png','reactos-wordmark.png']]
colors=[[.38,.43,.50,1],[.022,.037,.055,1],[.15,.85,1,1],[.06,.18,.22,1],[.30,.36,.44,1],[1,1,1,1],[1,1,1,1]]
mats=[{'name':name,'doubleSided':True,'pbrMetallicRoughness':{'baseColorFactor':color,'metallicFactor':1 if i in (0,4) else .1,'roughnessFactor':.24 if i==0 else .4}} for i,(name,color) in enumerate(zip(['Brushed silver','Intake shadow','Ion blue','Cockpit glass','Polished rim','ReactOS wing markings','ReactOS fuselage wordmark'],colors))]
mats[2]['emissiveFactor']=[.1,.7,1];mats[5]['pbrMetallicRoughness']['baseColorTexture']={'index':0};mats[5]['alphaMode']='BLEND';mats[6]['pbrMetallicRoughness']['baseColorTexture']={'index':1};mats[6]['alphaMode']='BLEND'
gltf={'asset':{'version':'2.0','generator':'Hover archive rounded silver derivative'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':'ReactOS Silver'}],'meshes':[{'name':'ReactOS Silver','primitives':primitives}],'materials':mats,'textures':[{'source':i} for i in range(2)],'images':[{'bufferView':logo,'mimeType':'image/png'} for logo in logos],'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':accessors}
encoded=json.dumps(gltf,separators=(',',':')).encode();encoded+=b' '*((-len(encoded))%4);blob+=b'\0'*((-len(blob))%4)
a.output.parent.mkdir(parents=True,exist_ok=True);a.output.write_bytes(struct.pack('<III',0x46546c67,2,12+8+len(encoded)+8+len(blob))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(blob),0x004e4942)+blob)
print(a.output, 'triangles',sum(len(p['p'])//3 for p in parts),'bytes',a.output.stat().st_size)
