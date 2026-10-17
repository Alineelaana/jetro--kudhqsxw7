import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { NotificationBell } from '@/components/notification-bell'
import { DashboardsPanel } from '@/components/dashboards/dashboards-panel'
import { JetroOnlineChat } from '@/components/jetro-online/jetro-online-chat'

export function AdminDashboard() {
  const { signOut } = useAuth()

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <button onClick={signOut} className="text-gray-500 hover:text-red-500" title="Sair">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-8">
        <JetroOnlineChat />
        <div>
          <h3 className="text-base font-bold text-gray-800 mb-3">Indicadores Operacionais</h3>
          <DashboardsPanel />
        </div>
      </div>
    </div>
  )
}
