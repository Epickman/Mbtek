import Link from 'next/link'
import { getLiveProducts } from '@/services/liveProducts'
import ProductCarousel from './ProductCarousel'
import Reveal from '@/components/ui/Reveal'

// Suficientes para que una vuelta del carrusel sea más ancha que la pantalla
const SLOTS = 14

export default async function FeaturedProducts() {
  // Solo los que tienen stock en Contabilium
  const featured = (await getLiveProducts()).filter((p) => (p.stock ?? 0) > 0).slice(0, SLOTS)
  if (featured.length === 0) return null

  return (
    <section className="bg-[var(--black)] py-[clamp(56px,9vw,110px)]" aria-labelledby="featured-heading">
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Editorial header */}
        <Reveal className="mb-[clamp(30px,5vw,54px)] text-center">
          <div className="mb-eyebrow"><span>Destacados</span></div>
          <h2 id="featured-heading" className="mb-title">
            Productos <span className="accent">en stock</span>
          </h2>
        </Reveal>

      </div>

      {/* Carrusel a todo el ancho: se mueve solo, se arrastra y cada tarjeta lleva al producto */}
      <Reveal>
        <ProductCarousel products={featured} />
      </Reveal>

      <div className="max-w-screen-xl mx-auto px-4">
        <div className="mt-[clamp(30px,5vw,48px)] flex justify-center">
          <Link href="/tienda" className="mb-btn mb-btn-outline">
            Ver todos los productos
          </Link>
        </div>
      </div>
    </section>
  )
}
