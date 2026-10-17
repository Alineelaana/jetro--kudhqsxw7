import { useEffect, useState, useCallback } from 'react'
import {
  getCurrentNavigationSnapshot,
  validateNavigationChange,
  type FlatMenuItem,
} from '@/lib/navigation-regression-test'

const STORAGE_KEY = 'jetro:nav-baseline'

export interface NavigationCheckResult {
  violations: string[]
  hasBaseline: boolean
  isValid: boolean
  updateBaseline: () => void
  clearBaseline: () => void
}

export function useNavigationCheck(): NavigationCheckResult {
  const [violations, setViolations] = useState<string[]>([])
  const [hasBaseline, setHasBaseline] = useState(false)
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    const current = getCurrentNavigationSnapshot()
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored) {
      try {
        const baseline = JSON.parse(stored) as FlatMenuItem[]
        const result = validateNavigationChange(baseline, current)
        setViolations(result.violations)
        setHasBaseline(true)
        setIsValid(result.valid)
      } catch {
        setHasBaseline(false)
        setIsValid(true)
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
      setHasBaseline(false)
      setIsValid(true)
    }
  }, [])

  const updateBaseline = useCallback(() => {
    const current = getCurrentNavigationSnapshot()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    setViolations([])
    setHasBaseline(true)
    setIsValid(true)
  }, [])

  const clearBaseline = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHasBaseline(false)
    setViolations([])
    setIsValid(true)
  }, [])

  return { violations, hasBaseline, isValid, updateBaseline, clearBaseline }
}
