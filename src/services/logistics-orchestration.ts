import { getDeliveries, getVehicles, getCosts, getOccurrences } from '@/services/logistics'
import { getJourneys } from '@/services/transport-journeys'
import {
  getWmsReceipts,
  getWmsSeparations,
  getWmsShippings,
  getWmsOperationalAlerts,
} from '@/services/wms'
import { getSalesOrders } from '@/services/sales'

export type LogisticsException = {
  id: string
  type: string
  description: string
  severity: string
  module: string
  entity: string
  created: string
}

export type LogisticsTransfer = Record<string, unknown>
export type LogisticsCollection = Record<string, unknown>

export async function getConsolidatedDashboard() {
  const [
    receipts,
    separations,
    shippings,
    deliveries,
    journeys,
    vehicles,
    costs,
    occurrences,
    alerts,
    salesOrders,
  ] = await Promise.all([
    getWmsReceipts().catch(() => []),
    getWmsSeparations().catch(() => []),
    getWmsShippings().catch(() => []),
    getDeliveries().catch(() => []),
    getJourneys().catch(() => []),
    getVehicles().catch(() => []),
    getCosts().catch(() => []),
    getOccurrences().catch(() => []),
    getWmsOperationalAlerts().catch(() => []),
    getSalesOrders().catch(() => []),
  ])

  const today = new Date().toISOString().split('T')[0]
  const delArr = deliveries as any[]
  const occArr = occurrences as any[]
  const vehArr = vehicles as any[]
  const costArr = costs as any[]
  const jouArr = journeys as any[]
  const soArr = salesOrders as any[]
  const alertArr = alerts as any[]

  const pendingReceipts = (receipts as any[]).filter((r) => r.status === 'Pendente').length
  const pendingSeparations = (separations as any[]).filter(
    (r) => r.status === 'Aguardando Separação',
  ).length
  const pendingExpedition = (shippings as any[]).filter(
    (r) => r.status === 'Aguardando Expedição',
  ).length
  const inTransitDeliveries = delArr.filter((d) =>
    ['Em Trânsito', 'Saiu para Entrega'].includes(d.status),
  ).length
  const deliveredToday = delArr.filter(
    (d) => d.status === 'Entregue' && d.data_realizada === today,
  ).length
  const delayedDeliveries = delArr.filter((d) => {
    if (['Entregue', 'Cancelada'].includes(d.status)) return false
    return d.data_prevista && d.data_prevista < today
  }).length
  const activeOccurrences = occArr.filter((o) =>
    ['Aberta', 'Em Análise'].includes(o.situacao),
  ).length
  const wmsAlertsCount = alertArr.filter((a) => !a.resolved).length
  const activeJourneys = jouArr.filter(
    (j) => !['Finalizada', 'Cancelada'].includes(j.status),
  ).length
  const totalCost = costArr.reduce((sum, c) => sum + parseFloat(c.valor || '0'), 0)
  const vehiclesAvailable = vehArr.filter((v) => v.situacao === 'Disponível').length
  const vehiclesInOp = vehArr.filter((v) => v.situacao === 'Em Rota').length

  const stuckOrders = soArr.filter((o) =>
    ['Aprovado', 'Estoque Reservado', 'Aguardando Faturamento'].includes(o.status),
  ).length

  const bottlenecks = [
    pendingReceipts > 0 ? 1 : 0,
    pendingSeparations > 0 ? 1 : 0,
    pendingExpedition > 0 ? 1 : 0,
    delayedDeliveries > 0 ? 1 : 0,
    activeOccurrences > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  const totalDeliveries = delArr.length
  const deliveredCount = delArr.filter((d) => d.status === 'Entregue').length
  const serviceLevel =
    totalDeliveries > 0 ? Math.round((deliveredCount / totalDeliveries) * 100) : 0

  const leadTimes = delArr
    .filter((d) => d.status === 'Entregue' && d.data_prevista && d.data_realizada)
    .map((d) => {
      const diff = new Date(d.data_realizada).getTime() - new Date(d.data_prevista).getTime()
      return Math.max(0, Math.ceil(diff / 86400000))
    })
  const avgLeadTime =
    leadTimes.length > 0 ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length : 0

  const onTimeDeliveries = delArr.filter((d) => {
    if (d.status !== 'Entregue' || !d.data_prevista || !d.data_realizada) return false
    return d.data_realizada <= d.data_prevista
  }).length
  const onTimeInFull =
    totalDeliveries > 0 ? Math.round((onTimeDeliveries / totalDeliveries) * 100) : 0

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
    stuckOrders,
    bottlenecks,
    serviceLevel,
    avgLeadTime,
    onTimeInFull,
  }
}

