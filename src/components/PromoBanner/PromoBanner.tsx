import Link from 'next/link'

const promo = {
  eyebrow: 'Temporada 2026',
  title: 'Promociones\nde la semana',
  description:
    'Descuentos en repuestos seleccionados y envíos bonificados en compras superiores a determinado monto. Consultanos por tu modelo.',
  cta: { label: 'Quiero saber más', href: '/contacto' },
}

export default function PromoBanner() {
  return (
    <section
      className="relative overflow-hidden border-y border-white/10"
      style={{ background: 'linear-gradient(120deg, #0a0a0a 0%, #0a0a0a 46%, #e2001a 46%, #a4001a 100%)' }}
      aria-labelledby="promo-heading"
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

      <div className="relative mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-6 px-6 py-[clamp(46px,7vw,74px)] max-sm:flex-col max-sm:items-start">
        <div>
          {promo.eyebrow && (
            <div className="mb-eyebrow !justify-start"><span>{promo.eyebrow}</span></div>
          )}
          <h2
            id="promo-heading"
            className="mb-3 -skew-x-8 whitespace-pre-line font-display text-[clamp(28px,5vw,46px)] uppercase leading-[1.05] tracking-[1px] text-white"
          >
            {promo.title}
          </h2>
          {promo.description && (
            <p className="m-0 max-w-[420px] whitespace-pre-line text-sm leading-relaxed tracking-[0.5px] text-white/85">
              {promo.description}
            </p>
          )}
        </div>

        <Link href={promo.cta.href} className="mb-btn mb-btn-solid">
          {promo.cta.label}
        </Link>
      </div>
    </section>
  )
}
