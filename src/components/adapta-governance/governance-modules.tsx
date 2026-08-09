import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import type { GovernanceConfig } from '@/lib/adapta-governance-types'
import { GOVERNANCE_MODULES } from '@/lib/adapta-governance-types'

interface Props {
  config: GovernanceConfig
  onSave: (partial: Partial<GovernanceConfig>) => void
  canEdit: boolean
  saving: boolean
}

export function GovernanceModules({ config, onSave, canEdit, saving }: Props) {
  const [perms, setPerms] = useState<Record<string, boolean>>(config.module_perms || {})

  useEffect(() => {
    setPerms(config.module_perms || {})
  }, [config.module_perms])

  const hasChanges = JSON.stringify(perms) !== JSON.stringify(config.module_perms || {})

  return (
    <Card className="border-2 border-[#005B2E]/20">
      <CardHeader>
        <CardTitle className="text-base">Permissões por Módulo</CardTitle>
        <p className="text-sm text-muted-foreground">
          Habilite ou desabilite o acesso da IA a cada módulo. Módulos desativados não podem ser
          consultados.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GOVERNANCE_MODULES.map((m) => (
            <div
              key={m.key}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium">{m.label}</span>
              <Switch
                checked={perms[m.key] === true}
                onCheckedChange={(v) => setPerms((prev) => ({ ...prev, [m.key]: v }))}
                disabled={!canEdit}
                className="data-[state=checked]:bg-[#005B2E]"
              />
            </div>
          ))}
        </div>
        {canEdit && hasChanges && (
          <Button
            onClick={() => onSave({ module_perms: perms })}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
