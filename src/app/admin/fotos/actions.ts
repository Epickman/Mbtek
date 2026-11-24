'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import catalogo from '@/data/catalogo.json'
import fotos from '@/data/fotos.json'
import { logIn, logOut, requireAdmin } from '@/lib/adminAuth'
import { setPhoto, removePhoto, resetPhoto } from '@/services/productPhotos'

export type PhotoResult = { ok: true; image: string | null } | { ok: false; error: string }

const MAX_BYTES = 10 * 1024 * 1024
const skus = new Set((catalogo as { sku: string }[]).map((p) => p.sku))

function checkSku(sku: unknown): string {
  if (typeof sku !== 'string' || !skus.has(sku)) throw new Error('Producto inexistente')
  return sku
}

// La tienda, el inicio y las fichas muestran la foto nueva en la próxima visita
function refreshSite() {
  revalidatePath('/', 'layout')
}

async function run(fn: () => Promise<string | null>): Promise<PhotoResult> {
  try {
    await requireAdmin()
    const image = await fn()
    refreshSite()
    return { ok: true, image }
  } catch (err) {
    console.error('[Panel fotos]', err)
    return { ok: false, error: err instanceof Error ? err.message : 'No se pudo guardar' }
  }
}

export async function loginAction(_prev: string | null, form: FormData): Promise<string | null> {
  const ok = await logIn(String(form.get('password') ?? ''))
  if (!ok) return 'Contraseña incorrecta'
  redirect('/admin/fotos')
}

export async function logoutAction() {
  await logOut()
  redirect('/admin/fotos')
}

/** Usa una imagen de internet (una de las opciones encontradas o una dirección pegada). */
export async function choosePhotoFromUrl(skuInput: string, url: string): Promise<PhotoResult> {
  return run(async () => {
    const sku = checkSku(skuInput)
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      throw new Error('La dirección no es válida')
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('La dirección no es válida')

    const res = await fetch(parsed, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MBTEK-fotos)', Accept: 'image/*' },
      signal: AbortSignal.timeout(20000),
    }).catch(() => null)
    if (!res?.ok) throw new Error('Esa página no deja bajar la imagen. Probá con otra o subila desde tu equipo.')
    if (!(res.headers.get('content-type') ?? '').startsWith('image/')) throw new Error('La dirección no es de una imagen')
    const data = Buffer.from(await res.arrayBuffer())
    if (data.length > MAX_BYTES) throw new Error('La imagen es demasiado grande')
    return setPhoto(sku, data)
  })
}

/** Foto propia subida desde la compu o el celular. */
export async function uploadPhoto(form: FormData): Promise<PhotoResult> {
  return run(async () => {
    const sku = checkSku(form.get('sku'))
    const file = form.get('file')
    if (!(file instanceof File) || file.size === 0) throw new Error('Elegí una imagen')
    if (file.size > MAX_BYTES) throw new Error('La imagen es demasiado grande')
    return setPhoto(sku, Buffer.from(await file.arrayBuffer()))
  })
}

export async function removePhotoAction(sku: string): Promise<PhotoResult> {
  return run(async () => {
    await removePhoto(checkSku(sku))
    return null
  })
}

export async function resetPhotoAction(skuInput: string): Promise<PhotoResult> {
  return run(async () => {
    const sku = checkSku(skuInput)
    await resetPhoto(sku)
    return (fotos as Record<string, string>)[sku] ?? null
  })
}
