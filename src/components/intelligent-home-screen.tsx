import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { NotificationBell } from '@/components/notification-bell'
import { JetroOnlineChat } from '@/components/jetro-online/jetro-online-chat'

export function IntelligentHomeScreen() {
  const { signOut } = useAuth()

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Tela Inicial Inteligente
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Assistente inteligente nativo do ERP Jetro — pronto para responder consultas e análises
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={signOut}
            className="text-gray-500 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
            title="Sair"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <JetroOnlineChat className="h-full border border-gray-200/90 shadow-sm" />
      </div>
    </div>
  )
}
