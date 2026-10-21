'use client'

import { useEffect, useRef } from 'react'
import ProductCard from '@/components/ProductCard/ProductCard'
import type { Product } from '@/types'

// Velocidad del desplazamiento automático (px por segundo)
const SPEED = 40
// Movimiento mínimo para considerar que fue un arrastre y no un clic
const DRAG_THRESHOLD = 6

/**
 * Fila de productos que se desplaza sola hacia la izquierda, en loop.
 * - Con el mouse se puede arrastrar; en el celular se desliza con el dedo.
 * - Se pausa al pasar el mouse por encima o mientras se arrastra.
 * - Un clic lleva al producto, salvo que haya sido el final de un arrastre.
 * La lista se renderiza dos veces: al llegar a la mitad se vuelve al principio sin que se note.
 */
export default function ProductCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const state = useRef({ pos: 0, paused: false, dragging: false, startX: 0, startPos: 0, moved: false })

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const s = state.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const wrap = () => {
      const half = el.scrollWidth / 2
      if (half <= 0) return
      if (s.pos >= half) s.pos -= half
      if (s.pos < 0) s.pos += half
    }

    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(now - last, 100) / 1000
      last = now
      // Si el usuario lo movió con el dedo o la ruedita, se sigue desde ahí
      if (Math.abs(el.scrollLeft - s.pos) > 2 && !s.dragging) s.pos = el.scrollLeft
      if (!s.paused && !s.dragging && !reduceMotion) s.pos += SPEED * dt
      wrap()
      el.scrollLeft = s.pos
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const s = state.current
    s.dragging = true
    s.moved = false
    s.startX = e.clientX
    s.startPos = s.pos
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const s = state.current
    if (!s.dragging) return
    const dx = e.clientX - s.startX
    if (!s.moved && Math.abs(dx) > DRAG_THRESHOLD) {
      s.moved = true
      trackRef.current?.setPointerCapture(e.pointerId)
    }
    if (s.moved) s.pos = s.startPos - dx
  }

  const endDrag = () => {
    state.current.dragging = false
  }

  // Si hubo arrastre, el clic que lo termina no abre el producto
  const onClickCapture = (e: React.MouseEvent) => {
    if (state.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      state.current.moved = false
    }
  }

  const pause = () => {
    state.current.paused = true
  }
  const resume = () => {
    state.current.paused = false
  }

  const row = (copy: number) => (
    <div className="flex flex-shrink-0" aria-hidden={copy === 1 || undefined} inert={copy === 1}>
      {products.map((product) => (
        <div key={`${copy}-${product.id}`} className="w-[220px] flex-shrink-0 pr-3 sm:w-[250px] [&>*]:h-full">
          <ProductCard product={product} size="small" />
        </div>
      ))}
    </div>
  )

  return (
    <div
      ref={trackRef}
      className="no-scrollbar flex cursor-grab select-none overflow-x-auto active:cursor-grabbing [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
      onClickCapture={onClickCapture}
      onDragStart={(e) => e.preventDefault()}
      aria-label="Productos en stock"
      role="region"
    >
      {row(0)}
      {row(1)}
    </div>
  )
}
