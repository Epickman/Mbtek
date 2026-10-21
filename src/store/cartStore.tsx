'use client'

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { CartState, Product } from '@/types'
import { useProducts } from '@/store/productsContext'

// ── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_ITEM'; product: Product; quantity?: number }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; state: CartState }

// ── State / Reducer ───────────────────────────────────────────────────────────

/** Tope de unidades que se pueden pedir de un producto (sin stock informado no hay tope) */
export function maxQty(product: Product): number {
  return product.stock ?? Infinity
}

const initialState: CartState = {
  items: [],
}

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      if (maxQty(action.product) <= 0) return state
      const existing = state.items.find((i) => i.product.id === action.product.id)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: Math.min(i.quantity + (action.quantity ?? 1), maxQty(action.product)) }
              : i
          ),
        }
      }
      return {
        ...state,
        items: [
          ...state.items,
          { product: action.product, quantity: Math.min(action.quantity ?? 1, maxQty(action.product)) },
        ],
      }
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) }

    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? { ...i, quantity: Math.max(1, action.quantity) }
            : i
        ),
      }

    case 'CLEAR':
      return { ...state, items: [] }

    case 'HYDRATE':
      return action.state

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

type CartContextValue = {
  state: CartState
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, quantity: number) => void
  clear: () => void
  totalItems: number
  /** Suma de los productos con precio (los "a consultar" no cuentan) */
  subtotal: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  /** Último producto agregado, para el aviso de confirmación (null cuando no hay aviso) */
  lastAdded: { product: Product; quantity: number; key: number } | null
  dismissAdded: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'mbtek-cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isOpen, setIsOpen] = useState(false)
  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const [lastAdded, setLastAdded] = useState<CartContextValue['lastAdded']>(null)
  const dismissAdded = useCallback(() => setLastAdded(null), [])

  // El primer render tiene que coincidir con el del servidor (carrito vacío);
  // lo guardado en localStorage se carga recién después de montar.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      // Versiones anteriores guardaban también terreno y vehículo: sólo nos quedamos con los items
      const { items } = JSON.parse(saved) as Partial<CartState>
      if (Array.isArray(items)) dispatch({ type: 'HYDRATE', state: { items } })
    } catch {
      // localStorage unavailable or corrupt — start empty
    }
  }, [])

  // Persist to localStorage whenever state changes — skipping the untouched
  // initial state so it doesn't overwrite what's saved before it's loaded
  useEffect(() => {
    if (state === initialState) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // localStorage unavailable (private mode, etc.) — silently ignore
    }
  }, [state])

  // El carrito guarda una copia del producto al agregarlo; se reemplaza por la versión actual
  // del catálogo para que precio, stock y fotos estén siempre al día.
  const catalog = useProducts()
  const freshState: CartState = {
    ...state,
    items: state.items.map((item) => {
      const current =
        catalog.find((p) => p.id === item.product.id) ??
        catalog.find((p) => p.sku && p.sku === item.product.sku)
      return current ? { ...item, product: { ...current, id: item.product.id } } : item
    }),
  }

  const value: CartContextValue = {
    state: freshState,
    addItem: (product, quantity = 1) => {
      if (maxQty(product) <= 0) return
      dispatch({ type: 'ADD_ITEM', product, quantity })
      setLastAdded({ product, quantity, key: Date.now() })
    },
    removeItem: (productId) => dispatch({ type: 'REMOVE_ITEM', productId }),
    updateQty: (productId, quantity) => {
      // El tope sale del catálogo actualizado, no de la copia guardada en el carrito
      const item = freshState.items.find((i) => i.product.id === productId)
      const capped = item ? Math.min(quantity, maxQty(item.product)) : quantity
      dispatch({ type: 'UPDATE_QTY', productId, quantity: capped })
    },
    clear: () => dispatch({ type: 'CLEAR' }),
    totalItems: freshState.items.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: freshState.items.reduce((sum, i) => sum + (i.product.price ?? 0) * i.quantity, 0),
    isOpen,
    openCart,
    closeCart,
    lastAdded,
    dismissAdded,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
