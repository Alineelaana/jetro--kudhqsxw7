import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { canAccessCop, canAccessCopArea } from '@/lib/cop-permissions'
import { getMfaStatus } from '@/services/mfa'
import {
  AlertCircle,
  ShieldAlert,
  Activity,
  Bug,
  GitBranch,
  Rocket,
  HardDrive,
  Lock,
} from 'lucide-react'
import { CopCockpit } from '@/components/cop/cop-cockpit'
import { CopErrors } from '@/components/cop/cop-errors'
import { CopMigrations } from '@/components/cop/cop-migrations'
import { CopReleases } from '@/components/cop/cop-releases'
import { CopBackups } from '@/components/cop/cop-backups'
import { CopSecurity } from '@/components/cop/cop-security'
import { AdminBackButton } from '@/components/admin-back-button'

const NAV_ITEMS = [
  { to: '/admin/cop/cockpit', label: 'Cockpit TI', icon: Activity, screen: 'cockpit' },
  { to: '/admin/cop/errors', label: 'Central de Erros', icon: Bug, screen: 'errors' },
  { to: '/admin/cop/migrations', label: 'Migrations', icon: GitBranch, screen: 'migrations' },
  { to: '/admin/cop/releases', label: 'Deploys & Releases', icon: Rocket, screen: 'releases' },
  { to: '/admin/cop/backups', label: 'Backups', icon: HardDrive, screen: 'backups' },
  { to: '/admin/cop/security', label: 'Segurança', icon: Lock, screen: 'security' },
]

export function CopLayout({ screen }: { screen: string }) {
  const { user, userRole } = useAuth()
  const perfilAcesso = (user?.perfil_acesso as string) || ''
  const [mfaStatus, setMfaStatus] = useState<{ loading: boolean; active: boolean }>({
    loading: true,
    active: false,
  })

  useEffect(() => {
    getMfaStatus()
      .then((s) => setMfaStatus({ loading: false, active: s.mfa_active }))
      .catch(() => setMfaStatus({ loading: false, active: false }))
  }, [])

  if (!canAccessCop(userRole, perfilAcesso)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-destructive">Acesso Negado</h2>
        <p className="text-muted-foreground mt-2">
          Você não tem permissão para acessar o Centro de Operações da Plataforma.
        </p>
      </div>
    )
  }

  if (!mfaStatus.loading && !mfaStatus.active) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold">MFA Obrigatório</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          O acesso ao COP requer autenticação multifator (MFA) ativa. Configure o MFA nas
          configurações de segurança antes de continuar.
        </p>
      </div>
    )
  }

  const visibleItems = NAV_ITEMS.filter((item) =>
    canAccessCopArea(item.screen, userRole, perfilAcesso),
  )
  const canAccessCurrent = canAccessCopArea(screen, userRole, perfilAcesso)

  const renderScreen = () => {
    if (!canAccessCurrent)
      return (
        <p className="text-center text-muted-foreground py-12">
          Você não tem permissão para acessar esta área.
        </p>
      )
    switch (screen) {
      case 'cockpit':
        return <CopCockpit />
      case 'errors':
        return <CopErrors />
      case 'migrations':
        return <CopMigrations />
      case 'releases':
        return <CopReleases />
      case 'backups':
        return <CopBackups />
      case 'security':
        return <CopSecurity />
      default:
        return <CopCockpit />
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <AdminBackButton fallback="/admin" />
        <Activity className="w-7 h-7 text-[#005B2E]" />
        <div>
          <h1 className="text-2xl font-black text-foreground">Centro de Operações</h1>
          <p className="text-sm text-muted-foreground">
            Plataforma · {perfilAcesso || 'Superusuário'}
          </p>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {visibleItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  screen === item.screen
                    ? 'bg-[#005B2E] text-white'
                    : 'text-muted-foreground hover:bg-[#005B2E]/10 hover:text-[#005B2E]',
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="flex-1 min-w-0">{renderScreen()}</div>
      </div>
    </div>
  )
}
