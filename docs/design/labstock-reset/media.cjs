/* eslint-disable @typescript-eslint/no-require-imports */
// Existing synthetic screenshots only. Original framing; no external artwork or generated UI.
const sharp = require('sharp');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
const pub = path.join(root, 'public/projects/labstock');
const svg = body => Buffer.from(`<svg width="1600" height="1000" xmlns="http://www.w3.org/2000/svg">${body}</svg>`);
const plans = [
  {id:'a', name:'Desktop + field entry', bg:'#e5e4df', desktop:'hari-ini', x:80,y:66,w:1200, phone:{x:1160,y:240,w:310}},
  {id:'b', name:'Graphite product studio', bg:'#252a2d', desktop:'stok', x:170,y:66,w:1160, phone:{x:1150,y:400,w:224}},
  {id:'c', name:'Reporting + requisition', bg:'#efefec', desktop:'laporan', x:330,y:70,w:1170, phone:{x:90,y:335,w:248}},
];
async function create(plan) {
  const h=Math.round(plan.w*1024/1440), phoneH=Math.round(plan.phone.w*844/390), p=plan.phone;
  // Hardware silhouette exists only to communicate desktop / handheld context, not to claim a specific device.
  const frames=svg(`<defs><filter id="s" x="-50%" y="-30%" width="200%" height="180%"><feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#141819" flood-opacity=".18"/></filter></defs>
    <path d="M0 820H1600" stroke="${plan.id==='b'?'#343a3e':'#d4d4ce'}"/>
    <g filter="url(#s)"><rect x="${plan.x-10}" y="${plan.y-10}" width="${plan.w+20}" height="${h+20}" rx="15" fill="#282d30" stroke="#6a6e6f" stroke-width="2"/>
    <path d="M${plan.x-42} ${plan.y+h+12}h${plan.w+84}l-20 15H${plan.x-22}Z" fill="#b8bab9" stroke="#969b9b"/>
    <rect x="${p.x-9}" y="${p.y-9}" width="${p.w+18}" height="${phoneH+18}" rx="28" fill="#272c2e" stroke="#757c7d" stroke-width="2"/></g>`);
  const desktop=await sharp(path.join(pub,plan.desktop+'.webp')).resize(plan.w,h).toBuffer();
  const phone=await sharp(path.join(pub,'amprah-mobile.webp')).extract({left:0,top:0,width:390,height:844}).resize(p.w,phoneH).png().toBuffer();
  const mask=Buffer.from(`<svg width="${p.w}" height="${phoneH}"><rect width="${p.w}" height="${phoneH}" rx="20" fill="white"/></svg>`);
  const rounded=await sharp(phone).composite([{input:mask,blend:'dest-in'}]).png().toBuffer();
  // Desktop first, phone frame and image last so the overlap reads as two actual surfaces.
  const phoneFrame=svg(`<defs><filter id="s"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-opacity=".25"/></filter></defs><rect x="${p.x-9}" y="${p.y-9}" width="${p.w+18}" height="${phoneH+18}" rx="28" fill="#272c2e" stroke="#757c7d" stroke-width="2" filter="url(#s)"/>`);
  const base=()=>sharp({create:{width:1600,height:1000,channels:3,background:plan.bg}}).composite([{input:frames},{input:desktop,left:plan.x,top:plan.y},{input:phoneFrame},{input:rounded,left:p.x,top:p.y}]);
  await base().webp({quality:90}).toFile(path.join(pub,`thumb-reset-${plan.id}.webp`));
  await base().jpeg({quality:93,mozjpeg:true}).toFile(path.join(pub,`thumb-reset-${plan.id}.jpg`));
}
async function main(){
  for(const plan of plans)await create(plan);
  const crops=[['phone-detail','amprah-mobile',{left:0,top:0,width:390,height:844}],['today-detail','hari-ini',{left:280,top:80,width:1136,height:888}],['request-detail','amprah',{left:280,top:80,width:1136,height:704}],['report-detail','laporan',{left:280,top:80,width:1136,height:920}]];
  for(const [dst,src,box]of crops)await sharp(path.join(pub,src+'.webp')).extract(box).webp({quality:92}).toFile(path.join(pub,dst+'.webp'));
  const entries=[['Original','thumb.webp'],['Rejected','thumb-v2.webp'],...plans.map(p=>[`${p.id.toUpperCase()} · ${p.name}`,`thumb-reset-${p.id}.webp`])];
  const parts=[];
  for(let i=0;i<entries.length;i++){const [label,file]=entries[i], x=i%2*620,y=Math.floor(i/2)*420;
    const image=await sharp(path.join(pub,file)).resize(600,375).toBuffer();
    parts.push({input:Buffer.from(`<svg width="600" height="32"><text x="0" y="22" font-family="sans-serif" font-size="16" fill="#24282c">${label.replaceAll('&','&amp;')}</text></svg>`),left:x,top:y},{input:image,left:x,top:y+36});
  }
  await sharp({create:{width:1240,height:1260,channels:3,background:'#fafaf8'}}).composite(parts).png().toFile(path.join(__dirname,'thumbnail-explorations.png'));
  fs.writeFileSync(path.join(__dirname,'media-transforms.json'),JSON.stringify({plans,crops,phoneCrop:{left:0,top:0,width:390,height:844},source:'Existing public/projects/labstock/*.webp; synthetic demo captures; no upscaling'},null,2)+'\n');
}
main().catch(e=>{console.error(e);process.exitCode=1});
