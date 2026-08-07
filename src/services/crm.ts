import pb from '@/lib/pocketbase/client'
import type {
  CrmLead,
  CrmOpportunity,
  CrmFunnelStage,
  CrmActivity,
  CrmProposal,
  CrmLossReason,
  CrmGoal,
  CrmAutomationRule,
  CrmHistory,
} from '@/lib/crm-types'

export const getLeads = (filter?: string) =>
  pb.collection('crm_leads').getFullList({ sort: '-created', filter }) as Promise<CrmLead[]>
export const getLead = (id: string) => pb.collection('crm_leads').getOne(id) as Promise<CrmLead>
export const createLead = (data: Record<string, unknown>) =>
  pb.collection('crm_leads').create(data) as Promise<CrmLead>
export const updateLead = (id: string, data: Record<string, unknown>) =>
  pb.collection('crm_leads').update(id, data) as Promise<CrmLead>
export const deleteLead = (id: string) => pb.collection('crm_leads').delete(id)

export const getOpportunities = (filter?: string) =>
  pb.collection('crm_opportunities').getFullList({ sort: '-created', filter }) as Promise<
    CrmOpportunity[]
  >
export const getOpportunity = (id: string) =>
  pb.collection('crm_opportunities').getOne(id) as Promise<CrmOpportunity>
export const createOpportunity = (data: Record<string, unknown>) =>
  pb.collection('crm_opportunities').create(data) as Promise<CrmOpportunity>
export const updateOpportunity = (id: string, data: Record<string, unknown>) =>
  pb.collection('crm_opportunities').update(id, data) as Promise<CrmOpportunity>
export const deleteOpportunity = (id: string) => pb.collection('crm_opportunities').delete(id)

export const getFunnelStages = () =>
  pb.collection('crm_funnel_stages').getFullList({ sort: 'order' }) as Promise<CrmFunnelStage[]>
export const createFunnelStage = (data: Record<string, unknown>) =>
  pb.collection('crm_funnel_stages').create(data)
export const updateFunnelStage = (id: string, data: Record<string, unknown>) =>
  pb.collection('crm_funnel_stages').update(id, data)
export const deleteFunnelStage = (id: string) => pb.collection('crm_funnel_stages').delete(id)

export const getActivities = (filter?: string) =>
  pb.collection('crm_activities').getFullList({ sort: '-scheduled_date', filter }) as Promise<
    CrmActivity[]
  >
export const createActivity = (data: Record<string, unknown>) =>
  pb.collection('crm_activities').create(data)
export const updateActivity = (id: string, data: Record<string, unknown>) =>
  pb.collection('crm_activities').update(id, data)
export const deleteActivity = (id: string) => pb.collection('crm_activities').delete(id)

export const getProposals = (filter?: string) =>
  pb.collection('crm_proposals').getFullList({ sort: '-created', filter }) as Promise<CrmProposal[]>
export const getProposal = (id: string) =>
  pb.collection('crm_proposals').getOne(id) as Promise<CrmProposal>
export const createProposal = (data: Record<string, unknown>) =>
  pb.collection('crm_proposals').create(data)
export const updateProposal = (id: string, data: Record<string, unknown>) =>
  pb.collection('crm_proposals').update(id, data)
export const deleteProposal = (id: string) => pb.collection('crm_proposals').delete(id)

export const getLossReasons = () =>
  pb.collection('crm_loss_reasons').getFullList({ sort: 'name' }) as Promise<CrmLossReason[]>
export const createLossReason = (data: Record<string, unknown>) =>
  pb.collection('crm_loss_reasons').create(data)
export const updateLossReason = (id: string, data: Record<string, unknown>) =>
  pb.collection('crm_loss_reasons').update(id, data)
export const deleteLossReason = (id: string) => pb.collection('crm_loss_reasons').delete(id)

export const getGoals = () =>
  pb.collection('crm_goals').getFullList({ sort: '-created' }) as Promise<CrmGoal[]>
export const createGoal = (data: Record<string, unknown>) => pb.collection('crm_goals').create(data)
export const updateGoal = (id: string, data: Record<string, unknown>) =>
  pb.collection('crm_goals').update(id, data)
export const deleteGoal = (id: string) => pb.collection('crm_goals').delete(id)

export const getAutomationRules = () =>
  pb.collection('crm_automation_rules').getFullList({ sort: '-created' }) as Promise<
    CrmAutomationRule[]
  >
export const createAutomationRule = (data: Record<string, unknown>) =>
  pb.collection('crm_automation_rules').create(data)
export const updateAutomationRule = (id: string, data: Record<string, unknown>) =>
  pb.collection('crm_automation_rules').update(id, data)
