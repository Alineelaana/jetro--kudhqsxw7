import { useState, useEffect } from 'react'
import { getVitrineItem, createVitrineItem, updateVitrineItem } from '@/services/vitrine'
import {
  VITRINE_TYPES,
  VITRINE_DISPLAY_PAGES,
  VITRINE_CLICK_DESTINATIONS,
  VITRINE_STATUSES,
  VITRINE_TEXT_POSITIONS,
  type VitrineItem,
} from '@/lib/vitrine-types'

const FORM_STATUSES = VITRINE_STATUSES.filter((s) => s.id !== 'publicada')
import { SERVICES } from '@/lib/constants'
import {
  CmsCard,
  CmsField,
  CmsTextInput,
  CmsTextArea,
  CmsColorInput,
  CmsToggle,
  SaveBar,
  LoadingState,
} from '@/components/cms/cms-shared'
import { MediaPicker } from '@/components/cms/media-picker'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Eye } from 'lucide-react'
import { toast } from 'sonner'

type SelOption = { id: string; label: string }
const EMPTY: Partial<VitrineItem> = {
  name: '',
  type: 'banner_full',
  title: '',
  subtitle: '',
  description: '',
  image_desktop: '',
  image_mobile: '',
  image_alt: '',
  button_text: '',
  button_link: '',
  text_color: '#FFFFFF',
  bg_color: '#005B2E',
  overlay_color: '#000000',
  opacity: 40,
  text_position: 'center',
  display_page: 'home_banner',
  specific_page_url: '',
  display_order: 1,
  start_date: '',
  end_date: '',
  active: true,
  linked_services: [],
  click_destination: 'budget_form',
  status: 'rascunho',
  has_publish_history: false,
}

const Sel = ({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: readonly SelOption[]
}) => (
  <select
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
  >
    <option value="">Selecione...</option>
    {options.map((o) => (
      <option key={o.id} value={o.id}>
        {o.label}
      </option>
    ))}
  </select>
)

