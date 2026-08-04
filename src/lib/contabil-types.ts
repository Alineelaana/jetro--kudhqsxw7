export const LANCAMENTO_STATUS = [
  'Rascunho',
  'Aguardando Conferência',
  'Aguardando Aprovação',
  'Contabilizado',
  'Estornado',
  'Cancelado',
] as const
export const LOTE_STATUS = [
  'Em Digitação',
  'Aguardando Conferência',
  'Aguardando Aprovação',
  'Processado',
  'Com Divergência',
  'Cancelado',
] as const
export const PERIOD_STATUS = [
  'Aberto',
  'Em Conferência',
  'Aguardando Aprovação',
  'Fechado',
  'Reaberto',
] as const
export const FISCAL_YEAR_STATUS = ['Planejado', 'Aberto', 'Em Encerramento', 'Encerrado'] as const
export const RECONCILIATION_STATUS = [
  'Pendente',
  'Conciliado',
  'Com Divergência',
  'Ajustado',
  'Ignorado',
] as const
export const PROVISION_TYPES = [
  'Provisão',
  'Apropriação',
  'Diferimento',
  'Despesa Antecipada',
  'Receita Antecipada',
] as const
export const PROVISION_PERIODICITY = ['Mensal', 'Trimestral', 'Semestral', 'Anual'] as const
export const ACCOUNT_GROUPS = [
  'Ativo',
  'Passivo',
  'Patrimônio Líquido',
  'Receitas',
  'Custos',
  'Despesas',
  'Contas de Compensação',
] as const
export const INTEGRATION_OPERATION_TYPES = [
  'Venda faturada',
  'Recebimento de cliente',
  'Compra de mercadoria',
  'Pagamento de fornecedor',
  'Entrada de estoque',
  'Baixa de estoque',
  'Impostos sobre vendas',
  'Impostos a recuperar',
  'Comissão a pagar',
  'Depreciação',
  'Provisão',
  'Estorno',
] as const
export const DRE_GROUPS = [
  'Receita Bruta',
  'Deduções da Receita',
  'Receita Líquida',
  'Custos',
  'Lucro Bruto',
  'Despesas Operacionais',
  'Resultado Operacional',
  'Receitas Financeiras',
  'Despesas Financeiras',
  'Resultado antes dos Tributos',
  'Tributos sobre o Resultado',
  'Lucro ou Prejuízo Líquido',
] as const
export const BALANCE_SHEET_GROUPS = [
  'Ativo Circulante',
  'Ativo Não Circulante',
  'Passivo Circulante',
  'Passivo Não Circulante',
  'Patrimônio Líquido',
] as const

export const STATUS_COLORS: Record<string, string> = {
  Rascunho: 'bg-gray-100 text-gray-700',
  'Aguardando Conferência': 'bg-blue-100 text-blue-700',
  'Aguardando Aprovação': 'bg-amber-100 text-amber-700',
  Contabilizado: 'bg-emerald-100 text-emerald-700',
  Estornado: 'bg-purple-100 text-purple-700',
  Cancelado: 'bg-red-100 text-red-700',
  'Em Digitação': 'bg-gray-100 text-gray-700',
  Processado: 'bg-emerald-100 text-emerald-700',
  'Com Divergência': 'bg-red-100 text-red-700',
  Pendente: 'bg-amber-100 text-amber-700',
  Conciliado: 'bg-emerald-100 text-emerald-700',
  Ajustado: 'bg-blue-100 text-blue-700',
  Ignorado: 'bg-gray-100 text-gray-600',
  Aberto: 'bg-blue-100 text-blue-700',
  'Em Conferência': 'bg-amber-100 text-amber-700',
  Fechado: 'bg-gray-100 text-gray-600',
  Reaberto: 'bg-orange-100 text-orange-700',
  Planejado: 'bg-gray-100 text-gray-600',
  Ativo: 'bg-emerald-100 text-emerald-700',
  Inativo: 'bg-gray-100 text-gray-600',
  Concluído: 'bg-blue-100 text-blue-700',
  Encerrado: 'bg-gray-100 text-gray-600',
}

export interface ContabilFieldDef {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'switch'
  required?: boolean
  options?: string[]
  span?: 1 | 2
}

export interface ContabilScreenConfig {
  collection: string
  title: string
  nameLabel: string
  statusField?: string
  statusOptions?: readonly string[]
  fields: ContabilFieldDef[]
}

