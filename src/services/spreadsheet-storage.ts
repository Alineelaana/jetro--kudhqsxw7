import pb from '@/lib/pocketbase/client'
import type { WorkbookData, WorkbookRecord, WorkbookVersionRecord } from '@/types/spreadsheet'

/**
 * Carrega o snapshot mais recente do workbook pelo slug
 */
export async function getWorkbookBySlug(slug: string): Promise<WorkbookRecord | null> {
  try {
    const record = await pb
      .collection('planilhas_workbooks')
      .getFirstListItem<WorkbookRecord>(`slug = '${slug}'`)
    return record
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status
    if (status === 404) {
      return null
    }
    console.error(`Erro ao carregar workbook '${slug}':`, err)
    throw err
  }
}

export interface SaveWorkbookOptions {
  slug: string
  titulo: string
  workbookData: WorkbookData
  expectedVersion?: number // Para detecção de conflitos de concorrência
  authorId?: string
  authorName?: string
  authorEmail?: string
  changeSummary?: string
  isAutosave?: boolean
}

export interface SaveWorkbookResult {
  record: WorkbookRecord
  conflictDetected?: boolean
  serverVersion?: number
}

/**
 * Salva ou atualiza um workbook no PocketBase com versionamento e histórico
 */
export async function saveWorkbook(options: SaveWorkbookOptions): Promise<SaveWorkbookResult> {
  const {
    slug,
    titulo,
    workbookData,
    expectedVersion,
    authorId,
    authorName,
    authorEmail,
    changeSummary,
    isAutosave,
  } = options

  const existing = await getWorkbookBySlug(slug)

  if (existing) {
    // Verificação de concorrência otimista
    if (expectedVersion !== undefined && existing.version > expectedVersion) {
      return {
        record: existing,
        conflictDetected: true,
        serverVersion: existing.version,
      }
    }

    const nextVersion = existing.version + 1

    // 1. Atualiza registro principal
    const updated = await pb.collection('planilhas_workbooks').update<WorkbookRecord>(existing.id, {
      titulo,
      workbook_data: workbookData,
      version: nextVersion,
      updated_by_id: authorId || '',
      updated_by_name: authorName || 'Usuário Jetro',
      updated_by_email: authorEmail || '',
      change_summary:
        changeSummary || (isAutosave ? 'Salvamento automático' : 'Alterações manuais na grade'),
    })

    // 2. Cria histórico na coleção planilhas_versoes (apenas para salvamentos manuais ou marcos)
    if (!isAutosave || nextVersion % 5 === 0) {
      try {
        await pb.collection('planilhas_versoes').create({
          slug,
          version_number: nextVersion,
          workbook_data: workbookData,
          author_id: authorId || '',
          author_name: authorName || 'Usuário Jetro',
          description:
            changeSummary || (isAutosave ? 'Autosave periódico' : 'Versão salva pelo usuário'),
          origin: isAutosave ? 'autosave' : 'manual',
        })
      } catch (verErr) {
        console.warn('Não foi possível gravar histórico de versão:', verErr)
      }
    }

    return { record: updated }
  }

  // Criação inicial do workbook
  const created = await pb.collection('planilhas_workbooks').create<WorkbookRecord>({
    slug,
    titulo,
    workbook_data: workbookData,
    version: 1,
    updated_by_id: authorId || '',
    updated_by_name: authorName || 'Usuário Jetro',
    updated_by_email: authorEmail || '',
    change_summary: 'Criação inicial da planilha',
  })

  try {
    await pb.collection('planilhas_versoes').create({
      slug,
      version_number: 1,
      workbook_data: workbookData,
      author_id: authorId || '',
      author_name: authorName || 'Usuário Jetro',
      description: 'Versão inicial',
      origin: 'manual',
    })
  } catch (verErr) {
    console.warn('Erro ao criar histórico inicial:', verErr)
  }

  return { record: created }
}

/**
 * Recupera o histórico de versões salvas de uma planilha
 */
export async function getWorkbookVersions(slug: string): Promise<WorkbookVersionRecord[]> {
  try {
    const list = await pb.collection('planilhas_versoes').getFullList<WorkbookVersionRecord>({
      filter: `slug = '${slug}'`,
      sort: '-version_number',
    })
    return list
  } catch (err) {
    console.error('Erro ao listar versões:', err)
    return []
  }
}

/**
 * Restaura uma versão anterior de um workbook
 */
export async function restoreWorkbookVersion(
  slug: string,
  versionNumber: number,
  authorId?: string,
  authorName?: string,
): Promise<WorkbookRecord> {
  const targetVersion = await pb
    .collection('planilhas_versoes')
    .getFirstListItem<WorkbookVersionRecord>(
      `slug = '${slug}' && version_number = ${versionNumber}`,
    )

  const current = await getWorkbookBySlug(slug)
  const nextVersion = (current?.version || 0) + 1

  const updated = await pb.collection('planilhas_workbooks').update<WorkbookRecord>(current!.id, {
    workbook_data: targetVersion.workbook_data,
    version: nextVersion,
    updated_by_id: authorId || '',
    updated_by_name: authorName || 'Usuário Jetro',
    change_summary: `Restauração da versão #${versionNumber}`,
  })

  // Registra a restauração no histórico
  await pb.collection('planilhas_versoes').create({
    slug,
    version_number: nextVersion,
    workbook_data: targetVersion.workbook_data,
    author_id: authorId || '',
    author_name: authorName || 'Usuário Jetro',
    description: `Restaurado a partir da versão #${versionNumber}`,
    origin: 'rollback',
  })

  return updated
}
