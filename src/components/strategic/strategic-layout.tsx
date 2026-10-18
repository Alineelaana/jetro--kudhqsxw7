import { type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { Loader2, Target } from 'lucide-react'
import { canViewStrategic } from '@/lib/strategic-permissions'
import { AdminBackButton } from '@/components/admin-back-button'

export function StrategicLayout({ children, title }: { children: ReactNode; title: string }) {
  const { isAuthenticated, loading, userRole } = useAuth()

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated || !canViewStrategic(userRole)) return <AdminLogin />

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-2">
        <AdminBackButton fallback="/admin" label="Voltar" />
      </div>
      <ModulePageHeader
        title={title}
        icon={Target}
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Estratégia' }, { label: title }]}
      />
      <div className="w-full min-w-0">{children}</div>
    </div>
  )
}
