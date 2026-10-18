import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { NotificationBell } from '@/components/notification-bell'
import { CentralChamadosHomeWidget } from '@/components/chamados/central-chamados-home-widget'
import { JetroCalendar } from '@/components/jetro-agenda/jetro-calendar'

export function IntelligentHomeScreen() {
  const { user, signOut } = useAuth()

  return (
    <div
      className="flex flex-col min-h-full p-4 sm:p-6 max-w-7xl mx-auto w-full pb-12 space-y-6"
      data-tour-id="admin-home-header"
    >
      {/* Barra superior com controles funcionais (Notificações e Sair) */}
      <div className="flex items-center justify-end gap-2.5 px-0.5 pt-1 pb-1">
        <NotificationBell />
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-red-600 transition-colors px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 cursor-pointer shadow-2xs"
          title="Encerrar sessão"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>

      {/* 1ª área principal: Central de Chamados do usuário (Substitui o centro do Jetro On-line, que agora abre na barra lateral) */}
      <section className="w-full" data-tour-id="admin-home-chamados">
        <CentralChamadosHomeWidget />
      </section>

      {/* 2ª área: Calendário Mensal e Agenda Corporativa Jetro mantidos intactos imediatamente abaixo */}
      <section className="w-full" data-tour-id="admin-home-cards">
        <JetroCalendar
          currentUser={
            user
              ? {
                  id: String(user.id || ''),
                  email: String(user.email || ''),
                  name: (user as { name?: string })?.name
                    ? String((user as { name?: string }).name)
                    : undefined,
                }
              : undefined
          }
        />
      </section>
    </div>
  )
}
