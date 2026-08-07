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
import { Calendar, Plus, Loader2, Zap, TrendingUp } from 'lucide-react'
import { getMasterPlans, createMasterPlan, generateMasterPlan } from '@/services/pcp'
import { getIndustrialItems } from '@/services/industry'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-600',
  aprovado: 'bg-emerald-100 text-emerald-700',
  em_execucao: 'bg-amber-100 text-amber-700',
  concluido: 'bg-blue-100 text-blue-700',
  cancelado: 'bg-red-100 text-red-700',
}

export function MasterPlanPanel() {
  const { user } = useAuth()
  const [plans, setPlans] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)

  const load = async () => {
    try {
      const [p, i] = await Promise.all([getMasterPlans(), getIndustrialItems()])
      setPlans(p)
      setItems(i as any[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('master_production_plans', () => load())

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const productId = String(fd.get('product_id') || '')
    if (!productId) {
      toast({ title: 'Selecione um produto', variant: 'destructive' })
      return
    }
    try {
      await createMasterPlan({
        plan_number: 'MPP-' + new Date().toISOString().substring(0, 7).replace('-', ''),
        product_id: productId,
        period: String(fd.get('period') || ''),
        forecast_quantity: Number(fd.get('forecast_quantity') || 0),
        status: 'rascunho',
        responsible: (user?.name as string) || 'PCP',
      })
      toast({ title: 'Plano mestre criado' })
      setDialogOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao criar plano', variant: 'destructive' })
    }
  }

  const handleGenerate = async (planId: string) => {
    setGenerating(planId)
    try {
      const result = await generateMasterPlan(planId)
      toast({ title: `MRP gerado: ${result.total_suggestions} sugestoes` })
      load()
    } catch {
      toast({ title: 'Erro ao gerar MRP', variant: 'destructive' })
    }
    setGenerating(null)
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
          <Calendar className="w-6 h-6 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">Plano Mestre de Producao</h2>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Plano
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((p) => (
          <Card key={p.id} className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-bold text-sm">{p.plan_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.expand?.product_id?.name || '-'} - Periodo: {p.period}
                  </p>
                </div>
                <Badge className={STATUS_COLORS[p.status] || 'bg-gray-100'}>{p.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Previsto: {p.forecast_quantity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  <span>Realizado: {p.actual_quantity || 0}</span>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs"
                disabled={generating === p.id}
                onClick={() => handleGenerate(p.id)}
              >
                {generating === p.id ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3 mr-1" />
                )}
                Gerar MRP
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Plano Mestre</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Produto *</Label>
              <select
                name="product_id"
                required
                className="w-full p-2 border rounded focus-visible:ring-[#005B2E]"
              >
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Periodo</Label>
                <Input
                  name="period"
                  placeholder="2026-08"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">Qtd Prevista</Label>
                <Input
                  name="forecast_quantity"
                  type="number"
                  min="0"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
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
