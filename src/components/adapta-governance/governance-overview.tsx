import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Database, Lock, FileText, Eye, Bot } from 'lucide-react'
import type { GovernanceConfig } from '@/lib/adapta-governance-types'
import {
  GOVERNANCE_MODULES,
  GOVERNANCE_DATA_TYPES,
  GOVERNANCE_ACTIONS,
} from '@/lib/adapta-governance-types'

export function GovernanceOverview({ config }: { config: GovernanceConfig }) {
  const enabledModules = GOVERNANCE_MODULES.filter(
    (m) => config.module_perms?.[m.key] === true,
  ).length
  const blockedDataTypes = GOVERNANCE_DATA_TYPES.filter(
    (d) => config.data_type_perms?.[d.key] === false,
  ).length
  const allowedActions = GOVERNANCE_ACTIONS.filter(
    (a) => config.action_perms?.[a.key] === true,
  ).length

  const stats = [
    {
      label: 'Modo Padrão',
      value: config.default_mode || 'ADAPTA Assistente',
      icon: Bot,
      color: 'text-[#005B2E]',
    },
    {
      label: 'Módulos Habilitados',
      value: `${enabledModules}/${GOVERNANCE_MODULES.length}`,
      icon: Database,
      color: 'text-blue-600',
    },
    {
      label: 'Dados Bloqueados',
      value: `${blockedDataTypes}/${GOVERNANCE_DATA_TYPES.length}`,
      icon: Lock,
      color: 'text-red-600',
    },
    {
      label: 'Ações Permitidas',
      value: `${allowedActions}/${GOVERNANCE_ACTIONS.length}`,
      icon: ShieldCheck,
      color: 'text-emerald-600',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={`w-8 h-8 ${s.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-sm font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#005B2E]" /> Segregação Organizacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={
                config.enforce_org_scope
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }
            >
              {config.enforce_org_scope ? 'Ativa' : 'Inativa'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              IA respeita empresa, filial, departamento e centro de custo.
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#005B2E]" /> Auditoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={
                config.enforce_audit ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }
            >
              {config.enforce_audit ? 'Ativa' : 'Inativa'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Todas as interações são registradas em audit_logs.
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#005B2E]/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#005B2E]" /> Rastreabilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              className={
                config.traceability_enabled
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }
            >
              {config.traceability_enabled ? 'Ativa' : 'Inativa'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Cada resposta registra origem dos dados e módulos consultados.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
