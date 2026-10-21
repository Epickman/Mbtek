'use client'

import { useEffect, useRef } from 'react'

// Las marcas sin `src` se muestran como texto hasta que tengamos su logo en /public/brands.
const brands: { name: string; src?: string }[] = [
  { name: 'Honda', src: '/brands/honda.svg' },
  { name: 'Yamaha', src: '/brands/yamaha.svg' },
  { name: 'Suzuki', src: '/brands/suzuki.svg' },
  { name: 'Kawasaki', src: '/brands/kawasaki.svg' },
  { name: 'Alpinestars', src: '/brands/alpinestars.svg' },
  { name: 'Fox', src: '/brands/fox.svg' },
  { name: 'Airoh', src: '/brands/airoh.png' },
  { name: 'Leatt', src: '/brands/leatt.png' },
  { name: 'Atlas', src: '/brands/atlas.png' },
  { name: 'Oggio' },
  { name: '100%', src: '/brands/100percent.svg' },
  { name: 'Bell', src: '/brands/bell.svg' },
  { name: 'Troy Lee Designs', src: '/brands/troy-lee-designs.png' },
  { name: 'SJ Racing' },
  { name: 'Maxxis', src: '/brands/maxxis.svg' },
  { name: 'CP Carrillo', src: '/brands/cp-carrillo.png' },
  { name: 'Del West' },
  { name: 'Hiflo Filtro', src: '/brands/hiflofiltro.png' },
  { name: 'Maxima Racing Oil', src: '/brands/maxima.png' },
  { name: 'JT Sprockets', src: '/brands/jt-sprockets.png' },
  { name: 'Hinson', src: '/brands/hinson.png' },
  { name: 'Pivot Works' },
  { name: 'Works Connection', src: '/brands/works-connection.svg' },
  { name: 'Precision Racing', src: '/brands/precision.png' },
  { name: 'Renthal', src: '/brands/renthal.png' },
  { name: 'RPM', src: '/brands/rpm.png' },
]

// Cada mitad del carril tiene que ser más ancha que la pantalla para que el loop no se corte.
const half = Array.from({ length: Math.ceil(20 / brands.length) }, () => brands).flat()
const track = [...half, ...half]

// Velocidad del desplazamiento automático (px por segundo)
const AUTO_SPEED = 40

export default function TopBrandBar() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // Marquesina manejada por JS: avanza sola y se puede arrastrar con el mouse (o el dedo).
  useEffect(() => {
    const viewport = viewportRef.current
    const trackEl = trackRef.current
    if (!viewport || !trackEl) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let offset = 0
    let hovering = false
    let drag: { pointerId: number; startX: number; startOffset: number } | null = null
    let last = performance.now()
    let raf = 0

    // Mantiene el offset dentro de una mitad del carril, así el loop es infinito
    const wrap = (x: number) => {
      const halfWidth = trackEl.scrollWidth / 2
      if (!halfWidth) return x
      return ((x % halfWidth) + halfWidth) % halfWidth
    }
    const render = () => {
      trackEl.style.transform = `translate3d(${-offset}px, 0, 0)`
    }

    const tick = (now: number) => {
      const dt = Math.min(now - last, 100) / 1000
      last = now
      if (!drag && !hovering && !reduceMotion) {
        offset = wrap(offset + AUTO_SPEED * dt)
        render()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      drag = { pointerId: e.pointerId, startX: e.clientX, startOffset: offset }
      viewport.setPointerCapture(e.pointerId)
      viewport.style.cursor = 'grabbing'
      e.preventDefault()
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointerId) return
      offset = wrap(drag.startOffset - (e.clientX - drag.startX))
      render()
    }
    const endDrag = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointerId) return
      drag = null
      viewport.style.cursor = ''
    }
    const onEnter = () => { hovering = true }
    const onLeave = () => { hovering = false }

    viewport.addEventListener('pointerdown', onPointerDown)
    viewport.addEventListener('pointermove', onPointerMove)
    viewport.addEventListener('pointerup', endDrag)
    viewport.addEventListener('pointercancel', endDrag)
    viewport.addEventListener('mouseenter', onEnter)
    viewport.addEventListener('mouseleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      viewport.removeEventListener('pointerdown', onPointerDown)
      viewport.removeEventListener('pointermove', onPointerMove)
      viewport.removeEventListener('pointerup', endDrag)
      viewport.removeEventListener('pointercancel', endDrag)
      viewport.removeEventListener('mouseenter', onEnter)
      viewport.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <>
    {/* Reserva el alto de la barra fija para que el contenido no quede tapado */}
    <div className="h-8" aria-hidden="true" />
    <div
      className="fixed inset-x-0 top-0 z-[60] h-8 overflow-hidden border-b border-white/10 bg-black"
      aria-label="Marcas con las que trabajamos"
    >
      <div className="flex h-full items-center gap-2 px-4">
        <span className="shrink-0 border-r border-white/15 pr-4 font-display text-[0.625rem] uppercase tracking-[0.2em] text-zinc-500">
          Trabajamos con
        </span>

        <div
          ref={viewportRef}
          className="relative h-full flex-1 cursor-grab select-none overflow-hidden touch-pan-y"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-black to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-black to-transparent" />

          <div ref={trackRef} className="flex h-full w-max items-center gap-10 will-change-transform">
            {track.map((b, i) =>
              b.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${b.name}-${i}`}
                  src={b.src}
                  alt={i < brands.length ? b.name : ''}
                  aria-hidden={i >= brands.length}
                  draggable={false}
                  className="h-4 w-auto max-w-[90px] object-contain opacity-70 [filter:grayscale(0.5)_brightness(1.15)] transition-all duration-200 hover:opacity-100 hover:[filter:none]"
                />
              ) : (
                <span
                  key={`${b.name}-${i}`}
                  aria-hidden={i >= brands.length}
                  className="shrink-0 whitespace-nowrap font-display text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-zinc-300 opacity-70 transition-opacity duration-200 hover:opacity-100"
                >
                  {b.name}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
