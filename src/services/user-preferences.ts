import pb from '@/lib/pocketbase/client'
import { type UserPreferences, DEFAULT_USER_PREFERENCES } from '@/types/user-preferences'

export const PREFS_COLLECTION = 'user_preferences'
export const LOCAL_STORAGE_PREFS_KEY = 'jetro_user_personalization_'

/**
 * Mescla preferências salvas com os padrões atuais (garantindo retrocompatibilidade).
 */
export function sanitizeUserPreferences(saved?: Partial<UserPreferences> | null): UserPreferences {
  if (!saved || typeof saved !== 'object') {
    return { ...DEFAULT_USER_PREFERENCES }
  }

  return {
    ...DEFAULT_USER_PREFERENCES,
    ...saved,
    // Garante tipos corretos
    theme: saved.theme === 'dark' || saved.theme === 'auto' ? saved.theme : 'light',
    highContrast: Boolean(saved.highContrast),
    animationsEnabled:
      saved.animationsEnabled !== undefined ? Boolean(saved.animationsEnabled) : true,
    fixHeader: saved.fixHeader !== undefined ? Boolean(saved.fixHeader) : true,
    fixFooter: saved.fixFooter !== undefined ? Boolean(saved.fixFooter) : true,
    sidebarExpanded: Boolean(saved.sidebarExpanded),
    sidebarWidth: saved.sidebarWidth === 'compact' ? 'compact' : 'normal',
    sidebarShowText: saved.sidebarShowText !== undefined ? Boolean(saved.sidebarShowText) : true,
    spacingDensity:
      saved.spacingDensity === 'compact' || saved.spacingDensity === 'spacious'
        ? saved.spacingDensity
        : 'comfortable',
    textSize:
      saved.textSize === 'compact' || saved.textSize === 'large' ? saved.textSize : 'normal',
    textScaleStep:
      typeof saved.textScaleStep === 'number' && Number.isFinite(saved.textScaleStep)
        ? Math.max(-2, Math.min(2, Math.round(saved.textScaleStep)))
        : 0,
    tableRowsPerPage: [10, 25, 50, 100].includes(Number(saved.tableRowsPerPage))
      ? (Number(saved.tableRowsPerPage) as 10 | 25 | 50 | 100)
      : 25,
    tableStripedRows: saved.tableStripedRows !== undefined ? Boolean(saved.tableStripedRows) : true,
    tableStickyHeader:
      saved.tableStickyHeader !== undefined ? Boolean(saved.tableStickyHeader) : true,
    tableDividers: saved.tableDividers !== undefined ? Boolean(saved.tableDividers) : true,
    tableDensity:
      saved.tableDensity === 'compact' || saved.tableDensity === 'spacious'
        ? saved.tableDensity
        : 'comfortable',
    reducedMotion: Boolean(saved.reducedMotion),
    focusHighlight: Boolean(saved.focusHighlight),
    largeTouchTargets: Boolean(saved.largeTouchTargets),
    jetroOnlineSuggestions:
      saved.jetroOnlineSuggestions !== undefined ? Boolean(saved.jetroOnlineSuggestions) : true,
    jetroOnlineTypingEffect:
      saved.jetroOnlineTypingEffect !== undefined ? Boolean(saved.jetroOnlineTypingEffect) : true,
    jetroOnlineResponseMode: saved.jetroOnlineResponseMode === 'compact' ? 'compact' : 'detailed',
    jetroOnlineVisualNotifications:
      saved.jetroOnlineVisualNotifications !== undefined
        ? Boolean(saved.jetroOnlineVisualNotifications)
        : true,
    timezone: saved.timezone || saved.fuso_horario || DEFAULT_USER_PREFERENCES.timezone,
    fuso_horario: saved.fuso_horario || saved.timezone || DEFAULT_USER_PREFERENCES.fuso_horario,
    tratamento:
      saved.tratamento === 'masculino' || saved.tratamento === 'feminino'
        ? saved.tratamento
        : 'neutro',
  }
}

/**
 * Lê do localStorage rápido.
 */
export function getLocalPreferences(userId?: string): UserPreferences {
  try {
    const key = `${LOCAL_STORAGE_PREFS_KEY}${userId || 'guest'}`
    const raw = localStorage.getItem(key)
    if (raw) {
      return sanitizeUserPreferences(JSON.parse(raw))
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_USER_PREFERENCES }
}

/**
 * Salva no localStorage rápido.
 */
export function setLocalPreferences(userId: string | undefined, prefs: UserPreferences): void {
  try {
    const key = `${LOCAL_STORAGE_PREFS_KEY}${userId || 'guest'}`
    localStorage.setItem(key, JSON.stringify(prefs))
  } catch {
    /* ignore */
  }
}

/**
 * Remove do localStorage (para restauração).
 */
export function clearLocalPreferences(userId?: string): void {
  try {
    const key = `${LOCAL_STORAGE_PREFS_KEY}${userId || 'guest'}`
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/**
 * Busca preferência do usuário no PocketBase.
 */
export async function fetchUserPreferencesFromBackend(
  userId: string,
): Promise<{ recordId: string | null; preferences: UserPreferences }> {
  if (!userId) {
    return { recordId: null, preferences: { ...DEFAULT_USER_PREFERENCES } }
  }

  try {
    const result = await pb.collection(PREFS_COLLECTION).getList(1, 1, {
      filter: `user = "${userId}"`,
    })

    if (result.items.length > 0) {
      const rec = result.items[0]
      const sanitized = sanitizeUserPreferences(rec.preferences as Partial<UserPreferences>)
      return {
        recordId: rec.id,
        preferences: sanitized,
      }
    }
  } catch (err) {
    console.warn('[user-preferences] Erro ao carregar do backend:', err)
  }

  return { recordId: null, preferences: getLocalPreferences(userId) }
}

/**
 * Persiste no backend associado ao ID do usuário autenticado.
 */
export async function saveUserPreferencesToBackend(
  userId: string,
  recordId: string | null,
  preferences: UserPreferences,
): Promise<string | null> {
  if (!userId) return null

  try {
    if (recordId) {
      const updated = await pb.collection(PREFS_COLLECTION).update(recordId, {
        preferences,
      })
      return updated.id
    }

    // Verifica se já existe
    const existing = await pb.collection(PREFS_COLLECTION).getList(1, 1, {
      filter: `user = "${userId}"`,
    })

    if (existing.items.length > 0) {
      const updated = await pb.collection(PREFS_COLLECTION).update(existing.items[0].id, {
        preferences,
      })
      return updated.id
    }

    const created = await pb.collection(PREFS_COLLECTION).create({
      user: userId,
      preferences,
    })
    return created.id
  } catch (err) {
    console.warn('[user-preferences] Erro ao salvar no backend:', err)
    return recordId
  }
}

/**
 * Restaura padrões no backend (deleta registro do usuário).
 */
export async function deleteUserPreferencesFromBackend(
  userId: string,
  recordId: string | null,
): Promise<void> {
  if (!userId) return

  try {
    if (recordId) {
      await pb.collection(PREFS_COLLECTION).delete(recordId)
      return
    }

    const existing = await pb.collection(PREFS_COLLECTION).getList(1, 1, {
      filter: `user = "${userId}"`,
    })

    for (const item of existing.items) {
      await pb.collection(PREFS_COLLECTION).delete(item.id)
    }
  } catch (err) {
    console.warn('[user-preferences] Erro ao excluir do backend:', err)
  }
}
