/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Exportação HTML estática para Electron
  distDir: 'out',
  images: {
    unoptimized: true, // Necessário para exportação estática
  },
}

export default nextConfig;

