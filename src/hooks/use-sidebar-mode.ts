import { useState, useEffect, useCallback } from 'react'

function getStorageKey(userId?: string): string {
  return `jetro:sidebar-mode:${userId || 'anonymous'}`
}

export type SidebarMode = 'expanded' | 'rail'

export function useSidebarMode(userId?: string) {
  const [mode, setMode] = useState<SidebarMode>('expanded')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    try {
      const raw = localStorage.getItem(getStorageKey(userId))
      if (raw === 'collapsed' || raw === 'rail') {
        setMode('rail')
      } else {
        setMode('expanded')
      }
    } catch {
      setMode('expanded')
    }
    setLoaded(true)
  }, [userId])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(getStorageKey(userId), mode)
    } catch {
      // ignore
    }
  }, [mode, userId, loaded])

  const toggle = useCallback(() => {
    setMode((prev) => (prev === 'rail' ? 'expanded' : 'rail'))
  }, [])

  const setRail = useCallback(() => setMode('rail'), [])
  const setExpanded = useCallback(() => setMode('expanded'), [])

  return {
    mode,
    setMode,
    isRail: mode === 'rail',
    collapsed: mode === 'rail', // backward compatibility
    setCollapsed: (val: boolean) => setMode(val ? 'rail' : 'expanded'),
    toggle,
    setRail,
    setExpanded,
  }
}
