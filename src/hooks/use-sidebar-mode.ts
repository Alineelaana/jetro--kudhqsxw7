import { useState, useEffect, useCallback } from 'react'

function getStorageKey(userId?: string): string {
  return `veloralog:sidebar-mode:${userId || 'anonymous'}`
}

export function useSidebarMode(userId?: string) {
  const [collapsed, setCollapsed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    try {
      const raw = localStorage.getItem(getStorageKey(userId))
      setCollapsed(raw === 'collapsed')
    } catch {
      setCollapsed(false)
    }
    setLoaded(true)
  }, [userId])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(getStorageKey(userId), collapsed ? 'collapsed' : 'expanded')
    } catch {
      // ignore
    }
  }, [collapsed, userId, loaded])

  const toggle = useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  return { collapsed, setCollapsed, toggle }
}
