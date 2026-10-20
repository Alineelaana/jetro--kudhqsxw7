import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MATRIX_SCREENS,
  PROFILES,
  IDENTIFIED_GAPS,
  type PermissionGap,
} from '@/lib/permission-matrix'
import { PerfisPermissoesUnifiedScreen } from '@/components/configuracoes/perfis-permissoes-unified-screen'
import {
  Download,
  AlertTriangle,
  Check,
  ShieldCheck,
  SlidersHorizontal,
  TableProperties,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function PermCell({ screen, profile }: { screen: (typeof MATRIX_SCREENS)[0]; profile: string }) {
  const v = screen.view(profile)
  const c = screen.create ? screen.create(profile) : false
  const e = screen.edit ? screen.edit(profile) : false
  const d = screen.delete ? screen.delete(profile) : false

  return (
    <td className="text-center px-2 py-2 font-mono text-xs">
      <span className={cn('mr-0.5', v ? 'text-emerald-600 font-bold' : 'text-muted-foreground/30')}>
        V
      </span>
      <span className={cn('mr-0.5', c ? 'text-blue-600 font-bold' : 'text-muted-foreground/30')}>
        C
      </span>
      <span className={cn('mr-0.5', e ? 'text-amber-600 font-bold' : 'text-muted-foreground/30')}>
        E
      </span>
      <span className={cn(d ? 'text-rose-600 font-bold' : 'text-muted-foreground/30')}>D</span>
    </td>
  )
}

const severityColors: Record<string, string> = {
  Alta: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  Media: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  Baixa: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
}

export function PermissionMatrixScreen() {
  const [tab, setTab] = useState<'gestao' | 'matriz' | 'gaps'>('gestao')

  const handleExportMatrix = () => {
    const headers = ['Tela', 'Categoria', ...PROFILES.map((p) => (p === 'PADRAO' ? 'Gestao' : p))]
    const rows = MATRIX_SCREENS.map((s) => [
      s.label,
      s.category,
      ...PROFILES.map((p) => {
        const v = s.view(p) ? 'V' : ''
        const c = s.create && s.create(p) ? 'C' : ''
        const e = s.edit && s.edit(p) ? 'E' : ''
        const d = s.delete && s.delete(p) ? 'D' : ''
        const combined = `${v}${c}${e}${d}`
        return combined || '-'
      }),
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(';')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'matriz_permissoes_erp.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportGaps = () => {
    const headers = ['Tela', 'Problema', 'Severidade', 'Status', 'Correcao']
    const rows = IDENTIFIED_GAPS.map((g) => [g.screen, g.issue, g.severity, g.status, g.fix])
    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(';')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'relatorio_gaps_permissoes.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h2 className="text-2xl font-black text-[#063D30] tracking-tight">
            Gestão de Perfis & Permissões
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ambiente unificado: cadastre perfis, selecione menus, busque telas individuais (V, C, E,
            D) e audite matrizes.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border">
          <Button
            size="sm"
            variant={tab === 'gestao' ? 'default' : 'ghost'}
            onClick={() => setTab('gestao')}
            className={cn(
              'h-8 text-xs font-bold gap-1.5',
              tab === 'gestao' && 'bg-[#063D30] text-white hover:bg-[#0A5241]',
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Edição de Perfis & Telas
          </Button>
          <Button
            size="sm"
            variant={tab === 'matriz' ? 'default' : 'ghost'}
            onClick={() => setTab('matriz')}
            className={cn(
              'h-8 text-xs font-bold gap-1.5',
              tab === 'matriz' && 'bg-[#063D30] text-white hover:bg-[#0A5241]',
            )}
          >
            <TableProperties className="w-3.5 h-3.5" /> Matriz Comparativa
          </Button>
          <Button
            size="sm"
            variant={tab === 'gaps' ? 'default' : 'ghost'}
            onClick={() => setTab('gaps')}
            className={cn(
              'h-8 text-xs font-bold gap-1.5',
              tab === 'gaps' && 'bg-[#063D30] text-white hover:bg-[#0A5241]',
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Relatório de Gaps
          </Button>
        </div>
      </div>

      {tab === 'gestao' && <PerfisPermissoesUnifiedScreen />}

      {tab === 'matriz' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Visão tabular das permissões por módulo corporativo do ERP Huram.
            </p>
            <Button
              onClick={handleExportMatrix}
              variant="outline"
              size="sm"
              className="border-[#063D30] text-[#063D30] text-xs h-8"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar CSV
            </Button>
          </div>
          <Card className="border border-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#063D30] text-white">
                    <th className="text-left px-3 py-3 font-bold">Tela</th>
                    <th className="text-left px-3 py-3 font-bold hidden md:table-cell">
                      Categoria
                    </th>
                    {PROFILES.map((p) => (
                      <th key={p} className="text-center px-2 py-3 font-bold">
                        {p === 'PADRAO' ? 'Gestão' : p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MATRIX_SCREENS.map((s) => (
                    <tr
                      key={s.key}
                      className="border-b border-border hover:bg-[#063D30]/5 transition-colors"
                    >
                      <td className="px-3 py-2 font-medium">{s.label}</td>
                      <td className="px-3 py-2 hidden md:table-cell text-muted-foreground">
                        {s.category}
                      </td>
                      {PROFILES.map((p) => (
                        <PermCell key={p} screen={s} profile={p} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="flex items-center gap-3 text-xs text-muted-foreground p-2 bg-muted/40 rounded border border-border">
            <span className="font-bold text-emerald-600">V</span> Visualizar
            <span className="font-bold text-blue-600">C</span> Criar
            <span className="font-bold text-amber-600">E</span> Editar
            <span className="font-bold text-rose-600">D</span> Excluir
            <span className="text-muted-foreground">— Não concedido</span>
          </div>
        </div>
      )}

      {tab === 'gaps' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Diagnóstico de cobertura e gaps de permissão cadastrados.
            </p>
            <Button
              onClick={handleExportGaps}
              variant="outline"
              size="sm"
              className="border-[#063D30] text-[#063D30] text-xs h-8"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Exportar CSV
            </Button>
          </div>
          <Card className="border border-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#063D30] text-white">
                    <th className="text-left px-3 py-3 font-bold">Tela</th>
                    <th className="text-left px-3 py-3 font-bold">Problema</th>
                    <th className="text-left px-3 py-3 font-bold hidden md:table-cell">
                      Severidade
                    </th>
                    <th className="text-left px-3 py-3 font-bold">Status</th>
                    <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">Correção</th>
                  </tr>
                </thead>
                <tbody>
                  {IDENTIFIED_GAPS.map((g: PermissionGap, i: number) => (
                    <tr key={i} className="border-b border-border hover:bg-[#063D30]/5">
                      <td className="px-3 py-3 font-medium">{g.screen}</td>
                      <td className="px-3 py-3 text-muted-foreground">{g.issue}</td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span
                          className={cn(
                            'text-xs font-bold px-2 py-1 rounded',
                            severityColors[g.severity],
                          )}
                        >
                          {g.severity}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        {g.status === 'Corrigido' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                            <Check className="w-3 h-3" /> Corrigido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                            <AlertTriangle className="w-3 h-3" /> Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell text-xs">{g.fix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default PermissionMatrixScreen
