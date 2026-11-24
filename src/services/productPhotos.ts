import 'server-only'
import { cache } from 'react'
import { list, put, del } from '@vercel/blob'
import sharp from 'sharp'
import { producePhoto } from '@/lib/photoStudio.mjs'

/**
 * Fotos elegidas desde el panel /admin/fotos, guardadas en Vercel Blob.
 * El estado sale de los nombres de archivo (list() siempre está al día; un archivo que se
 * pisa puede quedar cacheado hasta un minuto en la CDN):
 * - productos/<SKU>/<fecha>.webp  → la foto vigente es la más nueva
 * - productos/<SKU>/<fecha>.none  → el cliente quitó la foto
 * - sin archivos para un SKU      → se usa la foto del repo (src/data/fotos.json)
 */

const PREFIX = 'productos/'
const SIZE = 1000

export type PhotoOverrides = Record<string, string | null>

type Entry = { url: string; pathname: string; time: number; removed: boolean }

export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN
}

async function readEntries(): Promise<Map<string, Entry[]>> {
  const bySku = new Map<string, Entry[]>()
  if (!isBlobConfigured()) return bySku
  let cursor: string | undefined
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 })
    for (const b of page.blobs) {
      const m = b.pathname.match(/^productos\/([^/]+)\/(\d+)\.(webp|none)$/)
      if (!m) continue
      const entries = bySku.get(m[1]) ?? []
      entries.push({ url: b.url, pathname: b.pathname, time: Number(m[2]), removed: m[3] === 'none' })
      bySku.set(m[1], entries)
    }
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
  for (const entries of bySku.values()) entries.sort((a, b) => b.time - a.time)
  return bySku
}

/** Fotos del panel. Si Blob falla, la tienda sigue con las fotos del repo. */
export const getPhotoOverrides = cache(async (): Promise<PhotoOverrides> => {
  try {
    const overrides: PhotoOverrides = {}
    for (const [sku, [latest]] of await readEntries()) overrides[sku] = latest.removed ? null : latest.url
    return overrides
  } catch (err) {
    console.error('[Fotos] No se pudieron leer las fotos del panel:', err instanceof Error ? err.message : err)
    return {}
  }
})

/** Cuadrado de 1000 px con fondo de carbono y logo MBTEK, webp (igual que scripts/importar-fotos.mjs). */
async function normalize(input: Buffer): Promise<Buffer> {
  try {
    const white = await sharp(input, { failOn: 'none' })
      .rotate()
      .flatten({ background: '#ffffff' })
      .resize(SIZE, SIZE, { fit: 'contain', background: '#ffffff' })
      .png()
      .toBuffer()
    return await producePhoto(white)
  } catch {
    throw new Error('No se pudo leer la imagen. Probá con una foto JPG o PNG.')
  }
}

/** Borra los archivos anteriores del producto (todos, o todos menos el recién creado). */
async function clearOlder(sku: string, keep?: string) {
  const entries = (await readEntries()).get(sku) ?? []
  const old = entries.filter((e) => e.pathname !== keep).map((e) => e.url)
  if (old.length) await del(old).catch(() => {})
}

export async function setPhoto(sku: string, image: Buffer): Promise<string> {
  const data = await normalize(image)
  const pathname = `${PREFIX}${sku}/${Date.now()}.webp`
  const { url } = await put(pathname, data, { access: 'public', addRandomSuffix: false, contentType: 'image/webp' })
  await clearOlder(sku, pathname)
  return url
}

export async function removePhoto(sku: string): Promise<void> {
  const pathname = `${PREFIX}${sku}/${Date.now()}.none`
  await put(pathname, 'quitada', { access: 'public', addRandomSuffix: false, contentType: 'text/plain' })
  await clearOlder(sku, pathname)
}

/** Vuelve a la foto original del repo (o a ninguna si no había). */
export async function resetPhoto(sku: string): Promise<void> {
  await clearOlder(sku)
}
