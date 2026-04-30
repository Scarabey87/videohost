/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server Actions включены по умолчанию в Next 15+, но явно укажем для надёжности
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.github.dev'],
    },
  },

  // Безопасность: заголовки
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },

  // Оптимизация изображений (если будете добавлять аватары)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // Компрессия
  compress: true,

  // React 19 совместимость
  reactStrictMode: true,
}

module.exports = nextConfig