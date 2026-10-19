import { useState, useMemo } from 'react'
import {
  type LancamentoComissao,
  type ResumoPercentualItem,
  type ResumoTipoItem,
  type CampanhaPremiacaoItem,
  type FechamentoApuracao,
} from '@/services/comissao-analitica'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Info,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Sliders,
  Award,
  Receipt,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react'

interface TabelaProps {
  lancamentos: LancamentoComissao[]
  resumoPercentual: ResumoPercentualItem[]
  correcaoArredondamento: number
  resumoTipo: ResumoTipoItem[]
  campanhas: CampanhaPremiacaoItem[]
  fechamento: FechamentoApuracao
  mensagemBloqueio?: string
  onAbrirPedido: (pedido: string, id?: string) => void
  onAbrirNF: (nf: string, id?: string) => void
  onAbrirTitulo: (titulo: string, id?: string) => void
  onVerComposicao: (lancamento: LancamentoComissao) => void
}

function formatMoeda(val: number): string {
  const abs = Math.abs(val)
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs)
  return val < 0 ? `- R$ ${formatted}` : `R$ ${formatted}`
}

function formatData(dataStr?: string): string {
  if (!dataStr) return '—'
  const partes = dataStr.slice(0, 10).split('-')
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return dataStr
}

export function ComissaoAnaliticaTabela({
  lancamentos,
  resumoPercentual,
  correcaoArredondamento,
  resumoTipo,
  campanhas,
  fechamento,
  mensagemBloqueio,
  onAbrirPedido,
  onAbrirNF,
  onAbrirTitulo,
  onVerComposicao,
}: TabelaProps) {
  // Estado de busca rápida local
  const [buscaLocal, setBuscaLocal] = useState('')

  // Ordenação
  const [colunaOrdenacao, setColunaOrdenacao] = useState<keyof LancamentoComissao>('dataEmissao')
  const [ordemDescendente, setOrdemDescendente] = useState(false)

  // Paginação
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(25)

  // Filtro local nos resultados
  const lancamentosFiltrados = useMemo(() => {
    if (!buscaLocal.trim()) return lancamentos
    const termo = buscaLocal.toLowerCase().trim()
    return lancamentos.filter((l) => {
      return (
        l.razaoSocial.toLowerCase().includes(termo) ||
        l.nf.toLowerCase().includes(termo) ||
        l.pedido.toLowerCase().includes(termo) ||
        l.titulo.toLowerCase().includes(termo) ||
        l.tipoOperacao.toLowerCase().includes(termo) ||
        l.situacao.toLowerCase().includes(termo) ||
        l.valorComissao.toString().includes(termo)
      )
    })
  }, [lancamentos, buscaLocal])

  // Ordenação dos resultados
  const lancamentosOrdenados = useMemo(() => {
    const list = [...lancamentosFiltrados]
    list.sort((a, b) => {
      const vA = a[colunaOrdenacao]
      const vB = b[colunaOrdenacao]

      if (typeof vA === 'number' && typeof vB === 'number') {
        return ordemDescendente ? vB - vA : vA - vB
      }
      const sA = String(vA || '').toLowerCase()
      const sB = String(vB || '').toLowerCase()
      if (sA < sB) return ordemDescendente ? 1 : -1
      if (sA > sB) return ordemDescendente ? -1 : 1
      return 0
    })
    return list
  }, [lancamentosFiltrados, colunaOrdenacao, ordemDescendente])

  // Itens paginados
  const totalPaginas = Math.ceil(lancamentosOrdenados.length / itensPorPagina) || 1
  const itensExibidos = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina
    return lancamentosOrdenados.slice(inicio, inicio + itensPorPagina)
  }, [lancamentosOrdenados, paginaAtual, itensPorPagina])

  const alternarOrdenacao = (col: keyof LancamentoComissao) => {
    if (colunaOrdenacao === col) {
      setOrdemDescendente(!ordemDescendente)
    } else {
      setColunaOrdenacao(col)
      setOrdemDescendente(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Barra Superior da Tabela: Pesquisar nos resultados + Seletor de Paginação */}
      <div className="bg-card border border-border rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquisar nos resultados (cliente, NF, pedido, título, valor)..."
              value={buscaLocal}
              onChange={(e) => {
                setBuscaLocal(e.target.value)
                setPaginaAtual(1)
              }}
              className="pl-9 h-8 text-xs bg-background"
            />
          </div>
          {buscaLocal && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBuscaLocal('')}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Mostrando <b>{itensExibidos.length}</b> de <b>{lancamentosFiltrados.length}</b>{' '}
            registros
          </span>

          <div className="flex items-center gap-1.5">
            <span>Itens:</span>
            <select
              value={itensPorPagina}
              onChange={(e) => {
                setItensPorPagina(Number(e.target.value))
                setPaginaAtual(1)
              }}
              className="h-7 text-xs border border-border rounded bg-background px-1.5 focus:outline-hidden"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. TABELA ANALÍTICA PRINCIPAL (Estrutura idêntica ao print com cabeçalho escuro premium Jetro) */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#002817] text-white select-none">
                <th
                  onClick={() => alternarOrdenacao('tipoOperacao')}
                  className="py-3 px-3 font-semibold cursor-pointer whitespace-nowrap hover:bg-[#00381C] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Operação</span>
                    <ArrowUpDown className="w-3 h-3 text-white/70" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrdenacao('razaoSocial')}
                  className="py-3 px-3 font-semibold cursor-pointer whitespace-nowrap hover:bg-[#00381C] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Razão Social</span>
                    <ArrowUpDown className="w-3 h-3 text-white/70" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrdenacao('nf')}
                  className="py-3 px-3 font-semibold cursor-pointer whitespace-nowrap hover:bg-[#00381C] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>NF</span>
                    <ArrowUpDown className="w-3 h-3 text-white/70" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrdenacao('pedido')}
                  className="py-3 px-3 font-semibold cursor-pointer whitespace-nowrap hover:bg-[#00381C] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Pedido</span>
                    <ArrowUpDown className="w-3 h-3 text-white/70" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrdenacao('titulo')}
                  className="py-3 px-3 font-semibold cursor-pointer whitespace-nowrap hover:bg-[#00381C] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Título</span>
                    <ArrowUpDown className="w-3 h-3 text-white/70" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrdenacao('dataEmissao')}
                  className="py-3 px-3 font-semibold cursor-pointer whitespace-nowrap hover:bg-[#00381C] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Data de emissão</span>
                    <ArrowUpDown className="w-3 h-3 text-white/70" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrdenacao('dataVencimento')}
                  className="py-3 px-3 font-semibold cursor-pointer whitespace-nowrap hover:bg-[#00381C] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Data de vencimento</span>
                    <ArrowUpDown className="w-3 h-3 text-white/70" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrdenacao('dataPagamento')}
                  className="py-3 px-3 font-semibold cursor-pointer whitespace-nowrap hover:bg-[#00381C] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Data de pagamento</span>
                    <ArrowUpDown className="w-3 h-3 text-white/70" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrdenacao('totalNota')}
                  className="py-3 px-3 font-semibold cursor-pointer whitespace-nowrap hover:bg-[#00381C] transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Nota</span>
                    <ArrowUpDown className="w-3 h-3 text-white/70" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrdenacao('totalTitulo')}
                  className="py-3 px-3 font-semibold cursor-pointer whitespace-nowrap hover:bg-[#00381C] transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Título</span>
                    <ArrowUpDown className="w-3 h-3 text-white/70" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrdenacao('baseComissao')}
                  className="py-3 px-3 font-semibold cursor-pointer whitespace-nowrap hover:bg-[#00381C] transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Base Comissão</span>
                    <ArrowUpDown className="w-3 h-3 text-white/70" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrdenacao('percentualComissao')}
                  className="py-3 px-3 font-semibold cursor-pointer whitespace-nowrap hover:bg-[#00381C] transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>% Com.</span>
                    <ArrowUpDown className="w-3 h-3 text-white/70" />
                  </div>
                </th>
                <th
                  onClick={() => alternarOrdenacao('valorComissao')}
                  className="py-3 px-3 font-semibold cursor-pointer whitespace-nowrap hover:bg-[#00381C] transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Comissão</span>
                    <ArrowUpDown className="w-3 h-3 text-white/70" />
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {itensExibidos.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-muted-foreground">
                    Nenhum lançamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                itensExibidos.map((l) => {
                  const isDevolucao = l.tipoOperacao === 'Devolução' || l.tipoOperacao === 'Estorno'
                  const isAjuste = l.tipoOperacao === 'Ajuste'

                  return (
                    <tr
                      key={l.id}
                      className={`hover:bg-muted/40 transition-colors ${
                        isDevolucao ? 'bg-red-500/5' : isAjuste ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Operação */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDevolucao
                              ? 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                              : isAjuste
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {l.tipoOperacao}
                        </span>
                      </td>

                      {/* Razão Social */}
                      <td className="py-2.5 px-3 max-w-[200px] truncate font-medium text-foreground">
                        {l.razaoSocial}
                      </td>

                      {/* NF com botão de navegação direta */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onAbrirNF(l.nf, l.nfId)}
                          className="inline-flex items-center gap-1.5 group text-foreground font-semibold hover:text-[#002817] dark:hover:text-[#E4C46A] transition-colors"
                          title="Consultar Nota Fiscal no ERP"
                        >
                          <span className="w-5 h-5 rounded-md bg-[#002817]/10 dark:bg-[#002817]/40 text-[#002817] dark:text-[#E4C46A] group-hover:bg-[#002817] group-hover:text-white flex items-center justify-center text-[10px] font-bold transition-colors">
                            i
                          </span>
                          <span className="underline decoration-dotted underline-offset-2">
                            {l.nf}
                          </span>
                        </button>
                      </td>

                      {/* Pedido com botão de navegação direta */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onAbrirPedido(l.pedido, l.pedidoId)}
                          className="inline-flex items-center gap-1.5 group text-foreground font-semibold hover:text-[#002817] dark:hover:text-[#E4C46A] transition-colors"
                          title="Consultar Detalhes do Pedido de Venda"
                        >
                          <span className="w-5 h-5 rounded-md bg-[#002817]/10 dark:bg-[#002817]/40 text-[#002817] dark:text-[#E4C46A] group-hover:bg-[#002817] group-hover:text-white flex items-center justify-center text-[10px] font-bold transition-colors">
                            i
                          </span>
                          <span className="underline decoration-dotted underline-offset-2">
                            {l.pedido}
                          </span>
                        </button>
                      </td>

                      {/* Título com botão de navegação direta */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onAbrirTitulo(l.titulo, l.tituloId)}
                          className="inline-flex items-center gap-1.5 group text-foreground font-semibold hover:text-[#002817] dark:hover:text-[#E4C46A] transition-colors"
                          title="Consultar Título no Financeiro"
                        >
                          <span className="w-5 h-5 rounded-md bg-[#002817]/10 dark:bg-[#002817]/40 text-[#002817] dark:text-[#E4C46A] group-hover:bg-[#002817] group-hover:text-white flex items-center justify-center text-[10px] font-bold transition-colors">
                            i
                          </span>
                          <span className="underline decoration-dotted underline-offset-2">
                            {l.titulo}
                          </span>
                        </button>
                      </td>

                      {/* Datas */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                        {formatData(l.dataEmissao)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                        {formatData(l.dataVencimento)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                        {formatData(l.dataPagamento)}
                      </td>

                      {/* Valores */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-right font-medium">
                        {formatMoeda(l.totalNota)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right font-medium">
                        {formatMoeda(l.totalTitulo)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right font-medium">
                        {formatMoeda(l.baseComissao)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-right font-mono text-muted-foreground">
                        {l.percentualComissao.toFixed(2)} %
                      </td>
                      <td
                        className={`py-2.5 px-3 whitespace-nowrap text-right font-bold ${
                          isDevolucao
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-[#002817] dark:text-[#E4C46A]'
                        }`}
                      >
                        {formatMoeda(l.valorComissao)}
                      </td>

                      {/* Ação: Ver composição do cálculo */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onVerComposicao(l)}
                          className="h-6 px-2 text-[11px] text-[#002817] dark:text-[#E4C46A] hover:bg-[#002817]/10"
                          title="Ver composição da fórmula e rastreabilidade"
                        >
                          <Info className="w-3.5 h-3.5 mr-1" />
                          Cálculo
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação inferior */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-t border-border text-xs">
          <span className="text-muted-foreground">
            Página <b>{paginaAtual}</b> de <b>{totalPaginas}</b>
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual <= 1}
              onClick={() => setPaginaAtual((p) => p - 1)}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={paginaAtual >= totalPaginas}
              onClick={() => setPaginaAtual((p) => p + 1)}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 6. RESUMO POR PERCENTUAL DE COMISSÃO (Estrutura idêntica aos prints 1 e 2) */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="bg-[#002817] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#C9A227]" />
            <h3 className="font-semibold text-xs tracking-wide uppercase">
              Resumo por Percentual de Comissão
            </h3>
          </div>
          <span className="text-[11px] text-white/80">Dinâmico conforme alíquotas reais</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#002817]/15 text-[#002817] dark:text-[#E4C46A] border-b border-border font-bold">
                <th className="py-2.5 px-4 text-left">Comissão</th>
                <th className="py-2.5 px-4 text-right">Total de recebimento</th>
                <th className="py-2.5 px-4 text-right">Valor Comissão</th>
                <th className="py-2.5 px-4 text-right">% do Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resumoPercentual.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="py-2 px-4 font-bold text-foreground">{item.percentualLabel}</td>
                  <td className="py-2 px-4 text-right font-medium">
                    {formatMoeda(item.totalRecebimento)}
                  </td>
                  <td className="py-2 px-4 text-right font-bold text-[#002817] dark:text-[#E4C46A]">
                    {formatMoeda(item.valorComissao)}
                  </td>
                  <td className="py-2 px-4 text-right font-mono text-muted-foreground">
                    {item.participacaoPercent.toFixed(2)} %
                  </td>
                </tr>
              ))}

              {/* Linha Correção de Arredondamento (Print 2) */}
              {correcaoArredondamento > 0 && (
                <tr className="bg-muted/40 font-medium">
                  <td className="py-2 px-4 text-muted-foreground italic">
                    Correção de arredondamento
                  </td>
                  <td className="py-2 px-4 text-right text-muted-foreground">—</td>
                  <td className="py-2 px-4 text-right font-bold text-foreground">
                    {formatMoeda(correcaoArredondamento)}
                  </td>
                  <td className="py-2 px-4 text-right text-muted-foreground italic">
                    Ajuste de centavos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. RESUMO POR TIPO DE COMISSÃO (Estrutura idêntica ao print 2) */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="bg-[#002817] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#C9A227]" />
            <h3 className="font-semibold text-xs tracking-wide uppercase">
              Resumo por Tipo de Comissão
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#002817]/15 text-[#002817] dark:text-[#E4C46A] border-b border-border font-bold">
                <th className="py-2.5 px-4 text-left">Tipo Comissão</th>
                <th className="py-2.5 px-4 text-right">Total Base</th>
                <th className="py-2.5 px-4 text-right">Valor Comissão</th>
                <th className="py-2.5 px-4 text-right">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {resumoTipo.map((t, idx) => (
                <tr key={idx} className="hover:bg-muted/30">
                  <td className="py-2 px-4 font-semibold">{t.tipo}</td>
                  <td className="py-2 px-4 text-right font-medium">{formatMoeda(t.baseCalculo)}</td>
                  <td className="py-2 px-4 text-right font-bold text-[#002817] dark:text-[#E4C46A]">
                    {formatMoeda(t.valorComissao)}
                  </td>
                  <td className="py-2 px-4 text-right font-mono">
                    {t.participacaoPercent.toFixed(2)}%
                  </td>
                </tr>
              ))}
              <tr className="bg-[#002817]/10 font-bold border-t-2 border-[#002817]/20">
                <td className="py-2.5 px-4 text-[#002817] dark:text-[#E4C46A]">Total Geral</td>
                <td className="py-2.5 px-4 text-right">
                  {formatMoeda(resumoTipo.reduce((a, b) => a + b.baseCalculo, 0))}
                </td>
                <td className="py-2.5 px-4 text-right text-[#002817] dark:text-[#E4C46A]">
                  {formatMoeda(resumoTipo.reduce((a, b) => a + b.valorComissao, 0))}
                </td>
                <td className="py-2.5 px-4 text-right font-mono">100,00%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. CAMPANHAS E PREMIAÇÕES (Print 2: linhas de Campanhas de Vendas) */}
      <div className="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
        <div className="bg-[#002817] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#C9A227]" />
            <h3 className="font-semibold text-xs tracking-wide uppercase">
              Campanhas e Premiações
            </h3>
          </div>
          <span className="text-[11px] text-white/80">Adicionais e incentivos elegíveis</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#002817]/15 text-[#002817] dark:text-[#E4C46A] border-b border-border font-bold">
                <th className="py-2.5 px-4 text-left">Tipo</th>
                <th className="py-2.5 px-4 text-left">Campanha</th>
                <th className="py-2.5 px-4 text-left">Período</th>
                <th className="py-2.5 px-4 text-right">Valor</th>
                <th className="py-2.5 px-4 text-center">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campanhas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                    Nenhuma campanha ou premiação no período.
                  </td>
                </tr>
              ) : (
                campanhas.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="py-2 px-4 font-bold text-muted-foreground">{c.tipo}</td>
                    <td className="py-2 px-4 font-semibold text-foreground">{c.campanha}</td>
                    <td className="py-2 px-4 text-muted-foreground">{c.periodo}</td>
                    <td className="py-2 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                      {formatMoeda(c.valor)}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300"
                      >
                        {c.situacao}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 9. FECHAMENTO DA APURAÇÃO (Demonstrativo Financeiro Final dos Prints 1 e 2) */}
      <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden">
        <div className="bg-[#002817] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#C9A227]" />
            <h3 className="font-bold text-sm tracking-wide">
              Demonstrativo Financeiro e Fechamento
            </h3>
          </div>
          <span className="text-xs text-[#E4C46A] font-semibold">Apuração Final Consolidada</span>
        </div>

        <div className="p-4 sm:p-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 border-r border-border/60 pr-0 md:pr-4">
              <div className="flex justify-between items-center text-xs py-1 border-b border-border/40">
                <span className="text-muted-foreground">Total de Comissões Positivas:</span>
                <span className="font-semibold text-foreground">
                  {formatMoeda(fechamento.totalComissoesPositivas)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-border/40">
                <span className="text-muted-foreground">(-) Estornos de Devoluções:</span>
                <span className="font-semibold text-red-600">
                  {formatMoeda(fechamento.estornosDevolucoes)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-border/40">
                <span className="text-muted-foreground">(+/-) Correção de Arredondamento:</span>
                <span className="font-semibold text-foreground">
                  {formatMoeda(fechamento.ajustes)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-border/40">
                <span className="text-muted-foreground">(+) Campanhas e Premiações Elegíveis:</span>
                <span className="font-semibold text-emerald-600">
                  {formatMoeda(fechamento.campanhasPremiacoesElegiveis)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs py-1 border-b border-border/40">
                <span className="text-muted-foreground">(-) Adiantamentos a Compensar:</span>
                <span className="font-semibold text-foreground">
                  {formatMoeda(fechamento.adiantamentosCompensar)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-border/40">
                <span className="text-muted-foreground">Valor Total da Nota Fiscal (Ref.):</span>
                <span className="font-semibold text-foreground">
                  {formatMoeda(fechamento.valorTotalNFs)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 border-b border-border/40">
                <span className="text-muted-foreground">Total de Recebimentos Considerados:</span>
                <span className="font-semibold text-foreground">
                  {formatMoeda(fechamento.totalRecebimentos)}
                </span>
              </div>

              {/* Valor a Receber em Destaque */}
              <div className="flex justify-between items-center text-sm font-extrabold bg-[#002817]/10 dark:bg-[#002817]/30 p-2.5 rounded-lg border border-[#002817]/20 mt-2">
                <span className="text-[#002817] dark:text-[#E4C46A] uppercase tracking-wide">
                  Valor a receber:
                </span>
                <span className="text-base sm:text-lg text-[#002817] dark:text-[#E4C46A]">
                  {formatMoeda(fechamento.valorFinalReceber)}
                </span>
              </div>
            </div>
          </div>

          {/* Banner de Status / Bloqueio (Print 2: "A comissão para esse RCA já foi apurada.") */}
          {mensagemBloqueio && (
            <div className="mt-4 pt-4 border-t border-border flex justify-center">
              <div className="bg-slate-500/90 hover:bg-slate-600 text-white font-medium text-xs py-2 px-6 rounded-md shadow-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-300" />
                <span>{mensagemBloqueio}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
