import type { Product } from '@/types'

// PLACEHOLDER PRODUCTS — replace with real SKUs, images, and prices from MBTEK inventory
// All data here is illustrative. Do NOT publish without MBTEK verification.

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Amortiguadores Delanteros Stage 5',
    slug: 'amortiguadores-delanteros-stage-5',
    sku: 'SUSP-001',
    category: 'suspension',
    vehicles: ['yamaha-raptor-700', 'yamaha-yfz450r'],
    price: undefined, // Set when available
    stock: undefined,
    description:
      'Amortiguadores delanteros de alto rendimiento. Compatibles con parrillas estándar y aftermarket. Ajuste de compresión y rebote.',
    specs: {
      'Longitud (comprimido)': 'A confirmar',
      'Longitud (extendido)': 'A confirmar',
      'Ajuste': 'Compresión + Rebote',
    },
    featured: true,
    tags: ['suspension', 'performance'],
  },
  {
    id: 'prod-002',
    name: 'Kit Filtro de Aire High Flow',
    slug: 'kit-filtro-aire-high-flow',
    sku: 'ADM-001',
    category: 'admision',
    vehicles: ['yamaha-yfz450r', 'yamaha-raptor-700'],
    price: undefined,
    stock: undefined,
    description:
      'Kit completo de filtro de aire de alto flujo. Mayor rendimiento en condiciones de barro y polvo.',
    featured: true,
    tags: ['admision', 'performance'],
  },
  {
    id: 'prod-003',
    name: 'Kit de Discos y Resortes de Embrague',
    slug: 'kit-discos-resortes-embrague',
    sku: 'EMB-001',
    category: 'embrague',
    vehicles: ['yamaha-yfz450r'],
    price: undefined,
    stock: undefined,
    description:
      'Kit de discos, resortes y separadores de embrague para mayor durabilidad en condiciones extremas.',
    featured: false,
    tags: ['embrague', 'transmision'],
  },
  {
    id: 'prod-004',
    name: 'Escape Completo 16" - Serie Pro',
    slug: 'escape-completo-16-serie-pro',
    sku: 'ESC-001',
    category: 'escape',
    vehicles: ['yamaha-yfz450r', 'yamaha-raptor-700'],
    price: undefined,
    stock: undefined,
    description:
      'Sistema de escape completo de alta performance. Mayor potencia y torque en toda la curva.',
    featured: true,
    tags: ['escape', 'performance', 'motor'],
  },
  {
    id: 'prod-005',
    name: 'Mangueras de Radiador CV4',
    slug: 'mangueras-radiador-cv4',
    sku: 'MOT-001',
    category: 'motor',
    vehicles: ['yamaha-yfz450r'],
    price: undefined,
    stock: undefined,
    description:
      'Mangueras de radiador de silicona CV4. Resistencia extrema al calor y presión.',
    featured: false,
    tags: ['motor', 'refrigeracion'],
  },
  {
    id: 'prod-006',
    name: 'Centro de Embrague Billet',
    slug: 'centro-embrague-billet',
    sku: 'EMB-002',
    category: 'embrague',
    vehicles: ['yamaha-yfz450r'],
    price: undefined,
    stock: undefined,
    description:
      'Centro de embrague en aluminio billet. Mayor disipación de calor y durabilidad en uso intensivo.',
    featured: false,
    tags: ['embrague'],
  },
  {
    id: 'prod-007',
    name: 'Parrillas DC-4 LTravel',
    slug: 'parrillas-dc4-ltravel',
    sku: 'RUEDAS-001',
    category: 'ruedas',
    vehicles: ['yamaha-raptor-700', 'yamaha-yfz450f'],
    price: undefined,
    stock: undefined,
    description:
      'Parrillas DC-4 para uso off-road extremo. Mayor ancho de vía y estabilidad.',
    featured: true,
    tags: ['ruedas', 'suspension'],
  },
  {
    id: 'prod-008',
    name: 'Manija con Bomba de Freno',
    slug: 'manija-bomba-freno',
    sku: 'FRE-001',
    category: 'frenos',
    vehicles: ['yamaha-yfz450r'],
    price: undefined,
    stock: undefined,
    description:
      'Manija integrada con bomba de freno de radial. Control y feel de freno mejorado.',
    featured: false,
    tags: ['frenos', 'control'],
  },
  {
    id: 'prod-009',
    name: 'Soporte y Cubre Disco Trasero',
    slug: 'soporte-cubre-disco-trasero',
    sku: 'PROT-001',
    category: 'proteccion',
    vehicles: ['yamaha-raptor-700'],
    price: undefined,
    stock: undefined,
    description:
      'Soporte y protector de disco trasero en billet de aluminio. Protección total para uso en barro y piedra.',
    featured: false,
    tags: ['proteccion', 'frenos'],
  },
  {
    id: 'prod-010',
    name: 'ECU Programable - Vortex',
    slug: 'ecu-programable-vortex',
    sku: 'MOT-002',
    category: 'motor',
    vehicles: ['yamaha-yfz450r'],
    price: undefined,
    stock: undefined,
    description:
      'ECU de alto rendimiento programable. Mapas de ignición y combustible optimizados para cada configuración.',
    featured: true,
    tags: ['motor', 'electrónica', 'performance'],
  },
]

export const getFeaturedProducts = () => products.filter((p) => p.featured)
export const getProductBySlug = (slug: string) => products.find((p) => p.slug === slug)
export const getProductsByCategory = (category: string) =>
  products.filter((p) => p.category === category)
export const getProductsByVehicle = (vehicleId: string) =>
  products.filter((p) => p.vehicles.includes(vehicleId))
