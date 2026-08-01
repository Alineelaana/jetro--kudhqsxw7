import { useState, useEffect } from 'react'
import { getAverageResponseTime } from '@/services/budget-requests'

interface ResponseTimeData {
  averageMs: number
  count: number
  formatted: string
}

export function useResponseTime() {
  const [data, setData] = useState<ResponseTimeData>({
    averageMs: 0,
    count: 0,
    formatted: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAverageResponseTime()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { ...data, loading }
}
