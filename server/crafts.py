"""Strict portable craft format; values are derived from bounded point allocations."""
import base64
import hashlib
import json
import math
from pathlib import Path
import struct

POLICY_PATH = Path(__file__).with_name('craft-policy.json')
if not POLICY_PATH.exists():
    POLICY_PATH = Path(__file__).resolve().parents[1] / 'modifications/craft-policy.json'
POLICY = json.loads(POLICY_PATH.read_text())


def unique(pairs):
    obj = {}
    for key, value in pairs:
        if key in obj:
            raise ValueError('Duplicate property')
        obj[key] = value
    return obj


def validate(raw):
    if not isinstance(raw, str) or len(raw.encode()) > POLICY['maxBytes']:
        raise ValueError('Craft file too large')
    d = json.loads(raw, object_pairs_hook=unique)
    if not isinstance(d, dict) or set(d) != {'schema', 'name', 'points', 'geometry', 'texture'} or type(d['schema']) is not int or d['schema'] != 1:
        raise ValueError('Invalid craft schema')
    if not isinstance(d['name'], str) or not 1 <= len(d['name'].strip()) <= 32 or not d['name'].isprintable():
        raise ValueError('Invalid craft name')
    pts = d['points']
    if not isinstance(pts, dict) or set(pts) != set(POLICY['parameters']):
        raise ValueError('Invalid craft parameters')
    if any(type(v) is not int or not 0 <= v <= 10 for v in pts.values()) or sum(pts.values()) > POLICY['budget']:
        raise ValueError('Craft point budget exceeded')
    g = d['geometry']
    if not isinstance(g, dict) or set(g) != {'metadata', 'scale', 'vertices', 'normals', 'uvs', 'faces'} or g['metadata'] != {'formatVersion': 3.1} or isinstance(g['scale'], bool) or g['scale'] != 1:
        raise ValueError('Invalid geometry schema')
    v,n,uv,f = g['vertices'],g['normals'],g['uvs'],g['faces']
    if not all(isinstance(a,list) for a in [v,n,uv,f]) or len(uv)!=1 or not isinstance(uv[0],list):
        raise ValueError('Invalid geometry arrays')
    uv=uv[0]
    if not 9 <= len(v) <= POLICY['maxVertices']*3 or len(v)%3 or len(n)!=len(v) or len(uv)!=len(v)//3*2 or not f or len(f)%10 or len(f)>POLICY['maxTriangles']*10:
        raise ValueError('Geometry complexity limit')
    for a,limit in [(v,237),(n,1.0001),(uv,1.0001)]:
        if any(type(x) not in (int,float) or not math.isfinite(x) or abs(x)>limit for x in a):
            raise ValueError('Invalid geometry coordinates')
    if any(x<0 for x in uv): raise ValueError('Invalid UV')
    for axis,bound in enumerate(POLICY['bounds']):
        values=v[axis::3]
        lo,hi=(0,bound) if axis==1 else (-bound/2,bound/2)
        if min(values)<lo-.001 or max(values)>hi+.001: raise ValueError('Craft dimensions exceed limits')
    for i in range(0,len(f),10):
        if f[i]!=40 or any(type(x) is not int or not 0<=x<len(v)//3 for x in f[i+1:i+10]):
            raise ValueError('Invalid triangle index')
    texture=d['texture']
    if not isinstance(texture,str) or not texture.startswith('data:image/png;base64,'): raise ValueError('PNG texture required')
    try: image=base64.b64decode(texture.split(',',1)[1],validate=True)
    except Exception as e: raise ValueError('Invalid texture encoding') from e
    if len(image)<33 or image[:8]!=b'\x89PNG\r\n\x1a\n' or image[12:16]!=b'IHDR': raise ValueError('Invalid PNG')
    width,height=struct.unpack('>II',image[16:24])
    if not 1<=width<=512 or not 1<=height<=512: raise ValueError('Texture dimensions exceed limits')
    digest=hashlib.sha256(raw.encode()).hexdigest()
    ident=int(digest[:12],16)+100
    return {'hash':digest,'id':ident,'name':d['name'],'bytes':len(raw.encode()),'json':raw,'points':pts}
