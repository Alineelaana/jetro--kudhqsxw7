import { pb } from '@/lib/pocketbase/client'
import type { GlobalFilters } from './types'
import type {
  ClienteStats,
  FornecedoresStats,
  MarcasRow,
  ObjetivoPanelData,
  ProdutosStats,
  SemanaRow,
  StockCompareRow,
  SkuInativoEstoqueRow,
  WeeklyCashFlowRow,
} from './types'

const num = (v: unknown): number => {
  if (v === null || v === undefined || v === '') return 0
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

const sum = (arr: number[]) => arr.reduce((acc, v) => acc + v, 0)

const emptyWeeks = (): SemanaRow[] =>
  (['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] as const).map((dia) => ({
    diaSemana: dia,
    data: '',
    unAtual: 0,
    unAnterior: 0,
    evolucaoPct: 0,
    pedidos: 0,
    skus: 0,
    itensPorPedido: 0,
    unPorPedido: 0,
    valorAtual: 0,
    valorAnterior: 0,
  }))

const toRowsFromOrders = (items: any[], day: string): SemanaRow[] => {
  const base = emptyWeeks()
  const byDay = new Map<string, SemanaRow>()
  for (const row of base) byDay.set(row.diaSemana, row)
  for (const o of items) {
    const data = String(o.data_pedido || o.created || '').slice(0, 10)
    const dt = data ? new Date(data + 'T00:00:00') : null
    if (!dt || Number.isNaN(dt.getTime())) continue
    const idx = (dt.getDay() + 6) % 7
    const diaNome = base[idx].diaSemana
    const row = byDay.get(diaNome) ?? base[idx]
    row.data = data
    row.unAtual += num(o.quantidade_total ?? o.total_unidades)
    row.pedidos += 1
    row.valorAtual += num(o.valor_total ?? o.total)
    row.skus += num(o.quantidade_itens ?? 1)
  }
  const rows = Array.from(byDay.values())
  const hasData = rows.some((r) => r.data)
  return (hasData ? rows : base).map((r) => ({
    ...r,
    data: r.data || day,
    evolucaoPct: r.unAnterior > 0 ? ((r.unAtual - r.unAnterior) / r.unAnterior) * 100 : 0,
    itensPorPedido: r.pedidos > 0 ? 1 : 0,
    unPorPedido: r.pedidos > 0 ? r.unAtual / r.pedidos : 0,
  }))
}

export async function fetchFlashVendas(f: GlobalFilters): Promise<SemanaRow[]> {
  const weekStart = new Date(f.diaReferencia + 'T00:00:00')
  weekStart.setDate(weekStart.getDate() - 6)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const prevStart = new Date(weekStart)
  prevStart.setDate(prevStart.getDate() - 7)
  const prevEnd = new Date(weekStart)
  prevEnd.setDate(prevEnd.getDate() - 1)
  const empresa = f.origens[0] ?? ''

  try {
    const cur = await pb.collection('sales_orders').getList(1, 500, {
      filter: `empresa='${empresa}' && data_pedido>='${fmt(weekStart)}' && data_pedido<='${f.diaReferencia}'`,
    })
    const prev = await pb.collection('sales_orders').getList(1, 500, {
      filter: `empresa='${empresa}' && data_pedido>='${fmt(prevStart)}' && data_pedido<='${fmt(prevEnd)}'`,
    })
    const rows = toRowsFromOrders(cur.items, f.diaReferencia)
    for (const r of rows) {
      const curDate = new Date(r.data + 'T00:00:00')
      if (Number.isNaN(curDate.getTime())) continue
      const dow = (curDate.getDay() + 6) % 7
      const prevForDay = prev.items.filter((o: any) => {
        const d = String(o.data_pedido || o.created || '').slice(0, 10)
        const dt = d ? new Date(d + 'T00:00:00') : null
        return dt && !Number.isNaN(dt.getTime()) && (dt.getDay() + 6) % 7 === dow
      })
      if (prevForDay.length > 0) {
        r.unAnterior = sum(prevForDay.map((o: any) => num(o.quantidade_total ?? o.total_unidades)))
        r.valorAnterior = sum(prevForDay.map((o: any) => num(o.valor_total ?? o.total)))
      }
    }
    return rows
  } catch {
    return toRowsFromOrders([], f.diaReferencia)
  }
}

export async function fetchObjetivo(f: GlobalFilters): Promise<ObjetivoPanelData> {
  const [mesRef, anoRef] = f.mesAnoReferencia.split('/')
  const empresa = f.origens[0] ?? ''
  try {
    const nfes = await pb.collection('nfe_records').getList(1, 500, {
      filter: `empresa='${empresa}' && emissao>='${anoRef}-${mesRef}-01' && emissao<='${anoRef}-${mesRef}-31'`,
    })
    return {
      unidadesRealizadas: sum(
        nfes.items.map((n: any) => num(n.total_unidades ?? n.quantidade_itens)),
      ),
      valorRealizado: sum(nfes.items.map((n: any) => num(n.valor_total ?? n.total_nota))),
    }
  } catch {
    return { unidadesRealizadas: 0, valorRealizado: 0 }
  }
}

