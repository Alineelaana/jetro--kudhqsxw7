import { LogisticsLayout } from '@/components/logistics/logistics-layout'
import {
  ScreenCentralLogistica,
  ScreenTransporteFrota,
  ScreenDistribuicaoEntregas,
  ScreenRotasRoteirizacao,
  ScreenFreteTabelas,
  ScreenOcorrenciasRastreabilidade,
  ScreenCustosIndicadores,
} from '@/components/logistics/screens'

const TITLES: Record<string, string> = {
  central: 'Central Logística',
  'transporte-frota': 'Transporte e Frota',
  'distribuicao-entregas': 'Distribuição e Entregas',
  'rotas-roteirizacao': 'Rotas e Roteirização',
  'frete-tabelas': 'Frete e Tabelas',
  'ocorrencias-rastreabilidade': 'Ocorrências e Rastreabilidade',
  'custos-indicadores': 'Custos e Indicadores Logísticos',
}

export default function Logistics({ screen }: { screen: string }) {
  const title = TITLES[screen] || 'Central Logística'

  const renderScreen = () => {
    switch (screen) {
      case 'central':
        return <ScreenCentralLogistica />
      case 'transporte-frota':
        return <ScreenTransporteFrota />
      case 'distribuicao-entregas':
        return <ScreenDistribuicaoEntregas />
      case 'rotas-roteirizacao':
        return <ScreenRotasRoteirizacao />
      case 'frete-tabelas':
        return <ScreenFreteTabelas />
      case 'ocorrencias-rastreabilidade':
        return <ScreenOcorrenciasRastreabilidade />
      case 'custos-indicadores':
        return <ScreenCustosIndicadores />
      default:
        return <ScreenCentralLogistica />
    }
  }

  return <LogisticsLayout title={title}>{renderScreen()}</LogisticsLayout>
}
