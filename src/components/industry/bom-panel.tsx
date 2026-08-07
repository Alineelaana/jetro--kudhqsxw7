import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Layers, Plus, Loader2, ChevronRight, FlaskConical } from 'lucide-react'
import {
  getBomVersions,
  getBomComponents,
  createBomVersion,
  createBomComponent,
} from '@/services/industry'
import { getIndustrialItems } from '@/services/industry'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import type { BomVersion, BomComponent } from '@/lib/industry-types'

export function BomPanel() {
  const [boms, setBoms] = useState<BomVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBom, setSelectedBom] = useState<BomVersion | null>(null)
  const [components, setComponents] = useState<BomComponent[]>([])
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = async () => {
    try {
      const [b, i] = await Promise.all([getBomVersions(), getIndustrialItems()])
      setBoms(b)
      setItems(i as Record<string, unknown>[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('bom_versions', () => load())

  const loadComponents = async (bomId: string) => {
    try {
      setComponents(await getBomComponents(bomId))
    } catch {
      setComponents([])
    }
  }

  const handleCreateBom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const productId = String(fd.get('product_id') || '')
    if (!productId) {
      toast({ title: 'Selecione um produto', variant: 'destructive' })
      return
    }
    try {
      const newBom = await createBomVersion({
        product_id: productId,
        version: 1,
        type: String(fd.get('type') || 'estrutura'),
        status: 'rascunho',
        rendimento: String(fd.get('rendimento') || ''),
        concentration: String(fd.get('concentration') || ''),
        ph: String(fd.get('ph') || ''),
        density: String(fd.get('density') || ''),
        temperature: String(fd.get('temperature') || ''),
        mixing_sequence: String(fd.get('mixing_sequence') || ''),
        tolerances: String(fd.get('tolerances') || ''),
        instructions: String(fd.get('instructions') || ''),
        responsible: 'Admin',
      })
      toast({ title: 'BOM criada' })
      setDialogOpen(false)
      load()
      setSelectedBom(newBom)
      loadComponents(newBom.id)
    } catch {
      toast({ title: 'Erro ao criar BOM', variant: 'destructive' })
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
        <div className="flex items-center gap-3">
          <Layers className="w-6 h-6 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">BOM / Estruturas e Formulações</h2>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova BOM
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {boms.map((b) => (
          <Card
            key={b.id}
            className={`border-2 cursor-pointer transition-colors ${selectedBom?.id === b.id ? 'border-[#005B2E]' : 'border-[#005B2E]/20 hover:border-[#005B2E]/40'}`}
            onClick={() => {
              setSelectedBom(b)
              loadComponents(b.id)
            }}
          >
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{b.expand?.product_id?.name || '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    v{b.version} • {b.type === 'formulacao' ? 'Formulação' : 'Estrutura'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {b.type === 'formulacao' && <FlaskConical className="w-4 h-4 text-purple-600" />}
                  <Badge
                    className={
                      b.status === 'ativo'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }
                  >
                    {b.status}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {boms.length === 0 && (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="py-12 text-center">
            <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold mb-1">Nenhuma BOM cadastrada</p>
            <p className="text-sm text-muted-foreground">Crie a primeira estrutura ou formulação</p>
          </CardContent>
        </Card>
      )}
      {selectedBom && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-3">
              Componentes — {selectedBom.expand?.product_id?.name} (v{selectedBom.version})
            </h3>
            {selectedBom.type === 'formulacao' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm">
                {selectedBom.concentration && (
                  <div>
                    <span className="text-muted-foreground">Concentração:</span>{' '}
                    {selectedBom.concentration}
                  </div>
                )}
                {selectedBom.ph && (
                  <div>
                    <span className="text-muted-foreground">pH:</span> {selectedBom.ph}
                  </div>
                )}
                {selectedBom.density && (
                  <div>
                    <span className="text-muted-foreground">Densidade:</span> {selectedBom.density}
                  </div>
                )}
                {selectedBom.temperature && (
                  <div>
                    <span className="text-muted-foreground">Temp.:</span> {selectedBom.temperature}
                  </div>
                )}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-bold">Ordem</th>
                    <th className="text-left py-2 px-3 font-bold">Item</th>
                    <th className="text-left py-2 px-3 font-bold">Qtd</th>
                    <th className="text-left py-2 px-3 font-bold">Unidade</th>
                    <th className="text-left py-2 px-3 font-bold">Perda</th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((c) => (
                    <tr key={c.id} className="border-b border-border">
                      <td className="py-2 px-3">{c.ordem}</td>
                      <td className="py-2 px-3 font-medium">{c.expand?.item_id?.name || '—'}</td>
                      <td className="py-2 px-3">{c.quantidade}</td>
                      <td className="py-2 px-3">{c.unidade}</td>
                      <td className="py-2 px-3">{c.perda_prevista}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova BOM / Estrutura</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBom} className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Produto Produzido *</Label>
              <Select name="product_id">
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {items.map((i) => (
                    <SelectItem key={String(i.id)} value={String(i.id)}>
                      {String(i.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Tipo</Label>
              <Select name="type" defaultValue="estrutura">
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estrutura">Estrutura</SelectItem>
                  <SelectItem value="formulacao">Formulação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Rendimento</Label>
                <Input name="rendimento" className="focus-visible:ring-[#005B2E]" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Concentração</Label>
                <Input name="concentration" className="focus-visible:ring-[#005B2E]" />
              </div>
              <div>
                <Label className="text-sm font-semibold">pH</Label>
                <Input name="ph" className="focus-visible:ring-[#005B2E]" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Densidade</Label>
                <Input name="density" className="focus-visible:ring-[#005B2E]" />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Sequência de Mistura</Label>
              <Textarea name="mixing_sequence" rows={2} className="focus-visible:ring-[#005B2E]" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Instruções</Label>
              <Textarea name="instructions" rows={2} className="focus-visible:ring-[#005B2E]" />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
