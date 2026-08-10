import { useEffect } from 'react'
import { useCmsContent } from '@/hooks/use-cms-content'

export function SeoHead() {
  const { getCmsData, loading } = useCmsContent()

  useEffect(() => {
    document.title = 'Jetro | Plataforma Inteligente de Gestão Empresarial'

    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute(
      'content',
      'Gestão integrada para empresas de serviços, distribuidoras, atacadistas, indústrias e operações comerciais. Financeiro, vendas, pessoas, operações e inteligência em uma única plataforma.',
    )

    if (loading) return
    if (typeof getCmsData !== 'function') return
    try {
      const seo = getCmsData('seo') as Record<string, unknown> | undefined
      if (seo && typeof seo === 'object') {
        if (typeof seo.title === 'string' && seo.title) {
          document.title = seo.title
        }
        if (typeof seo.description === 'string' && seo.description) {
          metaDesc.setAttribute('content', seo.description)
        }
      }
    } catch {
      // silently ignore SEO CMS errors
    }
  }, [getCmsData, loading])

  return null
}
