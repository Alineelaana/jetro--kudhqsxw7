import { useState, useEffect } from 'react'
import { getAverageResponseTime } from '@/services/budget-requests'

export function useResponseTime() {
  const [formatted, setFormatted] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    if (typeof getAverageResponseTime !== 'function') return

    Promise.resolve()
      .then(() => getAverageResponseTime())
      .then((data: unknown) => {
        if (cancelled || !data) return
        if (typeof data === 'string') {
          setFormatted(data)
        } else if (typeof data === 'object' && data !== null) {
          const obj = data as Record<string, unknown>
          if (typeof obj.formatted === 'string') setFormatted(obj.formatted)
          else if (typeof obj.average === 'string') setFormatted(obj.average)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  return { formatted }
}
