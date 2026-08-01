import {
  useCmsSection,
  CmsCard,
  CmsField,
  CmsTextInput,
  CmsToggle,
  CmsColorInput,
  SaveBar,
  LoadingState,
  ListActions,
  AddButton,
} from '@/components/cms/cms-shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'

export function CmsHeaderSettings() {
  const { data, update, loading, saving, save, isDirty } = useCmsSection('header')

  if (loading || !data) return <LoadingState />
  const navItems = (data.navItems as Array<Record<string, unknown>>) || []
  const clientBtn = (data.clientAreaButton as Record<string, unknown>) || {}

  const updateNavItem = (idx: number, patch: Record<string, unknown>) => {
    const items = [...navItems]
    items[idx] = { ...items[idx], ...patch }
    update({ navItems: items })
  }

  return (
    <div className="space-y-4">
      <SaveBar onSave={save} saving={saving} isDirty={isDirty} />
      <CmsCard title="Configurações do Cabeçalho">
        <CmsField label="Texto da Logo">
          <CmsTextInput value={data.logoText as string} onChange={(v) => update({ logoText: v })} />
        </CmsField>
        <div className="grid grid-cols-2 gap-4">
          <CmsField label="Tamanho da Logo">
            <CmsTextInput
              value={data.logoSize as string}
              onChange={(v) => update({ logoSize: v })}
            />
          </CmsField>
          <CmsField label="Posição da Logo">
            <select
              value={data.logoPosition as string}
              onChange={(e) => update({ logoPosition: e.target.value })}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>
          </CmsField>
        </div>
        <CmsField label="Cabeçalho Fixo">
          <CmsToggle
            checked={data.fixed as boolean}
            onChange={(v) => update({ fixed: v })}
            label="Manter fixo no topo ao rolar"
          />
        </CmsField>
      </CmsCard>

      <CmsCard
        title="Itens do Menu"
        action={
          <AddButton
            onClick={() =>
              update({
                navItems: [
                  ...navItems,
                  {
                    id: crypto.randomUUID(),
                    label: 'Novo Item',
                    link: '/',
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
        {navItems.map((item, idx) => (
          <Card key={item.id as string} className="border border-border">
            <CardContent className="py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{item.label as string}</span>
                <ListActions
                  onUp={
                    idx > 0
                      ? () => {
                          const items = [...navItems]
                          ;[items[idx - 1], items[idx]] = [items[idx], items[idx - 1]]
                          update({ navItems: items })
                        }
                      : undefined
                  }
                  onDown={
                    idx < navItems.length - 1
                      ? () => {
                          const items = [...navItems]
                          ;[items[idx + 1], items[idx]] = [items[idx], items[idx + 1]]
                          update({ navItems: items })
                        }
                      : undefined
                  }
                  onToggle={() => updateNavItem(idx, { active: !item.active })}
                  onDelete={() => update({ navItems: navItems.filter((_, i) => i !== idx) })}
                  active={item.active as boolean}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <CmsTextInput
                  value={item.label as string}
                  onChange={(v) => updateNavItem(idx, { label: v })}
                  placeholder="Nome"
                />
                <CmsTextInput
                  value={item.link as string}
                  onChange={(v) => updateNavItem(idx, { link: v })}
                  placeholder="Link"
                />
              </div>
              <CmsToggle
                checked={item.newTab as boolean}
                onChange={(v) => updateNavItem(idx, { newTab: v })}
                label="Abrir em nova aba"
              />
            </CardContent>
          </Card>
        ))}
      </CmsCard>

      <CmsCard title="Botão Área do Cliente">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField label="Texto">
            <CmsTextInput
              value={clientBtn.text as string}
              onChange={(v) => update({ clientAreaButton: { ...clientBtn, text: v } })}
            />
          </CmsField>
          <CmsField label="Link">
            <CmsTextInput
              value={clientBtn.link as string}
              onChange={(v) => update({ clientAreaButton: { ...clientBtn, link: v } })}
            />
          </CmsField>
          <CmsField label="Cor do Botão">
            <CmsColorInput
              value={clientBtn.color as string}
              onChange={(v) => update({ clientAreaButton: { ...clientBtn, color: v } })}
            />
          </CmsField>
          <CmsField label="Cor do Texto">
            <CmsColorInput
              value={clientBtn.textColor as string}
              onChange={(v) => update({ clientAreaButton: { ...clientBtn, textColor: v } })}
            />
          </CmsField>
        </div>
        <CmsToggle
          checked={clientBtn.visible as boolean}
          onChange={(v) => update({ clientAreaButton: { ...clientBtn, visible: v } })}
          label="Exibir botão"
        />
      </CmsCard>
    </div>
  )
}
