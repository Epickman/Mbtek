import sharp from 'sharp'
import fs from 'node:fs'
const [,, out, ...specs] = process.argv  // idx=query
const cat = JSON.parse(fs.readFileSync('src/data/catalogo.json'))
const fotos = JSON.parse(fs.readFileSync('src/data/fotos.json'))
const withPhoto = cat.filter(p => fotos[p.sku] || ['101010053','102010108'].includes(p.sku))
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'
const T = 180, N = 8, comps = [], meta = {}
for (const [r, s] of specs.entries()) {
  const [i, q] = s.split('=')
  const p = withPhoto[+i]
  const html = await (await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(q)}&form=HDRSC2`, { headers: { 'User-Agent': UA } })).text()
  const urls = [...new Set([...html.matchAll(/murl&quot;:&quot;(.+?)&quot;/g)].map(m => m[1]))].slice(0, N)
  meta[i] = { sku: p.sku, nombre: p.nombre, urls }
  comps.push({ input: Buffer.from(`<svg width="160" height="${T}"><text x="3" y="20" font-size="13" font-family="Arial">#${i}</text><text x="3" y="40" font-size="11" font-family="Arial">${p.nombre.slice(0, 22).replace(/&/g,'y')}</text></svg>`), left: 0, top: r * T })
  for (const [k, u] of urls.entries()) {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(15000) }); if (!res.ok) throw new Error(res.status)
      comps.push({ input: await sharp(Buffer.from(await res.arrayBuffer())).flatten({ background: '#fff' }).resize(T - 6, T - 6, { fit: 'contain', background: '#fff' }).toBuffer(), left: 160 + k * T + 3, top: r * T + 3 })
    } catch (e) { comps.push({ input: Buffer.from(`<svg width="${T}" height="40"><text x="10" y="30" font-size="12" fill="red">x ${String(e.message).slice(0,15)}</text></svg>`), left: 160 + k * T, top: r * T + 70 }) }
    comps.push({ input: Buffer.from(`<svg width="30" height="26"><text x="4" y="20" font-size="18" font-weight="bold" fill="blue">${k + 1}</text></svg>`), left: 160 + k * T, top: r * T })
  }
  await new Promise(r => setTimeout(r, 700))
}
await sharp({ create: { width: 160 + N * T, height: specs.length * T, channels: 3, background: '#e5e5e5' } }).composite(comps).jpeg({ quality: 80 }).toFile(out)
fs.writeFileSync(out + '.json', JSON.stringify(meta, null, 1))
