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
    getCmsContent()
      .then((items) => {
        const map: Record<string, Record<string, unknown>> = {}
        for (const item of items) {
          const published = item.published_data as Record<string, unknown>
          if (published && Object.keys(published).length > 0) {
            map[item.section_key] = published
          }
        }
        setContent(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const getCmsData = (key: string) => content[key] || CMS_DEFAULT_CONTENT[key] || {}

  return (
    <CmsContentContext.Provider value={{ content, loading, getCmsData }}>
      {children}
    </CmsContentContext.Provider>
  )
}
