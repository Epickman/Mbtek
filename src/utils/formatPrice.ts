import siteConfig from '@/config/site'

export function formatPrice(price: number | undefined | null): string {
  if (price == null) return 'Consultar precio'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: siteConfig.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
