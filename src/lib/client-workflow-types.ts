export type SolicitacaoStatus =
  | 'rascunho'
  | 'aguardando_validacao'
  | 'em_correcao'
  | 'em_analise'
  | 'concluido'
  | 'rejeitado'
  | 'cancelado'

export type SituacaoCredito =
  | 'Pendente de análise'
  | 'Aprovado'
  | 'Aprovado com restrições'
  | 'Reprovado'
  | 'Bloqueado'
  | 'Em revisão'

export interface SolicitacaoHistoricoItem {
  data_hora: string
  usuario_id: string
  usuario_nome: string
  acao: string
  status?: string
  motivo?: string
  detalhes?: string
}

export interface SolicitacaoClienteRecord {
  id: string
  numero: string
  status: SolicitacaoStatus
  tipo_pessoa: 'PF' | 'PJ'
  cpf_cnpj: string
  razao_social: string
  nome_fantasia: string
  inscricao_estadual?: string
  situacao_ie?: 'contribuinte' | 'isento' | 'nao_contribuinte'
  cnae?: string
  data_fundacao?: string
  situacao_cadastral?: string
  origem_consulta?: string
  data_consulta?: string
  cep?: string
  uf?: string
  municipio?: string
  bairro?: string
  logradouro?: string
  numero_end?: string
  complemento?: string
  ponto_referencia?: string
  endereco_entrega_diferente?: boolean
  endereco_entrega?: {
    cep?: string
    uf?: string
    municipio?: string
    bairro?: string
    logradouro?: string
    numero?: string
    complemento?: string
    ponto_referencia?: string
  }
  telefone?: string
  telefone_adicional?: string
  whatsapp?: string
  responsavel_estabelecimento?: string
  email?: string
  email_xml?: string
  contato_comercial?: string
  socios?: Array<{ nome: string; cpf_cnpj?: string; participacao?: string }>
  referencias_comerciais?: Array<{ empresa: string; telefone?: string; contato?: string }>
  observacoes_vendedor?: string
  motivo_solicitacao?: string
  pendencias_correcao?: string
  rca_id: string
  rca_nome: string
  rca_codigo?: string
  gerente_id: string
  gerente_nome: string
  gerente_codigo?: string
  solicitante_id?: string
  solicitante_nome?: string
  cliente_gerado_id?: string
  cliente_gerado_codigo?: string
  data_solicitacao?: string
  data_conclusao?: string
  historico?: SolicitacaoHistoricoItem[]
  limite_pretendido?: string
  condicao_pagamento_solicitada?: string
  anexos?: string[]
  created?: string
  updated?: string
}

export interface ClienteOficialRecord {
  id: string
  codigo_oficial?: string
  partner_type: string
  person_type: 'PF' | 'PJ'
  cpf?: string
  cnpj?: string
  full_name?: string
  company_name?: string
  trade_name?: string
  state_registration?: string
  cnae?: string
  email?: string
  phone?: string
  cep?: string
  address?: string
  address_number?: string
  address_complement?: string
  address_district?: string
  address_city?: string
  address_state?: string
  reference_point?: string
  active?: boolean
  blocked?: boolean
  financial_restriction?: boolean
  situacao_credito?: SituacaoCredito
  limite_credito?: string
  limite_credito_disponivel?: string
  bloqueio_vendas_prazo?: boolean
  motivo_bloqueio?: string
  data_bloqueio?: string
  rca_id?: string
  rca_nome?: string
  rca_codigo?: string
  televendas_id?: string
  responsavel_comercial_digital_id?: string
  gerente_comercial_id?: string
  gerente_comercial_nome?: string
  perfil_cliente?: string
  canal_comercial?: string
  segmento?: string
  tipo_loja?: string
  potencial_compra?: string
  frequencia_prevista?: string
  rota_id?: string
  rota_nome?: string
  rota_codigo?: string
  tabela_preco_id?: string
  tabela_preco_nome?: string
  tabelas_adicionais?: string[]
  desconto_maximo?: string
  pedido_minimo?: string
  forma_atendimento?: string
  regime_tributario?: string
  simples_nacional?: boolean
  classificacao_icms?: string
  consumidor_final?: boolean
  contribuinte_icms?: boolean
  produtor_rural?: boolean
  email_xml?: string
  contatos_adicionais?: Array<{
    nome: string
    cargo?: string
    telefone?: string
    whatsapp?: string
    email?: string
    tipo?: string
  }>
  locais_entrega?: Array<{
    descricao: string
    endereco: string
    rota_id?: string
    contato?: string
  }>
  observacoes_comerciais?: string
  observacoes_logisticas?: string
  observacoes_fiscais?: string
  observacoes?: string
  historico_eventos?: SolicitacaoHistoricoItem[]
  solicitacao_origem_id?: string
  created?: string
  updated?: string
}

export interface AprovacaoCreditoRecord {
  id: string
  tipo_solicitacao: string
  categoria?: string
  solicitante?: string
  aprovador?: string
  data_hora?: string
  valor?: string
  motivo?: string
  justificativa?: string
  status: string
  documento_relacionado?: string
  client_id?: string
  client_codigo?: string
  client_nome?: string
  cnpj_cpf?: string
  rca_nome?: string
  gerente_nome?: string
  limite_solicitado?: string
  limite_aprovado?: string
  condicoes_autorizadas?: string
  motivo_decisao?: string
  validade_revisao?: string
  bloquear_prazo?: boolean
  motivo_bloqueio?: string
  historico_analise?: SolicitacaoHistoricoItem[]
  created?: string
  updated?: string
}

export const PERFIS_CLIENTE = [
  'Farmácia',
  'Rede de Farmácias',
  'Supermercado',
  'Minimercado',
  'Mercearia',
  'Atacarejo',
  'Distribuidor',
  'Perfumaria',
  'Loja de Cosméticos',
  'Conveniência',
  'Outros',
]

export const CANAIS_COMERCIAIS = [
  'Varejo Tradicional',
  'Farma',
  'Alimentar',
  'Distribuição',
  'Key Account',
  'E-commerce / B2B',
  'Institucional',
]

export const CLASSIFICACOES_FISCAIS = [
  'Revendedor (Comércio)',
  'Consumidor Final Contribuinte',
  'Consumidor Final Não Contribuinte',
  'Produtor Rural',
  'Isento',
]
