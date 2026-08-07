import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  screen?: string
}

export default function Industry({ screen = 'dashboard' }: Props) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao painel
          </Link>
        </Button>
      </div>
      <IndustryContent screen={screen} />
    </div>
  )
}

function IndustryContent({ screen }: { screen: string }) {
  switch (screen) {
    case 'dashboard': {
      const { IndustryDashboard } = require('@/components/industry/industry-dashboard')
      return <IndustryDashboard />
    }
    case 'catalogo': {
      const { ItemCatalogPanel } = require('@/components/industry/item-catalog-panel')
      return <ItemCatalogPanel />
    }
    case 'bom':
    case 'formulacoes': {
      const { BomPanel } = require('@/components/industry/bom-panel')
      return <BomPanel />
    }
    case 'recursos': {
      const {
        ProductionResourcesPanel,
      } = require('@/components/industry/production-resources-panel')
      return <ProductionResourcesPanel />
    }
    case 'roteiros': {
      const { ProductionRoutesPanel } = require('@/components/industry/production-routes-panel')
      return <ProductionRoutesPanel />
    }
    case 'custos': {
      const { IndustrialCostsPanel } = require('@/components/industry/industrial-costs-panel')
      return <IndustrialCostsPanel />
    }
    case 'especificacoes':
    case 'conversoes':
    default:
      return (
        <div className="text-center py-20">
          <p className="text-lg font-bold text-muted-foreground">Módulo em desenvolvimento</p>
          <p className="text-sm text-muted-foreground mt-2">
            Esta seção será implementada na próxima iteração.
          </p>
        </div>
      )
  }
}
