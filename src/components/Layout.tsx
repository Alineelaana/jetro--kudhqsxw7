import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingChat } from '@/components/floating-chat'
import { GlobalSearchBar } from '@/components/enterprise/global-search-bar'

function isInternalPath(pathname: string): boolean {
  if (pathname.startsWith('/admin')) return true
  if (pathname.startsWith('/cliente')) return true
  if (pathname.startsWith('/_')) return true
  return false
}

export default function Layout() {
  const { pathname } = useLocation()
  const showFooter = !isInternalPath(pathname)
  const showGlobalSearch = pathname.startsWith('/admin')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      {showGlobalSearch && (
        <div className="bg-muted/30 border-b px-4 py-2">
          <GlobalSearchBar />
        </div>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      {showFooter && <SiteFooter />}
      <FloatingChat />
    </div>
  )
}
