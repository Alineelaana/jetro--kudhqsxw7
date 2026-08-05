import pb from '@/lib/pocketbase/client'
import type {
  AtendimentoRecord,
  MotivoRecord,
  SetorRecord,
  FluxoRecord,
  FluxoEtapaRecord,
  StageStatusRecord,
  HistoricoRecord,
} from '@/lib/atendimento-types'

export const getAtendimentos = (filter?: string) =>
  pb.collection('service_centers').getFullList({ sort: '-created', filter }) as Promise<
    AtendimentoRecord[]
  >
export const getAtendimento = (id: string) =>
  pb.collection('service_centers').getOne(id) as Promise<AtendimentoRecord>
export const createAtendimento = (data: Record<string, unknown>) =>
  pb.collection('service_centers').create(data) as Promise<AtendimentoRecord>
export const updateAtendimento = (id: string, data: Record<string, unknown>) =>
  pb.collection('service_centers').update(id, data) as Promise<AtendimentoRecord>

export const getMotivos = () =>
  pb.collection('atendimento_motivos').getFullList({ sort: 'nome' }) as Promise<MotivoRecord[]>
export const createMotivo = (data: Record<string, unknown>) =>
  pb.collection('atendimento_motivos').create(data) as Promise<MotivoRecord>
export const updateMotivo = (id: string, data: Record<string, unknown>) =>
  pb.collection('atendimento_motivos').update(id, data) as Promise<MotivoRecord>
export const deleteMotivo = (id: string) => pb.collection('atendimento_motivos').delete(id)

export const getSetores = () =>
  pb.collection('atendimento_setores').getFullList({ sort: 'nome' }) as Promise<SetorRecord[]>
export const createSetor = (data: Record<string, unknown>) =>
  pb.collection('atendimento_setores').create(data) as Promise<SetorRecord>
export const updateSetor = (id: string, data: Record<string, unknown>) =>
  pb.collection('atendimento_setores').update(id, data) as Promise<SetorRecord>
export const deleteSetor = (id: string) => pb.collection('atendimento_setores').delete(id)

export const getFluxos = () =>
  pb.collection('fluxos_inteligentes').getFullList({ sort: '-created' }) as Promise<FluxoRecord[]>
export const createFluxo = (data: Record<string, unknown>) =>
  pb.collection('fluxos_inteligentes').create(data) as Promise<FluxoRecord>
export const updateFluxo = (id: string, data: Record<string, unknown>) =>
  pb.collection('fluxos_inteligentes').update(id, data) as Promise<FluxoRecord>
export const deleteFluxo = (id: string) => pb.collection('fluxos_inteligentes').delete(id)

export const getEtapas = (fluxoId: string) =>
  pb
    .collection('fluxo_etapas')
    .getFullList({ filter: `fluxo_id = "${fluxoId}"`, sort: 'ordem' }) as Promise<
    FluxoEtapaRecord[]
  >
export const createEtapa = (data: Record<string, unknown>) =>
  pb.collection('fluxo_etapas').create(data) as Promise<FluxoEtapaRecord>
export const updateEtapa = (id: string, data: Record<string, unknown>) =>
  pb.collection('fluxo_etapas').update(id, data) as Promise<FluxoEtapaRecord>
export const deleteEtapa = (id: string) => pb.collection('fluxo_etapas').delete(id)

export const getStageStatuses = (atendimentoId: string) =>
  pb
    .collection('fluxo_etapa_status')
    .getFullList({ filter: `atendimento_id = "${atendimentoId}"` }) as Promise<StageStatusRecord[]>

export const getHistorico = (atendimentoId: string) =>
  pb
    .collection('atendimento_historico')
    .getFullList({ filter: `atendimento_id = "${atendimentoId}"`, sort: 'data_hora' }) as Promise<
    HistoricoRecord[]
  >

export async function searchCustomers(query: string) {
  if (!query.trim()) return []
  const q = query.trim().replace(/"/g, '\\"')
  const filter = `cpf ~ "${q}" || cnpj ~ "${q}" || full_name ~ "${q}" || company_name ~ "${q}" || phone ~ "${q}" || email ~ "${q}"`
  try {
    const result = await pb.collection('partners').getList(1, 10, { filter })
    return result.items
  } catch {
    return []
  }
}

export async function searchOrders(query: string) {
  if (!query.trim()) return []
  const q = query.trim().replace(/"/g, '\\"')
  try {
    const orders = await pb.collection('sales_orders').getList(1, 10, {
      filter: `order_number ~ "${q}" || client_name ~ "${q}"`,
    })
    return orders.items
  } catch {
    return []
  }
}

export async function searchInvoices(query: string) {
  if (!query.trim()) return []
  const q = query.trim().replace(/"/g, '\\"')
  try {
    const invoices = await pb.collection('nfe_records').getList(1, 10, {
      filter: `nfe_number ~ "${q}" || client_name ~ "${q}"`,
    })
    return invoices.items
  } catch {
    return []
  }
}

export function classifyWithAI(atendimentoId: string) {
  return pb.send('/backend/v1/atendimento/classify-ai', {
    method: 'POST',
    body: JSON.stringify({ atendimento_id: atendimentoId }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export function stageAction(stageStatusId: string, action: string, observacoes?: string) {
  return pb.send('/backend/v1/atendimento/stage-action', {
    method: 'POST',
    body: JSON.stringify({
      stage_status_id: stageStatusId,
      action,
      observacoes: observacoes || '',
    }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export function getClientMessages(atendimentoId: string) {
  return pb.send(`/backend/v1/atendimento/${atendimentoId}/client-messages`, { method: 'GET' })
}

export function getAtendimentoStats() {
  return Promise.all([
    pb.collection('service_centers').count('status = "Aberto"'),
    pb.collection('service_centers').count('status = "Em Atendimento"'),
    pb
      .collection('service_centers')
      .count(
        'status = "Aguardando Atendimento" || status = "Aguardando Cliente" || status = "Aguardando Outro Setor"',
      ),
    pb.collection('service_centers').count('status = "Finalizado"'),
    pb
      .collection('service_centers')
      .count(
        'status != "Finalizado" && status != "Cancelado" && status != "Resolvido" && sla_cumprido = false',
      ),
    pb
      .collection('service_centers')
      .count(
        'status != "Finalizado" && status != "Cancelado" && status != "Resolvido" && sla_cumprido = true',
      ),
  ])
    .then(([abertos, emAtendimento, pendentes, finalizados, slaVencido, slaDentro]) => ({
      abertos,
      emAtendimento,
      pendentes,
      finalizados,
      slaVencido,
      slaDentro,
    }))
    .catch(() => ({
      abertos: 0,
      emAtendimento: 0,
      pendentes: 0,
      finalizados: 0,
      slaVencido: 0,
      slaDentro: 0,
    }))
}
