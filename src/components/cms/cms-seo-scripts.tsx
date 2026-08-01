import { useState } from 'react'
import {
  useCmsSection,
  CmsCard,
  CmsField,
  CmsTextInput,
  CmsTextArea,
  SaveBar,
  LoadingState,
} from '@/components/cms/cms-shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { generateSitemap } from '@/services/cms'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'

const SEO_PAGES = [
  { name: 'Página Inicial', url: '/' },
  { name: 'Serviços', url: '/#servicos' },
  { name: 'Orçamento', url: '/#orcamento' },
  { name: 'Contato', url: '/#contato' },
  { name: 'Área do Cliente', url: '/cliente/login' },
  { name: 'Painel Admin', url: '/admin' },
  { name: 'Política de Privacidade', url: '/politica-de-privacidade' },
  { name: 'Termos de Uso', url: '/termos-de-uso' },
  { name: 'Política Comercial', url: '/politica-comercial' },
  { name: 'Política de Cookies', url: '/politica-de-cookies' },
]

export function CmsSeoSettings() {
  const { data, update, loading, saving, save, isDirty } = useCmsSection('seo')
  const [selectedPage, setSelectedPage] = useState<string | null>(null)
  if (loading || !data) return <LoadingState />
  const pages = (data.pages as Array<Record<string, unknown>>) || []

  const getPageSeo = (url: string) =>
    pages.find((p) => p.url === url) || {
      url,
      title: '',
      description: '',
      keywords: '',
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      index: true,
      follow: true,
    }
  const updatePageSeo = (url: string, patch: Record<string, unknown>) => {
    const idx = pages.findIndex((p) => p.url === url)
    if (idx >= 0) {
      const arr = [...pages]
      arr[idx] = { ...arr[idx], ...patch }
      update({ pages: arr })
    } else {
      update({
        pages: [
          ...pages,
          { url, name: SEO_PAGES.find((p) => p.url === url)?.name || '', ...patch },
        ],
      })
    }
  }

  if (selectedPage) {
    const ps = getPageSeo(selectedPage)
    const tLen = (ps.title as string).length
    const dLen = (ps.description as string).length
    const pageName = SEO_PAGES.find((p) => p.url === selectedPage)?.name || selectedPage
    return (
      <div className="space-y-4">
        <SaveBar onSave={save} saving={saving} isDirty={isDirty} />
        <Button
          variant="outline"
          onClick={() => setSelectedPage(null)}
          className="border-[#005B2E] text-[#005B2E] font-bold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar à lista
        </Button>
        <CmsCard title={`SEO — ${pageName}`}>
          <CmsField label={`Título SEO (Meta Title) — ${tLen}/60`}>
            <CmsTextInput
              value={ps.title as string}
              onChange={(v) => updatePageSeo(selectedPage, { title: v })}
            />
            <p
              className={`text-xs ${tLen > 60 ? 'text-red-500' : tLen > 50 ? 'text-orange-500' : 'text-green-600'}`}
            >
              {tLen > 60 ? 'Muito longo' : tLen > 50 ? 'Próximo do limite' : 'Tamanho ideal'}
            </p>
          </CmsField>
          <CmsField label={`Descrição SEO (Meta Description) — ${dLen}/160`}>
            <CmsTextArea
              value={ps.description as string}
              onChange={(v) => updatePageSeo(selectedPage, { description: v })}
              rows={2}
            />
            <p
              className={`text-xs ${dLen > 160 ? 'text-red-500' : dLen > 140 ? 'text-orange-500' : 'text-green-600'}`}
            >
              {dLen > 160 ? 'Muito longo' : dLen > 140 ? 'Próximo do limite' : 'Tamanho ideal'}
            </p>
          </CmsField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CmsField label="Palavras-chave">
              <CmsTextInput
                value={ps.keywords as string}
                onChange={(v) => updatePageSeo(selectedPage, { keywords: v })}
              />
            </CmsField>
            <CmsField label="Canonical URL">
              <CmsTextInput
                value={(ps.canonicalUrl as string) || ''}
                onChange={(v) => updatePageSeo(selectedPage, { canonicalUrl: v })}
              />
            </CmsField>
            <CmsField label="Título Compartilhamento (OG)">
              <CmsTextInput
                value={(ps.ogTitle as string) || ''}
                onChange={(v) => updatePageSeo(selectedPage, { ogTitle: v })}
              />
            </CmsField>
            <CmsField label="Descrição Compartilhamento (OG)">
              <CmsTextInput
                value={(ps.ogDescription as string) || ''}
                onChange={(v) => updatePageSeo(selectedPage, { ogDescription: v })}
              />
            </CmsField>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ps.index !== false}
                onChange={(e) => updatePageSeo(selectedPage, { index: e.target.checked })}
              />{' '}
              Permitir indexação
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ps.follow !== false}
                onChange={(e) => updatePageSeo(selectedPage, { follow: e.target.checked })}
              />{' '}
              Permitir seguir links
            </label>
          </div>
        </CmsCard>
        <CmsCard title="Prévia no Google">
          <div className="border rounded-lg p-4 bg-white max-w-xl">
            <div className="text-xs text-green-700">
              {window.location.origin}
              {selectedPage}
            </div>
            <div className="text-lg text-blue-700 truncate">
              {(ps.title as string) || 'Sem título'}
            </div>
            <div className="text-sm text-gray-600 line-clamp-2">
              {(ps.description as string) || 'Sem descrição'}
            </div>
          </div>
        </CmsCard>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SaveBar onSave={save} saving={saving} isDirty={isDirty} />
      <CmsCard title="Páginas do Site">
        <div className="space-y-2">
          {SEO_PAGES.map((page) => {
            const seo = getPageSeo(page.url)
            const status =
              (seo.title as string).length > 0 && (seo.description as string).length > 0
                ? 'Completo'
                : 'Incompleto'
            return (
              <div
                key={page.url}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-white cursor-pointer hover:border-[#005B2E] transition-colors"
                onClick={() => setSelectedPage(page.url)}
              >
                <div>
                  <p className="text-sm font-bold">{page.name}</p>
                  <p className="text-xs text-muted-foreground">{page.url}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${status === 'Completo' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                  >
                    {status}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {(seo.title as string) || '—'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CmsCard>
      <CmsCard title="SEO Global">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField label="Título Padrão do Site">
            <CmsTextInput
              value={(data.defaultTitle as string) || ''}
              onChange={(v) => update({ defaultTitle: v })}
            />
          </CmsField>
          <CmsField label="Descrição Padrão">
            <CmsTextInput
              value={(data.defaultDescription as string) || ''}
              onChange={(v) => update({ defaultDescription: v })}
            />
          </CmsField>
          <CmsField label="Palavras-chave Padrão">
            <CmsTextInput
              value={(data.defaultKeywords as string) || ''}
              onChange={(v) => update({ defaultKeywords: v })}
            />
          </CmsField>
          <CmsField label="Favicon URL">
            <CmsTextInput
              value={(data.favicon as string) || ''}
              onChange={(v) => update({ favicon: v })}
            />
          </CmsField>
        </div>
      </CmsCard>
    </div>
  )
}

export function CmsScripts() {
  const { data, update, loading, saving, save, isDirty } = useCmsSection('scripts')
  const [generating, setGenerating] = useState(false)
  if (loading || !data) return <LoadingState />

  const handleGenerateSitemap = async () => {
    setGenerating(true)
    try {
      const sitemap = await generateSitemap()
      update({ sitemapXml: sitemap })
      toast.success('Sitemap gerado com sucesso!')
    } catch {
      toast.error('Erro ao gerar sitemap.')
    }
    setGenerating(false)
  }

  return (
    <div className="space-y-4">
      <SaveBar onSave={save} saving={saving} isDirty={isDirty} />
      <CmsCard title="Scripts de Rastreamento">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField label="Google Analytics ID">
            <CmsTextInput
              value={(data.googleAnalytics as string) || ''}
              onChange={(v) => update({ googleAnalytics: v })}
              placeholder="G-XXXXXXX"
            />
          </CmsField>
          <CmsField label="Google Tag Manager ID">
            <CmsTextInput
              value={(data.googleTagManager as string) || ''}
              onChange={(v) => update({ googleTagManager: v })}
              placeholder="GTM-XXXXXXX"
            />
          </CmsField>
          <CmsField label="Meta Pixel ID">
            <CmsTextInput
              value={(data.metaPixel as string) || ''}
              onChange={(v) => update({ metaPixel: v })}
              placeholder="XXXXXXXXX"
            />
          </CmsField>
          <CmsField label="Google Search Console">
            <CmsTextInput
              value={(data.googleSearchConsole as string) || ''}
              onChange={(v) => update({ googleSearchConsole: v })}
              placeholder="content-code"
            />
          </CmsField>
        </div>
      </CmsCard>
      <CmsCard title="robots.txt">
        <CmsTextArea
          value={(data.robotsTxt as string) || 'User-agent: *\nAllow: /'}
          onChange={(v) => update({ robotsTxt: v })}
          rows={6}
        />
      </CmsCard>
      <CmsCard
        title="sitemap.xml"
        action={
          <Button
            onClick={handleGenerateSitemap}
            disabled={generating}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null} Gerar Sitemap
          </Button>
        }
      >
        <CmsTextArea
          value={(data.sitemapXml as string) || ''}
          onChange={(v) => update({ sitemapXml: v })}
          rows={8}
        />
      </CmsCard>
    </div>
  )
}
