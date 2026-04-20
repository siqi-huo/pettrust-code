import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 需要登录才能访问的路径
const protectedPaths = ['/dashboard', '/apply'];
// 仅限机构访问的路径
const shelterOnlyPaths = ['/dashboard/shelter'];
// 仅限领养人访问的路径
const adopterOnlyPaths = ['/dashboard/adopter', '/apply'];

export function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get('session_token')?.value;
    const userRole = request.cookies.get('user_role')?.value;
    const { pathname } = request.nextUrl;

    // 检查是否访问受保护路径
    const isProtected = protectedPaths.some(path => pathname.startsWith(path));
    if (isProtected && !sessionToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 角色权限校验
    if (userRole) {
        const isShelterPath = shelterOnlyPaths.some(path => pathname.startsWith(path));
        const isAdopterPath = adopterOnlyPaths.some(path => pathname.startsWith(path));

        if (isShelterPath && userRole !== 'shelter') {
            return NextResponse.redirect(new URL('/dashboard/adopter', request.url));
        }

        if (isAdopterPath && userRole !== 'adopter') {
            return NextResponse.redirect(new URL('/dashboard/shelter', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/apply/:path*'],
};