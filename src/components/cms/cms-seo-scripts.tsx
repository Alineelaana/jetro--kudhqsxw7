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
import { generateSitemap } from '@/services/cms'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export { CmsSeoSettings } from '@/components/cms/cms-seo-settings'

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
