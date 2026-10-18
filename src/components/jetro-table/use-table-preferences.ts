import { useState, useEffect, useRef, useCallback } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { type TableUserPreferences, type JetroColumnDef, type SortState } from './types'

const PREFS_COLLECTION = 'user_table_preferences'
const LOCAL_STORAGE_PREFIX = 'jetro_table_prefs_'
const PREFS_VERSION = 1
const DEBOUNCE_MS = 600

export function getDefaultPreferences<T>(columns: JetroColumnDef<T>[]): TableUserPreferences {
  const columnOrder = columns.map((c) => c.id)
  const columnWidths: Record<string, number> = {}
  const columnVisibility: Record<string, boolean> = {}

  for (const c of columns) {
    if (c.defaultWidth) {
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
 * sem estragar a customização do usuário.
 */
export function mergePreferencesWithColumns<T>(
  saved: Partial<TableUserPreferences> | null | undefined,
  columns: JetroColumnDef<T>[],
): TableUserPreferences {
  const defaults = getDefaultPreferences(columns)
  if (!saved) return defaults

  const availableIds = new Set(columns.map((c) => c.id))

  // Preserva a ordem salva para as colunas existentes, e adiciona novas no final
  const savedOrder = (saved.columnOrder || []).filter((id) => availableIds.has(id))
  for (const col of columns) {
    if (!savedOrder.includes(col.id)) {
      savedOrder.push(col.id)
    }
  }

  // Mescla larguras
  const columnWidths: Record<string, number> = { ...defaults.columnWidths }
  if (saved.columnWidths) {
    for (const [id, w] of Object.entries(saved.columnWidths)) {
      if (availableIds.has(id) && typeof w === 'number' && w >= 40) {
        columnWidths[id] = w
      }
    }
  }

  // Mescla visibilidade
  const columnVisibility: Record<string, boolean> = { ...defaults.columnVisibility }
  if (saved.columnVisibility) {
    for (const [id, v] of Object.entries(saved.columnVisibility)) {
      if (availableIds.has(id) && typeof v === 'boolean') {
        columnVisibility[id] = v
      }
    }
  }

  // Ordenação salva
  let sorting: SortState | null = null
  if (saved.sorting && availableIds.has(saved.sorting.columnId)) {
    sorting = saved.sorting
  }

  return {
    version: PREFS_VERSION,
    columnOrder: savedOrder,
    columnWidths,
    columnVisibility,
    sorting,
  }
}

export function useTablePreferences<T>(screenId: string, columns: JetroColumnDef<T>[]) {
  const { user } = useAuth()
  const userId = user?.id || ''
  const storageKey = `${LOCAL_STORAGE_PREFIX}${screenId}_${userId || 'guest'}`

  const [preferences, setPreferences] = useState<TableUserPreferences>(() => {
    // 1. Tenta carregar do localStorage de imediato para não piscar a interface
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        return mergePreferencesWithColumns(parsed, columns)
      }
    } catch {
      /* ignore */
    }
    return getDefaultPreferences(columns)
  })

  const [recordId, setRecordId] = useState<string | null>(null)
  const [loadedFromBackend, setLoadedFromBackend] = useState(false)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const columnsRef = useRef(columns)
  columnsRef.current = columns

  // Carregar do PocketBase quando o usuário/screenId estiver disponível
  useEffect(() => {
    let active = true
    if (!userId || !screenId) return

    async function loadBackendPrefs() {
      try {
        const records = await pb.collection(PREFS_COLLECTION).getList(1, 1, {
          filter: `user = "${userId}" && screen_id = "${screenId}"`,
        })

        if (!active) return

        if (records.items.length > 0) {
          const rec = records.items[0]
          setRecordId(rec.id)
          const savedData = rec.preferences as Partial<TableUserPreferences>
          const merged = mergePreferencesWithColumns(savedData, columnsRef.current)
          setPreferences(merged)
          try {
            localStorage.setItem(storageKey, JSON.stringify(merged))
          } catch {
            /* intentionally ignored */
          }
        }
      } catch (err) {
        // Se a coleção ainda não existe ou o usuário está offline, fallback suave no localStorage
        console.warn('[useTablePreferences] Erro ao carregar preferências remotas:', err)
      } finally {
        if (active) setLoadedFromBackend(true)
      }
    }

    loadBackendPrefs()

    return () => {
      active = false
    }
  }, [screenId, userId, storageKey])

  // Salvar preferências (local imediato, remoto com debounce)
  const savePreferences = useCallback(
    (newPrefs: TableUserPreferences | ((prev: TableUserPreferences) => TableUserPreferences)) => {
      setPreferences((prev) => {
        const resolved = typeof newPrefs === 'function' ? newPrefs(prev) : newPrefs

        // Salva local imediato
        try {
          localStorage.setItem(storageKey, JSON.stringify(resolved))
        } catch {
          /* intentionally ignored */
        }

        // Envia ao PocketBase com debounce
        if (userId && screenId) {
          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
          }

          debounceTimerRef.current = setTimeout(async () => {
            try {
              if (recordId) {
                await pb.collection(PREFS_COLLECTION).update(recordId, {
                  preferences: resolved,
                })
              } else {
                // Tenta buscar se outro processo criou ou cria novo
                const existing = await pb.collection(PREFS_COLLECTION).getList(1, 1, {
                  filter: `user = "${userId}" && screen_id = "${screenId}"`,
                })
                if (existing.items.length > 0) {
                  setRecordId(existing.items[0].id)
                  await pb.collection(PREFS_COLLECTION).update(existing.items[0].id, {
                    preferences: resolved,
                  })
                } else {
                  const created = await pb.collection(PREFS_COLLECTION).create({
                    user: userId,
                    screen_id: screenId,
                    preferences: resolved,
                  })
                  setRecordId(created.id)
                }
              }
            } catch (err) {
              console.warn('[useTablePreferences] Falha ao persistir preferências no backend:', err)
            }
          }, DEBOUNCE_MS)
        }

        return resolved
      })
    },
    [screenId, userId, storageKey, recordId],
  )

  // Restaurar padrão original
  const restoreDefaults = useCallback(async () => {
    const defaults = getDefaultPreferences(columnsRef.current)
    setPreferences(defaults)
    try {
      localStorage.removeItem(storageKey)
    } catch {
      /* intentionally ignored */
    }

    if (userId && recordId) {
      try {
        await pb.collection(PREFS_COLLECTION).delete(recordId)
        setRecordId(null)
      } catch (err) {
        console.warn('[useTablePreferences] Erro ao remover preferências do backend:', err)
      }
    }
  }, [recordId, storageKey, userId])

  return {
    preferences,
    savePreferences,
    restoreDefaults,
    loadedFromBackend,
  }
}
