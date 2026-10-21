/**
 * ProductService — abstraction layer over the data source.
 * Currently uses local data. Switch to Contabilium by replacing
 * the implementations below with API calls through /api/contabilium.
 */

import type { Product } from '@/types'
import {
  products,
  getFeaturedProducts,
  getProductBySlug,
  getProductsByCategory,
  getProductsByVehicle,
} from '@/data/products'

export const ProductService = {
  /** Get all products */
  getAll(): Product[] {
    return products
  },

  /** Get featured products for homepage */
  getFeatured(): Product[] {
    return getFeaturedProducts()
  },

  /** Get product by URL slug */
  getBySlug(slug: string): Product | undefined {
    return getProductBySlug(slug)
  },

  /** Get products by category ID */
  getByCategory(category: string): Product[] {
    return getProductsByCategory(category)
  },

  /** Get products by vehicle ID */
  getByVehicle(vehicleId: string): Product[] {
    return getProductsByVehicle(vehicleId)
  },

  /** Get products filtered by category + vehicle */
  getFiltered(filters: {
    category?: string
    vehicleId?: string
  }): Product[] {
    return filterProducts(products, filters)
  },
}

export function filterProducts(
  list: Product[],
  filters: { category?: string; vehicleId?: string }
): Product[] {
  return list.filter((p) => {
    if (filters.category && p.category !== filters.category) return false
    if (filters.vehicleId && !p.vehicles.includes(filters.vehicleId)) return false
    return true
  })
}
