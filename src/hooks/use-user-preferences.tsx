import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { useAuth } from '@/hooks/use-auth'
import { type UserPreferences, DEFAULT_USER_PREFERENCES } from '@/types/user-preferences'
import {
  getLocalPreferences,
  setLocalPreferences,
  clearLocalPreferences,
  fetchUserPreferencesFromBackend,
  saveUserPreferencesToBackend,
  deleteUserPreferencesFromBackend,
  sanitizeUserPreferences,
} from '@/services/user-preferences'

interface UserPreferencesContextType {
  preferences: UserPreferences
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
  updateMultiple: (partial: Partial<UserPreferences>) => void
  restoreDefaults: () => Promise<void>
  adjustTextScale: (direction: 'increase' | 'decrease' | 'reset') => void
  isCustomizerOpen: boolean
  setIsCustomizerOpen: (open: boolean) => void
  toggleCustomizer: () => void
  isSaving: boolean
  isLoaded: boolean
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined)

const DEBOUNCE_SAVE_MS = 600

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const userId = user?.id as string | undefined

  // Inicializa imediatamente com localStorage (sem piscar a tela)
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    return getLocalPreferences(userId)
  })
  const [recordId, setRecordId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false)

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentPrefsRef = useRef(preferences)
  currentPrefsRef.current = preferences

  // 1. Carrega do PocketBase quando o usuário autentica ou muda
  useEffect(() => {
    let active = true

    async function load() {
      if (!isAuthenticated || !userId) {
        setIsLoaded(true)
        return
      }

      setIsSaving(true)
      const res = await fetchUserPreferencesFromBackend(userId)
      if (!active) return

      setRecordId(res.recordId)
      setPreferences(res.preferences)
      setLocalPreferences(userId, res.preferences)
      setIsLoaded(true)
      setIsSaving(false)
    }

    load()

    return () => {
      active = false
    }
  }, [userId, isAuthenticated])

  // 2. Aplica as classes e variáveis no DOM (document.documentElement e classes)
  useEffect(() => {
    const root = document.documentElement
    const body = document.body

    // --- TEMA (Claro / Escuro / Auto) ---
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const isSystemDark = mediaQuery.matches
    const effectiveDark =
      preferences.theme === 'dark' || (preferences.theme === 'auto' && isSystemDark)

    if (effectiveDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Listener para tema automático
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (currentPrefsRef.current.theme === 'auto') {
        if (e.matches) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    }
    mediaQuery.addEventListener('change', handleThemeChange)

    // --- ALTO CONTRASTE ---
    if (preferences.highContrast) {
      root.classList.add('jetro-high-contrast')
    } else {
      root.classList.remove('jetro-high-contrast')
    }

    // --- ANIMAÇÕES E REDUÇÃO DE MOVIMENTO ---
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const disableAnimations =
      !preferences.animationsEnabled || preferences.reducedMotion || prefersReducedMotion

    if (disableAnimations) {
      root.classList.add('jetro-no-animations')
    } else {
      root.classList.remove('jetro-no-animations')
    }

    // --- DESTAQUE DE FOCO (TECLADO) ---
    if (preferences.focusHighlight) {
      root.classList.add('jetro-focus-highlight')
    } else {
      root.classList.remove('jetro-focus-highlight')
    }

    // --- ELEMENTOS AMPLIADOS (ACESSIBILIDADE TOUCH/TARGET) ---
    if (preferences.largeTouchTargets) {
      root.classList.add('jetro-large-targets')
    } else {
      root.classList.remove('jetro-large-targets')
    }

    // --- TAMANHO DOS TEXTOS ---
    // Remove classes anteriores
    root.classList.remove('jetro-text-compact', 'jetro-text-normal', 'jetro-text-large')
    root.classList.add(`jetro-text-${preferences.textSize}`)

    // Escala progressiva com step (-2, -1, 0, 1, 2)
    // 0 = 100%, -2 = 85%, -1 = 92.5%, 1 = 107.5%, 2 = 115%
    const scaleMap: Record<number, string> = {
      '-2': '88%',
      '-1': '94%',
      '0': '100%',
      '1': '108%',
      '2': '116%',
    }
    const scaleValue = scaleMap[preferences.textScaleStep] || '100%'
    root.style.setProperty('--jetro-text-scale', scaleValue)

    // --- DENSIDADE DE ESPAÇAMENTO DA INTERFACE ---
    root.classList.remove(
      'jetro-density-compact',
      'jetro-density-comfortable',
      'jetro-density-spacious',
    )
    root.classList.add(`jetro-density-${preferences.spacingDensity}`)

    // --- PREFERÊNCIAS GLOBAIS DE TABELA ---
    root.classList.remove('jetro-table-compact', 'jetro-table-comfortable', 'jetro-table-spacious')
    root.classList.add(`jetro-table-${preferences.tableDensity}`)

    if (preferences.tableDividers) {
      root.classList.add('jetro-table-dividers')
    } else {
      root.classList.remove('jetro-table-dividers')
    }

    if (preferences.tableStripedRows) {
      root.classList.add('jetro-table-striped')
    } else {
      root.classList.remove('jetro-table-striped')
    }

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange)
    }
  }, [
    preferences.theme,
    preferences.highContrast,
    preferences.animationsEnabled,
    preferences.reducedMotion,
    preferences.focusHighlight,
    preferences.largeTouchTargets,
    preferences.textSize,
    preferences.textScaleStep,
    preferences.spacingDensity,
    preferences.tableDensity,
    preferences.tableDividers,
    preferences.tableStripedRows,
  ])

  // Função interna para agendar persistência remota
  const scheduleSave = useCallback(
    (newPrefs: UserPreferences) => {
      // 1. Atualiza localStorage imediatamente
      setLocalPreferences(userId, newPrefs)

      // 2. Persistência no PocketBase com debounce
      if (isAuthenticated && userId) {
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current)
        }
        setIsSaving(true)
        saveTimerRef.current = setTimeout(async () => {
          const newRecId = await saveUserPreferencesToBackend(userId, recordId, newPrefs)
          if (newRecId) setRecordId(newRecId)
          setIsSaving(false)
        }, DEBOUNCE_SAVE_MS)
      }
    },
    [userId, isAuthenticated, recordId],
  )

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value }
        scheduleSave(next)
        return next
      })
    },
    [scheduleSave],
  )

  const updateMultiple = useCallback(
    (partial: Partial<UserPreferences>) => {
      setPreferences((prev) => {
        const next = sanitizeUserPreferences({ ...prev, ...partial })
        scheduleSave(next)
        return next
      })
    },
    [scheduleSave],
  )

  // Ajuste progressivo de escala de textos (- / ↻ / +)
  const adjustTextScale = useCallback(
    (action: 'increase' | 'decrease' | 'reset') => {
      setPreferences((prev) => {
        let nextStep = prev.textScaleStep
        let nextSize = prev.textSize

        if (action === 'reset') {
          nextStep = 0
          nextSize = 'normal'
        } else if (action === 'increase') {
          nextStep = Math.min(2, nextStep + 1)
          if (nextStep >= 1) nextSize = 'large'
          else if (nextStep === 0) nextSize = 'normal'
        } else if (action === 'decrease') {
          nextStep = Math.max(-2, nextStep - 1)
          if (nextStep <= -1) nextSize = 'compact'
          else if (nextStep === 0) nextSize = 'normal'
        }

        const next = {
          ...prev,
          textScaleStep: nextStep,
          textSize: nextSize,
        }
        scheduleSave(next)
        return next
      })
    },
    [scheduleSave],
  )

  // Restaura preferências originais do sistema sem tocar em dados
  const restoreDefaults = useCallback(async () => {
    const defaults = { ...DEFAULT_USER_PREFERENCES }
    setPreferences(defaults)
    clearLocalPreferences(userId)
    if (isAuthenticated && userId) {
      setIsSaving(true)
      await deleteUserPreferencesFromBackend(userId, recordId)
      setRecordId(null)
      setIsSaving(false)
    }
  }, [userId, isAuthenticated, recordId])

  const toggleCustomizer = useCallback(() => {
    setIsCustomizerOpen((prev) => !prev)
  }, [])

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        updatePreference,
        updateMultiple,
        restoreDefaults,
        adjustTextScale,
        isCustomizerOpen,
        setIsCustomizerOpen,
        toggleCustomizer,
        isSaving,
        isLoaded,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}
