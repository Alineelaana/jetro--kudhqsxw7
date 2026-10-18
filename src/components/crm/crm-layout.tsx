import { type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { Loader2, Users } from 'lucide-react'

export function CrmLayout({ children, title }: { children: ReactNode; title: string }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated) return <AdminLogin />

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ModulePageHeader
        title={title}
        icon={Users}
        breadcrumbs={[{ label: 'CRM', to: '/admin/crm' }, { label: title }]}
      />
      <div className="w-full min-w-0">{children}</div>
    </div>
  )
}
