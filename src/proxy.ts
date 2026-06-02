/* Proxy (ex-middleware) de Next 16: refresca la sesión de Supabase
   en cada request y protege las rutas privadas. */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function proxy(request: NextRequest) {
  // Si todavía no hay credenciales configuradas, no bloqueamos nada.
  if (!URL || !KEY || KEY.startsWith("PEGA_")) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(URL, KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const esAuth = pathname.startsWith("/auth");

  // Sin sesión → al login (salvo que ya estés en /auth)
  if (!user && !esAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }
  // Con sesión y en /auth → a la agenda
  if (user && esAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/agenda";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Corre en todo menos estáticos / imágenes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
