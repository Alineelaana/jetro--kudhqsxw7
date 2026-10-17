import {
  useCmsSection,
  CmsCard,
  CmsField,
  CmsTextInput,
  CmsTextArea,
  CmsToggle,
  SaveBar,
  LoadingState,
  ListActions,
} from '@/components/cms/cms-shared'
import { SERVICES } from '@/lib/constants'

export function CmsServicesSettings() {
  const { data, update, loading, saving, save, isDirty } = useCmsSection('services')
  if (loading || !data) return <LoadingState />
  const visible = (data.visibleServices as string[]) || []
  const order = (data.serviceOrder as string[]) || []

  const toggleService = (id: string) => {
    update({
      visibleServices: visible.includes(id) ? visible.filter((s) => s !== id) : [...visible, id],
    })
  }

  return (
    <div className="space-y-4">
      <SaveBar onSave={save} saving={saving} isDirty={isDirty} />
      <CmsCard title="Configurações da Seção de Serviços">
        <CmsField label="Título da Seção">
          <CmsTextInput
            value={data.sectionTitle as string}
            onChange={(v) => update({ sectionTitle: v })}
          />
        </CmsField>
        <CmsField label="Subtítulo">
          <CmsTextInput
            value={data.sectionSubtitle as string}
            onChange={(v) => update({ sectionSubtitle: v })}
          />
        </CmsField>
        <CmsField label="Texto Introdutório">
          <CmsTextArea
            value={data.introText as string}
            onChange={(v) => update({ introText: v })}
          />
        </CmsField>
      </CmsCard>
      <CmsCard title="Visibilidade e Ordem dos Serviços">
        <div className="space-y-2">
          {SERVICES.map((serviceName, idx) => (
            <div
              key={serviceName}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-white"
            >
              <div className="flex items-center gap-3">
                <CmsToggle
                  checked={visible.includes(serviceName)}
                  onChange={() => toggleService(serviceName)}
                />
                <span className="text-sm font-medium">{serviceName}</span>
              </div>
              <ListActions
                onUp={
                  idx > 0
                    ? () => {
                        const arr = [...SERVICES]
                        ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
                        update({ serviceOrder: arr })
                      }
                    : undefined
                }
                onDown={
                  idx < SERVICES.length - 1
                    ? () => {
                        const arr = [...SERVICES]
                        ;[arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]]
                        update({ serviceOrder: arr })
                      }
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      </CmsCard>
    </div>
  )
}

export function CmsInstitutional() {
  const { data, update, loading, saving, save, isDirty } = useCmsSection('institutional')
  if (loading || !data) return <LoadingState />
  return (
    <div className="space-y-4">
      <SaveBar onSave={save} saving={saving} isDirty={isDirty} />
      <CmsCard title="Conteúdo Institucional">
        <CmsField label="Título Sobre">
          <CmsTextInput
            value={data.aboutTitle as string}
            onChange={(v) => update({ aboutTitle: v })}
          />
        </CmsField>
        <CmsField label="Texto Sobre">
          <CmsTextArea
            value={data.aboutText as string}
            onChange={(v) => update({ aboutText: v })}
          />
        </CmsField>
        <CmsField label="Missão">
          <CmsTextArea
            value={data.mission as string}
            onChange={(v) => update({ mission: v })}
            rows={2}
          />
        </CmsField>
        <CmsField label="Visão">
          <CmsTextArea
            value={data.vision as string}
            onChange={(v) => update({ vision: v })}
            rows={2}
          />
        </CmsField>
        <CmsField label="Valores">
          <CmsTextArea
            value={data.values as string}
            onChange={(v) => update({ values: v })}
            rows={2}
          />
        </CmsField>
        <CmsField label="História">
          <CmsTextArea
            value={(data.history as string) || ''}
            onChange={(v) => update({ history: v })}
          />
        </CmsField>
        <CmsToggle
          checked={data.active as boolean}
          onChange={(v) => update({ active: v })}
          label="Seção ativa no site"
        />
      </CmsCard>
    </div>
  )
}
