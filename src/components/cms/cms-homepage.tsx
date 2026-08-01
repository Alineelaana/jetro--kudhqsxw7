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
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Eye } from 'lucide-react'
import { useState } from 'react'

export function CmsHomepage() {
  const { data, update, loading, saving, save, isDirty } = useCmsSection('homepage')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (loading || !data) return <LoadingState />
  const sections = (data.sections as Array<Record<string, unknown>>) || []

  const updateSection = (idx: number, patch: Record<string, unknown>) => {
    const items = [...sections]
    items[idx] = { ...items[idx], ...patch }
    update({ sections: items })
  }

  return (
    <div className="space-y-4">
      <SaveBar onSave={save} saving={saving} isDirty={isDirty} />
      <CmsCard
        title="Seções da Página Inicial"
        action={
          <AddButton
            onClick={() =>
              update({
                sections: [
                  ...sections,
                  {
                    id: crypto.randomUUID(),
                    name: 'Nova Seção',
                    title: '',
                    subtitle: '',
                    text: '',
                    active: true,
                    order: sections.length + 1,
                    alignment: 'center',
                    backgroundColor: '#FFFFFF',
                    textColor: '#000000',
                  },
                ],
              })
            }
            label="Adicionar Seção"
          />
        }
      >
        {sections.map((section, idx) => (
          <Card key={section.id as string} className="border border-border">
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === section.id ? null : (section.id as string))
                  }
                  className="flex items-center gap-2 text-sm font-bold text-foreground"
                >
                  {expandedId === section.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  {section.name as string}
                </button>
                <ListActions
                  onUp={
                    idx > 0
                      ? () => {
                          const items = [...sections]
                          ;[items[idx - 1], items[idx]] = [items[idx], items[idx - 1]]
                          update({ sections: items })
                        }
                      : undefined
                  }
                  onDown={
                    idx < sections.length - 1
                      ? () => {
                          const items = [...sections]
                          ;[items[idx + 1], items[idx]] = [items[idx], items[idx + 1]]
                          update({ sections: items })
                        }
                      : undefined
                  }
                  onDuplicate={() =>
                    update({
                      sections: [
                        ...sections,
                        {
                          ...section,
                          id: crypto.randomUUID(),
                          name: (section.name as string) + ' (cópia)',
                        },
                      ],
                    })
                  }
                  onToggle={() => updateSection(idx, { active: !section.active })}
                  onDelete={() => update({ sections: sections.filter((_, i) => i !== idx) })}
                  active={section.active as boolean}
                />
              </div>
              {expandedId === section.id && (
                <div className="mt-4 space-y-3">
                  <CmsField label="Nome Interno">
                    <CmsTextInput
                      value={section.name as string}
                      onChange={(v) => updateSection(idx, { name: v })}
                    />
                  </CmsField>
                  <CmsField label="Título">
                    <CmsTextInput
                      value={section.title as string}
                      onChange={(v) => updateSection(idx, { title: v })}
                    />
                  </CmsField>
                  <CmsField label="Subtítulo">
                    <CmsTextInput
                      value={section.subtitle as string}
                      onChange={(v) => updateSection(idx, { subtitle: v })}
                    />
                  </CmsField>
                  <CmsField label="Texto Principal">
                    <CmsTextArea
                      value={section.text as string}
                      onChange={(v) => updateSection(idx, { text: v })}
                    />
                  </CmsField>
                  <CmsField label="Texto Complementar">
                    <CmsTextArea
                      value={(section.complementaryText as string) || ''}
                      onChange={(v) => updateSection(idx, { complementaryText: v })}
                      rows={2}
                    />
                  </CmsField>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CmsField label="Texto Botão Primário">
                      <CmsTextInput
                        value={(section.primaryButtonText as string) || ''}
                        onChange={(v) => updateSection(idx, { primaryButtonText: v })}
                      />
                    </CmsField>
                    <CmsField label="Link Botão Primário">
                      <CmsTextInput
                        value={(section.primaryButtonLink as string) || ''}
                        onChange={(v) => updateSection(idx, { primaryButtonLink: v })}
                      />
                    </CmsField>
                    <CmsField label="Texto Botão Secundário">
                      <CmsTextInput
                        value={(section.secondaryButtonText as string) || ''}
                        onChange={(v) => updateSection(idx, { secondaryButtonText: v })}
                      />
                    </CmsField>
                    <CmsField label="Link Botão Secundário">
                      <CmsTextInput
                        value={(section.secondaryButtonLink as string) || ''}
                        onChange={(v) => updateSection(idx, { secondaryButtonLink: v })}
                      />
                    </CmsField>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <CmsField label="Cor de Fundo">
                      <CmsColorInput
                        value={section.backgroundColor as string}
                        onChange={(v) => updateSection(idx, { backgroundColor: v })}
                      />
                    </CmsField>
                    <CmsField label="Cor do Texto">
                      <CmsColorInput
                        value={section.textColor as string}
                        onChange={(v) => updateSection(idx, { textColor: v })}
                      />
                    </CmsField>
                    <CmsField label="Alinhamento">
                      <select
                        value={section.alignment as string}
                        onChange={(e) => updateSection(idx, { alignment: e.target.value })}
                        className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                      >
                        <option value="left">Esquerda</option>
                        <option value="center">Centro</option>
                        <option value="right">Direita</option>
                      </select>
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
