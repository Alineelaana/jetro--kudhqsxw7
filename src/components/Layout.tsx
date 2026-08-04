import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingChat } from '@/components/floating-chat'

function isInternalPath(pathname: string): boolean {
  if (pathname === '/admin' || pathname === '/cliente') return true
  if (pathname.startsWith('/admin/produtos')) return true
  if (pathname.startsWith('/admin/cadastros')) return true
  if (pathname.startsWith('/admin/vendas')) return true
  if (pathname.startsWith('/admin/estoque')) return true
  return false
}

export default function Layout() {
  const { pathname } = useLocation()
  const showFooter = !isInternalPath(pathname)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

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