export const CONTABIL_SCREEN_CONFIGS: Record<string, ContabilScreenConfig> = {
  integracao: {
    collection: 'contabil_integration_rules',
    title: 'Integração Contábil',
    nameLabel: 'Tipo de Operação',
    statusField: 'ativo',
    fields: [
      {
        name: 'tipo_operacao',
        label: 'Tipo de Operação',
        type: 'select',
        required: true,
        options: [...INTEGRATION_OPERATION_TYPES],
      },
      { name: 'conta_debito', label: 'Conta Débito', type: 'text', required: true },
      { name: 'conta_credito', label: 'Conta Crédito', type: 'text', required: true },
      { name: 'historico_padrao', label: 'Histórico Padrão', type: 'text', span: 2 },
      { name: 'centro_custo', label: 'Centro de Custo', type: 'text' },
      { name: 'projeto', label: 'Projeto', type: 'text' },
      { name: 'empresa', label: 'Empresa', type: 'text' },
      { name: 'filial', label: 'Filial', type: 'text' },
      { name: 'data_competencia', label: 'Data Competência', type: 'date' },
      { name: 'ativo', label: 'Ativo', type: 'switch' },
      { name: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
    ],
  },
  'integracoes-pendentes': {
    collection: 'contabil_pending_integrations',
    title: 'Integrações Pendentes',
    nameLabel: 'Documento',
    statusField: 'status',
    statusOptions: ['Pendente', 'Processado', 'Ignorado'],
    fields: [
      { name: 'data', label: 'Data', type: 'date', required: true },
      { name: 'modulo_origem', label: 'Módulo de Origem', type: 'text', required: true },
      { name: 'documento', label: 'Documento', type: 'text' },
      { name: 'tipo_operacao', label: 'Tipo de Operação', type: 'text' },
      { name: 'valor', label: 'Valor', type: 'text' },
      { name: 'motivo_pendencia', label: 'Motivo da Pendência', type: 'textarea', span: 2 },
      {
        name: 'status',
        label: 'Situação',
        type: 'select',
        options: ['Pendente', 'Processado', 'Ignorado'],
      },
      { name: 'justificativa', label: 'Justificativa', type: 'textarea', span: 2 },
    ],
  },
  provisoes: {
    collection: 'contabil_provisions',
    title: 'Provisões e Apropriações',
    nameLabel: 'Descrição',
    statusField: 'status',
    statusOptions: ['Ativo', 'Inativo', 'Concluído'],
    fields: [
      { name: 'descricao', label: 'Descrição', type: 'text', required: true, span: 2 },
      { name: 'valor_total', label: 'Valor Total', type: 'text', required: true },
      { name: 'data_inicial', label: 'Data Inicial', type: 'date', required: true },
      { name: 'data_final', label: 'Data Final', type: 'date' },
      { name: 'quantidade_parcelas', label: 'Qtd. Parcelas', type: 'number' },
      { name: 'conta_debito', label: 'Conta Débito', type: 'text', required: true },
      { name: 'conta_credito', label: 'Conta Crédito', type: 'text', required: true },
      { name: 'centro_custo', label: 'Centro de Custo', type: 'text' },
      { name: 'projeto', label: 'Projeto', type: 'text' },
      {
        name: 'periodicidade',
        label: 'Periodicidade',
        type: 'select',
        options: [...PROVISION_PERIODICITY],
      },
      {
        name: 'tipo',
        label: 'Tipo',
        type: 'select',
        required: true,
        options: [...PROVISION_TYPES],
      },
      {
        name: 'status',
        label: 'Situação',
        type: 'select',
        options: ['Ativo', 'Inativo', 'Concluído'],
      },
      { name: 'empresa', label: 'Empresa', type: 'text' },
      { name: 'filial', label: 'Filial', type: 'text' },
    ],
  },
  exercicio: {
    collection: 'contabil_fiscal_years',
    title: 'Exercício Contábil',
    nameLabel: 'Ano',
    statusField: 'status',
    statusOptions: FISCAL_YEAR_STATUS,
    fields: [
      { name: 'ano', label: 'Ano', type: 'text', required: true },
      { name: 'empresa', label: 'Empresa', type: 'text', required: true },
      { name: 'data_inicial', label: 'Data Inicial', type: 'date', required: true },
      { name: 'data_final', label: 'Data Final', type: 'date', required: true },
      { name: 'status', label: 'Situação', type: 'select', options: [...FISCAL_YEAR_STATUS] },
      { name: 'responsavel', label: 'Responsável', type: 'text' },
      { name: 'justificativa', label: 'Justificativa', type: 'textarea', span: 2 },
    ],
  },
  'dre-config': {
    collection: 'contabil_dre_config',
    title: 'Configuração DRE',
    nameLabel: 'Descrição',
    statusField: 'ativo',
    fields: [
      { name: 'grupo', label: 'Grupo', type: 'select', required: true, options: [...DRE_GROUPS] },
      { name: 'descricao', label: 'Descrição', type: 'text', required: true, span: 2 },
      { name: 'contas', label: 'Contas (JSON)', type: 'textarea', span: 2 },
      { name: 'ordem', label: 'Ordem', type: 'number' },
      { name: 'natureza', label: 'Natureza', type: 'select', options: ['Devedora', 'Credora'] },
      { name: 'empresa', label: 'Empresa', type: 'text' },
      { name: 'ativo', label: 'Ativo', type: 'switch' },
    ],
  },
  'balanco-config': {
    collection: 'contabil_balance_sheet_config',
    title: 'Configuração Balanço',
    nameLabel: 'Descrição',
    statusField: 'ativo',
    fields: [
      {
        name: 'grupo',
        label: 'Grupo',
        type: 'select',
        required: true,
        options: [...BALANCE_SHEET_GROUPS],
      },
      { name: 'descricao', label: 'Descrição', type: 'text', required: true, span: 2 },
      { name: 'contas', label: 'Contas (JSON)', type: 'textarea', span: 2 },
      { name: 'ordem', label: 'Ordem', type: 'number' },
      { name: 'natureza', label: 'Natureza', type: 'select', options: ['Devedora', 'Credora'] },
      { name: 'empresa', label: 'Empresa', type: 'text' },
      { name: 'ativo', label: 'Ativo', type: 'switch' },
    ],
  },
}
