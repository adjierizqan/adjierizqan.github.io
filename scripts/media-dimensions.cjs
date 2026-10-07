/* eslint-disable @typescript-eslint/no-require-imports */
const fs=require('node:fs'),sharp=require('sharp');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);}
(async()=>{const entries=[];for(const file of walk('public').filter(p=>/\.(webp|png|jpe?g)$/.test(p))){const m=await sharp(file).metadata();entries.push([file.slice(6),{width:m.width,height:m.height}]);}fs.writeFileSync('data/media-dimensions.json',JSON.stringify(Object.fromEntries(entries),null,2)+'\n');})();