const FIN_EMPTY = {
  conciliacoes: 0,
  nfesHoje: 0,
  clientesHoje: 0,
  unidadesHoje: 0,
  valorHoje: 0,
  faturamentoSemana: 0,
  romaneios: 0,
  devolucoes: 0,
  entradas: 0,
  valorMes: 0,
}

export async function fetchFaturamento(f: GlobalFilters) {
  const hoje = f.diaReferencia
  const [mesRef, anoRef] = f.mesAnoReferencia.split('/')
  const empresa = f.origens[0] ?? ''
  try {
    const nfes = await pb.collection('nfe_records').getList(1, 500, {
      filter: `empresa='${empresa}' && emissao>='${anoRef}-${mesRef}-01' && emissao<='${anoRef}-${mesRef}-31'`,
    })
    const deHoje = nfes.items.filter((n: any) => String(n.emissao || '').slice(0, 10) === hoje)
    return {
      ...FIN_EMPTY,
      nfesHoje: deHoje.length,
      clientesHoje: new Set(deHoje.map((n: any) => n.cliente_nome || n.destinatario)).size,
      unidadesHoje: sum(deHoje.map((n: any) => num(n.total_unidades ?? n.quantidade_itens))),
      valorHoje: sum(deHoje.map((n: any) => num(n.valor_total ?? n.total_nota))),
      valorMes: sum(nfes.items.map((n: any) => num(n.valor_total ?? n.total_nota))),
    }
  } catch {
    return { ...FIN_EMPTY }
  }
}

export async function fetchMarcas(f: GlobalFilters): Promise<MarcasRow[]> {
  const empresa = f.origens[0] ?? ''
  try {
    const res = await pb.collection('products').getList(1, 200, {
      filter: `empresa='${empresa}' && marca != ''`,
    })
    const byMarca = new Map<string, MarcasRow>()
    for (const p of res.items) {
      const marca = String(p.marca || '—')
      const cur = byMarca.get(marca) ?? {
        marca,
        nf: 0,
        un: 0,
        total: 0,
        media: 0,
        custo: 0,
        markup: 0,
        participacaoPct: 0,
      }
      cur.un += num(p.estoque_atual)
      byMarca.set(marca, cur)
    }
    const rows = Array.from(byMarca.values())
    const totalGeral = sum(rows.map((r) => r.total))
    for (const r of rows) {
      r.media = r.nf > 0 ? r.total / r.nf : 0
      r.markup = r.custo > 0 ? r.total / r.custo : 0
      r.participacaoPct = totalGeral > 0 ? (r.total / totalGeral) * 100 : 0
    }
    return rows.sort((a, b) => b.total - a.total)
  } catch {
    return []
  }
}

const PROD_EMPTY: ProdutosStats = {
  skusAtivos: 0,
  marcasAtivas: 0,
  comEstoque: 0,
  pctComEstoque: 0,
  semEstoque: 0,
  pctSemEstoque: 0,
  criticaCadastro: 0,
  semFoto: 0,
  precoAbaixoTabela: 0,
  topProdutos: [],
}

export async function fetchProdutos(f: GlobalFilters): Promise<ProdutosStats> {
  const empresa = f.origens[0] ?? ''
  try {
    const produtos = await pb.collection('products').getList(1, 500, {
      filter: `empresa='${empresa}'`,
    })
    const skus = produtos.items.length
    const comEstoque = produtos.items.filter((p: any) => num(p.estoque_atual) > 0).length
    const semEstoque = skus - comEstoque
    const marcas = new Set(produtos.items.map((p: any) => p.marca).filter(Boolean)).size
    return {
      ...PROD_EMPTY,
      skusAtivos: skus,
      marcasAtivas: marcas,
      comEstoque,
      pctComEstoque: skus > 0 ? (comEstoque / skus) * 100 : 0,
      semEstoque,
      pctSemEstoque: skus > 0 ? (semEstoque / skus) * 100 : 0,
      semFoto: produtos.items.filter((p: any) => !p.imagem_url && !p.foto).length,
    }
  } catch {
    return { ...PROD_EMPTY }
  }
}

export async function fetchEstoque(f: GlobalFilters): Promise<{
  comparativo: StockCompareRow[]
  skusInativosComEstoque: SkuInativoEstoqueRow[]
}> {
  const empresa = f.origens[0] ?? ''
  try {
    const produtos = await pb.collection('products').getList(1, 500, {
      filter: `empresa='${empresa}'`,
    })
    return {
      comparativo: produtos.items.slice(0, 30).map((p: any) => ({
        sku: String(p.codigo || p.sku || p.id),
        nome: String(p.nome || p.descricao || ''),
        qtdFiscal: num(p.estoque_fiscal),
        qtdWms: num(p.estoque_wms),
        qtdAvarias: num(p.estoque_avarias),
        qtdDiferenca: num(p.estoque_atual),
        precoEntrada: num(p.preco_custo ?? p.custo_medio),
        custoMedio: num(p.custo_medio ?? p.preco_custo),
      })),
      skusInativosComEstoque: produtos.items
        .filter((p: any) => num(p.estoque_atual) > 0 && p.ativo === false)
        .slice(0, 50)
        .map((p: any) => ({
          sku: String(p.codigo || p.sku || p.id),
          nome: String(p.nome || p.descricao || ''),
          estoque: num(p.estoque_atual),
        })),
    }
  } catch {
    return { comparativo: [], skusInativosComEstoque: [] }
  }
}