export const deleteAutomationRule = (id: string) => pb.collection('crm_automation_rules').delete(id)

export const getHistory = (filter?: string) =>
  pb.collection('crm_history').getFullList({ sort: '-date', filter }) as Promise<CrmHistory[]>
export const createHistoryEntry = (data: Record<string, unknown>) =>
  pb.collection('crm_history').create(data)

export async function generateLeadNumber(): Promise<string> {
  try {
    const res = await pb.collection('crm_leads').getList(1, 1, { sort: '-lead_number' })
    if (res.items.length > 0) {
      const match = (res.items[0] as Record<string, string>).lead_number?.match(/(\d+)$/)
      if (match) return `LEAD-${String(parseInt(match[1]) + 1).padStart(5, '0')}`
    }
  } catch {
    /* intentionally ignored */
  }
  return 'LEAD-00001'
}
export async function generateOpportunityNumber(): Promise<string> {
  try {
    const res = await pb
      .collection('crm_opportunities')
      .getList(1, 1, { sort: '-opportunity_number' })
    if (res.items.length > 0) {
      const match = (res.items[0] as Record<string, string>).opportunity_number?.match(/(\d+)$/)
      if (match) return `OPP-${String(parseInt(match[1]) + 1).padStart(5, '0')}`
    }
  } catch {
    /* intentionally ignored */
  }
  return 'OPP-00001'
}
export async function generateProposalNumber(): Promise<string> {
  try {
    const res = await pb.collection('crm_proposals').getList(1, 1, { sort: '-proposal_number' })
    if (res.items.length > 0) {
      const match = (res.items[0] as Record<string, string>).proposal_number?.match(/(\d+)$/)
      if (match) return `PROP-${String(parseInt(match[1]) + 1).padStart(5, '0')}`
    }
  } catch {
    /* intentionally ignored */
  }
  return 'PROP-00001'
}

