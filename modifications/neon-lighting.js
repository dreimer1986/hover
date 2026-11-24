/* Per-arena material lighting. No changes to archived shaders or stock arenas. */
(function(){
 'use strict';
 const isNeon=map=>map.MazeId===48||map.Name==='Neon Causeway';
 // Material data generated at load time; source artwork remains unchanged.
 function mask(image){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,512,512);
  const pixels=ctx.getImageData(0,0,512,512),p=pixels.data;
  for(let i=0;i<p.length;i+=4){
   const r=p[i]/255,g=p[i+1]/255,b=p[i+2]/255;
   const neon=Math.max(Math.min(g,b)-r,Math.min(r,b)-g);
   const strength=Math.max(0,Math.min(1,(neon-.08)/.35))*Math.max(r,g,b);
   p[i]=p[i+1]=p[i+2]=Math.round(255*strength);p[i+3]=255;
  }
  ctx.putImageData(pixels,0,0);return canvas;
 }
 function install(world){
  if(!isNeon(world.map))return;
  for(const mesh of [...world.statics1,...world.statics2]){
   if(!['CUSTOM_WALL','CUSTOM_FLOOR'].includes(mesh.texture?.name)||mesh.neonLighting)continue;
   const original=mesh.FRAGMENT_SHADER;
   let source=original.replace('vec3 color = fcolor.rgb;', 'vec3 color = pow(fcolor.rgb, vec3(0.65)) * 1.08;');
   if(mesh.shaderName==='Basic'){
    source=source.replace('vec3(0.65)', 'vec3(0.78)').replace('17000.0','50000.0').replace('float fog = pow(', 'float fog = 0.45 * pow(')
     .replace('lightAmount = lightAmount * 0.75 + 0.25;', 'lightAmount = min(lightAmount * 0.35 + 0.60, 1.15);')
     .replace('1.5 * (color + vec3(0.2, 0.2, 0.2))', '0.30 * (color + vec3(0.2, 0.2, 0.2))');
   }else if(mesh.shaderName==='RetroBasic'){
    source=source.replace('lightAmount = lightAmount * 0.5 + 0.5;', 'lightAmount = lightAmount * 0.20 + 0.80;')
     .replace('vec4(lcolor + emissive, fcolor.a)', 'vec4(mix(lcolor, color * 1.15, emissive), fcolor.a)');
   }else if(mesh.shaderName==='ArmBasic'){
    source=source.replace('fcolor.rgb * clamp(0.3 + emissive, 0.3, 1.0)', 'pow(fcolor.rgb, vec3(0.78)) * 1.08 * clamp(0.70 + emissive * 0.45, 0.70, 1.15)');
   }else continue;
   mesh.FRAGMENT_SHADER=source;mesh.shaderName+='Neon';mesh.shader=mesh.getShader(mesh.gl);mesh.neonLighting=true;
  }
 }
 window.HoverNeonLighting={isNeon,mask,install};
})();
