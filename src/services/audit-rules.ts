import pb from '@/lib/pocketbase/client'

export type AlertCategory = 'estoque_wms' | 'bonificacao' | 'vendas' | 'verbas' | 'personalizado'

export type AlertSeverity = 'info' | 'warning' | 'critical'
export type ThresholdType = 'valor_moeda' | 'percentual' | 'quantidade' | 'dias' | 'evento'

export interface AuditAlertRule {
  id: string
  name: string
  category: AlertCategory
  code: string
  description: string
  is_custom: boolean
  active: boolean
  severity: AlertSeverity
  threshold_type: ThresholdType
  threshold_value: number
  recipient_user_ids: string[]
  custom_condition?: string
  empresa?: string
  filial?: string
  created_by?: string
  created?: string
  updated?: string
}

export interface AuditAlertOccurrence {
  id: string
  type: string
  module: string
  severity: AlertSeverity
  title: string
  description: string
  status: 'open' | 'investigating' | 'resolved' | 'dismissed'
  empresa?: string
  filial?: string
  action?: string
  responsible_user?: string
  reason?: string
  rule_id?: string
  metadata?: Record<string, unknown>
  resolved?: boolean
  resolved_by?: string
  resolved_at?: string
  resolution_notes?: string
  created: string
  updated: string
}

export interface SystemUserOption {
  id: string
  name: string
  email: string
  login?: string
  role?: string
}

/**
 * Busca todas as regras de alerta cadastradas, filtrando opcionalmente por empresa.
 */
export async function getAuditAlertRules(empresa?: string): Promise<AuditAlertRule[]> {
  const filters: string[] = []
  if (empresa) {
    filters.push(`(empresa = "" || empresa = "${empresa.replace(/"/g, '\\"')}")`)
  }
  const filterStr = filters.length > 0 ? filters.join(' && ') : undefined

  try {
    const records = await pb.collection('audit_alert_rules').getFullList({
      sort: 'category,name',
      filter: filterStr,
    })
    return records as unknown as AuditAlertRule[]
  } catch (err) {
    console.error('Erro ao buscar regras de alerta:', err)
    return []
  }
}

/**
 * Grava ou atualiza uma regra de alerta e registra a alteração no audit log
 */
export async function saveAuditAlertRule(
  rule: Partial<AuditAlertRule>,
  userIdentifier: string,
  userEmpresa?: string,
): Promise<AuditAlertRule> {
  const isNew = !rule.id
  let savedRecord: AuditAlertRule

  const payload: Record<string, unknown> = {
    name: rule.name,
    category: rule.category,
    code: rule.code || `custom_${Date.now()}`,
    description: rule.description || '',
    is_custom: rule.is_custom ?? false,
    active: rule.active ?? true,
    severity: rule.severity || 'warning',
    threshold_type: rule.threshold_type || 'quantidade',
    threshold_value: Number(rule.threshold_value) || 0,
    recipient_user_ids: rule.recipient_user_ids || [],
    custom_condition: rule.custom_condition || '',
    empresa: rule.empresa || userEmpresa || '',
    filial: rule.filial || '',
    created_by: rule.created_by || userIdentifier,
  }

  if (isNew) {
    const res = await pb.collection('audit_alert_rules').create(payload)
    savedRecord = res as unknown as AuditAlertRule
  } else {
    const res = await pb.collection('audit_alert_rules').update(rule.id!, payload)
    savedRecord = res as unknown as AuditAlertRule
  }

  // Rastreabilidade: registrar alteração de configuração na auditoria do sistema
  try {
    await pb.collection('audit_logs').create({
      user_id: userIdentifier,
      action: isNew ? 'CRIAR_REGRA_ALERTA' : 'ATUALIZAR_REGRA_ALERTA',
      module: 'auditoria',
      details: {
        rule_id: savedRecord.id,
        name: savedRecord.name,
        code: savedRecord.code,
        active: savedRecord.active,
        threshold_value: savedRecord.threshold_value,
        threshold_type: savedRecord.threshold_type,
        recipients_count: (savedRecord.recipient_user_ids || []).length,
      },
      empresa: userEmpresa || savedRecord.empresa || '',
      severity: 'info',
    })
  } catch (logErr) {
    console.warn('Não foi possível gravar log de auditoria para a regra:', logErr)
  }

  return savedRecord
}

/**
 * Exclui uma regra personalizada de alerta e registra na auditoria
 */
