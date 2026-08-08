import pb from '@/lib/pocketbase/client'

export async function getClientTimeline(cliente: string): Promise<any[]> {
  try {
    const record = await pb
      .collection('financial_collections')
      .getFirstListItem(`cliente = "${cliente}"`)
    return record.historico || []
  } catch {
    return []
  }
}

export async function getBlockedOrders(cliente: string): Promise<any[]> {
  try {
    return await pb.collection('sales_orders').getFullList({
      filter: `client_name = "${cliente}" && status = "Bloqueado"`,
      sort: '-created',
    })
  } catch {
    return []
  }
}

export async function getRecentOrders(cliente: string): Promise<any[]> {
  try {
    return await pb.collection('sales_orders').getFullList({
      filter: `client_name = "${cliente}"`,
      sort: '-created',
    })
  } catch {
    return []
  }
}

export async function getBoletosByClient(cliente: string): Promise<any[]> {
  try {
    return await pb.collection('financial_boletos').getFullList({
      filter: `cliente = "${cliente}"`,
      sort: '-created',
    })
  } catch {
    return []
  }
}

export async function getPixByClient(cliente: string): Promise<any[]> {
  try {
    return await pb.collection('financial_pix').getFullList({
      filter: `cliente = "${cliente}"`,
      sort: '-created',
    })
  } catch {
    return []
  }
}

export async function logAuditEntry(data: Record<string, unknown>) {
  const user = pb.authStore.record as any
  try {
    await pb.collection('audit_logs').create({
      user_id: user?.id || '',
      user_name: user?.name || '',
      user_role: user?.role || '',
      module: 'Financeiro',
      origem: 'Área da Empresa',
      ...data,
    })
  } catch {
    /* best-effort */
  }
}

export function exportCarteiraCsv(items: any[]): string {
  const headers = [
    'Cliente',
    'Valor Vencido',
    'Dias Atraso',
    'Qtd Titulos',
    'Risco',
    'Prioridade',
    'Ultimo Contato',
    'Proxima Acao',
  ]
  const rows = items.map((i) => [
    i.cliente,
    i.valorVencido.toFixed(2),
    String(i.diasAtraso),
    String(i.quantidadeTitulos),
    i.risco,
    i.prioridade,
    i.ultimoContato || '',
    i.proximaAcao || '',
  ])
  return [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
}

export function exportClientCsv(client: any): string {
  const headers = ['Titulo', 'Vencimento', 'Dias', 'Valor Original', 'Recebido', 'Saldo', 'Status']
  const rows = (client?.receivables || []).map((r: any) => {
    const saldo = parseFloat(r.valor_original || '0') - parseFloat(r.valor_recebido || '0')
    const dias = Math.max(
      0,
      Math.floor((Date.now() - new Date(r.data_vencimento).getTime()) / 86400000),
    )
    return [
      r.numero_titulo || '',
      r.data_vencimento || '',
      String(dias),
      r.valor_original || '0',
      r.valor_recebido || '0',
      saldo.toFixed(2),
      r.status || '',
    ]
  })
  return [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function submitNegotiation(
  cliente: string,
  negotiation: Record<string, unknown>,
  withinAlcada: boolean,
) {
  const user = pb.authStore.record as any
  if (withinAlcada) {
    try {
      const record = await pb
        .collection('financial_collections')
        .getFirstListItem(`cliente = "${cliente}"`)
      const entry = {
        user: user?.name || 'Sistema',
        action: 'negotiation',
        date: new Date().toISOString(),
        ...negotiation,
      }
      return pb.collection('financial_collections').update(record.id, {
        negotiations_log: [...(record.negotiations_log || []), entry],
        historico: [...(record.historico || []), entry],
        status: 'Negociação',
      })
    } catch {
      return null
    }
  } else {
    return pb.collection('financial_approvals').create({
      tipo_solicitacao: 'Desconto em Negociação',
      solicitante: user?.name || '',
      status: 'Pendente',
      empresa: user?.empresa_id || '',
      filial: user?.filial_id || '',
      valor: String(negotiation.negotiatedValue || ''),
      motivo: `Desconto ${negotiation.discountPercent}% - ${negotiation.observation || ''}`,
      documento_relacionado: `Cobrança: ${cliente}`,
    })
  }
}
