import sharp from 'sharp'
import fs from 'node:fs'
const [,, out, ...specs] = process.argv   // spec: idx or idx:Letter
const cat = JSON.parse(fs.readFileSync('src/data/catalogo.json'))
const fotos = JSON.parse(fs.readFileSync('src/data/fotos.json'))
const sel = JSON.parse(fs.readFileSync(process.env.HOME + '/Downloads/fotos-elegidas.json'))
const cands = JSON.parse(fs.readFileSync(process.env.HOME + '/Desktop/fotos-mbtek/candidatos.json'))
const withPhoto = cat.filter(p => fotos[p.sku])
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'
const T = 400, comps = []
let grid = '<svg width="400" height="400">'
for (let k = 1; k < 10; k++) grid += `<line x1="${k*40}" y1="0" x2="${k*40}" y2="400" stroke="${k==5?'#f00':'#0af'}" stroke-width="1" opacity="0.7"/><line y1="${k*40}" x1="0" y2="${k*40}" x2="400" stroke="${k==5?'#f00':'#0af'}" stroke-width="1" opacity="0.7"/><text x="${k*40+2}" y="12" font-size="10" fill="#f0f">${k}</text><text y="${k*40-2}" x="2" font-size="10" fill="#f0f">${k}</text>`
grid += '</svg>'
const meta = []
for (const [n, s] of specs.entries()) {
  const [i, L] = s.split(':'); const p = withPhoto[+i]
  let buf
  if (L) { const c = cands.find(x => x.sku === p.sku); const urls = c.candidatos.filter(u => u !== sel[p.sku]); const u = urls[L.charCodeAt(0) - 65]
    const res = await fetch(u, { headers: { 'User-Agent': UA } }); buf = Buffer.from(await res.arrayBuffer()); meta.push({ s, sku: p.sku, url: u }) }
  else { buf = fs.readFileSync('public' + fotos[p.sku]); meta.push({ s, sku: p.sku, url: 'current' }) }
  const img = await sharp(buf).flatten({ background: '#fff' }).resize(T, T, { fit: 'fill' }).toBuffer()
  const x = (n % 4) * (T + 10), y = Math.floor(n / 4) * (T + 30)
  comps.push({ input: img, left: x, top: y + 25 }, { input: Buffer.from(grid), left: x, top: y + 25 },
    { input: Buffer.from(`<svg width="400" height="25"><text x="2" y="18" font-size="16" font-family="Arial">#${s} ${p.nombre.slice(0, 30).replace(/&/g,'y')}</text></svg>`), left: x, top: y })
}
await sharp({ create: { width: 4 * (T + 10), height: Math.ceil(specs.length / 4) * (T + 30), channels: 3, background: '#ddd' } }).composite(comps).jpeg({ quality: 82 }).toFile(out)
fs.writeFileSync(out + '.json', JSON.stringify(meta, null, 1))
