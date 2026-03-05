import { type NextRequest, NextResponse } from 'next/server'

/**
 * Prevent Cloudflare (and any CDN) from caching HTML pages.
 * Static assets under /_next/static/ are still immutably cached via
 * their content-hash filenames — this only strips caching from page HTML.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static assets — they have content-hash names and should be immutably cached
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/images') ||
    pathname.match(/\.(ico|png|svg|jpg|jpeg|webp|woff2?|css|js)$/)
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next()
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  response.headers.set('CDN-Cache-Control', 'no-store')
  response.headers.set('Cloudflare-CDN-Cache-Control', 'no-store')
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
