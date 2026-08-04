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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getApuracoes, createApuracao, updateApuracao, logFiscalAudit } from '@/services/fiscal'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { APURACAO_STATUS, STATUS_COLORS } from '@/lib/fiscal-types'
import { Loader2, Plus, FileText, Check, Calculator, Send } from 'lucide-react'
import { toast } from 'sonner'

export function ApuracaoPanel() {
  const { user } = useAuth()
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      setRecords(await getApuracoes())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('fiscal_apuracao', () => load())

  const handleSave = async () => {
    if (!form.periodo || !form.tributo) {
      toast.error('Período e Tributo são obrigatórios')
      return
    }
    try {
      const userName = (user?.name as string) || 'Sistema'
      await createApuracao({
        ...form,
        status: 'Processado',
        responsible_user: userName,
        company: 'Velora Log',
        branch: 'Matriz',
      })
      logFiscalAudit('create', 'fiscal_apuracao', '', `Apuração ${form.tributo} - ${form.periodo}`)
      toast.success('Apuração processada')
      setOpen(false)
      setForm({})
      load()
    } catch {
      toast.error('Erro ao processar apuração')
    }
  }

  const advanceStatus = async (r: Record<string, unknown>, newStatus: string) => {
    try {
      await updateApuracao(r.id as string, { status: newStatus })
      logFiscalAudit(
        'update',
        'fiscal_apuracao',
        r.id as string,
        `Apuração ${r.tributo} - ${newStatus}`,
      )
      toast.success(`Apuração ${newStatus}`)
      load()
    } catch {
      toast.error('Erro ao atualizar')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const tributos = [
    'ICMS',
    'ICMS_ST',
    'DIFAL',
    'FCP',
    'IPI',
    'PIS',
    'COFINS',
    'ISS',
    'IRRF',
    'INSS',
    'CSLL',
    'CBS',
    'IBS',
    'Imposto_Seletivo',
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[#005B2E]" /> Apuração de Impostos
        </h3>
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Apuração
        </Button>
      </div>
      {records.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma apuração encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Período</th>
                  <th className="text-left px-3 py-3 font-bold">Tributo</th>
                  <th className="text-left px-3 py-3 font-bold">Saldo Anterior</th>
                  <th className="text-left px-3 py-3 font-bold">Débitos</th>
                  <th className="text-left px-3 py-3 font-bold">Créditos</th>
                  <th className="text-left px-3 py-3 font-bold">A Recolher</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id as string} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3 font-medium">{r.periodo as string}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded bg-[#005B2E]/10 text-[#005B2E]">
                        {r.tributo as string}
                      </span>
                    </td>
                    <td className="px-3 py-3">R$ {(r.saldo_anterior as string) || '0,00'}</td>
                    <td className="px-3 py-3 text-red-600">R$ {(r.debitos as string) || '0,00'}</td>
                    <td className="px-3 py-3 text-emerald-600">
                      R$ {(r.creditos as string) || '0,00'}
                    </td>
                    <td className="px-3 py-3 font-bold">
                      R$ {(r.saldo_recolher as string) || '0,00'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[r.status as string] || ''}`}
                      >
                        {r.status as string}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {r.status === 'Processado' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => advanceStatus(r, 'Conferido')}
                            className="text-blue-600"
                            title="Conferir"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {r.status === 'Conferido' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => advanceStatus(r, 'Aprovado')}
                            className="text-emerald-600"
                            title="Aprovar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {r.status === 'Aprovado' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              advanceStatus(r, 'Encerrado')
                              toast.info('Guia gerada e enviada ao Contas a Pagar')
                            }}
                            className="text-[#005B2E]"
                            title="Encerrar e Gerar Guia"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {r.status === 'Encerrado' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => advanceStatus(r, 'Reaberto')}
                            className="text-amber-600"
                            title="Reabrir"
                          >
                            ↺
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Apuração</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Período *</Label>
              <Input
                type="month"
                value={form.periodo || ''}
                onChange={(e) => setForm({ ...form, periodo: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Tributo *</Label>
              <Select
                value={form.tributo || ''}
                onValueChange={(v) => setForm({ ...form, tributo: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {tributos.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Saldo Anterior</Label>
              <Input
                type="number"
                value={form.saldo_anterior || '0'}
                onChange={(e) => setForm({ ...form, saldo_anterior: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Débitos</Label>
              <Input
                type="number"
                value={form.debitos || '0'}
                onChange={(e) => setForm({ ...form, debitos: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Créditos</Label>
              <Input
                type="number"
                value={form.creditos || '0'}
                onChange={(e) => setForm({ ...form, creditos: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Ajustes</Label>
              <Input
                type="number"
                value={form.ajustes || '0'}
                onChange={(e) => setForm({ ...form, ajustes: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Estornos</Label>
              <Input
                type="number"
                value={form.estornos || '0'}
                onChange={(e) => setForm({ ...form, estornos: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Compensações</Label>
              <Input
                type="number"
                value={form.compensacoes || '0'}
                onChange={(e) => setForm({ ...form, compensacoes: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              <Calculator className="w-4 h-4 mr-2" /> Processar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
