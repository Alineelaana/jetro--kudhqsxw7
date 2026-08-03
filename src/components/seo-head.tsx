import { useEffect } from 'react'
import { useCmsContent } from '@/hooks/use-cms-content'

export function SeoHead() {
  const { getCmsData, loading } = useCmsContent()

  useEffect(() => {
    if (loading) return
    try {
      const seo = getCmsData('seo') as Record<string, unknown> | undefined
      if (!seo || typeof seo !== 'object') return

      if (typeof seo.title === 'string' && seo.title) {
        document.title = seo.title
      }

      if (typeof seo.description === 'string' && seo.description) {
        const meta = document.querySelector('meta[name="description"]')
        if (meta) {
          meta.setAttribute('content', seo.description)
        }
      }
    } catch {
      // silently ignore SEO errors to prevent page crash
    }
  }, [getCmsData, loading])

  return null
}
