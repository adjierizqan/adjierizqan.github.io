/* eslint-disable @typescript-eslint/no-require-imports */
const sharp=require('sharp');const fs=require('node:fs');
const root='public/projects/';
async function save(buf,slug){await sharp(buf).webp({quality:88}).toFile(root+slug+'/cover-final.webp');await sharp(buf).jpeg({quality:91}).toFile(root+slug+'/cover-final.jpg');}
(async()=>{
 // SuhuLog keeps the existing, already verified phone/desktop composition.
 await save(await sharp(root+'suhulog/device-story.webp').resize(1280,800).toBuffer(),'suhulog');
 // BDRS product surface and genuine mobile viewport; originals retain all synthetic labels.
 const desktop=await sharp(root+'bdrs/workstation.webp').resize({width:1000}).toBuffer();
 const phone=await sharp(root+'bdrs/mobile.webp').resize({width:240}).toBuffer();
 await save(await sharp({create:{width:1280,height:800,channels:3,background:'#e9e7e5'}}).composite([{input:desktop,left:30,top:6},{input:phone,left:1000,top:190}]).png().toBuffer(),'bdrs');
 // Same image coordinates on each side, no annotations fabricated.
 const left=await sharp(root+'tomato-ripeness/research/real1-yolov11.webp').resize(640,800,{fit:"cover",position:"centre"}).toBuffer();
 const right=await sharp(root+'tomato-ripeness/research/real1-combine4.webp').resize(640,800,{fit:"cover",position:"centre"}).toBuffer();
 await save(await sharp({create:{width:1280,height:800,channels:3,background:'#222'}}).composite([{input:left,left:0,top:0},{input:right,left:640,top:0}]).png().toBuffer(),'tomato-ripeness');
 // Genuine licensed output frame and native 3D render; contain preserves operational overlays.
 await save(await sharp(root+'padel-vision/real/pexels-analyzed-poster.webp').resize(1280,800,{fit:'contain',background:'#182425'}).toBuffer(),'padel-vision');
 await save(await sharp(root+'porsche-3d/cinematic/01-rwb964-hero.webp').resize(1280,800,{fit:'cover',position:'centre'}).toBuffer(),'porsche-3d');
 const names=['labstock','suhulog','tomato-ripeness','bdrs','padel-vision','porsche-3d'];const parts=[];
 for(let i=0;i<names.length;i++){const name=names[i];parts.push({input:await sharp(root+name+(i===0?'/thumb-reset-a.webp':'/cover-final.webp')).resize(480,300).toBuffer(),left:i%2*500,top:Math.floor(i/2)*340+30});parts.push({input:Buffer.from(`<svg width="480" height="26"><text x="0" y="20" font-family="sans-serif" font-size="16">${name}</text></svg>`),left:i%2*500,top:Math.floor(i/2)*340});}
 await sharp({create:{width:1000,height:1020,channels:3,background:'#fafaf8'}}).composite(parts).png().toFile('docs/release/thumbnails.png');
 fs.writeFileSync('docs/release/media-provenance.json',JSON.stringify({sources:names.map(name=>({project:name,source:name==='labstock'?'approved thumb-reset-a':name==='suhulog'?'existing device-story':name==='bdrs'?'synthetic workstation + mobile':name==='tomato-ripeness'?'real1 baseline + WBF, Kolforn CC BY-SA 4.0':name==='padel-vision'?'Pexels UsaOne Ell analyzed poster':'own Three.js capture, Ddiaz Design models'})),transform:'Sharp, no UI generation. Existing evidence only. 1280x800 WebP/JPEG. Source crop/downsample only; LabStock unchanged.'},null,2));
})();
