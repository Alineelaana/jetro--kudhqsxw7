import { type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { ModulePageHeader } from '@/components/enterprise/module-page-header'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Loader2, Megaphone, Plus, Printer } from 'lucide-react'
import { canViewTradeMarketing } from '@/lib/trade-marketing-permissions'
import { ACTION_STATUS } from '@/lib/trade-marketing-types'
import type { TmFilters } from '@/lib/trade-marketing-types'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'cockpit', label: 'Cockpit' },
  { id: 'calendar', label: 'Calendário' },
  { id: 'kanban', label: 'Kanban' },
  { id: 'list', label: 'Lista' },
]

interface TmLayoutProps {
  children: ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  onNew: () => void
  onPrint: () => void
  filters: TmFilters
  onFiltersChange: (filters: TmFilters) => void
}

export function TmLayout({
  children,
  activeTab,
  onTabChange,
  onNew,
  onPrint,
  filters,
  onFiltersChange,
}: TmLayoutProps) {
  const { isAuthenticated, loading, userRole } = useAuth()
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!isAuthenticated || !canViewTradeMarketing(userRole)) return <AdminLogin />

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <ModulePageHeader
        title="Trade Marketing"
        icon={Megaphone}
        breadcrumbs={[{ label: 'Admin', to: '/admin' }, { label: 'Trade & Marketing' }]}
      />
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={cn(activeTab === tab.id && 'bg-[#005B2E] hover:bg-[#01361D]')}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select
          value={filters.scope}
          onValueChange={(v) => onFiltersChange({ ...filters, scope: v })}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="corporate">Corporativo</SelectItem>
            <SelectItem value="mine">Minhas ações</SelectItem>
            <SelectItem value="team">Equipe</SelectItem>
            <SelectItem value="branch">Filial</SelectItem>
            <SelectItem value="region">Região</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, status: v === 'all' ? '' : v })}
        >
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {ACTION_STATUS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filters.startDate}
          onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value })}
          className="h-8 w-36 text-xs"
        />
        <Input
          type="date"
          value={filters.endDate}
          onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value })}
          className="h-8 w-36 text-xs"
        />
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="w-4 h-4 mr-1" /> Imprimir
          </Button>
          <Button size="sm" onClick={onNew} className="bg-[#005B2E] hover:bg-[#01361D]">
            <Plus className="w-4 h-4 mr-1" /> Nova Ação
          </Button>
        </div>
      </div>
      {children}
    </div>
  )
}
