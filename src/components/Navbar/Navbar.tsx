'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Menu, X, MessageCircle, ShoppingCart } from 'lucide-react'
import { InstagramIcon } from '@/components/ui/icons'
import siteConfig from '@/config/site'
import { useCart } from '@/store/cartStore'
import { cn } from '@/utils/cn'

const navLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Tienda', href: '/tienda' },
  { label: 'Personalizar', href: '/personalizar' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Contacto', href: '/contacto' },
]

const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

function placeIndicator(list: HTMLElement | null, bar: HTMLElement | null, pathname: string, animate: boolean) {
  if (!list || !bar) return
  const active = navLinks.find((l) => isActivePath(pathname, l.href))
  const link = active && list.querySelector<HTMLElement>(`[data-nav-href="${active.href}"]`)
  if (!link) {
    bar.style.opacity = '0'
    return
  }
  bar.style.transition = animate ? `transform 450ms ${EASE}, width 450ms ${EASE}, opacity 200ms` : 'none'
  bar.style.width = `${link.offsetWidth}px`
  bar.style.transform = `translateX(${link.offsetLeft}px)`
  bar.style.opacity = '1'
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { totalItems, openCart } = useCart()
  const pathname = usePathname()
  const isActive = (href: string) => isActivePath(pathname, href)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Subrayado de la sección activa: la primera vez se ubica sin animar y después se
  // desliza de costado. Se mide relativo a la lista, así el scroll no influye.
  const listRef = useRef<HTMLUListElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const placedRef = useRef(false)
  const pathRef = useRef(pathname)

  useLayoutEffect(() => {
    pathRef.current = pathname
    placeIndicator(listRef.current, indicatorRef.current, pathname, placedRef.current)
    placedRef.current = true
  }, [pathname])

  // Si cambia el ancho de los links (carga de fuentes, ventana), se reubica sin animar
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    let first = true
    const observer = new ResizeObserver(() => {
      if (first) {
        first = false
        return
      }
      placeIndicator(list, indicatorRef.current, pathRef.current, false)
    })
    observer.observe(list)
    return () => observer.disconnect()
  }, [])

  // Close mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setOpen(false)
  }

  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent('Hola MBTEK Parts')}`

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        // Account for TopBrandBar height (≈ 32px)
        'mt-[32px]',
        scrolled
          ? 'bg-[#050505]/95 backdrop-blur-md border-b border-white/10'
          : 'bg-gradient-to-b from-black/70 to-transparent',
        scrolled ? 'py-3' : 'py-5'
      )}
    >
      <nav className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="relative flex items-center group pl-[44px] lg:pl-0"
          aria-label="MBTEK Parts — Inicio"
        >
          {/* Bandera de la marca detrás del logo, igual que en "Cuatriciclos más buscados" */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/brand-flag.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-1/2 h-[15px] w-auto lg:h-[36px] lg:left-auto lg:right-[calc(100%+12px)] max-w-none -translate-y-1/2 opacity-[0.35] lg:opacity-[0.55] [filter:grayscale(1)_brightness(2)_blur(0.5px)] [mask-image:linear-gradient(90deg,transparent_0%,#000_55%,#000_100%)]"
          />
          <Image
            src="/brand/mbtek-logo-text.png"
            alt="MBTEK Parts Atv & Mx"
            width={1675}
            height={405}
            priority
            className={cn('relative w-auto transition-all duration-300', scrolled ? 'h-8' : 'h-10')}
          />
        </Link>

        {/* Desktop nav */}
        <ul ref={listRef} className="relative hidden lg:flex items-center gap-8" role="list">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                data-nav-href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'relative block py-1.5 text-[0.8125rem] tracking-[1.5px] hover:text-white transition-colors font-medium uppercase after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[var(--accent)] after:transition-transform after:duration-300',
                  // El link activo ya tiene el subrayado deslizante; el hover no le suma otro
                  isActive(link.href) ? 'text-white' : 'text-zinc-200 hover:after:scale-x-100'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {/* Subrayado de la sección activa: uno solo, que se desliza hasta el link nuevo */}
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-[var(--accent)] opacity-0"
          />
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          <CartButton count={totalItems} onClick={openCart} />
        </div>

        {/* Mobile: burger */}
        <div className="flex lg:hidden items-center gap-4">
          <CartButton count={totalItems} onClick={openCart} />
          <button
            onClick={() => setOpen(!open)}
            className="text-white p-1"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300',
          open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
        aria-hidden={!open}
      >
        <div className="bg-zinc-950/98 backdrop-blur-md border-t border-zinc-800 px-4 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-base font-semibold tracking-widest hover:text-white uppercase transition-colors',
                isActive(link.href) ? 'text-[var(--accent)]' : 'text-zinc-200'
              )}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex gap-4 pt-4 border-t border-zinc-800">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold uppercase tracking-[1.5px] text-sm py-3 rounded-sm"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
            <a
              href={`https://www.instagram.com/${siteConfig.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-zinc-700 text-white text-sm py-3 px-4 rounded-full"
            >
              <InstagramIcon size={16} />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

function CartButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative p-1 text-zinc-200 transition-colors hover:text-white"
      aria-label={`Abrir carrito (${count} producto${count !== 1 ? 's' : ''})`}
    >
      <ShoppingCart size={22} />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[0.625rem] font-bold leading-none text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