export function CmsVitrineForm({
  itemId,
  onBack,
  onPreview,
}: {
  itemId: string | null
  onBack: () => void
  onPreview: (item: VitrineItem) => void
}) {
  const [data, setData] = useState<Partial<VitrineItem>>(EMPTY)
  const [original, setOriginal] = useState('')
  const [loading, setLoading] = useState(!!itemId)
  const [saving, setSaving] = useState(false)
  const [showTypeSelect, setShowTypeSelect] = useState(!itemId)

  useEffect(() => {
    if (!itemId) {
      setData(EMPTY)
      setOriginal(JSON.stringify(EMPTY))
      setLoading(false)
      return
    }
    getVitrineItem(itemId)
      .then((item) => {
        setData(item)
        setOriginal(JSON.stringify(item))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [itemId])

  if (loading) return <LoadingState />
  const update = (patch: Partial<VitrineItem>) => setData((prev) => ({ ...prev, ...patch }))
  const isDirty = JSON.stringify(data) !== original

  const handleSave = async () => {
    if (!data.name || !data.type) {
      toast.error('Nome e tipo são obrigatórios.')
      return
    }
    setSaving(true)
    try {
      const saveData = { ...data }
      if (itemId) {
        await updateVitrineItem(itemId, saveData)
        toast.success('Campanha atualizada!')
      } else {
        await createVitrineItem(saveData)
        toast.success('Campanha criada!')
      }
      onBack()
    } catch {
      toast.error('Erro ao salvar.')
    }
    setSaving(false)
  }

  if (showTypeSelect) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <h3 className="text-lg font-bold">Escolha o tipo de conteúdo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {VITRINE_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                update({ type: t.id as VitrineItem['type'] })
                setShowTypeSelect(false)
              }}
              className="p-4 rounded-xl border-2 border-border hover:border-[#005B2E] hover:bg-[#005B2E]/5 transition-all text-left"
            >
              <span className="text-sm font-bold text-[#005B2E]">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const toggleService = (id: string) => {
    const current = data.linked_services || []
    update({
      linked_services: current.includes(id) ? current.filter((s) => s !== id) : [...current, id],
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <Button variant="outline" onClick={() => onPreview(data as VitrineItem)}>
          <Eye className="w-4 h-4 mr-1" /> Prévia
        </Button>
      </div>
      <SaveBar onSave={handleSave} saving={saving} isDirty={isDirty} />
      <CmsCard title="Informações Básicas">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CmsField label="Nome Interno">
            <CmsTextInput value={data.name || ''} onChange={(v) => update({ name: v })} />
          </CmsField>
          <CmsField label="Tipo">
            <Sel
              value={data.type || ''}
              onChange={(v) => update({ type: v as VitrineItem['type'] })}
              options={VITRINE_TYPES}
            />
          </CmsField>
        </div>
        <CmsField label="Título">
          <CmsTextInput value={data.title || ''} onChange={(v) => update({ title: v })} />
        </CmsField>
        <CmsField label="Subtítulo">
          <CmsTextInput value={data.subtitle || ''} onChange={(v) => update({ subtitle: v })} />
        </CmsField>
        <CmsField label="Descrição">
          <CmsTextArea
            value={data.description || ''}
            onChange={(v) => update({ description: v })}
            rows={2}
          />
        </CmsField>
      </CmsCard>
      <CmsCard title="Imagens">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CmsField label="Imagem Desktop">
            <MediaPicker
              value={data.image_desktop || ''}
              onChange={(v) => update({ image_desktop: v })}
              label="Desktop"
            />
          </CmsField>
          <CmsField label="Imagem Mobile">
            <MediaPicker
              value={data.image_mobile || ''}
              onChange={(v) => update({ image_mobile: v })}
              label="Mobile"
            />
          </CmsField>
        </div>
        <CmsField label="Texto Alternativo">
          <CmsTextInput value={data.image_alt || ''} onChange={(v) => update({ image_alt: v })} />
        </CmsField>
      </CmsCard>
      <CmsCard title="Botão e Destino">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CmsField label="Texto do Botão">
            <CmsTextInput
              value={data.button_text || ''}
              onChange={(v) => update({ button_text: v })}
            />
          </CmsField>
          <CmsField label="Link do Botão">
            <CmsTextInput
              value={data.button_link || ''}
              onChange={(v) => update({ button_link: v })}
            />
          </CmsField>
        </div>
        <CmsField label="Destino do Clique">
          <Sel
            value={data.click_destination || ''}
            onChange={(v) => update({ click_destination: v as VitrineItem['click_destination'] })}
            options={VITRINE_CLICK_DESTINATIONS}
          />
        </CmsField>
      </CmsCard>
      <CmsCard title="Aparência">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <CmsField label="Cor do Texto">
            <CmsColorInput
              value={data.text_color || ''}
              onChange={(v) => update({ text_color: v })}
            />
          </CmsField>
          <CmsField label="Cor de Fundo">
            <CmsColorInput value={data.bg_color || ''} onChange={(v) => update({ bg_color: v })} />
          </CmsField>
          <CmsField label="Cor de Sobreposição">
            <CmsColorInput
              value={data.overlay_color || ''}
              onChange={(v) => update({ overlay_color: v })}
            />
          </CmsField>
          <CmsField label="Opacidade (%)">
            <CmsTextInput
              value={String(data.opacity || 0)}
              onChange={(v) => update({ opacity: parseInt(v) || 0 })}
            />
          </CmsField>
        </div>
        <CmsField label="Posição do Texto">
          <Sel
            value={data.text_position || ''}
            onChange={(v) => update({ text_position: v as VitrineItem['text_position'] })}
            options={VITRINE_TEXT_POSITIONS}
          />
        </CmsField>
      </CmsCard>
      <CmsCard title="Exibição">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CmsField label="Página de Exibição">
            <Sel
              value={data.display_page || ''}
              onChange={(v) => update({ display_page: v as VitrineItem['display_page'] })}
              options={VITRINE_DISPLAY_PAGES}
            />
          </CmsField>
          {data.display_page === 'specific_page' && (
            <CmsField label="URL da Página">
              <CmsTextInput
                value={data.specific_page_url || ''}
                onChange={(v) => update({ specific_page_url: v })}
              />
            </CmsField>
          )}
          <CmsField label="Ordem">
            <CmsTextInput
              value={String(data.display_order || 1)}
              onChange={(v) => update({ display_order: parseInt(v) || 1 })}
            />
          </CmsField>
        </div>
      </CmsCard>
      <CmsCard title="Agendamento e Status">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CmsField label="Data de Início">
            <input
              type="datetime-local"
              value={data.start_date || ''}
              onChange={(e) => update({ start_date: e.target.value })}
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
            />
          </CmsField>
          <CmsField label="Data de Encerramento">
            <input
              type="datetime-local"
              value={data.end_date || ''}
              onChange={(e) => update({ end_date: e.target.value })}
              className="w-full border border-border rounded-md px-3 py-2 text-sm"
            />
          </CmsField>
        </div>
        <CmsField label="Status">
          <Sel
            value={data.status || ''}
            onChange={(v) => update({ status: v as VitrineItem['status'] })}
            options={FORM_STATUSES}
          />
        </CmsField>
        <CmsToggle
          checked={data.active || false}
          onChange={(v) => update({ active: v })}
          label="Ativo"
        />
      </CmsCard>
      <CmsCard title="Vincular a Serviços">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SERVICES.map((serviceName) => (
            <label
              key={serviceName}
              className="flex items-center gap-2 p-2 rounded border border-border cursor-pointer hover:bg-muted/30"
            >
              <input
                type="checkbox"
                checked={(data.linked_services || []).includes(serviceName)}
                onChange={() => toggleService(serviceName)}
                className="accent-[#005B2E]"
              />
              <span className="text-sm">{serviceName}</span>
            </label>
          ))}
        </div>
      </CmsCard>
    </div>
  )
}
