import type { Metadata } from 'next'
import catalogo from '@/data/catalogo.json'
import fotos from '@/data/fotos.json'
import candidatos from '@/data/candidatos-fotos.json'
import { isAdmin, isAdminConfigured } from '@/lib/adminAuth'
import { getPhotoOverrides, isBlobConfigured } from '@/services/productPhotos'
import LoginForm from './LoginForm'
import FotosAdmin, { type AdminItem } from './FotosAdmin'

export const metadata: Metadata = {
  title: 'Fotos de productos',
  robots: { index: false, follow: false },
}

type CatalogItem = { sku: string; nombre: string; marca: string; codigoProveedor: string }
type Candidates = Record<string, { q: string; urls: string[] }>

export default async function AdminFotosPage() {
  if (!isAdminConfigured() || !isBlobConfigured()) {
    return (
      <Shell>
        <p className="text-zinc-300">
          El panel no está configurado: faltan las variables ADMIN_PASSWORD o BLOB_READ_WRITE_TOKEN en Vercel.
        </p>
      </Shell>
    )
  }

  if (!(await isAdmin())) {
    return (
      <Shell>
        <LoginForm />
      </Shell>
    )
  }

  const overrides = await getPhotoOverrides()
  const repo = fotos as Record<string, string>
  const cands = candidatos as Candidates
  const items: AdminItem[] = (catalogo as CatalogItem[]).map((p) => ({
    sku: p.sku,
    name: p.nombre,
    brand: p.marca,
    code: p.codigoProveedor,
    image: p.sku in overrides ? overrides[p.sku] : (repo[p.sku] ?? null),
    changed: p.sku in overrides,
    hasOriginal: !!repo[p.sku],
    query: cands[p.sku]?.q ?? `${p.marca} ${p.nombre}`,
    candidates: cands[p.sku]?.urls ?? [],
  }))

  return (
    <Shell wide>
      <FotosAdmin items={items} />
    </Shell>
  )
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen bg-zinc-950 pt-[80px]">
      <div className={wide ? 'mx-auto max-w-screen-xl px-4 py-10' : 'mx-auto max-w-md px-4 py-16'}>{children}</div>
    </div>
  )
}
