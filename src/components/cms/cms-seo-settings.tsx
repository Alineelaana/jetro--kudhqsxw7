import { useState } from 'react'
import {
  useCmsSection,
  CmsCard,
  CmsField,
  CmsTextInput,
  SaveBar,
  LoadingState,
} from '@/components/cms/cms-shared'
import { Button } from '@/components/ui/button'
import { CmsSeoPageEditor } from '@/components/cms/cms-seo-page-editor'
import { uploadMedia } from '@/services/cms'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { Upload, Loader2 } from 'lucide-react'

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
  const seo = useCmsSection('seo')
  const scripts = useCmsSection('scripts')
  const { user } = useAuth()
  const [selectedPage, setSelectedPage] = useState<string | null>(null)
  const [faviconUploading, setFaviconUploading] = useState(false)

  if (seo.loading || scripts.loading || !seo.data) return <LoadingState />
  const pages = (seo.data.pages as Array<Record<string, unknown>>) || []
  const sData = scripts.data || {}

  const getPageSeo = (url: string) => ({
    url,
    title: '',
    description: '',
    keywords: '',
    slug: url,
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    index: true,
    follow: true,
    ...pages.find((p) => p.url === url),
  })

  const updatePageSeo = (url: string, patch: Record<string, unknown>) => {
    const idx = pages.findIndex((p) => p.url === url)
    if (idx >= 0) {
      const arr = [...pages]
      arr[idx] = { ...arr[idx], ...patch }
      seo.update({ pages: arr })
    } else {
      seo.update({
        pages: [
          ...pages,
          { url, name: SEO_PAGES.find((p) => p.url === url)?.name || '', ...patch },
        ],
      })
    }
  }

  const combinedSave = async () => {
    await seo.save()
    if (scripts.isDirty) await scripts.save()
  }
  const combinedDirty = seo.isDirty || scripts.isDirty
  const combinedSaving = seo.saving || scripts.saving

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFaviconUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', file.name)
      formData.append('type', file.type)
      formData.append('size', String(file.size))
      formData.append('folder', 'Favicon')
      formData.append('alt_text', 'Favicon')
      formData.append('caption', '')
      formData.append('usage_locations', '[]')
      formData.append('uploaded_by', (user?.id as string) || '')
      const result = await uploadMedia(formData)
      const fileUrl = pb.files.getURL(
        { id: result.id, collectionId: 'cms_media', collectionName: 'cms_media' } as never,
        result.file,
      )
      seo.update({ favicon: fileUrl })
      toast.success('Favicon enviado com sucesso!')
    } catch {
      toast.error('Erro ao enviar favicon.')
    }
    setFaviconUploading(false)
    e.target.value = ''
  }

  if (selectedPage) {
    const ps = getPageSeo(selectedPage)
    const pageName = SEO_PAGES.find((p) => p.url === selectedPage)?.name || selectedPage
    return (
      <CmsSeoPageEditor
        pageUrl={selectedPage}
        pageName={pageName}
        data={ps as unknown as Parameters<typeof CmsSeoPageEditor>[0]['data']}
        onUpdate={updatePageSeo}
        onBack={() => setSelectedPage(null)}
        onSave={combinedSave}
        saving={combinedSaving}
        isDirty={combinedDirty}
      />
    )
  }

  return (
    <div className="space-y-4">
      <SaveBar onSave={combinedSave} saving={combinedSaving} isDirty={combinedDirty} />
      <CmsCard title="Páginas do Site">
        <div className="space-y-2">
          {SEO_PAGES.map((page) => {
            const sp = getPageSeo(page.url)
            const status =
              (sp.title as string).length > 0 && (sp.description as string).length > 0
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
                    {(sp.title as string) || '—'}
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
              value={(seo.data.defaultTitle as string) || ''}
              onChange={(v) => seo.update({ defaultTitle: v })}
            />
          </CmsField>
          <CmsField label="Descrição Padrão">
            <CmsTextInput
              value={(seo.data.defaultDescription as string) || ''}
              onChange={(v) => seo.update({ defaultDescription: v })}
            />
          </CmsField>
          <CmsField label="Palavras-chave Padrão">
            <CmsTextInput
              value={(seo.data.defaultKeywords as string) || ''}
              onChange={(v) => seo.update({ defaultKeywords: v })}
            />
          </CmsField>
          <CmsField label="Favicon">
            <div className="flex items-center gap-2">
              <CmsTextInput
                value={(seo.data.favicon as string) || ''}
                onChange={(v) => seo.update({ favicon: v })}
                placeholder="URL do favicon"
              />
              <label className="cursor-pointer">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-[#005B2E] text-[#005B2E] font-bold"
                >
                  <span>
                    {faviconUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                  </span>
                </Button>
                <input
                  type="file"
                  onChange={handleFaviconUpload}
                  className="hidden"
                  accept=".ico,.png,.svg,.jpg,.jpeg"
                />
              </label>
            </div>
            {(seo.data.favicon as string) && (
              <img
                src={(seo.data.favicon as string) || ''}
                alt="Favicon"
                className="w-8 h-8 mt-2 rounded border border-border"
              />
            )}
          </CmsField>
        </div>
      </CmsCard>
      <CmsCard title="Scripts de Rastreamento (Global)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField label="Google Analytics ID">
            <CmsTextInput
              value={(sData.googleAnalytics as string) || ''}
              onChange={(v) => scripts.update({ googleAnalytics: v })}
              placeholder="G-XXXXXXX"
            />
          </CmsField>
          <CmsField label="Google Tag Manager ID">
            <CmsTextInput
              value={(sData.googleTagManager as string) || ''}
              onChange={(v) => scripts.update({ googleTagManager: v })}
              placeholder="GTM-XXXXXXX"
            />
          </CmsField>
          <CmsField label="Meta Pixel ID">
            <CmsTextInput
              value={(sData.metaPixel as string) || ''}
              onChange={(v) => scripts.update({ metaPixel: v })}
              placeholder="XXXXXXXXX"
            />
          </CmsField>
          <CmsField label="Google Search Console">
            <CmsTextInput
              value={(sData.googleSearchConsole as string) || ''}
              onChange={(v) => scripts.update({ googleSearchConsole: v })}
              placeholder="content-code"
            />
          </CmsField>
        </div>
      </CmsCard>
    </div>
  )
}
