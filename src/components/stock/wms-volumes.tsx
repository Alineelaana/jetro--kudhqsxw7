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
import { Loader2, Plus } from 'lucide-react'
import { getWmsVolumes, createWmsVolume } from '@/services/wms-management'
import { VOLUME_SITUATIONS, type WmsVolume } from '@/lib/wms-management-types'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const VOLUME_TYPES = ['Caixa', 'Fardo', 'Saco', 'Unidade', 'Bag', 'Outro']

export function WmsVolumes() {
  const [volumes, setVolumes] = useState<WmsVolume[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [filterSituacao, setFilterSituacao] = useState('all')
  const [form, setForm] = useState({
    codigo: '',
    tipo: 'Caixa',
    produto_nome: '',
    quantidade: '1',
    lote: '',
    validade: '',
    peso: '',
    dimensoes: '',
    pallet_id: '',
    localizacao: '',
    situacao: 'Disponível',
  })

  const load = useCallback(async () => {
    try {
      setVolumes(await getWmsVolumes())
    } catch {
      setVolumes([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('wms_volumes', () => load())

  const handleCreate = async () => {
    try {
      await createWmsVolume({ ...form, quantidade: Number(form.quantidade) })
      toast({ title: 'Volume criado' })
      setDialogOpen(false)
      setForm({
        codigo: '',
        tipo: 'Caixa',
        produto_nome: '',
        quantidade: '1',
        lote: '',
        validade: '',
        peso: '',
        dimensoes: '',
        pallet_id: '',
        localizacao: '',
        situacao: 'Disponível',
      })
      load()
    } catch {
      toast({ title: 'Erro ao criar volume', variant: 'destructive' })
    }
  }

  const filtered = volumes.filter((v) => filterSituacao === 'all' || v.situacao === filterSituacao)

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-xl font-black text-foreground">Gestão de Volumes</h2>
        <div className="flex gap-2">
          <Select value={filterSituacao} onValueChange={setFilterSituacao}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Situação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {VOLUME_SITUATIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#005B2E] hover:bg-[#01361D] text-white">
                <Plus className="w-4 h-4 mr-1" /> Novo Volume
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Novo Volume</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Código</Label>
                  <Input
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VOLUME_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Produto</Label>
                  <Input
                    value={form.produto_nome}
                    onChange={(e) => setForm({ ...form, produto_nome: e.target.value })}
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
                  <Label>Peso</Label>
                  <Input
                    value={form.peso}
                    onChange={(e) => setForm({ ...form, peso: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Dimensões</Label>
                  <Input
                    value={form.dimensoes}
                    onChange={(e) => setForm({ ...form, dimensoes: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Pallet ID</Label>
                  <Input
                    value={form.pallet_id}
                    onChange={(e) => setForm({ ...form, pallet_id: e.target.value })}
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
                      {VOLUME_SITUATIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreate}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white"
                >
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card className="border-2 border-[#005B2E]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-2 font-bold">Código</th>
                <th className="text-left px-3 py-2 font-bold">Tipo</th>
                <th className="text-left px-3 py-2 font-bold">Produto</th>
                <th className="text-left px-3 py-2 font-bold">Qtd</th>
                <th className="text-left px-3 py-2 font-bold">Lote</th>
                <th className="text-left px-3 py-2 font-bold">Pallet</th>
                <th className="text-left px-3 py-2 font-bold">Localização</th>
                <th className="text-left px-3 py-2 font-bold">Situação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-3 py-2 font-medium">{v.codigo}</td>
                  <td className="px-3 py-2">{v.tipo}</td>
                  <td className="px-3 py-2">{v.produto_nome || '—'}</td>
                  <td className="px-3 py-2">{v.quantidade}</td>
                  <td className="px-3 py-2">{v.lote || '—'}</td>
                  <td className="px-3 py-2">{v.pallet_id || '—'}</td>
                  <td className="px-3 py-2">{v.localizacao || '—'}</td>
                  <td className="px-3 py-2">
                    <Badge
                      className={cn(
                        v.situacao === 'Bloqueado'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700',
                      )}
                    >
                      {v.situacao}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {filtered.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum volume cadastrado.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
