/* Deterministic composition of existing public demo evidence. No generated UI. */
/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');
const path = require('node:path');
const root = path.resolve(__dirname, '../../..');
async function main() {
  const input = path.join(root, 'public/projects/labstock/hari-ini.webp');
  // Keep the title and complete five-item action list; omit navigation and activity columns.
  const crop = await sharp(input).extract({ left: 288, top: 94, width: 784, height: 554 }).toBuffer();
  const compose = () => sharp({ create: { width: 960, height: 600, channels: 3, background: '#eef0f2' } })
    .composite([{ input: crop, left: 88, top: 23 }]);
  await compose().webp({ quality: 88 }).toFile(path.join(root, 'public/projects/labstock/thumb-v2.webp'));
  await compose().jpeg({ quality: 92, mozjpeg: true }).toFile(path.join(root, 'public/projects/labstock/thumb-v2.jpg'));
  const old = await sharp(path.join(root, 'public/projects/labstock/thumb.webp')).resize(480, 300).toBuffer();
  const candidate = await compose().png().toBuffer();
  const next = await sharp(candidate).resize(480, 300).toBuffer();
  const labels = Buffer.from('<svg width="984" height="36"><style>text{font:14px sans-serif;fill:#24282c}</style><text x="0" y="24">OLD · device composition</text><text x="504" y="24">NEW · existing product evidence</text></svg>');
  await sharp({ create: { width: 984, height: 348, channels: 3, background: '#ffffff' } })
    .composite([{ input: labels, left: 0, top: 0 }, { input: old, left: 0, top: 48 }, { input: next, left: 504, top: 48 }])
    .png().toFile(path.join(__dirname, 'thumbnail-comparison.png'));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
