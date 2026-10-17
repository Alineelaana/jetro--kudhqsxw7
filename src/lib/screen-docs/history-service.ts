import { pb } from '@/lib/pocketbase/client'
import type { ScreenDocEntry, ScreenDocHistoryRecord } from './types'

/**
 * Registra uma alteração documental na coleção PocketBase `screen_doc_history`.
 */
export async function recordScreenDocHistory(
  item: Omit<ScreenDocHistoryRecord, 'id' | 'created' | 'updated'>,
): Promise<ScreenDocHistoryRecord | null> {
  try {
    const res = await pb.collection('screen_doc_history').create({
      screen_route: item.screen_route,
      screen_title: item.screen_title,
      module_group: item.module_group,
      changed_item: item.changed_item,
      description: item.description,
      previous_version: item.previous_version || '',
      current_version: item.current_version,
      update_origin: item.update_origin || 'Publicação inicial da documentação',
      author: item.author || 'Sistema / Equipe de Engenharia Jetro',
    })
    return res as unknown as ScreenDocHistoryRecord
  } catch (err) {
    console.warn('Falha ao registrar histórico de documentação:', err)
    return null
  }
}

/**
 * Busca o histórico de alterações para uma tela específica pela rota.
 */
export async function getScreenDocHistory(route: string): Promise<ScreenDocHistoryRecord[]> {
  try {
    const records = await pb.collection('screen_doc_history').getList(1, 100, {
      filter: `screen_route = "${route}"`,
      sort: '-created',
    })
    return records.items as unknown as ScreenDocHistoryRecord[]
  } catch (err) {
    console.warn('Falha ao buscar histórico de documentação da rota:', route, err)
    return []
  }
}

/**
 * Busca todo o histórico consolidado de alterações documentais do sistema.
 */
export async function getAllScreenDocHistory(limit = 200): Promise<ScreenDocHistoryRecord[]> {
  try {
    const records = await pb.collection('screen_doc_history').getList(1, limit, {
      sort: '-created',
    })
    return records.items as unknown as ScreenDocHistoryRecord[]
  } catch (err) {
    console.warn('Falha ao buscar histórico geral de documentação:', err)
    return []
  }
}

/**
 * Inicialização idempotente: registra a publicação inicial (1.0.0) de cada tela
 * caso ainda não exista registro para ela na coleção `screen_doc_history`.
 */
export async function ensureInitialDocHistoryPublished(entries: ScreenDocEntry[]): Promise<void> {
  if (!pb.authStore.isValid) return

  try {
    const existing = await pb.collection('screen_doc_history').getFullList({
      fields: 'screen_route,current_version',
    })
    const existingRoutes = new Set(
      existing.filter((r) => r.current_version === '1.0.0').map((r) => r.screen_route),
    )

    for (const entry of entries) {
      if (!existingRoutes.has(entry.route)) {
        await recordScreenDocHistory({
          screen_route: entry.route,
          screen_title: entry.title,
          module_group: entry.moduleGroup,
          changed_item: 'Documentação Completa da Tela (9 tópicos)',
          description: `Publicação da especificação técnica declarativa da tela ${entry.title} (${entry.route}).`,
          previous_version: '',
          current_version: entry.docVersion,
          update_origin: 'Publicação inicial da documentação',
          author: entry.author || 'Equipe Jetro',
        })
      }
    }
  } catch (err) {
    console.warn('Falha ao inicializar histórico documental:', err)
  }
}
