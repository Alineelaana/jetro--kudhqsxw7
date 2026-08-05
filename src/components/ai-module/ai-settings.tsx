import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getAiSettings, updateAiSettings } from '@/services/ai-module'
import { useAuth } from '@/hooks/use-auth'
import { canChangeAiSettings } from '@/lib/ai-permissions'
import { AUTONOMY_LEVELS, type AiModuleSettings } from '@/lib/ai-types'
import { Loader2, Save, Settings } from 'lucide-react'
import { toast } from 'sonner'

export function AiSettingsPanel() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<AiModuleSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAiSettings()
      .then((s) => {
        setSettings(s)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    try {
      await updateAiSettings(settings.id, {
        assistant_name: settings.assistant_name,
        language: settings.language,
        communication_tone: settings.communication_tone,
        working_hours: settings.working_hours,
        interaction_limit: settings.interaction_limit,
        response_time: settings.response_time,
        transfer_time: settings.transfer_time,
        autonomy_level: settings.autonomy_level,
        history_retention: settings.history_retention,
      })
      toast.success('Configurações salvas')
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  if (!canChangeAiSettings(user?.role as string)) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-8 text-center">
          <p className="font-bold text-destructive">
            Acesso negado. Apenas SUP pode alterar configurações da IA.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const s = settings || ({} as AiModuleSettings)

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#005B2E]" /> Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nome do Assistente</Label>
              <Input
                value={s.assistant_name || ''}
                onChange={(e) => setSettings({ ...s, assistant_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Idioma</Label>
              <Input
                value={s.language || ''}
                onChange={(e) => setSettings({ ...s, language: e.target.value })}
              />
            </div>
            <div>
              <Label>Tom de Comunicação</Label>
              <Input
                value={s.communication_tone || ''}
                onChange={(e) => setSettings({ ...s, communication_tone: e.target.value })}
              />
            </div>
            <div>
              <Label>Horário de Funcionamento</Label>
              <Input
                value={s.working_hours || ''}
                onChange={(e) => setSettings({ ...s, working_hours: e.target.value })}
              />
            </div>
            <div>
              <Label>Limite de Interações</Label>
              <Input
                type="number"
                value={s.interaction_limit || 0}
                onChange={(e) => setSettings({ ...s, interaction_limit: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Tempo de Resposta (s)</Label>
              <Input
                type="number"
                value={s.response_time || 0}
                onChange={(e) => setSettings({ ...s, response_time: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Tempo para Transferência (s)</Label>
              <Input
                type="number"
                value={s.transfer_time || 0}
                onChange={(e) => setSettings({ ...s, transfer_time: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Retenção do Histórico (dias)</Label>
              <Input
                type="number"
                value={s.history_retention || 0}
                onChange={(e) => setSettings({ ...s, history_retention: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label>Nível de Autonomia</Label>
            <Select
              value={s.autonomy_level || 'Somente Consultar'}
              onValueChange={(v) => setSettings({ ...s, autonomy_level: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUTONOMY_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}{' '}
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