export async function checkLeadDuplicate(
  field: string,
  value: string,
  excludeId?: string,
): Promise<boolean> {
  if (!value.trim()) return false
  try {
    const q = value.replace(/"/g, '\\"')
    const filter = `${field} = "${q}"${excludeId ? ` && id != "${excludeId}"` : ''}`
    const res = await pb.collection('crm_leads').getList(1, 1, { filter })
    return res.items.length > 0
  } catch {
    return false
  }
}

export async function getCrmDashboardData() {
  try {
    const [leads, opps, stages, proposals, activities] = await Promise.all([
      getLeads(),
      getOpportunities(),
      getFunnelStages(),
      getProposals(),
      getActivities(),
    ])
    const totalLeads = leads.length
    const newLeads = leads.filter((l) => l.status === 'Novo').length
    const inAttendance = leads.filter((l) =>
      ['Em Contato', 'Em Qualificação'].includes(l.status),
    ).length
    const convertedLeads = leads.filter((l) => l.status === 'Convertido').length
    const lostLeads = leads.filter((l) => l.status === 'Perdido').length
    const openOpps = opps.filter(
      (o) => !['Ganha', 'Perdida', 'Cancelada'].includes(o.status),
    ).length
    const funnelValue = opps
      .filter((o) => !['Ganha', 'Perdida', 'Cancelada'].includes(o.status))
      .reduce((s, o) => s + (parseFloat(o.estimated_value) || 0), 0)
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
    const wonOpps = opps.filter((o) => o.status === 'Ganha')
    const avgTicket =
      wonOpps.length > 0
        ? wonOpps.reduce((s, o) => s + (parseFloat(o.estimated_value) || 0), 0) / wonOpps.length
        : 0
    const overdueActivities = activities.filter(
      (a) => a.status === 'Pendente' && a.scheduled_date && new Date(a.scheduled_date) < new Date(),
    ).length
    const sentProposals = proposals.filter((p) => p.status === 'Enviada').length
    const approvedProposals = proposals.filter((p) => p.status === 'Aprovada').length
    const rejectedProposals = proposals.filter((p) => p.status === 'Rejeitada').length
    const oppsByStage = stages.map((s) => ({
      stage: s.name,
      count: opps.filter((o) => o.stage_id === s.id).length,
      value: opps
        .filter((o) => o.stage_id === s.id)
        .reduce((sum, o) => sum + (parseFloat(o.estimated_value) || 0), 0),
      color: s.color || '#005B2E',
    }))
    const salesByResponsible = Object.entries(
      opps
        .filter((o) => o.status === 'Ganha')
        .reduce(
          (acc, o) => {
            const k = o.responsible_name || '—'
            acc[k] = (acc[k] || 0) + (parseFloat(o.estimated_value) || 0)
            return acc
          },
          {} as Record<string, number>,
        ),
    ).map(([name, value]) => ({ name, value }))
    return {
      totalLeads,
      newLeads,
      inAttendance,
      convertedLeads,
      lostLeads,
      openOpps,
      funnelValue,
      conversionRate,
      avgTicket,
      overdueActivities,
      sentProposals,
      approvedProposals,
      rejectedProposals,
      oppsByStage,
      salesByResponsible,
    }
  } catch {
    return {
      totalLeads: 0,
      newLeads: 0,
      inAttendance: 0,
      convertedLeads: 0,
      lostLeads: 0,
      openOpps: 0,
      funnelValue: 0,
      conversionRate: 0,
      avgTicket: 0,
      overdueActivities: 0,
      sentProposals: 0,
      approvedProposals: 0,
      rejectedProposals: 0,
      oppsByStage: [],
      salesByResponsible: [],
    }
  }
}

export async function moveOpportunityStage(
  oppId: string,
  newStageId: string,
  oldStageId: string,
  oldStageEnteredAt: string,
  userName: string,
) {
  const now = new Date().toISOString()
  const timeInStage = oldStageEnteredAt
    ? Math.round((Date.now() - new Date(oldStageEnteredAt).getTime()) / 3600000)
    : 0
  await updateOpportunity(oppId, { stage_id: newStageId, stage_entered_at: now })
  await createHistoryEntry({
    entity_type: 'opportunity',
    entity_id: oppId,
    type: 'stage_change',
    description: `Etapa alterada — tempo na etapa anterior: ${timeInStage}h`,
    user_name: userName,
    date: now,
    company: 'Velora Log',
    filial: 'Matriz',
  })
}

export async function getConsolidatedHistory(filter?: string) {
  const [history, activities, proposals] = await Promise.all([
    getHistory(filter).catch(() => []),
    getActivities().catch(() => []),
    getProposals().catch(() => []),
  ])
  const items: Array<Record<string, unknown>> = []
  history.forEach((h) =>
    items.push({
      id: h.id,
      source: 'Histórico',
      date: h.date || h.created,
      type: h.type,
      responsible: h.user_name,
      subject: h.entity_name,
      result: h.description,
    }),
  )
  activities.forEach((a) =>
    items.push({
      id: a.id,
      source: 'Atividade',
      date: a.scheduled_date || a.created,
      type: a.type,
      responsible: a.responsible_name,
      subject: a.title,
      result: a.result,
    }),
  )
  proposals.forEach((p) =>
    items.push({
      id: p.id,
      source: 'Proposta',
      date: p.created,
      type: 'Proposta',
      responsible: p.responsible_name,
      subject: p.title,
      result: p.status,
    }),
  )
  items.sort((a, b) => new Date(b.date as string).getTime() - new Date(a.date as string).getTime())
  return items
}

export function callCrmAI(type: string, data: Record<string, unknown>) {
  return pb.send('/backend/v1/crm/ai-assist', {
    method: 'POST',
    body: JSON.stringify({ type, data }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function getCrmReportData() {
  const [leads, opps, proposals, activities, stages, lossReasons] = await Promise.all([
    getLeads().catch(() => []),
    getOpportunities().catch(() => []),
    getProposals().catch(() => []),
    getActivities().catch(() => []),
    getFunnelStages().catch(() => []),
    getLossReasons().catch(() => []),
  ])
  const leadsBySource = Object.entries(
    leads.reduce(
      (acc, l) => {
        const k = l.lead_source || '—'
        acc[k] = (acc[k] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  ).map(([name, count]) => ({ name, count }))
  const leadsByStatus = Object.entries(
    leads.reduce(
      (acc, l) => {
        const k = l.status || '—'
        acc[k] = (acc[k] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  ).map(([name, count]) => ({ name, count }))
  const wonOpps = opps.filter((o) => o.status === 'Ganha')
  const lostOpps = opps.filter((o) => o.status === 'Perdida')
  const funnelValue = opps
    .filter((o) => !['Ganha', 'Perdida', 'Cancelada'].includes(o.status))
    .reduce((s, o) => s + (parseFloat(o.estimated_value) || 0), 0)
  return {
    leads,
    opps,
    proposals,
    activities,
    stages,
    lossReasons,
    leadsBySource,
    leadsByStatus,
    wonOpps,
    lostOpps,
    funnelValue,
  }
}

export function logCRMAudit(action: string, module: string, targetId: string, summary: string) {
  pb.send('/backend/v1/audit/create', {
    method: 'POST',
    body: JSON.stringify({
      action,
      module: `crm_${module}`,
      target_collection: `crm_${module}`,
      target_id: targetId,
      target_summary: summary,
    }),
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => {})
}
