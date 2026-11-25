#!/usr/bin/env node
/**
 * Busca fotos candidatas para cada producto del catálogo y arma una página para elegirlas.
 *
 * Uso:
 *   node scripts/buscar-fotos.mjs [carpeta-salida]        (por defecto ~/Desktop/fotos-mbtek)
 *   node scripts/buscar-fotos.mjs [carpeta] --todos       (incluye los que ya tienen foto)
 *
 * Genera <carpeta>/elegir-fotos.html: abrila en el navegador, tocá la foto correcta de cada
 * producto y al final "Descargar selección" (baja fotos-elegidas.json a Descargas).
 * Después: node scripts/importar-fotos.mjs --seleccion ~/Downloads/fotos-elegidas.json
 *
 * Búsqueda: primero por código de proveedor (Yamaha con formato de número de parte),
 * después por marca + nombre como respaldo. Muestra primero las fotos encontradas por código.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const args = process.argv.slice(2)
const todos = args.includes('--todos')
const outDir = path.resolve(args.find((a) => !a.startsWith('--')) ?? path.join(homedir(), 'Desktop', 'fotos-mbtek'))
const PER_PRODUCT = 4
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'

const catalogo = JSON.parse(await readFile(path.join(ROOT, 'src/data/catalogo.json'), 'utf8'))
const fotosPath = path.join(ROOT, 'src/data/fotos.json')
const fotos = existsSync(fotosPath) ? JSON.parse(await readFile(fotosPath, 'utf8')) : {}

// Número Yamaha de 12 caracteres -> formato con guiones (18P116510000 -> 18P-11651-00-00)
function yamahaCode(code) {
  const c = code.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  return c.length === 12 ? `${c.slice(0, 3)}-${c.slice(3, 8)}-${c.slice(8, 10)}-${c.slice(10)}` : c
}

// Código del proveedor limpio ("Código 520KXZx120GB-CL" -> "520KXZx120GB-CL"); '' si no tiene números
function codigo(p) {
  const c = (p.codigoProveedor ?? '').replace(/^c[oó]digo:?\s*/i, '').trim()
  return /\d/.test(c) ? c : ''
}

// Búsquedas en orden de prioridad: primero por código (número de parte), después por nombre.
function queries(p) {
  const cod = codigo(p)
  const name = p.nombre.replace(new RegExp(p.marca.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), '').trim()
  const out = []
  if (cod) out.push(p.marca === 'Yamaha' ? `yamaha ${yamahaCode(cod)}` : `${p.marca} ${cod}`)
  const porNombre = `${p.marca} ${name}${cod && !name.toUpperCase().includes(cod.toUpperCase()) ? ` ${cod}` : ''}`
  out.push(porNombre.replace(/\s+/g, ' ').trim())
  return [...new Set(out)]
}

