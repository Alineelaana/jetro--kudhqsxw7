import { useState, useEffect, useCallback } from 'react'

export interface MenuHistoryEntry {
  key: string
  count: number
  lastVisited: number
}

export type MenuHistory = Record<string, MenuHistoryEntry>

function getStorageKey(userId?: string): string {
  return `veloralog:menu-history:${userId || 'anonymous'}`
}

export function useMenuHistory(userId?: string) {
  const [history, setHistory] = useState<MenuHistory>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    try {
      const raw = localStorage.getItem(getStorageKey(userId))
      setHistory(raw ? JSON.parse(raw) : {})
    } catch {
      setHistory({})
    }
    setLoaded(true)
  }, [userId])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(history))
    } catch {
      // ignore
    }
  }, [history, userId, loaded])

  const recordVisit = useCallback((key: string) => {
    if (!key) return
    setHistory((prev) => {
      const existing = prev[key]
      return {
        ...prev,
        [key]: {
          key,
          count: (existing?.count || 0) + 1,
          lastVisited: Date.now(),
        },
      }
    })
  }, [])

  return { history, recordVisit }
}
