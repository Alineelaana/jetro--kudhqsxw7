import pb from '@/lib/pocketbase/client'
import type { EnhancedPriceTable } from '@/lib/price-table-types'

export async function getPriceTablesList(): Promise<EnhancedPriceTable[]> {
  return pb.collection('price_tables').getFullList({ sort: '-updated' })
}

export async function getPriceTable(id: string): Promise<EnhancedPriceTable> {
  return pb.collection('price_tables').getOne(id)
}

export async function getActivePriceTables(): Promise<EnhancedPriceTable[]> {
  return pb.collection('price_tables').getFullList({
    filter: 'status = "ativa"',
    sort: '-prioridade',
  })
}

export async function createPriceTableRecord(
  data: Record<string, unknown>,
): Promise<EnhancedPriceTable> {
  return pb.collection('price_tables').create(data)
}

export async function updatePriceTableRecord(
  id: string,
  data: Record<string, unknown>,
): Promise<EnhancedPriceTable> {
  return pb.collection('price_tables').update(id, data)
}

export async function duplicatePriceTable(
  id: string,
  newName: string,
  newStartDate: string,
  newEndDate: string,
): Promise<EnhancedPriceTable> {
  const original = await getPriceTable(id)
  const data: Record<string, unknown> = {
    table_name: newName,
    code: '',
    description: original.description || '',
    table_type: original.table_type,
    empresa: original.empresa || '',
    filial: original.filial || '',
    moeda: original.moeda || 'BRL',
    prioridade: original.prioridade || 0,
    tabela_base: original.tabela_base || '',
    percentual_ajuste: original.percentual_ajuste || '',
    status: 'rascunho',
    observacoes: original.observacoes || '',
    data_inicial: newStartDate,
    data_final: newEndDate,
    items: original.items || [],
    rules: original.rules || {},
    responsible_user: original.responsible_user || '',
    parent_table_id: original.id,
    active: false,
  }
  return pb.collection('price_tables').create(data)
}

export async function changeTableStatus(id: string, status: string): Promise<EnhancedPriceTable> {
  return pb.collection('price_tables').update(id, {
    status,
    active: status === 'ativa',
  })
}

export async function deletePriceTableRecord(id: string): Promise<void> {
  await pb.collection('price_tables').delete(id)
}
