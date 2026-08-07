import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, SlidersHorizontal, Save, RefreshCw, Check } from 'lucide-react'
import {
  getThresholds,
  updateThreshold,
  runIntelligenceDetect,
} from '@/services/industrial-thresholds'
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type IndustrialThreshold,
  type ThresholdCategory,
} from '@/lib/industrial-thresholds-types'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'

export function ThresholdCalibrationPanel() {
  const [thresholds, setThresholds] = useState<IndustrialThreshold[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [detecting, setDetecting] = useState(false)
  const [editValues, setEditValues] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      const data = await getThresholds()
      setThresholds(data)
      const vals: Record<string, string> = {}
      data.forEach((t) => {
        vals[t.id] = t.value
      })
      setEditValues(vals)
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('industrial_threshold_config', () => load())

  const handleSave = async (id: string) => {
    setSaving((p) => ({ ...p, [id]: true }))
    try {
      await updateThreshold(id, { value: editValues[id] })
      toast({ title: 'Limite calibrado' })
      load()
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSaving((p) => ({ ...p, [id]: false }))
  }

  const handleDetect = async () => {
    setDetecting(true)
    try {
      await runIntelligenceDetect()
      toast({ title: 'Detecção executada com limiares calibrados' })
    } catch {
      toast({ title: 'Erro na detecção', variant: 'destructive' })
    }
    setDetecting(false)
  }

  const categories = Array.from(new Set(thresholds.map((t) => t.category))) as ThresholdCategory[]

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-6 h-6 text-[#005B2E]" />
          <div>
            <h2 className="text-xl font-black text-foreground">Calibração de Alertas</h2>
            <p className="text-sm text-muted-foreground">
              Ajuste os limiares da detecção de inteligência industrial
            </p>
          </div>
        </div>
        <Button
          onClick={handleDetect}
          disabled={detecting}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          {detecting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Executar Detecção
        </Button>
      </div>
      {categories.map((cat) => (
        <Card key={cat} className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge className={CATEGORY_COLORS[cat]}>{CATEGORY_LABELS[cat]}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {thresholds
                .filter((t) => t.category === cat)
                .map((t) => (
                  <div key={t.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Label className="text-sm font-bold">{t.label}</Label>
                        {t.description && (
                          <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {t.unit}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={editValues[t.id] ?? t.value}
                        onChange={(e) => setEditValues((p) => ({ ...p, [t.id]: e.target.value }))}
                        className="focus-visible:ring-[#005B2E]"
                      />
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-[#005B2E] hover:bg-[#01361D] shrink-0"
                        disabled={saving[t.id] || editValues[t.id] === t.value}
                        onClick={() => handleSave(t.id)}
                      >
                        {saving[t.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
