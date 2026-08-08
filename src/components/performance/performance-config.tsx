import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { canEditPerformanceConfig } from '@/lib/performance-permissions'
import { getConfig, saveConfig, createConfig } from '@/services/performance'
import type { PerformanceConfig } from '@/lib/performance-types'
import { AdminLogin } from '@/components/admin-login'

export function PerformanceConfigPanel() {
  const { userRole } = useAuth()
  const canEdit = canEditPerformanceConfig(userRole)
  const [configs, setConfigs] = useState<PerformanceConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    company: 'default',
    periodicity: 'mensal',
    indicators: '[]',
    weights: '{}',
    goals: '{}',
    ai_rules: '{}',
  })

  const load = async () => {
    try {
      const c = await getConfig()
      setConfigs(c)
      if (c.length > 0) {
        setForm({
          company: c[0].company || 'default',
          periodicity: c[0].periodicity || 'mensal',
          indicators: JSON.stringify(c[0].indicators || [], null, 2),
          weights: JSON.stringify(c[0].weights || {}, null, 2),
          goals: JSON.stringify(c[0].goals || {}, null, 2),
          ai_rules: JSON.stringify({}, null, 2),
        })
      }
    } catch {
      /* empty */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const data = {
        company: form.company,
        periodicity: form.periodicity,
        indicators: JSON.parse(form.indicators),
        weights: JSON.parse(form.weights),
        goals: JSON.parse(form.goals),
        ai_rules: JSON.parse(form.ai_rules),
      }
      if (configs.length > 0) await saveConfig(configs[0].id, data)
      else await createConfig(data)
      load()
    } catch {
      /* empty */
    }
    setSaving(false)
  }

  if (!canEdit) return <AdminLogin />
  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[#005B2E]">Configurações de Performance</h2>
      <Card className="border-2 border-[#005B2E]/20">
        <CardHeader>
          <CardTitle className="text-sm">Configuração Geral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Empresa</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Periodicidade</Label>
              <select
                className="w-full h-9 rounded border border-input px-2 text-sm"
                value={form.periodicity}
                onChange={(e) => setForm({ ...form, periodicity: e.target.value })}
              >
                <option value="diaria">Diária</option>
                <option value="semanal">Semanal</option>
                <option value="mensal">Mensal</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Indicadores (JSON)</Label>
            <Textarea
              rows={4}
              value={form.indicators}
              onChange={(e) => setForm({ ...form, indicators: e.target.value })}
              className="font-mono text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Pesos (JSON)</Label>
            <Textarea
              rows={4}
              value={form.weights}
              onChange={(e) => setForm({ ...form, weights: e.target.value })}
              className="font-mono text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Metas (JSON)</Label>
            <Textarea
              rows={4}
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
              className="font-mono text-xs"
            />
          </div>
          <div>
            <Label className="text-xs">Regras da IA (JSON)</Label>
            <Textarea
              rows={4}
              value={form.ai_rules}
              onChange={(e) => setForm({ ...form, ai_rules: e.target.value })}
              className="font-mono text-xs"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D]"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}{' '}
            Salvar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
