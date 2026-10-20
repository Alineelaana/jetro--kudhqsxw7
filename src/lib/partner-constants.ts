export const FINANCIAL_RECORD_TYPES = [
  'Pagamento em dia',
  'Pagamento em atraso',
  'Acordo',
  'Restrição',
  'Liberação',
  'Observação Financeira',
] as const

export const DOCUMENT_CATEGORIES = [
  'Documento pessoal',
  'RG',
  'CNH',
  'Comprovante de renda',
  'Comprovante de endereço',
  'Contrato',
  'Cartão CNPJ',
  'Inscrição Estadual',
  'Outros',
] as const

export const ROLE_LABELS: Record<string, string> = {
  SUP: 'Administrador (SUP)',
  FINANCEIRO: 'Financeiro',
  COMERCIAL: 'Comercial',
  PADRAO: 'Gestão',
  SDR: 'SDR',
  Vendedor: 'Vendedor',
}

export const RESTRICTION_ALERT_TEXT =
  'Cliente com Restrição Financeira Interna. Consulte o histórico financeiro antes de prosseguir.'
