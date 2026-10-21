// Shared TypeScript types

export type Vehicle = {
  brand: string
  model: string
  year?: string
}

export interface ProductVariant {
  id: string
  sku: string
  name: string
  price?: number
  stock?: number
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  category: string
  subcategory?: string
  vehicles: string[] // e.g. ['yamaha-raptor-700', 'yamaha-yfz450r']
  price?: number
  stock?: number
  description: string
  specs?: Record<string, string>
  featured?: boolean
  tags?: string[]
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartState {
  items: CartItem[]
}

export interface VehicleBrand {
  id: string
  name: string
  logo?: string
  models: VehicleModel[]
}

export interface VehicleModel {
  id: string
  name: string
  years?: string[]
  type: 'atv' | 'mx' | 'utv'
}

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
  order: number
}

/** Datos que completa el cliente antes de enviar el pedido */
export interface CustomerInfo {
  name: string
  delivery: string
  payment: string
}

export interface WhatsAppOrderParams {
  customer?: CustomerInfo
  items?: CartItem[]
  product?: Product
  quantity?: number
  vehicle?: Vehicle
  url?: string
}
