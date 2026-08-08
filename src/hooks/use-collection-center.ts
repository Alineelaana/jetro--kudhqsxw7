import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import { useOrgFilter } from '@/hooks/use-org-filter'
import pb from '@/lib/pocketbase/client'
import { getOverdueReceivables, getCollectionRecords } from '@/services/collection-center'
import {
  computeSaldo,
  computeAgingDays,
  computeRisk,
  computePriority,
  getAgingBucket,
  riskOrder,
  priorityOrder,
  type QueueItem,
  type ExecutiveStats,
  type PriorizacaoRule,
} from '@/lib/collection-center-types'

export function useCollectionCenter() {
  const [receivables, setReceivables] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null)
  const [selectedTitleIds, setSelectedTitleIds] = useState<string[]>([])
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState('maior_valor')
  const [priorizacaoRules, setPriorizacaoRules] = useState<PriorizacaoRule[]>([])
  const { mergeFilter } = useOrgFilter()

  const loadData = useCallback(async () => {
    try {
      const orgFilter = mergeFilter()
      const [recs, cols] = await Promise.all([
        getOverdueReceivables(orgFilter || undefined),
        getCollectionRecords(),
      ])
      setReceivables(recs)
      setCollections(cols)
    } catch {
      setReceivables([])
      setCollections([])
    }
    setLoading(false)
  }, [mergeFilter])

  useEffect(() => {
    loadData()
    const loadPriorizacao = async () => {
      try {
        const records = await pb.collection('system_parameters').getFullList({
          filter: 'module = "collection_center" && key = "fila_priorizacao" && active != false',
        })
        if (records.length > 0) {
          const config = JSON.parse((records[0] as any).value || '{"rules":[]}')
          setPriorizacaoRules(config.rules || [])
        }
      } catch {
        /* ignore */
      }
    }
    loadPriorizacao()
  }, [loadData])
  useRealtime('financial_receivables', () => loadData())
  useRealtime('financial_collections', () => loadData())
  useRealtime('system_parameters', () => {
    const reload = async () => {
      try {
        const records = await pb.collection('system_parameters').getFullList({
          filter: 'module = "collection_center" && key = "fila_priorizacao" && active != false',
        })
        if (records.length > 0) {
          const config = JSON.parse((records[0] as any).value || '{"rules":[]}')
          setPriorizacaoRules(config.rules || [])
        }
      } catch {
        /* ignore */
      }
    }
    reload()
  })

  const queueItems = useMemo<QueueItem[]>(() => {
    const grouped: Record<string, any[]> = {}
    for (const r of receivables) {
      if (r.status === 'Recebido' || r.status === 'Cancelado') continue
      const key = r.cliente || 'Desconhecido'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(r)
    }
    let items = Object.entries(grouped).map(([cliente, recs]) => {
      const col = collections.find((c) => c.cliente === cliente) || null
      const valorVencido = recs.reduce((s, r) => s + computeSaldo(r), 0)
      const diasAtraso = Math.max(...recs.map((r) => computeAgingDays(r.data_vencimento)))
      const risco = col?.risk_classification || computeRisk(diasAtraso, valorVencido)
      const prioridade = col?.collection_priority || computePriority(diasAtraso, valorVencido)
      const promessaExistente =
        col?.promise_status === 'Pendente'
          ? `${col.promise_value || ''} - ${col.promise_date || ''}`
          : col?.promise_status === 'Quebrada'
            ? 'Quebrada'
            : ''
      return {
        cliente,
        clientId: col?.client_id || '',
        valorVencido,
        diasAtraso,
        quantidadeTitulos: recs.length,
        risco,
        prioridade,
        ultimoContato: col?.ultimo_contato || '',
        proximaAcao: col?.next_action_type || col?.proxima_acao || '',
        promessaExistente,
        receivables: recs,
        collectionRecord: col,
        vendedor: (col as any)?.vendedor || recs[0]?.vendedor || recs[0]?.salesperson_name || '',
        gerente: (col as any)?.gerente || (col as any)?.responsavel_cobranca || '',
      }
    })

    if (filters.cliente)
      items = items.filter((i) => i.cliente.toLowerCase().includes(filters.cliente.toLowerCase()))
    if (filters.risco) items = items.filter((i) => i.risco === filters.risco)
    if (filters.prioridade) items = items.filter((i) => i.prioridade === filters.prioridade)
    if (filters.cardFilter) {
      const cf = filters.cardFilter
      if (cf === 'promessas_hoje')
        items = items.filter(
          (i) =>
            i.collectionRecord?.promise_status === 'Pendente' &&
            i.collectionRecord?.promise_date === new Date().toISOString().split('T')[0],
        )
      else if (cf === 'promessas_quebradas')
        items = items.filter((i) => i.collectionRecord?.promise_status === 'Quebrada')
      else items = items.filter((i) => getAgingBucket(i.diasAtraso) === cf)
    }

    items.sort((a, b) => {
      if (priorizacaoRules.length > 0) {
        for (const rule of priorizacaoRules) {
          let cmp = 0
          switch (rule.key) {
            case 'maior_valor':
              cmp = b.valorVencido - a.valorVencido
              break
            case 'maior_atraso':
              cmp = b.diasAtraso - a.diasAtraso
              break
            case 'promessa_quebrada':
              cmp =
                (b.collectionRecord?.promise_status === 'Quebrada' ? 1 : 0) -
                (a.collectionRecord?.promise_status === 'Quebrada' ? 1 : 0)
              break
            case 'maior_risco':
              cmp = riskOrder(b.risco) - riskOrder(a.risco)
              break
            case 'prioridade':
              cmp = priorityOrder(b.prioridade) - priorityOrder(a.prioridade)
              break
            case 'mais_antigo_sem_contato':
              cmp = (a.ultimoContato || '9999').localeCompare(b.ultimoContato || '9999')
              break
            case 'proxima_acao':
              cmp = (a.proximaAcao || 'zzz').localeCompare(b.proximaAcao || 'zzz')
              break
            case 'vendedor':
              cmp = (a.vendedor || 'zzz').localeCompare(b.vendedor || 'zzz')
              break
            case 'gerente':
              cmp = (a.gerente || 'zzz').localeCompare(b.gerente || 'zzz')
              break
          }
          if (cmp !== 0) return cmp
        }
        return 0
      }
      switch (sortBy) {
        case 'maior_valor':
          return b.valorVencido - a.valorVencido
        case 'maior_atraso':
          return b.diasAtraso - a.diasAtraso
        case 'promessa_quebrada':
          return (
            (b.collectionRecord?.promise_status === 'Quebrada' ? 1 : 0) -
            (a.collectionRecord?.promise_status === 'Quebrada' ? 1 : 0)
          )
        case 'maior_risco':
          return riskOrder(b.risco) - riskOrder(a.risco)
        case 'prioridade':
          return priorityOrder(b.prioridade) - priorityOrder(a.prioridade)
        case 'mais_antigo_sem_contato':
          return (a.ultimoContato || '9999').localeCompare(b.ultimoContato || '9999')
        case 'proxima_acao':
          return (a.proximaAcao || 'zzz').localeCompare(b.proximaAcao || 'zzz')
        case 'vendedor':
          return (a.vendedor || 'zzz').localeCompare(b.vendedor || 'zzz')
        case 'gerente':
          return (a.gerente || 'zzz').localeCompare(b.gerente || 'zzz')
        default:
          return 0
      }
    })
    return items
  }, [receivables, collections, filters, sortBy, priorizacaoRules])

  const stats = useMemo<ExecutiveStats>(() => {
    const today = new Date().toISOString().split('T')[0]
    const monthStart = today.substring(0, 7)
    const totalVencido = queueItems.reduce((s, i) => s + i.valorVencido, 0)
    const allRecs = receivables.filter((r) => r.status !== 'Recebido' && r.status !== 'Cancelado')
    const bucket = (b: string) =>
      queueItems
        .filter((i) => getAgingBucket(i.diasAtraso) === b)
        .reduce((s, i) => s + i.valorVencido, 0)
    const promessasHoje = collections.filter(
      (c) => c.promise_date === today && c.promise_status === 'Pendente',
    ).length
    const promessasQuebradas = collections.filter((c) => c.promise_status === 'Quebrada').length
    const recuperadoHoje = receivables
      .filter((r) => r.data_recebimento === today)
      .reduce((s, r) => s + parseFloat(r.valor_recebido || '0'), 0)
    const recuperadoMes = receivables
      .filter((r) => (r.data_recebimento || '').startsWith(monthStart))
      .reduce((s, r) => s + parseFloat(r.valor_recebido || '0'), 0)
    return {
      totalVencido,
      clientesInadimplentes: queueItems.length,
      quantidadeTitulos: allRecs.length,
      vencidoHoje: bucket('vencido_hoje'),
      faixa17: bucket('1_7'),
      faixa815: bucket('8_15'),
      faixa1630: bucket('16_30'),
      faixa3160: bucket('31_60'),
      faixa6190: bucket('61_90'),
      faixa90Plus: bucket('90_plus'),
      promessasHoje,
      promessasQuebradas,
      recuperadoHoje,
      recuperadoMes,
    }
  }, [queueItems, receivables, collections])

  const selectedClient = useMemo(
    () => queueItems.find((i) => i.cliente === selectedCliente) || null,
    [queueItems, selectedCliente],
  )

  const toggleTitle = useCallback((id: string) => {
    setSelectedTitleIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )
  }, [])

  const selectClient = useCallback((cliente: string) => {
    setSelectedCliente(cliente)
    setSelectedTitleIds([])
  }, [])

  const applyCardFilter = useCallback((key: string) => {
    setFilters((prev) => ({ ...prev, cardFilter: prev.cardFilter === key ? '' : key }))
  }, [])

  return {
    loading,
    queueItems,
    stats,
    selectedClient,
    selectedTitleIds,
    filters,
    sortBy,
    setFilters,
    setSortBy,
    selectClient,
    toggleTitle,
    applyCardFilter,
    refresh: loadData,
  }
}
