import pb from '@/lib/pocketbase/client'

export type StatusLancamento = 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Cancelado'

export interface HistoricoItem {
  acao: string
  status_anterior?: string
  status_novo?: string
  usuario_id?: string
  usuario_nome?: string
  usuario_role?: string
  data: string
  justificativa?: string
  detalhes?: string
}

export interface CommissionAwardType {
  id: string
  name: string
  code?: string
  description?: string
  active: boolean
  created?: string
}

export interface CommissionDeductionReason {
  id: string
  name: string
  code?: string
  description?: string
  requires_devolution?: boolean
  active: boolean
  created?: string
}

export interface CommissionAward {
  id: string
  company: string
  branch?: string
  beneficiary_id: string
  beneficiary_code?: string
  beneficiary_name: string
  beneficiary_cpf_cnpj?: string
  role_name: string
  competencia: string // YYYY-MM
  release_date: string // YYYY-MM-DD
  award_type: string
  description: string
  amount: number
  campaign_id?: string
  campaign_name?: string
  observations?: string
  attachments?: string[]
  responsible_user_id?: string
  responsible_user_name?: string
  status: StatusLancamento
  approved_by_id?: string
  approved_by_name?: string
  approved_at?: string
  rejected_by_id?: string
  rejected_by_name?: string
  rejected_at?: string
  cancelled_by_id?: string
  cancelled_by_name?: string
  cancelled_at?: string
  justification?: string
  history?: HistoricoItem[]
  hash_duplicidade?: string
  created?: string
  updated?: string
}

export interface CommissionDeduction {
  id: string
  company: string
  branch?: string
  beneficiary_id: string
  beneficiary_code?: string
  beneficiary_name: string
  beneficiary_cpf_cnpj?: string
  role_name: string
  competencia: string // YYYY-MM
  release_date: string // YYYY-MM-DD
  deduction_type: string
  reason: string
  description: string
  amount: number
  order_number?: string
  order_id?: string
  invoice_number?: string
  invoice_id?: string
  client_name?: string
  client_id?: string
  devolution_id?: string
  devolution_number?: string
  observations?: string
  attachments?: string[]
  responsible_user_id?: string
  responsible_user_name?: string
  status: StatusLancamento
  approved_by_id?: string
  approved_by_name?: string
  approved_at?: string
  rejected_by_id?: string
  rejected_by_name?: string
  rejected_at?: string
  cancelled_by_id?: string
  cancelled_by_name?: string
  cancelled_at?: string
  justification?: string
  history?: HistoricoItem[]
  hash_duplicidade?: string
  created?: string
  updated?: string
}

export interface BeneficiarioProfissional {
  id: string
  code: string
  name: string
  cpf_cnpj: string
  role_name: string
  company?: string
  origem: 'representante' | 'vendedor' | 'colaborador'
}

