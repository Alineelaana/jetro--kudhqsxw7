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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getWmsSeparations, createWmsSeparation, updateWmsSeparation } from '@/services/wms'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { SEPARATION_STRATEGIES, type WmsSeparation } from '@/lib/wms-types'
import { StockBarcodeInput } from './stock-barcode-input'
import { Plus, Loader2, Search, ScanBarcode } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  'Aguardando Separação': 'bg-amber-100 text-amber-700',
  'Em Separação': 'bg-blue-100 text-blue-700',
  Separada: 'bg-emerald-100 text-emerald-700',
  'Com Falta': 'bg-orange-100 text-orange-700',
  'Com Divergência': 'bg-red-100 text-red-700',
  Cancelada: 'bg-gray-100 text-gray-600',
}

export function WmsSeparation() {
  const { user } = useAuth()
  const userName = (user?.name as string) || 'Sistema'
  const [records, setRecords] = useState<WmsSeparation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    try {
      setRecords((await getWmsSeparations()) as WmsSeparation[])
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('wms_separations', () => load())

  const filtered = records.filter((r) => {
    const t = search.toLowerCase().trim()
    return (
      !t ||
      (r.numero_separacao || '').toLowerCase().includes(t) ||
      (r.cliente || '').toLowerCase().includes(t) ||
      (r.produto_nome || '').toLowerCase().includes(t)
    )
  })

  const handleNew = () => {
    setForm({
      numero_separacao: `SEP-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      status: 'Aguardando Separação',
      prioridade: 'Normal',
      estrategia: 'Pedido por Pedido',
      quantidade_solicitada: '1',
      quantidade_separada: '0',
    })
    setOpen(true)
  }
  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await createWmsSeparation({
        ...form,
        quantidade_solicitada: parseInt(form.quantidade_solicitada) || 1,
        quantidade_separada: parseInt(form.quantidade_separada) || 0,
        operador: '',
      })
      toast({ title: 'Separação criada' })
      setOpen(false)
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSubmitting(false)
  }
  const handleScan = (code: string) => {
    const match = records.find((r) => r.produto_codigo === code)
    toast({
      title: match ? 'Produto encontrado' : 'Produto não encontrado',
      description: match?.produto_nome,
    })
  }
  const handleStatus = async (id: string, status: string, operador?: string) => {
    try {
      await updateWmsSeparation(id, { status, ...(operador ? { operador } : {}) })
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
            Leitura de Produto/Localização
          </span>
        </div>
        <StockBarcodeInput onScan={handleScan} placeholder="Escaneie produto ou localização..." />
      </Card>
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar separação..."
            className="pl-10 focus-visible:ring-[#005B2E]"
          />
        </div>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Separação
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
                <th className="text-left px-3 py-2 font-bold hidden md:table-cell">Localização</th>
                <th className="text-right px-3 py-2 font-bold">Solic./Sep.</th>
                <th className="text-left px-3 py-2 font-bold">Status</th>
                <th className="text-center px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-mono font-bold text-[#C89B3C]">
                    {r.numero_separacao}
                  </td>
                  <td className="px-3 py-2 font-medium">{r.produto_nome || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.cliente || '—'}</td>
                  <td className="px-3 py-2 text-xs hidden md:table-cell">{r.localizacao || '—'}</td>
                  <td className="px-3 py-2 text-right text-xs">
                    {r.quantidade_solicitada}/{r.quantidade_separada}
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
                      {r.status === 'Aguardando Separação' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Em Separação', userName)}
                          className="text-blue-600 h-7 text-xs"
                        >
                          Iniciar
                        </Button>
                      )}
                      {r.status === 'Em Separação' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatus(r.id, 'Separada')}
                          className="text-emerald-600 h-7 text-xs"
                        >
                          Concluir
                        </Button>
                      )}
                      {r.status === 'Em Separação' && (
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
            <DialogTitle className="text-[#005B2E]">Nova Separação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Número</Label>
                <Input
                  value={form.numero_separacao || ''}
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
            <div className="space-y-1">
              <Label className="text-sm font-semibold">Produto</Label>
              <Input
                value={form.produto_nome || ''}
                onChange={(e) => setForm({ ...form, produto_nome: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Cliente</Label>
                <Input
                  value={form.cliente || ''}
                  onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Localização</Label>
                <Input
                  value={form.localizacao || ''}
                  onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Qtd. Solicitada</Label>
                <Input
                  type="number"
                  value={form.quantidade_solicitada || '1'}
                  onChange={(e) => setForm({ ...form, quantidade_solicitada: e.target.value })}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-semibold">Estratégia</Label>
                <Select
                  value={form.estrategia || 'Pedido por Pedido'}
                  onValueChange={(v) => setForm({ ...form, estrategia: v })}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEPARATION_STRATEGIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
