import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getWmsReceipts, createWmsReceipt, updateWmsReceipt } from '@/services/wms'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { useOrgFilter } from '@/hooks/use-org-filter'
import { MissingTenantNotice } from '@/components/multitenancy/missing-tenant-notice'
import { toast } from '@/hooks/use-toast'
import { type WmsReceipt } from '@/lib/wms-types'
import { Plus, Loader2, Search } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Aguardando Chegada': 'bg-cyan-100 text-cyan-700',
  Pendente: 'bg-amber-100 text-amber-700',
  'Em Recebimento': 'bg-blue-100 text-blue-700',
  Recebido: 'bg-emerald-100 text-emerald-700',
  'Com Divergência': 'bg-red-100 text-red-700',
  Cancelado: 'bg-gray-100 text-gray-600',
}

export function WmsReceiving() {
  const { user } = useAuth()
  const { hasMissingOrgBinding } = useOrgFilter()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<WmsReceipt[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords((await getWmsReceipts()) as WmsReceipt[])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('wms_receipts', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.numero_recebimento || '').toLowerCase().includes(t) ||
      (r.fornecedor || '').toLowerCase().includes(t) ||
      (r.nota_fiscal || '').toLowerCase().includes(t)
    )
  })

  const handleNew = () => {
    setForm({
      numero_recebimento: `REC-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      data_prevista: new Date().toISOString().split('T')[0],
      status: 'Pendente',
      responsavel: userName,
    })
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createWmsReceipt({ ...form, itens: [] })
      toast({ title: 'Recebimento criado' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }
  const handleStatus = async (id: string, status: string) => {
    try {
      const updates: Record<string, unknown> = { status }
      if (status === 'Recebido') updates.data_recebida = new Date().toISOString().split('T')[0]
      await updateWmsReceipt(id, updates)
      toast({ title: 'Status atualizado' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  if (hasMissingOrgBinding) {
    return <MissingTenantNotice moduleName="WMS / Recebimento" />
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
            placeholder="Buscar recebimento..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Recebimento
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Número</th>
                <th className="text-left px-3 py-2 font-bold">Fornecedor</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">NF</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Prevista</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">
                    {r.numero_recebimento}
                  </td>
                  <td className="px-3 py-2 font-medium">{r.fornecedor || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.nota_fiscal || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">
                    {r.data_prevista ? new Date(r.data_prevista).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[r.status] || 'bg-gray-100'}`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-center gap-1">
                      {r.status === 'Aguardando Chegada' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Em Recebimento')}
                          className="text-cyan-600 h-7 text-xs"
                        >
                          Confirmar Chegada
                        </Button>
                      )}
                      {r.status === 'Pendente' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Em Recebimento')}
                          className="text-blue-600 h-7 text-xs"
                        >
                          Iniciar
                        </Button>
                      )}
                      {r.status === 'Em Recebimento' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Recebido')}
                          className="text-emerald-600 h-7 text-xs"
                        >
                          Concluir
                        </Button>
                      )}
                      {r.status !== 'Recebido' && r.status !== 'Cancelado' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Cancelado')}
                          className="text-red-600 h-7 text-xs"
                        >
                          Cancelar
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Recebimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Número</Label>
                <Input
                  value={form.numero_recebimento || ''}
                  disabled
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Data Prevista</Label>
                <Input
                  type="date"
                  value={form.data_prevista || ''}
                  onChange={(e) => setForm({ ...form, data_prevista: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Fornecedor</Label>
              <Input
                value={form.fornecedor || ''}
                onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Nota Fiscal</Label>
                <Input
                  value={form.nota_fiscal || ''}
                  onChange={(e) => setForm({ ...form, nota_fiscal: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Responsável</Label>
                <Input
                  value={form.responsavel || ''}
                  disabled
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Observações</Label>
              <Textarea
                value={form.observacoes || ''}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                rows={2}
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
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
