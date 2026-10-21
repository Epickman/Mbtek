'use client'

/**
 * VehicleDiagram — Interactive side-view illustration of a vehicle (ATV / MX).
 * Each part is a product category: hovering or selecting it puts it in the
 * spotlight, and parts already covered by a product in the cart are
 * highlighted in green with the quantity.
 */

import { useState, type SVGProps } from 'react'
import type { Category } from '@/types'
import type { DiagramShape, VehicleDiagram as Diagram } from '@/data/vehicleDiagrams'

interface VehicleDiagramProps {
  diagram: Diagram
  activeCategory: string | null
  onCategorySelect: (categoryId: string) => void
  categories: Category[]
  /** Unidades en el carrito por categoría */
  cartCounts: Record<string, number>
}

const ACCENT = '#e2001a'
const IN_CART = '#22c55e'

function ShapeEl({ shape, ...props }: { shape: DiagramShape } & SVGProps<SVGPathElement>) {
  if ('circle' in shape) {
    const [cx, cy, r] = shape.circle
    return <path d={circlePath(cx, cy, r)} {...props} />
  }
  if ('ring' in shape) {
    const [cx, cy, r, ri] = shape.ring
    return <path d={`${circlePath(cx, cy, r)} ${circlePath(cx, cy, ri)}`} fillRule="evenodd" {...props} />
  }
  return <path d={`M ${shape.poly.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`} {...props} />
}

