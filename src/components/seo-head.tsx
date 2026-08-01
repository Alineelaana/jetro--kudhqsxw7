import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useCmsContent } from '@/hooks/use-cms-content'

interface PageSeo {
  url: string
  slug?: string
  title?: string
  description?: string
  keywords?: string
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  index?: boolean
  follow?: boolean
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function removeMeta(attr: 'name' | 'property', key: string) {
  document.head.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function injectScriptId(id: string, text: string) {
  document.getElementById(id)?.remove()
  if (!text) return
  const s = document.createElement('script')
  s.id = id
  s.text = text
  document.head.appendChild(s)
}

function findPage(pages: PageSeo[], pathname: string, hash: string): PageSeo | null {
  const full = hash ? `${pathname}${hash}` : pathname
  return pages.find((p) => p.url === full) || pages.find((p) => p.url === pathname) || null
}

export function SeoHead() {
  const { content, loading } = useCmsContent()
  const location = useLocation()

  useEffect(() => {
    if (loading) return
    const seo = content.seo || {}
    const pages = (seo.pages as PageSeo[]) || []
    const page = findPage(pages, location.pathname, location.hash)

    const title =
      page?.title || (seo.defaultTitle as string) || (seo.title as string) || 'Velora Log'
    const desc =
      page?.description || (seo.defaultDescription as string) || (seo.description as string) || ''
    const kw = page?.keywords || (seo.defaultKeywords as string) || (seo.keywords as string) || ''
    const slug = page?.slug || page?.url || location.pathname
    const canon = page?.canonicalUrl || `${window.location.origin}${slug}`
    const ogTitle = page?.ogTitle || title
    const ogDesc = page?.ogDescription || desc
    const ogImg = page?.ogImage || ''
    const ogUrl = `${window.location.origin}${slug}`
    const index = page?.index !== false
    const follow = page?.follow !== false

    document.title = title
    setMeta('name', 'description', desc)
    if (kw) setMeta('name', 'keywords', kw)
    else removeMeta('name', 'keywords')
    setMeta('name', 'robots', `${index ? 'index' : 'noindex'},${follow ? 'follow' : 'nofollow'}`)
    setLink('canonical', canon)
    setMeta('property', 'og:title', ogTitle)
    setMeta('property', 'og:description', ogDesc)
    setMeta('property', 'og:url', ogUrl)
    setMeta('property', 'og:type', 'website')
    if (ogImg) setMeta('property', 'og:image', ogImg)
    else removeMeta('property', 'og:image')
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', ogTitle)
    setMeta('name', 'twitter:description', ogDesc)
    if (ogImg) setMeta('name', 'twitter:image', ogImg)
    else removeMeta('name', 'twitter:image')

    const favicon = (seo.favicon as string) || ''
    if (favicon) {
      setLink('icon', favicon)
      setLink('shortcut icon', favicon)
    }
  }, [content, loading, location.pathname, location.hash])

  useEffect(() => {
    if (loading) return
    const scripts = content.scripts || {}
    const ga = (scripts.googleAnalytics as string) || ''
    const gtm = (scripts.googleTagManager as string) || ''
    const pixel = (scripts.metaPixel as string) || ''
    const gsc = (scripts.googleSearchConsole as string) || ''

    document.getElementById('seo-ga-src')?.remove()
    if (ga) {
      const src = document.createElement('script')
      src.id = 'seo-ga-src'
      src.async = true
      src.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`
      document.head.appendChild(src)
      injectScriptId(
        'seo-ga',
        `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`,
      )
    } else {
      injectScriptId('seo-ga', '')
    }

    injectScriptId(
      'seo-gtm',
      gtm
        ? `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`
        : '',
    )
    injectScriptId(
      'seo-pixel',
      pixel
        ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixel}');fbq('track','PageView');`
        : '',
    )

    if (gsc) setMeta('name', 'google-site-verification', gsc)
    else removeMeta('name', 'google-site-verification')
  }, [content, loading])

  useEffect(() => {
    const scripts = content.scripts || {}
    const ga = (scripts.googleAnalytics as string) || ''
    if (ga && typeof (window as Record<string, unknown>).gtag === 'function') {
      ;(window as Record<string, unknown>).gtag('event', 'page_view', {
        page_path: location.pathname + location.hash,
      })
    }
  }, [location.pathname, location.hash, content])

  return null
}
