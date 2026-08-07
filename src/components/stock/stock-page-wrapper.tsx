import { type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useSystemParams } from '@/hooks/use-system-params'
import { AdminLogin } from '@/components/admin-login'
import { Loader2, Boxes } from 'lucide-react'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'

export function StockPageWrapper({ children, title }: { children: ReactNode; title?: string }) {
  const { isAuthenticated, loading } = useAuth()
  const { getParamBool } = useSystemParams()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ModulePageHeader
        title={title || 'Estoque'}
        icon={Boxes}
        breadcrumbs={[
          { label: 'Admin', to: '/admin' },
          { label: 'Estoque' },
          ...(title ? [{ label: title }] : []),
        ]}
      />
      {getParamBool('Estoque', 'allow_negative_stock', false) && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Atenção: Estoque negativo permitido por configuração do sistema.
        </div>
      )}
      {children}
    </div>
  )
}
