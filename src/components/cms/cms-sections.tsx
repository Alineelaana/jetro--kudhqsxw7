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
import { SECTION_TEMPLATES } from '@/lib/cms-types'

export function CmsSections() {
  const { data, update, loading, saving, save, isDirty } = useCmsSection('sections')
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
        title="Seções do Site"
        action={
          <AddButton
            onClick={() =>
              update({
                items: [
                  ...items,
                  {
                    id: crypto.randomUUID(),
                    template: 'Texto simples',
                    name: 'Nova Seção',
                    title: '',
                    subtitle: '',
                    content: '',
                    active: true,
                    order: items.length + 1,
                    desktopVisible: true,
                    mobileVisible: true,
                    backgroundColor: '#FFFFFF',
                    textColor: '#000000',
                    columns: 1,
                    alignment: 'left',
                    spacing: 'medium',
                  },
                ],
              })
            }
            label="Adicionar Nova Seção"
          />
        }
      >
        <div className="flex flex-wrap gap-2 mb-2">
          {SECTION_TEMPLATES.map((tpl) => (
            <span
              key={tpl}
              className="text-xs px-2 py-1 rounded bg-[#005B2E]/10 text-[#005B2E] font-medium"
            >
              {tpl}
            </span>
          ))}
        </div>
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
                  <span className="px-2 py-0.5 rounded bg-[#C89B3C]/15 text-[#C89B3C] text-xs">
                    {item.template as string}
                  </span>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CmsField label="Template">
                      <select
                        value={item.template as string}
                        onChange={(e) => updateItem(idx, { template: e.target.value })}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                      >
                        {SECTION_TEMPLATES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </CmsField>
                    <CmsField label="Nome Interno">
                      <CmsTextInput
                        value={item.name as string}
                        onChange={(v) => updateItem(idx, { name: v })}
                      />
                    </CmsField>
                  </div>
                  <CmsField label="Título">
                    <CmsTextInput
                      value={(item.title as string) || ''}
                      onChange={(v) => updateItem(idx, { title: v })}
                    />
                  </CmsField>
                  <CmsField label="Subtítulo">
                    <CmsTextInput
                      value={(item.subtitle as string) || ''}
                      onChange={(v) => updateItem(idx, { subtitle: v })}
                    />
                  </CmsField>
                  <CmsField label="Conteúdo">
                    <CmsTextArea
                      value={(item.content as string) || ''}
                      onChange={(v) => updateItem(idx, { content: v })}
                    />
                  </CmsField>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <CmsField label="Cor de Fundo">
                      <CmsColorInput
                        value={(item.backgroundColor as string) || '#FFFFFF'}
                        onChange={(v) => updateItem(idx, { backgroundColor: v })}
                      />
                    </CmsField>
                    <CmsField label="Cor do Texto">
                      <CmsColorInput
                        value={(item.textColor as string) || '#000000'}
                        onChange={(v) => updateItem(idx, { textColor: v })}
                      />
                    </CmsField>
                    <CmsField label="Colunas">
                      <CmsTextInput
                        value={String(item.columns || 1)}
                        onChange={(v) => updateItem(idx, { columns: parseInt(v) || 1 })}
                      />
                    </CmsField>
                    <CmsField label="Alinhamento">
                      <select
                        value={(item.alignment as string) || 'left'}
                        onChange={(e) => updateItem(idx, { alignment: e.target.value })}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                      >
                        <option value="left">Esquerda</option>
                        <option value="center">Centro</option>
                        <option value="right">Direita</option>
                      </select>
                    </CmsField>
                  </div>
                  <div className="flex gap-4">
                    <CmsToggle
                      checked={(item.desktopVisible as boolean) ?? true}
                      onChange={(v) => updateItem(idx, { desktopVisible: v })}
                      label="Visível no desktop"
                    />
                    <CmsToggle
                      checked={(item.mobileVisible as boolean) ?? true}
                      onChange={(v) => updateItem(idx, { mobileVisible: v })}
                      label="Visível no mobile"
                    />
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
