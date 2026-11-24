import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Fotos de productos subidas desde el panel /admin/fotos (Vercel Blob)
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  // El logo que se estampa en las fotos subidas desde el panel (src/lib/photoStudio.mjs)
  outputFileTracingIncludes: { "/admin/**": ["./public/brand/mbtek-logo.png"] },
  experimental: {
    // Las fotos se achican en el navegador antes de subir; esto deja margen (Vercel admite hasta 4,5 MB)
    serverActions: { bodySizeLimit: "4mb" },
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
