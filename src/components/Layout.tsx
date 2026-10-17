import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingChat } from '@/components/floating-chat'
import { GlobalSearchBar } from '@/components/enterprise/global-search-bar'
import { AdminSidebar } from '@/components/admin-sidebar'
import { useAuth } from '@/hooks/use-auth'

function isInternalPath(pathname: string): boolean {
  if (pathname === '/') return true
  if (pathname.startsWith('/admin')) return true
  if (pathname.startsWith('/cliente')) return true
  if (pathname.startsWith('/_')) return true
  return false
}

export default function Layout() {
  const { pathname } = useLocation()
  const { isAuthenticated, loading } = useAuth()
  const isAdmin = pathname.startsWith('/admin')
  const showSidebar = isAdmin && isAuthenticated && !loading
  const showFooter = !isInternalPath(pathname)

  useEffect(() => {
    if (!isAdmin) {
      window.scrollTo(0, 0)
    }
    // Quando em rota admin com sidebar, resetamos o scroll da área de conteúdo (main) para o topo,
    // garantindo que a nova tela abra no topo sem interferir na barra de rolagem do menu lateral.
    if (isAdmin) {
      const contentMain = document.getElementById('admin-main-content')
      if (contentMain) {
        contentMain.scrollTop = 0
      }
    }
  }, [pathname, isAdmin])

  if (showSidebar) {
    return (
      <div className="flex h-screen flex-col overflow-hidden">
        <SiteHeader />
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <div className="bg-muted/30 border-b px-4 py-2 shrink-0">
              <GlobalSearchBar />
            </div>
            <main
              id="admin-main-content"
              className="flex-1 min-w-0 overflow-y-auto overscroll-contain"
            >
              <Outlet />
            </main>
          </div>
        </div>
        <FloatingChat />
      </div>
    )
  }

  const isRootLogin = pathname === '/'

  return (
    <div className="flex min-h-screen flex-col">
      {!isRootLogin && <SiteHeader />}
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter && <SiteFooter />}
      {!isRootLogin && <FloatingChat />}
    </div>
  )
}