// -------------------------------------------------------------
// LISTAGEM DE PROFISSIONAIS REAIS DO ERP (Vendedores e Representantes)
// -------------------------------------------------------------
export async function listarProfissionaisERP(): Promise<BeneficiarioProfissional[]> {
  const lista: BeneficiarioProfissional[] = []
  const uniqueKeys = new Set<string>()

  // 1. Representantes
  try {
    const reps = await pb.collection('representantes').getFullList({
      sort: 'nome',
      filter: 'ativo = true',
      requestKey: null,
    })
    for (const r of reps) {
      const code = (r.codigo || r.id || '').toString()
      const key = `${code}-${r.nome}`
      if (!uniqueKeys.has(key)) {
        uniqueKeys.add(key)
        lista.push({
          id: r.id,
          code: code,
          name: r.nome || 'Representante sem nome',
          cpf_cnpj: r.cpf_cnpj || '',
          role_name: 'Representante Comercial Autônomo (RCA)',
          company: r.empresa || '',
          origem: 'representante',
        })
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar representantes:', err)
  }

  // 2. Vendedores
  try {
    const vends = await pb.collection('vendedores').getFullList({
      sort: 'name',
      requestKey: null,
    })
    for (const v of vends) {
      const code = (v.code || v.id || '').toString()
      const key = `${code}-${v.name}`
      if (!uniqueKeys.has(key)) {
        uniqueKeys.add(key)
        lista.push({
          id: v.id,
          code: code,
          name: v.name || 'Vendedor sem nome',
          cpf_cnpj: v.cpf || '',
          role_name: v.role || 'Vendedor Comercial Interno',
          company: v.company || '',
          origem: 'vendedor',
        })
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar vendedores:', err)
  }

  // Se vazio, fallback seguro
  if (lista.length === 0) {
    lista.push({
      id: 'nqs10lxv8096wq6',
      code: '53.215.715',
      name: 'Maria Aparecida Gomes',
      cpf_cnpj: '53.215.715/0001-44',
      role_name: 'Representante Comercial Autônomo (RCA)',
      company: 'Gran Romano / Jetro Matriz',
      origem: 'representante',
    })
  }

  return lista
}

// -------------------------------------------------------------
// CAMPANHAS COMERCIAIS EXISTENTES
// -------------------------------------------------------------
export async function listarCampanhasERP(): Promise<{ id: string; name: string }[]> {
  try {
    const list = await pb.collection('incentive_campaigns').getFullList({
      sort: '-created',
      requestKey: null,
    })
    return list.map((c) => ({
      id: c.id,
      name: c.title || c.name || 'Campanha Comercial',
    }))
  } catch (e) {
    return [
      { id: 'camp-belliz', name: 'CAMPANHA BELLIZ - MAIO 26' },
      { id: 'camp-positivacao', name: 'CAMPANHA POSITIVAÇÃO REGIONAL 2026' },
      { id: 'camp-meta-ouro', name: 'CAMPANHA META OURO TRIMESTRAL' },
    ]
  }
}

// -------------------------------------------------------------
// DEVOLUÇÕES REAIS EXISTENTES NO ERP
// -------------------------------------------------------------
export async function listarDevolucoesERP(): Promise<
  {
    id: string
    devolution_number: string
    invoice_number: string
    order_number: string
    client_name: string
    total_value: number
    status: string
    date: string
  }[]
> {
  try {
    const list = await pb.collection('sales_returns').getFullList({
      sort: '-created',
      requestKey: null,
    })
    return list.map((d) => ({
      id: d.id,
      devolution_number: d.return_number || d.id,
      invoice_number: d.invoice_number || '',
      order_number: d.order_number || '',
      client_name: d.client_name || '',
      total_value: Number(d.total_value || 0),
      status: d.status || 'Processada',
      date: (d.created || '').slice(0, 10),
    }))
  } catch (e) {
    return []
  }
}

// -------------------------------------------------------------
// TIPOS DE PREMIAÇÕES
// -------------------------------------------------------------
export async function listarTiposPremiacao(): Promise<CommissionAwardType[]> {
  try {
    const list = await pb.collection('commission_award_types').getFullList({
      sort: 'name',
      filter: 'active = true',
      requestKey: null,
    })
    return list.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      description: item.description,
      active: item.active !== false,
      created: item.created,
    }))
  } catch (err) {
    console.warn('Erro ao carregar commission_award_types:', err)
    return [
      { id: 't1', name: 'Campanha Comercial', active: true },
      { id: 't2', name: 'Premiação por Metas Atingidas', active: true },
      { id: 't3', name: 'Bonificação por Desempenho', active: true },
      { id: 't4', name: 'Incentivo Comercial', active: true },
      { id: 't5', name: 'Gratificação Extraordinária', active: true },
      { id: 't6', name: 'Outros Pagamentos Extras', active: true },
    ]
  }
}

export async function criarTipoPremiacao(data: {
  name: string
  description?: string
}): Promise<CommissionAwardType> {
  const rec = await pb.collection('commission_award_types').create({
    name: data.name.trim(),
    code: data.name.trim().toUpperCase().replace(/\s+/g, '_').slice(0, 30),
    description: data.description || '',
    active: true,
  })
  return {
    id: rec.id,
    name: rec.name,
    code: rec.code,
    description: rec.description,
    active: rec.active,
  }
}

// -------------------------------------------------------------
// MOTIVOS DE DEDUÇÃO
// -------------------------------------------------------------
export async function listarMotivosDeducao(): Promise<CommissionDeductionReason[]> {
  try {
    const list = await pb.collection('commission_deduction_reasons').getFullList({
      sort: 'name',
      filter: 'active = true',
      requestKey: null,
    })
    return list.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      description: item.description,
      requires_devolution: item.requires_devolution === true,
      active: item.active !== false,
      created: item.created,
    }))
  } catch (err) {
    console.warn('Erro ao carregar commission_deduction_reasons:', err)
    return [
      { id: 'm1', name: 'Devolução de Mercadorias', requires_devolution: true, active: true },
      { id: 'm2', name: 'Estorno de Comissão', active: true },
      { id: 'm3', name: 'Ajuste de Pagamentos Anteriores', active: true },
      { id: 'm4', name: 'Correção de Valor Pago Indevidamente', active: true },
      { id: 'm5', name: 'Outros Descontos Autorizados', active: true },
    ]
  }
}

