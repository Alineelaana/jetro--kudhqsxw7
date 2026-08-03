import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCmsContent } from '@/services/cms'
import { CMS_DEFAULT_CONTENT } from '@/lib/cms-defaults'

interface CmsContentContextType {
  content: Record<string, Record<string, unknown>>
  loading: boolean
  getCmsData: (key: string) => Record<string, unknown>
}

const CmsContentContext = createContext<CmsContentContextType>({
  content: {},
  loading: true,
  getCmsData: () => ({}),
})

export const useCmsContent = () => useContext(CmsContentContext)

export function CmsContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Record<string, Record<string, unknown>>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.resolve(getCmsContent?.())
      .then((items) => {
        if (cancelled) return
        const map: Record<string, Record<string, unknown>> = {}
        if (Array.isArray(items)) {
          for (const item of items) {
            if (!item || !item.section_key) continue
            const published = item.published_data as Record<string, unknown> | null | undefined
            if (published && typeof published === 'object' && Object.keys(published).length > 0) {
              map[item.section_key] = published
            }
          }
        }
        if (!cancelled) setContent(map)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const getCmsData = (key: string) => content[key] || CMS_DEFAULT_CONTENT[key] || {}

  return (
    <CmsContentContext.Provider value={{ content, loading, getCmsData }}>
      {children}
    </CmsContentContext.Provider>
  )
}
