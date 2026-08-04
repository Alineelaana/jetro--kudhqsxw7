import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getAuditConfig,
  updateAuditConfig,
  triggerAutoArchive,
  triggerScheduledReport,
  DEFAULT_AUDIT_CONFIG,
  type AuditAlertConfig,
} from '@/services/audit-settings'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Loader2, Save, Settings, Bell, Archive, FileText, Send, Play } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

function NumField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  suffix?: string
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-9 text-sm"
        />
        {suffix && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">{suffix}</span>
        )}
      </div>
    </div>
  )
}

function ToggleField({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <Label className="font-semibold text-sm">{label}</Label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export function AuditSettingsPanel() {
  const [config, setConfig] = useState<AuditAlertConfig>(DEFAULT_AUDIT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        setConfig(await getAuditConfig())
      } catch {
        /* defaults */
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const set = <K extends keyof AuditAlertConfig>(key: K, val: AuditAlertConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateAuditConfig(config)
      toast({ title: 'Configurações salvas com sucesso!' })
    } catch (e) {
      toast({ title: getErrorMessage(e), variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    setRunning('archive')
    try {
      const r = await triggerAutoArchive()
      toast({ title: `${r.archived} registros arquivados` })
    } catch (e) {
      toast({ title: getErrorMessage(e), variant: 'destructive' })
    } finally {
      setRunning(null)
    }
  }

  const handleReport = async () => {
    setRunning('report')
    try {
      await triggerScheduledReport()
      toast({ title: 'Relatório gerado e notificação enviada!' })
    } catch (e) {
      toast({ title: getErrorMessage(e), variant: 'destructive' })
    } finally {
      setRunning(null)
    }
  }

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
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#005B2E]" /> Configurações de Auditoria
        </h2>
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
          Salvar
        </Button>
      </div>

      <Tabs defaultValue="alerts">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="alerts">
            <Bell className="w-4 h-4 mr-1" /> Alertas
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Send className="w-4 h-4 mr-1" /> Notificações
          </TabsTrigger>
          <TabsTrigger value="archive">
            <Archive className="w-4 h-4 mr-1" /> Arquivo
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="w-4 h-4 mr-1" /> Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Horário inicial permitido</Label>
                  <Input
                    type="time"
                    value={config.allowed_hours_start}
                    onChange={(e) => set('allowed_hours_start', e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Horário final permitido</Label>
                  <Input
                    type="time"
                    value={config.allowed_hours_end}
                    onChange={(e) => set('allowed_hours_end', e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <NumField
                  label="Máx. logins inválidos"
                  value={config.max_failed_logins}
                  onChange={(v) => set('max_failed_logins', v)}
                  suffix="tentativas"
                />
                <NumField
                  label="Janela login inválida"
                  value={config.max_failed_logins_window_min}
                  onChange={(v) => set('max_failed_logins_window_min', v)}
                  suffix="min"
                />
                <NumField
                  label="Máx. logins por hora"
                  value={config.max_logins_per_hour}
                  onChange={(v) => set('max_logins_per_hour', v)}
                />
                <NumField
                  label="Máx. alterações (15 min)"
                  value={config.max_changes_per_15min}
                  onChange={(v) => set('max_changes_per_15min', v)}
                />
                <NumField
                  label="Máx. exportações/hora"
                  value={config.max_exports_per_hour}
                  onChange={(v) => set('max_exports_per_hour', v)}
                />
                <NumField
                  label="Máx. importações/hora"
                  value={config.max_imports_per_hour}
                  onChange={(v) => set('max_imports_per_hour', v)}
                />
                <NumField
                  label="Variação preço (%)"
                  value={config.price_change_threshold_pct}
                  onChange={(v) => set('price_change_threshold_pct', v)}
                  suffix="%"
                />
                <NumField
                  label="Variação margem (%)"
                  value={config.margin_change_threshold_pct}
                  onChange={(v) => set('margin_change_threshold_pct', v)}
                  suffix="%"
                />
                <NumField
                  label="Variação custo (%)"
                  value={config.cost_change_threshold_pct}
                  onChange={(v) => set('cost_change_threshold_pct', v)}
                  suffix="%"
                />
                <NumField
                  label="Variação impostos (%)"
                  value={config.tax_change_threshold_pct}
                  onChange={(v) => set('tax_change_threshold_pct', v)}
                  suffix="%"
                />
              </div>
              <ToggleField
                label="Alertar login em múltiplos dispositivos"
                desc="Notifica quando o mesmo usuário faz login em dispositivos diferentes simultaneamente"
                checked={config.multi_device_login_alert}
                onChange={(v) => set('multi_device_login_alert', v)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-3">
              <ToggleField
                label="Notificações por e-mail"
                desc="Enviar alerta externo ao responsável de segurança em eventos críticos"
                checked={config.email_notifications_enabled}
                onChange={(v) => set('email_notifications_enabled', v)}
              />
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  E-mail do responsável de segurança
                </Label>
                <Input
                  type="email"
                  value={config.notification_email}
                  onChange={(e) => set('notification_email', e.target.value)}
                  placeholder="seguranca@empresa.com"
                  className="h-9 text-sm"
                  disabled={!config.email_notifications_enabled}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                As notificações internas (no portal) são sempre enviadas para usuários SUP. Ative
                esta opção para receber também alertas por e-mail em eventos críticos.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-3">
              <ToggleField
                label="Arquivamento automático"
                desc="Arquivar registros antigos automaticamente para manter a performance"
                checked={config.auto_archive_enabled}
                onChange={(v) => set('auto_archive_enabled', v)}
              />
              <NumField
                label="Dias para arquivar"
                value={config.auto_archive_days}
                onChange={(v) => set('auto_archive_days', v)}
                suffix="dias"
              />
              <p className="text-xs text-muted-foreground">
                Registros arquivados não aparecem na listagem principal, mas permanecem consultáveis
                e nunca são excluídos. O arquivamento automático executa a cada hora via cron.
              </p>
              <Button
                onClick={handleArchive}
                disabled={running === 'archive'}
                variant="outline"
                className="border-[#005B2E] text-[#005B2E] font-bold"
              >
                {running === 'archive' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Executar agora
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-3">
              <ToggleField
                label="Relatórios programados"
                desc="Gerar relatórios periódicos de conformidade automaticamente"
                checked={config.scheduled_report_enabled}
                onChange={(v) => set('scheduled_report_enabled', v)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Frequência</Label>
                  <Select
                    value={config.scheduled_report_frequency}
                    onValueChange={(v) =>
                      set('scheduled_report_frequency', v as 'daily' | 'weekly' | 'monthly')
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Formato</Label>
                  <Select
                    value={config.scheduled_report_format}
                    onValueChange={(v) => set('scheduled_report_format', v as 'pdf' | 'excel')}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  E-mail para envio do relatório
                </Label>
                <Input
                  type="email"
                  value={config.scheduled_report_email}
                  onChange={(e) => set('scheduled_report_email', e.target.value)}
                  placeholder="compliance@empresa.com"
                  className="h-9 text-sm"
                  disabled={!config.scheduled_report_enabled}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                O relatório é gerado automaticamente conforme a frequência configurada (às 06:00) e
                uma notificação é enviada aos usuários SUP.
              </p>
              <Button
                onClick={handleReport}
                disabled={running === 'report'}
                variant="outline"
                className="border-[#005B2E] text-[#005B2E] font-bold"
              >
                {running === 'report' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Gerar agora
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
