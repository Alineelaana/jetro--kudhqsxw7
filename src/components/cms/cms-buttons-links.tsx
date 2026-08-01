import {
  useCmsSection,
  CmsCard,
  CmsField,
  CmsTextInput,
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
import { LINK_TYPES } from '@/lib/cms-types'

export function CmsButtonsLinks() {
  const { data, update, loading, saving, save, isDirty } = useCmsSection('buttons')
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
        title="Botões e Chamadas"
        action={
          <AddButton
            onClick={() =>
              update({
                items: [
                  ...items,
                  {
                    id: crypto.randomUUID(),
                    name: 'Novo Botão',
                    text: '',
                    link: '',
                    linkType: 'URL externa',
                    newTab: false,
                    color: '#005B2E',
                    textColor: '#FFFFFF',
                    style: 'solid',
                    icon: '',
                    iconPosition: 'left',
                    active: true,
                  },
                ],
              })
            }
            label="Adicionar Botão"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CmsField label="Nome Interno">
                      <CmsTextInput
                        value={item.name as string}
                        onChange={(v) => updateItem(idx, { name: v })}
                      />
                    </CmsField>
                    <CmsField label="Texto Visível">
                      <CmsTextInput
                        value={item.text as string}
                        onChange={(v) => updateItem(idx, { text: v })}
                      />
                    </CmsField>
                    <CmsField label="Link">
                      <CmsTextInput
                        value={item.link as string}
                        onChange={(v) => updateItem(idx, { link: v })}
                      />
                    </CmsField>
                    <CmsField label="Tipo de Link">
                      <select
                        value={item.linkType as string}
                        onChange={(e) => updateItem(idx, { linkType: e.target.value })}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                      >
                        {LINK_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </CmsField>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <CmsField label="Cor do Botão">
                      <CmsColorInput
                        value={item.color as string}
                        onChange={(v) => updateItem(idx, { color: v })}
                      />
                    </CmsField>
                    <CmsField label="Cor do Texto">
                      <CmsColorInput
                        value={item.textColor as string}
                        onChange={(v) => updateItem(idx, { textColor: v })}
                      />
                    </CmsField>
                    <CmsField label="Ícone">
                      <CmsTextInput
                        value={(item.icon as string) || ''}
                        onChange={(v) => updateItem(idx, { icon: v })}
                        placeholder="MessageCircle"
                      />
                    </CmsField>
                    <CmsField label="Estilo">
                      <select
                        value={item.style as string}
                        onChange={(e) => updateItem(idx, { style: e.target.value })}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                      >
                        <option value="solid">Sólido</option>
                        <option value="outline">Contorno</option>
                      </select>
                    </CmsField>
                  </div>
                  <div className="flex gap-4">
                    <CmsToggle
                      checked={item.newTab as boolean}
                      onChange={(v) => updateItem(idx, { newTab: v })}
                      label="Abrir em nova aba"
                    />
                    <CmsToggle
                      checked={item.active as boolean}
                      onChange={(v) => updateItem(idx, { active: v })}
                      label="Ativo"
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
