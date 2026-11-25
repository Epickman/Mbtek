#!/usr/bin/env python3
"""
Quita el fondo de las fotos de producto con IA (rembg + modelo BiRefNet) y las deja
en un cuadrado transparente de 1000 px, en webp.

Lee los originales de public/images/productos/ y escribe en public/images/productos-mbtek/
(las que usa la tienda, ver src/data/fotos.json).

Instalación (una vez, en un entorno aparte; el modelo baja ~1 GB la primera vez):
    python3 -m venv .venv-fotos && .venv-fotos/bin/pip install "rembg[cpu]" pillow

Uso:
    .venv-fotos/bin/python scripts/quitar-fondo.py              todas las fotos
    .venv-fotos/bin/python scripts/quitar-fondo.py 101010001    solo esos SKU
"""
import os
import sys

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public/images/productos')
DST = os.path.join(ROOT, 'public/images/productos-mbtek')
SIZE = 1000
MAX = 920  # el producto ocupa como mucho esto, el resto es margen transparente

only = set(sys.argv[1:])
files = sorted(f for f in os.listdir(SRC) if f.endswith('.webp') and (not only or f[:-5] in only))
session = new_session('birefnet-general')
os.makedirs(DST, exist_ok=True)

for i, f in enumerate(files):
    out = remove(Image.open(os.path.join(SRC, f)).convert('RGB'), session=session, post_process_mask=True)

    # Saca manchitas sueltas (menos del 2% de la pieza más grande)
    alpha = np.array(out.getchannel('A'))
    labels, n = ndimage.label(alpha > 8)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(alpha), labels, range(1, n + 1))
        keep = np.isin(labels, [k + 1 for k, z in enumerate(sizes) if z >= sizes.max() * 0.02])
        alpha[~keep] = 0
        out.putalpha(Image.fromarray(alpha))

    box = out.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    if not box:
        print(f'{f}: no se encontró el producto', flush=True)
        continue
    out = out.crop(box)
    out.thumbnail((MAX, MAX), Image.LANCZOS)
    canvas = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(out, ((SIZE - out.width) // 2, (SIZE - out.height) // 2), out)
    canvas.save(os.path.join(DST, f), 'WEBP', quality=88, method=6)
    print(f'{i + 1}/{len(files)} {f}', flush=True)