export async function criarMotivoDeducao(data: {
  name: string
  description?: string
  requires_devolution?: boolean
}): Promise<CommissionDeductionReason> {
  const rec = await pb.collection('commission_deduction_reasons').create({
    name: data.name.trim(),
    code: data.name.trim().toUpperCase().replace(/\s+/g, '_').slice(0, 30),
    description: data.description || '',
    requires_devolution: !!data.requires_devolution,
    active: true,
  })
  return {
    id: rec.id,
    name: rec.name,
    code: rec.code,
    description: rec.description,
    requires_devolution: rec.requires_devolution,
    active: rec.active,
  }
}

// -------------------------------------------------------------
// CRUD PREMIAÇÕES
// -------------------------------------------------------------
export async function listarPremiacoes(filters?: {
  competencia?: string
  beneficiary_code?: string
  status?: string
  search?: string
}): Promise<CommissionAward[]> {
  try {
    const conditions: string[] = []
    if (filters?.competencia) {
      conditions.push(`competencia = "${filters.competencia}"`)
    }
    if (filters?.beneficiary_code) {
      conditions.push(`beneficiary_code = "${filters.beneficiary_code}"`)
    }
    if (filters?.status && filters.status !== 'todos') {
      conditions.push(`status = "${filters.status}"`)
    }

    const records = await pb.collection('commission_awards').getFullList({
      sort: '-release_date,-created',
      filter: conditions.length > 0 ? conditions.join(' && ') : undefined,
      requestKey: null,
    })

    return records.map((r) => ({
      id: r.id,
      company: r.company || 'Gran Romano / Jetro Matriz',
      branch: r.branch || 'Matriz',
      beneficiary_id: r.beneficiary_id,
      beneficiary_code: r.beneficiary_code,
      beneficiary_name: r.beneficiary_name,
      beneficiary_cpf_cnpj: r.beneficiary_cpf_cnpj,
      role_name: r.role_name,
      competencia: r.competencia,
      release_date: r.release_date,
      award_type: r.award_type,
      description: r.description,
      amount: Number(r.amount || 0),
      campaign_id: r.campaign_id,
      campaign_name: r.campaign_name,
      observations: r.observations,
      attachments: r.attachments || [],
      responsible_user_id: r.responsible_user_id,
      responsible_user_name: r.responsible_user_name,
      status: r.status as StatusLancamento,
      approved_by_id: r.approved_by_id,
      approved_by_name: r.approved_by_name,
      approved_at: r.approved_at,
      rejected_by_id: r.rejected_by_id,
      rejected_by_name: r.rejected_by_name,
      rejected_at: r.rejected_at,
      cancelled_by_id: r.cancelled_by_id,
      cancelled_by_name: r.cancelled_by_name,
      cancelled_at: r.cancelled_at,
      justification: r.justification,
      history: r.history || [],
      hash_duplicidade: r.hash_duplicidade,
      created: r.created,
      updated: r.updated,
    }))
  } catch (err) {
    console.error('Erro ao listar premiações:', err)
    return []
  }
}

export async function criarPremiacao(
  data: Partial<CommissionAward>,
  files?: File[],
): Promise<CommissionAward> {
  const formData = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null && k !== 'attachments' && k !== 'history') {
      formData.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v))
    }
  })
  if (files && files.length > 0) {
    files.forEach((f) => formData.append('attachments', f))
  }

  const rec = await pb.collection('commission_awards').create(formData)
  return rec as unknown as CommissionAward
}

export async function atualizarPremiacao(
  id: string,
  data: Partial<CommissionAward>,
): Promise<CommissionAward> {
  const rec = await pb.collection('commission_awards').update(id, data)
  return rec as unknown as CommissionAward
}

export async function excluirPremiacao(id: string): Promise<void> {
  await pb.collection('commission_awards').delete(id)
}

export async function atualizarStatusPremiacao(
  awardId: string,
  newStatus: StatusLancamento,
  justificativa?: string,
): Promise<void> {
  await pb.send('/backend/v1/comissao/premiacoes/status-update', {
    method: 'POST',
    body: {
      award_id: awardId,
      new_status: newStatus,
      justificativa: justificativa || '',
    },
  })
}

