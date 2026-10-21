import type { Metadata } from 'next'
import { MessageCircle, Mail } from 'lucide-react'
import { InstagramIcon } from '@/components/ui/icons'
import siteConfig from '@/config/site'
import Reveal from '@/components/ui/Reveal'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contactá a MBTEK Parts por WhatsApp, Instagram o email.',
}

export default function ContactoPage() {
  const waUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent('Hola MBTEK Parts! Quiero consultar sobre un producto.')}`

  return (
    <div className="min-h-screen bg-zinc-950 pt-[80px]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-zinc-900 border-b border-zinc-800 py-20 px-4 text-center">
        {/* Background photo — semi-transparent so the text stays readable */}
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url('/images/taller.jpeg')" }}
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-zinc-950/40 via-transparent to-zinc-950/70" />

        <Reveal className="relative">
          <h1 className="text-white text-4xl sm:text-6xl font-black tracking-tight uppercase">
            ¿LISTO PARA ARMAR
          </h1>
          <h1 className="text-[var(--accent)] text-4xl sm:text-6xl font-black tracking-tight uppercase">
            TU ATV?
          </h1>
        </Reveal>
      </div>

      <div className="max-w-screen-md mx-auto px-4 py-20 space-y-6">
        {/* WhatsApp */}
        <Reveal delay={0.1}>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-5 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-[var(--accent)] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
              <MessageCircle size={22} />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm group-hover:text-[var(--accent)] transition-colors">
                WhatsApp
              </p>
              <p className="text-zinc-500 text-sm">
                La forma más rápida de contactarnos
              </p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-zinc-600 group-hover:text-[var(--accent)] transition-colors">
              <path d="M3 8h10M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

        </Reveal>

        {/* Instagram */}
        <Reveal delay={0.2}>
          <a
            href={`https://www.instagram.com/${siteConfig.instagram}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-5 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
              <InstagramIcon size={22} />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Instagram</p>
              <p className="text-zinc-500 text-sm">@{siteConfig.instagram}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-zinc-600">
              <path d="M3 8h10M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

        </Reveal>

        {/* Email */}
        {siteConfig.email && (
          <Reveal delay={0.3}>
            <a
              href={`mailto:${siteConfig.email}`}
              className="flex items-center gap-5 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Mail size={22} />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Email</p>
                <p className="text-zinc-500 text-sm">{siteConfig.email}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-zinc-600">
                <path d="M3 8h10M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </Reveal>
        )}
      </div>
    </div>
  )
}
