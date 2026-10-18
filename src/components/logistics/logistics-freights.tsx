import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
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
import { getFreights, createFreight, updateFreight } from '@/services/logistics'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { FREIGHT_STATUS, FREIGHT_TYPE, type LogisticsFreight } from '@/lib/logistics-types'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import { Plus, Pencil, Search, Loader2, DollarSign } from 'lucide-react'

const fmtCurrency = (v: string) => {
  const n = parseFloat(v || '0')
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function LogisticsFreights() {
  const { user } = useAuth()
  const [records, setRecords] = useState<LogisticsFreight[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<LogisticsFreight | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords(await getFreights())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('logistics_freights', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.numero_frete || '').toLowerCase().includes(t) ||
      (r.cliente || '').toLowerCase().includes(t) ||
      (r.transportadora || '').toLowerCase().includes(t)
    )
  })

  const handleNew = () => {
    setEditing(null)
    setForm({
      numero_frete: `FR-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      situacao: 'Em Cotação',
      tipo_frete: 'Próprio',
      valor_calculado: '0',
      valor_negociado: '0',
      pedagio: '0',
      seguro: '0',
      taxas: '0',
      adicionais: '0',
      valor_total: '0',
      responsavel: (user?.name as string) || '',
    })
    setOpen(true)
  }
  const handleEdit = (r: LogisticsFreight) => {
    setEditing(r)
    setForm({ ...r } as unknown as Record<string, string>)
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const calc =
        parseFloat(form.valor_negociado || '0') +
        parseFloat(form.pedagio || '0') +
        parseFloat(form.seguro || '0') +
        parseFloat(form.taxas || '0') +
        parseFloat(form.adicionais || '0')
      const data = { ...form, valor_total: calc.toString(), cotacoes: [], historico: [] }
      if (editing) await updateFreight(editing.id, data)
      else await createFreight(data)
      toast({ title: editing ? 'Frete atualizado' : 'Frete criado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar frete..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Frete
        </Button>
      </div>
      {records.length === 0 ? (
        <Card className="border-2 border-dashed">
          <div className="px-3 py-12 text-center text-muted-foreground">
            <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-40" />
            Nenhum frete encontrado
          </div>
        </Card>
      ) : (
        <JetroTable
          screenId="logistica.fretes"
          columns={[
            {
              id: 'numero_frete',
              header: 'Número',
              accessorKey: 'numero_frete',
              dataType: 'text',
              defaultWidth: 120,
              cell: ({ value }) => (
                <span className="font-mono text-xs font-bold text-[#C89B3C]">
                  {String(value || '—')}
                </span>
              ),
            },
            {
              id: 'cliente',
              header: 'Cliente',
              accessorKey: 'cliente',
              dataType: 'text',
              defaultWidth: 200,
              cell: ({ value }) => <span className="font-medium">{String(value || '—')}</span>,
            },
            {
              id: 'transportadora',
              header: 'Transportadora',
              accessorKey: 'transportadora',
              dataType: 'text',
              defaultWidth: 180,
              cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
            },
            {
              id: 'origem',
              header: 'Origem',
              accessorKey: 'origem',
              dataType: 'text',
              defaultWidth: 130,
              cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
            },
            {
              id: 'destino',
              header: 'Destino',
              accessorKey: 'destino',
              dataType: 'text',
              defaultWidth: 130,
              cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
            },
            {
              id: 'valor_total',
              header: 'Valor Total',
              accessorKey: 'valor_total',
              dataType: 'currency',
              align: 'right',
              defaultWidth: 130,
              getSortValue: (row) => parseFloat(String(row.valor_total || '0')),
              cell: ({ value }) => (
                <span className="font-bold">{fmtCurrency(String(value || '0'))}</span>
              ),
            },
            {
              id: 'situacao',
              header: 'Situação',
              accessorKey: 'situacao',
              dataType: 'text',
              align: 'center',
              defaultWidth: 120,
              cell: ({ value }) => (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
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
              defaultWidth: 70,
              cell: ({ row }) => (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(row)}
                  className="text-[#005B2E] hover:bg-[#005B2E]/10 h-7 w-7 p-0"
                  title="Editar"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
              ),
            },
          ]}
          data={filtered}
          emptyMessage="Nenhum frete corresponde aos filtros."
          exportTitle="Controle de Fretes — Jetro ERP"
          exportFilename="fretes-jetro.xlsx"
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {editing ? 'Editar Frete' : 'Novo Frete'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Número</Label>
              <Input
                value={form.numero_frete || ''}
                disabled
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Cliente</Label>
              <Input
                value={form.cliente || ''}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Transportadora</Label>
              <Input
                value={form.transportadora || ''}
                onChange={(e) => setForm({ ...form, transportadora: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Tipo de Frete</Label>
              <Select
                value={form.tipo_frete}
                onValueChange={(v) => setForm({ ...form, tipo_frete: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREIGHT_TYPE.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Origem</Label>
              <Input
                value={form.origem || ''}
                onChange={(e) => setForm({ ...form, origem: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Destino</Label>
              <Input
                value={form.destino || ''}
                onChange={(e) => setForm({ ...form, destino: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Valor Negociado</Label>
              <Input
                type="number"
                value={form.valor_negociado || '0'}
                onChange={(e) => setForm({ ...form, valor_negociado: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Pedágio</Label>
              <Input
                type="number"
                value={form.pedagio || '0'}
                onChange={(e) => setForm({ ...form, pedagio: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Seguro</Label>
              <Input
                type="number"
                value={form.seguro || '0'}
                onChange={(e) => setForm({ ...form, seguro: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Taxas</Label>
              <Input
                type="number"
                value={form.taxas || '0'}
                onChange={(e) => setForm({ ...form, taxas: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Situação</Label>
              <Select
                value={form.situacao}
                onValueChange={(v) => setForm({ ...form, situacao: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FREIGHT_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Responsável</Label>
              <Input
                value={form.responsavel || ''}
                onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