export async function getLogisticsExceptions(): Promise<LogisticsException[]> {
  const exceptions: LogisticsException[] = []
  const today = new Date().toISOString().split('T')[0]

  const [deliveries, occurrences, receipts, separations, shippings, journeys, alerts] =
    await Promise.all([
      getDeliveries().catch(() => []),
      getOccurrences().catch(() => []),
      getWmsReceipts().catch(() => []),
      getWmsSeparations().catch(() => []),
      getWmsShippings().catch(() => []),
      getJourneys().catch(() => []),
      getWmsOperationalAlerts().catch(() => []),
    ])

  const delArr = deliveries as any[]
  const occArr = occurrences as any[]
  const recArr = receipts as any[]
  const sepArr = separations as any[]
  const shipArr = shippings as any[]
  const jouArr = journeys as any[]
  const alertArr = alerts as any[]

  delArr.forEach((d) => {
    if (['Entregue', 'Cancelada'].includes(d.status)) return
    if (d.data_prevista && d.data_prevista < today) {
      exceptions.push({
        id: `delay-${d.id}`,
        type: 'Entrega Atrasada',
        description: `${d.numero_entrega || d.pedido || ''} — ${d.cliente || ''} (${d.cidade || ''})`,
        severity: 'Alta',
        module: 'Transporte',
        entity: d.numero_entrega || d.id,
        created: d.created || today,
      })
    }
  })

  occArr.forEach((o) => {
    if (['Aberta', 'Em Análise'].includes(o.situacao)) {
      exceptions.push({
        id: `occ-${o.id}`,
        type: o.tipo_ocorrencia || 'Ocorrência',
        description: `${o.descricao || ''} — ${o.cliente || ''}`,
        severity: o.situacao === 'Aberta' ? 'Alta' : 'Média',
        module: 'Transporte',
        entity: o.entrega || o.id,
        created: o.created || today,
      })
    }
  })

  recArr.forEach((r) => {
    if (r.status === 'Pendente') {
      exceptions.push({
        id: `receipt-${r.id}`,
        type: 'Recebimento Pendente',
        description: `${r.numero_recebimento || ''} — ${r.fornecedor || ''}`,
        severity: 'Média',
        module: 'WMS',
        entity: r.numero_recebimento || r.id,
        created: r.created || today,
      })
    }
  })

  sepArr.forEach((s) => {
    if (s.status === 'Aguardando Separação') {
      exceptions.push({
        id: `sep-${s.id}`,
        type: 'Separação Pendente',
        description: `${s.numero_separacao || ''} — ${s.cliente || ''} (${s.produto_nome || ''})`,
        severity: 'Média',
        module: 'WMS',
        entity: s.numero_separacao || s.id,
        created: s.created || today,
      })
    }
  })

  shipArr.forEach((s) => {
    if (s.status === 'Aguardando Expedição') {
      exceptions.push({
        id: `ship-${s.id}`,
        type: 'Expedição Pendente',
        description: `${s.numero_expedicao || ''} — ${s.cliente || ''}`,
        severity: 'Média',
        module: 'WMS',
        entity: s.numero_expedicao || s.id,
        created: s.created || today,
      })
    }
  })

  alertArr.forEach((a) => {
    if (!a.resolved) {
      exceptions.push({
        id: `alert-${a.id}`,
        type: a.tipo || 'Alerta Operacional',
        description: a.descricao || a.mensagem || '',
        severity: a.severity || 'Média',
        module: 'WMS',
        entity: a.id,
        created: a.created || today,
      })
    }
  })

  jouArr.forEach((j) => {
    if (j.status === 'Com Ocorrência') {
      exceptions.push({
        id: `journey-${j.id}`,
        type: 'Viagem com Ocorrência',
        description: `${j.numero_viagem} — ${j.rota || ''} (${j.origem || ''} → ${j.destino || ''})`,
        severity: 'Alta',
        module: 'Transporte',
        entity: j.numero_viagem,
        created: j.created || today,
      })
    }
  })

  const sevOrder: Record<string, number> = { Crítica: 0, Alta: 1, Média: 2, Baixa: 3 }
  return exceptions.sort((a, b) => (sevOrder[a.severity] ?? 4) - (sevOrder[b.severity] ?? 4))
}
