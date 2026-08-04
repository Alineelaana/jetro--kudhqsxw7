export const NFSE_STATUS = [
  'Em Digitação',
  'Aguardando Transmissão',
  'Autorizada',
  'Rejeitada',
  'Cancelada',
  'Substituída',
] as const
export const CTE_STATUS = [
  'Em Digitação',
  'Em Validação',
  'Aguardando Transmissão',
  'Autorizada',
  'Rejeitada',
  'Cancelada',
] as const
export const MDFE_STATUS = [
  'Em Digitação',
  'Aguardando Transmissão',
  'Autorizada',
  'Rejeitada',
  'Encerrada',
  'Cancelada',
] as const
export const APURACAO_STATUS = [
  'Aberto',
  'Processado',
  'Conferido',
  'Aprovado',
  'Encerrado',
  'Reaberto',
] as const
export const REFORM_CLASS_STATUS = [
  'Nao Classificado',
  'Em Analise',
  'Classificado',
  'Aguardando Aprovacao',
  'Com Pendencia',
  'Inativo',
] as const
export const REFORM_CREDIT_STATUS = ['Disponivel', 'Utilizado', 'Bloqueado', 'Compensado'] as const
export const REFORM_VAL_STATUS = [
  'Validado',
  'Com Alerta',
  'Com Erro',
  'Aguardando Correcao',
  'Corrigido',
] as const
export const CORRECTION_STATUS = ['Rascunho', 'Transmitida', 'Rejeitada', 'Autorizada'] as const
export const MANIFEST_TYPES = [
  'Ciencia',
  'Confirmacao',
  'Desconhecimento',
  'Nao_Realizada',
] as const
export const INUT_STATUS = ['Rascunho', 'Transmitida', 'Autorizada', 'Rejeitada'] as const
export const CERT_STATUS = ['Ativo', 'Vencido', 'Revogado', 'Suspenso'] as const
export const SPED_STATUS = [
  'Gerado',
  'Validado',
  'Inconsistente',
  'Corrigido',
  'Transmitido',
  'Retificado',
] as const
export const SPED_TYPES = [
  'EFD_ICMS_IPI',
  'EFD_Contribuicoes',
  'ECD',
  'ECF',
  'Reinf',
  'Outros',
] as const
export const BOOK_TYPES = [
  'Entradas',
  'Saidas',
  'Apuracao_ICMS',
  'Apuracao_IPI',
  'Servicos_Prestados',
  'Servicos_Tomados',
  'CBS',
  'IBS',
  'Imposto_Seletivo',
  'Outros',
] as const

export const STATUS_COLORS: Record<string, string> = {
  'Em Digitação': 'bg-gray-100 text-gray-700',
  'Em Validação': 'bg-blue-100 text-blue-700',
  'Aguardando Transmissão': 'bg-amber-100 text-amber-700',
  Autorizada: 'bg-emerald-100 text-emerald-700',
  Rejeitada: 'bg-red-100 text-red-700',
  Cancelada: 'bg-red-100 text-red-700',
  Denegada: 'bg-red-100 text-red-700',
  'Em Contingência': 'bg-orange-100 text-orange-700',
  Substituída: 'bg-purple-100 text-purple-700',
  Encerrada: 'bg-emerald-100 text-emerald-700',
  Aberto: 'bg-blue-100 text-blue-700',
  Processado: 'bg-cyan-100 text-cyan-700',
  Conferido: 'bg-amber-100 text-amber-700',
  Aprovado: 'bg-emerald-100 text-emerald-700',
  Encerrado: 'bg-gray-100 text-gray-600',
  Reaberto: 'bg-orange-100 text-orange-700',
  'Nao Classificado': 'bg-red-100 text-red-700',
  'Em Analise': 'bg-amber-100 text-amber-700',
  Classificado: 'bg-emerald-100 text-emerald-700',
  'Aguardando Aprovacao': 'bg-amber-100 text-amber-700',
  'Com Pendencia': 'bg-orange-100 text-orange-700',
  Inativo: 'bg-gray-100 text-gray-600',
  Disponivel: 'bg-emerald-100 text-emerald-700',
  Utilizado: 'bg-blue-100 text-blue-700',
  Bloqueado: 'bg-red-100 text-red-700',
  Compensado: 'bg-purple-100 text-purple-700',
  Validado: 'bg-emerald-100 text-emerald-700',
  'Com Alerta': 'bg-amber-100 text-amber-700',
  'Com Erro': 'bg-red-100 text-red-700',
  'Aguardando Correcao': 'bg-orange-100 text-orange-700',
  Corrigido: 'bg-emerald-100 text-emerald-700',
  Rascunho: 'bg-gray-100 text-gray-600',
  Transmitida: 'bg-blue-100 text-blue-700',
  Transmitido: 'bg-blue-100 text-blue-700',
  Ativo: 'bg-emerald-100 text-emerald-700',
  Vencido: 'bg-red-100 text-red-700',
  Revogado: 'bg-red-100 text-red-700',
  Suspenso: 'bg-amber-100 text-amber-700',
  Gerado: 'bg-cyan-100 text-cyan-700',
  Inconsistente: 'bg-red-100 text-red-700',
  Retificado: 'bg-purple-100 text-purple-700',
}

