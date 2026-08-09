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
  type FilterOptions,
} from '@/lib/collection-center-types'
import { loadVendedoresForFilter, loadPartnersMap } from '@/services/collection-center-filters'
import { loadNetworksMap } from '@/services/client-networks'

export function useCollectionCenter() {
  const [receivables, setReceivables] = useState<any[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCliente, setSelectedCliente] = useState<string | null>(null)
  const [selectedTitleIds, setSelectedTitleIds] = useState<string[]>([])
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [sortBy, setSortBy] = useState('maior_valor')
  const [priorizacaoRules, setPriorizacaoRules] = useState<PriorizacaoRule[]>([])
  const [partnersMap, setPartnersMap] = useState<Record<string, any>>({})
  const [vendedoresMap, setVendedoresMap] = useState<Record<string, any>>({})
  const [networksMap, setNetworksMap] = useState<Record<string, string>>({})
  const { mergeFilter } = useOrgFilter()

  const loadData = useCallback(async () => {
    try {
      const orgFilter = mergeFilter()
      const [recs, cols, pMap, vMap, nMap] = await Promise.all([
        getOverdueReceivables(orgFilter || undefined),
        getCollectionRecords(),
        loadPartnersMap(),
        loadVendedoresForFilter(),
        loadNetworksMap(),
      ])
      setReceivables(recs)
      setCollections(cols)
      setPartnersMap(pMap)
      setVendedoresMap(vMap)
      setNetworksMap(nMap)
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
    const netMembers: Record<string, string[]> = {}
    const netOverdue: Record<string, number> = {}
    const netRestricted: Record<string, number> = {}
    const netRegular: Record<string, number> = {}
    for (const [cn, p] of Object.entries(partnersMap)) {
      const nid = (p as any)?.network_id
      if (!nid) continue
      if (!netMembers[nid]) {
        netMembers[nid] = []
        netOverdue[nid] = 0
        netRestricted[nid] = 0
        netRegular[nid] = 0
      }
      netMembers[nid].push(cn)
      if ((p as any)?.financial_restriction) netRestricted[nid]++
      else netRegular[nid]++
    }
    for (const [cliente, recs] of Object.entries(grouped)) {
      const p = partnersMap[cliente.toLowerCase()]
      const nid = p?.network_id
      if (!nid) continue
      for (const r of recs) {
        if (computeAgingDays(r.data_vencimento) > 0) {
          netOverdue[nid] = (netOverdue[nid] || 0) + computeSaldo(r)
        }
      }
    }
    let items = Object.entries(grouped).map(([cliente, recs]) => {
      const col = collections.find((c) => c.cliente === cliente) || null
      const partner = partnersMap[cliente.toLowerCase()] || null
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
      const vendedorName =
        (col as any)?.vendedor || recs[0]?.vendedor || recs[0]?.salesperson_name || ''
      const vendedorRecord = vendedoresMap[vendedorName.toLowerCase()] || null
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
        vendedor: vendedorName,
        gerente: (col as any)?.gerente || (col as any)?.responsavel_cobranca || '',
        cidade: partner?.address_city || '',
        uf: partner?.address_state || '',
        regiao: vendedorRecord?.regiao || partner?.address_state || '',
        supervisor: vendedorRecord?.supervisor || '',
        cnpj_cpf: partner?.cnpj || partner?.cpf || '',
        cobrador: (col as any)?.responsavel_cobranca || '',
        networkId: partner?.network_id || '',
        networkName: networksMap[partner?.network_id || ''] || '',
        networkOverdueTotal: partner?.network_id ? netOverdue[partner.network_id] || 0 : 0,
        networkRestrictedCount: partner?.network_id ? netRestricted[partner.network_id] || 0 : 0,
        networkRegularCount: partner?.network_id ? netRegular[partner.network_id] || 0 : 0,
        networkRestrictionStatus: partner?.network_restriction_source || '',
        networkRestrictionOriginName: partner?.network_restriction_origin_name || '',
        networkRestrictionOriginCnpj: partner?.network_restriction_origin_cnpj || '',
        networkRestrictionOriginAmount: partner?.network_restriction_origin_amount || '',
        networkRestrictionOriginDays: partner?.network_restriction_origin_days || '',
      }
    })

    if (filters.cliente)
      items = items.filter((i) => i.cliente.toLowerCase().includes(filters.cliente.toLowerCase()))
    if (filters.risco) items = items.filter((i) => i.risco === filters.risco)
    if (filters.prioridade) items = items.filter((i) => i.prioridade === filters.prioridade)
    if (filters.vendedor) items = items.filter((i) => i.vendedor === filters.vendedor)
    if (filters.gerente) items = items.filter((i) => i.gerente === filters.gerente)
    if (filters.supervisor) items = items.filter((i) => i.supervisor === filters.supervisor)
    if (filters.cidade) items = items.filter((i) => i.cidade === filters.cidade)
    if (filters.regiao) items = items.filter((i) => i.regiao === filters.regiao)
    if (filters.uf) items = items.filter((i) => i.uf === filters.uf)
    if (filters.cnpj_cpf)
      items = items.filter((i) => i.cnpj_cpf.toLowerCase().includes(filters.cnpj_cpf.toLowerCase()))
    if (filters.cobrador) items = items.filter((i) => i.cobrador === filters.cobrador)
    if (filters.empresa)
      items = items.filter((i) => i.receivables.some((r) => (r.empresa || '') === filters.empresa))
    if (filters.filial)
      items = items.filter((i) => i.receivables.some((r) => (r.filial || '') === filters.filial))
    if (filters.titulo)
      items = items.filter((i) =>
        i.receivables.some((r) =>
          (r.numero_titulo || '').toLowerCase().includes(filters.titulo.toLowerCase()),
        ),
      )
    if (filters.nf)
      items = items.filter((i) =>
        i.receivables.some((r) =>
          String(r.nf || r.numero_nf || r.documento || '')
            .toLowerCase()
            .includes(filters.nf.toLowerCase()),
        ),
      )
    if (filters.pedido)
      items = items.filter((i) =>
        i.receivables.some((r) =>
          String(r.pedido || r.order_number || '')
            .toLowerCase()
            .includes(filters.pedido.toLowerCase()),
        ),
      )
    if (filters.vencimento_start)
      items = items.filter((i) =>
        i.receivables.some((r) => (r.data_vencimento || '') >= filters.vencimento_start),
      )
    if (filters.vencimento_end)
      items = items.filter((i) =>
        i.receivables.some((r) => (r.data_vencimento || '') <= filters.vencimento_end),
      )
    if (filters.dias_atraso_min) {
      const min = parseInt(filters.dias_atraso_min, 10)
      if (!isNaN(min)) items = items.filter((i) => i.diasAtraso >= min)
    }
    if (filters.dias_atraso_max) {
      const max = parseInt(filters.dias_atraso_max, 10)
      if (!isNaN(max)) items = items.filter((i) => i.diasAtraso <= max)
    }
    if (filters.faixa_aging)
      items = items.filter((i) => getAgingBucket(i.diasAtraso) === filters.faixa_aging)
    if (filters.valor_min) {
      const min = parseFloat(filters.valor_min)
      if (!isNaN(min)) items = items.filter((i) => i.valorVencido >= min)
    }
    if (filters.valor_max) {
      const max = parseFloat(filters.valor_max)
      if (!isNaN(max)) items = items.filter((i) => i.valorVencido <= max)
    }
    if (filters.promessa) {
      if (filters.promessa === 'Sem promessa')
        items = items.filter((i) => !i.collectionRecord?.promise_status)
      else items = items.filter((i) => i.collectionRecord?.promise_status === filters.promessa)
    }
    if (filters.acordo) {
      if (filters.acordo === 'com_acordo')
        items = items.filter(
          (i) =>
            i.collectionRecord?.status === 'Negociação' ||
            i.collectionRecord?.status === 'Renegociado',
        )
      else
        items = items.filter(
          (i) =>
            i.collectionRecord?.status !== 'Negociação' &&
            i.collectionRecord?.status !== 'Renegociado',
        )
    }
    if (filters.disputa) {
      if (filters.disputa === 'Sem disputa')
        items = items.filter(
          (i) =>
            !i.collectionRecord?.dispute_status ||
            i.collectionRecord?.dispute_status === 'Cancelada',
        )
      else items = items.filter((i) => i.collectionRecord?.dispute_status === filters.disputa)
    }
    if (filters.status)
      items = items.filter((i) => i.receivables.some((r) => r.status === filters.status))
    if (filters.rede) items = items.filter((i) => i.networkId === filters.rede)
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
  }, [
    receivables,
    collections,
    filters,
    sortBy,
    priorizacaoRules,
    partnersMap,
    vendedoresMap,
    networksMap,
  ])

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

  const filterOptions = useMemo<FilterOptions>(() => {
    const vendedores = new Set<string>()
    const gerentes = new Set<string>()
    const supervisores = new Set<string>()
    const cidades = new Set<string>()
    const regioes = new Set<string>()
    const ufs = new Set<string>()
    const cobradores = new Set<string>()
    const statuses = new Set<string>()
    const redes = new Map<string, string>()
    for (const item of queueItems) {
      if (item.networkId && item.networkName) redes.set(item.networkId, item.networkName)
      if (item.vendedor) vendedores.add(item.vendedor)
      if (item.gerente) gerentes.add(item.gerente)
      if (item.supervisor) supervisores.add(item.supervisor)
      if (item.cidade) cidades.add(item.cidade)
      if (item.regiao) regioes.add(item.regiao)
      if (item.uf) ufs.add(item.uf)
      if (item.cobrador) cobradores.add(item.cobrador)
      for (const r of item.receivables) {
        if (r.status) statuses.add(r.status)
      }
    }
    return {
      vendedores: [...vendedores].sort(),
      gerentes: [...gerentes].sort(),
      supervisores: [...supervisores].sort(),
      cidades: [...cidades].sort(),
      regioes: [...regioes].sort(),
      ufs: [...ufs].sort(),
      cobradores: [...cobradores].sort(),
      statuses: [...statuses].sort(),
      redes: [...redes.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    }
  }, [queueItems])

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
    filterOptions,
    refresh: loadData,
  }
}
