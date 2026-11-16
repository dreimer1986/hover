"""Build local importer fixtures from preserved geometry and generated texture data."""
import base64
import json
from pathlib import Path
import struct
import zlib
ROOT=Path(__file__).resolve().parents[1]
out=Path.home()/'.cache/hover-preview/import-fixtures';out.mkdir(parents=True,exist_ok=True)
d=json.loads((ROOT/'web/assets/3d/Models/hover_a.js').read_text());v=d['vertices'];faces=d['faces'];lines=['# Fixture from preserved Hover_A geometry']
for i in range(0,len(v),3):lines.append('v '+' '.join(map(str,v[i:i+3])))
i=0
while i<len(faces):
 kind=faces[i];i+=1;n=4 if kind&1 else 3;indices=faces[i:i+n];i+=n
 if kind&2:i+=1
 if kind&4:i+=1
 if kind&8:i+=n
 if kind&16:i+=1
 if kind&32:i+=n
 if kind&64:i+=1
 if kind&128:i+=n
 lines.append('f '+' '.join(str(x+1) for x in indices))
(out/'chicago.obj').write_text('\n'.join(lines)+'\n')
def chunk(kind,data):return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data))
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',2,2,8,6,0,0,0))+chunk(b'IDAT',zlib.compress((b'\0'+b'\xff\0\0\xff'*2)*2))+chunk(b'IEND',b'')
(out/'red.png').write_bytes(png)
(out/'simple.obj').write_text('mtllib simple.mtl\nv -1 0 -1\nv 1 0 -1\nv 0 1 1\nvt 0 0\nvt 1 0\nvt 0.5 1\nusemtl Red\nf 1/1 2/2 3/3\n')
(out/'simple.mtl').write_text('newmtl Red\nKd 1 1 1\nmap_Kd red.png\n')
data=struct.pack('<15f',-1,0,-1,1,0,-1,0,1,1,0,0,1,0,.5,1)
(out/'simple.bin').write_bytes(data)
g={'asset':{'version':'2.0'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0}],'meshes':[{'primitives':[{'attributes':{'POSITION':0,'TEXCOORD_0':1},'material':0}]}],'buffers':[{'byteLength':len(data),'uri':'simple.bin'}],'bufferViews':[{'buffer':0,'byteOffset':0,'byteLength':36},{'buffer':0,'byteOffset':36,'byteLength':24}],'accessors':[{'bufferView':0,'componentType':5126,'count':3,'type':'VEC3','min':[-1,0,-1],'max':[1,1,1]},{'bufferView':1,'componentType':5126,'count':3,'type':'VEC2'}],'materials':[{'pbrMetallicRoughness':{'baseColorTexture':{'index':0}}}],'textures':[{'source':0}],'images':[{'uri':'red.png'}]}
(out/'simple.gltf').write_text(json.dumps(g));g['buffers'][0]['uri']='data:application/octet-stream;base64,'+base64.b64encode(data).decode();g['images'][0]['uri']='data:image/png;base64,'+base64.b64encode(png).decode();data=json.dumps(g).encode();data+=b' '*((-len(data))%4);(out/'simple.glb').write_bytes(struct.pack('<III',0x46546c67,2,20+len(data))+struct.pack('<II',len(data),0x4e4f534a)+data)
print(out)
