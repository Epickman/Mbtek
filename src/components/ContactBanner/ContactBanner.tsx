import { MessageCircle } from 'lucide-react'
import siteConfig from '@/config/site'

// Lo que se puede pedir aunque no esté en la tienda
const ITEMS = [
  'Accesorios ATV',
  'Accesorios MX',
  'Repuestos de motor',
  'Escapes',
  'Ruedas y neumáticos',
  'Frenos',
  'Suspensión',
  'Protecciones',
]

const waUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
  `Hola ${siteConfig.whatsappName}! No encontré lo que busco en la tienda. Estoy buscando: `
)}`

export default function ContactBanner() {
  return (
    <section
      className="relative overflow-hidden border-y border-white/10"
      style={{ background: 'linear-gradient(120deg, #0a0a0a 0%, #0a0a0a 46%, #e2001a 46%, #a4001a 100%)' }}
      aria-labelledby="contact-banner-heading"
    >
      {/* Textura a cuadros sutil */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            'linear-gradient(45deg, rgba(0,0,0,0.35) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.35) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.35) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.35) 75%)',
          backgroundSize: '26px 26px',
          backgroundPosition: '0 0, 0 13px, 13px -13px, -13px 0',
        }}
      />

      <div className="relative mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-8 px-6 py-[clamp(46px,7vw,74px)] max-sm:flex-col max-sm:items-start">
        <div>
          <div className="mb-eyebrow !justify-start"><span>¿No lo encontraste?</span></div>
          <h2
            id="contact-banner-heading"
            className="mb-3 -skew-x-8 font-display text-[clamp(28px,5vw,46px)] uppercase leading-[1.05] tracking-[1px] text-white"
          >
            Si no encontraste<br />lo que buscás
          </h2>
          <p className="m-0 max-w-[420px] text-sm leading-relaxed tracking-[0.5px] text-white/85">
            Contactanos por WhatsApp y te lo traemos.
          </p>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-btn mb-btn-solid mt-6 inline-flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Escribinos
          </a>
        </div>

        <ul className="flex max-w-[480px] flex-wrap gap-2" aria-label="Lo que te conseguimos">
          {ITEMS.map((item) => (
            <li
              key={item}
              className="rounded-sm border border-white/25 bg-black/45 px-3.5 py-2 text-xs font-semibold uppercase tracking-[1.5px] text-white backdrop-blur-sm"
            >
              {item}
            </li>
          ))}
          <li className="px-1 py-2 text-xs font-semibold uppercase tracking-[1.5px] text-white/70">
            y mucho más
          </li>
        </ul>
      </div>
    </section>
  )
}
