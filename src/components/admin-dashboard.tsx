import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { NotificationBell } from '@/components/notification-bell'
import { DashboardsPanel } from '@/components/dashboards/dashboards-panel'

export function AdminDashboard() {
  const { signOut } = useAuth()

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-6 px-1">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dashboard Operacional</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Indicadores e gráficos de produtividade, orçamentos e atendimentos do ERP HURAM
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
      <div>
        <DashboardsPanel />
      </div>
    </div>
  )
}
