export const RECEIVABLE_STATUS = [
  'Em Aberto',
  'Parcialmente Recebido',
  'Recebido',
  'Vencido',
  'Renegociado',
  'Protestado',
  'Em Cobrança',
  'Cancelado',
] as const
export const PAYABLE_STATUS = [
  'Em Aberto',
  'Aguardando Aprovação',
  'Aprovado',
  'Agendado',
  'Parcialmente Pago',
  'Pago',
  'Vencido',
  'Bloqueado',
  'Cancelado',
] as const
export const TRANSFER_STATUS = [
  'Rascunho',
  'Aguardando Aprovação',
  'Aprovada',
  'Realizada',
  'Conciliada',
  'Cancelada',
] as const
export const CHECK_STATUS = [
  'Em Carteira',
  'Pré-datado',
  'Depositado',
  'Compensado',
  'Devolvido',
  'Reapresentado',
  'Sustado',
  'Cancelado',
] as const
export const CARD_TX_STATUS = [
  'Aguardando Repasse',
  'Repassado',
  'Antecipado',
  'Cancelado',
  'Contestado',
  'Com Divergência',
] as const
export const BOLETO_STATUS = [
  'Gerado',
  'Registrado',
  'Enviado',
  'Visualizado',
  'Pago',
  'Vencido',
  'Baixado',
  'Cancelado',
  'Protestado',
] as const
export const PIX_STATUS = [
  'Gerado',
  'Enviado',
  'Aguardando Pagamento',
  'Pago',
  'Expirado',
  'Cancelado',
  'Devolvido',
] as const
export const COLLECTION_STATUS = [
  'Aguardando Contato',
  'Em Cobrança',
  'Promessa de Pagamento',
  'Negociação',
  'Renegociado',
  'Pago',
  'Protestado',
  'Enviado para Jurídico',
  'Sem Retorno',
] as const
export const CASH_REGISTER_STATUS = [
  'Fechado',
  'Aberto',
  'Em Conferência',
  'Com Divergência',
  'Aguardando Aprovação',
] as const
export const MOVEMENT_TYPES = [
  'Recebimento',
  'Pagamento',
  'Transferência',
  'Estorno',
  'Ajuste',
  'Tarifa Bancária',
  'Juros',
  'Multa',
  'Desconto',
  'Aplicação',
  'Resgate',
  'Sangria',
  'Suprimento',
] as const
export const APPROVAL_STATUS = ['Pendente', 'Aprovado', 'Reprovado'] as const
export const CLOSING_STATUS = ['Aberto', 'Fechado', 'Reaberto'] as const
export const RECONCILIATION_STATUS = [
  'Não Conciliado',
  'Conciliado Automaticamente',
  'Conciliado Manualmente',
  'Com Divergência',
  'Ignorado',
] as const
export const CARD_MODALITIES = [
  'Débito',
  'Crédito à Vista',
  'Crédito Parcelado',
  'Voucher',
] as const

export interface FinancialFieldDef {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  required?: boolean
  options?: string[]
  span?: 1 | 2
}

export interface FinancialScreenConfig {
  collection: string
  title: string
  nameLabel: string
  statusField?: string
  statusOptions?: readonly string[]
  fields: FinancialFieldDef[]
}

