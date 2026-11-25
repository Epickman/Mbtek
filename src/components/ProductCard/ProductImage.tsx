import Image from 'next/image'
import type { Product } from '@/types'
import { cn } from '@/utils/cn'

interface ProductImageProps {
  product: Product
  sizes: string
  className?: string
  preload?: boolean
}

/** Foto cuadrada del producto sobre fondo blanco; sin foto, un recuadro con el logo de MBTEK. */
export default function ProductImage({ product, sizes, className, preload }: ProductImageProps) {
  return (
    <div className={cn('relative aspect-square w-full overflow-hidden', product.image ? 'bg-white' : 'bg-zinc-800/60', className)}>
      {product.image ? (
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          preload={preload}
          className="object-contain transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <Image
          src="/brand/mbtek-logo.png"
          alt=""
          fill
          sizes="120px"
          className="object-contain p-[30%] opacity-15 grayscale"
        />
      )}
    </div>
  )
}
