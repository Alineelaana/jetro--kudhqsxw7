import pb from '@/lib/pocketbase/client'

// Service da tela Saldo FLEX (módulo FLEX do Avatar FV).
// Toda leitura/escrita passa pelos endpoints /backend/v1/flex/* do Huram,
// que são a fonte oficial do saldo — nunca calcular saldo no front-end.

export interface FlexAccount {
  id: string
  empresa_id: string
  filial_id: string
  rca_id: string
  rca_name: string
  gerente_id: string
  gerente_name: string
  equipe_id: string
  equipe_name: string
  balance: number
  reserved: number
  available: number
}

export interface FlexMovement {
  id: string
  type:
    | 'credito_gerado'
    | 'credito_liberado'
    | 'reserva'
    | 'flex_gasto'
    | 'liberacao_reserva'
    | 'estorno'
    | 'ajuste'
  status: 'efetivado' | 'reservado' | 'cancelado' | 'estornado'
  external_id: string
  empresa_id: string
  filial_id: string
  rca_id: string
  rca_name: string
  gerente_id: string
  gerente_name: string
  equipe_id: string
  equipe_name: string
  cliente_id: string
  cliente_name: string
  produto_id: string
  produto_descricao: string
  quantidade: number
  preco_base: number
  preco_negociado: number
  valor_flex: number
  charged_value: number
  pedido_fv: string
  pedido_huram: string
  nf: string
  integration_status: 'pendente' | 'concluida' | 'falha'
  link_type: string
  link_id: string
  reason: string
  balance_before: number
  balance_after: number
  reserved_before: number
  reserved_after: number
  created_by: string
  created: string
}

export type FlexMovementType = FlexMovement['type']

export const FLEX_TYPE_LABELS: Record<FlexMovementType, string> = {
  credito_gerado: 'Crédito gerado',
  credito_liberado: 'Crédito liberado',
  reserva: 'Reserva',
  flex_gasto: 'FLEX gasto',
  liberacao_reserva: 'Liberação de reserva',
  estorno: 'Estorno',
  ajuste: 'Ajuste',
}

export interface FlexFilters {
  dateFrom?: string
  dateTo?: string
  empresaId?: string
  filialId?: string
  rcaId?: string
  gerenteId?: string
  equipeId?: string
  clienteId?: string
  produtoId?: string
  pedido?: string
  nf?: string
  type?: FlexMovementType | ''
  integrationStatus?: string
  page?: number
  perPage?: number
}

function buildFilter(f: FlexFilters): string {
  const parts: string[] = []
  if (f.dateFrom) parts.push(`created >= '${f.dateFrom} 00:00:00.000Z'`)
  if (f.dateTo) parts.push(`created <= '${f.dateTo} 23:59:59.999Z'`)
  if (f.empresaId) parts.push(`empresa_id = '${f.empresaId}'`)
  if (f.filialId) parts.push(`filial_id = '${f.filialId}'`)
  if (f.rcaId) parts.push(`rca_id = '${f.rcaId}'`)
  if (f.gerenteId) parts.push(`gerente_id = '${f.gerenteId}'`)
  if (f.equipeId) parts.push(`equipe_id = '${f.equipeId}'`)
  if (f.clienteId)
    parts.push(`(cliente_id = '${f.clienteId}' || link_cliente_id = '${f.clienteId}')`)
  if (f.produtoId) parts.push(`produto_id = '${f.produtoId}'`)
  if (f.pedido) parts.push(`(pedido_fv ~ '${f.pedido}' || pedido_huram ~ '${f.pedido}')`)
  if (f.nf) parts.push(`nf ~ '${f.nf}'`)
  if (f.type) parts.push(`type = '${f.type}'`)
  if (f.integrationStatus) parts.push(`integration_status = '${f.integrationStatus}'`)
  return parts.join(' && ')
}

export const flexService = {
  /** Extrato paginado com TODOS os filtros da tela. */
  async listMovements(f: FlexFilters): Promise<{
    items: FlexMovement[]
    total: number
  }> {
    const res = await pb.collection('flex_movements').getList(f.page || 1, f.perPage || 50, {
      filter: buildFilter(f),
      sort: '-created',
    })
    return { items: res.items as unknown as FlexMovement[], total: res.totalItems }
  },

  /** Extrato completo (todas as páginas) — usado pelo relatório. */
  async listAllMovements(f: FlexFilters): Promise<FlexMovement[]> {
    const out: FlexMovement[] = []
    let page = 1
    for (;;) {
      const res = await pb
        .collection('flex_movements')
        .getList<FlexMovement>(page, 200, { filter: buildFilter(f), sort: '-created' })
      out.push(...(res.items as unknown as FlexMovement[]))
      if (out.length >= res.totalItems || res.items.length === 0) break
      page++
    }
    return out
  },

  /** Contas consolidadas por empresa+filial+RCA com saldo atual. */
  async listAccounts(f: {
    empresaId?: string
    filialId?: string
    rcaId?: string
  }): Promise<FlexAccount[]> {
    const parts: string[] = []
    if (f.empresaId) parts.push(`empresa_id = '${f.empresaId}'`)
    if (f.filialId) parts.push(`filial_id = '${f.filialId}'`)
    if (f.rcaId) parts.push(`rca_id = '${f.rcaId}'`)
    const res = await pb.collection('flex_accounts').getFullList({
      filter: parts.join(' && '),
      sort: 'rca_name',
    })
    return res as unknown as FlexAccount[]
  },

  /** Consulta de saldo por endpoint oficial. */
  async getBalance(empresaId: string, filialId: string, rcaId: string) {
    const qs = new URLSearchParams({ empresa_id: empresaId, filial_id: filialId, rca_id: rcaId })
    return pb.send<{ ok: boolean; balance: number; reserved: number; available: number }>(
      `/backend/v1/flex/balance?${qs.toString()}`,
      { method: 'GET' },
    )
  },

  /** Ajuste manual (restrito, exige motivo) — grava saldo antes/depois no ledger. */
  async adjust(input: {
    empresa_id: string
    filial_id: string
    rca_id: string
    valor: number
    motivo: string
    tipo: 'credito' | 'debito'
  }) {
    return pb.send<{ ok: boolean; balance_before: number; balance_after: number }>(
      '/backend/v1/flex/adjust',
      { method: 'POST', body: input },
    )
  },
}
