import type { Category } from '@/types'

// Product categories — real names from ATV industry
export const categories: Category[] = [
  { id: 'suspension',   name: 'Suspensión',     slug: 'suspension',   icon: '⬆',  order: 1 },
  { id: 'frenos',       name: 'Frenos',          slug: 'frenos',       icon: '🔴',  order: 2 },
  { id: 'transmision',  name: 'Transmisión',     slug: 'transmision',  icon: '⚙',  order: 3 },
  { id: 'ruedas',       name: 'Ruedas',          slug: 'ruedas',       icon: '⭕',  order: 4 },
  { id: 'neumaticos',   name: 'Neumáticos',      slug: 'neumaticos',   icon: '🔵',  order: 5 },
  { id: 'motor',        name: 'Motor',           slug: 'motor',        icon: '🔧',  order: 6 },
  { id: 'escape',       name: 'Escape',          slug: 'escape',       icon: '💨',  order: 7 },
  { id: 'admision',     name: 'Admisión / Filtros', slug: 'admision', icon: '🌬',  order: 8 },
  { id: 'proteccion',   name: 'Protección',      slug: 'proteccion',   icon: '🛡',  order: 9 },
  { id: 'embrague',     name: 'Embrague',        slug: 'embrague',     icon: '🔩',  order: 10 },
  { id: 'accesorios',   name: 'Accesorios',      slug: 'accesorios',   icon: '➕',  order: 11 },
]

export const getCategoryById = (id: string) => categories.find((c) => c.id === id)
