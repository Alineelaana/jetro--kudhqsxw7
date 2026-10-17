import { useState, useEffect, useCallback } from 'react'

function getStorageKey(userId?: string): string {
  return `jetro:menu-favorites:${userId || 'anonymous'}`
}

export function useMenuFavorites(userId?: string) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    try {
      const raw = localStorage.getItem(getStorageKey(userId))
      setFavorites(raw ? new Set(JSON.parse(raw)) : new Set())
    } catch {
      setFavorites(new Set())
    }
    setLoaded(true)
  }, [userId])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify([...favorites]))
    } catch {
      // ignore
    }
  }, [favorites, userId, loaded])

  const toggleFavorite = useCallback((key: string) => {
    if (!key) return
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const isFavorite = useCallback((key: string) => favorites.has(key), [favorites])

  return { favorites, toggleFavorite, isFavorite }
}
