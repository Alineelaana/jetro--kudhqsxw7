import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { DpLoading, DpTable, DpStatusBadge } from '@/components/dp/dp-shared'
import { getEmployees, getDismissals, rhUpdate, rhCreate } from '@/services/rh'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { Plus, UserX, Check, Loader2, Shield, Package, FileText } from 'lucide-react'
import { toast } from 'sonner'

const DISMISSAL_TYPES = [
  'Sem Justa Causa',
  'Com Justa Causa',
  'Pedido de Demissão',
  'Término de Experiência',
  'Aposentadoria',
  'Falecimento',
]
const NOTICE_TYPES = ['Trabalhado', 'Indenizado', 'Dispensado']

export function DpDismissalFlow() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState<any[]>([])
  const [dismissals, setDismissals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      const [emp, dis] = await Promise.all([
        getEmployees().catch(() => []),
        getDismissals().catch(() => []),
      ])
      setEmployees((emp as any[]).filter((e) => e.situacao !== 'Desligado'))
      setDismissals(dis as any[])
    } catch {
      setEmployees([])
      setDismissals([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('rh_dismissals', () => load())

  const openNew = () => {
    setForm({ tipo_desligamento: 'Sem Justa Causa', aviso_previo: 'Trabalhado' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.employee_name) {
      toast.error('Selecione um colaborador')
      return
    }
    const emp = employees.find((e) => e.nome_completo === form.employee_name)
    if (!emp) return
    setSaving(true)
    try {
      const salario = parseFloat(emp.salario) || 0
      const diasAviso = form.aviso_previo === 'Indenizado' ? 30 : 0
      const rescisao = salario + (salario / 30) * diasAviso + salario / 12
      await rhCreate('rh_dismissals', {
        employee_name: emp.nome_completo,
        employee_id: emp.id,
        data_desligamento: form.data_desligamento || new Date().toISOString().split('T')[0],
        tipo_desligamento: form.tipo_desligamento,
        motivo: form.motivo || '',
        aviso_previo: form.aviso_previo,
        data_ultimo_dia: form.data_desligamento || new Date().toISOString().split('T')[0],
        responsavel: (user?.name as string) || 'Admin',
        valor_rescisao: rescisao.toFixed(2),
        observacoes: form.observacoes || '',
        situacao: 'Concluída',
      })
      await rhUpdate('rh_employees', emp.id, { situacao: 'Desligado' })
      toast.success('Desligamento processado — acesso bloqueado, benefícios encerrados')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao processar desligamento')
    }
    setSaving(false)
  }

  if (loading) return <DpLoading />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Desligamentos</h3>
        <Button onClick={openNew} className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Novo Desligamento
        </Button>
      </div>
      {dismissals.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum desligamento registrado</p>
          </CardContent>
        </Card>
      ) : (
        <DpTable headers={['Colaborador', 'Data', 'Tipo', 'Aviso', 'Valor', 'Situação', 'Ações']}>
          {dismissals.map((d) => (
            <tr key={d.id} className="border-b border-border hover:bg-[#005B2E]/5">
              <td className="px-3 py-3 font-medium">{d.employee_name}</td>
              <td className="px-3 py-3 text-xs">{d.data_desligamento || '—'}</td>
              <td className="px-3 py-3 text-xs">{d.tipo_desligamento || '—'}</td>
              <td className="px-3 py-3 text-xs">{d.aviso_previo || '—'}</td>
              <td className="px-3 py-3 font-bold text-[#005B2E]">
                {parseFloat(d.valor_rescisao || '0').toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </td>
              <td className="px-3 py-3">
                <DpStatusBadge status={d.situacao} />
              </td>
              <td className="px-3 py-3 text-xs text-muted-foreground">
                <Shield className="w-3 h-3 inline mr-1" />
                Acesso bloqueado
              </td>
            </tr>
          ))}
        </DpTable>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Desligamento</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Colaborador *</Label>
              <Select
                value={form.employee_name || ''}
                onValueChange={(v) => setForm({ ...form, employee_name: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.nome_completo}>
                      {e.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Data Desligamento</Label>
              <Input
                type="date"
                value={form.data_desligamento || ''}
                onChange={(e) => setForm({ ...form, data_desligamento: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Tipo</Label>
              <Select
                value={form.tipo_desligamento || ''}
                onValueChange={(v) => setForm({ ...form, tipo_desligamento: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISMISSAL_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Aviso Prévio</Label>
              <Select
                value={form.aviso_previo || ''}
                onValueChange={(v) => setForm({ ...form, aviso_previo: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTICE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label className="text-sm font-semibold">
                Observações / Entrevista de Desligamento
              </Label>
              <Textarea
                value={form.observacoes || ''}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                rows={3}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="sm:col-span-2 grid grid-cols-3 gap-2">
              <div className="flex items-center gap-2 text-xs bg-muted/50 p-2 rounded">
                <Check className="w-4 h-4 text-emerald-600" /> Acesso bloqueado
              </div>
              <div className="flex items-center gap-2 text-xs bg-muted/50 p-2 rounded">
                <Package className="w-4 h-4 text-blue-600" /> Equipamentos
              </div>
              <div className="flex items-center gap-2 text-xs bg-muted/50 p-2 rounded">
                <FileText className="w-4 h-4 text-[#005B2E]" /> Documentos
              </div>
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
                <Check className="w-4 h-4 mr-2" />
              )}{' '}
              Processar Desligamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
