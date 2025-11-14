import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Variáveis de ambiente do Supabase não configuradas')
      return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it so that the
    // middleware constantly redirects users, making it impossible to use the app.

    let user = null
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      user = authUser
    } catch (error) {
      console.error('Erro ao obter usuário no middleware:', error)
      // Continuar sem usuário se houver erro
    }

    // Proteger rotas do dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!user) {
        // Não autenticado, redirecionar para login
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
        const redirectResponse = NextResponse.redirect(url)
        // Copiar cookies do supabaseResponse
        supabaseResponse.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
        })
        return redirectResponse
      }
    }

    // Redirecionar usuários autenticados que tentam acessar signup (mas permitir acesso ao login)
    if (request.nextUrl.pathname === '/signup' && user) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      const redirectResponse = NextResponse.redirect(url)
      // Copiar cookies do supabaseResponse
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      return redirectResponse
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely.

    return supabaseResponse
  } catch (error) {
    console.error('Erro no middleware:', error)
    // Em caso de erro, retornar resposta padrão para não quebrar a aplicação
    return NextResponse.next({ request })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

