import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Download, FileText, AlertTriangle, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { exportToCsv } from '@/services/configuracoes'
import {
  PROFILES,
  MATRIX_SCREENS,
  IDENTIFIED_GAPS,
  type MatrixScreen,
  type PermissionGap,
} from '@/lib/permission-matrix'

function PermCell({ screen, profile }: { screen: MatrixScreen; profile: string }) {
  const v = screen.view(profile)
  const c = screen.create?.(profile)
  const e = screen.edit?.(profile)
  const d = screen.delete?.(profile)
  const Letter = ({ val, char }: { val: boolean | undefined; char: string }) => (
    <span
      className={cn(
        'text-xs font-bold w-4 text-center',
        val === undefined ? 'text-gray-200' : val ? 'text-emerald-600' : 'text-red-300',
      )}
    >
      {val === undefined ? '—' : char}
    </span>
  )
  return (
    <td className="px-2 py-2 text-center">
      <div className="flex gap-0.5 justify-center">
        <Letter val={v} char="V" />
        <Letter val={c} char="C" />
        <Letter val={e} char="E" />
        <Letter val={d} char="D" />
      </div>
    </td>
  )
}

const severityColors: Record<string, string> = {
  Crítica: 'bg-red-100 text-red-700',
  Alta: 'bg-orange-100 text-orange-700',
  Média: 'bg-amber-100 text-amber-700',
  Baixa: 'bg-blue-100 text-blue-700',
}

export function PermissionMatrixScreen() {
  const [tab, setTab] = useState('matrix')

  const handleExportMatrix = () => {
    const rows = MATRIX_SCREENS.map((s) => {
      const row: Record<string, unknown> = { Tela: s.label, Categoria: s.category }
      for (const p of PROFILES) {
        row[`${p}_V`] = s.view(p) ? 'Sim' : 'Não'
        row[`${p}_C`] = s.create?.(p) === undefined ? 'N/A' : s.create(p) ? 'Sim' : 'Não'
        row[`${p}_E`] = s.edit?.(p) === undefined ? 'N/A' : s.edit(p) ? 'Sim' : 'Não'
        row[`${p}_D`] = s.delete?.(p) === undefined ? 'N/A' : s.delete(p) ? 'Sim' : 'Não'
      }
      return row
    })
    exportToCsv(rows, 'matriz_permissoes.csv', {
      module: 'Configurações > Permissões',
      format: 'csv',
      filters: { tab: 'matrix' },
    })
  }

  const handleExportGaps = () => {
    exportToCsv(
      IDENTIFIED_GAPS as unknown as Record<string, unknown>[],
      'relatorio_gaps_permissoes.csv',
      { module: 'Configurações > Permissões', format: 'csv', filters: { tab: 'gaps' } },
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black text-foreground">Permissões</h2>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="matrix" className="focus-visible:ring-[#005B2E]">
            Matriz de Permissões
          </TabsTrigger>
          <TabsTrigger value="gaps" className="focus-visible:ring-[#005B2E]">
            Relatório de Gaps
          </TabsTrigger>
        </TabsList>
        <TabsContent value="matrix" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={handleExportMatrix}
              variant="outline"
              className="border-[#005B2E] text-[#005B2E]"
            >
              <Download className="w-4 h-4 mr-2" /> Exportar CSV
            </Button>
          </div>
          <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#01361D] text-white">
                    <th className="text-left px-3 py-3 font-bold">Tela</th>
                    <th className="text-left px-3 py-3 font-bold hidden md:table-cell">
                      Categoria
                    </th>
                    {PROFILES.map((p) => (
                      <th key={p} className="text-center px-2 py-3 font-bold">
                        {p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MATRIX_SCREENS.map((s) => (
                    <tr key={s.key} className="border-b border-border hover:bg-[#005B2E]/5">
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
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="font-bold text-emerald-600">V</span> Visualizar
            <span className="font-bold text-emerald-600">C</span> Criar
            <span className="font-bold text-emerald-600">E</span> Editar
            <span className="font-bold text-emerald-600">D</span> Excluir
            <span className="text-red-300">— Negado</span>
            <span className="text-gray-200">— Não se aplica</span>
          </p>
        </TabsContent>
        <TabsContent value="gaps" className="space-y-3">
          <div className="flex justify-end">
            <Button
              onClick={handleExportGaps}
              variant="outline"
              className="border-[#005B2E] text-[#005B2E]"
            >
              <Download className="w-4 h-4 mr-2" /> Exportar CSV
            </Button>
          </div>
          <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#01361D] text-white">
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
                    <tr key={i} className="border-b border-border hover:bg-[#005B2E]/5">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
