import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { getStockTransfers, createStockTransfer, updateStockTransfer } from '@/services/stock'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { TRANSFER_STATUS, type StockTransfer } from '@/lib/stock-types'
import { Plus, Loader2, Search } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  Rascunho: 'bg-gray-100 text-gray-700',
  'Aguardando Aprovação': 'bg-amber-100 text-amber-700',
  Aprovada: 'bg-blue-100 text-blue-700',
  'Em Separação': 'bg-purple-100 text-purple-700',
  'Em Trânsito': 'bg-cyan-100 text-cyan-700',
  Recebida: 'bg-emerald-100 text-emerald-700',
  Cancelada: 'bg-red-100 text-red-700',
}

export function StockTransfers() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<StockTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords(await getStockTransfers())
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('stock_transfers', () => load())

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    return (
      !term ||
      (r.numero_transferencia || '').toLowerCase().includes(term) ||
      (r.responsavel || '').toLowerCase().includes(term)
    )
  })

  const handleNew = () => {
    setForm({
      numero_transferencia: `TRF-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      data: new Date().toISOString().split('T')[0],
      responsavel: userName,
      status: 'Rascunho',
    })
    setOpen(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createStockTransfer({ ...form, itens: [], fiscal_integrado: false })
      toast({ title: 'Transferência criada' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateStockTransfer(id, { status })
      toast({ title: 'Status atualizado' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
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
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar transferência..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Transferência
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Número</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Origem</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Destino</th>
                <th className="text-left px-3 py-2 font-bold">Data</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">
                    {r.numero_transferencia}
                  </td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">
                    {r.empresa_origem || '—'}/{r.deposito_origem || '—'}
                  </td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">
                    {r.empresa_destino || '—'}/{r.deposito_destino || '—'}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {r.data ? new Date(r.data).toLocaleDateString('pt-BR') : '—'}
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
                      {r.status === 'Rascunho' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Aguardando Aprovação')}
                          className="text-amber-600 h-7 text-xs"
                        >
                          Enviar
                        </Button>
                      )}
                      {r.status === 'Aguardando Aprovação' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Aprovada')}
                          className="text-blue-600 h-7 text-xs"
                        >
                          Aprovar
                        </Button>
                      )}
                      {r.status === 'Aprovada' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Em Trânsito')}
                          className="text-cyan-600 h-7 text-xs"
                        >
                          Enviar
                        </Button>
                      )}
                      {r.status === 'Em Trânsito' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Recebida')}
                          className="text-emerald-600 h-7 text-xs"
                        >
                          Receber
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Transferência</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Número</Label>
                <Input
                  value={form.numero_transferencia || ''}
                  disabled
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Data</Label>
                <Input
                  type="date"
                  value={form.data || ''}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Empresa Origem</Label>
                <Input
                  value={form.empresa_origem || ''}
                  onChange={(e) => setForm({ ...form, empresa_origem: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Depósito Origem</Label>
                <Input
                  value={form.deposito_origem || ''}
                  onChange={(e) => setForm({ ...form, deposito_origem: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Empresa Destino</Label>
                <Input
                  value={form.empresa_destino || ''}
                  onChange={(e) => setForm({ ...form, empresa_destino: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Depósito Destino</Label>
                <Input
                  value={form.deposito_destino || ''}
                  onChange={(e) => setForm({ ...form, deposito_destino: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Motivo</Label>
              <Input
                value={form.motivo || ''}
                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
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