export interface FiscalScreenConfig {
  collection: string
  title: string
  nameLabel: string
  statusField?: string
  statusOptions?: readonly string[]
  fields: FiscalFieldDef[]
}

export interface FiscalFieldDef {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'boolean'
  required?: boolean
  options?: string[]
  span?: 1 | 2
}

export const REFORM_CONFIG_FIELDS: FiscalFieldDef[] = [
  {
    name: 'tributo',
    label: 'Tributo',
    type: 'select',
    required: true,
    options: ['CBS', 'IBS', 'Imposto_Seletivo'],
  },
  { name: 'company', label: 'Empresa', type: 'text' },
  { name: 'branch', label: 'Filial', type: 'text' },
  { name: 'produto_name', label: 'Produto', type: 'text' },
  { name: 'servico_name', label: 'Serviço', type: 'text' },
  { name: 'cliente_name', label: 'Cliente', type: 'text' },
  { name: 'fornecedor_name', label: 'Fornecedor', type: 'text' },
  { name: 'natureza_operacao', label: 'Natureza da Operação', type: 'text' },
  { name: 'classificacao_tributaria', label: 'Classificação Tributária', type: 'text' },
  { name: 'estado_origem', label: 'Estado Origem', type: 'text' },
  { name: 'estado_destino', label: 'Estado Destino', type: 'text' },
  { name: 'municipio_destino', label: 'Município Destino', type: 'text' },
  { name: 'aliquota', label: 'Alíquota (%)', type: 'text', required: true },
  { name: 'base_calculo', label: 'Base de Cálculo', type: 'text' },
  { name: 'percentual_reducao', label: 'Redução (%)', type: 'text' },
  { name: 'aliquota_zero', label: 'Alíquota Zero', type: 'boolean' },
  { name: 'isencao', label: 'Isenção', type: 'boolean' },
  { name: 'suspensao', label: 'Suspensão', type: 'boolean' },
  { name: 'diferimento', label: 'Diferimento', type: 'boolean' },
  { name: 'credito_permitido', label: 'Crédito Permitido', type: 'boolean' },
  { name: 'credito_presumido', label: 'Crédito Presumido (%)', type: 'text' },
  { name: 'regime_diferenciado', label: 'Regime Diferenciado', type: 'text' },
  { name: 'regime_especifico', label: 'Regime Específico', type: 'text' },
  { name: 'tributacao_destino', label: 'Tributação por Destino', type: 'boolean' },
  {
    name: 'tipo_incidencia',
    label: 'Tipo de Incidência',
    type: 'select',
    options: ['percentual', 'especifico'],
  },
  { name: 'valor_especifico', label: 'Valor Específico', type: 'text' },
  { name: 'vigencia_inicial', label: 'Vigência Inicial', type: 'date', required: true },
  { name: 'vigencia_final', label: 'Vigência Final', type: 'date' },
  {
    name: 'situacao',
    label: 'Situação',
    type: 'select',
    options: ['Ativa', 'Inativa', 'Rascunho'],
  },
  { name: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
]

export const CERTIFICATE_FIELDS: FiscalFieldDef[] = [
  { name: 'company', label: 'Empresa', type: 'text', required: true },
  { name: 'branch', label: 'Filial', type: 'text' },
  {
    name: 'tipo',
    label: 'Tipo',
    type: 'select',
    required: true,
    options: ['A1', 'A3', 'E-CNPJ', 'E-CPF'],
  },
  { name: 'titular', label: 'Titular', type: 'text', required: true },
  { name: 'data_emissao', label: 'Data de Emissão', type: 'date' },
  { name: 'data_vencimento', label: 'Data de Vencimento', type: 'date', required: true },
  {
    name: 'situacao',
    label: 'Situação',
    type: 'select',
    options: ['Ativo', 'Vencido', 'Revogado', 'Suspenso'],
  },
  { name: 'ultima_utilizacao', label: 'Última Utilização', type: 'date' },
  { name: 'responsible_user', label: 'Responsável', type: 'text' },
]

export const INUT_FIELDS: FiscalFieldDef[] = [
  { name: 'company', label: 'Empresa', type: 'text', required: true },
  { name: 'branch', label: 'Filial', type: 'text' },
  {
    name: 'tipo_documento',
    label: 'Tipo de Documento',
    type: 'select',
    required: true,
    options: ['NF-e', 'NFC-e', 'CT-e', 'MDF-e', 'NFS-e'],
  },
  { name: 'serie', label: 'Série', type: 'text', required: true },
  { name: 'numero_inicial', label: 'Número Inicial', type: 'number', required: true },
  { name: 'numero_final', label: 'Número Final', type: 'number', required: true },
  { name: 'ano', label: 'Ano', type: 'number', required: true },
  { name: 'justificativa', label: 'Justificativa', type: 'textarea', span: 2, required: true },
  { name: 'protocolo', label: 'Protocolo', type: 'text' },
  {
    name: 'status',
    label: 'Situação',
    type: 'select',
    options: ['Rascunho', 'Transmitida', 'Autorizada', 'Rejeitada'],
  },
]
