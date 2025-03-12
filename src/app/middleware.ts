import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const userAgent = req.headers.get('user-agent') || '';
  const isMobile = /android|iphone|ipad|ipod/i.test(userAgent.toLowerCase());

  if (isMobile) {
    return NextResponse.redirect(new URL('/unsupported', req.url));
  }

  return NextResponse.next();
}

// Apply middleware to all routes except `/unsupported`
export const config = {
  matcher: ['/((?!unsupported).*)'],
};
