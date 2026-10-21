import type { Metadata } from 'next'
import { getLiveProducts } from '@/services/liveProducts'
import TiendaClient from './TiendaClient'

export const metadata: Metadata = {
  title: 'Tienda — Repuestos & Accesorios',
  description: 'Repuestos y accesorios para ATV, cuatriciclos y MX. Filtrá por categoría o marca y armá tu pedido.',
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { categoria } = await searchParams
  const products = await getLiveProducts()
  return (
    <TiendaClient
      products={products}
      initialCategory={typeof categoria === 'string' ? categoria : undefined}
    />
  )
}
