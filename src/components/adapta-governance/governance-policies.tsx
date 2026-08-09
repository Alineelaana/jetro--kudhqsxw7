import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Loader2, Save } from 'lucide-react'
import type { GovernanceConfig } from '@/lib/adapta-governance-types'
import { GOVERNANCE_POLICIES } from '@/lib/adapta-governance-types'

interface Props {
  config: GovernanceConfig
  onSave: (partial: Partial<GovernanceConfig>) => void
  canEdit: boolean
  saving: boolean
}

export function GovernancePolicies({ config, onSave, canEdit, saving }: Props) {
  const [policies, setPolicies] = useState<Record<string, boolean>>(config.corporate_policies || {})

  useEffect(() => {
    setPolicies(config.corporate_policies || {})
  }, [config.corporate_policies])

  const hasChanges = JSON.stringify(policies) !== JSON.stringify(config.corporate_policies || {})

  return (
    <Card className="border-2 border-[#005B2E]/20">
      <CardHeader>
        <CardTitle className="text-base">Políticas Corporativas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure quais informações sensíveis a IA pode mencionar em suas respostas. Todas as
          políticas são aplicadas em conjunto com o RBAC existente.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {GOVERNANCE_POLICIES.map((p) => (
            <div
              key={p.key}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium">{p.label}</span>
              <Switch
                checked={policies[p.key] === true}
                onCheckedChange={(v) => setPolicies((prev) => ({ ...prev, [p.key]: v }))}
                disabled={!canEdit}
                className="data-[state=checked]:bg-[#005B2E]"
              />
            </div>
          ))}
        </div>
        {canEdit && hasChanges && (
          <Button
            onClick={() => onSave({ corporate_policies: policies })}
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
