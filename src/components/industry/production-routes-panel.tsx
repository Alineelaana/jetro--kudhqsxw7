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
import { Route, Plus, Loader2, ChevronRight } from 'lucide-react'
import { getProductionRoutes, getRouteOperations, createProductionRoute } from '@/services/industry'
import { getIndustrialItems } from '@/services/industry'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import type { ProductionRoute, ProductionRouteOperation } from '@/lib/industry-types'

export function ProductionRoutesPanel() {
  const [routes, setRoutes] = useState<ProductionRoute[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ProductionRoute | null>(null)
  const [operations, setOperations] = useState<ProductionRouteOperation[]>([])
  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = async () => {
    try {
      const [r, i] = await Promise.all([getProductionRoutes(), getIndustrialItems()])
      setRoutes(r)
      setItems(i as Record<string, unknown>[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('production_routes', () => load())

  const loadOps = async (routeId: string) => {
    try {
      setOperations(await getRouteOperations(routeId))
    } catch {
      setOperations([])
    }
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const productId = String(fd.get('product_id') || '')
    if (!productId) {
      toast({ title: 'Selecione um produto', variant: 'destructive' })
      return
    }
    try {
      await createProductionRoute({
        product_id: productId,
        version: 1,
        name: String(fd.get('name') || ''),
        description: String(fd.get('description') || ''),
        status: 'rascunho',
        responsible: 'Admin',
      })
      toast({ title: 'Roteiro criado' })
      setDialogOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao criar roteiro', variant: 'destructive' })
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
          <Route className="w-6 h-6 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">Roteiros de Produção</h2>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Roteiro
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map((r) => (
          <Card
            key={r.id}
            className={`border-2 cursor-pointer transition-colors ${selected?.id === r.id ? 'border-[#005B2E]' : 'border-[#005B2E]/20 hover:border-[#005B2E]/40'}`}
            onClick={() => {
              setSelected(r)
              loadOps(r.id)
            }}
          >
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.expand?.product_id?.name} • v{r.version}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      r.status === 'ativo'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }
                  >
                    {r.status}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {routes.length === 0 && (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="py-12 text-center">
            <Route className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold mb-1">Nenhum roteiro cadastrado</p>
          </CardContent>
        </Card>
      )}
      {selected && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <h3 className="font-bold text-[#005B2E] mb-3">
              Operações — {selected.name} (v{selected.version})
            </h3>
            <div className="space-y-2">
              {operations.map((op) => (
                <div key={op.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-[#005B2E] text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {op.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{op.name}</p>
                    <p className="text-xs text-muted-foreground">{op.description}</p>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    {op.expand?.resource_id && (
                      <p className="text-[#005B2E] font-medium">{op.expand.resource_id.name}</p>
                    )}
                    {op.tempo_operacao && (
                      <p className="text-muted-foreground">{op.tempo_operacao}min</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Roteiro de Produção</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Produto *</Label>
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
              <Label className="text-sm font-semibold">Nome *</Label>
              <Input name="name" required className="focus-visible:ring-[#005B2E]" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Descrição</Label>
              <Textarea name="description" rows={2} className="focus-visible:ring-[#005B2E]" />
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
