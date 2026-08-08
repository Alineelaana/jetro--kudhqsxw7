import { SaLayout } from '@/components/supplier-allowance/sa-layout'
import { SaCockpit } from '@/components/supplier-allowance/sa-cockpit'
import { SaAgreements } from '@/components/supplier-allowance/sa-agreements'
import { SaAccounts } from '@/components/supplier-allowance/sa-accounts'
import { SaMovements } from '@/components/supplier-allowance/sa-movements'
import { SaAccruals } from '@/components/supplier-allowance/sa-accruals'
import { SaAppropriations } from '@/components/supplier-allowance/sa-appropriations'
import { SaConsumptions } from '@/components/supplier-allowance/sa-consumptions'
import { SaSettlements } from '@/components/supplier-allowance/sa-settlements'
import { SaTradeExpenses } from '@/components/supplier-allowance/sa-trade-expenses'
import { SaAdhocCredits } from '@/components/supplier-allowance/sa-adhoc-credits'
import { SaDocuments } from '@/components/supplier-allowance/sa-documents'
import { SaReportVersions } from '@/components/supplier-allowance/sa-report-versions'
import { SaCorporateAudit } from '@/components/supplier-allowance/sa-corporate-audit'
import { SaCurrentAccounts } from '@/components/supplier-allowance/sa-current-accounts'
import { SaAdaptaChat } from '@/components/supplier-allowance/sa-adapta-chat'

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
  'trade-expenses': 'Gastos de Trade',
  'adhoc-credits': 'Créditos Avulsos',
  documents: 'Documentos',
  'report-versions': 'Versionamento de Relatórios',
  'corporate-audit': 'Auditoria Corporativa de Verbas',
  'current-accounts': 'Contas Correntes',
  'adapta-chat': 'ADAPTA Verbas',
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
      case 'trade-expenses':
        return <SaTradeExpenses />
      case 'adhoc-credits':
        return <SaAdhocCredits />
      case 'documents':
        return <SaDocuments />
      case 'report-versions':
        return <SaReportVersions />
      case 'corporate-audit':
        return <SaCorporateAudit />
      case 'current-accounts':
        return <SaCurrentAccounts />
      case 'adapta-chat':
        return <SaAdaptaChat />
      case 'cockpit':
        return <SaCockpit />
      default:
        return <SaCockpit />
    }
  }

  return <SaLayout title={title}>{renderScreen()}</SaLayout>
}
