import { useState, useEffect, useCallback } from 'react'

function getStorageKey(module: string, userId?: string): string {
  return `veloralog:module-sections:${module}:${userId || 'anonymous'}`
}

export function useModuleSections(module: string, userId?: string) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
    try {
      const raw = localStorage.getItem(getStorageKey(module, userId))
      setExpanded(raw ? new Set(JSON.parse(raw)) : new Set())
    } catch {
      setExpanded(new Set())
    }
    setLoaded(true)
  }, [module, userId])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(getStorageKey(module, userId), JSON.stringify([...expanded]))
    } catch {
      // ignore
    }
  }, [expanded, module, userId, loaded])

  const toggle = useCallback((section: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(section)) next.delete(section)
      else next.add(section)
      return next
    })
  }, [])

  const isExpanded = useCallback((section: string) => expanded.has(section), [expanded])

  return { expanded, toggle, isExpanded, loaded }
}
