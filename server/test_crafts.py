import base64
import copy
import json
import struct
import unittest
import zlib
from server.crafts import validate, POLICY


def fixture():
    def chunk(kind,data): return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data))
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',1,1,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(b'\0\xff\0\0\xff'))+chunk(b'IEND',b'')
    return dict(schema=1,name='Test craft',points={k:0 for k in POLICY['parameters']},geometry=dict(metadata={'formatVersion':3.1},scale=1,vertices=[-10,0,-10,10,0,-10,0,10,10],normals=[0,1,0]*3,uvs=[[0,0,1,0,.5,1]],faces=[40,0,1,2,0,1,2,0,1,2]),texture='data:image/png;base64,'+base64.b64encode(png).decode())


class CraftValidationTests(unittest.TestCase):
    def test_valid_hash_and_deterministic_id(self):
        raw=json.dumps(fixture());a=validate(raw);b=validate(raw)
        self.assertEqual(a['hash'],b['hash']);self.assertEqual(a['id'],b['id']);self.assertLess(a['id'],2**53)

    def test_untrusted_packages(self):
        edits=[lambda d:d.update(mass=0),lambda d:d.update(points={k:10 for k in POLICY['parameters']}),lambda d:d['points'].update(maxSpeed=-1),lambda d:d['points'].update(maxSpeed=True),lambda d:d['geometry']['vertices'].__setitem__(0,float('nan')),lambda d:d['geometry']['vertices'].__setitem__(0,999),lambda d:d['geometry']['faces'].__setitem__(1,999),lambda d:d['geometry'].update(scale=0),lambda d:d['geometry'].update(scale=True),lambda d:d.update(texture='https://example.com/texture.png'),lambda d:d['geometry'].update(faces=d['geometry']['faces']*4097)]
        for edit in edits:
            d=copy.deepcopy(fixture());edit(d)
            with self.subTest(edit=edit), self.assertRaises(ValueError):validate(json.dumps(d))
        raw=json.dumps(fixture()).replace('"schema": 1','"schema": 1, "schema": 1')
        with self.assertRaises(ValueError):validate(raw)
