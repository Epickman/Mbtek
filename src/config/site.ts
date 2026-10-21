// Central site configuration — update here, effects everywhere
const siteConfig = {
  // Brand
  brandName: 'MBTEK Parts',
  brandSlogan: 'Engineered for Your Terrain',
  tagline: 'ATV & MX Performance Parts',

  // Contact
  whatsapp: '5492215762430', // +54 9 221 576-2430 (el 9 es obligatorio para celulares de Argentina en WhatsApp)
  whatsappName: 'MBTEK Parts',
  instagram: 'mbtek_parts',
  email: 'info@mbtekparts.com.ar',
  website: 'https://www.mbtekparts.com.ar',

  // Commerce
  currency: 'ARS',
  currencySymbol: '$',

  // Checkout: opciones que el cliente elige antes de enviar el pedido por WhatsApp.
  // Ajustalas a lo que realmente ofrece el negocio.
  checkout: {
    deliveryOptions: ['Envío a domicilio', 'Retiro en persona'],
    paymentOptions: ['Transferencia', 'Efectivo', 'Tarjeta / Mercado Pago', 'A coordinar'],
  },

  // Accent color (used in Tailwind via CSS var --accent)
  accentColor: '#e2001a', // Rojo MBTEK — change freely

  // Social
  socialLinks: {
    instagram: 'https://www.instagram.com/mbtek_parts/',
    whatsapp: '', // generated dynamically
  },

  // SEO defaults
  seo: {
    title: 'MBTEK Parts | ATV & MX Performance Parts',
    description:
      'Repuestos, piezas y accesorios premium para ATV, cuatriciclos, MX y vehículos off-road. Compatible con Yamaha, Honda, Can-Am, Polaris, Kawasaki, Suzuki y más. Armá tu ATV a tu medida.',
    ogImage: '/images/og-default.jpg',
    twitterHandle: '@mbtek_parts',
    locale: 'es_AR',
    siteName: 'MBTEK Parts',
  },
}

export default siteConfig

// Helper to generate WhatsApp URL
export function whatsappUrl(message: string): string {
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${siteConfig.whatsapp}?text=${encoded}`
}
