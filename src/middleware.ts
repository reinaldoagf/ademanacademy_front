import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtPayload {
  sub: string;
  email: string;
  isAdmin: string;
  exp: number;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Intentar recuperar la cookie con el JWT generado por el backend
  const token = req.cookies.get('auth_token')?.value;

  // 2. Control para usuarios NO autenticados
  if (!token) {
    if (pathname.startsWith('/admin')) {
      const loginUrl = new URL('/login', req.url);
      // Adjuntamos la página de destino original para redirigir tras loguearse
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Control para usuarios autenticados: Extraer y validar datos del JWT
  try {
    // Un JWT está estructurado como: Header.Payload.Signature
    const partesToken = token.split('.');
    if (partesToken.length !== 3) throw new Error('Token inválido');

    // Decodificar el bloque central (Payload) de Base64 de forma nativa en Edge
    const payloadCodificado = partesToken[1];
    const datosDecodificados = atob(payloadCodificado);
    const payload: JwtPayload = JSON.parse(datosDecodificados);

    // Verificación de expiración del token (exp viene en segundos de Unix)
    const timestampActual = Math.floor(Date.now() / 1000);
    if (payload.exp && timestampActual >= payload.exp) {
      throw new Error('Token expirado');
    }

    const isAdmin = payload.isAdmin;

    // Protección de rutas de Administrador
    if (pathname.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/403', req.url));
    }

  } catch (error) {
    // Si el token fue manipulado, está corrupto o expiró, borramos la sesión y mandamos a login
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('auth_token');
    return response;
  }

  return NextResponse.next();
}

// Configuración de rutas que disparan este middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/organizador/:path*',
    '/403'
  ],
};