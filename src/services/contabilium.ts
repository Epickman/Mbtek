/**
 * Contabilium API service — SERVER SIDE ONLY
 *
 * Authentication flow:
 *   1. POST https://rest.contabilium.com/token
 *      body: grant_type=client_credentials&client_id={email}&client_secret={api_key}
 *      → { access_token: "..." }
 *   2. GET  https://rest.contabilium.com/api/{endpoint}
 *      header: Authorization: Bearer {access_token}
 *
 * Env vars required (.env.local):
 *   CONTABILIUM_CLIENT_ID     — tu email de Contabilium
 *   CONTABILIUM_CLIENT_SECRET — API Key de Mi Cuenta > Configuración > API
 *
 * Never import this file in client components.
 */

// ─── Base URLs ─────────────────────────────────────────────────────────────────
const TOKEN_URL = 'https://rest.contabilium.com/token'
const REST_BASE = 'https://rest.contabilium.com/api'
// Safety cap for the paginated product listing
const MAX_PAGES = 50

// ─── In-memory token cache ─────────────────────────────────────────────────────
// Next.js server processes stay alive between requests, so this persists for the
// lifetime of the server process (~5 h matches what Contabilium recommends).
let cachedToken: string | null = null
let tokenExpiresAt = 0

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ContabiliumConcepto {
  Id: number
  Codigo: string       // SKU — matches product.sku in our catalog
  Nombre: string
  Descripcion: string
  Precio: number       // Price WITHOUT tax (IVA)
  PrecioFinal: number  // Price WITH tax (IVA) — show this to customers
  Stock: number
  Estado?: string      // "Activo" | "Inactivo"
  Tipo?: string        // "Producto" | "Servicio" | "Combo"
  IdRubro?: number | string | null
  IdSubrubro?: number | string | null
  CodigoBarras?: string | null
  Observaciones?: string | null
}

export interface ContabiliumRubro {
  Id: number
  Nombre: string
}

interface ConceptosPage {
  Items?: ContabiliumConcepto[]
  TotalItems?: number
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

function getCredentials() {
  const clientId     = process.env.CONTABILIUM_CLIENT_ID
  const clientSecret = process.env.CONTABILIUM_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error(
      'Contabilium not configured. Set CONTABILIUM_CLIENT_ID and CONTABILIUM_CLIENT_SECRET in .env.local'
    )
  }
  return { clientId, clientSecret }
}

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s margin)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken
  }

  const { clientId, clientSecret } = getCredentials()

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     clientId,
      client_secret: clientSecret,
    }),
    // Con 'no-store' las páginas dejarían de generarse por adelantado; el token dura 24 h
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Contabilium token request failed (${res.status}): ${text}`)
  }

  const data = await res.json() as { access_token?: string; expires_in?: number }
  if (!data.access_token) {
    throw new Error('Contabilium did not return an access_token')
  }

  // Cache for returned expiry (default 5 h = 18000 s)
  const expiresIn = data.expires_in ?? 18_000
  cachedToken = data.access_token
  tokenExpiresAt = Date.now() + expiresIn * 1000

  return cachedToken
}

// ─── REST helper ───────────────────────────────────────────────────────────────

async function restGet<T>(path: string): Promise<T> {
  const token = await getAccessToken()
  const url   = `${REST_BASE}${path}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    next: { revalidate: 300 }, // 5-min Next.js cache
  })

  if (!res.ok) {
    throw new Error(`Contabilium REST error ${res.status} at ${path}`)
  }

  return res.json() as Promise<T>
}

/** SKUs are compared ignoring case and surrounding spaces */
export function normalizeSku(sku: string | null | undefined): string {
  return (sku ?? '').trim().toUpperCase()
}

export function isContabiliumConfigured(): boolean {
  return !!(process.env.CONTABILIUM_CLIENT_ID && process.env.CONTABILIUM_CLIENT_SECRET)
}

// ─── Public API ────────────────────────────────────────────────────────────────

export const ContabiliumService = {
  /** All conceptos (products), walking every page of /conceptos/search */
  async getConceptos(): Promise<ContabiliumConcepto[]> {
    const all: ContabiliumConcepto[] = []
    for (let page = 1; page <= MAX_PAGES; page++) {
      const data = await restGet<ConceptosPage | ContabiliumConcepto[]>(`/conceptos/search?page=${page}&pageSize=50`)
      if (Array.isArray(data)) return data
      const items = data.Items ?? []
      all.push(...items)
      // TotalPage viene con la cantidad de la página, no de páginas: se corta por TotalItems
      if (items.length === 0 || all.length >= (data.TotalItems ?? all.length)) break
    }
    return all
  },

  /** Rubros (categorías) cargados en Contabilium */
  async getRubros(): Promise<ContabiliumRubro[]> {
    const data = await restGet<ContabiliumRubro[] | { Items?: ContabiliumRubro[] }>('/conceptos/rubros')
    return Array.isArray(data) ? data : data.Items ?? []
  },

  /** Find one concepto by SKU (Codigo) */
  async getByCodigo(sku: string): Promise<ContabiliumConcepto | null> {
    const all = await this.getConceptos()
    return all.find(c => normalizeSku(c.Codigo) === normalizeSku(sku)) ?? null
  },

  /** Current stock for a SKU */
  async getStock(sku: string): Promise<number> {
    const c = await this.getByCodigo(sku)
    return c?.Stock ?? 0
  },

  /** Price WITH tax (PrecioFinal) for a SKU */
  async getPrice(sku: string): Promise<number | null> {
    const c = await this.getByCodigo(sku)
    return c?.PrecioFinal ?? null
  },

  /** Price WITHOUT tax (Precio) for a SKU */
  async getPriceWithoutTax(sku: string): Promise<number | null> {
    const c = await this.getByCodigo(sku)
    return c?.Precio ?? null
  },
}
