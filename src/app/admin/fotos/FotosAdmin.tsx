'use client'
/* eslint-disable @next/next/no-img-element -- las opciones son imágenes de otros sitios: se muestran tal cual, sin optimizar */

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { Search, Upload, Trash2, RotateCcw, X, ExternalLink, LogOut, Check, ImageOff, Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import {
  choosePhotoFromUrl,
  uploadPhoto,
  removePhotoAction,
  resetPhotoAction,
  logoutAction,
  type PhotoResult,
} from './actions'

export interface AdminItem {
  sku: string
  name: string
  brand: string
  code: string
  image: string | null
  changed: boolean
  hasOriginal: boolean
  query: string
  candidates: string[]
}

type Filter = 'all' | 'missing' | 'changed'

export default function FotosAdmin({ items: initial }: { items: AdminItem[] }) {
  const [items, setItems] = useState(initial)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [openSku, setOpenSku] = useState<string | null>(null)

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((i) => {
      if (filter === 'missing' && i.image) return false
      if (filter === 'changed' && !i.changed) return false
      return !q || [i.name, i.sku, i.brand, i.code].some((v) => v.toLowerCase().includes(q))
    })
  }, [items, search, filter])

  const missing = items.filter((i) => !i.image).length
  const open = items.find((i) => i.sku === openSku) ?? null

  const applyResult = (sku: string, result: PhotoResult, changed: boolean) => {
    if (!result.ok) return result.error
    setItems((list) => list.map((i) => (i.sku === sku ? { ...i, image: result.image, changed } : i)))
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">Fotos de productos</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Tocá un producto para cambiar su foto. Los cambios se ven en la tienda en unos segundos.
          </p>
        </div>
        <form action={logoutAction}>
          <button className="flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:text-white">
            <LogOut size={14} /> Salir
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, SKU, marca o código"
            className="w-full rounded-full border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-zinc-600"
          />
        </div>
        <div className="flex gap-2">
          {([
            ['all', `Todos (${items.length})`],
            ['missing', `Sin foto (${missing})`],
            ['changed', 'Cambiadas'],
          ] as [Filter, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                'whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors',
                filter === value ? 'border-[var(--accent)] text-white' : 'border-zinc-800 text-zinc-400 hover:text-white'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {visible.map((item) => (
          <button
            key={item.sku}
            onClick={() => setOpenSku(item.sku)}
            className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 text-left transition-colors hover:border-zinc-600"
          >
            <Thumb src={item.image} alt={item.name} />
            <div className="space-y-0.5 p-3">
              <p className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-[var(--accent)]">
                {item.name}
              </p>
              <p className="text-xs text-zinc-500">
                {item.sku}
                {item.changed && <span className="ml-2 text-green-400">· cambiada</span>}
              </p>
            </div>
          </button>
        ))}
      </div>
      {visible.length === 0 && <p className="py-12 text-center text-zinc-500">No hay productos con ese filtro.</p>}

      {open && (
        <PhotoEditor
          key={open.sku}
          item={open}
          onClose={() => setOpenSku(null)}
          onResult={(result, changed) => applyResult(open.sku, result, changed)}
        />
      )}
    </div>
  )
}

function Thumb({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  return (
    <div className={cn('flex aspect-square items-center justify-center', src ? 'bg-white' : 'bg-zinc-800/60', className)}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-contain" />
      ) : (
        <ImageOff size={28} className="text-zinc-600" />
      )}
    </div>
  )
}

function PhotoEditor({
  item,
  onClose,
  onResult,
}: {
  item: AdminItem
  onClose: () => void
  onResult: (result: PhotoResult, changed: boolean) => string | null
}) {
  const [pending, startTransition] = useTransition()
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pasted, setPasted] = useState('')
  const [broken, setBroken] = useState<Set<string>>(new Set())
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const act = (key: string, changed: boolean, fn: () => Promise<PhotoResult>) => {
    setError(null)
    setSaved(false)
    setBusyKey(key)
    startTransition(async () => {
      const err = onResult(await fn(), changed)
      setBusyKey(null)
      if (err) setError(err)
      else setSaved(true)
    })
  }

  const onFile = (file: File | undefined) => {
    if (!file) return
    act('upload', true, async () => {
      const form = new FormData()
      form.set('sku', item.sku)
      form.set('file', await shrink(file))
      return uploadPhoto(form)
    })
  }

  const candidates = item.candidates.filter((u) => !broken.has(u))
  const googleUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(item.query)}`

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Foto de ${item.name}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-zinc-800 bg-zinc-950 sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-zinc-800 bg-zinc-950 p-4">
          <div>
            <h2 className="text-lg font-black uppercase leading-tight text-white">{item.name}</h2>
            <p className="text-xs text-zinc-500">
              SKU {item.sku}
              {item.brand && ` · ${item.brand}`}
              {item.code && ` · ${item.code}`}
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative w-full overflow-hidden rounded-xl border border-zinc-800 sm:w-56">
              <Thumb src={item.image} alt={item.name} />
              {busyKey && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Foto actual</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  onFile(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
              <button
                disabled={pending}
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
              >
                <Upload size={16} /> Subir foto propia
              </button>
              <div className="flex flex-wrap gap-2">
                {item.image && (
                  <button
                    disabled={pending}
                    onClick={() => act('remove', true, () => removePhotoAction(item.sku))}
                    className="flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:text-white disabled:opacity-60"
                  >
                    <Trash2 size={14} /> Quitar foto
                  </button>
                )}
                {item.changed && (
                  <button
                    disabled={pending}
                    onClick={() => act('reset', false, () => resetPhotoAction(item.sku))}
                    className="flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:text-white disabled:opacity-60"
                  >
                    <RotateCcw size={14} /> {item.hasOriginal ? 'Volver a la original' : 'Deshacer cambios'}
                  </button>
                )}
              </div>
              <div aria-live="polite" className="min-h-5 text-sm">
                {error && <p className="text-red-400">{error}</p>}
                {saved && !error && (
                  <p className="flex items-center gap-1.5 text-green-400">
                    <Check size={14} /> Guardado
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Opciones encontradas</p>
              <a
                href={googleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
              >
                Buscar más en Google <ExternalLink size={12} />
              </a>
            </div>
            {candidates.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {candidates.map((url) => (
                  <button
                    key={url}
                    disabled={pending}
                    onClick={() => act(url, true, () => choosePhotoFromUrl(item.sku, url))}
                    className="relative overflow-hidden rounded-lg border-2 border-zinc-800 bg-white transition-colors hover:border-[var(--accent)] disabled:opacity-60"
                  >
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() => setBroken((s) => new Set(s).add(url))}
                      className="aspect-square w-full object-contain"
                    />
                    {busyKey === url && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="animate-spin text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No hay opciones guardadas para este producto.</p>
            )}
            <p className="text-xs text-zinc-500">
              Antes de elegir, fijate que el código coincida: hay repuestos casi iguales con otro número. Evitá
              fotos con marcas de agua o datos de otros negocios.
            </p>
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const url = pasted.trim()
              if (url) act('paste', true, () => choosePhotoFromUrl(item.sku, url))
            }}
          >
            <input
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              placeholder="…o pegá la dirección de una imagen"
              className="min-w-0 flex-1 rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-600"
            />
            <button
              disabled={pending || !pasted.trim()}
              className="rounded-full border border-zinc-700 px-4 py-2.5 text-sm text-zinc-200 hover:text-white disabled:opacity-50"
            >
              {busyKey === 'paste' ? <Loader2 size={16} className="animate-spin" /> : 'Usar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

/** Achica la foto en el navegador (las del celular pesan varios MB) antes de subirla. */
async function shrink(file: File, max = 1600): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.88))
    return blob ? new File([blob], 'foto.jpg', { type: 'image/jpeg' }) : file
  } catch {
    // El navegador no pudo leerla (ej. HEIC en la compu): se manda tal cual
    return file
  }
}
