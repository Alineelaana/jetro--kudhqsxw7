export const DEFAULT_WHATSAPP_NUMBER = '5531991297619'
export const BRAND_NAME = 'VeloraLog'
export const BRAND_SLOGAN = 'Operações Logísticas de Excelência'

export interface ServiceItem {
  id: string
  title: string
  shortTitle: string
  description: string
  icon: string
  tags: string[]
  highlight?: boolean
}

export const SERVICES: ServiceItem[] = [
  {
    id: 'armazenagem-estoque',
    title: 'Armazenagem de Produtos em Estoque',
    shortTitle: 'Armazenagem de Estoque',
    description:
      'Gestão WMS avançada, inventário contínuo, picking & packing ágil e controle total de lotes e validade com máxima acuracidade para sua empresa.',
    icon: 'Warehouse',
    tags: ['Gestão WMS', 'Picking & Packing', 'Controle de Lotes/Validade', 'Inventário'],
    highlight: true,
  },
  {
    id: 'transporte-cargas',
    title: 'Transporte de Cargas',
    shortTitle: 'Transporte de Cargas',
    description:
      'Transporte rodoviário de cargas fracionadas e dedicadas com seguro total, monitoramento em tempo real e abrangência no ES e em todo o Brasil.',
    icon: 'Truck',
    tags: ['Carga Lotação', 'Carga Fracionada', 'Seguro Total', 'Rastreamento 24h'],
  },
  {
    id: 'distribuicao-urbana',
    title: 'Distribuição Urbana e Delivery',
    shortTitle: 'Distribuição e Last Mile',
    description:
      'Soluções de última milha (Last Mile) com roteirização inteligente e pontualidade na entrega final nos grandes centros urbanos do Espírito Santo.',
    icon: 'MapPinned',
    tags: ['Last Mile', 'Entregas Rápidas', 'Roteirização Inteligente'],
  },
  {
    id: 'armazenagem-cd',
    title: 'Armazenagem e Centro de Distribuição',
    shortTitle: 'Centro de Distribuição',
    description:
      'Infraestrutura moderna e segura para estocagem e movimentação de mercadorias em localização estratégica nos eixos rodoviários capixabas.',
    icon: 'Layers',
    tags: ['CD Estratégico', 'Segurança 24/7', 'Estrutura Modular'],
  },
  {
    id: 'logistica-portuaria',
    title: 'Logística Portuária',
    shortTitle: 'Logística Portuária',
    description:
      'Conexão direta com os principais portos e terminais do Espírito Santo para recepção, transporte e movimentação de contêineres.',
    icon: 'Ship',
    tags: ['Portos do ES', 'Contêineres', 'Agilidade Operacional'],
  },
  {
    id: 'cross-docking',
    title: 'Cross Docking',
    shortTitle: 'Cross Docking',
    description:
      'Processo ágil de triagem e redistribuição imediata de produtos sem custo de estocagem prolongada, reduzindo lead time.',
    icon: 'ArrowLeftRight',
    tags: ['Triagem Rápida', 'Zero Estoque Parado', 'Redução de Lead Time'],
  },
  {
    id: 'gestao-frota',
    title: 'Gestão de Frota e Rastreamento',
    shortTitle: 'Gestão de Frota',
    description:
      'Telemetria avançada, gerenciamento de risco e condutores qualificados para garantir a segurança integral do seu patrimônio.',
    icon: 'Bus',
    tags: ['Telemetria 24/7', 'Gerenciamento de Risco', 'Frota Rastreada'],
  },
]

export const SERVICE_OPTIONS = SERVICES.map((s) => s.title)

export interface DefaultFormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
  required: boolean
  order: number
  options?: string[] | null
}

export const DEFAULT_FORM_FIELDS: DefaultFormField[] = [
  { name: 'nome_completo', label: 'Nome Completo', type: 'text', required: true, order: 1 },
  { name: 'empresa', label: 'Empresa', type: 'text', required: false, order: 2 },
  { name: 'email', label: 'E-mail Corporativo', type: 'email', required: true, order: 3 },
  { name: 'telefone', label: 'Telefone / WhatsApp', type: 'tel', required: true, order: 4 },
  {
    name: 'servico_interesse',
    label: 'Serviço de Interesse',
    type: 'select',
    required: true,
    order: 5,
    options: SERVICE_OPTIONS,
  },
  {
    name: 'tipo_operacao',
    label: 'Tipo de Operação',
    type: 'select',
    required: false,
    order: 6,
    options: [
      'Armazenagem de Produtos em Estoque',
      'Transporte de Cargas',
      'Distribuição Urbana e Last Mile',
      'Logística Portuária',
      'Cross Docking',
      'Gestão de Frota',
      'Operação Logística Completa',
    ],
  },
  { name: 'cidade_origem', label: 'Cidade de Origem', type: 'text', required: true, order: 7 },
  { name: 'cidade_destino', label: 'Cidade de Destino', type: 'text', required: false, order: 8 },
  {
    name: 'tipo_mercadoria',
    label: 'Tipo de Mercadoria / Produto',
    type: 'text',
    required: false,
    order: 9,
  },
  {
    name: 'volume_estimado',
    label: 'Volume Estimado (Paletes, peso, caixas)',
    type: 'text',
    required: false,
    order: 10,
  },
  {
    name: 'periodicidade',
    label: 'Periodicidade da Operação',
    type: 'select',
    required: false,
    order: 11,
    options: ['Operação Única / Pontual', 'Contrato Recorrente', 'Projeto Urgente'],
  },
  {
    name: 'mensagem',
    label: 'Observações / Detalhes da Operação',
    type: 'textarea',
    required: false,
    order: 12,
  },
]
