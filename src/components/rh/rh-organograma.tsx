import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { RhLoading } from '@/components/rh/rh-shared'
import { getOrgChartData } from '@/services/rh-enterprise'
import { useRealtime } from '@/hooks/use-realtime'
import { Users, ChevronDown, ChevronRight, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RhOrganograma() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const load = async () => {
    try {
      setData(await getOrgChartData())
    } catch {
      setData([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_employees', () => load())
  useRealtime('rh_departments', () => load())

  if (loading) return <RhLoading />

  const toggle = (dept: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(dept)) next.delete(dept)
      else next.add(dept)
      return next
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Organograma</h3>
      <div className="space-y-2">
        {data.map((dept) => (
          <Card key={dept.departamento} className="border-2 border-[#005B2E]/20">
            <CardContent className="p-3">
              <button
                onClick={() => toggle(dept.departamento)}
                className="flex items-center gap-2 w-full text-left"
              >
                {expanded.has(dept.departamento) ? (
                  <ChevronDown className="w-4 h-4 text-[#005B2E]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#005B2E]" />
                )}
                <Building2 className="w-4 h-4 text-[#005B2E]" />
                <span className="font-bold text-[#005B2E]">{dept.departamento}</span>
                <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" /> {dept.total}
                </span>
              </button>
              {expanded.has(dept.departamento) && (
                <div className="mt-3 ml-6 space-y-1">
                  {dept.colaboradores.map((emp: any) => (
                    <div
                      key={emp.id}
                      className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-[#005B2E]/5"
                    >
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          emp.situacao === 'Ativo'
                            ? 'bg-emerald-500'
                            : emp.situacao === 'Em Férias'
                              ? 'bg-cyan-500'
                              : emp.situacao === 'Afastado'
                                ? 'bg-amber-500'
                                : 'bg-gray-400',
                        )}
                      />
                      <span className="text-sm font-medium">{emp.nome_completo}</span>
                      <span className="text-xs text-muted-foreground">{emp.cargo}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
