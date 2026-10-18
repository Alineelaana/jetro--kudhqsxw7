import { lazy, Suspense } from 'react'
import { CadastroStandardScreen } from '@/components/cadastros/cadastro-standard-screen'
import { CADASTROS } from '@/lib/cadastros-config'
import { Loader2 } from 'lucide-react'

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

interface CadastrosPanelProps {
  cadastroKey?: string
}

export function CadastrosPanel({ cadastroKey = 'empresas' }: CadastrosPanelProps) {
  const activeConfig = CADASTROS.find((c) => c.key === cadastroKey) || CADASTROS[0]

  return (
    <div className="w-full min-w-0">
      {activeConfig &&
        (activeConfig.isNew ? (
          <CadastroStandardScreen config={activeConfig} />
        ) : (
          <ExistingComponent type={activeConfig.existingComponent || 'partners'} />
        ))}
    </div>
  )
}
