import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import siteConfig from '@/config/site'
import Reveal from '@/components/ui/Reveal'

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Conocé a MBTEK Parts — especialistas en repuestos y accesorios para ATV y MX en Argentina.',
}

export default function NosotrosPage() {
  const waUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent('Hola MBTEK Parts! Quiero más información.')}`

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero a pantalla completa: la foto queda detrás del header, como en el inicio */}
      <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-zinc-900 border-b border-zinc-800 px-4 pt-[112px] pb-16 text-center">
        <Image
          src="/images/cuatriarg.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[60%_62%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/30 to-zinc-950/70" aria-hidden />
        <Reveal className="relative">
          <p className="text-zinc-300 text-xs tracking-[0.3em] uppercase mb-3">MBTEK Parts</p>
          <h1 className="text-white text-4xl sm:text-7xl font-black tracking-tight uppercase leading-none">
            ENGINEERED
          </h1>
          <h1 className="text-[var(--accent)] text-4xl sm:text-7xl font-black tracking-tight uppercase leading-none">
            IN ARGENTINA.
          </h1>
        </Reveal>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 py-20 space-y-16">
        {/* About */}
        <Reveal className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-zinc-500 text-xs tracking-[0.3em] uppercase mb-4">Quiénes somos</p>
            <h2 className="text-white text-3xl font-black uppercase tracking-tight mb-6">
              ESPECIALISTAS EN<br />OFF-ROAD
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              MBTEK Parts es un emprendimiento argentino especializado en piezas, repuestos,
              componentes y accesorios para ATV, cuatriciclos, MX y vehículos off-road.
            </p>
            <p className="text-zinc-400 leading-relaxed mt-4">
              Trabajamos con los mejores fabricantes del mundo para traerte los componentes
              que tu ATV necesita, para el uso que le des.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
            <p className="text-6xl font-black text-white mb-2">ATV</p>
            <p className="text-zinc-500 text-sm tracking-wide">& MX Performance Parts</p>
          </div>
        </Reveal>

        {/* Mission */}
        <Reveal className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
          <p className="text-zinc-500 text-xs tracking-[0.3em] uppercase mb-4">Nuestra misión</p>
          <blockquote className="text-white text-2xl sm:text-4xl font-black uppercase tracking-tight">
            &ldquo;ARMÁ TU ATV
            <span className="text-[var(--accent)]"> A TU MEDIDA.&rdquo;</span>
          </blockquote>
        </Reveal>

        {/* CTA */}
        <Reveal className="text-center">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 py-4 px-8 bg-[var(--accent)] text-black font-black text-sm tracking-[0.2em] uppercase rounded-full hover:bg-[var(--accent-hover)] transition-all hover:scale-105"
          >
            <MessageCircle size={18} />
            Contactar por WhatsApp
          </a>
        </Reveal>
      </div>
    </div>
  )
}
