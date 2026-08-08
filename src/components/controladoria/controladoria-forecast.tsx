import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { Loader2, Plus, Trash2, AlertCircle } from 'lucide-react'
import { getForecastsByPeriod, ctrlCreate, ctrlDelete } from '@/services/controladoria'
import { computeProjection } from '@/services/controladoria-analytics'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { canManageForecast } from '@/lib/controladoria-permissions'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const PROJECTION_METHODS: Record<string, string> = {
  historical_avg: 'Média Histórica',
  seasonal: 'Sazonalidade',
  linear_trend: 'Tendência Linear',
  budget_based: 'Baseado no Orçamento',
  orders_based: 'Baseado em Pedidos',
}

export function ControladoriaForecast() {
  const { user, userRole } = useAuth()
  const [period, setPeriod] = useState(new Date().toISOString().substring(0, 7))
  const [forecasts, setForecasts] = useState<Record<string, unknown>[]>([])
  const [projection, setProjection] = useState<{
    realized: number
    budget: number
    forecast: number
    method: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    setLoading(true)
    try {
      const [fcData, proj] = await Promise.all([
        getForecastsByPeriod(period),
        computeProjection(period),
      ])
      setForecasts(fcData as Record<string, unknown>[])
      setProjection(proj)
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [period])
  useRealtime('controladoria_forecasts', () => load())

  const handleCreate = async () => {
    await ctrlCreate('controladoria_forecasts', {
      ...form,
      period,
      version_id: '',
      company: '',
      branch: '',
    })
    setOpen(false)
    setForm({})
    load()
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <Card className="border-2 border-amber-500/30 bg-amber-50">
        <CardContent className="py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-medium text-amber-700">
            Forecast é uma estimativa — nunca confundir com valor realizado.
          </span>
        </CardContent>
      </Card>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Período</label>
          <input
            type="month"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        {canManageForecast(userRole) && (
          <Button
            size="sm"
            className="bg-[#005B2E] hover:bg-[#01361D]"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        )}
      </div>
      {projection && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">REALIZADO</p>
              <p className="text-lg font-black text-[#005B2E]">R$ {fmt(projection.realized)}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-blue-500/20">
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">ORÇADO</p>
              <p className="text-lg font-black text-blue-600">R$ {fmt(projection.budget)}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-amber-500/20">
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">FORECAST</p>
              <p className="text-lg font-black text-amber-600">R$ {fmt(projection.forecast)}</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-500/20">
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">MÉTODO</p>
              <p className="text-sm font-bold text-purple-600">
                {PROJECTION_METHODS[projection.method] || projection.method}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[#005B2E]/20">
                  <th className="text-left py-2 px-2 text-[#005B2E]">Linha DRE</th>
                  <th className="text-left py-2 px-2 text-[#005B2E]">Centro Resultado</th>
                  <th className="text-right py-2 px-2 text-[#005B2E]">Valor Previsto</th>
                  <th className="text-right py-2 px-2 text-[#005B2E]">Realizado</th>
                  <th className="text-left py-2 px-2 text-[#005B2E]">Método</th>
                  {canManageForecast(userRole) && (
                    <th className="text-center py-2 px-2 text-[#005B2E]">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {forecasts.map((f) => (
                  <tr key={f.id as string} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="py-2 px-2">{String(f.dre_line_key || '—')}</td>
                    <td className="py-2 px-2 text-xs">{String(f.result_center || '—')}</td>
                    <td className="py-2 px-2 text-right font-medium">
                      R$ {fmt(parseFloat(String(f.value || '0')))}
                    </td>
                    <td className="py-2 px-2 text-right">
                      R$ {fmt(parseFloat(String(f.realized_value || '0')))}
                    </td>
                    <td className="py-2 px-2 text-xs">
                      {PROJECTION_METHODS[String(f.projection_method || '')] || '—'}
                    </td>
                    {canManageForecast(userRole) && (
                      <td className="py-2 px-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            await ctrlDelete('controladoria_forecasts', f.id as string)
                            load()
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Forecast</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Linha DRE</Label>
              <Input
                value={form.dre_line_key || ''}
                onChange={(e) => setForm({ ...form, dre_line_key: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Centro de Resultado</Label>
              <Input
                value={form.result_center || ''}
                onChange={(e) => setForm({ ...form, result_center: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Valor Previsto (R$)</Label>
              <Input
                type="number"
                value={form.value || ''}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Método</Label>
              <select
                value={form.projection_method || ''}
                onChange={(e) => setForm({ ...form, projection_method: e.target.value })}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">—</option>
                {Object.entries(PROJECTION_METHODS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} className="bg-[#005B2E] hover:bg-[#01361D]">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
