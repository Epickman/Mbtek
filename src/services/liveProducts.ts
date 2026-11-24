import { unstable_rethrow } from 'next/navigation'
import type { Product } from '@/types'
import { categories } from '@/data/categories'
import siteConfig from '@/config/site'
import catalogo from '@/data/catalogo.json'
import fotos from '@/data/fotos.json'
import { getPhotoOverrides, type PhotoOverrides } from '@/services/productPhotos'
import {
  ContabiliumService,
  isContabiliumConfigured,
  type ContabiliumConcepto,
} from '@/services/contabilium'

const DEFAULT_CATEGORY = 'accesorios'

/** Un producto de la planilla (src/data/catalogo.json, generado con scripts/importar-catalogo.py) */
interface CatalogItem {
  sku: string
  nombre: string
  rubro: string
  marca: string
  codigoProveedor: string
  descripcion: string
  precio: number
}

const catalog = catalogo as CatalogItem[]
const photos = fotos as Record<string, string>

/**
 * Catálogo de la tienda: los productos, códigos y precios salen de la planilla de Excel
 * (src/data/catalogo.json). Para actualizarlos: python3 scripts/importar-catalogo.py <planilla.xlsx>
 * - Precio 0 en la planilla = "Consultar precio". Con siteConfig.showPrices en false no se muestra ninguno.
 * - Contabilium sigue vinculado: si está configurado, cada producto se cruza por SKU
 *   (o por código de fabricante, ignorando guiones: 18P116510000 = 18P-11651-00-00)
 *   y de ahí se toman el stock (para elegir los destacados del inicio, no se publica) y la
 *   descripción si la planilla no trae. Si Contabilium no responde, la tienda igual funciona.
 * - La categoría sale del rubro si coincide con una de la web; si no (ej. "Repuesto"), de
 *   palabras del nombre (ej. "CANASTA DE EMBRAGUE" -> embrague). Si nada coincide va a Accesorios.
 */
export async function getLiveProducts(): Promise<Product[]> {
  const [byCode, overrides] = await Promise.all([getContabiliumByCode(), getPhotoOverrides()])
  const usedSlugs = new Set<string>()
  const products = catalog.map((item) => {
    const c = byCode.get(codeKey(item.sku)) ?? (item.codigoProveedor ? byCode.get(codeKey(item.codigoProveedor)) : undefined)
    return toProduct(item, c, uniqueSlug(item, usedSlugs), overrides)
  })
  // Sin datos de stock (Contabilium caído o sin cruces) se destacan los que tienen foto
  if (!products.some((p) => p.featured)) {
    for (const p of products) p.featured = p.image !== undefined
  }
  return products
}

export async function getLiveBySlug(slug: string): Promise<Product | undefined> {
  return (await getLiveProducts()).find((p) => p.slug === slug)
}

// Los códigos se comparan sin guiones, espacios ni mayúsculas/minúsculas
function codeKey(code: string | null | undefined): string {
  return (code ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '')
}

async function getContabiliumByCode(): Promise<Map<string, ContabiliumConcepto>> {
  const byCode = new Map<string, ContabiliumConcepto>()
  if (!isContabiliumConfigured()) return byCode
  try {
    for (const c of await ContabiliumService.getConceptos()) {
      const key = codeKey(c.Codigo)
      if (key) byCode.set(key, c)
    }
  } catch (err) {
    // Las señales internas de Next.js (ej. render dinámico) no son errores de Contabilium
    unstable_rethrow(err)
    console.error('[Contabilium] No se pudo leer el stock:', err instanceof Error ? err.message : err)
  }
  return byCode
}

// Foto: la elegida en el panel /admin/fotos (null = quitada) y si no, la del repo
function photoFor(sku: string, overrides: PhotoOverrides): string | undefined {
  return sku in overrides ? (overrides[sku] ?? undefined) : photos[sku]
}

function toProduct(item: CatalogItem, c: ContabiliumConcepto | undefined, slug: string, overrides: PhotoOverrides): Product {
  const specs: Record<string, string> = {}
  if (item.marca) specs['Marca'] = item.marca
  if (item.codigoProveedor) specs['Código de fabricante'] = item.codigoProveedor
  if (c?.CodigoBarras) specs['Código de barras'] = c.CodigoBarras

  const category = matchCategory(item.rubro) ?? categoryFromName(item.nombre)
  const description =
    item.descripcion || (c?.Descripcion || c?.Observaciones || '').trim() || defaultDescription(category, item.sku)

  return {
    id: `mbt-${item.sku}`,
    name: item.nombre,
    slug,
    sku: item.sku,
    category,
    vehicles: [],
    price: siteConfig.showPrices && item.precio > 0 ? item.precio : undefined,
    image: photoFor(item.sku, overrides),
    description,
    specs: Object.keys(specs).length ? specs : undefined,
    featured: (c?.Stock ?? 0) > 0,
    tags: [item.rubro, item.marca].filter(Boolean),
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
  ['proteccion', /protector|guard|cubre|casco|guante|pechera|rodillera|antiparra|cuello/],
  ['motor', /cilindro|piston|biela|ciguenal|valvula|valve|aros|leva|junta|gasket|o-ring|seal|bomba|aceite|magneto|stator|bujia|rulem|bearing|balanceador|tensor|distribucion|crank|cam|impeller|botador|electro|bendix|brush/],
]

function categoryFromName(name: string): string {
  const n = slugify(name)
  return NAME_KEYWORDS.find(([, re]) => re.test(n))?.[0] ?? DEFAULT_CATEGORY
}

// La dirección del producto se arma con el nombre; si dos se llaman igual, se agrega el código.
function uniqueSlug(item: CatalogItem, used: Set<string>): string {
  let slug = slugify(item.nombre) || `producto-${slugify(item.sku)}`
  if (used.has(slug)) slug = `${slug}-${slugify(item.sku)}`
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
