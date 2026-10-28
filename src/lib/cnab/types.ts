/**
 * Tipagens completas do Módulo CNAB (FEBRABAN 240 e 400)
 */

export type CnabLayout = 'CNAB 240' | 'CNAB 400'
export type CnabAmbiente = 'homologacao' | 'producao'
export type CnabTipoCobranca = 'boleto' | 'pix' | 'ambos'

export interface CnabConfig {
  id: string
  nome_convenio: string
  banco_codigo: string // 001, 033, 104, 237, 341, 748, 756, etc.
  banco_nome: string
  layout_padrao: CnabLayout
  ambiente: CnabAmbiente
  tipo_cobranca: CnabTipoCobranca
  empresa?: string
  filial?: string
  empresa_id?: string
  filial_id?: string
  agencia: string
  agencia_digito?: string
  conta: string
  conta_digito: string
  convenio: string
  cedente_nome: string
  cedente_codigo: string
  cedente_cnpj_cpf?: string
  carteira: string
  variacao_carteira?: string
  chave_pix?: string
  sequencial_remessa?: number
  multa_percentual?: string
  juros_mora_mensal?: string
  dias_baixa_devolucao?: number
  dias_protesto?: number
  instrucoes_cobranca_1?: string
  instrucoes_cobranca_2?: string
  ativo: boolean
  observacoes?: string
  created?: string
  updated?: string
}

export interface CnabTituloRemessa {
  id: string
  numero_titulo: string
  cliente: string
  cpf_cnpj?: string
  endereco?: string
  cep?: string
  cidade?: string
  uf?: string
  data_emissao: string
  data_vencimento: string
  valor_original: string
  nosso_numero?: string
  numero_documento?: string
  status?: string
}

export interface CnabRemessaRecord {
  id: string
  config_id: string
  banco_codigo: string
  layout: CnabLayout
  sequencial_arquivo: number
  nome_arquivo: string
  empresa?: string
  filial?: string
  usuario_nome?: string
  usuario_id?: string
  data_geracao: string
  quantidade_titulos: number
  valor_total: string
  titulos_ids: string[]
  titulos_detalhes: CnabTituloRemessa[]
  checksum_conteudo?: string
  conteudo_arquivo?: string
  status: 'gerado' | 'enviado_ao_banco' | 'processado' | 'cancelado'
  motivo_cancelamento?: string
  created?: string
  updated?: string
}

export interface CnabEventoRetorno {
  numero_titulo_retorno: string
  nosso_numero: string
  codigo_ocorrencia: string
  descricao_ocorrencia: string
  tipo_evento:
    | 'liquidacao'
    | 'baixa'
    | 'devolucao'
    | 'rejeicao'
    | 'cartorio'
    | 'abatimento'
    | 'desconto'
    | 'outros'
  motivos_rejeicao?: string[]
  data_ocorrencia: string
  data_credito?: string
  valor_titulo: number
  valor_pago: number
  valor_desconto: number
  valor_juros_multa: number
  valor_liquido: number
  banco_recebedor?: string
  agencia_recebedora?: string
  titulo_sistema_id?: string
  status_conferencia: 'compativel' | 'divergente' | 'nao_encontrado' | 'ja_baixado'
  divergencia_motivo?: string
}

export interface CnabRetornoRecord {
  id: string
  nome_arquivo: string
  layout: CnabLayout
  banco_codigo?: string
  banco_nome?: string
  empresa?: string
  filial?: string
  data_processamento: string
  data_gravacao_retorno?: string
  usuario_nome?: string
  usuario_id?: string
  total_registros: number
  total_titulos_processados: number
  total_valor_processado: string
  total_valor_liquidado: string
  total_liquidados: number
  total_divergencias: number
  total_rejeicoes: number
  total_baixas: number
  eventos: CnabEventoRetorno[]
  checksum_conteudo?: string
  status: 'processado_com_sucesso' | 'processado_com_pendencias' | 'erro_processamento'
  log_processamento?: string
  created?: string
  updated?: string
}

export const BANCOS_FEBRABAN: { codigo: string; nome: string }[] = [
  { codigo: '001', nome: '001 - Banco do Brasil' },
  { codigo: '033', nome: '033 - Santander' },
  { codigo: '104', nome: '104 - Caixa Econômica Federal' },
  { codigo: '237', nome: '237 - Bradesco' },
  { codigo: '341', nome: '341 - Itaú Unibanco' },
  { codigo: '748', nome: '748 - Sicredi' },
  { codigo: '756', nome: '756 - Sicoob' },
  { codigo: '077', nome: '077 - Banco Inter' },
  { codigo: '260', nome: '260 - Nubank' },
  { codigo: '422', nome: '422 - Banco Safra' },
  { codigo: '999', nome: '999 - Outro Banco' },
]
