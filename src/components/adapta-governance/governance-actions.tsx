import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save } from 'lucide-react'
import type { GovernanceConfig } from '@/lib/adapta-governance-types'
import { GOVERNANCE_ACTIONS } from '@/lib/adapta-governance-types'

interface Props {
  config: GovernanceConfig
  onSave: (partial: Partial<GovernanceConfig>) => void
  canEdit: boolean
  saving: boolean
}

export function GovernanceActions({ config, onSave, canEdit, saving }: Props) {
  const [perms, setPerms] = useState<Record<string, boolean>>(config.action_perms || {})

  useEffect(() => {
    setPerms(config.action_perms || {})
  }, [config.action_perms])

  const hasChanges = JSON.stringify(perms) !== JSON.stringify(config.action_perms || {})
  const readOnlyActions = ['CONSULTAR', 'ANALISAR', 'SUGERIR', 'SIMULAR']
  const writeActions = GOVERNANCE_ACTIONS.filter((a) => !readOnlyActions.includes(a.key))

  const renderAction = (a: { key: string; label: string }) => (
    <div
      key={a.key}
      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{a.label}</span>
        {readOnlyActions.includes(a.key) && (
          <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-300">
            Leitura
          </Badge>
        )}
      </div>
      <Switch
        checked={perms[a.key] === true}
        onCheckedChange={(v) => setPerms((prev) => ({ ...prev, [a.key]: v }))}
        disabled={!canEdit}
        className="data-[state=checked]:bg-[#005B2E]"
      />
    </div>
  )

  return (
    <Card className="border-2 border-[#005B2E]/20">
      <CardHeader>
        <CardTitle className="text-base">Permissões por Ação</CardTitle>
        <p className="text-sm text-muted-foreground">
          O modo padrão "ADAPTA Assistente" permite apenas consulta e análise. Ações de escrita
          exigem aprovação, RBAC e auditoria.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-bold mb-2 text-emerald-700">
            Ações de Leitura (Modo Assistente)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOVERNANCE_ACTIONS.filter((a) => readOnlyActions.includes(a.key)).map(renderAction)}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold mb-2 text-red-700">Ações Críticas (Exigem Aprovação)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {writeActions.map(renderAction)}
          </div>
        </div>
        {canEdit && hasChanges && (
          <Button
            onClick={() => onSave({ action_perms: perms })}
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
