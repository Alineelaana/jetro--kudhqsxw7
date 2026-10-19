import { useState, useEffect, useRef, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { type TableUserPreferences, type JetroColumnDef, type SortState } from './types'

const PREFS_COLLECTION = 'user_table_preferences'
const LOCAL_STORAGE_PREFIX = 'jetro_table_prefs_'
const PREFS_VERSION = 1
const DEBOUNCE_MS = 600

export function getDefaultPreferences<T>(
  columns?: JetroColumnDef<T>[] | null,
): TableUserPreferences {
  const safeColumns = Array.isArray(columns) ? columns : []
  const columnOrder: string[] = []
  const columnWidths: Record<string, number> = {}
  const columnVisibility: Record<string, boolean> = {}

  for (const c of safeColumns) {
    if (!c || !c.id) continue
    columnOrder.push(c.id)
    if (typeof c.defaultWidth === 'number' && c.defaultWidth >= 20) {
      columnWidths[c.id] = c.defaultWidth
    }
    columnVisibility[c.id] = c.defaultVisible !== false
  }

  return {
    version: PREFS_VERSION,
    columnOrder,
    columnWidths,
    columnVisibility,
    sorting: null,
  }
}

/**
 * Mescla preferências salvas com as colunas atualmente definidas no código:
 * Garante que novas colunas adicionadas no código apareçam e colunas removidas sejam descartadas
 * sem estragar a customização do usuário. Totalmente imune a valores nulos, inválidos ou corrompidos.
 */
export function mergePreferencesWithColumns<T>(
  saved: unknown,
  columns?: JetroColumnDef<T>[] | null,
): TableUserPreferences {
  const safeColumns = Array.isArray(columns) ? columns : []
  const defaults = getDefaultPreferences(safeColumns)

  if (!saved || typeof saved !== 'object') return defaults

  try {
    const raw = saved as Partial<TableUserPreferences>
    const availableIds = new Set(safeColumns.map((c) => c?.id).filter(Boolean) as string[])

    // Preserva a ordem salva para as colunas existentes, e adiciona novas no final
    const rawOrder = Array.isArray(raw.columnOrder) ? raw.columnOrder : []
    const savedOrder = rawOrder.filter((id) => typeof id === 'string' && availableIds.has(id))
    for (const col of safeColumns) {
      if (col?.id && !savedOrder.includes(col.id)) {
        savedOrder.push(col.id)
      }
    }

    // Mescla larguras
    const columnWidths: Record<string, number> = { ...defaults.columnWidths }
    if (raw.columnWidths && typeof raw.columnWidths === 'object') {
      for (const [id, w] of Object.entries(raw.columnWidths)) {
        if (availableIds.has(id) && typeof w === 'number' && !isNaN(w) && w >= 20 && w <= 2000) {
          columnWidths[id] = w
        }
      }
    }

    // Mescla visibilidade
    const columnVisibility: Record<string, boolean> = { ...defaults.columnVisibility }
    if (raw.columnVisibility && typeof raw.columnVisibility === 'object') {
      for (const [id, v] of Object.entries(raw.columnVisibility)) {
        if (availableIds.has(id) && typeof v === 'boolean') {
          columnVisibility[id] = v
        }
      }
    }

    // Ordenação salva
    let sorting: SortState | null = null
    if (
      raw.sorting &&
      typeof raw.sorting === 'object' &&
      typeof raw.sorting.columnId === 'string' &&
      availableIds.has(raw.sorting.columnId) &&
      (raw.sorting.direction === 'asc' || raw.sorting.direction === 'desc')
    ) {
      sorting = {
        columnId: raw.sorting.columnId,
        direction: raw.sorting.direction,
      }
    }

    return {
      version: PREFS_VERSION,
      columnOrder: savedOrder.length > 0 ? savedOrder : defaults.columnOrder,
      columnWidths,
      columnVisibility,
      sorting,
    }
  } catch (err) {
    console.warn('[mergePreferencesWithColumns] Erro de merge, retornando padrão seguro:', err)
    return defaults
  }
}

export function useTablePreferences<T>(screenId: string, columns: JetroColumnDef<T>[]) {
  const { user } = useAuth()
  const userId = user?.id || ''
  const storageKey = `${LOCAL_STORAGE_PREFIX}${screenId}_${userId || 'guest'}`

  const [preferences, setPreferences] = useState<TableUserPreferences>(() => {
    // 1. Tenta carregar do localStorage de imediato para não piscar a interface
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(storageKey)
        if (raw) {
          const parsed = JSON.parse(raw)
          return mergePreferencesWithColumns(parsed, columns)
        }
      }
    } catch (err) {
      console.warn('[useTablePreferences] Falha ao ler localStorage (degradando para padrão):', err)
    }
    return getDefaultPreferences(columns)
  })

  const [recordId, setRecordId] = useState<string | null>(null)
  const [loadedFromBackend, setLoadedFromBackend] = useState(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const columnsRef = useRef(columns)
  columnsRef.current = columns

  // Limpa timer ao desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Carregar do PocketBase quando o usuário/screenId estiver disponível
  useEffect(() => {
    let active = true
    if (!userId || !screenId) {
      setLoadedFromBackend(true)
      return
    }

    async function loadBackendPrefs() {
      try {
        // Escapar aspas duplas no filtro para evitar quebra de sintaxe
        const safeUserId = String(userId).replace(/"/g, '\\"')
        const safeScreenId = String(screenId).replace(/"/g, '\\"')

        const records = await pb.collection(PREFS_COLLECTION).getList(1, 1, {
          filter: `user = "${safeUserId}" && screen_id = "${safeScreenId}"`,
          requestKey: null, // Evita auto-cancelamento ruidoso
        })

        if (!active) return

        if (records && Array.isArray(records.items) && records.items.length > 0) {
          const rec = records.items[0]
          if (rec && rec.id) {
            setRecordId(rec.id)
            const savedData = rec.preferences
            const merged = mergePreferencesWithColumns(savedData, columnsRef.current)
            setPreferences(merged)
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(storageKey, JSON.stringify(merged))
              }
            } catch {
              /* ignore localStorage write error silently */
            }
          }
        }
      } catch (err) {
        // Falhas remotas (coleção não existe, 404, offline, 403, etc.) nunca derrubam a tela
        console.warn(
          '[useTablePreferences] Erro ao carregar preferências remotas (usando fallback seguro):',
          err,
        )
      } finally {
        if (active) setLoadedFromBackend(true)
      }
    }

    loadBackendPrefs()

    return () => {
      active = false
    }
  }, [screenId, userId, storageKey])

  // Salvar preferências (local imediato, remoto com debounce — nunca throw)
  const savePreferences = useCallback(
    (newPrefs: TableUserPreferences | ((prev: TableUserPreferences) => TableUserPreferences)) => {
      setPreferences((prev) => {
        let resolved: TableUserPreferences
        try {
          resolved = typeof newPrefs === 'function' ? newPrefs(prev) : newPrefs
          if (!resolved || typeof resolved !== 'object') {
            resolved = prev
          }
        } catch (err) {
          console.warn('[useTablePreferences] Erro ao resolver novo estado de preferências:', err)
          return prev
        }

        // Salva local imediato
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(storageKey, JSON.stringify(resolved))
          }
        } catch {
          /* intentionally ignored */
        }

        // Envia ao PocketBase com debounce — qualquer falha tratada em silêncio logado
        if (userId && screenId) {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
          }

          const currentRecId = recordId
          const safeUserId = String(userId).replace(/"/g, '\\"')
          const safeScreenId = String(screenId).replace(/"/g, '\\"')

          debounceTimerRef.current = setTimeout(async () => {
            try {
              if (currentRecId) {
                await pb
                  .collection(PREFS_COLLECTION)
                  .update(currentRecId, { preferences: resolved }, { requestKey: null })
              } else {
                // Tenta buscar se outro processo criou ou cria novo
                const existing = await pb.collection(PREFS_COLLECTION).getList(1, 1, {
                  filter: `user = "${safeUserId}" && screen_id = "${safeScreenId}"`,
                  requestKey: null,
                })
                if (existing && Array.isArray(existing.items) && existing.items.length > 0) {
                  const exRec = existing.items[0]
                  setRecordId(exRec.id)
                  await pb
                    .collection(PREFS_COLLECTION)
                    .update(exRec.id, { preferences: resolved }, { requestKey: null })
                } else {
                  const created = await pb.collection(PREFS_COLLECTION).create(
                    {
                      user: userId,
                      screen_id: screenId,
                      preferences: resolved,
                    },
                    { requestKey: null },
                  )
                  if (created && created.id) {
                    setRecordId(created.id)
                  }
                }
              }
            } catch (err) {
              // Silencioso para o usuário — registro apenas no console técnico
              console.warn(
                '[useTablePreferences] Falha suave ao persistir preferências no backend:',
                err,
              )
            }
          }, DEBOUNCE_MS)
        }

        return resolved
      })
    },
    [screenId, userId, storageKey, recordId],
  )

  // Restaurar padrão original — nunca throw
  const restoreDefaults = useCallback(async () => {
    try {
      const defaults = getDefaultPreferences(columnsRef.current)
      setPreferences(defaults)
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem(storageKey)
        }
      } catch {
        /* intentionally ignored */
      }

      if (userId && recordId) {
        try {
          await pb.collection(PREFS_COLLECTION).delete(recordId, { requestKey: null })
          setRecordId(null)
        } catch (err) {
          console.warn('[useTablePreferences] Falha suave ao remover preferências do backend:', err)
        }
      }
    } catch (err) {
      console.warn('[useTablePreferences] Erro em restoreDefaults:', err)
    }
  }, [recordId, storageKey, userId])

  return {
    preferences,
    savePreferences,
    restoreDefaults,
    loadedFromBackend,
  }
}
