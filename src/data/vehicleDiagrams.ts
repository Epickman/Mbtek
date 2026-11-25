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
    // public/images/quad-yfz450r.png — Yamaha YFZ450R (1318×800); w/h = coordinate space of the hotspots below
    img: { src: '/images/quad-yfz450r.png', w: 1028, h: 624 },
    hotspots: {
      accesorios:  { cx: 663, cy: 31 },
      admision:    { cx: 515, cy: 226 },
      motor:       { cx: 573, cy: 328 },
      embrague:    { cx: 477, cy: 378 },
      transmision: { cx: 413, cy: 394 },
      proteccion:  { cx: 519, cy: 468 },
      escape:      { cx: 187, cy: 226 },
      suspension:  { cx: 799, cy: 285 },
      frenos:      { cx: 870, cy: 468 },
      ruedas:      { cx: 160, cy: 540 },
      neumaticos:  { cx: 967, cy: 538 },
    },
    shapes: {
      escape: [{ poly: [[94, 183], [140, 168], [273, 191], [312, 226], [308, 289], [265, 304], [101, 226], [92, 203]] }],
      suspension: [
        { poly: [[772, 242], [819, 242], [827, 331], [780, 335]] },
        { poly: [[343, 273], [398, 285], [367, 347], [328, 335]] },
      ],
      motor: [{ poly: [[546, 203], [624, 203], [647, 265], [624, 320], [593, 406], [530, 425], [452, 413], [437, 351], [468, 296], [546, 273]] }],
      embrague: [{ circle: [477, 378, 39] }],
      admision: [{ poly: [[484, 199], [546, 199], [546, 265], [484, 265]] }],
      transmision: [{ circle: [413, 394, 23] }],
      proteccion: [{ poly: [[437, 456], [593, 445], [601, 468], [445, 480]] }],
      frenos: [{ circle: [870, 468, 43] }, { circle: [160, 470, 39] }],
      ruedas: [{ ring: [870, 468, 148, 43] }, { ring: [160, 470, 140, 39] }],
      neumaticos: [{ ring: [870, 468, 148, 92] }, { ring: [160, 470, 140, 84] }],
      accesorios: [{ poly: [[601, 16], [686, 12], [718, 47], [729, 109], [686, 109], [663, 70], [604, 51]] }],
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
