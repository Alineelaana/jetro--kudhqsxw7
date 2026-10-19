import { useState, useEffect } from 'react'
import {
  type RcaOption,
  type FiltrosComissao,
  type ResultadoComissaoAnalitica,
  type LancamentoComissao,
  carregarRepresentantesReais,
  consultarComissaoAnalitica,
  atualizarStatusApuracao,
} from '@/services/comissao-analitica'
import { ComissaoAnaliticaFiltros } from '@/components/comissao/comissao-analitica-filtros'
import { ComissaoAnaliticaIndicadores } from '@/components/comissao/comissao-analitica-indicadores'
import { ComissaoAnaliticaTabela } from '@/components/comissao/comissao-analitica-tabela'
import {
  DialogComposicaoCalculo,
  DialogVisualizacaoDocumento,
  DialogAcoesApuracao,
  type DocumentoConsulta,
} from '@/components/comissao/comissao-analitica-dialogs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, ShieldAlert, Sparkles, SlidersHorizontal } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

export default function ComissaoAnaliticaPage() {
  const { toast } = useToast()

  // Estado dos Favoritos
  const [isFavorito, setIsFavorito] = useState(false)

  // Representantes reais do banco
  const [rcas, setRcas] = useState<RcaOption[]>([])
  const [rcaSelecionado, setRcaSelecionado] = useState<RcaOption | null>(null)

  // Filtros
  const [filtros, setFiltros] = useState<FiltrosComissao>({
    metodoApuracao: 'Adiantamento',
    rcaCode: '',
    dataInicio: '2026-07-01',
    dataFim: '2026-09-30',
  })

  // Estado dos dados apurados
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<ResultadoComissaoAnalitica | null>(null)

  // Diálogos modais
  const [lancamentoComposicao, setLancamentoComposicao] = useState<LancamentoComissao | null>(null)
  const [dialogComposicaoAberto, setDialogComposicaoAberto] = useState(false)

  const [documentoConsulta, setDocumentoConsulta] = useState<DocumentoConsulta | null>(null)
  const [dialogDocumentoAberto, setDialogDocumentoAberto] = useState(false)

  const [dialogStatusAberto, setDialogStatusAberto] = useState(false)

  // 1. Carga inicial dos RCAs
  useEffect(() => {
    async function carregar() {
      const lista = await carregarRepresentantesReais()
      setRcas(lista)
      if (lista.length > 0) {
        // Encontrar primeiro a Maria Aparecida ou o primeiro RCA ativo
        const rcaPadrao =
          lista.find((r) => r.code === '53.215.715' || r.name.includes('Maria Aparecida')) ||
          lista[0]
        setRcaSelecionado(rcaPadrao)
        setFiltros((prev) => ({ ...prev, rcaCode: rcaPadrao.code }))
      }
    }
    carregar()
  }, [])

  // 2. Consulta de comissão ao inicializar o RCA
  useEffect(() => {
    if (rcaSelecionado) {
      executarConsulta(rcaSelecionado)
    }
  }, [rcaSelecionado?.code, filtros.metodoApuracao])

  const executarConsulta = async (rcaAtual = rcaSelecionado) => {
    setLoading(true)
    try {
      const res = await consultarComissaoAnalitica(filtros, rcaAtual)
      setResultado(res)
    } catch (err: any) {
      toast({
        title: 'Erro ao consultar comissões',
        description: err.message || 'Falha ao buscar lançamentos no banco',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Ações de navegação direta para os documentos reais
  const handleAbrirPedido = async (numeroPedido: string, pedidoId?: string) => {
    let dados: any = null
    try {
      if (pedidoId) {
        dados = await pb.collection('sales_orders').getOne(pedidoId)
      } else {
        dados = await pb
          .collection('sales_orders')
          .getFirstListItem(`order_number = "${numeroPedido}"`)
      }
    } catch {
      // Abre com as informações disponíveis
    }
    setDocumentoConsulta({
      tipo: 'pedido',
      codigo: numeroPedido,
      id: pedidoId || dados?.id,
      dados: dados,
    })
    setDialogDocumentoAberto(true)
  }

  const handleAbrirNF = async (numeroNF: string, nfId?: string) => {
    let dados: any = null
    try {
      if (nfId) {
        dados = await pb.collection('sales_invoices').getOne(nfId)
      } else {
        dados = await pb
          .collection('sales_invoices')
          .getFirstListItem(`invoice_number = "${numeroNF}"`)
      }
    } catch {
      // Abre com as informações disponíveis
    }
    setDocumentoConsulta({
      tipo: 'nf',
      codigo: numeroNF,
      id: nfId || dados?.id,
      dados: dados,
    })
    setDialogDocumentoAberto(true)
  }

  const handleAbrirTitulo = async (numeroTitulo: string, tituloId?: string) => {
    let dados: any = null
    try {
      if (tituloId) {
        dados = await pb.collection('financial_receivables').getOne(tituloId)
      } else {
        dados = await pb
          .collection('financial_receivables')
          .getFirstListItem(`numero_titulo = "${numeroTitulo}"`)
      }
    } catch {
      // Abre com as informações disponíveis
    }
    setDocumentoConsulta({
      tipo: 'titulo',
      codigo: numeroTitulo,
      id: tituloId || dados?.id,
      dados: dados,
    })
    setDialogDocumentoAberto(true)
  }

  const handleVerComposicao = (lancamento: LancamentoComissao) => {
    setLancamentoComposicao(lancamento)
    setDialogComposicaoAberto(true)
  }

  const handleLimparFiltros = () => {
    setFiltros({
      metodoApuracao: 'Adiantamento',
      rcaCode: rcaSelecionado?.code || '',
      dataInicio: '2026-07-01',
      dataFim: '2026-09-30',
      cliente: '',
      numeroPedido: '',
      numeroNF: '',
      numeroTitulo: '',
      tipoOperacao: 'todos',
      situacaoComissao: 'todas',
    })
    toast({
      title: 'Filtros limpos',
      description: 'Critérios restaurados para o padrão.',
    })
  }

  // Exportações
  const handleExportarExcel = () => {
    if (!resultado) return

    // Seção 1: Lançamentos de Vendas
    const secaoLancamentos = [
      ['=== LANÇAMENTOS OPERACIONAIS (VENDAS / DEVOLUÇÕES / TÍTULOS) ==='],
      [
        'Tipo de Operação',
        'Razão Social',
        'NF',
        'Pedido',
        'Título',
        'Emissão',
        'Vencimento',
        'Pagamento',
        'Total Nota',
        'Total Título',
        'Base Comissão',
        '% Comissão',
        'Valor Comissão',
        'Situação',
      ],
      ...resultado.lancamentos.map((l) => [
        l.tipoOperacao,
        `"${l.razaoSocial}"`,
        l.nf,
        l.pedido,
        l.titulo,
        l.dataEmissao,
        l.dataVencimento,
        l.dataPagamento || '',
        l.totalNota.toFixed(2).replace('.', ','),
        l.totalTitulo.toFixed(2).replace('.', ','),
        l.baseComissao.toFixed(2).replace('.', ','),
        `${l.percentualComissao.toFixed(2).replace('.', ',')}%`,
        l.valorComissao.toFixed(2).replace('.', ','),
        l.situacao,
      ]),
    ]

    // Seção 2: Premiações e Pagamentos Extras
    const secaoPremiacoes = [
      [],
      ['=== PREMIAÇÕES E PAGAMENTOS EXTRAS (COMPÕEM (+) QUANDO APROVADOS) ==='],
      ['Tipo', 'Descrição / Motivo', 'Competência', 'Campanha', 'Valor (R$)', 'Status'],
      ...(resultado.premiacoesDetalhadas && resultado.premiacoesDetalhadas.length > 0
        ? resultado.premiacoesDetalhadas.map((a: any) => [
            `"${a.award_type || ''}"`,
            `"${(a.description || '').replace(/"/g, '""')}"`,
            `"${a.competencia || ''}"`,
            `"${a.campaign_name || ''}"`,
            Number(a.amount || 0)
              .toFixed(2)
              .replace('.', ','),
            `"${a.status || ''}"`,
          ])
        : [['Nenhuma premiação cadastrada no período', '', '', '', '0,00', '']]),
    ]

    // Seção 3: Descontos e Deduções
    const secaoDeducoes = [
      [],
      ['=== DESCONTOS E DEDUÇÕES (COMPÕEM (−) QUANDO APROVADOS) ==='],
      [
        'Tipo / Motivo',
        'Descrição / Justificativa',
        'Competência',
        'NF / Pedido / Cliente',
        'Valor Descontado (R$)',
        'Status',
      ],
      ...(resultado.deducoesDetalhadas && resultado.deducoesDetalhadas.length > 0
        ? resultado.deducoesDetalhadas.map((d: any) => [
            `"${d.reason || d.deduction_type || ''}"`,
            `"${(d.description || '').replace(/"/g, '""')}"`,
            `"${d.competencia || ''}"`,
            `"${d.invoice_number ? 'NF ' + d.invoice_number : ''} ${d.order_number ? 'Ped ' + d.order_number : ''} ${d.client_name || ''}".trim()`,
            `-${Number(d.amount || 0)
              .toFixed(2)
              .replace('.', ',')}`,
            `"${d.status || ''}"`,
          ])
        : [['Nenhum desconto/dedução cadastrada no período', '', '', '', '0,00', '']]),
    ]

    // Seção 4: Demonstrativo e Fechamento Líquido
    const fech = resultado.fechamento
    const secaoFechamento = [
      [],
      ['=== DEMONSTRATIVO DE FECHAMENTO (TOTAL LÍQUIDO A PAGAR) ==='],
      ['Item', 'Valor (R$)'],
      [
        'Comissão Apurada sobre Vendas',
        (fech?.totalComissoesPositivas || 0).toFixed(2).replace('.', ','),
      ],
      [
        '(+) Campanhas Comerciais Vigentes',
        (fech?.campanhasPremiacoesElegiveis || 0).toFixed(2).replace('.', ','),
      ],
      [
        '(+) Premiações Aprovadas',
        (fech?.totalPremiacoesAprovadas || 0).toFixed(2).replace('.', ','),
      ],
      [
        '(−) Descontos e Deduções Aprovadas',
        `-${(fech?.totalDeducoesAprovadas || 0).toFixed(2).replace('.', ',')}`,
      ],
      ['(+/-) Correção de Arredondamento', (fech?.ajustes || 0).toFixed(2).replace('.', ',')],
      [
        '(=) TOTAL LÍQUIDO A PAGAR',
        (fech?.totalLiquidoPagar ?? fech?.valorFinalReceber ?? 0).toFixed(2).replace('.', ','),
      ],
    ]

    const todasLinhas = [
      ...secaoLancamentos,
      ...secaoPremiacoes,
      ...secaoDeducoes,
      ...secaoFechamento,
    ]

    const conteudo = todasLinhas.map((r) => r.join(';')).join('\n')
    const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `comissao_analitica_completa_${rcaSelecionado?.code || 'rca'}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Planilha Exportada com Sucesso',
      description: 'Download de comissão analítica com demonstrativo, premiações e deduções.',
    })
  }

  const handleExportarPdf = () => {
    window.print()
  }

  const handleImprimir = () => {
    window.print()
  }

  const handleAtualizarStatus = async (novoStatus: string, justificativa?: string) => {
    if (!resultado) return
    const res = await atualizarStatusApuracao({
      apurationId: resultado.statusApuracao.id,
      novoStatus,
      justificativa,
      competencia: resultado.statusApuracao.competencia || filtros.dataInicio?.slice(0, 7),
      rcaCode: rcaSelecionado?.code,
      rcaName: rcaSelecionado?.name,
      metodoApuracao: filtros.metodoApuracao,
      valorTotal: resultado.fechamento?.valorFinalReceber,
      baseCalculo: resultado.indicadores?.baseCalculo,
    })
    if (res.success) {
      toast({
        title: novoStatus === 'reaberta' ? 'Apuração Reaberta' : 'Status Atualizado',
        description: res.message,
      })
      executarConsulta()
    } else {
      toast({
        title: 'Ação não permitida',
        description: res.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-5 pb-16 print:p-0 print:space-y-4">
      {/* 1. CABEÇALHO COMPACTO JETRO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-4 sm:p-5 shadow-2xs print:border-none print:shadow-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#002817] dark:text-[#E4C46A]">
              Comissão Analítica
            </h1>
            <button
              type="button"
              onClick={() => setIsFavorito(!isFavorito)}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-amber-500 transition-colors"
              title={isFavorito ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            >
              <Star
                className={`w-5 h-5 ${
                  isFavorito ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'
                }`}
              />
            </button>

            {resultado?.statusApuracao && (
              <Badge
                variant="outline"
                onClick={() => setDialogStatusAberto(true)}
                className="cursor-pointer font-bold text-xs border-[#002817]/30 bg-[#002817]/5 text-[#002817] dark:text-[#E4C46A] hover:bg-[#002817]/10"
                title="Clique para gerenciar o status da apuração"
              >
                {resultado.statusApuracao.statusLabel}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Consulte, confira e acompanhe a composição detalhada das comissões comerciais.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDialogStatusAberto(true)}
            className="text-xs h-8 border-[#002817]/30 text-[#002817] dark:text-[#E4C46A] hover:bg-[#002817]/10 font-semibold"
          >
            Fluxo de Fechamento
          </Button>
        </div>
      </div>

      {/* 2. PAINEL DE FILTROS */}
      <div className="print:hidden">
        <ComissaoAnaliticaFiltros
          filtros={filtros}
          rcas={rcas}
          rcaSelecionado={rcaSelecionado}
          onFiltrosChange={setFiltros}
          onRcaChange={(rca) => {
            setRcaSelecionado(rca)
            if (rca) {
              setFiltros((prev) => ({ ...prev, rcaCode: rca.code }))
            }
          }}
          onConsultar={() => executarConsulta()}
          onLimpar={handleLimparFiltros}
          onExportarExcel={handleExportarExcel}
          onExportarPdf={handleExportarPdf}
          onImprimir={handleImprimir}
          loading={loading}
        />
      </div>

      {/* 3. FAIXA DE INDICADORES */}
      {resultado && <ComissaoAnaliticaIndicadores indicadores={resultado.indicadores} />}

      {/* 4. TABELA ANALÍTICA PRINCIPAL + RESUMOS + FECHAMENTO */}
      {resultado && (
        <ComissaoAnaliticaTabela
          lancamentos={resultado.lancamentos}
          resumoPercentual={resultado.resumoPorPercentual}
          correcaoArredondamento={resultado.correcaoArredondamento}
          resumoTipo={resultado.resumoPorTipo}
          campanhas={resultado.campanhas}
          premiacoesDetalhadas={resultado.premiacoesDetalhadas}
          deducoesDetalhadas={resultado.deducoesDetalhadas}
          fechamento={resultado.fechamento}
          mensagemBloqueio={resultado.statusApuracao?.mensagemBloqueio}
          onAbrirPedido={handleAbrirPedido}
          onAbrirNF={handleAbrirNF}
          onAbrirTitulo={handleAbrirTitulo}
          onVerComposicao={handleVerComposicao}
        />
      )}

      {/* DIÁLOGOS MODAIS */}
      <DialogComposicaoCalculo
        lancamento={lancamentoComposicao}
        open={dialogComposicaoAberto}
        onOpenChange={setDialogComposicaoAberto}
      />

      <DialogVisualizacaoDocumento
        documento={documentoConsulta}
        open={dialogDocumentoAberto}
        onOpenChange={setDialogDocumentoAberto}
      />

      {resultado && (
        <DialogAcoesApuracao
          statusInfo={resultado.statusApuracao}
          open={dialogStatusAberto}
          onOpenChange={setDialogStatusAberto}
          onAtualizarStatus={handleAtualizarStatus}
        />
      )}
    </div>
  )
}
