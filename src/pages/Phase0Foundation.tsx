import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  RefreshCw,
  Download,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  FlaskConical,
  FileCheck,
  ScrollText,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { validateFoundationSchema, runFoundationTests } from '@/services/phase0-foundation'
import {
  type FoundationValidationResult,
  type ValidationStatus,
  type AcceptanceLevel,
  computeAcceptanceLevels,
  computeOverallStatus,
  EXECUTION_SCOPE,
} from '@/lib/phase0-foundation-types'

const statusConfig: Record<
  ValidationStatus,
  { color: string; icon: typeof CheckCircle2; label: string }
> = {
  pass: { color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2, label: 'PASS' },
  fail: { color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle, label: 'FAIL' },
  warn: {
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: AlertTriangle,
    label: 'WARN',
  },
}

function StatusBadge({ status }: { status: ValidationStatus }) {
  const cfg = statusConfig[status]
  const Icon = cfg.icon
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        cfg.color,
      )}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

const levelIcons = [FileCheck, Database, FlaskConical, ScrollText, Eye]

export default function Phase0Foundation() {
  const [data, setData] = useState<FoundationValidationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [schema, tests] = await Promise.all([validateFoundationSchema(), runFoundationTests()])
      const levels = computeAcceptanceLevels(schema, tests)
      setData({
        timestamp: new Date().toISOString(),
        overallStatus: computeOverallStatus(levels),
        schema,
        tests,
        acceptanceLevels: levels,
        executionScope: EXECUTION_SCOPE,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na validação')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    run()
  }, [run])

  const exportEvidence = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `phase0_foundation_evidence_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">
            Validando schema vivo e executando testes funcionais...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-5xl space-y-4 p-6">
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertTitle>Erro na Validação</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={run}>
          <RefreshCw className="mr-2 h-4 w-4" /> Tentar Novamente
        </Button>
      </div>
    )
  }

  if (!data) return null
  const { schema, tests, acceptanceLevels, overallStatus } = data
  const OverallIcon =
    overallStatus === 'pass' ? ShieldCheck : overallStatus === 'warn' ? ShieldAlert : ShieldX

  return (
    <div className="container mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Migração 0085 — Fundação</h1>
            <p className="text-sm text-muted-foreground">
              Phase 0 (BLK-MVP-025) — Validação Controlada
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportEvidence}>
            <Download className="mr-2 h-4 w-4" /> Exportar Evidências
          </Button>
          <Button onClick={run}>
            <RefreshCw className="mr-2 h-4 w-4" /> Re-validar
          </Button>
        </div>
      </div>

      <Card
        className={cn(
          'border-2',
          overallStatus === 'pass'
            ? 'border-green-300'
            : overallStatus === 'warn'
              ? 'border-yellow-300'
              : 'border-red-300',
        )}
      >
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <OverallIcon
              className={cn(
                'h-12 w-12',
                overallStatus === 'pass'
                  ? 'text-green-600'
                  : overallStatus === 'warn'
                    ? 'text-yellow-600'
                    : 'text-red-600',
              )}
            />
            <div>
              <p className="text-lg font-semibold">Veredicto: {overallStatus.toUpperCase()}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(data.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              Coleções: {schema.collections.filter((c) => c.exists).length}/
              {schema.collections.length}
            </p>
            <p className="text-sm font-medium">
              Testes: {tests.tests.filter((t) => t.status === 'pass').length}/{tests.tests.length}
            </p>
            <p className="text-sm font-medium">
              Níveis: {acceptanceLevels.filter((l) => l.status === 'pass').length}/
              {acceptanceLevels.length}
            </p>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Escopo de Execução Controlada</AlertTitle>
        <AlertDescription>
          <strong>Executado:</strong> {data.executionScope.executed.join(', ')} —{' '}
          <strong>NÃO executado:</strong> {data.executionScope.notExecuted.join(', ')}
          <br />
          {data.executionScope.description}
        </AlertDescription>
      </Alert>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Cinco Níveis Oficiais de Aceite</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {acceptanceLevels.map((level: AcceptanceLevel, idx: number) => {
            const Icon = levelIcons[idx] || FileCheck
            return (
              <Card key={level.level} className={cn('border', statusConfig[level.status].color)}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-bold">N{level.level}</span>
                  </div>
                  <p className="text-sm font-semibold">{level.name}</p>
                  <StatusBadge status={level.status} />
                  <p className="mt-2 text-xs text-muted-foreground">{level.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" /> Validação de Coleções (Schema Vivo)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple">
            {schema.collections.map((col) => (
              <AccordionItem key={col.name} value={col.name}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={col.status} />
                    <span className="font-mono text-sm">{col.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {col.fields.filter((f) => f.exists).length}/{col.fields.length} campos
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campo</TableHead>
                        <TableHead>Existe</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Esperado</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {col.fields.map((f) => (
                        <TableRow key={f.name}>
                          <TableCell className="font-mono text-xs">{f.name}</TableCell>
                          <TableCell>{f.exists ? '✓' : '✗'}</TableCell>
                          <TableCell className="text-xs">{f.type}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {f.expectedType}
                          </TableCell>
                          <TableCell>{f.required ? '✓' : '—'}</TableCell>
                          <TableCell>
                            <StatusBadge status={f.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div>
                    <p className="mb-1 text-xs font-semibold">Índices:</p>
                    <div className="flex flex-wrap gap-2">
                      {col.indexes.map((idx) => (
                        <span
                          key={idx.name}
                          className={cn(
                            'rounded border px-2 py-0.5 text-xs',
                            idx.exists
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-yellow-200 bg-yellow-50 text-yellow-700',
                          )}
                        >
                          {idx.name}: {idx.exists ? '✓' : '✗'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold">Regras de Acesso:</p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Regra</TableHead>
                          <TableHead>Esperada</TableHead>
                          <TableHead>Atual</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(col.rules).map(([rn, rv]) => (
                          <TableRow key={rn}>
                            <TableCell className="font-mono text-xs">{rn}</TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {rv.expected}
                            </TableCell>
                            <TableCell className="font-mono text-xs">{rv.actual}</TableCell>
                            <TableCell>
                              <StatusBadge status={rv.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" /> Campos Estendidos (products & unidades_medida)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coleção</TableHead>
                <TableHead>Campo</TableHead>
                <TableHead>Existe</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Duplicado</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schema.extendedFields.map((f) => (
                <TableRow key={`${f.collection}-${f.field}`}>
                  <TableCell className="font-mono text-xs">{f.collection}</TableCell>
                  <TableCell className="font-mono text-xs">{f.field}</TableCell>
                  <TableCell>{f.exists ? '✓' : '✗'}</TableCell>
                  <TableCell className="text-xs">
                    {f.type} <span className="text-muted-foreground">({f.expectedType})</span>
                  </TableCell>
                  <TableCell>{f.duplicated ? '✗ SIM' : '✓ Não'}</TableCell>
                  <TableCell>
                    <StatusBadge status={f.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" /> Testes Funcionais (CRUD)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Coleção</TableHead>
                <TableHead>Ações</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.tests.map((t) => (
                <TableRow key={t.collection}>
                  <TableCell className="font-mono text-xs">{t.collection}</TableCell>
                  <TableCell className="text-xs">{t.actions.join(' → ')}</TableCell>
                  <TableCell>
                    <StatusBadge status={t.status} />
                  </TableCell>
                  <TableCell className="text-xs text-red-600">{t.error || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {(schema.errors.length > 0 || tests.errors.length > 0) && (
        <Card className="border-red-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" /> Erros ({schema.errors.length + tests.errors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-red-600">
              {[...schema.errors, ...tests.errors].map((err, i) => (
                <li key={i} className="font-mono text-xs">
                  • {err}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {(schema.warnings.length > 0 || tests.warnings.length > 0) && (
        <Card className="border-yellow-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="h-5 w-5" /> Avisos (
              {schema.warnings.length + tests.warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-yellow-600">
              {[...schema.warnings, ...tests.warnings].map((w, i) => (
                <li key={i} className="font-mono text-xs">
                  • {w}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {overallStatus === 'pass' && (
        <Alert className="border-green-300 bg-green-50">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Validação Concluída com Sucesso</AlertTitle>
          <AlertDescription className="text-green-700">
            Migration 0085 (Fundação) está validada e consistente. As 5 coleções estão presentes com
            campos, índices e regras corretos. Os campos estendidos em <code>products</code> e{' '}
            <code>unidades_medida</code> não foram duplicados nem alterados. Testes funcionais CRUD
            passaram em todas as coleções. É seguro prosseguir para a próxima etapa (0086) mediante
            aprovação explícita.
          </AlertDescription>
        </Alert>
      )}

      {overallStatus !== 'pass' && (
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertTitle>Validação Falhou — NÃO prosseguir para 0086</AlertTitle>
          <AlertDescription>
            Foram encontradas falhas ou divergências na validação da migração 0085. A migração 0086
            NÃO deve ser executada até que todas as falhas sejam corrigidas e a validação seja
            re-executada com resultado PASS.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
