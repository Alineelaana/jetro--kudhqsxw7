import pb from '@/lib/pocketbase/client'

export interface LogisticsException {
  id: string
  type: string
  module: string
  severity: string
  description: string
  entity: string
  status: string
  created: string
}

export interface LogisticsTransfer {
  id: string
  numero_transferencia: string
  origem: string
  destino: string
  tipo: string
  status: string
  itens: unknown[]
  responsavel: string
  observacoes: string
  created: string
  updated: string
}

export interface LogisticsCollection {
  id: string
  numero_coleta: string
  origem: string
  tipo: string
  status: string
  itens: unknown[]
  responsavel: string
  observacoes: string
  data_prevista: string
  created: string
  updated: string
}

export const getConsolidatedDashboard = async () => {
  const [
    receipts,
    deliveries,
    vehicles,
    occurrences,
    wmsAlerts,
    wmsShippings,
    journeys,
    costs,
    wmsSeparations,
  ] = await Promise.all([
    pb
      .collection('wms_receipts')
      .getFullList()
      .catch(() => []),
    pb
      .collection('logistics_deliveries')
      .getFullList()
      .catch(() => []),
    pb
      .collection('logistics_vehicles')
      .getFullList()
      .catch(() => []),
    pb
      .collection('logistics_occurrences')
      .getFullList()
      .catch(() => []),
    pb
      .collection('wms_operational_alerts')
      .getFullList({ filter: 'resolved=false' })
      .catch(() => []),
    pb
      .collection('wms_shippings')
      .getFullList()
      .catch(() => []),
    pb
      .collection('transport_journeys')
      .getFullList()
      .catch(() => []),
    pb
      .collection('logistics_costs')
      .getFullList()
      .catch(() => []),
    pb
      .collection('wms_separations')
      .getFullList()
      .catch(() => []),
  ])

  const today = new Date().toISOString().split('T')[0]
  const pendingReceipts = receipts.filter((r: any) => r.status === 'Pendente').length
  const pendingSeparations = wmsSeparations.filter(
    (s: any) => s.status === 'Aguardando Separação',
  ).length
  const pendingExpedition = wmsShippings.filter(
    (s: any) => s.status === 'Aguardando Expedição',
  ).length
  const inTransitDeliveries = deliveries.filter((d: any) =>
    ['Em Trânsito', 'Saiu para Entrega'].includes(d.status),
  ).length
  const deliveredToday = deliveries.filter(
    (d: any) => d.status === 'Entregue' && d.data_realizada?.startsWith(today),
  ).length
  const delayedDeliveries = deliveries.filter((d: any) => {
    if (['Entregue', 'Cancelada'].includes(d.status)) return false
    return d.data_prevista && d.data_prevista < today
  }).length
  const activeOccurrences = occurrences.filter((o: any) =>
    ['Aberta', 'Em Análise'].includes(o.situacao),
  ).length
  const wmsAlertsCount = wmsAlerts.length
  const activeJourneys = journeys.filter(
    (j: any) => !['Finalizada', 'Cancelada'].includes(j.status),
  ).length
  const totalCost = costs.reduce((s: number, c: any) => s + parseFloat(c.valor || '0'), 0)
  const vehiclesAvailable = vehicles.filter((v: any) => v.situacao === 'Disponível').length
  const vehiclesInOp = vehicles.filter((v: any) => v.situacao === 'Em Rota').length

  return {
    pendingReceipts,
    pendingSeparations,
    pendingExpedition,
    inTransitDeliveries,
    deliveredToday,
    delayedDeliveries,
    activeOccurrences,
    wmsAlertsCount,
    activeJourneys,
    totalCost,
    vehiclesAvailable,
    vehiclesInOp,
  }
}

export const getLogisticsExceptions = async (): Promise<LogisticsException[]> => {
  const [deliveries, wmsSeparations, wmsAlerts, occurrences, wmsReceipts, journeys] =
    await Promise.all([
      pb
        .collection('logistics_deliveries')
        .getFullList()
        .catch(() => []),
      pb
        .collection('wms_separations')
        .getFullList()
        .catch(() => []),
      pb
        .collection('wms_operational_alerts')
        .getFullList({ filter: 'resolved=false' })
        .catch(() => []),
      pb
        .collection('logistics_occurrences')
        .getFullList({ filter: 'situacao != "Resolvida" && situacao != "Cancelada"' })
        .catch(() => []),
      pb
        .collection('wms_receipts')
        .getFullList({ filter: 'status = "Com Divergência"' })
        .catch(() => []),
      pb
        .collection('transport_journeys')
        .getFullList({ filter: 'status = "Com Ocorrência"' })
        .catch(() => []),
    ])

  const exceptions: LogisticsException[] = []
  const today = new Date().toISOString().split('T')[0]

  deliveries.forEach((d: any) => {
    if (
      d.status !== 'Entregue' &&
      d.status !== 'Cancelada' &&
      d.data_prevista &&
      d.data_prevista < today
    ) {
      exceptions.push({
        id: `del-${d.id}`,
        type: 'Entrega Atrasada',
        module: 'Transporte',
        severity: 'Alta',
        description: `Entrega ${d.numero_entrega} para ${d.cliente} está atrasada`,
        entity: d.numero_entrega,
        status: 'Aberta',
        created: d.created,
      })
    }
  })
  wmsSeparations.forEach((s: any) => {
    if (s.status === 'Aguardando Separação') {
      exceptions.push({
        id: `sep-${s.id}`,
        type: 'Separação Pendente',
        module: 'WMS',
        severity: 'Média',
        description: `Separação ${s.numero_separacao} aguardando execução`,
        entity: s.numero_separacao,
        status: 'Aberta',
        created: s.created,
      })
    }
  })
  wmsAlerts.forEach((a: any) => {
    exceptions.push({
      id: `wms-${a.id}`,
      type: a.tipo || 'Alerta WMS',
      module: 'WMS',
      severity: a.severidade || 'Média',
      description: a.mensagem || 'Alerta operacional WMS',
      entity: a.produto_nome || '—',
      status: 'Aberta',
      created: a.created,
    })
  })
  occurrences.forEach((o: any) => {
    exceptions.push({
      id: `occ-${o.id}`,
      type: o.tipo_ocorrencia || 'Ocorrência de Transporte',
      module: 'Transporte',
      severity: 'Alta',
      description: o.descricao || `Ocorrência na entrega ${o.entrega}`,
      entity: o.entrega || '—',
      status: o.situacao || 'Aberta',
      created: o.created,
    })
  })
  wmsReceipts.forEach((r: any) => {
    exceptions.push({
      id: `rcv-${r.id}`,
      type: 'Divergência no Recebimento',
      module: 'WMS',
      severity: 'Média',
      description: `Recebimento ${r.numero_recebimento} com divergência`,
      entity: r.numero_recebimento,
      status: 'Aberta',
      created: r.created,
    })
  })
  journeys.forEach((j: any) => {
    exceptions.push({
      id: `jrn-${j.id}`,
      type: 'Viagem com Ocorrência',
      module: 'Transporte',
      severity: 'Alta',
      description: `Viagem ${j.numero_viagem} registrou ocorrência`,
      entity: j.numero_viagem,
      status: 'Aberta',
      created: j.created,
    })
  })

  return exceptions.sort((a, b) => (a.created < b.created ? 1 : -1))
}
