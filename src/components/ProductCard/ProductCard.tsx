'use client'

import Link from 'next/link'
import ProductActions from './ProductActions'
import { formatPrice, formatStock } from '@/utils/formatPrice'
import { getCategoryById } from '@/data/categories'
import type { Product } from '@/types'
import { cn } from '@/utils/cn'

interface ProductCardProps {
  product: Product
  className?: string
  size?: 'default' | 'large' | 'small'
}

export default function ProductCard({ product, className, size = 'default' }: ProductCardProps) {
  const small = size === 'small'
  const category = getCategoryById(product.category)

  return (
    <article
      className={cn(
        'group relative flex flex-col bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800',
        'hover:border-zinc-600 transition-all duration-300',
        size === 'large' && 'sm:col-span-2',
        className
      )}
    >
      <Link href={`/productos/${product.slug}`} className="flex flex-1 flex-col" aria-label={`Ver ${product.name}`}>
        {/* Info */}
        <div className={cn('flex flex-col flex-1', small ? 'p-3 gap-1' : 'p-4 gap-2')}>
          {category && (
            <span
              className={cn(
                'self-start rounded-full border border-zinc-700 px-2.5 py-0.5 font-medium uppercase tracking-[0.15em] text-zinc-300',
                small ? 'mb-1 text-[0.5625rem]' : 'mb-1.5 text-[0.625rem]'
              )}
            >
              {category.name}
            </span>
          )}
          <span className={cn('tracking-[0.2em] text-zinc-500 uppercase', small ? 'text-[0.625rem]' : 'text-xs')}>{product.sku}</span>
          <h3
            className={cn(
              'text-white font-semibold leading-snug group-hover:text-[var(--accent)] transition-colors',
              small ? 'text-sm line-clamp-2' : 'text-lg'
            )}
          >
            {product.name}
          </h3>

          {product.description && (
            <p className={cn('text-zinc-400 leading-relaxed', small ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3')}>
              {product.description}
            </p>
          )}

          {/* Vehicle compatibility */}
          {product.vehicles.length > 0 && (
            <p className={cn('text-zinc-500 truncate', small ? 'text-xs' : 'text-sm')}>
              {product.vehicles.slice(0, 2).join(' · ')}
              {product.vehicles.length > 2 && ` +${product.vehicles.length - 2}`}
            </p>
          )}

          <div className={cn('flex items-center justify-between mt-auto', small ? 'pt-2' : 'pt-3')}>
            <span className={cn('text-white font-bold', small ? 'text-base' : 'text-xl')}>
              {formatPrice(product.price)}
            </span>
            {product.stock !== undefined && (
              <span
                className={cn(
                  'text-xs font-medium',
                  product.stock === 0 ? 'text-red-400' : product.stock <= 3 ? 'text-amber-400' : 'text-green-400'
                )}
              >
                {formatStock(product.stock)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <ProductActions product={product} className={small ? 'px-3 pb-3' : 'px-4 pb-4'} />
    </article>
  )
}
