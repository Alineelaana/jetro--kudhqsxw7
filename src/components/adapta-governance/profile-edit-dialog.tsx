import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save } from 'lucide-react'
import { saveAiProfile } from '@/services/adapta-governance'
import type { AiProfile } from '@/lib/adapta-governance-types'
import {
  GOVERNANCE_MODULES,
  GOVERNANCE_DATA_TYPES,
  GOVERNANCE_ACTIONS,
  GOVERNANCE_POLICIES,
} from '@/lib/adapta-governance-types'
import { toast } from 'sonner'

function PermRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded border border-gray-200">
      <span className="text-xs">{label}</span>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#005B2E]"
      />
    </div>
  )
}

export function ProfileEditDialog({
  profile,
  onClose,
}: {
  profile: AiProfile
  onClose: () => void
}) {
  const [data, setData] = useState<AiProfile>(profile)
  const [saving, setSaving] = useState(false)

  const togglePerm = (field: keyof AiProfile, key: string, value: boolean) => {
    setData((prev) => ({
      ...prev,
      [field]: { ...(prev[field] as Record<string, boolean>), [key]: value },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveAiProfile(data)
      toast.success('Perfil atualizado')
      onClose()
    } catch {
      toast.error('Erro ao salvar perfil')
    }
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{profile.profile_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold mb-2">Módulos</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GOVERNANCE_MODULES.map((m) => (
                <PermRow
                  key={m.key}
                  label={m.label}
                  checked={data.module_perms?.[m.key] === true}
                  onChange={(v) => togglePerm('module_perms', m.key, v)}
                />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-2">Tipos de Dados</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GOVERNANCE_DATA_TYPES.map((d) => (
                <PermRow
                  key={d.key}
                  label={d.label}
                  checked={data.data_type_perms?.[d.key] === true}
                  onChange={(v) => togglePerm('data_type_perms', d.key, v)}
                />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-2">Ações</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GOVERNANCE_ACTIONS.map((a) => (
                <PermRow
                  key={a.key}
                  label={a.label}
                  checked={data.action_perms?.[a.key] === true}
                  onChange={(v) => togglePerm('action_perms', a.key, v)}
                />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-2">Políticas Corporativas</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GOVERNANCE_POLICIES.map((p) => (
                <PermRow
                  key={p.key}
                  label={p.label}
                  checked={data.corporate_policies?.[p.key] === true}
                  onChange={(v) => togglePerm('corporate_policies', p.key, v)}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
