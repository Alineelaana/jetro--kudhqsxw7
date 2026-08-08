import { SaLayout } from '@/components/supplier-allowance/sa-layout'
import { SaCockpit } from '@/components/supplier-allowance/sa-cockpit'
import { SaAgreements } from '@/components/supplier-allowance/sa-agreements'
import { SaAccounts } from '@/components/supplier-allowance/sa-accounts'
import { SaMovements } from '@/components/supplier-allowance/sa-movements'
import { SaAccruals } from '@/components/supplier-allowance/sa-accruals'
import { SaAppropriations } from '@/components/supplier-allowance/sa-appropriations'
import { SaConsumptions } from '@/components/supplier-allowance/sa-consumptions'
import { SaSettlements } from '@/components/supplier-allowance/sa-settlements'

const SCREEN_TITLES: Record<string, string> = {
  dashboard: 'Cockpit',
  cockpit: 'Cockpit',
  agreements: 'Acordos de Verba',
  accounts: 'Conta Corrente',
  movements: 'Movimentações',
  accruals: 'Apurações',
  appropriations: 'Aplicação em Produtos',
  consumptions: 'Consumos',
  settlements: 'Liquidações',
}

interface SupplierAllowanceProps {
  screen?: string
}

export default function SupplierAllowance({ screen = 'dashboard' }: SupplierAllowanceProps) {
  const title = SCREEN_TITLES[screen] || 'Verbas de Fornecedores'

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <SaCockpit />
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
      default:
        return <SaCockpit />
    }
  }

  return <SaLayout title={title}>{renderScreen()}</SaLayout>
}
