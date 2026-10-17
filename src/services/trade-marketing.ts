import pb from '@/lib/pocketbase/client'
import type { TradeMarketingAction, TmFilters, TmConflict } from '@/lib/trade-marketing-types'

export async function getActions(filters?: TmFilters): Promise<TradeMarketingAction[]> {
  const parts: string[] = []
  if (filters?.status) parts.push(`status = "${filters.status}"`)
  if (filters?.priority) parts.push(`priority = "${filters.priority}"`)
  if (filters?.tipo) parts.push(`action_type = "${filters.tipo}"`)
  if (filters?.supplier) parts.push(`supplier ~ "${filters.supplier}"`)
  if (filters?.campaign) parts.push(`campaign_id = "${filters.campaign}"`)
  if (filters?.startDate) parts.push(`start_date >= "${filters.startDate}"`)
  if (filters?.endDate) parts.push(`end_date <= "${filters.endDate}"`)
  const actions = (await pb.collection('trade_marketing_actions').getFullList({
    sort: 'start_date',
    filter: parts.length ? parts.join(' && ') : undefined,
  })) as TradeMarketingAction[]
  if (filters?.scope === 'mine') {
    const userId = pb.authStore.record?.id
    return actions.filter((a) => a.responsible_id === userId)
  }
  return actions
}

export async function getAction(id: string): Promise<TradeMarketingAction> {
  return pb.collection('trade_marketing_actions').getOne(id) as Promise<TradeMarketingAction>
}

export async function createAction(data: Record<string, unknown>): Promise<TradeMarketingAction> {
  const user = pb.authStore.record as Record<string, unknown> | null
  return pb.collection('trade_marketing_actions').create({
    ...data,
    created_by: user?.id || '',
    created_by_name: (user?.name as string) || '',
  }) as Promise<TradeMarketingAction>
}

export async function updateAction(
  id: string,
  data: Record<string, unknown>,
): Promise<TradeMarketingAction> {
  return pb.collection('trade_marketing_actions').update(id, data) as Promise<TradeMarketingAction>
}

export async function deleteAction(id: string): Promise<void> {
  await pb.collection('trade_marketing_actions').delete(id)
}

export async function advanceActionStatus(
  id: string,
  newStatus: string,
): Promise<TradeMarketingAction> {
  return updateAction(id, { status: newStatus })
}

export function detectConflicts(actions: TradeMarketingAction[]): TmConflict[] {
  const conflicts: TmConflict[] = []
  for (let i = 0; i < actions.length; i++) {
    for (let j = i + 1; j < actions.length; j++) {
      const a = actions[i]
      const b = actions[j]
      const aStart = new Date(a.start_date).getTime()
      const aEnd = new Date(a.end_date || a.start_date).getTime()
      const bStart = new Date(b.start_date).getTime()
      const bEnd = new Date(b.end_date || b.start_date).getTime()
      if (aStart <= bEnd && bStart <= aEnd) {
        if (a.responsible_id && a.responsible_id === b.responsible_id)
          conflicts.push({
            type: 'responsible',
            actionIds: [a.id, b.id],
            message: `Responsável em conflito: ${a.responsible_name}`,
          })
        if (a.pdv && a.pdv === b.pdv)
          conflicts.push({
            type: 'pdv',
            actionIds: [a.id, b.id],
            message: `PDV em conflito: ${a.pdv}`,
          })
        if (a.team && a.team === b.team)
          conflicts.push({
            type: 'team',
            actionIds: [a.id, b.id],
            message: `Equipe em conflito: ${a.team}`,
          })
      }
    }
  }
  return conflicts
}

export function logTMAudit(action: string, targetId: string, summary: string) {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action,
      module: 'trade_marketing',
      target_collection: 'trade_marketing_actions',
      target_id: targetId,
      target_summary: summary,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}

export function generateTMReport(actions: TradeMarketingAction[], userName: string): void {
  const rows = actions
    .map(
      (a) =>
        `<tr><td>${a.title}</td><td>${a.action_type}</td><td>${a.status}</td><td>${a.start_date}</td><td>${a.end_date || '—'}</td><td>${a.responsible_name || '—'}</td><td>${a.supplier || '—'}</td><td>R$ ${a.budget_planned || '0'}</td></tr>`,
    )
    .join('')
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório Trade & Marketing</title><style>body{font-family:Segoe UI,Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th{background:#005B2E;color:#fff;padding:8px;text-align:left}td{padding:6px;border-bottom:1px solid #ddd}h1{color:#005B2E}</style></head><body><h1>Relatório de Ações Trade & Marketing</h1><p>Sistema: Jetro | Usuário: ${userName} | Data: ${new Date().toLocaleString('pt-BR')}</p><p>Total: ${actions.length} ação(ões)</p><table><thead><tr><th>Título</th><th>Tipo</th><th>Status</th><th>Início</th><th>Fim</th><th>Responsável</th><th>Fornecedor</th><th>Orçamento</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=function(){setTimeout(function(){window.print()},300)}</script></body></html>`
  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
