import { unstable_rethrow } from 'next/navigation'
import type { Product } from '@/types'
import { categories } from '@/data/categories'
import {
  ContabiliumService,
  isContabiliumConfigured,
  type ContabiliumConcepto,
  type ContabiliumRubro,
} from '@/services/contabilium'

const DEFAULT_CATEGORY = 'accesorios'

/**
 * Catálogo completo desde Contabilium: cada artículo activo es un producto de la tienda.
 * - Nombre, código, descripción, precio final (con IVA) y stock salen de Contabilium.
 * - La categoría sale del rubro de Contabilium si coincide con una de la web
 *   (ej. "Frenos" -> frenos); si no (ej. rubro "General"), de palabras del nombre
 *   (ej. "CANASTA DE EMBRAGUE" -> embrague). Si nada coincide va a Accesorios.
 * - Se omiten los artículos inactivos y los servicios.
 * Si Contabilium no está configurado o no responde, la tienda queda vacía.
 */
export async function getLiveProducts(): Promise<Product[]> {
  if (!isContabiliumConfigured()) {
    console.warn('[Contabilium] Faltan CONTABILIUM_CLIENT_ID / CONTABILIUM_CLIENT_SECRET: la tienda no tiene productos.')
    return []
  }

  try {
    const [conceptos, rubros] = await Promise.all([
      ContabiliumService.getConceptos(),
      // Sin rubros igual se muestran los productos, todos en Accesorios
      ContabiliumService.getRubros().catch((): ContabiliumRubro[] => []),
    ])
    const rubroById = new Map(rubros.map((r) => [String(r.Id), r.Nombre]))
    const usedSlugs = new Set<string>()

    return conceptos.filter(isSellable).map((c) => {
      const rubro = c.IdRubro != null ? rubroById.get(String(c.IdRubro)) : undefined
      return toProduct(c, rubro, uniqueSlug(c, usedSlugs))
    })
  } catch (err) {
    // Las señales internas de Next.js (ej. render dinámico) no son errores de Contabilium
    unstable_rethrow(err)
    console.error('[Contabilium] No se pudo leer el catálogo:', err instanceof Error ? err.message : err)
    return []
  }
}

export async function getLiveBySlug(slug: string): Promise<Product | undefined> {
  return (await getLiveProducts()).find((p) => p.slug === slug)
}

function isSellable(c: ContabiliumConcepto): boolean {
  if (!c.Nombre?.trim()) return false
  if (String(c.Estado ?? 'A').toUpperCase().startsWith('I')) return false
  return !String(c.Tipo ?? 'Producto').toUpperCase().startsWith('S')
}

function toProduct(c: ContabiliumConcepto, rubro: string | undefined, slug: string): Product {
  const specs: Record<string, string> = {}
  if (rubro && slugify(rubro) !== 'general') specs['Rubro'] = rubro
  if (c.CodigoBarras) specs['Código de barras'] = c.CodigoBarras

  const category = matchCategory(rubro) ?? categoryFromName(c.Nombre)

  return {
    id: `ctb-${c.Id}`,
    name: c.Nombre.trim(),
    slug,
    sku: (c.Codigo ?? '').trim(),
    category,
    vehicles: [],
    // Precio 0 en Contabilium = sin precio cargado: se muestra "Consultar precio"
    price: c.PrecioFinal > 0 ? c.PrecioFinal : undefined,
    stock: c.Stock ?? undefined,
    description: (c.Descripcion || c.Observaciones || '').trim() || defaultDescription(category, c.Codigo),
    specs: Object.keys(specs).length ? specs : undefined,
    featured: false,
    tags: rubro ? [rubro] : [],
  }
}

// Sin descripción en Contabilium se arma una con la categoría y el código.
function defaultDescription(categoryId: string, codigo: string | undefined): string {
  const name = categories.find((cat) => cat.id === categoryId)?.name ?? 'Repuestos'
  const code = codigo?.trim() ? ` Código ${codigo.trim()}.` : ''
  return `Repuesto · ${name}.${code}`
}

function matchCategory(rubro: string | undefined): string | undefined {
  if (!rubro) return undefined
  const r = slugify(rubro)
  const match =
    categories.find((cat) => cat.id === r || slugify(cat.name) === r) ??
    categories.find((cat) => slugify(cat.name).split('-').some((w) => w.length > 3 && r.includes(w)))
  return match?.id
}

// Palabras del nombre (en castellano y en inglés, como vienen los códigos Yamaha) -> categoría.
// Se revisan en orden: "CABLE EMBRAGUE" es embrague aunque también diga "cable", y
// "TRABA DE VALVULA DE ESCAPE" o "CADENA DE DISTRIBUCION" son de motor.
const NAME_KEYWORDS: [string, RegExp][] = [
  ['motor', /valvula|distribucion|bomba-de-aceite|tensor|damper-cadena/],
  ['embrague', /embrague|clutch/],
  ['escape', /escape|exhaust/],
  ['frenos', /freno|brake|pastilla/],
  ['suspension', /amortiguador|suspension|shock/],
  ['admision', /filtro|filter|inject|throttle|admision|carburador|bomba-de-nafta/],
  ['transmision', /caja|engranaje|horquilla|shift|fork|axle|eje|pinon|carrier|cadena|palier|trambalador|pawl/],
  ['neumaticos', /neumatico|cubierta|tire/],
  ['ruedas', /rueda|llanta|wheel/],
  ['proteccion', /protector|guard|cubre/],
  ['motor', /cilindro|piston|biela|ciguenal|valvula|valve|aros|leva|junta|gasket|o-ring|seal|bomba|aceite|magneto|stator|bujia|rulem|bearing|balanceador|tensor|distribucion|crank|cam|impeller|botador|electro|bendix|brush/],
]

function categoryFromName(name: string): string {
  const n = slugify(name)
  return NAME_KEYWORDS.find(([, re]) => re.test(n))?.[0] ?? DEFAULT_CATEGORY
}

// La dirección del producto se arma con el nombre; si dos se llaman igual, se agrega el código.
function uniqueSlug(c: ContabiliumConcepto, used: Set<string>): string {
  let slug = slugify(c.Nombre) || `producto-${c.Id}`
  if (used.has(slug)) slug = `${slug}-${slugify(c.Codigo || String(c.Id))}`
  if (used.has(slug)) slug = `${slug}-${c.Id}`
  used.add(slug)
  return slug
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
