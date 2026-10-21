import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 bg-zinc-950" role="contentinfo">
      {/* Separator between page content and footer */}
      <div className="h-[3px] bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" aria-hidden="true" />

      {/* Main footer */}
      <div className="max-w-screen-xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="relative mb-4 flex items-center pl-[94px]">
            {/* Bandera de la marca, igual que en el header */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/brand-flag.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-1/2 h-[34px] w-auto max-w-none -translate-y-1/2 opacity-[0.55] [filter:grayscale(1)_brightness(2)_blur(0.5px)] [mask-image:linear-gradient(90deg,transparent_0%,#000_55%,#000_100%)]"
            />
            <Image
              src="/brand/mbtek-logo-text.png"
              alt="MBTEK Parts Atv & Mx"
              width={1675}
              height={405}
              className="relative h-12 w-auto"
            />
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
            Repuestos, piezas y accesorios para ATV, cuatriciclos, MX y vehículos off-road.
            Armá tu ATV a tu medida.
          </p>
          <p className="text-zinc-500 text-xs mt-4">Argentina</p>
        </div>

        {/* Navigation */}
        <div>
          <p className="text-zinc-500 text-xs tracking-[0.2em] uppercase mb-4">Catálogo</p>
          <ul className="space-y-3" role="list">
            {[
              { label: 'Productos', href: '/tienda' },
              { label: 'ATV', href: '/tienda?tipo=atv' },
              { label: 'MX', href: '/tienda?tipo=mx' },
              { label: 'Personalizá tu ATV / MX', href: '/personalizar' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-zinc-400 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <p className="text-zinc-500 text-xs tracking-[0.2em] uppercase mb-4">MBTEK</p>
          <ul className="space-y-3" role="list">
            {[
              { label: 'Nosotros', href: '/nosotros' },
              { label: 'Contacto', href: '/contacto' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-zinc-400 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800 py-6 px-4">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-600 text-xs">
          <p>© {year} MBTEK Parts. Todos los derechos reservados.</p>
          <p className="text-zinc-700">
            Sitio desarrollado en Argentina
          </p>
        </div>
      </div>
    </footer>
  )
}
