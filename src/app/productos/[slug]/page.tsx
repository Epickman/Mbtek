import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Package, Tag } from 'lucide-react'
import { getLiveProducts, getLiveBySlug } from '@/services/liveProducts'
import { formatPrice, formatStock } from '@/utils/formatPrice'
import { getCategoryById } from '@/data/categories'
import ProductDetailClient from './ProductDetailClient'
import ShareButton from './ShareButton'

interface Props {
  params: Promise<{ slug: string }>
}

// Static params for build-time generation
export async function generateStaticParams() {
  return (await getLiveProducts()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getLiveBySlug(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params
  const product = await getLiveBySlug(slug)
  if (!product) notFound()

  const category = getCategoryById(product.category)

  const related = (await getLiveProducts())
    .filter((p) => p.category === product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-zinc-950 pt-[80px]">
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-zinc-500">
            <li>
              <Link href="/tienda" className="transition-colors hover:text-white">
                Tienda
              </Link>
            </li>
            {category && (
              <li className="flex items-center gap-1.5">
                <ChevronRight size={14} aria-hidden="true" />
                <Link href={`/tienda?categoria=${category.id}`} className="transition-colors hover:text-white">
                  {category.name}
                </Link>
              </li>
            )}
            <li className="flex min-w-0 items-center gap-1.5">
              <ChevronRight size={14} aria-hidden="true" />
              <span aria-current="page" className="truncate text-zinc-300">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>

        <div className="max-w-3xl">
          <div className="flex flex-col gap-6">
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                {category ? (
                  <span className="inline-block rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-zinc-300">
                    {category.name}
                  </span>
                ) : <span />}
                <ShareButton title={product.name} path={`/productos/${product.slug}`} />
              </div>
              <h1 className="text-white text-2xl sm:text-4xl font-black tracking-tight uppercase leading-tight">
                {product.name}
              </h1>
            </div>

            {/* SKU + Stock */}
            <div className="flex items-center gap-6 py-4 border-y border-zinc-800">
              <div className="flex items-center gap-2">
                <Tag size={14} className="text-zinc-500" />
                <span className="text-zinc-400 text-sm">SKU: <span className="text-white">{product.sku}</span></span>
              </div>
              {product.stock !== undefined && (
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-zinc-500" />
                  <span
                    className={
                      product.stock === 0
                        ? 'text-red-400 text-sm'
                        : product.stock <= 3
                        ? 'text-amber-400 text-sm'
                        : 'text-green-400 text-sm'
                    }
                  >
                    {formatStock(product.stock)}
                  </span>
                </div>
              )}
            </div>

            {/* Compatibility */}
            {product.vehicles.length > 0 && (
              <div>
                <p className="text-zinc-500 text-xs tracking-[0.2em] uppercase mb-2">Compatibilidad</p>
                <div className="flex flex-wrap gap-2">
                  {product.vehicles.map((v) => (
                    <span key={v} className="text-xs px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-300">
                      {v.replace(/-/g, ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div>
              <p className="text-3xl font-black text-white">{formatPrice(product.price)}</p>
            </div>

            {/* Description */}
            <p className="text-zinc-300 text-base leading-relaxed">{product.description}</p>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div>
                <p className="text-zinc-500 text-xs tracking-[0.2em] uppercase mb-3">Especificaciones</p>
                <dl className="space-y-2">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm py-2 border-b border-zinc-800">
                      <dt className="text-zinc-500">{key}</dt>
                      <dd className="text-white font-medium">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Client-side CTAs */}
            <ProductDetailClient product={product} />
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="text-white text-2xl font-black uppercase tracking-tight mb-8">
              Productos relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/productos/${p.slug}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition-all group"
                >
                  <p className="text-zinc-500 text-xs mb-1">{p.sku}</p>
                  <h3 className="text-white text-sm font-semibold group-hover:text-[var(--accent)] transition-colors">
                    {p.name}
                  </h3>
                  {p.description && <p className="mt-2 line-clamp-2 text-xs text-zinc-400">{p.description}</p>}
                  <p className="text-white font-bold text-sm mt-2">{formatPrice(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
