import {
  useCmsSection,
  CmsCard,
  CmsField,
  CmsTextInput,
  CmsColorInput,
  SaveBar,
  LoadingState,
} from '@/components/cms/cms-shared'
import { Button } from '@/components/ui/button'
import { DEFAULT_IDENTITY } from '@/lib/cms-defaults'
import { RotateCcw } from 'lucide-react'

export function CmsVisualIdentity() {
  const { data, update, loading, saving, save, isDirty } = useCmsSection('identity')
  if (loading || !data) return <LoadingState />

  const handleReset = () => {
    if (!confirm('Restaurar identidade visual padrão? Todas as alterações serão perdidas.')) return
    update(DEFAULT_IDENTITY)
  }

  return (
    <div className="space-y-4">
      <SaveBar onSave={save} saving={saving} isDirty={isDirty} />
      <div className="flex justify-end">
        <Button
          onClick={handleReset}
          variant="outline"
          className="border-[#C89B3C] text-[#C89B3C] hover:bg-[#C89B3C]/10 font-bold"
        >
          <RotateCcw className="w-4 h-4 mr-2" /> Restaurar identidade visual padrão
        </Button>
      </div>

      <CmsCard title="Cores da Marca">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField label="Verde Institucional">
            <CmsColorInput
              value={data.primaryColor as string}
              onChange={(v) => update({ primaryColor: v })}
            />
          </CmsField>
          <CmsField label="Verde Escuro">
            <CmsColorInput
              value={data.darkGreenColor as string}
              onChange={(v) => update({ darkGreenColor: v })}
            />
          </CmsField>
          <CmsField label="Dourado">
            <CmsColorInput
              value={data.goldColor as string}
              onChange={(v) => update({ goldColor: v })}
            />
          </CmsField>
          <CmsField label="Branco">
            <CmsColorInput
              value={data.whiteColor as string}
              onChange={(v) => update({ whiteColor: v })}
            />
          </CmsField>
          <CmsField label="Cor de Fundo">
            <CmsColorInput
              value={data.backgroundColor as string}
              onChange={(v) => update({ backgroundColor: v })}
            />
          </CmsField>
          <CmsField label="Cor do Texto">
            <CmsColorInput
              value={data.textColor as string}
              onChange={(v) => update({ textColor: v })}
            />
          </CmsField>
          <CmsField label="Cor do Botão">
            <CmsColorInput
              value={data.buttonColor as string}
              onChange={(v) => update({ buttonColor: v })}
            />
          </CmsField>
        </div>
      </CmsCard>

      <CmsCard title="Tipografia">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField label="Tipografia Primária">
            <CmsTextInput
              value={data.primaryTypography as string}
              onChange={(v) => update({ primaryTypography: v })}
            />
          </CmsField>
          <CmsField label="Tipografia Secundária">
            <CmsTextInput
              value={data.secondaryTypography as string}
              onChange={(v) => update({ secondaryTypography: v })}
            />
          </CmsField>
          <CmsField label="Tamanho de Títulos">
            <CmsTextInput
              value={data.titleSize as string}
              onChange={(v) => update({ titleSize: v })}
            />
          </CmsField>
          <CmsField label="Tamanho do Texto">
            <CmsTextInput
              value={data.bodySize as string}
              onChange={(v) => update({ bodySize: v })}
            />
          </CmsField>
        </div>
      </CmsCard>

      <CmsCard title="Estilos de Componentes">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CmsField label="Border Radius">
            <CmsTextInput
              value={data.borderRadius as string}
              onChange={(v) => update({ borderRadius: v })}
            />
          </CmsField>
          <CmsField label="Sombra">
            <CmsTextInput value={data.shadow as string} onChange={(v) => update({ shadow: v })} />
          </CmsField>
          <CmsField label="Estilo de Card">
            <CmsTextInput
              value={data.cardStyle as string}
              onChange={(v) => update({ cardStyle: v })}
            />
          </CmsField>
          <CmsField label="Estilo de Botão">
            <CmsTextInput
              value={data.buttonStyle as string}
              onChange={(v) => update({ buttonStyle: v })}
            />
          </CmsField>
        </div>
      </CmsCard>
    </div>
  )
}
