// Tipos compartilhados da tela "Visão estratégica em 360°".

export interface GlobalFilters {
  origens: string[]
  marca: string
  diaReferencia: string // yyyy-mm-dd
  mesAnoReferencia: string // mm/yyyy
}

export interface SemanaRow {
  diaSemana: string
  data: string
  unAnterior: number
  unAtual: number
  evolucaoPct: number
  pedidos: number
  skus: number
  itensPorPedido: number
  unPorPedido: number
  valorAnterior: number
  valorAtual: number
}

export interface ObjetivoPanelData {
  unidadesRealizadas: number
  valorRealizado: number
}

export interface FaturamentoStats {
  conciliacoes: number
  nfesHoje: number
  clientesHoje: number
  unidadesHoje: number
  valorHoje: number
  faturamentoSemana: number
  romaneios: number
  devolucoes: number
  entradas: number
  valorMes: number
}

export interface MarcasRow {
  marca: string
  nf: number
  un: number
  total: number
  media: number
  custo: number
  markup: number
  participacaoPct: number
}

export interface TopProdutoRow {
  nome: string
  qtd: number
  valor: number
  custo: number
  markup: number
}

export interface ProdutosStats {
  skusAtivos: number
  marcasAtivas: number
  comEstoque: number
  pctComEstoque: number
  semEstoque: number
  pctSemEstoque: number
  criticaCadastro: number
  semFoto: number
  precoAbaixoTabela: number
  topProdutos: TopProdutoRow[]
}

export interface StockCompareRow {
  sku: string
  nome: string
  qtdFiscal: number
  qtdWms: number
  qtdAvarias: number
  qtdDiferenca: number
  precoEntrada: number
  custoMedio: number
}

export interface SkuInativoEstoqueRow {
  sku: string
  nome: string
  estoque: number
}

export interface WeeklyCashFlowRow {
  semana: string
  vencimento: string
  direitos: number
  direitosPrev: number
  obrigacao: number
  obrigacaoPrev: number
  saldoDia: number
  acumulado: number
}

export interface ClienteStats {
  titulosAtrasados: number
  valorAtrasado: number
  titulosAVencer: number
  valorAVencer: number
  titulosLiberados: number
  pedidosTabela: number
  pedidosCasadinha: number
  ranking: { nome: string; total: number }[]
}

export interface FornecedorTopRow {
  nome: string
  compras: number
}

export interface FornecedoresStats {
  totalFornecedores: number
  ativos: number
  comprasPeriodo: number
  topFornecedores: FornecedorTopRow[]
}

export interface EmpresaOption {
  value: string
  label: string
}

export const TAB_DEFS = [
  { id: 'flash-vendas', label: 'Flash de Vendas' },
  { id: 'objetivo', label: 'Objetivo' },
  { id: 'faturamento', label: 'Faturamento' },
  { id: 'marcas', label: 'Marcas' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'estoque', label: 'Estoque' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'fluxo-caixa', label: 'Fluxo de Caixa' },
  { id: 'clientes', label: 'Clientes' },
  { id: 'fornecedores', label: 'Fornecedores / Verbas' },
] as const

export type TabId = (typeof TAB_DEFS)[number]['id']
