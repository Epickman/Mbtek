import { BadgeCheck, MessageCircle, ShieldCheck, Wrench } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import siteConfig from '@/config/site'

const brands = [
  { name: 'Honda', src: '/brands/honda.svg' },
  { name: 'Yamaha', src: '/brands/yamaha.svg' },
  { name: 'Suzuki', src: '/brands/suzuki.svg' },
  { name: 'Kawasaki', src: '/brands/kawasaki.svg' },
]

const points = [
  {
    icon: ShieldCheck,
    title: 'Calidad de fábrica',
    text: 'La misma pieza que trae tu vehículo de origen, con la durabilidad que corresponde.',
  },
  {
    icon: Wrench,
    title: 'Encastre exacto',
    text: 'Sin adaptaciones ni sorpresas: va directo a tu cuatri o moto cross.',
  },
  {
    icon: BadgeCheck,
    title: 'Te la conseguimos',
    text: 'Si no está en la tienda, la buscamos por vos. Pasanos el modelo y el año.',
  },
]

const waUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
  `Hola ${siteConfig.whatsappName}! Estoy buscando una pieza original para mi vehículo: `
)}`

export default function OriginalParts() {
  return (
    <section
      className="relative overflow-hidden border-t border-white/10 bg-[#070707] py-[clamp(56px,9vw,110px)]"
      aria-labelledby="original-parts-heading"
    >
      {/* Brillo rojo de fondo */}
      <div
        className="pointer-events-none absolute -right-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 px-6 lg:grid-cols-[1.15fr_1fr]">
        <Reveal>
          <div className="mb-eyebrow !justify-start"><span>Repuestos originales</span></div>
          <h2 id="original-parts-heading" className="mb-title mb-5">
            Conseguimos piezas <span className="accent">originales</span>
          </h2>
          <p className="mb-8 max-w-[520px] text-sm leading-relaxed tracking-[0.5px] text-zinc-400">
            Trabajamos con repuestos originales de las principales marcas para que tu máquina rinda
            como el primer día.
          </p>

          <ul className="mb-9 grid gap-5">
            {points.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[var(--accent)]/40 bg-[var(--accent)]/10 text-[var(--accent)]">
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[1px] text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-500">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-btn mb-btn-solid inline-flex items-center gap-2"
          >
            <MessageCircle size={16} />
            Pedí tu pieza original
          </a>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="relative rounded-[3px] border border-white/10 bg-[#0d0d0d] p-8 sm:p-10">
            <span className="absolute inset-x-0 top-0 h-[3px] bg-[var(--accent)]" />

            <div className="mb-8 flex items-center gap-4">
              <ShieldCheck size={56} strokeWidth={1.4} className="shrink-0 text-[var(--accent)]" />
              <div>
                <p className="-skew-x-8 font-display text-[clamp(30px,4.5vw,44px)] uppercase leading-none text-white">
                  Original
                </p>
                <p className="mt-1 text-xs uppercase tracking-[2px] text-zinc-500">De fábrica, para tu modelo</p>
              </div>
            </div>

            <p className="mb-4 text-xs uppercase tracking-[2px] text-zinc-500">Marcas</p>
            <ul className="grid grid-cols-2 gap-3" aria-label="Marcas de repuestos originales">
              {brands.map((b) => (
                <li
                  key={b.name}
                  className="flex h-16 items-center justify-center rounded-sm border border-white/10 bg-black/40 px-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.src} alt={b.name} className="h-6 w-auto max-w-[110px] object-contain" />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
