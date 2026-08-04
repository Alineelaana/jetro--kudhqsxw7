import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Ban, History, Printer } from 'lucide-react'
import { getWmsPallets, createWmsPallet, updateWmsPallet } from '@/services/wms-management'
import { PALLET_SITUATIONS, type WmsPallet } from '@/lib/wms-management-types'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const SITUATION_COLORS: Record<string, string> = {
  Disponível: 'bg-green-100 text-green-700',
  Bloqueado: 'bg-red-100 text-red-700',
  Expedido: 'bg-blue-100 text-blue-700',
  'Em Separação': 'bg-amber-100 text-amber-700',
}

export function WmsPallets() {
  const { user } = useAuth()
  const [pallets, setPallets] = useState<WmsPallet[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [historyPallet, setHistoryPallet] = useState<WmsPallet | null>(null)
  const [form, setForm] = useState({
    codigo_unico: '',
    etiqueta: '',
    tipo: 'Madeira',
    produto_nome: '',
    lote: '',
    validade: '',
    quantidade: '0',
    peso: '',
    volume: '',
    localizacao: '',
    situacao: 'Disponível',
  })

  const load = useCallback(async () => {
    try {
      setPallets(await getWmsPallets())
    } catch {
      setPallets([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('wms_pallets', () => load())

  const handleCreate = async () => {
    try {
      await createWmsPallet({
        ...form,
        quantidade: Number(form.quantidade),
        historico: [{ action: 'created', user: user?.name, date: new Date().toISOString() }],
      })
      toast({ title: 'Pallet criado com sucesso' })
      setDialogOpen(false)
      setForm({
        codigo_unico: '',
        etiqueta: '',
        tipo: 'Madeira',
        produto_nome: '',
        lote: '',
        validade: '',
        quantidade: '0',
        peso: '',
        volume: '',
        localizacao: '',
        situacao: 'Disponível',
      })
      load()
    } catch {
      toast({ title: 'Erro ao criar pallet', variant: 'destructive' })
    }
  }

  const handleBlock = async (p: WmsPallet) => {
    try {
      await updateWmsPallet(p.id, {
        situacao: 'Bloqueado',
        historico: [
          ...(p.historico || []),
          { action: 'blocked', user: user?.name, date: new Date().toISOString() },
        ],
      })
      toast({ title: 'Pallet bloqueado' })
      load()
    } catch {
      toast({ title: 'Erro ao bloquear', variant: 'destructive' })
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
        <h2 className="text-xl font-black text-foreground">Gestão de Pallets</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              <Plus className="w-4 h-4 mr-1" /> Novo Pallet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Pallet</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Código Único</Label>
                <Input
                  value={form.codigo_unico}
                  onChange={(e) => setForm({ ...form, codigo_unico: e.target.value })}
                />
              </div>
              <div>
                <Label>Etiqueta</Label>
                <Input
                  value={form.etiqueta}
                  onChange={(e) => setForm({ ...form, etiqueta: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Input
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                />
              </div>
              <div>
                <Label>Produto</Label>
                <Input
                  value={form.produto_nome}
                  onChange={(e) => setForm({ ...form, produto_nome: e.target.value })}
                />
              </div>
              <div>
                <Label>Lote</Label>
                <Input
                  value={form.lote}
                  onChange={(e) => setForm({ ...form, lote: e.target.value })}
                />
              </div>
              <div>
                <Label>Validade</Label>
                <Input
                  type="date"
                  value={form.validade}
                  onChange={(e) => setForm({ ...form, validade: e.target.value })}
                />
              </div>
              <div>
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  value={form.quantidade}
                  onChange={(e) => setForm({ ...form, quantidade: e.target.value })}
                />
              </div>
              <div>
                <Label>Peso</Label>
                <Input
                  value={form.peso}
                  onChange={(e) => setForm({ ...form, peso: e.target.value })}
                />
              </div>
              <div>
                <Label>Volume</Label>
                <Input
                  value={form.volume}
                  onChange={(e) => setForm({ ...form, volume: e.target.value })}
                />
              </div>
              <div>
                <Label>Localização</Label>
                <Input
                  value={form.localizacao}
                  onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
                />
              </div>
              <div>
                <Label>Situação</Label>
                <Select
                  value={form.situacao}
                  onValueChange={(v) => setForm({ ...form, situacao: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PALLET_SITUATIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="border-2 border-[#005B2E]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Código</th>
                <th className="text-left px-3 py-2 font-bold">Etiqueta</th>
                <th className="text-left px-3 py-2 font-bold">Produto</th>
                <th className="text-left px-3 py-2 font-bold">Qtd</th>
                <th className="text-left px-3 py-2 font-bold">Localização</th>
                <th className="text-left px-3 py-2 font-bold">Situação</th>
                <th className="text-left px-3 py-2 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pallets.map((p) => (
                <tr key={p.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-medium">{p.codigo_unico}</td>
                  <td className="px-3 py-2">{p.etiqueta || '—'}</td>
                  <td className="px-3 py-2">{p.produto_nome || '—'}</td>
                  <td className="px-3 py-2">{p.quantidade}</td>
                  <td className="px-3 py-2">{p.localizacao || '—'}</td>
                  <td className="px-3 py-2">
                    <Badge
                      className={cn(SITUATION_COLORS[p.situacao] || 'bg-gray-100 text-gray-700')}
                    >
                      {p.situacao}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setHistoryPallet(p)}
                        className="text-blue-600"
                      >
                        <History className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.print()}
                        className="text-gray-600"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                      {p.situacao !== 'Bloqueado' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleBlock(p)}
                          className="text-red-600"
                        >
                          <Ban className="w-3.5 h-3.5" />
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
      {pallets.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum pallet cadastrado.
          </CardContent>
        </Card>
      )}
      <Dialog open={!!historyPallet} onOpenChange={(o) => !o && setHistoryPallet(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Histórico do Pallet {historyPallet?.codigo_unico}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {(historyPallet?.historico || []).map((h, i) => (
              <div key={i} className="text-sm border-b pb-1">
                <span className="font-semibold">
                  {(h as Record<string, unknown>).action as string}
                </span>{' '}
                — {(h as Record<string, unknown>).user as string} —{' '}
                {new Date((h as Record<string, unknown>).date as string).toLocaleString('pt-BR')}
              </div>
            ))}
            {(!historyPallet?.historico || historyPallet.historico.length === 0) && (
              <p className="text-sm text-muted-foreground">Sem histórico.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
