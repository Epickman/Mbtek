'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { Product } from '@/types'

const ProductsContext = createContext<Product[]>([])

export function ProductsProvider({ products, children }: { products: Product[]; children: ReactNode }) {
  return <ProductsContext.Provider value={products}>{children}</ProductsContext.Provider>
}

/** Catálogo con precios y stock actualizados (para componentes de cliente). */
export function useProducts(): Product[] {
  return useContext(ProductsContext)
}
