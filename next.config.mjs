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
        // Prevent Cloudflare from caching page HTML — static assets (/_next/static/) are still cached by their content-hash filenames
        source: '/((?!_next/static|_next/image|favicon.ico|images).*)',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' }],
      },
    ]
  },
}

export default nextConfig
