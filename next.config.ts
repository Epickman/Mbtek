import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // El configurador por pasos se reemplazó por /personalizar
  async redirects() {
    return [
      { source: "/configurador", destination: "/personalizar", permanent: true },
      { source: "/configurador/:terrain(tierra|arena)", destination: "/personalizar", permanent: true },
      // Un solo catálogo: /productos quedó unificado en /tienda (los filtros de la URL se conservan)
      { source: "/productos", destination: "/tienda", permanent: true },
    ];
  },
};

export default nextConfig;
