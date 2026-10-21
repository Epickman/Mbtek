import type { Metadata } from 'next'
import HeroScrub from '@/components/HeroScrub/HeroScrub'
import MostWanted from '@/components/MostWanted/MostWanted'
import ContactBanner from '@/components/ContactBanner/ContactBanner'
import FeaturedProducts from '@/components/FeaturedProducts/FeaturedProducts'
import CategoriesGrid from '@/components/CategoriesGrid/CategoriesGrid'
import OriginalParts from '@/components/OriginalParts/OriginalParts'
import Reveal from '@/components/ui/Reveal'
import siteConfig from '@/config/site'

export const metadata: Metadata = {
  title: siteConfig.seo.title,
  description: siteConfig.seo.description,
}

export default function HomePage() {
  return (
    <>
      {/* ── Intro: logo + video scrolleable + carteles ────────── */}
      <HeroScrub />

      {/* ── Categorías ────────────────────────────────────────── */}
      <CategoriesGrid />

      {/* ── Productos en stock ────────────────────────────────── */}
      <FeaturedProducts />

      {/* ── Piezas originales ─────────────────────────────────── */}
      <OriginalParts />

      {/* ── Cuatriciclos más buscados ─────────────────────────── */}
      <MostWanted />

      {/* ── ¿No lo encontraste? Pedilo por WhatsApp ───────────── */}
      <Reveal>
        <ContactBanner />
      </Reveal>

    </>
  )
}
