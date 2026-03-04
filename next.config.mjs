/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'electricmall.com.ng', pathname: '/wp-content/uploads/**' },
      { protocol: 'http', hostname: '172.16.16.117', port: '8019', pathname: '/wp-content/uploads/**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/webhooks/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ]
  },
}

export default nextConfig
