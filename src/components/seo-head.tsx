import { useEffect } from 'react'
import { useCmsContent } from '@/hooks/use-cms-content'

export function SeoHead() {
  const { getCmsData, loading } = useCmsContent()

  useEffect(() => {
    // Título institucional alinhado ao reposicionamento solicitado
    const defaultTitle =
      'HURAM | Inteligência que conecta sua gestão — Sistema Inteligente de Gestão'
    const defaultDescription =
      'Plataforma de gestão empresarial desenvolvida para integrar processos, organizar informações, acompanhar operações e transformar dados em conhecimento para decisões mais inteligentes. Comercial, financeiro, fiscal, WMS, RH, BI e inteligência artificial.'

    document.title = defaultTitle

    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', defaultDescription)

    // Open Graph Tags
    const setOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    setOgTag('og:title', defaultTitle)
    setOgTag('og:description', defaultDescription)
    setOgTag('og:type', 'website')
    setOgTag('og:site_name', 'Sistema HURAM')
    setOgTag('og:locale', 'pt_BR')

    // Schema.org Structured Data (JSON-LD)
    const jsonLdId = 'huram-seo-structured-data'
    let scriptTag = document.getElementById(jsonLdId) as HTMLScriptElement | null
    if (!scriptTag) {
      scriptTag = document.createElement('script')
      scriptTag.id = jsonLdId
      scriptTag.type = 'application/ld+json'
      document.head.appendChild(scriptTag)
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'HURAM — Sistema Inteligente de Gestão',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web, Cloud',
      description: defaultDescription,
      creator: {
        '@type': 'Organization',
        name: 'SAF TECNOLOGIA E GESTAO LTDA',
        taxID: '65.768.215/0001-00',
      },
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        price: '0.00',
        priceCurrency: 'BRL',
      },
    }

    scriptTag.textContent = JSON.stringify(structuredData)

    if (loading) return
    if (typeof getCmsData !== 'function') return
    try {
      const seo = getCmsData('seo') as Record<string, unknown> | undefined
      if (seo && typeof seo === 'object') {
        if (typeof seo.title === 'string' && seo.title) {
          document.title = seo.title
          setOgTag('og:title', seo.title)
        }
        if (typeof seo.description === 'string' && seo.description) {
          metaDesc.setAttribute('content', seo.description)
          setOgTag('og:description', seo.description)
        }
      }
    } catch {
      // silently ignore SEO CMS errors
    }
  }, [getCmsData, loading])

  return null
}