const emptyFinStats = () => ({ ...FIN_EMPTY, titulosReceberTotal: 0, titulosPagarTotal: 0 })

export async function fetchFinanceiro(f: GlobalFilters) {
  const empresa = f.origens[0] ?? ''
  try {
    const titulos = await pb.collection('financial_transactions').getList(1, 500, {
      filter: `empresa='${empresa}' && data_vencimento<='${f.diaReferencia}'`,
    })
    const aReceber = titulos.items.filter((t: any) => t.tipo === 'receber')
    const aPagar = titulos.items.filter((t: any) => t.tipo === 'pagar')
    return {
      ...emptyFinStats(),
      titulosReceberTotal: sum(aReceber.map((t: any) => num(t.valor))),
      titulosPagarTotal: sum(aPagar.map((t: any) => num(t.valor))),
      titulosReceberVencidos: aReceber.filter((t: any) => t.status !== 'pago').length,
      titulosPagarVencidos: aPagar.filter((t: any) => t.status !== 'pago').length,
    }
  } catch {
    return emptyFinStats()
  }
}

export async function fetchFluxoCaixa(f: GlobalFilters): Promise<{
  estoqueTotal: number
  disponibilidadeTotal: number
  rows: WeeklyCashFlowRow[]
}> {
  const empresa = f.origens[0] ?? ''
  try {
    const movs = await pb.collection('financial_transactions').getList(1, 500, {
      filter: `empresa='${empresa}'`,
    })
    const rows: WeeklyCashFlowRow[] = movs.items.slice(0, 60).map((m: any) => {
      const valor = num(m.valor)
      const ehReceber = m.tipo === 'receber'
      return {
        semana: '',
        vencimento: String(m.data_vencimento || '').slice(0, 10),
        direitos: ehReceber ? valor : 0,
        direitosPrev: 0,
        obrigacao: ehReceber ? 0 : valor,
        obrigacaoPrev: 0,
        saldoDia: ehReceber ? valor : -valor,
        acumulado: 0,
      }
    })
    let acc = 0
    for (const r of rows) {
      acc += r.saldoDia
      r.acumulado = acc
    }
    return { estoqueTotal: 0, disponibilidadeTotal: acc, rows }
  } catch {
    return { estoqueTotal: 0, disponibilidadeTotal: 0, rows: [] }
  }
}

const CLI_EMPTY: ClienteStats = {
  titulosAtrasados: 0,
  valorAtrasado: 0,
  titulosAVencer: 0,
  valorAVencer: 0,
  titulosLiberados: 0,
  pedidosTabela: 0,
  pedidosCasadinha: 0,
  ranking: [],
}

export async function fetchClientes(f: GlobalFilters): Promise<ClienteStats> {
  const empresa = f.origens[0] ?? ''
  try {
    const titulos = await pb.collection('financial_transactions').getList(1, 500, {
      filter: `empresa='${empresa}' && tipo='receber' && data_vencimento<='${f.diaReferencia}'`,
    })
    const atrasados = titulos.items.filter((t: any) => t.status !== 'pago')
    const quitados = titulos.items.filter((t: any) => t.status === 'pago')
    return {
      ...CLI_EMPTY,
      titulosAtrasados: atrasados.length,
      valorAtrasado: sum(atrasados.map((t: any) => num(t.valor))),
      titulosAVencer: quitados.length,
      valorAVencer: sum(quitados.map((t: any) => num(t.valor))),
    }
  } catch {
    return { ...CLI_EMPTY }
  }
}

const FORN_EMPTY: FornecedoresStats = {
  totalFornecedores: 0,
  ativos: 0,
  comprasPeriodo: 0,
  verbasPeriodo: 0,
  topFornecedores: [],
}

export async function fetchFornecedores(f: GlobalFilters): Promise<FornecedoresStats> {
  const empresa = f.origens[0] ?? ''
  try {
    const res = await pb.collection('partners').getList(1, 200, {
      filter: `empresa='${empresa}' && tipo='fornecedor'`,
    })
    return {
      ...FORN_EMPTY,
      totalFornecedores: res.items.length,
      ativos: res.items.filter((p: any) => p.ativo !== false).length,
      topFornecedores: res.items.slice(0, 10).map((p: any) => ({
        nome: String(p.nome_razao_social || p.nome || ''),
        compras: 0,
        verbas: 0,
      })),
    }
  } catch {
    return { ...FORN_EMPTY }
  }
}
