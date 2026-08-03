import { useState, useEffect } from 'react'
import { getAverageResponseTime } from '@/services/budget-requests'

export function useResponseTime() {
  const [formatted, setFormatted] = useState<string>('')

  useEffect(() => {
    if (typeof getAverageResponseTime !== 'function') return
    getAverageResponseTime()
      .then((data: unknown) => {
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
  }, [])

  return { formatted }
}
