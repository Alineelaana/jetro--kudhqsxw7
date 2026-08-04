import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { DpLoading, DpTable, DpStatusBadge } from '@/components/dp/dp-shared'
import { getEmployees, getTimeRecords } from '@/services/rh'
import { useRealtime } from '@/hooks/use-realtime'
import { parseTimeToMinutes, minutesToTime } from '@/lib/time-calculations'
import { Search, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

const POSITIVE_LIMIT = 1200
const NEGATIVE_LIMIT = -600

interface BankSummary {
  employee_name: string
  departamento: string
  cargo: string
  totalBalance: number
  recordCount: number
  irregular: boolean
  records: any[]
}

export function DpBancoHoras() {
  const [summaries, setSummaries] = useState<BankSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
  const [history, setHistory] = useState<any[]>([])

  const load = async () => {
    try {
      const [emp, time] = await Promise.all([
        getEmployees().catch(() => []),
        getTimeRecords().catch(() => []),
      ])
      const byEmp = new Map<string, BankSummary>()
      for (const e of emp as any[]) {
        const name = e.nome_completo || ''
        if (!name) continue
        byEmp.set(name, {
          employee_name: name,
          departamento: e.departamento || '—',
          cargo: e.cargo || '—',
          totalBalance: 0,
          recordCount: 0,
          irregular: false,
          records: [],
        })
      }
      for (const t of time as any[]) {
        const name = t.employee_name || ''
        if (!name) continue
        if (!byEmp.has(name)) {
          byEmp.set(name, {
            employee_name: name,
            departamento: '—',
            cargo: '—',
            totalBalance: 0,
            recordCount: 0,
            irregular: false,
            records: [],
          })
        }
        const s = byEmp.get(name)!
        s.totalBalance += parseTimeToMinutes(t.banco_horas || '')
        s.recordCount++
        s.records.push(t)
      }
      setSummaries(
        Array.from(byEmp.values()).map((s) => ({
          ...s,
          irregular: s.totalBalance > POSITIVE_LIMIT || s.totalBalance < NEGATIVE_LIMIT,
        })),
      )
    } catch {
      setSummaries([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_time_records', () => load())

  const filtered = summaries.filter((s) => {
    const q = search.toLowerCase().trim()
    return (
      !q || s.employee_name.toLowerCase().includes(q) || s.departamento.toLowerCase().includes(q)
    )
  })

  const showHistory = (name: string) => {
    const s = summaries.find((s) => s.employee_name === name)
    setSelectedEmployee(name)
    setHistory(s?.records || [])
  }

  if (loading) return <DpLoading />
  const irregularCount = summaries.filter((s) => s.irregular).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Banco de Horas</h3>
        {irregularCount > 0 && (
          <span className="flex items-center gap-1 text-sm font-bold text-red-600 bg-red-50 px-3 py-1 rounded">
            <AlertTriangle className="w-4 h-4" /> {irregularCount} saldo(s) irregular(es)
          </span>
        )}
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar colaborador..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-lg font-bold">Nenhum registro encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <DpTable
          headers={[
            'Colaborador',
            'Departamento',
            'Cargo',
            'Saldo Atual',
            'Registros',
            'Situação',
            'Ações',
          ]}
        >
          {filtered.map((s) => (
            <tr key={s.employee_name} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-medium">{s.employee_name}</td>
              <td className="px-3 py-3 text-xs">{s.departamento}</td>
              <td className="px-3 py-3 text-xs">{s.cargo}</td>
              <td className="px-3 py-3">
                <span
                  className={`font-bold ${s.totalBalance < 0 ? 'text-red-600' : 'text-[#005B2E]'}`}
                >
                  {s.totalBalance < 0 ? (
                    <TrendingDown className="w-3 h-3 inline mr-1" />
                  ) : (
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                  )}
                  {minutesToTime(s.totalBalance)}
                </span>
              </td>
              <td className="px-3 py-3">{s.recordCount}</td>
              <td className="px-3 py-3">
                {s.irregular ? (
                  <span className="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-700">
                    Irregular
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                    Regular
                  </span>
                )}
              </td>
              <td className="px-3 py-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => showHistory(s.employee_name)}
                  className="text-[#005B2E] hover:bg-[#005B2E]/10 h-8"
                >
                  Histórico
                </Button>
              </td>
            </tr>
          ))}
        </DpTable>
      )}
      {selectedEmployee && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-[#005B2E]">Histórico — {selectedEmployee}</h4>
              <Button size="sm" variant="ghost" onClick={() => setSelectedEmployee(null)}>
                Fechar
              </Button>
            </div>
            <DpTable headers={['Data', 'Entrada', 'Saída', 'Horas', 'Banco', 'Situação']}>
              {history.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="px-3 py-2 text-xs">{r.data || '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.entrada || '—'}</td>
                  <td className="px-3 py-2 text-xs">{r.saida || '—'}</td>
                  <td className="px-3 py-2 text-xs font-bold">{r.horas_trabalhadas || '—'}</td>
                  <td className="px-3 py-2 text-xs font-bold text-[#005B2E]">
                    {r.banco_horas || '—'}
                  </td>
                  <td className="px-3 py-2">
                    <DpStatusBadge status={r.situacao} />
                  </td>
                </tr>
              ))}
            </DpTable>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
