import { useState, lazy, Suspense } from 'react'
import { cn } from '@/lib/utils'
import { CadastroStandardScreen } from '@/components/cadastros/cadastro-standard-screen'
import { CADASTROS, CADASTRO_GROUPS } from '@/lib/cadastros-config'
import { Loader2 } from 'lucide-react'
import {
  Building2,
  GitBranch,
  Users,
  ShieldCheck,
  UserCircle,
  Truck,
  Boxes,
  Wrench,
  FolderTree,
  FolderGitBranch,
  Tag,
  Ruler,
  Receipt,
  BarChart3,
  Landmark,
  CreditCard,
  Wallet,
  Banknote,
  CalendarClock,
  BadgeDollarSign,
  Handshake,
  Table2,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  empresas: Building2,
  filiais: GitBranch,
  usuarios: Users,
  perfis_permissoes: ShieldCheck,
  clientes: UserCircle,
  fornecedores: UserCircle,
  transportadoras: Truck,
  produtos: Boxes,
  servicos: Wrench,
  categorias: FolderTree,
  subcategorias: FolderGitBranch,
  marcas: Tag,
  unidades_medida: Ruler,
  centros_custo: Receipt,
  plano_contas: BarChart3,
  bancos: Landmark,
  contas_bancarias: CreditCard,
  formas_pagamento: Wallet,
  condicoes_pagamento: CalendarClock,
  vendedores: BadgeDollarSign,
  representantes: Handshake,
  tabelas_precos: Table2,
}

const ProductsPanel = lazy(() =>
  import('@/components/products-panel').then((m) => ({ default: m.ProductsPanel })),
)
const ServicesOfferedPanel = lazy(() =>
  import('@/components/services-offered-panel').then((m) => ({ default: m.ServicesOfferedPanel })),
)
const UserManagement = lazy(() =>
  import('@/components/user-management').then((m) => ({ default: m.UserManagement })),
)
const PartnerManagement = lazy(() =>
  import('@/components/partner-management').then((m) => ({ default: m.PartnerManagement })),
)
const PricingTables = lazy(() =>
  import('@/components/pricing/pricing-tables').then((m) => ({ default: m.PricingTables })),
)

function ExistingComponent({ type }: { type: string }) {
  const fallback = (
    <div className="flex justify-center py-12">
      <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
    </div>
  )
  return (
    <Suspense fallback={fallback}>
      {type === 'products' && <ProductsPanel />}
      {type === 'services' && <ServicesOfferedPanel />}
      {type === 'users' && <UserManagement />}
      {type === 'partners' && <PartnerManagement />}
      {type === 'priceTables' && <PricingTables />}
    </Suspense>
  )
}

export function CadastrosPanel() {
  const [activeKey, setActiveKey] = useState('empresas')
  const activeConfig = CADASTROS.find((c) => c.key === activeKey)

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <aside className="lg:w-60 flex-shrink-0">
        <div className="lg:sticky lg:top-4 space-y-4">
          <h2 className="text-lg font-black text-[#005B2E] hidden lg:block">Cadastros</h2>
          <nav className="space-y-3 max-h-[70vh] overflow-y-auto lg:max-h-[calc(100vh-200px)]">
            {CADASTRO_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.keys.map((key) => {
                    const config = CADASTROS.find((c) => c.key === key)
                    if (!config) return null
                    const Icon = ICONS[key] || Building2
                    const isActive = activeKey === key
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveKey(key)}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left',
                          isActive
                            ? 'bg-[#005B2E] text-white shadow-md'
                            : 'text-foreground hover:bg-[#005B2E]/5',
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{config.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        {activeConfig &&
          (activeConfig.isNew ? (
            <CadastroStandardScreen config={activeConfig} />
          ) : (
            <ExistingComponent type={activeConfig.existingComponent || 'partners'} />
          ))}
      </div>
    </div>
  )
}
