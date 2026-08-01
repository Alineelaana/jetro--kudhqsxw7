import {
  CmsCard,
  CmsField,
  CmsTextInput,
  CmsTextArea,
  CmsToggle,
  SaveBar,
} from '@/components/cms/cms-shared'
import { Button } from '@/components/ui/button'
import { MediaPicker } from '@/components/cms/media-picker'
import { ArrowLeft } from 'lucide-react'

interface PageSeoData {
  url: string
  title: string
  description: string
  keywords: string
  slug: string
  canonicalUrl: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  index: boolean
  follow: boolean
}

interface Props {
  pageUrl: string
  pageName: string
  data: PageSeoData
  onUpdate: (url: string, patch: Record<string, unknown>) => void
  onBack: () => void
  onSave: () => void
  saving: boolean
  isDirty: boolean
}

export function CmsSeoPageEditor({
  pageUrl,
  pageName,
  data,
  onUpdate,
  onBack,
  onSave,
  saving,
  isDirty,
}: Props) {
  const tLen = data.title.length
  const dLen = data.description.length
  const slug = data.slug || pageUrl
  const truncatedTitle = tLen > 60 ? data.title.slice(0, 57) + '...' : data.title
  const truncatedDesc = dLen > 160 ? data.description.slice(0, 157) + '...' : data.description

  return (
    <div className="space-y-4">
      <SaveBar onSave={onSave} saving={saving} isDirty={isDirty} />
      <Button
        variant="outline"
        onClick={onBack}
        className="border-[#005B2E] text-[#005B2E] font-bold"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar à lista
      </Button>
      <CmsCard title={`SEO — ${pageName}`}>
        <CmsField label={`Título SEO (Meta Title) — ${tLen}/60`}>
          <CmsTextInput value={data.title} onChange={(v) => onUpdate(pageUrl, { title: v })} />
          <p
            className={`text-xs ${tLen > 60 ? 'text-red-500' : tLen > 50 ? 'text-orange-500' : 'text-green-600'}`}
          >
            {tLen > 60 ? 'Muito longo' : tLen > 50 ? 'Próximo do limite' : 'Tamanho ideal'}
          </p>
        </CmsField>
        <CmsField label={`Descrição SEO (Meta Description) — ${dLen}/160`}>
          <CmsTextArea
            value={data.description}
            onChange={(v) => onUpdate(pageUrl, { description: v })}
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
              value={data.keywords}
              onChange={(v) => onUpdate(pageUrl, { keywords: v })}
            />
          </CmsField>
          <CmsField label="URL Amigável (Slug)">
            <CmsTextInput
              value={data.slug}
              onChange={(v) => onUpdate(pageUrl, { slug: v })}
              placeholder="/minha-pagina"
            />
          </CmsField>
          <CmsField label="Canonical URL">
            <CmsTextInput
              value={data.canonicalUrl}
              onChange={(v) => onUpdate(pageUrl, { canonicalUrl: v })}
            />
          </CmsField>
          <CmsField label="Imagem para Compartilhamento (Open Graph)">
            <MediaPicker
              value={data.ogImage}
              onChange={(v) => onUpdate(pageUrl, { ogImage: v })}
              label="Selecionar Imagem"
            />
          </CmsField>
          <CmsField label="Título para Redes Sociais">
            <CmsTextInput
              value={data.ogTitle}
              onChange={(v) => onUpdate(pageUrl, { ogTitle: v })}
            />
          </CmsField>
          <CmsField label="Descrição para Redes Sociais">
            <CmsTextInput
              value={data.ogDescription}
              onChange={(v) => onUpdate(pageUrl, { ogDescription: v })}
            />
          </CmsField>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <CmsToggle
            checked={data.index}
            onChange={(v) => onUpdate(pageUrl, { index: v })}
            label="Permitir indexação (Sim/Não)"
          />
          <CmsToggle
            checked={data.follow}
            onChange={(v) => onUpdate(pageUrl, { follow: v })}
            label="Permitir seguir links"
          />
        </div>
      </CmsCard>
      <CmsCard title="Prévia no Google">
        <div className="border rounded-lg p-4 bg-white max-w-xl">
          <div className="text-xs text-green-700 truncate">
            {window.location.origin}
            {slug}
          </div>
          <div className="text-lg text-blue-700 truncate">{truncatedTitle || 'Sem título'}</div>
          <div className="text-sm text-gray-600 line-clamp-2">
            {truncatedDesc || 'Sem descrição'}
          </div>
        </div>
      </CmsCard>
    </div>
  )
}
