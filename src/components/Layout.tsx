import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingChat } from '@/components/floating-chat'
import { GlobalSearchBar } from '@/components/enterprise/global-search-bar'
import { AdminSidebar } from '@/components/admin-sidebar'
import { useAuth } from '@/hooks/use-auth'

function isInternalPath(pathname: string): boolean {
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
    window.scrollTo(0, 0)
  }, [pathname])

  if (showSidebar) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-muted/30 border-b px-4 py-2 shrink-0">
              <GlobalSearchBar />
            </div>
            <main className="flex-1 overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </div>
        <FloatingChat />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter && <SiteFooter />}
      <FloatingChat />
    </div>
  )
}
