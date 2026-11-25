#!/usr/bin/env node
/**
 * Importa fotos de productos a public/images/productos/<SKU>.webp y actualiza src/data/fotos.json.
 *
 * Uso (se pueden combinar):
 *   node scripts/importar-fotos.mjs --seleccion ~/Downloads/fotos-elegidas.json
 *       Baja las fotos elegidas en la página de scripts/buscar-fotos.mjs.
 *   node scripts/importar-fotos.mjs --carpeta ~/Desktop/fotos-propias
 *       Fotos propias: cada archivo se llama como el SKU (101010001.jpg) o el código de
 *       fabricante (18P116510000.jpg). Acepta jpg, png, webp, heic, avif.
 *       Las fotos propias pisan a las bajadas.
 *
 * Cada foto se ajusta a un cuadrado de 1000 px con fondo blanco y se guarda en webp
 * (original en public/images/productos/). La tienda usa la versión sin fondo (transparente)
 * de public/images/productos-mbtek/ (ver scripts/quitar-fondo.py y src/lib/photoStudio.mjs).
 */
import { readFile, writeFile, readdir, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import sharp from 'sharp'
import { producePhoto } from '../src/lib/photoStudio.mjs'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const OUT_DIR = path.join(ROOT, 'public/images/productos')
const PRO_DIR = path.join(ROOT, 'public/images/productos-mbtek')
const FOTOS = path.join(ROOT, 'src/data/fotos.json')
const SIZE = 1000
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'

const args = process.argv.slice(2)
const opt = (name) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? path.resolve(args[i + 1].replace(/^~/, process.env.HOME)) : undefined
}
const seleccion = opt('--seleccion')
const carpeta = opt('--carpeta')
if (!seleccion && !carpeta) {
  console.error('Uso: node scripts/importar-fotos.mjs --seleccion <archivo.json> | --carpeta <carpeta>')
  process.exit(1)
}

const catalogo = JSON.parse(await readFile(path.join(ROOT, 'src/data/catalogo.json'), 'utf8'))
const key = (s) => (s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
const skuByCode = new Map()
for (const p of catalogo) {
  skuByCode.set(key(p.sku), p.sku)
  if (p.codigoProveedor && !skuByCode.has(key(p.codigoProveedor))) skuByCode.set(key(p.codigoProveedor), p.sku)
}
const fotos = existsSync(FOTOS) ? JSON.parse(await readFile(FOTOS, 'utf8')) : {}
await mkdir(OUT_DIR, { recursive: true })
await mkdir(PRO_DIR, { recursive: true })

async function save(sku, input) {
  const file = path.join(OUT_DIR, `${sku}.webp`)
  await sharp(input, { failOn: 'none' })
    .rotate()
    .flatten({ background: '#ffffff' })
    .resize(SIZE, SIZE, { fit: 'contain', background: '#ffffff', withoutEnlargement: false })
    .webp({ quality: 82 })
    .toFile(file)
  await writeFile(path.join(PRO_DIR, `${sku}.webp`), await producePhoto(file))
  fotos[sku] = `/images/productos-mbtek/${sku}.webp`
}

let ok = 0
const fails = []

if (seleccion) {
  const sel = JSON.parse(await readFile(seleccion, 'utf8'))
  for (const [sku, url] of Object.entries(sel)) {
    if (!catalogo.some((p) => p.sku === sku)) { fails.push(`${sku}: no está en el catálogo`); continue }
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'image/*' }, signal: AbortSignal.timeout(60000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await save(sku, Buffer.from(await res.arrayBuffer()))
      ok++
    } catch (err) {
      fails.push(`${sku}: no se pudo bajar (${err.message}) ${url}`)
    }
  }
}

if (carpeta) {
  for (const name of (await readdir(carpeta)).sort()) {
    const ext = path.extname(name).toLowerCase()
    if (!['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.avif'].includes(ext)) continue
    const sku = skuByCode.get(key(path.basename(name, ext)))
    if (!sku) { fails.push(`${name}: el nombre no coincide con ningún SKU ni código`); continue }
    let input = path.join(carpeta, name)
    let tmp
    try {
      if (ext === '.heic' || ext === '.heif') {
        // sharp no lee HEIC (fotos de iPhone): se convierte con sips, que viene en macOS
        tmp = path.join(tmpdir(), `mbtek-${sku}.jpg`)
        execFileSync('sips', ['-s', 'format', 'jpeg', input, '--out', tmp], { stdio: 'ignore' })
        input = tmp
      }
      await save(sku, input)
      ok++
    } catch (err) {
      fails.push(`${name}: no se pudo procesar (${err.message})`)
    } finally {
      if (tmp) await rm(tmp, { force: true })
    }
  }
}

const sorted = Object.fromEntries(Object.entries(fotos).sort(([a], [b]) => a.localeCompare(b)))
await writeFile(FOTOS, JSON.stringify(sorted, null, 2) + '\n')
console.log(`${ok} fotos importadas · ${Object.keys(sorted).length}/${catalogo.length} productos con foto`)
if (fails.length) console.log('Con problemas:\n  ' + fails.join('\n  '))
