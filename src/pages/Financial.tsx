import { FinancialLayout } from '@/components/financial/financial-layout'
import { FinancialDashboard } from '@/components/financial/financial-dashboard'
import { FinancialReceivables } from '@/components/financial/financial-receivables'
import { FinancialPayables } from '@/components/financial/financial-payables'
import { FinancialCashFlow } from '@/components/financial/financial-cash-flow'
import { FinancialReconciliation } from '@/components/financial/financial-reconciliation'
import { FinancialTreasury } from '@/components/financial/financial-treasury'
import { FinancialCashRegister } from '@/components/financial/financial-cash-register'
import { FinancialReports } from '@/components/financial/financial-reports'
import { FinancialGenericScreen } from '@/components/financial/financial-generic-screen'
import { FINANCIAL_SCREEN_CONFIGS } from '@/lib/financial-types'

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard Financeiro',
  receivables: 'Contas a Receber',
  payables: 'Contas a Pagar',
  cash_flow: 'Fluxo de Caixa',
  reconciliation: 'Conciliação Bancária',
  treasury: 'Tesouraria',
  checks: 'Controle de Cheques',
  cards: 'Cartões',
  boletos: 'Boletos',
  pix: 'PIX',
  collections: 'Cobranças',
  cash_register: 'Caixa',
  movements: 'Movimentações Financeiras',
  transfers: 'Transferências entre Contas',
  approvals: 'Aprovações Financeiras',
  closing: 'Fechamento Financeiro',
  reports: 'Relatórios Financeiros',
}

export default function Financial({ screen }: { screen: string }) {
  const title = TITLES[screen] || 'Financeiro'

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <FinancialDashboard />
      case 'receivables':
        return <FinancialReceivables />
      case 'payables':
        return <FinancialPayables />
      case 'cash_flow':
        return <FinancialCashFlow />
      case 'reconciliation':
        return <FinancialReconciliation />
      case 'treasury':
        return <FinancialTreasury />
      case 'cash_register':
        return <FinancialCashRegister />
      case 'reports':
        return <FinancialReports />
      default: {
        const config = FINANCIAL_SCREEN_CONFIGS[screen]
        if (config) return <FinancialGenericScreen config={config} />
        return <FinancialDashboard />
      }
    }
  }

  return <FinancialLayout title={title}>{renderScreen()}</FinancialLayout>
}