// -------------------------------------------------------------
// CRUD DESCONTOS E DEDUÇÕES
// -------------------------------------------------------------
export async function listarDeducoes(filters?: {
  competencia?: string
  beneficiary_code?: string
  status?: string
  search?: string
}): Promise<CommissionDeduction[]> {
  try {
    const conditions: string[] = []
    if (filters?.competencia) {
      conditions.push(`competencia = "${filters.competencia}"`)
    }
    if (filters?.beneficiary_code) {
      conditions.push(`beneficiary_code = "${filters.beneficiary_code}"`)
    }
    if (filters?.status && filters.status !== 'todos') {
      conditions.push(`status = "${filters.status}"`)
    }

    const records = await pb.collection('commission_deductions').getFullList({
      sort: '-release_date,-created',
      filter: conditions.length > 0 ? conditions.join(' && ') : undefined,
      requestKey: null,
    })

    return records.map((r) => ({
      id: r.id,
      company: r.company || 'Gran Romano / Jetro Matriz',
      branch: r.branch || 'Matriz',
      beneficiary_id: r.beneficiary_id,
      beneficiary_code: r.beneficiary_code,
      beneficiary_name: r.beneficiary_name,
      beneficiary_cpf_cnpj: r.beneficiary_cpf_cnpj,
      role_name: r.role_name,
      competencia: r.competencia,
      release_date: r.release_date,
      deduction_type: r.deduction_type,
      reason: r.reason,
      description: r.description,
      amount: Number(r.amount || 0),
      order_number: r.order_number,
      order_id: r.order_id,
      invoice_number: r.invoice_number,
      invoice_id: r.invoice_id,
      client_name: r.client_name,
      client_id: r.client_id,
      devolution_id: r.devolution_id,
      devolution_number: r.devolution_number,
      observations: r.observations,
      attachments: r.attachments || [],
      responsible_user_id: r.responsible_user_id,
      responsible_user_name: r.responsible_user_name,
      status: r.status as StatusLancamento,
      approved_by_id: r.approved_by_id,
      approved_by_name: r.approved_by_name,
      approved_at: r.approved_at,
      rejected_by_id: r.rejected_by_id,
      rejected_by_name: r.rejected_by_name,
      rejected_at: r.rejected_at,
      cancelled_by_id: r.cancelled_by_id,
      cancelled_by_name: r.cancelled_by_name,
      cancelled_at: r.cancelled_at,
      justification: r.justification,
      history: r.history || [],
      hash_duplicidade: r.hash_duplicidade,
      created: r.created,
      updated: r.updated,
    }))
  } catch (err) {
    console.error('Erro ao listar deduções:', err)
    return []
  }
}

export async function criarDeducao(
  data: Partial<CommissionDeduction>,
  files?: File[],
): Promise<CommissionDeduction> {
  const formData = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null && k !== 'attachments' && k !== 'history') {
      formData.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v))
    }
  })
  if (files && files.length > 0) {
    files.forEach((f) => formData.append('attachments', f))
  }

  const rec = await pb.collection('commission_deductions').create(formData)
  return rec as unknown as CommissionDeduction
}

export async function atualizarDeducao(
  id: string,
  data: Partial<CommissionDeduction>,
): Promise<CommissionDeduction> {
  const rec = await pb.collection('commission_deductions').update(id, data)
  return rec as unknown as CommissionDeduction
}

export async function excluirDeducao(id: string): Promise<void> {
  await pb.collection('commission_deductions').delete(id)
}

export async function atualizarStatusDeducao(
  deductionId: string,
  newStatus: StatusLancamento,
  justificativa?: string,
): Promise<void> {
  await pb.send('/backend/v1/comissao/descontos/status-update', {
    method: 'POST',
    body: {
      deduction_id: deductionId,
      new_status: newStatus,
      justificativa: justificativa || '',
    },
  })
}

// -------------------------------------------------------------
// VERIFICAÇÃO DE DEVOLUÇÃO JÁ ESTORNADA NA COMISSÃO ANALÍTICA
// -------------------------------------------------------------
export async function verificarDevolucaoEstornada(params: {
  devolution_id?: string
  invoice_number?: string
  order_number?: string
  competencia?: string
  beneficiary_code?: string
}): Promise<{ bloqueado: boolean; estornadoAutomaticamente: boolean; motivo: string }> {
  try {
    const res = await pb.send('/backend/v1/comissao/verificar-devolucao-estornada', {
      method: 'POST',
      body: params,
    })
    return res as { bloqueado: boolean; estornadoAutomaticamente: boolean; motivo: string }
  } catch (err: unknown) {
    console.warn('Erro ao verificar devolução:', err)
    return {
      bloqueado: false,
      estornadoAutomaticamente: false,
      motivo: 'Verificação offline.',
    }
  }
}
