import { useAuth } from '@/hooks/use-auth'
import { NotificationBell } from '@/components/notification-bell'
import { DashboardsPanel } from '@/components/dashboards/dashboards-panel'

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
      <DashboardsPanel />
    </div>
  )
}
