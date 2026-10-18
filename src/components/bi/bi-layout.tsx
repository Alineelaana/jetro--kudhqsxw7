import { type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { Loader2, BarChart3 } from 'lucide-react'
import { canViewBI } from '@/lib/bi-permissions'
import { BIFilterProvider, BIFilterBar } from './bi-filters'

export function BiLayout({ children, title }: { children: ReactNode; title: string }) {
  const { isAuthenticated, loading, userRole } = useAuth()

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated || !canViewBI(userRole)) return <AdminLogin />

  return (
    <BIFilterProvider>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ModulePageHeader
          title={title}
          icon={BarChart3}
          breadcrumbs={[{ label: 'BI / Analytics', to: '/admin/bi' }, { label: title }]}
        />
        <BIFilterBar />
        <div className="w-full min-w-0">{children}</div>
      </div>
    </BIFilterProvider>
  )
}
