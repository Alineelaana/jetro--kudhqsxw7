import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { SaLayout } from '@/components/supplier-allowance/sa-layout'
import { SaAgreements } from '@/components/supplier-allowance/sa-agreements'
import { SaAccounts } from '@/components/supplier-allowance/sa-accounts'
import { SaMovements } from '@/components/supplier-allowance/sa-movements'
import { SaAccruals } from '@/components/supplier-allowance/sa-accruals'
import { SaAppropriations } from '@/components/supplier-allowance/sa-appropriations'
import { SaConsumptions } from '@/components/supplier-allowance/sa-consumptions'
import { SaSettlements } from '@/components/supplier-allowance/sa-settlements'
import { SaCockpit } from '@/components/supplier-allowance/sa-cockpit'
import { FileText, Settings } from 'lucide-react'

function PlaceholderTab({
  icon: Icon,
  title,
  message,
}: {
  icon: any
  title: string
  message: string
}) {
  return (
    <Card className="border-2 border-dashed border-[#005B2E]/30">
      <CardContent className="py-16 text-center">
        <Icon className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#005B2E]">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{message}</p>
      </CardContent>
    </Card>
  )
}

const SCREEN_TO_TAB: Record<string, string> = {
  cockpit: 'cockpit',
  acordos: 'agreements',
  'conta-corrente': 'accounts',
  movimentacoes: 'movements',
  apuracoes: 'accruals',
  apropriacoes: 'appropriations',
  consumos: 'consumptions',
  liquidacoes: 'settlements',
  relatorios: 'reports',
  configuracoes: 'configuracoes',
}

interface SupplierAllowancePageProps {
  screen?: string
}

export default function SupplierAllowance({ screen = 'cockpit' }: SupplierAllowancePageProps) {
  const [tab, setTab] = useState(SCREEN_TO_TAB[screen] || 'cockpit')

  useEffect(() => {
    setTab(SCREEN_TO_TAB[screen] || 'cockpit')
  }, [screen])

  const navigate = useNavigate()
  useEffect(() => {
    const tabToScreen: Record<string, string> = Object.fromEntries(
      Object.entries(SCREEN_TO_TAB).map(([k, v]) => [v, k]),
    )
    const targetScreen = tabToScreen[tab] || 'cockpit'
    if (targetScreen !== screen) {
      navigate(`/admin/verbas/${targetScreen}`, { replace: true })
    }
  }, [tab])

  const renderContent = () => {
    switch (tab) {
      case 'agreements':
        return <SaAgreements />
      case 'accounts':
        return <SaAccounts />
      case 'movements':
        return <SaMovements />
      case 'accruals':
        return <SaAccruals />
      case 'appropriations':
        return <SaAppropriations />
      case 'consumptions':
        return <SaConsumptions />
      case 'settlements':
        return <SaSettlements />
      case 'cockpit':
        return <SaCockpit />
      case 'reports':
        return (
          <PlaceholderTab
            icon={FileText}
            title="Relatórios"
            message="A geração de documentos utiliza exclusivamente o Corporate Document Engine, mantendo o padrão institucional da plataforma."
          />
        )
      case 'configuracoes':
        return (
          <PlaceholderTab
            icon={Settings}
            title="Configurações"
            message="Configurações do módulo de Verbas de Fornecedores — parâmetros de apuração, liquidação e integrações."
          />
        )
      default:
        return <SaCockpit />
    }
  }

  return <SaLayout title="Verbas de Fornecedores">{renderContent()}</SaLayout>
}