export const FINANCIAL_SCREEN_CONFIGS: Record<string, FinancialScreenConfig> = {
  transfers: {
    collection: 'financial_transfers',
    title: 'Transferências entre Contas',
    nameLabel: 'Nº Transferência',
    statusField: 'status',
    statusOptions: TRANSFER_STATUS,
    fields: [
      { name: 'numero_transferencia', label: 'Número', type: 'text', required: true },
      { name: 'data', label: 'Data', type: 'date', required: true },
      { name: 'empresa_origem', label: 'Empresa Origem', type: 'text' },
      { name: 'conta_origem', label: 'Conta Origem', type: 'text', required: true },
      { name: 'empresa_destino', label: 'Empresa Destino', type: 'text' },
      { name: 'conta_destino', label: 'Conta Destino', type: 'text', required: true },
      { name: 'valor', label: 'Valor', type: 'text', required: true },
      { name: 'tarifa', label: 'Tarifa', type: 'text' },
      { name: 'motivo', label: 'Motivo', type: 'textarea', span: 2 },
      { name: 'responsavel', label: 'Responsável', type: 'text' },
      { name: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
    ],
  },
  checks: {
    collection: 'financial_checks',
    title: 'Controle de Cheques',
    nameLabel: 'Nº Cheque',
    statusField: 'status',
    statusOptions: CHECK_STATUS,
    fields: [
      {
        name: 'tipo_cheque',
        label: 'Tipo',
        type: 'select',
        options: ['Cheque Recebido', 'Cheque Emitido'],
        required: true,
      },
      { name: 'banco', label: 'Banco', type: 'text', required: true },
      { name: 'agencia', label: 'Agência', type: 'text' },
      { name: 'numero_cheque', label: 'Nº Cheque', type: 'text', required: true },
      { name: 'emitente', label: 'Emitente', type: 'text' },
      { name: 'beneficiario', label: 'Beneficiário', type: 'text' },
      { name: 'cpf_cnpj', label: 'CPF/CNPJ', type: 'text' },
      { name: 'valor', label: 'Valor', type: 'text', required: true },
      { name: 'data_emissao', label: 'Data Emissão', type: 'date' },
      { name: 'data_vencimento', label: 'Data Vencimento', type: 'date', required: true },
      { name: 'conta_bancaria', label: 'Conta Bancária', type: 'text' },
      { name: 'documento_relacionado', label: 'Documento Relacionado', type: 'text' },
      { name: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
    ],
  },
  cards: {
    collection: 'financial_cards',
    title: 'Cartões',
    nameLabel: 'Administradora',
    fields: [
      { name: 'nome_administradora', label: 'Administradora', type: 'text', required: true },
      { name: 'bandeira', label: 'Bandeira', type: 'text' },
      { name: 'maquina', label: 'Máquina', type: 'text' },
      { name: 'conta_recebimento', label: 'Conta de Recebimento', type: 'text' },
      { name: 'taxa', label: 'Taxa (%)', type: 'text' },
      { name: 'prazo_repasse', label: 'Prazo de Repasse (dias)', type: 'text' },
      { name: 'antecipacao', label: 'Antecipação', type: 'text' },
      { name: 'empresa', label: 'Empresa', type: 'text' },
      { name: 'filial', label: 'Filial', type: 'text' },
      { name: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
    ],
  },
  boletos: {
    collection: 'financial_boletos',
    title: 'Boletos',
    nameLabel: 'Nosso Número',
    statusField: 'status',
    statusOptions: BOLETO_STATUS,
    fields: [
      { name: 'cliente', label: 'Cliente', type: 'text', required: true },
      { name: 'titulo_id', label: 'Título Relacionado', type: 'text' },
      { name: 'nosso_numero', label: 'Nosso Número', type: 'text', required: true },
      { name: 'linha_digitavel', label: 'Linha Digitável', type: 'text', span: 2 },
      { name: 'valor', label: 'Valor', type: 'text', required: true },
      { name: 'data_emissao', label: 'Data Emissão', type: 'date' },
      { name: 'data_vencimento', label: 'Data Vencimento', type: 'date', required: true },
      { name: 'banco', label: 'Banco', type: 'text' },
    ],
  },
  pix: {
    collection: 'financial_pix',
    title: 'PIX',
    nameLabel: 'Identificador',
    statusField: 'status',
    statusOptions: PIX_STATUS,
    fields: [
      { name: 'cliente', label: 'Cliente', type: 'text', required: true },
      { name: 'titulo_id', label: 'Título Relacionado', type: 'text' },
      { name: 'identificador_transacao', label: 'Identificador', type: 'text', required: true },
      { name: 'chave_pix', label: 'Chave PIX', type: 'text', required: true },
      { name: 'valor', label: 'Valor', type: 'text', required: true },
      { name: 'data_geracao', label: 'Data Geração', type: 'date' },
      { name: 'data_vencimento', label: 'Vencimento', type: 'date' },
      { name: 'tipo_pix', label: 'Tipo', type: 'select', options: ['Estático', 'Dinâmico'] },
    ],
  },
  collections: {
    collection: 'financial_collections',
    title: 'Cobranças',
    nameLabel: 'Cliente',
    statusField: 'status',
    statusOptions: COLLECTION_STATUS,
    fields: [
      { name: 'cliente', label: 'Cliente', type: 'text', required: true },
      { name: 'titulo_id', label: 'Título', type: 'text' },
      { name: 'valor_original', label: 'Valor Original', type: 'text' },
      { name: 'valor_atualizado', label: 'Valor Atualizado', type: 'text' },
      { name: 'responsavel_cobranca', label: 'Responsável', type: 'text' },
      { name: 'ultimo_contato', label: 'Último Contato', type: 'date' },
      { name: 'proxima_acao', label: 'Próxima Ação', type: 'text' },
      { name: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
    ],
  },
  movements: {
    collection: 'financial_movements',
    title: 'Movimentações Financeiras',
    nameLabel: 'Documento',
    fields: [
      { name: 'data_hora', label: 'Data/Hora', type: 'date', required: true },
      {
        name: 'tipo_movimentacao',
        label: 'Tipo',
        type: 'select',
        options: [...MOVEMENT_TYPES],
        required: true,
      },
      { name: 'documento', label: 'Documento', type: 'text' },
      { name: 'cliente_fornecedor', label: 'Cliente/Fornecedor', type: 'text' },
      { name: 'conta', label: 'Conta', type: 'text' },
      { name: 'entrada', label: 'Entrada', type: 'text' },
      { name: 'saida', label: 'Saída', type: 'text' },
      { name: 'centro_custo', label: 'Centro de Custo', type: 'text' },
      { name: 'plano_contas', label: 'Plano de Contas', type: 'text' },
      { name: 'observacoes', label: 'Observações', type: 'textarea', span: 2 },
    ],
  },
  approvals: {
    collection: 'financial_approvals',
    title: 'Aprovações Financeiras',
    nameLabel: 'Solicitação',
    statusField: 'status',
    statusOptions: APPROVAL_STATUS,
    fields: [
      { name: 'tipo_solicitacao', label: 'Tipo', type: 'text', required: true },
      { name: 'solicitante', label: 'Solicitante', type: 'text' },
      { name: 'aprovador', label: 'Aprovador', type: 'text' },
      { name: 'data_hora', label: 'Data/Hora', type: 'date' },
      { name: 'valor', label: 'Valor', type: 'text' },
      { name: 'motivo', label: 'Motivo', type: 'textarea', span: 2 },
      { name: 'justificativa', label: 'Justificativa', type: 'textarea', span: 2 },
      { name: 'documento_relacionado', label: 'Documento', type: 'text' },
    ],
  },
  closing: {
    collection: 'financial_closings',
    title: 'Fechamento Financeiro',
    nameLabel: 'Período',
    statusField: 'status',
    statusOptions: CLOSING_STATUS,
    fields: [
      {
        name: 'tipo_fechamento',
        label: 'Tipo',
        type: 'select',
        options: [
          'Diário',
          'Mensal',
          'Por conta bancária',
          'Por caixa',
          'Por empresa',
          'Por filial',
        ],
        required: true,
      },
      { name: 'periodo', label: 'Período', type: 'text', required: true },
      { name: 'empresa', label: 'Empresa', type: 'text' },
      { name: 'filial', label: 'Filial', type: 'text' },
      { name: 'conta_bancaria', label: 'Conta Bancária', type: 'text' },
      { name: 'caixa_id', label: 'Caixa', type: 'text' },
      { name: 'data_fechamento', label: 'Data Fechamento', type: 'date', required: true },
      { name: 'responsavel', label: 'Responsável', type: 'text' },
      { name: 'justificativa_reabertura', label: 'Justif. Reabertura', type: 'textarea', span: 2 },
    ],
  },
}
