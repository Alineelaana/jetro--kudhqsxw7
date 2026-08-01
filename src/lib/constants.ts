export const DEFAULT_WHATSAPP_NUMBER = '5531991297619'

export const SERVICES = [
  {
    title: 'Transporte Rodoviário de Cargas',
    description:
      'Transporte rodoviário de cargas fracionadas e lotação em todo o território nacional, com monitoramento em tempo real, rastreamento de frota e gestão de risco.',
    icon: 'Truck',
  },
  {
    title: 'Distribuição e Last Mile',
    description:
      'Distribuição capilarizada e entrega de última milha com roteirização otimizada, garantindo prazos, eficiência e visibilidade no atendimento ao cliente final.',
    icon: 'MapPinned',
  },
  {
    title: 'Armazenagem de Produtos em Estoque',
    description:
      'Guarda e conservação de mercadorias com controle de inventário, gestão de estoque apoiada por WMS, picking e packing, etiquetagem, preparação de pedidos e movimentação interna de cargas.',
    icon: 'Warehouse',
  },
  {
    title: 'Cross Docking',
    description:
      'Operação de cross docking para redução de custos de armazenagem, com transferência direta de mercadorias entre veículos de coleta e distribuição.',
    icon: 'ArrowLeftRight',
  },
  {
    title: 'Logística Portuária',
    description:
      'Logística portuária integrada, com despacho aduaneiro, unitização e desunitização de contêineres e transporte multimodal para importação e exportação.',
    icon: 'Ship',
  },
  {
    title: 'Gestão de Frota',
    description:
      'Gestão completa de frota com manutenção preventiva e corretiva, controle de jornada de motoristas, telemetria e otimização de rotas.',
    icon: 'Bus',
  },
  {
    title: 'Logística Integrada',
    description:
      'Operação logística completa e customizada, integrando transporte, armazenagem, distribuição e gestão sob medida para o seu negócio.',
    icon: 'Layers',
  },
]

export const SERVICE_OPTIONS = SERVICES.map((s) => s.title)

export interface DefaultFormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
  options: string[] | null
  required: boolean
  order: number
  active: boolean
}

export const DEFAULT_FORM_FIELDS: DefaultFormField[] = [
  {
    name: 'nome_completo',
    label: 'Nome Completo',
    type: 'text',
    options: null,
    required: true,
    order: 1,
    active: true,
  },
  {
    name: 'empresa',
    label: 'Empresa',
    type: 'text',
    options: null,
    required: false,
    order: 2,
    active: true,
  },
  {
    name: 'email',
    label: 'E-mail',
    type: 'email',
    options: null,
    required: true,
    order: 3,
    active: true,
  },
  {
    name: 'telefone',
    label: 'Telefone / WhatsApp',
    type: 'tel',
    options: null,
    required: true,
    order: 4,
    active: true,
  },
  {
    name: 'servico_interesse',
    label: 'Serviço de Interesse',
    type: 'select',
    options: SERVICE_OPTIONS,
    required: true,
    order: 5,
    active: true,
  },
  {
    name: 'tipo_operacao',
    label: 'Tipo de Operação',
    type: 'select',
    options: [
      'Transporte',
      'Distribuição',
      'Armazenagem',
      'Cross Docking',
      'Logística Portuária',
      'Gestão de Frota',
      'Operação Completa',
    ],
    required: false,
    order: 6,
    active: true,
  },
  {
    name: 'cidade_origem',
    label: 'Cidade de Origem',
    type: 'text',
    options: null,
    required: true,
    order: 7,
    active: true,
  },
  {
    name: 'cidade_destino',
    label: 'Cidade de Destino',
    type: 'text',
    options: null,
    required: false,
    order: 8,
    active: true,
  },
  {
    name: 'tipo_mercadoria',
    label: 'Tipo de Mercadoria / Produto',
    type: 'text',
    options: null,
    required: false,
    order: 9,
    active: true,
  },
  {
    name: 'volume_estimado',
    label: 'Volume Estimado',
    type: 'text',
    options: null,
    required: false,
    order: 10,
    active: true,
  },
  {
    name: 'periodicidade',
    label: 'Periodicidade',
    type: 'select',
    options: ['Operação Única', 'Recorrente', 'Urgente'],
    required: false,
    order: 11,
    active: true,
  },
  {
    name: 'mensagem',
    label: 'Mensagem / Observações',
    type: 'textarea',
    options: null,
    required: false,
    order: 12,
    active: true,
  },
]
