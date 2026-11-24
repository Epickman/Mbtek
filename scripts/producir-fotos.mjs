#!/usr/bin/env node
/**
 * Rehace las fotos "producidas" (fondo de carbono + logo MBTEK) a partir de los originales
 * en public/images/productos/ y apunta src/data/fotos.json a public/images/productos-mbtek/.
 *
 * Uso:
 *   node scripts/producir-fotos.mjs            todas las fotos
 *   node scripts/producir-fotos.mjs 101010001  solo esos SKU
 */
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { producePhoto } from '../src/lib/photoStudio.mjs'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const SRC_DIR = path.join(ROOT, 'public/images/productos')
const PRO_DIR = path.join(ROOT, 'public/images/productos-mbtek')
const FOTOS = path.join(ROOT, 'src/data/fotos.json')

process.chdir(ROOT)
await mkdir(PRO_DIR, { recursive: true })
const only = new Set(process.argv.slice(2))
const fotos = JSON.parse(await readFile(FOTOS, 'utf8'))
const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith('.webp')).sort()

let ok = 0
const fails = []
for (const file of files) {
  const sku = path.basename(file, '.webp')
  if (only.size && !only.has(sku)) continue
  try {
    await writeFile(path.join(PRO_DIR, file), await producePhoto(path.join(SRC_DIR, file)))
    fotos[sku] = `/images/productos-mbtek/${file}`
    ok++
    process.stdout.write(`\r${ok} fotos producidas`)
  } catch (err) {
    fails.push(`${sku}: ${err.message}`)
  }
}

const sorted = Object.fromEntries(Object.entries(fotos).sort(([a], [b]) => a.localeCompare(b)))
await writeFile(FOTOS, JSON.stringify(sorted, null, 2) + '\n')
console.log(`\nListo: ${ok} fotos en public/images/productos-mbtek/`)
if (fails.length) console.log('Con problemas:\n  ' + fails.join('\n  '))
