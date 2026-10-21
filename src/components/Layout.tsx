import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState, useMemo, Suspense } from 'react'
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
import { checkProfileScreenAccess, loadProfilesCache } from '@/lib/profile-permissions'
import { ScreenLogicDrawer } from '@/components/screen-docs/screen-logic-drawer'
import { InactivityTracker } from '@/components/inactivity-tracker'
import { AttributionFooter } from '@/components/attribution-footer'
import { Button } from '@/components/ui/button'
import { FileCode2, ShieldAlert } from 'lucide-react'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { JetroCustomizationDrawer } from '@/components/personalizacao/jetro-customization-drawer'
import { ModuleErrorBoundary } from '@/components/module-error-boundary'
import { cn } from '@/lib/utils'

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
  const [profilesReady, setProfilesReady] = useState(false)
  const [profilesVersion, setProfilesVersion] = useState(0)
  const canAccessDocs = canViewScreenDocs(userRole)
  const isAdmin = pathname.startsWith('/admin')
  // Usuário autenticado na rota /site é redirecionado pelo Index para /admin.
  // showSidebar exibe sidebar nas rotas administrativas
  const showSidebar = isAdmin && isAuthenticated && !loading
  const isHomePage = pathname === '/admin'
  const isSite = pathname === '/site'
  const showFooter = !isInternalPath(pathname) && (!isAuthenticated || !isSite)

  useEffect(() => {
    loadProfilesCache(true)
      .then(() => {
        setProfilesReady(true)
        setProfilesVersion((v) => v + 1)
      })
      .catch(() => {
        setProfilesReady(true)
        setProfilesVersion((v) => v + 1)
      })
  }, [userRole])

  // Delimitação do usuário: verificar se o perfil do usuário pode visualizar a rota ativa
  const hasRouteAccess = useMemo(() => {
    if (!isAdmin || isHomePage) return true
    if (!userRole) return false
    if (userRole.toUpperCase() === 'SUP') return true
    // Enquanto o cache de perfis carrega na inicialização, aguardar (evita falso positivo ou liberação indevida)
    if (!profilesReady) return true
    return checkProfileScreenAccess(userRole, pathname, 'v')
  }, [isAdmin, isHomePage, userRole, pathname, profilesReady, profilesVersion])

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

  // Redirecionamento preventivo de nível de layout: se o usuário já estiver autenticado e tentar acessar /site, manda direto para /admin
  if (isSite && isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

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
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            {/* Ocultar a barra de busca e botão duplicado na página inicial conforme solicitado pelo usuário */}
            {!isHomePage && (
              <div className="bg-[#F8FAF9] border-b border-[#E4EAE6] px-4 py-2 shrink-0 flex items-center justify-between gap-3 pr-12 sm:pr-14">
                <div className="flex-1 min-w-0">
                  <GlobalSearchBar />
                </div>

                {canAccessDocs && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setScreenLogicOpen(true)}
                    className="shrink-0 h-9 px-3 text-xs font-semibold bg-background border-[#063D30]/30 text-[#063D30] hover:bg-[#063D30] hover:text-white transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
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
              className="flex-1 min-w-0 overflow-y-auto overscroll-contain flex flex-col justify-between admin-main-padded pr-12 sm:pr-14 bg-background"
            >
              <div className="flex-1">
                <ModuleErrorBoundary
                  key={pathname}
                  moduleName={pathname.replace('/admin', '') || 'Início'}
                >
                  {!hasRouteAccess ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center max-w-lg mx-auto">
                      <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                        <ShieldAlert className="w-8 h-8" />
                      </div>
                      <h2 className="text-xl font-bold text-foreground mb-2">
                        Acesso Restrito pelo Perfil
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        Seu perfil de acesso atual (<strong>{userRole}</strong>) não possui
                        permissão de visualização para esta tela. Caso precise de acesso, solicite a
                        alteração do seu perfil a um administrador do sistema.
                      </p>
                      <Button
                        type="button"
                        onClick={() => window.history.back()}
                        className="bg-[#063D30] hover:bg-[#063D30]/90 text-white font-semibold"
                      >
                        Voltar à tela anterior
                      </Button>
                    </div>
                  ) : (
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center min-h-[40vh] w-full p-8">
                          <div className="w-7 h-7 rounded-full border-2 border-[#063D30] border-t-transparent animate-spin" />
                        </div>
                      }
                    >
                      <Outlet />
                    </Suspense>
                  )}
                </ModuleErrorBoundary>
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
      <main
        className={cn('flex-1 flex flex-col justify-between', isAuthenticated && 'pr-12 sm:pr-14')}
      >
        <div className="flex-1">
          <ModuleErrorBoundary key={pathname} moduleName={pathname || 'Portal'}>
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[40vh] w-full p-8">
                  <div className="w-7 h-7 rounded-full border-2 border-[#063D30] border-t-transparent animate-spin" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </ModuleErrorBoundary>
        </div>
        {!showFooter && !isRootLogin && (
          <AttributionFooter
            variant="muted"
            context={isAdmin && isAuthenticated ? 'sistema' : 'site'}
          />
        )}
      </main>
      {showFooter && <SiteFooter />}
      {isAuthenticated && <JetroTourOverlay />}
      {isAuthenticated && <FloatingChat />}
      {isAuthenticated && <JetroCustomizationDrawer />}
      {isAuthenticated && <JetroRightFloatingWidgets />}
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
