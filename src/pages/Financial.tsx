import { FinancialLayout } from '@/components/financial/financial-layout'
import { ScreenCentralFinanceira } from '@/components/financial/screens/screen-central-financeira'
import { ScreenContasReceberCobranca } from '@/components/financial/screens/screen-contas-receber-cobranca'
import { ScreenContasPagarTesouraria } from '@/components/financial/screens/screen-contas-pagar-tesouraria'
import { ScreenBancosConciliacao } from '@/components/financial/screens/screen-bancos-conciliacao'
import { ScreenPlanejamentoGestao } from '@/components/financial/screens/screen-planejamento-gestao'
import { ScreenConfiguracoesFinanceiras } from '@/components/financial/screens/screen-configuracoes-financeiras'
import { ScreenCnabConfiguracoes } from '@/components/financial/screens/screen-cnab-configuracoes'
import { ScreenCnabRemessas } from '@/components/financial/screens/screen-cnab-remessas'
import { ScreenCnabRetornos } from '@/components/financial/screens/screen-cnab-retornos'

const TITLES: Record<string, string> = {
  central: 'Central Financeira',
  'contas-a-receber-cobranca': 'Contas a Receber e Cobrança',
  'contas-a-pagar-tesouraria': 'Contas a Pagar e Tesouraria',
  'bancos-conciliacao': 'Bancos e Conciliação',
  'cnab-configuracoes': 'Configuração CNAB',
  'cnab-remessas': 'Remessa CNAB',
  'cnab-retornos': 'Retorno CNAB',
  'planejamento-gestao': 'Planejamento e Gestão',
  'configuracoes-financeiras': 'Configurações Financeiras',
  // Legados para exibição
  dashboard: 'Central Financeira',
  receivables: 'Contas a Receber e Cobrança',
  payables: 'Contas a Pagar e Tesouraria',
  reconciliation: 'Bancos e Conciliação',
  cash_flow: 'Planejamento e Gestão',
  reports: 'Planejamento e Gestão',
  closing: 'Planejamento e Gestão',
  treasury: 'Contas a Pagar e Tesouraria',
  cash_register: 'Contas a Pagar e Tesouraria',
  collections: 'Contas a Receber e Cobrança',
  approvals: 'Contas a Pagar e Tesouraria',
}

export default function Financial({ screen }: { screen: string }) {
  const title = TITLES[screen] || 'Financeiro'

  const renderScreen = () => {
    switch (screen) {
      case 'central':
      case 'dashboard':
        return <ScreenCentralFinanceira />

      case 'contas-a-receber-cobranca':
      case 'receivables':
      case 'collections':
      case 'boletos':
      case 'cards':
      case 'checks':
      case 'pix':
        return <ScreenContasReceberCobranca />

      case 'contas-a-pagar-tesouraria':
      case 'payables':
      case 'treasury':
      case 'cash_register':
      case 'movements':
      case 'transfers':
      case 'approvals':
        return <ScreenContasPagarTesouraria />

      case 'bancos-conciliacao':
      case 'reconciliation':
      case 'bancos':
        return <ScreenBancosConciliacao />

      case 'planejamento-gestao':
      case 'cash_flow':
      case 'closing':
      case 'reports':
        return <ScreenPlanejamentoGestao />

      case 'cnab-configuracoes':
        return <ScreenCnabConfiguracoes />

      case 'cnab-remessas':
        return <ScreenCnabRemessas />

      case 'cnab-retornos':
        return <ScreenCnabRetornos />

      case 'configuracoes-financeiras':
      case 'configuracoes':
        return <ScreenConfiguracoesFinanceiras />

      default:
        return <ScreenCentralFinanceira />
    }
  }

  return <FinancialLayout title={title}>{renderScreen()}</FinancialLayout>
}