async function search(q) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(q)}&form=HDRSC2`
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const html = await res.text()
  const urls = [...html.matchAll(/murl&quot;:&quot;(.+?)&quot;/g)].map((m) => m[1])
  return [...new Set(urls)].filter((u) => /^https?:\/\//.test(u)).slice(0, PER_PRODUCT)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
await mkdir(outDir, { recursive: true })
const results = []
const pending = catalogo.filter((p) => todos || !fotos[p.sku])
for (const [i, p] of pending.entries()) {
  const qs = queries(p)
  const q = qs[0]
  let candidatos = []
  for (const qq of qs) {
    try {
      candidatos.push(...(await search(qq)))
    } catch (err) {
      console.error(`  ${p.sku}: error buscando "${qq}" (${err.message})`)
    }
    await sleep(700)
  }
  candidatos = [...new Set(candidatos)].slice(0, PER_PRODUCT * 2)
  results.push({ sku: p.sku, nombre: p.nombre, marca: p.marca, codigo: p.codigoProveedor, q, candidatos })
  process.stdout.write(`\r${i + 1}/${pending.length} ${p.nombre.slice(0, 40).padEnd(40)}`)
}
console.log()

await writeFile(path.join(outDir, 'candidatos.json'), JSON.stringify(results, null, 2))
await writeFile(path.join(outDir, 'elegir-fotos.html'), page(results))
console.log(`${results.length} productos, ${results.filter((r) => !r.candidatos.length).length} sin resultados`)
console.log(`Abrí: ${path.join(outDir, 'elegir-fotos.html')}`)

function page(items) {
  const data = JSON.stringify(items).replace(/</g, '\\u003c')
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Elegir fotos MBTEK</title>
<style>
  :root{--bg:#0b0b0c;--card:#17171a;--line:#2a2a2e;--text:#f4f4f5;--muted:#a1a1aa;--accent:#e11d2a}
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--text);font:14px/1.4 system-ui,sans-serif}
  header{position:sticky;top:0;z-index:5;background:#0b0b0cf2;border-bottom:1px solid var(--line);padding:12px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
  header h1{font-size:16px;margin:0;flex:1} .count{color:var(--muted)}
  button{background:var(--accent);color:#fff;border:0;border-radius:999px;padding:10px 18px;font-weight:700;cursor:pointer}
  button.ghost{background:transparent;border:1px solid var(--line);color:var(--muted)}
  main{padding:16px;display:grid;gap:12px;max-width:1200px;margin:0 auto}
  .p{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px}
  .p.done{border-color:#16a34a66} .top{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;margin-bottom:8px}
  .top b{font-size:15px} .top span{color:var(--muted);font-size:12px} .top a{color:var(--muted);font-size:12px;margin-left:auto}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
  .c{aspect-ratio:1;border:2px solid var(--line);border-radius:10px;background:#fff;overflow:hidden;cursor:pointer;padding:0;display:block;width:100%}
  .c img{width:100%;height:100%;object-fit:contain} .c.sel{border-color:var(--accent);box-shadow:0 0 0 3px #e11d2a55}
  .c.broken{display:none} .none{aspect-ratio:1;border:2px dashed var(--line);border-radius:10px;background:transparent;color:var(--muted);font-weight:600}
  .none.sel{border-color:var(--muted);color:var(--text)} .url{margin-top:8px;width:100%;background:#0f0f11;border:1px solid var(--line);border-radius:8px;color:var(--text);padding:8px}
  .filter{display:flex;gap:6px} .filter button{padding:6px 12px;font-size:12px}
</style></head><body>
<header><h1>Elegí la foto de cada producto</h1><span class="count" id="count"></span>
<div class="filter"><button class="ghost" id="f-all">Todos</button><button class="ghost" id="f-pend">Pendientes</button></div>
<button id="dl">Descargar selección</button></header>
<main id="list"></main>
<script>
const items = ${data};
const KEY = 'mbtek-fotos-sel';
let sel = {}; try { sel = JSON.parse(localStorage.getItem(KEY) || '{}') } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(sel)) } catch {}; render() };
let onlyPending = false;
function render() {
  const list = document.getElementById('list'); list.innerHTML = '';
  for (const it of items) {
    const v = sel[it.sku];
    if (onlyPending && v !== undefined) continue;
    const el = document.createElement('section'); el.className = 'p' + (v !== undefined ? ' done' : '');
    const g = 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(it.q);
    el.innerHTML = '<div class="top"><b></b><span></span><a target="_blank" rel="noopener">buscar más ↗</a></div><div class="grid"></div><input class="url" placeholder="…o pegá acá la dirección de otra imagen">';
    el.querySelector('b').textContent = it.nombre;
    el.querySelector('span').textContent = it.sku + (it.marca ? ' · ' + it.marca : '') + (it.codigo ? ' · ' + it.codigo : '');
    el.querySelector('a').href = g;
    const grid = el.querySelector('.grid');
    for (const u of it.candidatos) {
      const b = document.createElement('button'); b.className = 'c' + (v === u ? ' sel' : '');
      const img = document.createElement('img'); img.loading = 'lazy'; img.referrerPolicy = 'no-referrer'; img.src = u;
      img.onerror = () => b.classList.add('broken');
      b.appendChild(img); b.onclick = () => { sel[it.sku] = u; save() }; grid.appendChild(b);
    }
    const n = document.createElement('button'); n.className = 'none' + (v === null ? ' sel' : ''); n.textContent = 'Ninguna / foto propia';
    n.onclick = () => { sel[it.sku] = null; save() }; grid.appendChild(n);
    const inp = el.querySelector('.url'); if (v && !it.candidatos.includes(v)) inp.value = v;
    inp.onchange = () => { const x = inp.value.trim(); if (/^https?:\\/\\//.test(x)) { sel[it.sku] = x; save() } };
    list.appendChild(el);
  }
  const done = items.filter(i => sel[i.sku] !== undefined).length;
  document.getElementById('count').textContent = done + ' / ' + items.length + ' revisados · ' + items.filter(i => sel[i.sku]).length + ' con foto';
}
document.getElementById('f-all').onclick = () => { onlyPending = false; render() };
document.getElementById('f-pend').onclick = () => { onlyPending = true; render() };
document.getElementById('dl').onclick = () => {
  const out = {}; for (const [k, v] of Object.entries(sel)) if (v) out[k] = v;
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }));
  a.download = 'fotos-elegidas.json'; a.click();
};
render();
</script></body></html>`
}
