// Interactive diagrams for /personalizar: one illustration per vehicle type,
// with a hotspot and an approximate outline for each part (= product category).
// All coordinates are in the illustration's pixel space.

export type DiagramType = 'atv' | 'mx'

export type DiagramShape =
  | { poly: [number, number][] }
  | { circle: [number, number, number] }            // cx, cy, r
  | { ring: [number, number, number, number] }      // cx, cy, r outer, r inner

export interface VehicleDiagram {
  type: DiagramType
  name: string
  description: string
  img: { src: string; w: number; h: number }
  hotspots: Record<string, { cx: number; cy: number }>
  shapes: Record<string, DiagramShape[]>
}

export const vehicleDiagrams: Record<DiagramType, VehicleDiagram> = {
  atv: {
    type: 'atv',
    name: 'ATV',
    description: 'Cuatriciclos deportivos y utilitarios',
    // public/images/quad-ilustracion.png (2636×1600); w/h = coordinate space of the hotspots below
    img: { src: '/images/quad-ilustracion.png', w: 1028, h: 624 },
    hotspots: {
      accesorios:  { cx: 640, cy: 38 },
      admision:    { cx: 603, cy: 150 },
      motor:       { cx: 580, cy: 270 },
      embrague:    { cx: 490, cy: 372 },
      transmision: { cx: 395, cy: 420 },
      proteccion:  { cx: 530, cy: 462 },
      escape:      { cx: 170, cy: 215 },
      suspension:  { cx: 790, cy: 285 },
      frenos:      { cx: 870, cy: 465 },
      ruedas:      { cx: 158, cy: 538 },
      neumaticos:  { cx: 960, cy: 545 },
    },
    shapes: {
      escape: [{ poly: [[68, 176], [110, 172], [235, 205], [290, 240], [292, 300], [255, 298], [100, 232], [70, 225]] }],
      suspension: [
        { poly: [[758, 235], [815, 238], [822, 335], [770, 338]] },
        { poly: [[345, 268], [400, 272], [385, 350], [330, 340]] },
      ],
      motor: [{ poly: [[505, 200], [590, 190], [650, 215], [655, 270], [610, 340], [560, 350], [505, 330], [495, 260]] }],
      embrague: [{ circle: [490, 372, 44] }],
      admision: [{ poly: [[545, 110], [590, 104], [662, 118], [665, 192], [600, 198], [540, 182]] }],
      transmision: [{ circle: [395, 420, 32] }],
      proteccion: [{ poly: [[440, 456], [605, 442], [615, 465], [445, 482]] }],
      frenos: [{ circle: [870, 465, 45] }, { circle: [152, 462, 40] }],
      ruedas: [{ ring: [868, 463, 152, 45] }, { ring: [158, 468, 145, 40] }],
      neumaticos: [{ ring: [868, 463, 152, 92] }, { ring: [158, 468, 145, 90] }],
      accesorios: [{ poly: [[598, 15], [690, 10], [720, 40], [735, 105], [690, 110], [665, 70], [598, 55]] }],
    },
  },
  mx: {
    type: 'mx',
    name: 'MX',
    description: 'Motos de motocross y enduro',
    // public/images/mx-ilustracion.webp — from MXpartido.png, background removed
    img: { src: '/images/mx-ilustracion.webp', w: 1110, h: 686 },
    hotspots: {
      accesorios:  { cx: 680, cy: 38 },
      admision:    { cx: 355, cy: 262 },
      motor:       { cx: 600, cy: 300 },
      embrague:    { cx: 515, cy: 420 },
      transmision: { cx: 175, cy: 462 },
      proteccion:  { cx: 585, cy: 485 },
      escape:      { cx: 198, cy: 245 },
      suspension:  { cx: 800, cy: 255 },
      frenos:      { cx: 965, cy: 470 },
      ruedas:      { cx: 175, cy: 602 },
      neumaticos:  { cx: 1040, cy: 585 },
    },
    shapes: {
      escape: [{ poly: [[150, 220], [200, 207], [240, 214], [265, 265], [230, 285], [155, 268]] }],
      suspension: [
        { poly: [[712, 92], [758, 82], [870, 350], [935, 495], [905, 512], [830, 360]] },
        { poly: [[440, 245], [485, 250], [470, 345], [425, 340]] },
      ],
      motor: [{ poly: [[540, 235], [640, 225], [665, 260], [650, 380], [600, 395], [555, 380], [530, 300]] }],
      embrague: [{ circle: [515, 420, 50] }],
      admision: [{ poly: [[300, 215], [400, 205], [420, 300], [340, 320], [290, 290]] }],
      transmision: [{ ring: [175, 515, 58, 20] }, { circle: [470, 405, 28] }],
      proteccion: [{ poly: [[505, 470], [650, 455], [660, 495], [560, 515], [505, 500]] }],
      frenos: [{ circle: [928, 505, 75] }, { circle: [255, 530, 30] }],
      ruedas: [{ ring: [928, 505, 170, 75] }, { ring: [175, 515, 165, 58] }],
      neumaticos: [{ ring: [928, 505, 170, 130] }, { ring: [175, 515, 165, 122] }],
      accesorios: [{ poly: [[640, 20], [705, 12], [740, 50], [720, 75], [655, 60]] }],
    },
  },
}

export const isDiagramType = (v: unknown): v is DiagramType => v === 'atv' || v === 'mx'
