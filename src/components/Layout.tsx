import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingChat } from '@/components/floating-chat'
import { PublicJehChat } from '@/components/public-jeh-chat'
import { JetroRightFloatingWidgets } from '@/components/jetro-right-floating-widgets'
import { JetroTourOverlay } from '@/components/jetro-tours/tour-overlay'
import { GlobalSearchBar } from '@/components/enterprise/global-search-bar'
import { AdminSidebar } from '@/components/admin-sidebar'
import { useAuth } from '@/hooks/use-auth'
import { canViewScreenDocs } from '@/lib/permissions'
import { ScreenLogicDrawer } from '@/components/screen-docs/screen-logic-drawer'
import { InactivityTracker } from '@/components/inactivity-tracker'
import { AttributionFooter } from '@/components/attribution-footer'
import { Button } from '@/components/ui/button'
import { FileCode2 } from 'lucide-react'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { JetroCustomizationDrawer } from '@/components/personalizacao/jetro-customization-drawer'

function isInternalPath(pathname: string): boolean {
  if (pathname === '/') return true
  if (pathname.startsWith('/admin')) return true
  if (pathname.startsWith('/cliente')) return true
  if (pathname.startsWith('/_')) return true
  return false
}

export default function Layout() {
  const { pathname } = useLocation()
  const { isAuthenticated, loading, userRole } = useAuth()
  const { preferences } = useUserPreferences()
  const [screenLogicOpen, setScreenLogicOpen] = useState(false)
  const canAccessDocs = canViewScreenDocs(userRole)
  const isAdmin = pathname.startsWith('/admin')
  // Quando autenticado na rota /site, também exibe o ambiente ERP com sidebar e home inteligente
  const isSitePath = pathname === '/site'
  const isAuthSite = isSitePath && isAuthenticated && !loading
  const showSidebar = (isAdmin || isAuthSite) && isAuthenticated && !loading
  const isHomePage = pathname === '/admin' || (isSitePath && isAuthenticated)
  const showFooter = !isInternalPath(pathname) && !(isSitePath && isAuthenticated)

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
        <InactivityTracker />
        {/* Fixar Cabeçalho: respeita preferência do usuário */}
        <div className={preferences.fixHeader ? 'sticky top-0 z-30 shrink-0' : 'shrink-0'}>
          <SiteHeader onOpenScreenLogic={() => setScreenLogicOpen(true)} />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Ocultar a barra de busca e botão duplicado na página inicial conforme solicitado pelo usuário */}
            {!isHomePage && (
              <div className="bg-muted/30 border-b px-4 py-2 shrink-0 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <GlobalSearchBar />
                </div>

                {canAccessDocs && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setScreenLogicOpen(true)}
                    className="shrink-0 h-9 px-3 text-xs font-semibold bg-background border-[#005B2E]/30 text-[#005B2E] hover:bg-[#005B2E] hover:text-white transition-colors shadow-2xs flex items-center gap-1.5"
                    title="Abrir especificação técnica e regras de negócio da tela atual"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Lógica da Tela</span>
                  </Button>
                )}
              </div>
            )}
            <main
              id="admin-main-content"
              className="flex-1 min-w-0 overflow-y-auto overscroll-contain flex flex-col justify-between admin-main-padded"
            >
              <div className="flex-1">
                <Outlet />
              </div>
              {/* Fixar Rodapé: respeita preferência do usuário */}
              <div
                className={
                  preferences.fixFooter
                    ? 'sticky bottom-0 z-20 bg-background/95 backdrop-blur-xs border-t border-border'
                    : ''
                }
              >
                <AttributionFooter variant="muted" context="sistema" />
              </div>
            </main>
          </div>
        </div>
        <JetroTourOverlay />
        <FloatingChat />
        <JetroCustomizationDrawer />
        <JetroRightFloatingWidgets />

        {canAccessDocs && (
          <ScreenLogicDrawer
            open={screenLogicOpen}
            onOpenChange={setScreenLogicOpen}
            currentRoute={pathname}
          />
        )}
      </div>
    )
  }

  const isRootLogin = pathname === '/'

  return (
    <div className="flex min-h-screen flex-col">
      <InactivityTracker />
      {!isRootLogin && <SiteHeader onOpenScreenLogic={() => setScreenLogicOpen(true)} />}
      <main className="flex-1 flex flex-col justify-between">
        <div className="flex-1">
          <Outlet />
        </div>
        {!showFooter && !isRootLogin && (
          <AttributionFooter
            variant="muted"
            context={isAdmin && isAuthenticated ? 'sistema' : 'site'}
          />
        )}
      </main>
      {showFooter && <SiteFooter />}
      <JetroTourOverlay />
      {!isRootLogin && <FloatingChat />}
      {!isRootLogin && <JetroCustomizationDrawer />}
      {!isRootLogin && <JetroRightFloatingWidgets />}
      {!isAuthenticated && <PublicJehChat />}

      {canAccessDocs && (
        <ScreenLogicDrawer
          open={screenLogicOpen}
          onOpenChange={setScreenLogicOpen}
          currentRoute={pathname}
        />
      )}
    </div>
  )
}
