import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { NotificationBell } from '@/components/notification-bell'
import { JetroOnlineChat } from '@/components/jetro-online/jetro-online-chat'
import { JetroCalendar } from '@/components/jetro-agenda/jetro-calendar'

export function IntelligentHomeScreen() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex flex-col min-h-full p-4 sm:p-6 max-w-7xl mx-auto w-full pb-12 space-y-6">
      {/* Barra de identificação superior discreta e profissional */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950 tracking-tight">
              Tela Inicial Inteligente
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#005B2E]/10 text-[#005B2E] border border-[#005B2E]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#005B2E]" />
              ERP Jetro
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1 font-medium">
            Assistente executivo com consultas em tempo real, inteligência de dados e agenda
            integrada
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
      </div>

      {/* 1ª área principal: Jetro On-line pronto pra responder */}
      <section className="w-full">
        <JetroOnlineChat className="min-h-[560px]" />
      </section>

      {/* 2ª área: Calendário Mensal e Agenda Corporativa Jetro ocupando toda a largura */}
      <section className="w-full">
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
