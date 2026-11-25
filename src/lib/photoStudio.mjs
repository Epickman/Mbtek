/**
 * Fotos de producto MBTEK sin fondo: el producto recortado (se quita el fondo blanco que
 * toca los bordes) centrado en un cuadrado transparente. Si la foto tiene fondo propio
 * (no blanco), va como una foto con esquinas redondeadas.
 * Para fondos que no son blancos, scripts/quitar-fondo.py usa un modelo de IA.
 *
 * Es .mjs para poder usarlo tanto desde scripts/ (node) como desde el servidor de Next.
 */
import sharp from 'sharp'

export const SIZE = 1000
// Margen transparente alrededor del producto
const MARGIN = 40

const isWhite = (r, g, b) => Math.min(r, g, b) >= 236 && Math.max(r, g, b) - Math.min(r, g, b) <= 20
const isPureWhite = (r, g, b) => Math.min(r, g, b) >= 247 && Math.max(r, g, b) - Math.min(r, g, b) <= 8

/** Máscara: 0 donde hay fondo blanco conectado con los bordes, 255 en el resto. */
function backgroundMask(px, w, h) {
  const mask = new Uint8Array(w * h).fill(255)
  const stack = []
  const push = (x, y) => {
    const k = y * w + x
    if (mask[k] === 0) return
    const o = k * 4
    if (!isWhite(px[o], px[o + 1], px[o + 2])) return
    mask[k] = 0
    stack.push(k)
  }
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1) }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y) }
  while (stack.length) {
    const k = stack.pop()
    const x = k % w
    const y = (k - x) / w
    if (x > 0) push(x - 1, y)
    if (x < w - 1) push(x + 1, y)
    if (y > 0) push(x, y - 1)
    if (y < h - 1) push(x, y + 1)
  }
  // Huecos encerrados (centro de un ruleman, interior o agujeros de una junta): blanco puro,
  // y grande o con forma de agujero (compacto), para no comerse letras blancas finas
  const seen = new Uint8Array(w * h)
  const bigArea = w * h * 0.006
  const holeArea = w * h * 0.0003
  for (let start = 0; start < w * h; start++) {
    if (!mask[start] || seen[start]) continue
    const o0 = start * 4
    if (!isPureWhite(px[o0], px[o0 + 1], px[o0 + 2])) continue
    const region = [start]
    seen[start] = 1
    let sum = 0
    let x0 = w, x1 = 0, y0 = h, y1 = 0
    for (let n = 0; n < region.length; n++) {
      const k = region[n]
      const o = k * 4
      sum += px[o] + px[o + 1] + px[o + 2]
      const x = k % w
      const y = (k - x) / w
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
      for (const nk of [x > 0 ? k - 1 : -1, x < w - 1 ? k + 1 : -1, k - w, k + w]) {
        if (nk < 0 || nk >= w * h || seen[nk] || !mask[nk]) continue
        const no = nk * 4
        if (!isPureWhite(px[no], px[no + 1], px[no + 2])) continue
        seen[nk] = 1
        region.push(nk)
      }
    }
    if (sum / region.length / 3 < 252) continue
    const bw = x1 - x0 + 1
    const bh = y1 - y0 + 1
    const compact = region.length / (bw * bh) > 0.6 && bw / bh > 0.6 && bw / bh < 1.7
    if (region.length >= bigArea || (region.length >= holeArea && compact)) for (const k of region) mask[k] = 0
  }
  // Achica 1 px la máscara para que no quede un halo blanco en el borde
  const eroded = new Uint8Array(mask)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const k = y * w + x
      if (mask[k] && (!mask[k - 1] || !mask[k + 1] || !mask[k - w] || !mask[k + w])) eroded[k] = 0
    }
  }
  return eroded
}

function bbox(mask, w, h) {
  let x0 = w, y0 = h, x1 = -1, y1 = -1, count = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!mask[y * w + x]) continue
      count++
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }
  if (x1 < 0) return null
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1, count }
}

/** Recorta el producto: devuelve PNG con transparencia y si es una "foto" rectangular. */
async function cutout(input) {
  const { data, info } = await sharp(input, { failOn: 'none' })
    .rotate()
    .flatten({ background: '#ffffff' })
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const mask = backgroundMask(data, w, h)
  const box = bbox(mask, w, h)
  if (!box) throw new Error('La foto está vacía')
  // Si casi todo el recuadro es opaco, es una foto con fondo propio
  const isPhoto = box.count / (box.width * box.height) > 0.96
  // Borde suave: promedio 3x3 de la máscara
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0, n = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue
          sum += mask[yy * w + xx]
          n++
        }
      }
      data[(y * w + x) * 4 + 3] = mask[y * w + x] ? sum / n : 0
    }
  }
  const img = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: box.left, top: box.top, width: box.width, height: box.height })
    .png()
    .toBuffer()
  return { img, isPhoto }
}

/** Arma la foto final de 1000x1000 en webp, con el producto recortado sobre fondo transparente. */
export async function producePhoto(input) {
  const { img, isPhoto } = await cutout(input)
  const max = SIZE - 2 * MARGIN
  let product = await sharp(img).resize(max, max, { fit: 'inside' }).png().toBuffer()
  const { width: pw, height: ph } = await sharp(product).metadata()

  // Foto con fondo propio (no blanco): no se puede recortar acá, va con esquinas redondeadas
  if (isPhoto) {
    const r = 18
    const round = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${pw}" height="${ph}"><rect width="${pw}" height="${ph}" rx="${r}" ry="${r}" fill="#fff"/></svg>`,
    )
    product = await sharp(product).composite([{ input: round, blend: 'dest-in' }]).png().toBuffer()
  }

  return sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: product, left: Math.round((SIZE - pw) / 2), top: Math.round((SIZE - ph) / 2) }])
    .webp({ quality: 88, alphaQuality: 100 })
    .toBuffer()
}
