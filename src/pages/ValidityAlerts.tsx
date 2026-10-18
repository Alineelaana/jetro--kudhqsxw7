import { useAuth } from '@/hooks/use-auth'
import { canViewValidityAlerts } from '@/lib/validity-permissions'
import { AdminLogin } from '@/components/admin-login'
import { ValidityAlertsCenter } from '@/components/validity/validity-alerts-center'
import { ValidityDashboard } from '@/components/validity/validity-dashboard'
import { ValidityRulesConfig } from '@/components/validity/validity-rules-config'
import { ValidityChat } from '@/components/validity/validity-chat'
import { Loader2, CalendarClock } from 'lucide-react'

export default function ValidityAlerts({ screen }: { screen: string }) {
  const { isAuthenticated, loading, userRole } = useAuth()

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated || !canViewValidityAlerts(userRole)) return <AdminLogin />

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center gap-2 mb-4">
        <CalendarClock className="w-6 h-6 text-[#005B2E]" />
        <h1 className="text-2xl font-black text-[#005B2E]">Validade e Vencimentos</h1>
      </div>
      {screen === 'alerts' && <ValidityAlertsCenter />}
      {screen === 'dashboard' && <ValidityDashboard />}
      {screen === 'regras' && <ValidityRulesConfig />}
      {screen === 'chat' && <ValidityChat />}
    </div>
  )
}
