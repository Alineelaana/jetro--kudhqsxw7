import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { RhTable, RhLoading, RhStatusBadge, RhEmptyState } from '@/components/rh/rh-shared'
import { rhGetList, rhDelete, getEmployees } from '@/services/rh'
import { useRealtime } from '@/hooks/use-realtime'
import { Search, Trash2, Eye, GraduationCap, Gift, Wrench, Target } from 'lucide-react'
import { toast } from 'sonner'

function parseJson(val: any): any[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  try {
    return JSON.parse(val)
  } catch {
    return []
  }
}

export function RhPositionsEnhanced() {
  const [positions, setPositions] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any | null>(null)

  const load = async () => {
    try {
      const [pos, emp] = await Promise.all([
        rhGetList('rh_positions').catch(() => []),
        getEmployees().catch(() => []),
      ])
      setPositions(pos as any[])
      setEmployees(emp as any[])
    } catch {
      setPositions([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_positions', () => load())

  const filtered = positions.filter((p) => {
    const q = search.toLowerCase().trim()
    return (
      !q || (p.name || '').toLowerCase().includes(q) || (p.code || '').toLowerCase().includes(q)
    )
  })

  const getEmployeeCount = (posName: string) => employees.filter((e) => e.cargo === posName).length

  const handleDelete = async (pos: any) => {
    const count = getEmployeeCount(pos.name)
    if (count > 0) {
      toast.error(`Não é possível excluir: ${count} colaborador(es) vinculado(s) a este cargo`)
      return
    }
    try {
      await rhDelete('rh_positions', pos.id)
      toast.success('Cargo excluído')
      load()
    } catch {
      toast.error('Erro ao excluir')
    }
  }

  if (loading) return <RhLoading />

  if (selected) {
    const linked = employees.filter((e) => e.cargo === selected.name)
    const trainings = parseJson(selected.treinamentos_obrigatorios)
    const benefits = parseJson(selected.beneficios)
    const equipment = parseJson(selected.equipamentos)
    const goals = parseJson(selected.metas)
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#005B2E]">{selected.name}</h3>
          <Button variant="ghost" onClick={() => setSelected(null)}>
            Voltar
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#005B2E]" /> Treinamentos Obrigatórios (
                {trainings.length})
              </h4>
              {trainings.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum</p>
              ) : (
                <ul className="space-y-1">
                  {trainings.map((t, i) => (
                    <li key={i} className="text-sm">
                      {typeof t === 'string' ? t : t.name || '—'}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#005B2E]" /> Benefícios ({benefits.length})
              </h4>
              {benefits.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum</p>
              ) : (
                <ul className="space-y-1">
                  {benefits.map((b, i) => (
                    <li key={i} className="text-sm">
                      {typeof b === 'string' ? b : b.name || '—'}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#005B2E]" /> Equipamentos ({equipment.length})
              </h4>
              {equipment.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum</p>
              ) : (
                <ul className="space-y-1">
                  {equipment.map((eq, i) => (
                    <li key={i} className="text-sm">
                      {typeof eq === 'string' ? eq : eq.name || '—'}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#005B2E]" /> Metas ({goals.length})
              </h4>
              {goals.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma</p>
              ) : (
                <ul className="space-y-1">
                  {goals.map((g, i) => (
                    <li key={i} className="text-sm">
                      {typeof g === 'string' ? g : g.name || g.descricao || '—'}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-4">
            <h4 className="font-bold mb-2">
              Colaboradores Vinculados ({linked.length}) • Centro de Custo:{' '}
              {selected.centro_custo || '—'}
            </h4>
            {linked.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum</p>
            ) : (
              <RhTable headers={['Nome', 'Departamento', 'Salário', 'Situação']}>
                {linked.map((e) => (
                  <tr key={e.id} className="border-b border-border">
                    <td className="px-3 py-2 font-medium">{e.nome_completo}</td>
                    <td className="px-3 py-2 text-xs">{e.departamento || '—'}</td>
                    <td className="px-3 py-2 text-xs">{e.salario || '—'}</td>
                    <td className="px-3 py-2">
                      <RhStatusBadge status={e.situacao} />
                    </td>
                  </tr>
                ))}
              </RhTable>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Cargos</h3>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cargo..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {filtered.length === 0 ? (
        <RhEmptyState message="Nenhum cargo encontrado" />
      ) : (
        <RhTable
          headers={[
            'Código',
            'Nome',
            'Departamento',
            'Faixa Salarial',
            'Colabs',
            'Situação',
            'Ações',
          ]}
        >
          {filtered.map((p) => {
            const count = getEmployeeCount(p.name)
            return (
              <tr key={p.id} className="border-b border-border hover:bg-[#005B2E]/5">
                <td className="px-3 py-3 font-mono text-xs text-[#C89B3C]">{p.code || '—'}</td>
                <td className="px-3 py-3 font-medium">{p.name || '—'}</td>
                <td className="px-3 py-3 text-xs">{p.departamento || '—'}</td>
                <td className="px-3 py-3 text-xs">
                  {p.faixa_salarial_inicial || '—'} - {p.faixa_salarial_final || '—'}
                </td>
                <td className="px-3 py-3">
                  <span
                    className={`font-bold ${count > 0 ? 'text-[#005B2E]' : 'text-muted-foreground'}`}
                  >
                    {count}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <RhStatusBadge status={p.situacao} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-0.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(p)}
                      className="text-[#005B2E] hover:bg-[#005B2E]/10 h-8 w-8 p-0"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(p)}
                      className="text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                      title={count > 0 ? 'Cargo com colaboradores vinculados' : 'Excluir'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </RhTable>
      )}
    </div>
  )
}
