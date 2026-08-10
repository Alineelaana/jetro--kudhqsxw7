export const DEFAULT_WHATSAPP_NUMBER = '5527999999999'
export const BRAND_NAME = 'Jetro'
export const BRAND_SLOGAN = 'Plataforma Inteligente de Gestão Empresarial'

export interface SegmentItem {
  id: string
  title: string
  description: string
  iconName: string
  highlights: string[]
}

export const BUSINESS_SEGMENTS: SegmentItem[] = [
  {
    id: 'servicos',
    title: 'Prestadoras de Serviços',
    description:
      'Gestão comercial, contratos, equipes, financeiro, atendimento, indicadores e performance.',
    iconName: 'Briefcase',
    highlights: ['Contratos e Faturamento', 'Gestão de Equipes', 'Performance de Serviços'],
  },
  {
    id: 'distribuidoras',
    title: 'Distribuidoras',
    description:
      'Compras, vendas, estoque, fornecedores, verbas, crédito, cobrança, logística, financeiro e inteligência comercial.',
    iconName: 'Truck',
    highlights: ['Verbas de Fornecedor', 'Crédito e Cobrança', 'Inteligência Logística'],
  },
  {
    id: 'atacadistas',
    title: 'Atacadistas',
    description:
      'Gestão de clientes, preços, margens, estoque, compras, vendas, crédito e rentabilidade.',
    iconName: 'Building2',
    highlights: ['Tabelas de Preços', 'Análise de Margem', 'Gestão de Atacado'],
  },
  {
    id: 'industrias',
    title: 'Indústrias',
    description:
      'Planejamento, produção, custos, estoque, compras, qualidade, manutenção, vendas e indicadores.',
    iconName: 'Factory',
    highlights: ['PCP e Engenharia', 'Controle de Qualidade', 'Custos Industriais'],
  },
  {
    id: 'comerciais',
    title: 'Empresas Comerciais',
    description: 'CRM, vendas, metas, clientes, propostas, faturamento, financeiro e performance.',
    iconName: 'ShoppingBag',
    highlights: ['Funil de Vendas', 'Metas e Comissões', 'Controle Financeiro'],
  },
  {
    id: 'multicompanhia',
    title: 'Operações Multicompanhia',
    description:
      'Gestão de empresas, filiais, unidades e operações com governança e visão consolidada.',
    iconName: 'Network',
    highlights: ['Consolidação de Filiais', 'Matriz de Permissões', 'DRE Unificada'],
  },
  {
    id: 'crescimento',
    title: 'Empresas em Crescimento',
    description:
      'Para negócios que precisam estruturar processos profissionais sem perder agilidade.',
    iconName: 'TrendingUp',
    highlights: ['Evolução Modular', 'Escalabilidade', 'Processos Padronizados'],
  },
]