function circlePath(cx: number, cy: number, r: number) {
  return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`
}

export default function VehicleDiagram({
  diagram,
  activeCategory,
  onCategorySelect,
  categories,
  cartCounts,
}: VehicleDiagramProps) {
  const { img: IMG, hotspots, shapes: partShapes } = diagram
  const maskId = `spotlight-${diagram.type}`
  const glowId = `glow-${diagram.type}`
  const [hovered, setHovered] = useState<string | null>(null)
  // Part in the spotlight: the one under the pointer, or else the selected one
  const focused = hovered ?? activeCategory
  const focusedShapes = focused ? partShapes[focused] ?? [] : []
  const focusedColor = focused === activeCategory ? ACCENT : '#ffffff'

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox={`0 0 ${IMG.w} ${IMG.h}`}
        className="w-full"
        role="group"
        aria-label={`${diagram.name} interactivo — tocá una parte para ver qué tenés en el carrito`}
      >
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Ground shadow */}
        <ellipse cx={IMG.w / 2} cy={IMG.h - 14} rx={IMG.w * 0.42} ry="16" fill="black" opacity="0.5" />

        <image href={IMG.src} x="0" y="0" width={IMG.w} height={IMG.h} preserveAspectRatio="xMidYMid meet" />

        {/* ── Spotlight: dim everything except the focused part ─────────────── */}
        <mask id={maskId}>
          <rect width={IMG.w} height={IMG.h} fill="white" />
          {focusedShapes.map((shape, i) => <ShapeEl key={i} shape={shape} fill="black" />)}
        </mask>
        <rect
          width={IMG.w} height={IMG.h} fill="#000" mask={`url(#${maskId})`}
          opacity={focused ? 0.6 : 0}
          style={{ transition: 'opacity 0.25s', pointerEvents: 'none' }}
        />

        {/* ── Part outlines (also clickable) ─────────────────────────────── */}
        {categories.map(cat => {
          const shapes = partShapes[cat.id]
          if (!shapes) return null
          const isFocused = focused === cat.id
          const inCart = (cartCounts[cat.id] ?? 0) > 0
          const color = isFocused ? focusedColor : inCart ? IN_CART : null
          return (
            <g
              key={cat.id}
              onClick={() => onCategorySelect(cat.id)}
              onMouseEnter={() => setHovered(cat.id)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
              aria-hidden="true"
            >
              {shapes.map((shape, i) => (
                <ShapeEl
                  key={i}
                  shape={shape}
                  fill={color ?? '#ffffff'}
                  fillOpacity={isFocused ? 0.14 : inCart ? 0.12 : 0}
                  stroke={color ?? 'transparent'}
                  strokeOpacity={isFocused ? 1 : 0.7}
                  strokeWidth={isFocused ? 3.5 : 2.5}
                  strokeDasharray={isFocused ? undefined : '10 6'}
                  strokeLinejoin="round"
                  filter={isFocused ? `url(#${glowId})` : undefined}
                  style={{ transition: 'fill-opacity 0.2s, stroke-opacity 0.2s' }}
                />
              ))}
            </g>
          )
        })}

        {/* ── Hotspots ────────────────────────────────────────────────────── */}
        {categories.map(cat => {
          const hp = hotspots[cat.id]
          if (!hp) return null
          const isActive = activeCategory === cat.id
          const isHovered = hovered === cat.id
          const count = cartCounts[cat.id] ?? 0
          const inCart = count > 0
          const color = isActive ? ACCENT : inCart ? IN_CART : null
          const showLabel = isActive || isHovered
          const labelBelow = hp.cy < 120
          const label = cat.name.split(' / ')[0]
          const labelW = label.length * 12 + 28

          return (
            <g
              key={cat.id}
              role="button"
              tabIndex={0}
              aria-label={`${cat.name}: ${inCart ? `${count} en el carrito` : 'nada en el carrito'}`}
              aria-pressed={isActive}
              onClick={() => onCategorySelect(cat.id)}
              onMouseEnter={() => setHovered(cat.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(cat.id)}
              onBlur={() => setHovered(null)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onCategorySelect(cat.id)
                }
              }}
              className="cursor-pointer outline-none"
            >
              {/* Larger invisible hit area for touch */}
              <circle cx={hp.cx} cy={hp.cy} r="36" fill="transparent" />
              {/* Pulse ring */}
              {isActive && (
                <circle cx={hp.cx} cy={hp.cy} r="24"
                  fill="none" stroke={ACCENT} strokeWidth="3" opacity="0.6"
                  className="animate-ping" style={{ transformOrigin: `${hp.cx}px ${hp.cy}px` }}
                />
              )}
              {/* Outer ring */}
              <circle
                cx={hp.cx} cy={hp.cy} r={isActive || isHovered ? 19 : 15}
                fill={color ?? (isHovered ? '#18181bdd' : '#09090bcc')}
                stroke={color ?? '#ffffff'}
                strokeWidth={3}
                strokeDasharray={color || isHovered ? undefined : '6 4'}
                filter={color ? `url(#${glowId})` : undefined}
                style={{ transition: 'r 0.2s, fill 0.2s' }}
              />
              {/* Center: quantity when in cart, dot otherwise */}
              {inCart ? (
                <text
                  x={hp.cx} y={hp.cy + 6}
                  textAnchor="middle" fill="#fff" fontSize="17" fontWeight="800" fontFamily="system-ui"
                  style={{ pointerEvents: 'none' }}
                >
                  {count > 9 ? '9+' : count}
                </text>
              ) : (
                <circle cx={hp.cx} cy={hp.cy} r={5} fill="#fff" />
              )}
              {/* Label */}
              {showLabel && (
                <g style={{ pointerEvents: 'none' }}>
                  <rect
                    x={hp.cx - labelW / 2}
                    y={labelBelow ? hp.cy + 28 : hp.cy - 60}
                    width={labelW}
                    height="32" rx="6"
                    fill="#09090b" stroke={color ?? '#71717a'} strokeWidth="1.5"
                  />
                  <text
                    x={hp.cx}
                    y={labelBelow ? hp.cy + 50 : hp.cy - 38}
                    textAnchor="middle"
                    fill="#f4f4f5"
                    fontSize="17"
                    fontWeight="700"
                    fontFamily="system-ui"
                    letterSpacing="1.5"
                    style={{ textTransform: 'uppercase' }}
                  >
                    {label}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pb-1 pt-3 text-[0.6875rem] text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: IN_CART }} /> En tu carrito
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full border border-dashed border-zinc-300" /> Sin componente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: ACCENT }} /> Seleccionada
        </span>
      </div>
    </div>
  )
}
