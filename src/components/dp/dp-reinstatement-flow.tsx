import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { DpLoading, DpTable, DpStatusBadge } from '@/components/dp/dp-shared'
import { getReinstatements } from '@/services/dp-enterprise'
import { dpCreate, dpUpdate } from '@/services/dp'
import { getEmployees } from '@/services/rh'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Plus, UserCheck, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'

export function DpReinstatementFlow() {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      const [rein, emp] = await Promise.all([
        getReinstatements().catch(() => []),
        getEmployees().catch(() => []),
      ])
      setRecords(rein as any[])
      setEmployees((emp as any[]).filter((e) => e.situacao === 'Desligado'))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('dp_reinstatements', () => load())

  const openNew = () => {
    setForm({ data_reintegracao: new Date().toISOString().split('T')[0], situacao: 'Pendente' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.employee_name) {
      toast.error('Selecione um colaborador')
      return
    }
    const emp = employees.find((e) => e.nome_completo === form.employee_name)
    setSaving(true)
    try {
      await dpCreate('dp_reinstatements', {
        ...form,
        employee_id: emp?.id || '',
        responsavel: (user?.name as string) || 'Admin',
      })
      if (emp) {
        await dpUpdate('rh_employees', emp.id, { situacao: 'Ativo' })
      }
      toast.success('Reintegração processada — vínculo reativado')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao processar reintegração')
    }
    setSaving(false)
  }

  if (loading) return <DpLoading />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Reintegrações</h3>
        <Button onClick={openNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Nova Reintegração
        </Button>
      </div>
      {records.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma reintegração registrada</p>
          </CardContent>
        </Card>
      ) : (
        <DpTable
          headers={[
            'Colaborador',
            'Data Reintegração',
            'Desligamento Original',
            'Motivo',
            'eSocial',
            'Situação',
          ]}
        >
          {records.map((r) => (
            <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-medium">{r.employee_name}</td>
              <td className="px-3 py-3 text-xs">{r.data_reintegracao || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.data_desligamento_original || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.motivo || '—'}</td>
              <td className="px-3 py-3 text-xs">{r.esocial_event_id ? 'Enviado' : 'Pendente'}</td>
              <td className="px-3 py-3">
                <DpStatusBadge status={r.situacao} />
              </td>
            </tr>
          ))}
        </DpTable>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Reintegração</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-sm font-semibold">Colaborador *</Label>
              <select
                className="w-full border rounded p-2 focus-visible:ring-[#005B2E]"
                value={form.employee_name || ''}
                onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
              >
                <option value="">Selecione...</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.nome_completo}>
                    {e.nome_completo}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Data Reintegração</Label>
              <Input
                type="date"
                value={form.data_reintegracao || ''}
                onChange={(e) => setForm({ ...form, data_reintegracao: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Data Desligamento Original</Label>
              <Input
                type="date"
                value={form.data_desligamento_original || ''}
                onChange={(e) => setForm({ ...form, data_desligamento_original: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-sm font-semibold">Motivo</Label>
              <Input
                value={form.motivo || ''}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-sm font-semibold">Observações / Reflexos</Label>
              <Textarea
                value={form.observacoes || ''}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                rows={3}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}{' '}
              Processar Reintegração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
