import {
  useCmsSection,
  CmsCard,
  CmsField,
  CmsTextInput,
  CmsToggle,
  SaveBar,
  LoadingState,
  ListActions,
  AddButton,
} from '@/components/cms/cms-shared'
import { Card, CardContent } from '@/components/ui/card'

export function CmsNavigationMenu() {
  const { data, update, loading, saving, save, isDirty } = useCmsSection('navigation')
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
        title="Menu de Navegação"
        action={
          <AddButton
            onClick={() =>
              update({
                items: [
                  ...items,
                  {
                    id: crypto.randomUUID(),
                    name: 'Novo Item',
                    link: '/',
                    icon: '',
                    visibility: 'always',
                    newTab: false,
                    active: true,
                  },
                ],
              })
            }
            label="Adicionar Item"
          />
        }
      >
        {items.map((item, idx) => (
          <Card key={item.id as string} className="border border-border">
            <CardContent className="py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{item.name as string}</span>
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
                  onToggle={() => updateItem(idx, { active: !item.active })}
                  onDelete={() => update({ items: items.filter((_, i) => i !== idx) })}
                  active={item.active as boolean}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <CmsTextInput
                  value={item.name as string}
                  onChange={(v) => updateItem(idx, { name: v })}
                  placeholder="Nome"
                />
                <CmsTextInput
                  value={item.link as string}
                  onChange={(v) => updateItem(idx, { link: v })}
                  placeholder="Link"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <CmsField label="Ícone">
                  <CmsTextInput
                    value={(item.icon as string) || ''}
                    onChange={(v) => updateItem(idx, { icon: v })}
                    placeholder="Home"
                  />
                </CmsField>
                <CmsField label="Visibilidade">
                  <select
                    value={item.visibility as string}
                    onChange={(e) => updateItem(idx, { visibility: e.target.value })}
                    className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
                  >
                    <option value="always">Sempre visível</option>
                    <option value="visitors">Apenas visitantes</option>
                    <option value="logged">Apenas logados</option>
                  </select>
                </CmsField>
              </div>
              <CmsToggle
                checked={item.newTab as boolean}
                onChange={(v) => updateItem(idx, { newTab: v })}
                label="Abrir em nova aba"
              />
            </CardContent>
          </Card>
        ))}
      </CmsCard>
    </div>
  )
}