export async function deleteAuditAlertRule(
  ruleId: string,
  ruleName: string,
  userIdentifier: string,
  userEmpresa?: string,
): Promise<void> {
  await pb.collection('audit_alert_rules').delete(ruleId)

  try {
    await pb.collection('audit_logs').create({
      user_id: userIdentifier,
      action: 'EXCLUIR_REGRA_ALERTA',
      module: 'auditoria',
      details: {
        rule_id: ruleId,
        name: ruleName,
      },
      empresa: userEmpresa || '',
      severity: 'warning',
    })
  } catch (logErr) {
    console.warn('Não foi possível gravar log de exclusão de regra:', logErr)
  }
}

/**
 * Alterna ativação de uma regra de alerta rapidamente
 */
export async function toggleAuditAlertRuleActive(
  ruleId: string,
  active: boolean,
  ruleName: string,
  userIdentifier: string,
  userEmpresa?: string,
): Promise<void> {
  await pb.collection('audit_alert_rules').update(ruleId, { active })

  try {
    await pb.collection('audit_logs').create({
      user_id: userIdentifier,
      action: active ? 'ATIVAR_REGRA_ALERTA' : 'DESATIVAR_REGRA_ALERTA',
      module: 'auditoria',
      details: { rule_id: ruleId, name: ruleName, active },
      empresa: userEmpresa || '',
      severity: 'info',
    })
  } catch {
    /* intentionally ignored */
  }
}

/**
 * Carrega a lista de usuários ativos para seleção de responsáveis
 */
export async function getSystemUsersList(): Promise<SystemUserOption[]> {
  try {
    const list = await pb.collection('users').getFullList({
      sort: 'name',
      fields: 'id,name,email,login,role',
    })
    return list.map((u) => ({
      id: u.id,
      name: (u.name as string) || (u.login as string) || (u.email as string),
      email: (u.email as string) || '',
      login: (u.login as string) || '',
      role: (u.role as string) || '',
    }))
  } catch (err) {
    console.error('Erro ao buscar lista de usuários:', err)
    return []
  }
}

/**
 * Busca histórico detalhado de ocorrências de alertas para a Auditoria do Sistema
 */
export async function getAuditAlertOccurrences(params?: {
  empresa?: string
  status?: string
  limit?: number
}): Promise<AuditAlertOccurrence[]> {
  const filters: string[] = []
  if (params?.empresa) {
    filters.push(`(empresa = "" || empresa = "${params.empresa.replace(/"/g, '\\"')}")`)
  }
  if (params?.status && params.status !== 'all') {
    filters.push(`status = "${params.status}"`)
  }

  const filterStr = filters.length > 0 ? filters.join(' && ') : undefined

  try {
    const list = await pb.collection('audit_alerts').getList(1, params?.limit || 100, {
      sort: '-created',
      filter: filterStr,
    })
    return list.items as unknown as AuditAlertOccurrence[]
  } catch (err) {
    console.error('Erro ao buscar ocorrências de alerta:', err)
    return []
  }
}

/**
 * Resolve ou dispensa uma ocorrência de alerta
 */
export async function updateAuditOccurrenceStatus(
  occurrenceId: string,
  status: 'resolved' | 'dismissed' | 'investigating',
  userIdentifier: string,
  notes?: string,
): Promise<void> {
  const payload: Record<string, unknown> = {
    status,
    resolved: status === 'resolved',
    resolved_by: userIdentifier,
    resolved_at: new Date().toISOString(),
    resolution_notes: notes || '',
  }

  await pb.collection('audit_alerts').update(occurrenceId, payload)

  try {
    await pb.collection('audit_logs').create({
      user_id: userIdentifier,
      action: `ALERTA_${status.toUpperCase()}`,
      module: 'auditoria',
      details: { occurrence_id: occurrenceId, status, notes },
      severity: 'info',
    })
  } catch {
    /* intentionally ignored */
  }
}

/**
 * Executa a avaliação sob demanda de todas as regras no backend
 */
export async function evaluateAlertRulesBackend(empresa?: string): Promise<{
  success: boolean
  evaluated_rules: number
  occurrences_generated: number
}> {
  try {
    const res = await pb.send('/backend/v1/audit/rules/evaluate', {
      method: 'POST',
      body: JSON.stringify({ empresa }),
      headers: { 'Content-Type': 'application/json' },
    })
    return res as {
      success: boolean
      evaluated_rules: number
      occurrences_generated: number
    }
  } catch (err) {
    console.error('Erro ao executar avaliação de regras no backend:', err)
    return { success: false, evaluated_rules: 0, occurrences_generated: 0 }
  }
}
