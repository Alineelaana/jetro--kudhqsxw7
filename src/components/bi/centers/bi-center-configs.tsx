import { BiCenterWrapper } from '../bi-center-wrapper'
import type { CenterConfig, BIFilters, GenericCenterData } from '@/lib/bi-types'
import {
  getFinancialIntelligence,
  getIndustrialIntelligence,
  getStockIntelligence,
  getLogisticsIntelligence,
} from '@/services/bi-analytics-centers'
import {
  getFiscalIntelligence,
  getPurchasingIntelligence,
  getCrmIntelligence,
  getTradeIntelligence,
  getRhIntelligence,
  getQualityIntelligence,
  getMaintenanceIntelligence,
  getVrIntelligence,
} from '@/services/bi-analytics-centers'

export const CENTER_CONFIGS: Record<string, CenterConfig> = {
  'financial-intel': {
    key: 'financial-intel',
    title: 'Inteligência Financeira',
    description:
      'Fluxo de caixa, recebíveis, pagáveis, inadimplência, curva ABC e análise financeira',
    loadFunction: getFinancialIntelligence,
  },
  'industrial-intel': {
    key: 'industrial-intel',
    title: 'Inteligência Industrial',
    description: 'PCP, produção, engenharia, custos industriais, OEE e gargalos',
    loadFunction: getIndustrialIntelligence,
  },
  'stock-intel': {
    key: 'stock-intel',
    title: 'Inteligência de Estoque',
    description: 'Capital parado, curva ABC, cobertura, produtos críticos e ruptura',
    loadFunction: getStockIntelligence,
  },
  'logistics-intel': {
    key: 'logistics-intel',
    title: 'Inteligência Logística',
    description: 'OTIF, fretes, custos, avarias, entregas e transportadoras',
    loadFunction: getLogisticsIntelligence,
  },
  'fiscal-intel': {
    key: 'fiscal-intel',
    title: 'Inteligência Fiscal',
    description: 'NF-e, rejeições, carga tributária e conformidade fiscal',
    loadFunction: getFiscalIntelligence,
  },
  'purchasing-intel': {
    key: 'purchasing-intel',
    title: 'Inteligência de Compras',
    description: 'Pedidos de compra, fornecedores, cotações e desempenho',
    loadFunction: getPurchasingIntelligence,
  },
  'crm-intel': {
    key: 'crm-intel',
    title: 'Inteligência CRM',
    description: 'Leads, oportunidades, funil, pipeline, conversão e churn',
    loadFunction: getCrmIntelligence,
  },
  'trade-intel': {
    key: 'trade-intel',
    title: 'Inteligência Trade Marketing',
    description: 'Campanhas, verbas, ROI, sell-in, sell-out e positivação',
    loadFunction: getTradeIntelligence,
  },
  'rh-intel': {
    key: 'rh-intel',
    title: 'Inteligência de RH',
    description: 'Absenteísmo, turnover, treinamentos, horas extras e custos',
    loadFunction: getRhIntelligence,
  },
  'quality-intel': {
    key: 'quality-intel',
    title: 'Inteligência de Qualidade',
    description: 'Inspeções, não conformidades, refugo, retrabalho e taxa de rejeição',
    loadFunction: getQualityIntelligence,
  },
  'maintenance-intel': {
    key: 'maintenance-intel',
    title: 'Inteligência de Manutenção',
    description: 'Manutenções preventivas, corretivas, MTBF, MTTR e disponibilidade',
    loadFunction: getMaintenanceIntelligence,
  },
  'vr-intel': {
    key: 'vr-intel',
    title: 'Inteligência de Remuneração Variável',
    description: 'Comissões, metas, premiações, campanhas, projeções e ranking',
    loadFunction: getVrIntelligence,
  },
}

export function BiGenericCenter({ centerKey }: { centerKey: string }) {
  const config = CENTER_CONFIGS[centerKey]
  if (!config)
    return <p className="text-center py-6 text-muted-foreground">Centro não encontrado.</p>
  return (
    <BiCenterWrapper
      title={config.title}
      description={config.description}
      loadFunction={config.loadFunction}
    />
  )
}
