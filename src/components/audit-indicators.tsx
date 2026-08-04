import { Card, CardContent } from '@/components/ui/card'
import {
  Activity,
  AlertTriangle,
  LogIn,
  LogOut,
  DollarSign,
  FileText,
  Wallet,
  Shield,
  Download,
  Upload,
  Brain,
  Code,
  Link2,
} from 'lucide-react'

interface IndicatorDef {
  label: string
  statKey: string
  filterKey: string
  filterValue: string
  icon: typeof Activity
  color: string
  bg: string
}

const INDICATORS: IndicatorDef[] = [
  {
    label: 'Total de Eventos',
    statKey: 'total',
    filterKey: '',
    filterValue: '',
    icon: Activity,
    color: 'text-[#005B2E]',
    bg: 'bg-[#005B2E]/10',
  },
  {
    label: 'Eventos Críticos',
    statKey: 'critical',
    filterKey: 'criticidade',
    filterValue: 'Crítica',
    icon: AlertTriangle,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    label: 'Logins',
    statKey: 'logins',
    filterKey: 'action',
    filterValue: 'login',
    icon: LogIn,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    label: 'Logins Inválidos',
    statKey: 'loginFailed',
    filterKey: 'action',
    filterValue: 'login_failed',
    icon: LogOut,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    label: 'Alt. de Preços',
    statKey: 'priceChanges',
    filterKey: 'module',
    filterValue: 'pricing',
    icon: DollarSign,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    label: 'Alt. Fiscais',
    statKey: 'fiscalChanges',
    filterKey: 'keyword',
    filterValue: 'fiscal',
    icon: FileText,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    label: 'Alt. Financeiras',
    statKey: 'financialChanges',
    filterKey: 'keyword',
    filterValue: 'finance',
    icon: Wallet,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    label: 'Alt. de Permissões',
    statKey: 'permissionChanges',
    filterKey: 'action',
    filterValue: 'permission_change',
    icon: Shield,
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    label: 'Exportações',
    statKey: 'exports',
    filterKey: 'origem',
    filterValue: 'Exportação',
    icon: Download,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    label: 'Importações',
    statKey: 'imports',
    filterKey: 'origem',
    filterValue: 'Importação',
    icon: Upload,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    label: 'Ações IA',
    statKey: 'aiActions',
    filterKey: 'origem',
    filterValue: 'Inteligência Artificial',
    icon: Brain,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
  {
    label: 'Ações API',
    statKey: 'apiActions',
    filterKey: 'origem',
    filterValue: 'API',
    icon: Code,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
  },
  {
    label: 'Integrações',
    statKey: 'integrationActions',
    filterKey: 'origem',
    filterValue: 'Integração',
    icon: Link2,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
]

interface Props {
  stats: Record<string, number>
  onClick: (filterKey: string, filterValue: string) => void
}

export function AuditIndicators({ stats, onClick }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
      {INDICATORS.map((ind) => {
        const Icon = ind.icon
        const value = stats[ind.statKey] ?? 0
        return (
          <button
            key={ind.label}
            onClick={() => onClick(ind.filterKey, ind.filterValue)}
            className="text-left transition-transform hover:scale-105 active:scale-95"
          >
            <Card className="border-2 border-transparent hover:border-[#005B2E]/30 transition-colors">
              <CardContent className="p-3 flex flex-col items-center text-center gap-1">
                <div className={`w-8 h-8 rounded-full ${ind.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${ind.color}`} />
                </div>
                <span className="text-lg font-black text-foreground">{value}</span>
                <span className="text-[10px] leading-tight text-muted-foreground">{ind.label}</span>
              </CardContent>
            </Card>
          </button>
        )
      })}
    </div>
  )
}
