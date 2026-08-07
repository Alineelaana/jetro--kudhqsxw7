import { BiLayout } from '@/components/bi/bi-layout'
import { BiDashboard } from '@/components/bi/bi-dashboard'
import { BiSales } from '@/components/bi/bi-sales'
import { BiStock } from '@/components/bi/bi-stock'
import { BiFinancial } from '@/components/bi/bi-financial'
import { BiIndustrial } from '@/components/bi/bi-industrial'
import { BiCrossModule } from '@/components/bi/bi-cross-module'
import { BiSavedViews } from '@/components/bi/bi-saved-views'

interface BIProps {
  screen?: string
}

export default function BI({ screen = 'dashboard' }: BIProps) {
  switch (screen) {
    case 'sales':
      return (
        <BiLayout title="Analytics de Vendas">
          <BiSales />
        </BiLayout>
      )
    case 'stock':
      return (
        <BiLayout title="Analytics de Estoque">
          <BiStock />
        </BiLayout>
      )
    case 'financial':
      return (
        <BiLayout title="Analytics Financeiro">
          <BiFinancial />
        </BiLayout>
      )
    case 'industrial':
      return (
        <BiLayout title="Analytics Industrial">
          <BiIndustrial />
        </BiLayout>
      )
    case 'cross-module':
      return (
        <BiLayout title="Visão Cruzada">
          <BiCrossModule />
        </BiLayout>
      )
    case 'saved-views':
      return (
        <BiLayout title="Relatórios Salvos">
          <BiSavedViews />
        </BiLayout>
      )
    default:
      return (
        <BiLayout title="BI / Analytics">
          <BiDashboard />
        </BiLayout>
      )
  }
}
