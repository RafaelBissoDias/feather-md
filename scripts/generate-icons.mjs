import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'

const svg = readFileSync('./public/feathermd.svg')
mkdirSync('./public/icons', { recursive: true })

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
]

for (const { name, size } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(`./public/icons/${name}`)
  console.log(`✓ public/icons/${name}`)
}

await sharp(svg).resize(32, 32).png().toFile('./public/favicon.png')
console.log('✓ public/favicon.png')
