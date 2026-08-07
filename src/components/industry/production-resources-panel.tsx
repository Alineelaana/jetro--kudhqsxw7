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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Cog, Plus, Loader2 } from 'lucide-react'
import {
  getProductionResources,
  createProductionResource,
  updateProductionResource,
  deleteProductionResource,
} from '@/services/industry'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import type { ProductionResource } from '@/lib/industry-types'

const TIPOS = [
  { value: 'linha_producao', label: 'Linha de Produção' },
  { value: 'maquina', label: 'Máquina' },
  { value: 'equipamento', label: 'Equipamento' },
  { value: 'celula', label: 'Célula' },
  { value: 'estacao', label: 'Estação' },
  { value: 'centro_produtivo', label: 'Centro Produtivo' },
]

export function ProductionResourcesPanel() {
  const [resources, setResources] = useState<ProductionResource[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = async () => {
    try {
      setResources(await getProductionResources())
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('production_resources', () => load())

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await createProductionResource({
        code: String(fd.get('code') || ''),
        name: String(fd.get('name') || ''),
        tipo: String(fd.get('tipo') || 'maquina'),
        description: String(fd.get('description') || ''),
        capacity_per_hour: Number(fd.get('capacity_per_hour') || 0),
        active: true,
        modulo_origem: 'engenharia',
      })
      toast({ title: 'Recurso criado' })
      setDialogOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao criar recurso', variant: 'destructive' })
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
          <Cog className="w-6 h-6 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">Recursos Produtivos</h2>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Recurso
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((r) => (
          <Card key={r.id} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-sm">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.code || '—'} • {TIPOS.find((t) => t.value === r.tipo)?.label || r.tipo}
                  </p>
                  {r.description && (
                    <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                  )}
                </div>
                <Badge
                  className={
                    r.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }
                >
                  {r.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              {r.capacity_per_hour > 0 && (
                <p className="text-xs mt-2">
                  <span className="text-muted-foreground">Capacidade:</span> {r.capacity_per_hour}/h
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {resources.length === 0 && (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="py-12 text-center">
            <Cog className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-bold mb-1">Nenhum recurso produtivo cadastrado</p>
          </CardContent>
        </Card>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Recurso Produtivo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Código</Label>
              <Input name="code" className="focus-visible:ring-[#005B2E]" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Nome *</Label>
              <Input name="name" required className="focus-visible:ring-[#005B2E]" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Tipo</Label>
              <Select name="tipo" defaultValue="maquina">
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-semibold">Descrição</Label>
              <Input name="description" className="focus-visible:ring-[#005B2E]" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Capacidade/h</Label>
              <Input
                name="capacity_per_hour"
                type="number"
                min="0"
                className="focus-visible:ring-[#005B2E]"
              />
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
