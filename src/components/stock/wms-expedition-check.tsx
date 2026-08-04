import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  getWmsExpeditionChecks,
  createWmsExpeditionCheck,
  updateWmsExpeditionCheck,
} from '@/services/wms'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { type WmsExpeditionCheck } from '@/lib/wms-types'
import { StockBarcodeInput } from './stock-barcode-input'
import { Plus, Loader2, Search, ScanBarcode } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Aguardando Conferência': 'bg-amber-100 text-amber-700',
  'Em Conferência': 'bg-blue-100 text-blue-700',
  Conferido: 'bg-emerald-100 text-emerald-700',
  'Com Divergência': 'bg-red-100 text-red-700',
  Reprovado: 'bg-gray-100 text-gray-600',
}

export function WmsExpeditionCheck() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<WmsExpeditionCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords((await getWmsExpeditionChecks()) as WmsExpeditionCheck[])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('wms_expedition_checks', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.numero_conferencia || '').toLowerCase().includes(t) ||
      (r.cliente || '').toLowerCase().includes(t) ||
      (r.produto_nome || '').toLowerCase().includes(t)
    )
  })

  const handleNew = () => {
    setForm({
      numero_conferencia: `CE-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      status: 'Aguardando Conferência',
      responsavel: userName,
      quantidade_separada: '0',
      quantidade_conferida: '0',
    })
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createWmsExpeditionCheck({
        ...form,
        quantidade_separada: parseInt(form.quantidade_separada) || 0,
        quantidade_conferida: parseInt(form.quantidade_conferida) || 0,
        diferenca:
          (parseInt(form.quantidade_conferida) || 0) - (parseInt(form.quantidade_separada) || 0),
      })
      toast({ title: 'Conferência criada' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }
  const handleScan = (code: string) => {
    toast({ title: 'Código lido', description: code })
  }
  const handleStatus = async (id: string, status: string) => {
    try {
      await updateWmsExpeditionCheck(id, { status })
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
      <Card className="border-2 border-[#005B2E]/20 p-3">
        <div className="flex items-center gap-2 mb-2">
          <ScanBarcode className="w-5 h-5 text-[#005B2E]" />
          <span className="text-sm font-semibold text-[#005B2E]">
            Conferência por Código de Barras
          </span>
        </div>
        <StockBarcodeInput
          onScan={handleScan}
          placeholder="Escaneie o código de barras do volume..."
        />
      </Card>
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conferência..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Conferência
        </Button>
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Número</th>
                <th className="text-left px-3 py-2 font-bold">Produto</th>
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Cliente</th>
                <th className="text-right px-3 py-2 font-bold">Sep./Conf.</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">
                    {r.numero_conferencia}
                  </td>
                  <td className="px-3 py-2 font-medium">{r.produto_nome || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.cliente || '—'}</td>
                  <td className="px-3 py-2 text-right text-xs">
                    {r.quantidade_separada}/{r.quantidade_conferida}
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
                      {r.status === 'Aguardando Conferência' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Em Conferência')}
                          className="text-blue-600 h-7 text-xs"
                        >
                          Iniciar
                        </Button>
                      )}
                      {r.status === 'Em Conferência' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Conferido')}
                          className="text-emerald-600 h-7 text-xs"
                        >
                          Concluir
                        </Button>
                      )}
                      {r.status === 'Em Conferência' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Com Divergência')}
                          className="text-red-600 h-7 text-xs"
                        >
                          Divergência
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
            <DialogTitle className="text-[#005B2E]">Nova Conferência de Expedição</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Número</Label>
                <Input
                  value={form.numero_conferencia || ''}
                  disabled
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Pedido</Label>
                <Input
                  value={form.pedido || ''}
                  onChange={(e) => setForm({ ...form, pedido: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Produto</Label>
                <Input
                  value={form.produto_nome || ''}
                  onChange={(e) => setForm({ ...form, produto_nome: e.target.value })}
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
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Qtd. Separada</Label>
                <Input
                  type="number"
                  value={form.quantidade_separada || '0'}
                  onChange={(e) => setForm({ ...form, quantidade_separada: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Qtd. Conferida</Label>
                <Input
                  type="number"
                  value={form.quantidade_conferida || '0'}
                  onChange={(e) => setForm({ ...form, quantidade_conferida: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Volume</Label>
              <Input
                value={form.volume || ''}
                onChange={(e) => setForm({ ...form, volume: e.target.value })}
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
