import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getBackupSettings, updateBackupSettings, type BackupSettings } from '@/services/backups'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Loader2, Save, Settings, CalendarClock } from 'lucide-react'

export function BackupSettingsSection() {
  const [settings, setSettings] = useState<BackupSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const s = await getBackupSettings()
        if (!cancelled) setSettings(s)
      } catch {
        if (!cancelled) setError('Erro ao carregar configurações.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      await updateBackupSettings(settings)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#005B2E] animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-[#005B2E]/20 shadow-lg">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#005B2E]" />
          <h3 className="text-lg font-black text-foreground">Configurações de Backup Automático</h3>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && (
          <p className="text-sm text-green-600 font-medium">Configurações salvas com sucesso!</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="font-semibold">Backup Diário</Label>
              <p className="text-xs text-muted-foreground">Executa todos os dias</p>
            </div>
            <Switch
              checked={settings?.daily ?? false}
              onCheckedChange={(v) => setSettings((s) => (s ? { ...s, daily: v } : s))}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="font-semibold">Backup Semanal</Label>
              <p className="text-xs text-muted-foreground">Executa toda semana</p>
            </div>
            <Switch
              checked={settings?.weekly ?? false}
              onCheckedChange={(v) => setSettings((s) => (s ? { ...s, weekly: v } : s))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label className="font-semibold">Tipo de Backup</Label>
            <Select
              value={settings?.type ?? 'full'}
              onValueChange={(v) => setSettings((s) => (s ? { ...s, type: v } : s))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Completo</SelectItem>
                <SelectItem value="database">Banco de Dados</SelectItem>
                <SelectItem value="files">Arquivos</SelectItem>
                <SelectItem value="config">Configuração</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="font-semibold flex items-center gap-1">
              <CalendarClock className="w-4 h-4" /> Última Execução
            </Label>
            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              {settings?.last_run && settings.last_run !== 'never'
                ? new Date(settings.last_run).toLocaleString('pt-BR')
                : 'Nunca executado'}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
