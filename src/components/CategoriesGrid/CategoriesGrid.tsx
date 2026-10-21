import Link from 'next/link'
import type { ReactNode } from 'react'
import Reveal from '@/components/ui/Reveal'

const icon = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" className="h-full w-full fill-none stroke-current" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

// Los que no tienen categoría propia en el catálogo llevan al catálogo completo.
const items = [
  {
    name: 'Motor',
    href: '/tienda?categoria=motor',
    svg: icon(<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M22 12h-3M5 12H2M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7L5.6 5.6" /></>),
  },
  {
    name: 'Suspensión',
    href: '/tienda?categoria=suspension',
    svg: icon(<path d="M6 3v6M6 9l6 3-6 3M6 15v6M18 3v18" />),
  },
  {
    name: 'Frenos',
    href: '/tienda?categoria=frenos',
    svg: icon(<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /></>),
  },
  {
    name: 'Transmisión',
    href: '/tienda?categoria=transmision',
    svg: icon(<><circle cx="6" cy="18" r="2.4" /><circle cx="18" cy="6" r="2.4" /><path d="M8 17L16 8M9 6h6M6 15v-6" /></>),
  },
  {
    name: 'Plásticos',
    href: '/tienda',
    svg: icon(<path d="M4 17h16M4 17c0-4 3-9 8-9s8 5 8 9M9 17v-3M15 17v-3" />),
  },
  {
    name: 'Cascos',
    href: '/tienda',
    svg: icon(<path d="M12 3c3 2 5 5 5 9a5 5 0 01-10 0c0-4 2-7 5-9z" />),
  },
  {
    name: 'Neumáticos',
    href: '/tienda?categoria=neumaticos',
    svg: icon(<><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18" /></>),
  },
  {
    name: 'Accesorios',
    href: '/tienda?categoria=accesorios',
    svg: icon(<path d="M14.7 3.3l6 6-9.3 9.3-6.7.7.7-6.7z" />),
  },
]

export default function CategoriesGrid() {
  return (
    <section className="bg-[var(--black)] py-[clamp(56px,9vw,110px)]" aria-labelledby="categories-heading">
      <div className="mx-auto max-w-[1240px] px-6">
        <Reveal className="mb-[clamp(30px,5vw,54px)] text-center">
          <div className="mb-eyebrow"><span>Encontrá lo que buscás</span></div>
          <h2 id="categories-heading" className="mb-title">Categorías</h2>
        </Reveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-[18px] lg:grid-cols-4">
          {items.map((c, i) => (
            <Reveal key={c.name} delay={(i % 4) * 0.08}>
            <Link
              href={c.href}
              className="group relative flex flex-col items-center overflow-hidden rounded-[3px] border border-white/10 bg-[#0d0d0d] px-[18px] pb-6 pt-[30px] h-full text-center text-[var(--white)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/50"
            >
              <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-300 group-hover:scale-x-100" />
              <span className="mb-4 h-[52px] w-[52px] text-[var(--accent)]">{c.svg}</span>
              <span className="text-sm font-semibold uppercase tracking-[1px]">{c.name}</span>
            </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
