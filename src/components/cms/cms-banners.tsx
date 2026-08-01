import {
  useCmsSection,
  CmsCard,
  CmsField,
  CmsTextInput,
  CmsTextArea,
  CmsColorInput,
  CmsToggle,
  SaveBar,
  LoadingState,
  ListActions,
  AddButton,
} from '@/components/cms/cms-shared'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function CmsBanners() {
  const { data, update, loading, saving, save, isDirty } = useCmsSection('banners')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (loading || !data) return <LoadingState />
  const items = (data.items as Array<Record<string, unknown>>) || []

  const updateItem = (idx: number, patch: Record<string, unknown>) => {
    const arr = [...items]
    arr[idx] = { ...arr[idx], ...patch }
    update({ items: arr })
  }

  return (
    <div className="space-y-4">
      <SaveBar onSave={save} saving={saving} isDirty={isDirty} />
      <CmsCard
        title="Banners"
        action={
          <AddButton
            onClick={() =>
              update({
                items: [
                  ...items,
                  {
                    id: crypto.randomUUID(),
                    name: 'Novo Banner',
                    title: '',
                    subtitle: '',
                    text: '',
                    buttonText: '',
                    buttonLink: '',
                    active: true,
                    order: items.length + 1,
                    textPosition: 'center',
                    textColor: '#FFFFFF',
                    overlay: false,
                    overlayColor: '#000000',
                    opacity: 40,
                    startDate: '',
                    endDate: '',
                  },
                ],
              })
            }
            label="Adicionar Banner"
          />
        }
      >
        {items.map((item, idx) => (
          <Card key={item.id as string} className="border border-border">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : (item.id as string))}
                  className="flex items-center gap-2 text-sm font-bold"
                >
                  {expandedId === item.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {item.name as string}
                </button>
                <ListActions
                  onUp={
                    idx > 0
                      ? () => {
                          const arr = [...items]
                          ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
                          update({ items: arr })
                        }
                      : undefined
                  }
                  onDown={
                    idx < items.length - 1
                      ? () => {
                          const arr = [...items]
                          ;[arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]]
                          update({ items: arr })
                        }
                      : undefined
                  }
                  onDuplicate={() =>
                    update({
                      items: [
                        ...items,
                        {
                          ...item,
                          id: crypto.randomUUID(),
                          name: (item.name as string) + ' (cópia)',
                        },
                      ],
                    })
                  }
                  onToggle={() => updateItem(idx, { active: !item.active })}
                  onDelete={() => update({ items: items.filter((_, i) => i !== idx) })}
                  active={item.active as boolean}
                />
              </div>
              {expandedId === item.id && (
                <div className="mt-4 space-y-3">
                  <CmsField label="Nome Interno">
                    <CmsTextInput
                      value={item.name as string}
                      onChange={(v) => updateItem(idx, { name: v })}
                    />
                  </CmsField>
                  <CmsField label="Título">
                    <CmsTextInput
                      value={item.title as string}
                      onChange={(v) => updateItem(idx, { title: v })}
                    />
                  </CmsField>
                  <CmsField label="Subtítulo">
                    <CmsTextInput
                      value={item.subtitle as string}
                      onChange={(v) => updateItem(idx, { subtitle: v })}
                    />
                  </CmsField>
                  <CmsField label="Texto">
                    <CmsTextArea
                      value={item.text as string}
                      onChange={(v) => updateItem(idx, { text: v })}
                      rows={2}
                    />
                  </CmsField>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CmsField label="Texto do Botão">
                      <CmsTextInput
                        value={(item.buttonText as string) || ''}
                        onChange={(v) => updateItem(idx, { buttonText: v })}
                      />
                    </CmsField>
                    <CmsField label="Link do Botão">
                      <CmsTextInput
                        value={(item.buttonLink as string) || ''}
                        onChange={(v) => updateItem(idx, { buttonLink: v })}
                      />
                    </CmsField>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CmsField label="Cor do Texto">
                      <CmsColorInput
                        value={item.textColor as string}
                        onChange={(v) => updateItem(idx, { textColor: v })}
                      />
                    </CmsField>
                    <CmsField label="Posição do Texto">
                      <select
                        value={item.textPosition as string}
                        onChange={(e) => updateItem(idx, { textPosition: e.target.value })}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                      >
                        <option value="left">Esquerda</option>
                        <option value="center">Centro</option>
                        <option value="right">Direita</option>
                      </select>
                    </CmsField>
                  </div>
                  <CmsToggle
                    checked={item.overlay as boolean}
                    onChange={(v) => updateItem(idx, { overlay: v })}
                    label="Ativar overlay"
                  />
                  {item.overlay && (
                    <div className="grid grid-cols-2 gap-3">
                      <CmsField label="Cor do Overlay">
                        <CmsColorInput
                          value={item.overlayColor as string}
                          onChange={(v) => updateItem(idx, { overlayColor: v })}
                        />
                      </CmsField>
                      <CmsField label="Opacidade (%)">
                        <CmsTextInput
                          value={String(item.opacity || 40)}
                          onChange={(v) => updateItem(idx, { opacity: parseInt(v) || 0 })}
                        />
                      </CmsField>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <CmsField label="Data de Início">
                      <input
                        type="date"
                        value={(item.startDate as string) || ''}
                        onChange={(e) => updateItem(idx, { startDate: e.target.value })}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm"
                      />
                    </CmsField>
                    <CmsField label="Data de Fim">
                      <input
                        type="date"
                        value={(item.endDate as string) || ''}
                        onChange={(e) => updateItem(idx, { endDate: e.target.value })}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm"
                      />
                    </CmsField>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CmsCard>
    </div>
  )
}
