import { CommissionRulesPanel } from '@/components/commission-rules-panel'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { Loader2, Settings } from 'lucide-react'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { canManageCommissionRules } from '@/lib/commercial-responsibles-permissions'

export default function CommissionRules() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <AdminLogin />

  if (!canManageCommissionRules(user?.role)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <p className="text-center text-muted-foreground py-12">
          Você não tem permissão para acessar este módulo.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ModulePageHeader
        title="Regras de Comissão"
        icon={Settings}
        breadcrumbs={[
          { label: 'Admin', to: '/admin' },
          { label: 'Comercial' },
          { label: 'Regras de Comissão' },
        ]}
      />
      <CommissionRulesPanel />
    </div>
  )
}
