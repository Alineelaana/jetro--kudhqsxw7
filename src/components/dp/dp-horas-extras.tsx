import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { DpLoading, DpTable, DpStatusBadge } from '@/components/dp/dp-shared'
import { getTimeRecords, rhUpdate, getEmployees } from '@/services/rh'
import { useRealtime } from '@/hooks/use-realtime'
import { parseTimeToMinutes } from '@/lib/time-calculations'
import { Search, Check, X, AlertTriangle, Calculator } from 'lucide-react'
import { toast } from 'sonner'

const EXCESSIVE_LIMIT = 120

function calcOvertimeValue(hoursMinutes: string, baseSalary: string, rate: number): string {
  const minutes = parseTimeToMinutes(hoursMinutes)
  const hours = minutes / 60
  const salary = parseFloat(baseSalary) || 0
  const hourlyRate = salary / 220
  const value = hours * hourlyRate * (1 + rate / 100)
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function DpHorasExtras() {
  const [records, setRecords] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [periodFilter, setPeriodFilter] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [approvalNote, setApprovalNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [all, emp] = await Promise.all([
        getTimeRecords().catch(() => []),
        getEmployees().catch(() => []),
      ])
      setEmployees(emp as any[])
      setRecords(
        (all as any[]).filter(
          (r) => r.horas_extras && r.horas_extras !== '00:00' && r.horas_extras !== '',
        ),
      )
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_time_records', () => load())

  const getSalary = (name: string) => {
    const emp = employees.find((e) => e.nome_completo === name)
    return emp?.salario || '0'
  }

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    const matchSearch = !q || (r.employee_name || '').toLowerCase().includes(q)
    const matchPeriod = !periodFilter || (r.data || '').startsWith(periodFilter)
    return matchSearch && matchPeriod
  })

  const excessiveCount = records.filter(
    (r) => parseTimeToMinutes(r.horas_extras || '') > EXCESSIVE_LIMIT,
  ).length

  const openApprove = (r: any) => {
    setEditing(r)
    setApprovalNote('')
    setDialogOpen(true)
  }

  const handleApprove = async (approve: boolean) => {
    if (!editing) return
    setSaving(true)
    try {
      await rhUpdate('rh_time_records', editing.id, {
        situacao: approve ? 'Aprovado' : 'Com Divergência',
        observacoes:
          (editing.observacoes || '') +
          ` | ${approve ? 'HE aprovadas' : 'HE rejeitadas'}: ${approvalNote}`,
      })
      toast.success(approve ? 'Horas extras aprovadas' : 'Horas extras rejeitadas')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao processar')
    }
    setSaving(false)
  }

  if (loading) return <DpLoading />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Horas Extras</h3>
        {excessiveCount > 0 && (
          <span className="flex items-center gap-1 text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded">
            <AlertTriangle className="w-4 h-4" /> {excessiveCount} registro(s) com horas excessivas
          </span>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar colaborador..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Input
          type="month"
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
          className="w-40 focus-visible:ring-[#005B2E]"
        />
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <p className="text-lg font-bold">Nenhuma hora extra registrada</p>
          </CardContent>
        </Card>
      ) : (
        <DpTable
          headers={[
            'Colaborador',
            'Data',
            'Horas Extras',
            'Valor 50%',
            'Valor 100%',
            'Situação',
            'Ações',
          ]}
        >
          {filtered.map((r) => {
            const isExcessive = parseTimeToMinutes(r.horas_extras || '') > EXCESSIVE_LIMIT
            const salary = getSalary(r.employee_name)
            return (
              <tr
                key={r.id}
                className={`border-b border-border hover:bg-[#005B2E]/5 ${isExcessive ? 'bg-amber-50/50' : ''}`}
              >
                <td className="px-3 py-3 font-medium">{r.employee_name || '—'}</td>
                <td className="px-3 py-3 text-xs">{r.data || '—'}</td>
                <td className="px-3 py-3 font-bold text-amber-600">{r.horas_extras || '—'}</td>
                <td className="px-3 py-3 text-xs">
                  {calcOvertimeValue(r.horas_extras || '', salary, 50)}
                </td>
                <td className="px-3 py-3 text-xs">
                  {calcOvertimeValue(r.horas_extras || '', salary, 100)}
                </td>
                <td className="px-3 py-3">
                  <DpStatusBadge status={r.situacao} />
                </td>
                <td className="px-3 py-3">
                  {r.situacao === 'Pendente' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openApprove(r)}
                      className="text-[#005B2E] hover:bg-[#005B2E]/10 h-8"
                    >
                      <Calculator className="w-3.5 h-3.5 mr-1" /> Avaliar
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </DpTable>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Avaliar Horas Extras</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm">
              Colaborador: <strong>{editing?.employee_name}</strong>
            </p>
            <p className="text-sm">
              Data: <strong>{editing?.data}</strong>
            </p>
            <p className="text-sm">
              Horas Extras: <strong className="text-amber-600">{editing?.horas_extras}</strong>
            </p>
            <p className="text-sm">
              Valor 50%:{' '}
              <strong>
                {editing &&
                  calcOvertimeValue(
                    editing.horas_extras || '',
                    getSalary(editing.employee_name),
                    50,
                  )}
              </strong>
            </p>
            <p className="text-sm">
              Valor 100%:{' '}
              <strong>
                {editing &&
                  calcOvertimeValue(
                    editing.horas_extras || '',
                    getSalary(editing.employee_name),
                    100,
                  )}
              </strong>
            </p>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Observação</Label>
              <Input
                value={approvalNote}
                onChange={(e) => setApprovalNote(e.target.value)}
                placeholder="Justificativa..."
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleApprove(false)}
              disabled={saving}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-1" /> Rejeitar
            </Button>
            <Button
              onClick={() => handleApprove(true)}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              <Check className="w-4 h-4 mr-1" /> Aprovar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
