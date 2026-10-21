'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/utils/cn'

const panels = [
  {
    id: 'atv',
    label: 'ATV',
    subtitle: 'Cuatriciclos',
    description: 'Repuestos y accesorios para toda la gama de ATV. Yamaha, Honda, Can-Am, Polaris y más.',
    href: '/tienda?tipo=atv',
    gradient: 'from-amber-900/60 via-stone-900/40 to-zinc-950',
  },
  {
    id: 'mx',
    label: 'MX',
    subtitle: 'Motocross',
    description: 'Componentes de alto rendimiento para competición y uso recreativo en pista.',
    href: '/tienda?tipo=mx',
    gradient: 'from-orange-900/60 via-zinc-800/40 to-zinc-950',
  },
]

export default function ATVMXSplit() {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <section
      className="h-[50vh] sm:h-[60vh] flex overflow-hidden"
      aria-label="Categorías ATV y MX"
    >
      {panels.map((panel) => {
        const isActive = hovered === panel.id
        const isInactive = hovered !== null && !isActive

        return (
          <Link
            key={panel.id}
            href={panel.href}
            className={cn(
              'relative flex-1 transition-all duration-500 overflow-hidden',
              'flex items-center justify-center',
              isActive ? 'flex-[1.6]' : isInactive ? 'flex-[0.6]' : 'flex-1',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]'
            )}
            onMouseEnter={() => setHovered(panel.id)}
            onMouseLeave={() => setHovered(null)}
            aria-label={`Ver ${panel.label} — ${panel.subtitle}`}
          >
            {/* Background gradient */}
            <div
              className={cn(
                'absolute inset-0 bg-gradient-to-br',
                panel.gradient,
                'transition-opacity duration-300',
                isActive ? 'opacity-100' : 'opacity-70'
              )}
            />

            {/* Content */}
            <div className="relative z-10 text-center px-6">
              <span
                className={cn(
                  'block text-white transition-all duration-500',
                  'font-black uppercase tracking-tight leading-none',
                  'text-6xl sm:text-8xl lg:text-[10rem]'
                )}
              >
                {panel.label}
              </span>
              <span
                className={cn(
                  'block text-zinc-400 text-xs sm:text-sm tracking-[0.3em] uppercase mt-2 transition-all duration-300',
                  isActive ? 'opacity-100' : 'opacity-0'
                )}
              >
                {panel.subtitle}
              </span>
              <p
                className={cn(
                  'text-zinc-300 text-sm mt-4 max-w-xs mx-auto leading-relaxed transition-all duration-300',
                  isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                )}
              >
                {panel.description}
              </p>
            </div>

            {/* Vertical separator */}
            {panel.id === 'atv' && (
              <div className="absolute right-0 top-0 bottom-0 w-px bg-zinc-800/50" aria-hidden="true" />
            )}
          </Link>
        )
      })}
    </section>
  )
}
