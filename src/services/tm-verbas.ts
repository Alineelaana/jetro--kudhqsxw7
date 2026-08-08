import pb from '@/lib/pocketbase/client'
import { SA_COLLECTIONS } from '@/services/supplier-allowance'
import type { TmVerbaRow } from '@/lib/tm-verbas-types'

export async function getTmVerbas(): Promise<TmVerbaRow[]> {
  const [agreements, accounts, appropriations, tmActions] = await Promise.all([
    pb.collection(SA_COLLECTIONS.agreements).getFullList({
      sort: '-created',
      expand: 'supplier',
    }) as Promise<any[]>,
    pb.collection(SA_COLLECTIONS.accounts).getFullList({ sort: '-created' }) as Promise<any[]>,
    pb.collection(SA_COLLECTIONS.appropriations).getFullList({ sort: '-created' }) as Promise<
      any[]
    >,
    pb.collection('trade_marketing_actions').getFullList({ sort: '-created' }) as Promise<any[]>,
  ])

  const committedByAccount = appropriations.reduce(
    (acc, ap) => {
      if (ap.status === 'pendente' || ap.status === 'aprovado') {
        const aid = ap.account || ''
        acc[aid] = (acc[aid] || 0) + (parseFloat(ap.allocated_value) || 0)
      }
      return acc
    },
    {} as Record<string, number>,
  )

  return agreements.map((ag: any): TmVerbaRow => {
    const account = accounts.find((a: any) => a.agreement === ag.id)
    const exp = ag.expand?.supplier
    const supplierName = exp?.full_name || exp?.company_name || exp?.name || '—'

    const linked = tmActions.filter((a: any) => a.supplier === supplierName || a.verba_id === ag.id)
    const brands = [...new Set(linked.map((a: any) => a.brand).filter(Boolean))]
    const products = [...new Set(linked.map((a: any) => a.product).filter(Boolean))]
    const campaigns = [...new Set(linked.map((a: any) => a.campaign_name).filter(Boolean))]
    const actionTitles = [...new Set(linked.map((a: any) => a.title).filter(Boolean))]

    return {
      id: ag.id,
      agreement_id: ag.id,
      account_id: account?.id || '',
      supplier_id: ag.supplier || '',
      supplier_name: supplierName,
      agreement_type: ag.agreement_type || '',
      status: ag.status || '',
      value_original: ag.value || '0',
      opening_balance: account?.opening_balance || '0',
      accrued_total: account?.accrued_total || '0',
      committed_total: String(account ? committedByAccount[account.id] || 0 : 0),
      consumed_total: account?.consumed_total || '0',
      settled_total: account?.settled_total || '0',
      current_balance: account?.current_balance || '0',
      start_date: ag.start_date || '',
      end_date: ag.end_date || '',
      company: ag.company || '',
      branch: ag.branch || '',
      responsible_user: ag.responsible_user || '',
      currency: ag.currency || 'BRL',
      observations: ag.observations || '',
      brands,
      products,
      campaigns,
      actions: actionTitles,
    }
  })
}

export function logVerbaAudit(action: string, targetId: string, summary: string) {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action,
      module: 'trade_marketing_verbas',
      target_collection: 'supplier_allowance_agreements',
      target_id: targetId,
      target_summary: summary,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}

export async function linkVerbaToAction(
  actionId: string,
  verbaId: string,
  verbaName: string,
  purpose: string,
) {
  await pb.collection('trade_marketing_actions').update(actionId, {
    verba_id: verbaId,
    verba_name: verbaName,
  })
  logVerbaAudit(
    'link_verba_action',
    verbaId,
    `Verba vinculada à ação ${actionId} (Finalidade: ${purpose})`,
  )
}
