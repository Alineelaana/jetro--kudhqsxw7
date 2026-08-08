import { SaLayout } from '@/components/supplier-allowance/sa-layout'
import { SaCockpit } from '@/components/supplier-allowance/sa-cockpit'
import { SaAgreements } from '@/components/supplier-allowance/sa-agreements'
import { SaAccounts } from '@/components/supplier-allowance/sa-accounts'
import { SaMovements } from '@/components/supplier-allowance/sa-movements'
import { SaAccruals } from '@/components/supplier-allowance/sa-accruals'
import { SaAppropriations } from '@/components/supplier-allowance/sa-appropriations'
import { SaConsumptions } from '@/components/supplier-allowance/sa-consumptions'
import { SaSettlements } from '@/components/supplier-allowance/sa-settlements'

interface SupplierAllowanceProps {
  screen?: string
}

export default function SupplierAllowance({ screen = 'dashboard' }: SupplierAllowanceProps) {
  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
      case 'cockpit':
        return <SaCockpit />
      case 'agreements':
      case 'gestao':
        return <SaAgreements />
      case 'accounts':
      case 'conta-corrente':
        return <SaAccounts />
      case 'movements':
      case 'movimentacoes':
        return <SaMovements />
      case 'accruals':
      case 'apropriacoes':
        return <SaAccruals />
      case 'appropriations':
      case 'aplicacao-produtos':
        return <SaAppropriations />
      case 'consumptions':
      case 'consumos':
        return <SaConsumptions />
      case 'settlements':
      case 'prestacao-contas':
        return <SaSettlements />
      default:
        return <SaCockpit />
    }
  }

  return <SaLayout>{renderScreen()}</SaLayout>
}
