import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { canManageJehAssistant } from '@/lib/permissions'
import { JehPageHeader } from './jeh-header'
import {
  JehAssistantService,
  type JehSettingsConfig,
  type JehAssistantStatus,
} from '@/services/jeh-assistant'
import {
  Settings,
  Power,
  PowerOff,
  Save,
  Plus,
  Trash2,
  ShieldAlert,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  Bell,
  Lock,
} from 'lucide-react'

export function JehSettingsScreen() {
  const [settings, setSettings] = useState<JehSettingsConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [status, setStatus] = useState<JehAssistantStatus>('inativa')
  const [defaultMessage, setDefaultMessage] = useState('')
  const [channels, setChannels] = useState<
    { channel: string; value: string; description?: string }[]
  >([])
  const [leadSource, setLeadSource] = useState('Jeh — Site Jetro')
  const [greetingMessage, setGreetingMessage] = useState('')
  const [notificationRecipients, setNotificationRecipients] = useState('comercial@jetro.com.br')
  const [notificationMode, setNotificationMode] = useState('imediato')
  const [lgpdNotice, setLgpdNotice] = useState('')
  const [recentNotifs, setRecentNotifs] = useState<any[]>([])
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelValue, setNewChannelValue] = useState('')

  const { toast } = useToast()
  const userRole = (pb.authStore.record as any)?.role
  const hasAdminPerm = canManageJehAssistant(userRole)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await JehAssistantService.getSettings()
      setSettings(data)
      setStatus(data.assistant_status)
      setDefaultMessage(data.unanswered_default_message)
      setChannels(data.contact_channels || [])
      setLeadSource(data.lead_source || 'Jeh — Site Jetro')
      setGreetingMessage(
        data.greeting_message ||
          'Olá! Seja muito bem-vindo(a) ao Jetro! 😊\nEu sou a Jeh, assistente virtual do Jetro, e estou aqui para ajudar você a conhecer melhor nosso sistema.\nAntes de começarmos, gostaria de saber um pouquinho sobre você para personalizar nosso atendimento.\nQual é o seu nome?',
      )
      setNotificationRecipients(data.notification_recipients || 'comercial@jetro.com.br')
      setNotificationMode(data.notification_mode || 'imediato')
      setLgpdNotice(
        data.lgpd_notice ||
          'Seus dados são protegidos e tratados para atendimento comercial do Jetro de acordo com a LGPD.',
      )
      const notifs = await JehAssistantService.getRecentNotifications()
      setRecentNotifs(notifs)
    } catch {
      toast({
        title: 'Erro ao carregar configurações',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAddChannel = () => {
    if (!newChannelName.trim() || !newChannelValue.trim()) {
      toast({ title: 'Preencha o canal e o valor de contato', variant: 'destructive' })
      return
    }
    setChannels((prev) => [
      ...prev,
      { channel: newChannelName.trim(), value: newChannelValue.trim() },
    ])
    setNewChannelName('')
    setNewChannelValue('')
  }

  const handleRemoveChannel = (index: number) => {
    setChannels((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasAdminPerm) {
      toast({
        title: 'Permissão negada',
        description:
          'Apenas administradores e supervisores podem salvar configurações da assistente.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      await JehAssistantService.saveSettings({
        assistant_status: status,
        unanswered_default_message: defaultMessage.trim(),
        contact_channels: channels,
        lead_source: leadSource.trim(),
        greeting_message: greetingMessage.trim(),
        notification_recipients: notificationRecipients.trim(),
        notification_mode: notificationMode,
        lgpd_notice: lgpdNotice.trim(),
      })
      toast({
        title: 'Configurações salvas com sucesso',
        description: 'Os parâmetros foram atualizados e persistidos no banco de dados.',
      })
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <JehPageHeader
        title="Configurações da Assistente Jeh"
        description="Parâmetros centrais de operação, mensagem de recusa padronizada e canais oficiais persistidos no banco."
      />

      <form onSubmit={handleSave} className="space-y-6">
        {/* GOVERNANÇA DE STATUS PERSISTIDO */}
        <Card className="border shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#005B2E]" />
              Status de Operação Institucional
            </CardTitle>
            <CardDescription className="text-xs">
              Este status é persistido diretamente na coleção <code>settings</code> do PocketBase
              (chave <code>jeh_assistant_status</code>), não no navegador do usuário.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-gray-50 border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-700">Status Atual:</span>
                  <Badge
                    className={`text-xs font-bold ${
                      status === 'ativa'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                  >
                    {status === 'ativa' ? 'ATIVA (PÚBLICA)' : 'INATIVA (PAUSADA)'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {status === 'ativa'
                    ? 'A assistente responde consultas nos canais oficiais conectados.'
                    : 'A assistente bloqueia chamadas externas com HTTP 403 enquanto a base é treinada e homologada.'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {status === 'ativa' ? (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={!hasAdminPerm || saving}
                    onClick={() => setStatus('inativa')}
                    className="h-8 text-xs"
                  >
                    <PowerOff className="w-3.5 h-3.5 mr-1.5" />
                    Mudar para Inativa
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    disabled={!hasAdminPerm || saving}
                    onClick={() => setStatus('ativa')}
                    className="h-8 text-xs bg-[#005B2E] hover:bg-[#01361D] text-white"
                  >
                    <Power className="w-3.5 h-3.5 mr-1.5" />
                    Mudar para Ativa
                  </Button>
                )}
              </div>
            </div>

            {!hasAdminPerm && (
              <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  Modificações bloqueadas para este perfil. Apenas administradores e supervisores
                  podem alterar.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* REGRAS MANDATÓRIAS DE LEADS & IDENTIFICAÇÃO */}
        <Card className="border shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#005B2E]" />
              Identificação Obrigatória e Captação de Leads
            </CardTitle>
            <CardDescription className="text-xs">
              Configurações de abertura do atendimento e registro de leads na base central do Jetro.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Origem de Leads (persistida no CRM)
              </Label>
              <Input
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                disabled={!hasAdminPerm || saving}
                className="h-8 text-xs font-mono"
                placeholder="Ex: Jeh — Site Jetro"
              />
              <p className="text-[11px] text-gray-500">
                Todo lead gerado por atendimento da Jeh é registrado com esta origem oficial.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Mensagem de Abertura Obrigatória
              </Label>
              <Textarea
                rows={3}
                value={greetingMessage}
                onChange={(e) => setGreetingMessage(e.target.value)}
                disabled={!hasAdminPerm || saving}
                className="text-xs leading-relaxed"
                placeholder="Mensagem de saudação solicitando identificação..."
              />
              <p className="text-[11px] text-gray-500">
                A Jeh solicita nome, telefone com DDD e melhor e-mail antes de apresentar o sistema
                ou responder perguntas.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* NOTIFICAÇÃO DE NOVOS LEADS */}
        <Card className="border shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#005B2E]" />
              Notificação de Novos Leads & Resumo Comercial
            </CardTitle>
            <CardDescription className="text-xs">
              Quando um lead fornece dados suficientes de contato, avisa a equipe comercial com
              dados do lead e resumo contextual.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">
                  E-mails dos Destinatários Internos (separados por vírgula)
                </Label>
                <Input
                  value={notificationRecipients}
                  onChange={(e) => setNotificationRecipients(e.target.value)}
                  disabled={!hasAdminPerm || saving}
                  className="h-8 text-xs font-mono"
                  placeholder="comercial@jetro.com.br, gestao@jetro.com.br"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Modo de Envio</Label>
                <select
                  value={notificationMode}
                  onChange={(e) => setNotificationMode(e.target.value)}
                  disabled={!hasAdminPerm || saving}
                  aria-label="Modo de Envio"
                  className="h-8 w-full border rounded-md px-2 text-xs bg-white focus-visible:ring-1 focus-visible:ring-[#005B2E]"
                >
                  <option value="imediato">Envio Imediato a cada lead captado</option>
                  <option value="consolidado">Fila Administrativa Consolidada</option>
                </select>
              </div>
            </div>

            {recentNotifs.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs font-bold text-[#005B2E]">
                  Últimos Avisos na Fila Administrativa ({recentNotifs.length})
                </Label>
                <div className="max-h-48 overflow-y-auto space-y-2 border rounded p-2 bg-slate-50 text-xs font-mono">
                  {recentNotifs.slice(0, 5).map((n) => (
                    <div key={n.id} className="p-2 bg-white rounded border border-slate-200">
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                        <span className="font-bold text-slate-800">
                          {n.lead_name || 'Lead'} ({n.lead_number || 'Sem número'})
                        </span>
                        <span>{new Date(n.created).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-[11px] text-slate-700">
                        {n.notification_body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* LGPD E PRIVACIDADE */}
        <Card className="border shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              Proteção de Dados (LGPD) e Aviso de Privacidade
            </CardTitle>
            <CardDescription className="text-xs">
              Aviso exibido aos visitantes no topo do chat informando o tratamento e segurança dos
              dados.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-2">
            <Textarea
              rows={2}
              value={lgpdNotice}
              onChange={(e) => setLgpdNotice(e.target.value)}
              disabled={!hasAdminPerm || saving}
              className="text-xs"
              placeholder="Aviso legal sobre retenção e privacidade de dados..."
            />
          </CardContent>
        </Card>

        {/* RESPOSTA PADRÃO QUANDO NÃO SOUBER */}
        <Card className="border shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Mensagem Padrão de Desconhecimento (Anti-Alucinação)
            </CardTitle>
            <CardDescription className="text-xs">
              Quando a pergunta do usuário não possuir resposta oficial em <code>jeh_qa</code> ou{' '}
              <code>jeh_knowledge</code>, esta resposta exata será transmitida, evitando
              alucinações.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-2">
            <Textarea
              rows={3}
              value={defaultMessage}
              onChange={(e) => setDefaultMessage(e.target.value)}
              disabled={!hasAdminPerm || saving}
              className="text-xs leading-relaxed"
              placeholder="Digite a mensagem padrão que será exibida ao usuário..."
            />
            <p className="text-[11px] text-gray-500">
              Esta mensagem deve ser cordial e direcionar o usuário aos canais humanos oficiais
              configurados abaixo.
            </p>
          </CardContent>
        </Card>

        {/* CANAIS OFICIAIS DE CONTATO APRESENTÁVEIS */}
        <Card className="border shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#C9A227]" />
              Canais Oficiais de Contato
            </CardTitle>
            <CardDescription className="text-xs">
              Canais institucionais que a Jeh tem permissão de divulgar ao usuário para suporte
              humano.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2 space-y-4">
            <div className="space-y-2">
              {channels.map((ch, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-gray-50 border rounded-lg text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-semibold text-gray-700 bg-white">
                      {ch.channel}
                    </Badge>
                    <span className="font-mono text-gray-900 font-medium">{ch.value}</span>
                  </div>
                  {hasAdminPerm && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveChannel(idx)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {hasAdminPerm && (
              <div className="pt-2 border-t">
                <span className="text-xs font-semibold text-gray-700 block mb-2">
                  Adicionar Novo Canal
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="Nome do Canal (ex: WhatsApp, SAC)"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Input
                    placeholder="Contato / Link / Número"
                    value={newChannelValue}
                    onChange={(e) => setNewChannelValue(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddChannel}
                    className="h-8 text-xs border-[#005B2E]/30 text-[#005B2E] hover:bg-[#005B2E]/10 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Incluir Canal
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BOTÃO SALVAR */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={!hasAdminPerm || saving}
            className="h-9 px-6 text-xs bg-[#005B2E] hover:bg-[#01361D] text-white font-semibold"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {saving ? 'Gravando Configurações...' : 'Salvar Todas as Configurações'}
          </Button>
        </div>
      </form>
    </div>
  )
}
