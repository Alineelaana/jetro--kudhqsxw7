export type DefaultFormField = {
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
    name: 'client_name',
    label: 'Nome Completo',
    type: 'text',
    options: null,
    required: true,
    order: 1,
    active: true,
  },
  {
    name: 'client_email',
    label: 'E-mail',
    type: 'email',
    options: null,
    required: true,
    order: 2,
    active: true,
  },
  {
    name: 'client_phone',
    label: 'Telefone / WhatsApp',
    type: 'tel',
    options: null,
    required: true,
    order: 3,
    active: true,
  },
  {
    name: 'service',
    label: 'Serviço Desejado',
    type: 'select',
    options: ['Armazenagem', 'Transporte', 'Distribuição', 'Logística Integrada', 'Outros'],
    required: true,
    order: 4,
    active: true,
  },
  {
    name: 'message',
    label: 'Mensagem',
    type: 'textarea',
    options: null,
    required: false,
    order: 5,
    active: true,
  },
]

export const CARGO_TYPE_OPTIONS: string[] = [
  'Carga Geral',
  'Carga Fracionada',
  'Carga Fechada',
  'Carga Refrigerada',
  'Carga Perigosa',
  'Carga Volumosa',
  'Contêiner',
  'Granel',
]

export const PAYMENT_OPTIONS: string[] = [
  'À Vista',
  'Boleto 7 dias',
  'Boleto 15 dias',
  'Boleto 30 dias',
  'Cartão de Crédito',
  'Transferência Bancária',
  'PIX',
  '30/60 dias',
  '30/60/90 dias',
]

export const DEADLINE_OPTIONS: string[] = [
  'Imediato',
  '24 horas',
  '48 horas',
  '72 horas',
  '1 semana',
  '2 semanas',
  '30 dias',
  'Sob consulta',
]
