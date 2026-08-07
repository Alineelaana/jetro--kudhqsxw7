import { type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { Loader2, HandCoins } from 'lucide-react'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { canViewSA } from '@/lib/supplier-allowance-permissions'

export function SaLayout({ children, title }: { children: ReactNode; title: string }) {
  const { isAuthenticated, loading, userRole } = useAuth()
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated || !canViewSA(userRole)) return <AdminLogin />
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ModulePageHeader
        title={title}
        icon={HandCoins}
        breadcrumbs={[
          { label: 'Admin', to: '/admin' },
          { label: 'Verbas de Fornecedores' },
          { label: title },
        ]}
      />
      {children}
    </div>
  )
}
