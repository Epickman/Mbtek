#!/usr/bin/env python3
"""
Genera src/data/catalogo.json desde la planilla de Contabilium (planilla_base.xlsx).

Uso:
    python3 scripts/importar-catalogo.py ~/Downloads/planilla_base.xlsx

La planilla es la de importación de productos de Contabilium: las filas 1-4 son
encabezado, explicación y ejemplos; los productos empiezan en la fila 5.
Columnas usadas: B Nombre, C SKU, D Tipo, E Estado, H Rubro, J descripción,
K código proveedor, O Marca, V precio unitario.
Se omiten servicios (Tipo S) e inactivos (Estado I). Precio 0 = "Consultar precio".
Solo usa la librería estándar (no hace falta instalar nada).
"""
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
FIRST_PRODUCT_ROW = 5
OUT = Path(__file__).resolve().parent.parent / 'src' / 'data' / 'catalogo.json'


def read_rows(xlsx: str):
    with zipfile.ZipFile(xlsx) as z:
        strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            for si in ET.fromstring(z.read('xl/sharedStrings.xml')):
                strings.append(''.join(t.text or '' for t in si.iter(NS + 't')))
        sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
    for row in sheet.iter(NS + 'row'):
        cells = {}
        for c in row:
            col = re.match(r'[A-Z]+', c.get('r')).group()
            v = c.find(NS + 'v')
            if v is None:
                t = c.find('.//' + NS + 't')
                val = t.text if t is not None else None
            else:
                val = strings[int(v.text)] if c.get('t') == 's' else v.text
            if val is not None and str(val).strip():
                cells[col] = str(val).strip()
        yield int(row.get('r')), cells


def to_price(raw: str | None) -> int:
    try:
        return max(0, round(float(str(raw).replace(',', '.'))))
    except (TypeError, ValueError):
        return 0


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    items, seen = [], set()
    for n, r in read_rows(sys.argv[1]):
        if n < FIRST_PRODUCT_ROW or not r.get('B') or not r.get('C'):
            continue
        if r.get('D', 'P').upper().startswith('S') or r.get('E', 'A').upper().startswith('I'):
            continue
        sku = r['C']
        if sku in seen:
            print(f'Fila {n}: SKU repetido {sku}, se omite', file=sys.stderr)
            continue
        seen.add(sku)
        items.append({
            'sku': sku,
            'nombre': re.sub(r'\s+', ' ', r['B']),
            'rubro': r.get('H', ''),
            # Excel guarda la marca "100%" como el número 1
            'marca': '100%' if r.get('O') == '1' else r.get('O', ''),
            'codigoProveedor': r.get('K', ''),
            'descripcion': r.get('J', ''),
            'precio': to_price(r.get('V')),
        })
    OUT.write_text(json.dumps(items, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    sin_precio = sum(1 for i in items if not i['precio'])
    print(f'{len(items)} productos -> {OUT.relative_to(Path.cwd()) if OUT.is_relative_to(Path.cwd()) else OUT} ({sin_precio} sin precio)')


if __name__ == '__main__':
    main()
