import pb from '@/lib/pocketbase/client'
import type { ClientNetwork, NetworkConsolidatedData, NetworkMemberData } from '@/lib/network-types'

export async function getNetworks(): Promise<ClientNetwork[]> {
  return pb.collection('client_networks').getFullList({ sort: '-created' }) as Promise<
    ClientNetwork[]
  >
}

export async function getNetwork(id: string): Promise<ClientNetwork> {
  return pb.collection('client_networks').getOne(id) as Promise<ClientNetwork>
}

export async function createNetwork(data: Record<string, unknown>): Promise<ClientNetwork> {
  return pb.collection('client_networks').create(data) as Promise<ClientNetwork>
}

export async function updateNetwork(
  id: string,
  data: Record<string, unknown>,
): Promise<ClientNetwork> {
  return pb.collection('client_networks').update(id, data) as Promise<ClientNetwork>
}

export async function deleteNetwork(id: string): Promise<void> {
  await pb.collection('client_networks').delete(id)
}

export async function getNetworkMembers(networkId: string): Promise<any[]> {
  return pb.collection('partners').getFullList({ filter: `network_id = "${networkId}"` })
}

export async function loadNetworksMap(): Promise<Record<string, string>> {
  try {
    const records = await pb.collection('client_networks').getFullList()
    const map: Record<string, string> = {}
    for (const n of records) {
      map[n.id] = n.name
    }
    return map
  } catch {
    return {}
  }
}

export async function linkPartnerToNetwork(
  partnerId: string,
  networkId: string,
  justification: string,
): Promise<void> {
  await pb.collection('partners').update(partnerId, {
    network_id: networkId,
    justification,
  })
}

export async function unlinkPartnerFromNetwork(
  partnerId: string,
  justification: string,
): Promise<void> {
  await pb.collection('partners').update(partnerId, {
    network_id: '',
    justification,
  })
}

export async function getNetworkConsolidated(networkId: string): Promise<NetworkConsolidatedData> {
  const network = await getNetwork(networkId)
  const members = await getNetworkMembers(networkId)
  const memberData: NetworkMemberData[] = []
  let totalReceivable = 0,
    totalOverdue = 0,
    openOrders = 0,
    blockedOrders = 0,
    maxDelay = 0,
    creditUsed = 0

  for (const m of members) {
    const name = m.full_name || m.company_name || ''
    let mReceivable = 0,
      mOverdue = 0,
      mMaxDelay = 0,
      mOpenOrders = 0,
      mBlockedOrders = 0
    try {
      const recs = await pb.collection('financial_receivables').getFullList({
        filter: `cliente ~ "${name}" && status != "Cancelado"`,
      })
      for (const r of recs) {
        const saldo = parseFloat(r.valor_original || '0') - parseFloat(r.valor_recebido || '0')
        mReceivable += saldo
        if (r.status !== 'Recebido') {
          const venc = r.data_vencimento
          if (venc) {
            const days = Math.floor((Date.now() - new Date(venc).getTime()) / 86400000)
            if (days > 0) {
              mOverdue += saldo
              if (days > mMaxDelay) mMaxDelay = days
            }
          }
        }
      }
    } catch {
      /* intentionally ignored */
    }
    try {
      const orders = await pb
        .collection('sales_orders')
        .getFullList({ filter: `client_name ~ "${name}"` })
      mOpenOrders = orders.filter((o: any) => !['Cancelado', 'Entregue'].includes(o.status)).length
      mBlockedOrders = orders.filter((o: any) => o.status === 'Bloqueado').length
      openOrders += mOpenOrders
      blockedOrders += mBlockedOrders
    } catch {
      /* intentionally ignored */
    }
    memberData.push({
      id: m.id,
      name,
      cnpj: m.cnpj || '',
      totalReceivable: mReceivable,
      totalOverdue: mOverdue,
      maxDelay: mMaxDelay,
      isRestricted: m.financial_restriction === true,
      restrictionSource: m.network_restriction_source || '',
      openOrders: mOpenOrders,
      blockedOrders: mBlockedOrders,
    })
    totalReceivable += mReceivable
    totalOverdue += mOverdue
    if (mMaxDelay > maxDelay) maxDelay = mMaxDelay
    creditUsed += mOverdue
  }

  const creditLimit = parseFloat(network.credit_limit || '0')
  const consolidatedRisk =
    totalOverdue > 50000 || maxDelay > 60
      ? 'Crítico'
      : totalOverdue > 20000 || maxDelay > 30
        ? 'Alto'
        : totalOverdue > 5000 || maxDelay > 15
          ? 'Médio'
          : 'Baixo'

  return {
    network,
    members: memberData,
    totalReceivable,
    totalOverdue,
    openOrders,
    blockedOrders,
    maxDelay,
    creditLimit,
    creditUsed,
    creditAvailable: creditLimit - creditUsed,
    consolidatedRisk,
  }
}

export async function creditCheck(partnerId: string) {
  return pb.send('/backend/v1/networks/credit-check', {
    method: 'POST',
    body: JSON.stringify({ partner_id: partnerId }),
    headers: { 'Content-Type': 'application/json' },
  })
}
