import { type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { Loader2, Truck } from 'lucide-react'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'

export function LogisticsLayout({ children, title }: { children: ReactNode; title: string }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <ModulePageHeader
        title={title}
        icon={Truck}
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Logística' }, { label: title }]}
      />
      {children}
    </div>
  )
}
