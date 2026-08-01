import {
  useCmsSection,
  CmsCard,
  CmsField,
  CmsTextInput,
  CmsTextArea,
  CmsColorInput,
  SaveBar,
  LoadingState,
  ListActions,
  AddButton,
} from '@/components/cms/cms-shared'
import { Card, CardContent } from '@/components/ui/card'

export function CmsFooterSettings() {
  const { data, update, loading, saving, save, isDirty } = useCmsSection('footer')
  if (loading || !data) return <LoadingState />
  const columns = (data.columns as Array<Record<string, unknown>>) || []
  const socialLinks = (data.socialLinks as Record<string, string>) || {}

  const updateColumn = (idx: number, patch: Record<string, unknown>) => {
    const arr = [...columns]
    arr[idx] = { ...arr[idx], ...patch }
    update({ columns: arr })
  }

  const updateSocial = (key: string, value: string) =>
    update({ socialLinks: { ...socialLinks, [key]: value } })

  return (
    <div className="space-y-4">
      <SaveBar onSave={save} saving={saving} isDirty={isDirty} />
      <CmsCard title="Informações de Contato">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField label="Telefone">
            <CmsTextInput
              value={(data.phone as string) || ''}
              onChange={(v) => update({ phone: v })}
            />
          </CmsField>
          <CmsField label="WhatsApp">
            <CmsTextInput
              value={(data.whatsapp as string) || ''}
              onChange={(v) => update({ whatsapp: v })}
            />
          </CmsField>
          <CmsField label="E-mail">
            <CmsTextInput
              value={(data.email as string) || ''}
              onChange={(v) => update({ email: v })}
            />
          </CmsField>
          <CmsField label="Website">
            <CmsTextInput
              value={(data.website as string) || ''}
              onChange={(v) => update({ website: v })}
            />
          </CmsField>
        </div>
        <CmsField label="Endereço">
          <CmsTextArea
            value={(data.address as string) || ''}
            onChange={(v) => update({ address: v })}
            rows={2}
          />
        </CmsField>
      </CmsCard>
      <CmsCard title="Texto Institucional e Copyright">
        <CmsField label="Texto Institucional">
          <CmsTextArea
            value={(data.institutionalText as string) || ''}
            onChange={(v) => update({ institutionalText: v })}
            rows={3}
          />
        </CmsField>
        <CmsField label="Copyright">
          <CmsTextInput
            value={(data.copyrightText as string) || ''}
            onChange={(v) => update({ copyrightText: v })}
          />
        </CmsField>
      </CmsCard>
      <CmsCard title="Redes Sociais">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField label="Facebook">
            <CmsTextInput
              value={socialLinks.facebook || ''}
              onChange={(v) => updateSocial('facebook', v)}
              placeholder="https://facebook.com/..."
            />
          </CmsField>
          <CmsField label="Instagram">
            <CmsTextInput
              value={socialLinks.instagram || ''}
              onChange={(v) => updateSocial('instagram', v)}
              placeholder="https://instagram.com/..."
            />
          </CmsField>
          <CmsField label="LinkedIn">
            <CmsTextInput
              value={socialLinks.linkedin || ''}
              onChange={(v) => updateSocial('linkedin', v)}
              placeholder="https://linkedin.com/..."
            />
          </CmsField>
          <CmsField label="YouTube">
            <CmsTextInput
              value={socialLinks.youtube || ''}
              onChange={(v) => updateSocial('youtube', v)}
              placeholder="https://youtube.com/..."
            />
          </CmsField>
        </div>
      </CmsCard>
      <CmsCard title="Aparência">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField label="Cor de Fundo">
            <CmsColorInput
              value={(data.backgroundColor as string) || '#01361D'}
              onChange={(v) => update({ backgroundColor: v })}
            />
          </CmsField>
          <CmsField label="Cor do Texto">
            <CmsColorInput
              value={(data.textColor as string) || '#FFFFFF'}
              onChange={(v) => update({ textColor: v })}
            />
          </CmsField>
        </div>
      </CmsCard>
      <CmsCard
        title="Colunas do Rodapé"
        action={
          <AddButton
            onClick={() =>
              update({
                columns: [...columns, { id: crypto.randomUUID(), title: 'Nova Coluna', links: [] }],
              })
            }
            label="Adicionar Coluna"
          />
        }
      >
        {columns.map((col, idx) => (
          <Card key={col.id as string} className="border border-border">
            <CardContent className="py-3 space-y-2">
              <div className="flex items-center justify-between">
                <CmsTextInput
                  value={col.title as string}
                  onChange={(v) => updateColumn(idx, { title: v })}
                  placeholder="Título da Coluna"
                />
                <ListActions
                  onUp={
                    idx > 0
                      ? () => {
                          const arr = [...columns]
                          ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
                          update({ columns: arr })
                        }
                      : undefined
                  }
                  onDown={
                    idx < columns.length - 1
                      ? () => {
                          const arr = [...columns]
                          ;[arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]]
                          update({ columns: arr })
                        }
                      : undefined
                  }
                  onDelete={() => update({ columns: columns.filter((_, i) => i !== idx) })}
                />
              </div>
              <CmsTextArea
                value={((col.links as Array<{ label: string; link: string }>) || [])
                  .map((l) => `${l.label}|${l.link}`)
                  .join('\n')}
                onChange={(v) =>
                  updateColumn(idx, {
                    links: v
                      .split('\n')
                      .filter(Boolean)
                      .map((line) => {
                        const [label, link] = line.split('|')
                        return { label: label || '', link: link || '' }
                      }),
                  })
                }
                rows={3}
                placeholder={'Nome do link|URL do link\nUm por linha'}
              />
            </CardContent>
          </Card>
        ))}
      </CmsCard>
    </div>
  )
}
