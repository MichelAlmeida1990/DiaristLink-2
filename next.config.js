/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuração para Capacitor - export estático necessário
  output: process.env.CAPACITOR === 'true' ? 'export' : undefined,
  images: {
    unoptimized: process.env.CAPACITOR === 'true',
  },
}

module.exports = nextConfig

