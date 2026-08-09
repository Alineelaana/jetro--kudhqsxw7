import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import type { GovernanceConfig } from '@/lib/adapta-governance-types'
import { GOVERNANCE_DATA_TYPES } from '@/lib/adapta-governance-types'

interface Props {
  config: GovernanceConfig
  onSave: (partial: Partial<GovernanceConfig>) => void
  canEdit: boolean
  saving: boolean
}

export function GovernanceDataTypes({ config, onSave, canEdit, saving }: Props) {
  const [perms, setPerms] = useState<Record<string, boolean>>(config.data_type_perms || {})

  useEffect(() => {
    setPerms(config.data_type_perms || {})
  }, [config.data_type_perms])

  const hasChanges = JSON.stringify(perms) !== JSON.stringify(config.data_type_perms || {})
  const allowedDefaults = GOVERNANCE_DATA_TYPES.filter((d) => d.defaultAllowed)
  const blockable = GOVERNANCE_DATA_TYPES.filter((d) => !d.defaultAllowed)

  const renderToggle = (d: { key: string; label: string }) => (
    <div
      key={d.key}
      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <span className="text-sm font-medium">{d.label}</span>
      <Switch
        checked={perms[d.key] !== false}
        onCheckedChange={(v) => setPerms((prev) => ({ ...prev, [d.key]: v }))}
        disabled={!canEdit}
        className="data-[state=checked]:bg-[#005B2E]"
      />
    </div>
  )

  return (
    <div className="space-y-4">
      <Card className="border-2 border-emerald-200">
        <CardHeader>
          <CardTitle className="text-base text-emerald-700">Permitidos por Padrão</CardTitle>
          <p className="text-sm text-muted-foreground">Dados que a IA pode acessar por padrão.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allowedDefaults.map(renderToggle)}
          </div>
        </CardContent>
      </Card>
      <Card className="border-2 border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-700">Dados Sensíveis (Bloqueáveis)</CardTitle>
          <p className="text-sm text-muted-foreground">
            Dados sensíveis que podem ser bloqueados. Inclui informações protegidas por LGPD.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {blockable.map(renderToggle)}
          </div>
          {canEdit && hasChanges && (
            <Button
              onClick={() => onSave({ data_type_perms: perms })}
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
    </div>
  )
}
