import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  FlaskConical,
  Database,
  GitBranch,
  Lock,
} from 'lucide-react'
import { getPhase0Status, validatePhase0Stage, approvePhase0Stage } from '@/services/phase0'
import type { Phase0ValidationResult, Phase0StatusResponse } from '@/lib/phase0-types'
import { cn } from '@/lib/utils'

const STAGES = [
  {
    num: '1',
    migration: '0081',
    title: 'Specs & Resources',
    collections: [
      'spec_groups',
      'spec_attributes',
      'spec_values',
      'production_resources',
      'unit_conversions',
    ],
    icon: Database,
  },
  {
    num: '2',
    migration: '0082',
    title: 'BOM & Routes',
    collections: [
      'bom_versions',
      'bom_components',
      'production_routes',
      'production_route_operations',
    ],
    icon: GitBranch,
  },
  {
    num: '3',
    migration: '0083',
    title: 'Quality & Costs',
    collections: ['quality_parameters', 'quality_inspections', 'industrial_costs'],
    icon: FlaskConical,
  },
  { num: '4', migration: '0084', title: 'Gran Romano Seed', collections: [], icon: ShieldCheck },
]

const CRITERIA = [
  ['1', 'Engenharia & Produtos as subdomain', '✅'],
  ['2', 'Catálogo via products (estendido)', '✅'],
  ['3', 'Item as canonical entity', '✅'],
  ['4', 'Specs configurable/versioned/auditable', '✅'],
  ['5', 'Neutral classification (Não Classificado)', '✅'],
  ['6', 'Item ≠ Production Resource', '✅'],
  ['7', 'BOM → Version → Components', '✅'],
  ['8', 'Formulação as BOM specialization', '✅'],
  ['9', 'Versioned production routes', '✅'],
  ['10', 'Rastreabilidade histórica', '🟡 Partial'],
  ['11', 'Industrial costs: padrão × realizado', '✅'],
  ['12', 'Spec × Inspection separated', '✅'],
]

export function Phase0RecoveryDashboard() {
  const [status, setStatus] = useState<Phase0StatusResponse | null>(null)
  const [validations, setValidations] = useState<Record<string, Phase0ValidationResult>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadStatus = useCallback(async () => {
    try {
      setStatus(await getPhase0Status())
    } catch {
      /* intentionally ignored */
    }
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const handleValidate = async (stage: string) => {
    setLoading((p) => ({ ...p, [`v${stage}`]: true }))
    setErrors((p) => ({ ...p, [stage]: '' }))
    try {
      const result = await validatePhase0Stage(stage)
      setValidations((p) => ({ ...p, [stage]: result }))
    } catch (e) {
      setErrors((p) => ({ ...p, [stage]: e instanceof Error ? e.message : 'Validation failed' }))
    }
    setLoading((p) => ({ ...p, [`v${stage}`]: false }))
  }

  const handleApprove = async (stage: string) => {
    setLoading((p) => ({ ...p, [`a${stage}`]: true }))
    try {
      await approvePhase0Stage(stage)
      await loadStatus()
    } catch (e) {
      setErrors((p) => ({ ...p, [stage]: e instanceof Error ? e.message : 'Approval failed' }))
    }
    setLoading((p) => ({ ...p, [`a${stage}`]: false }))
  }

  const isUnlocked = (stageNum: number) =>
    stageNum === 1 || (status?.stages[stageNum - 2]?.approved ?? false)

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-5xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Phase 0 Recovery — BLK-MVP-025</h1>
        <p className="text-muted-foreground text-sm">
          Staged execution with approval gates. Each migration runs independently with live-schema
          validation before proceeding.
        </p>
      </div>

      {STAGES.map((info) => {
        const Icon = info.icon
        const stageNum = parseInt(info.num)
        const unlocked = isUnlocked(stageNum)
        const approved = status?.stages[stageNum - 1]?.approved ?? false
        const validation = validations[info.num]
        const isValidating = loading[`v${info.num}`]
        const isApproving = loading[`a${info.num}`]

        return (
          <Card key={info.num} className={cn(!unlocked && 'opacity-50')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">
                      Stage {info.num} — {info.title}
                    </CardTitle>
                    <CardDescription>Migration {info.migration}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  <Badge
                    variant={approved ? 'default' : validation?.passed ? 'secondary' : 'outline'}
                  >
                    {approved
                      ? 'Approved'
                      : validation
                        ? validation.passed
                          ? 'Validated'
                          : 'Issues Found'
                        : 'Pending'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {info.collections.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {info.collections.map((c) => (
                    <Badge key={c} variant="outline" className="text-xs font-mono">
                      {c}
                    </Badge>
                  ))}
                </div>
              )}

              {errors[info.num] && <p className="text-sm text-red-500">{errors[info.num]}</p>}

              {validation && (
                <div className="space-y-3 rounded-lg border p-3 bg-muted/30">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {validation.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                    )}
                    Live Schema Validation — {validation.timestamp}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {validation.collections.map((col) => (
                      <div key={col.name} className="text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-mono">
                          {col.exists ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                          {col.name}{' '}
                          <span className="text-muted-foreground">({col.recordCount} records)</span>
                        </div>
                        {col.exists && col.fields.length > 0 && (
                          <div className="pl-5 text-muted-foreground text-[10px]">
                            {col.fields.map((f) => `${f.name}:${f.type}`).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {validation.relations.length > 0 && (
                    <div className="text-xs">
                      <span className="font-medium">Relations:</span>{' '}
                      {validation.relations.filter((r) => r.valid).length}/
                      {validation.relations.length} valid
                    </div>
                  )}
                  {validation.seedData && (
                    <div className="text-xs space-y-1">
                      <span className="font-medium">Seed Data:</span>
                      <div className="pl-4 text-muted-foreground">
                        Products: {validation.seedData.products} | BOM:{' '}
                        {validation.seedData.bomVersions} | Components:{' '}
                        {validation.seedData.bomComponents} | Resources:{' '}
                        {validation.seedData.resources} | Routes: {validation.seedData.routes} |
                        Ops: {validation.seedData.routeOps} | Costs: {validation.seedData.costs}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(validation.acceptance).map(([k, v]) => (
                      <Badge key={k} variant={v ? 'default' : 'destructive'} className="text-xs">
                        {v ? '✅' : '❌'} {k}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!unlocked || isValidating}
                  onClick={() => handleValidate(info.num)}
                >
                  {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Validate'}
                </Button>
                <Button
                  size="sm"
                  disabled={!unlocked || !validation?.passed || approved || isApproving}
                  onClick={() => handleApprove(info.num)}
                >
                  {isApproving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : approved ? (
                    'Approved'
                  ) : (
                    'Approve Stage'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {status?.allApproved && (
        <Card className="border-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" /> Phase 0 Closure — Final Audit
            </CardTitle>
            <CardDescription>
              All 4 stages approved. Final adherence matrix for BLK-MVP-025.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Criterion</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {CRITERIA.map(([n, c, s]) => (
                    <tr key={n} className="border-t">
                      <td className="p-2">{n}</td>
                      <td className="p-2">{c}</td>
                      <td className="p-2 text-center">{s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              AC#10 Rastreabilidade marked as Partial per user story. Global Platform Certification
              audit begins only after definitive Phase 0 approval.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
