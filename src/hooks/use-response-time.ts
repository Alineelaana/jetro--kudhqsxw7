import { useState, useEffect } from 'react'
import { getAverageResponseTime } from '@/services/budget-requests'

export function useResponseTime() {
  const [formatted, setFormatted] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    try {
      if (typeof getAverageResponseTime !== 'function') return
      const result = getAverageResponseTime()
      if (result == null || typeof result.then !== 'function')
        return result
          .then((data: unknown) => {
            if (cancelled) return
            if (!data) return
            if (typeof data === 'string') {
              setFormatted(data)
            } else if (typeof data === 'object' && data !== null) {
              const obj = data as Record<string, unknown>
              if (typeof obj.formatted === 'string') setFormatted(obj.formatted)
              else if (typeof obj.average === 'string') setFormatted(obj.average)
            }
          })
          .catch(() => {})
    } catch {
      // silently ignore — response time is optional
    }

    return () => {
      cancelled = true
    }
  }, [])

  return { formatted }
}
