#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const pngToIco = require('png-to-ico')

const publicDir = path.join(__dirname, '..', 'public')

// Accept input file path as first argument (e.g. node scripts/generate-icons.js public/Icono.png)
const inputArg = process.argv[2]
const defaultPng = path.join(publicDir, 'Icono.png')
const fallbackSvg = path.join(publicDir, 'marranito.svg')
const srcCandidates = []
if (inputArg) srcCandidates.push(path.resolve(inputArg))
srcCandidates.push(defaultPng)
srcCandidates.push(fallbackSvg)

async function generate() {
  let src
  for (const candidate of srcCandidates) {
    if (fs.existsSync(candidate)) { src = candidate; break }
  }

  if (!src) {
    console.error('No input file found. Provide a path to Icono.png or place Icono.png in public/. Tried:', srcCandidates)
    process.exit(1)
  }

  console.log('Using source file:', src)
  if (!fs.existsSync(src)) {
    console.error('Source SVG not found at', src)
    process.exit(1)
  }

  // Sizes to generate
  const sizes = [16, 32, 48, 64, 128, 256, 192, 512]

  console.log('Generating PNGs from', src)
  for (const size of sizes) {
    const out = path.join(publicDir, `icon-${size}x${size}.png`)
    await sharp(src)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }})
      .png({ quality: 100 })
      .toFile(out)
    console.log('->', out)
  }

  // Apple touch icon (180x180)
  await sharp(src)
    .resize(180, 180, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 }})
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'))
  console.log('-> apple-touch-icon.png')

  // Favicons
  await sharp(src)
    .resize(32, 32, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 }})
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-32x32.png'))
  await sharp(src)
    .resize(16, 16, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 }})
    .png({ quality: 100 })
    .toFile(path.join(publicDir, 'favicon-16x16.png'))

  console.log('Generating icono.ico (16,32,48,64,128,256)')
  const icoSizes = [16,32,48,64,128,256]
  const buffers = await Promise.all(icoSizes.map(s => sharp(src).resize(s,s,{fit:'contain', background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer()))
  // png-to-ico sometimes exports default; handle both cases
  let icoBuffer
  try {
    icoBuffer = await pngToIco(buffers)
  } catch (e) {
    icoBuffer = await pngToIco.default(buffers)
  }
  fs.writeFileSync(path.join(publicDir, 'icono.ico'), icoBuffer)
  console.log('-> icono.ico')

  // Also generate android icons
  console.log('-> android-chrome-192x192.png')
  await sharp(src).resize(192,192,{fit:'contain', background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(publicDir,'android-chrome-192x192.png'))
  console.log('-> android-chrome-512x512.png')
  await sharp(src).resize(512,512,{fit:'contain', background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(publicDir,'android-chrome-512x512.png'))

  console.log('All icons generated in', publicDir)
}

generate().catch(err => { console.error(err); process.exit(1) })
