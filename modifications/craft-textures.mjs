/* Bounded software texture decoding, independent of mobile GPU compression support. */
import * as T from './vendor/three/three.module.js';
import {TGALoader} from './vendor/three/TGALoader.js';
import {DDSLoader} from './vendor/three/DDSLoader.js';
function dimensions(w,h){if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>4096||h>4096)throw Error('Texture dimensions must be 1–4096 pixels');}
export function decodeDDS(buffer){
 if(buffer.byteLength<128)throw Error('Truncated DDS header');const header=new DataView(buffer),w=header.getUint32(16,true),h=header.getUint32(12,true);dimensions(w,h);
 if(header.getUint32(112,true)!==0)throw Error('DDS cubemaps/volume textures are not supported');
 const d=new DDSLoader().parse(buffer,false),m=d.mipmaps[0];if(!m)throw Error('Unsupported DDS: use DXT1, DXT3, DXT5 or 32-bit BGRA');
 if(d.format===T.RGBAFormat)return {width:w,height:h,data:new Uint8ClampedArray(m.data)};
 const dxt1=d.format===T.RGB_S3TC_DXT1_Format,dxt3=d.format===T.RGBA_S3TC_DXT3_Format,dxt5=d.format===T.RGBA_S3TC_DXT5_Format;
 if(!dxt1&&!dxt3&&!dxt5)throw Error('Unsupported DDS compression: use DXT1/DXT3/DXT5');
 const src=new DataView(m.data.buffer,m.data.byteOffset,m.data.byteLength),out=new Uint8ClampedArray(w*h*4),stride=dxt1?8:16;
 const color=v=>[Math.round(((v>>11)&31)*255/31),Math.round(((v>>5)&63)*255/63),Math.round((v&31)*255/31),255];
 let offset=0;
 for(let by=0;by<h;by+=4)for(let bx=0;bx<w;bx+=4,offset+=stride){
  if(offset+stride>src.byteLength)throw Error('Truncated DDS block');
  const start=offset+(dxt1?0:8),c0=src.getUint16(start,true),c1=src.getUint16(start+2,true),colors=[color(c0),color(c1)];
  if(c0>c1||!dxt1){colors.push(colors[0].map((v,i)=>i===3?255:Math.round((2*v+colors[1][i])/3)),colors[0].map((v,i)=>i===3?255:Math.round((v+2*colors[1][i])/3)));}
  else colors.push(colors[0].map((v,i)=>i===3?255:Math.round((v+colors[1][i])/2)),[0,0,0,0]);
  const codes=src.getUint32(start+4,true),alphas=[];let alphaBits=0;
  if(dxt5){alphas.push(src.getUint8(offset),src.getUint8(offset+1));if(alphas[0]>alphas[1])for(let i=1;i<=6;i++)alphas.push(((7-i)*alphas[0]+i*alphas[1])/7);else{for(let i=1;i<=4;i++)alphas.push(((5-i)*alphas[0]+i*alphas[1])/5);alphas.push(0,255);}for(let i=0;i<6;i++)alphaBits+=src.getUint8(offset+2+i)*2**(8*i);}
  for(let pixel=0;pixel<16;pixel++){const x=bx+pixel%4,y=by+Math.floor(pixel/4);if(x>=w||y>=h)continue;const rgba=colors[(codes>>>(2*pixel))&3],dest=(y*w+x)*4;out.set(rgba,dest);if(dxt3)out[dest+3]=((src.getUint8(offset+Math.floor(pixel/2))>>(pixel%2*4))&15)*17;if(dxt5)out[dest+3]=Math.round(alphas[Math.floor(alphaBits/2**(3*pixel))%8]);}
 }
 return {width:w,height:h,data:out};
}
export function decodeRaster(buffer,extension){
 let image;if(extension==='dds')image=decodeDDS(buffer);else{if(buffer.byteLength<18)throw Error('Truncated TGA header');const h=new DataView(buffer),w=h.getUint16(12,true),height=h.getUint16(14,true);dimensions(w,height);
  const type=h.getUint8(2),depth=h.getUint8(16),bytes=depth/8;if(![1,2,3,9,10,11].includes(type)||![8,16,24,32].includes(depth))throw Error('Unsupported TGA type');
  let offset=18+h.getUint8(0)+h.getUint16(5,true)*Math.ceil(h.getUint8(7)/8),pixels=0;
  if(type<9){if(offset+w*height*bytes>buffer.byteLength)throw Error('Truncated TGA pixels');}
  else while(pixels<w*height){if(offset>=buffer.byteLength)throw Error('Truncated TGA RLE');const packet=h.getUint8(offset++),count=(packet&127)+1;pixels+=count;offset+=(packet&128)?bytes:count*bytes;if(pixels>w*height||offset>buffer.byteLength)throw Error('Invalid TGA RLE packet');}
  image=new TGALoader().parse(buffer);}
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(image.data),image.width,image.height),0,0);return canvas;
}
export class RasterTextureLoader extends T.Loader{
 constructor(manager,extension){super(manager);this.extension=extension;}
 load(url,onLoad,onProgress,onError){
  const resolved=this.manager.resolveURL((this.path||'')+(url||'')),texture=new T.Texture();this.manager.itemStart(resolved);
  fetch(resolved).then(r=>{if(!r.ok)throw Error('Texture unavailable');return r.arrayBuffer();}).then(b=>{texture.image=decodeRaster(b,this.extension);texture.needsUpdate=true;onLoad?.(texture);}).catch(e=>{onError?.(e);this.manager.itemError(resolved);}).finally(()=>this.manager.itemEnd(resolved));return texture;
 }
}
