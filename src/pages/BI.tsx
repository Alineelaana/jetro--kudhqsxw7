import { BiLayout } from '@/components/bi/bi-layout'
import { BiDashboard } from '@/components/bi/bi-dashboard'
import { BiSales } from '@/components/bi/bi-sales'
import { BiStock } from '@/components/bi/bi-stock'
import { BiFinancial } from '@/components/bi/bi-financial'
import { BiIndustrial } from '@/components/bi/bi-industrial'
import { BiCrossModule } from '@/components/bi/bi-cross-module'
import { BiSavedViews } from '@/components/bi/bi-saved-views'
import { BiExecutive } from '@/components/bi/centers/bi-executive'
import { BiCommercial } from '@/components/bi/centers/bi-commercial'
import { BiGenericCenter } from '@/components/bi/centers/bi-center-configs'
import { BiAiAdapta } from '@/components/bi/bi-ai-adapta'
import { BiCustomDashboards } from '@/components/bi/bi-custom-dashboards'
import { BiReportCenter } from '@/components/bi/bi-report-center'
import { BiProjection } from '@/components/bi/bi-projection'

interface BIProps {
  screen?: string
}

export default function BI({ screen = 'dashboard' }: BIProps) {
  switch (screen) {
    case 'executive':
      return (
        <BiLayout title="Inteligência Executiva">
          <BiExecutive />
        </BiLayout>
      )
    case 'commercial':
      return (
        <BiLayout title="Inteligência Comercial">
          <BiCommercial />
        </BiLayout>
      )
    case 'financial-intel':
      return (
        <BiLayout title="Inteligência Financeira">
          <BiGenericCenter centerKey="financial-intel" />
        </BiLayout>
      )
    case 'industrial-intel':
      return (
        <BiLayout title="Inteligência Industrial">
          <BiGenericCenter centerKey="industrial-intel" />
        </BiLayout>
      )
    case 'logistics-intel':
      return (
        <BiLayout title="Inteligência Logística">
          <BiGenericCenter centerKey="logistics-intel" />
        </BiLayout>
      )
    case 'stock-intel':
      return (
        <BiLayout title="Inteligência de Estoque">
          <BiGenericCenter centerKey="stock-intel" />
        </BiLayout>
      )
    case 'fiscal-intel':
      return (
        <BiLayout title="Inteligência Fiscal">
          <BiGenericCenter centerKey="fiscal-intel" />
        </BiLayout>
      )
    case 'purchasing-intel':
      return (
        <BiLayout title="Inteligência de Compras">
          <BiGenericCenter centerKey="purchasing-intel" />
        </BiLayout>
      )
    case 'crm-intel':
      return (
        <BiLayout title="Inteligência CRM">
          <BiGenericCenter centerKey="crm-intel" />
        </BiLayout>
      )
    case 'trade-intel':
      return (
        <BiLayout title="Inteligência Trade Marketing">
          <BiGenericCenter centerKey="trade-intel" />
        </BiLayout>
      )
    case 'rh-intel':
      return (
        <BiLayout title="Inteligência de RH">
          <BiGenericCenter centerKey="rh-intel" />
        </BiLayout>
      )
    case 'quality-intel':
      return (
        <BiLayout title="Inteligência de Qualidade">
          <BiGenericCenter centerKey="quality-intel" />
        </BiLayout>
      )
    case 'maintenance-intel':
      return (
        <BiLayout title="Inteligência de Manutenção">
          <BiGenericCenter centerKey="maintenance-intel" />
        </BiLayout>
      )
    case 'vr-intel':
      return (
        <BiLayout title="Inteligência de Remuneração Variável">
          <BiGenericCenter centerKey="vr-intel" />
        </BiLayout>
      )
    case 'custom-dashboards':
      return (
        <BiLayout title="Dashboards Personalizados">
          <BiCustomDashboards />
        </BiLayout>
      )
    case 'ai-adapta':
      return (
        <BiLayout title="IA ADAPTA">
          <BiAiAdapta />
        </BiLayout>
      )
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
    case 'projection':
      return (
        <BiLayout title="Projeção de Vendas">
          <BiProjection />
        </BiLayout>
      )
    case 'saved-views':
      return (
        <BiLayout title="Relatórios Salvos">
          <BiSavedViews />
        </BiLayout>
      )
    case 'report-center':
      return (
        <BiLayout title="Central Corporativa de Relatórios">
          <BiReportCenter />
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
