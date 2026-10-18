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
import {
  getNfseRecords,
  createNfseRecord,
  updateNfseRecord,
  logFiscalAudit,
} from '@/services/fiscal'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { NFSE_STATUS, STATUS_COLORS } from '@/lib/fiscal-types'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { Loader2, Plus, FileText, Check, X, Search } from 'lucide-react'
import { toast } from 'sonner'

export function NfsePanel() {
  const { user } = useAuth()
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setRecords(await getNfseRecords())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('nfse_records', () => load())

  const filtered = records.filter(
    (r) =>
      !search ||
      (r.tomador as string)?.toLowerCase().includes(search.toLowerCase()) ||
      (r.nfse_number as string)?.includes(search),
  )

  const handleSave = async () => {
    if (!form.servico || !form.tomador) {
      toast.error('Serviço e Tomador são obrigatórios')
      return
    }
    setSaving(true)
    try {
      const userName = (user?.name as string) || 'Sistema'
      const valor = parseFloat(form.valor || '0')
      const deducoes = parseFloat(form.deducoes || '0')
      const baseCalc = valor - deducoes
      const iss = baseCalc * (parseFloat(form.iss || '0') / 100)
      const cbs = baseCalc * (parseFloat(form.cbs || '0') / 100)
      const ibs = baseCalc * (parseFloat(form.ibs || '0') / 100)
      const valorLiquido =
        valor -
        iss -
        parseFloat(form.inss || '0') -
        parseFloat(form.irrf || '0') -
        parseFloat(form.pis || '0') -
        parseFloat(form.cofins || '0') -
        parseFloat(form.csll || '0') -
        cbs -
        ibs
      await createNfseRecord({
        ...form,
        valor: valor.toFixed(2),
        base_calculo: baseCalc.toFixed(2),
        iss: iss.toFixed(2),
        cbs: cbs.toFixed(2),
        ibs: ibs.toFixed(2),
        valor_liquido: valorLiquido.toFixed(2),
        status: 'Autorizada',
        authorization_protocol: String(Date.now()),
        responsible_user: userName,
        company: 'Jetro Logística',
        branch: 'Matriz',
      })
      logFiscalAudit('create', 'nfse_records', '', `NFS-e emitida para ${form.tomador}`)
      toast.success('NFS-e emitida com sucesso')
      setOpen(false)
      setForm({})
      load()
    } catch {
      toast.error('Erro ao emitir NFS-e')
    }
    setSaving(false)
  }

  const updateStatus = async (id: string, status: string, num: string) => {
    try {
      await updateNfseRecord(id, { status })
      logFiscalAudit('update', 'nfse_records', id, `NFS-e ${num} - ${status}`)
      toast.success(`NFS-e ${status}`)
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">Emissão de NFS-e</h3>
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova NFS-e
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar NFS-e..."
              className="pl-10 focus-visible:ring-[#005B2E]"
            />
          </div>
        </CardContent>
      </Card>
      {records.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhuma NFS-e encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <JetroTable
          screenId="fiscal.nfse"
          columns={[
            {
              id: 'nfse_number',
              header: 'Nº NFS-e',
              accessorKey: 'nfse_number',
              dataType: 'text',
              defaultWidth: 120,
              cell: ({ value }) => (
                <span className="text-xs font-mono font-bold text-[#C89B3C]">
                  {String(value || '—')}
                </span>
              ),
            },
            {
              id: 'tomador',
              header: 'Tomador',
              accessorKey: 'tomador',
              dataType: 'text',
              defaultWidth: 220,
              cell: ({ value }) => <span className="font-medium">{String(value || '—')}</span>,
            },
            {
              id: 'servico',
              header: 'Serviço',
              accessorKey: 'servico',
              dataType: 'text',
              defaultWidth: 220,
              cell: ({ value }) => <span>{String(value || '—')}</span>,
            },
            {
              id: 'valor',
              header: 'Valor',
              accessorKey: 'valor',
              dataType: 'currency',
              align: 'right',
              defaultWidth: 130,
              getSortValue: (row) => parseFloat(String(row.valor || '0').replace(',', '.')) || 0,
              cell: ({ value }) => <span className="font-bold">R$ {String(value || '0,00')}</span>,
            },
            {
              id: 'status',
              header: 'Status',
              accessorKey: 'status',
              dataType: 'text',
              align: 'center',
              defaultWidth: 120,
              cell: ({ value }) => (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[String(value || '')] || 'bg-gray-100 text-gray-600'}`}
                >
                  {String(value || '—')}
                </span>
              ),
            },
            {
              id: 'actions',
              header: 'Ações',
              align: 'center',
              sortable: false,
              hideable: false,
              resizable: false,
              draggable: false,
              defaultWidth: 80,
              cell: ({ row }) => {
                if (row.status !== 'Autorizada') return null
                return (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateStatus(row.id as string, 'Cancelada', String(row.nfse_number || ''))
                    }
                    className="text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                    title="Cancelar NFS-e"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )
              },
            },
          ]}
          data={filtered}
          rowKey={(r) => (r.id as string) || String(Math.random())}
          emptyMessage="Nenhuma NFS-e corresponde aos filtros."
          exportTitle="Emissão de NFS-e — Jetro ERP"
          exportFilename="nfse-jetro.xlsx"
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova NFS-e</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Tomador *</Label>
              <Input
                value={form.tomador || ''}
                onChange={(e) => setForm({ ...form, tomador: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">CPF/CNPJ</Label>
              <Input
                value={form.tomador_doc || ''}
                onChange={(e) => setForm({ ...form, tomador_doc: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Serviço *</Label>
              <Input
                value={form.servico || ''}
                onChange={(e) => setForm({ ...form, servico: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Código do Serviço</Label>
              <Input
                value={form.codigo_servico || ''}
                onChange={(e) => setForm({ ...form, codigo_servico: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Valor (R$) *</Label>
              <Input
                type="number"
                value={form.valor || ''}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Deduções (R$)</Label>
              <Input
                type="number"
                value={form.deducoes || ''}
                onChange={(e) => setForm({ ...form, deducoes: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">ISS (%)</Label>
              <Input
                type="number"
                value={form.iss || ''}
                onChange={(e) => setForm({ ...form, iss: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">ISS Retido</Label>
              <Select
                value={form.iss_retido || 'false'}
                onValueChange={(v) => setForm({ ...form, iss_retido: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Sim</SelectItem>
                  <SelectItem value="false">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">CBS (%)</Label>
              <Input
                type="number"
                value={form.cbs || ''}
                onChange={(e) => setForm({ ...form, cbs: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">IBS (%)</Label>
              <Input
                type="number"
                value={form.ibs || ''}
                onChange={(e) => setForm({ ...form, ibs: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">INSS (R$)</Label>
              <Input
                type="number"
                value={form.inss || ''}
                onChange={(e) => setForm({ ...form, inss: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">IRRF (R$)</Label>
              <Input
                type="number"
                value={form.irrf || ''}
                onChange={(e) => setForm({ ...form, irrf: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">Observações</Label>
              <Input
                value={form.observacoes || ''}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
              <Check className="w-4 h-4 mr-2" /> Emitir NFS-e
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
