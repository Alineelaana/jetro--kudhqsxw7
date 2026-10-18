import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  getJetroOnlineConfig,
  updateJetroOnlineConfig,
  type JetroOnlineConfig,
} from '@/services/jetro-online'
import { Save, Settings, Sparkles, MessageCircle, RefreshCw } from 'lucide-react'

export function JetroOnlineGeneralSettingsScreen() {
  const [config, setConfig] = useState<JetroOnlineConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Campos
  const [tituloAssistente, setTituloAssistente] = useState('')
  const [saudacaoPrincipal, setSaudacaoPrincipal] = useState('')
  const [textoAuxiliar, setTextoAuxiliar] = useState('')
  const [placeholderInput, setPlaceholderInput] = useState('')
  const [mensagemBoasVindas, setMensagemBoasVindas] = useState('')
  const [mensagemIndisponibilidade, setMensagemIndisponibilidade] = useState('')

  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const cfg = await getJetroOnlineConfig()
      if (cfg) {
        setConfig(cfg)
        setTituloAssistente(cfg.titulo_assistente || 'Jetro On-line')
        setSaudacaoPrincipal(cfg.saudacao_principal || 'Como posso ajudar?')
        setTextoAuxiliar(
          cfg.texto_auxiliar ||
            'Faça uma pergunta, peça uma análise ou explore as informações disponíveis.',
        )
        setPlaceholderInput(cfg.placeholder_input || 'Digite sua mensagem...')
        setMensagemBoasVindas(cfg.mensagem_boas_vindas || '')
        setMensagemIndisponibilidade(cfg.mensagem_indisponibilidade || '')
      }
    } catch {
      toast({ title: 'Erro ao carregar configurações', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!config?.id) return

    setSaving(true)
    try {
      await updateJetroOnlineConfig(config.id, {
        titulo_assistente: tituloAssistente.trim(),
        saudacao_principal: saudacaoPrincipal.trim(),
        texto_auxiliar: textoAuxiliar.trim(),
        placeholder_input: placeholderInput.trim(),
        mensagem_boas_vindas: mensagemBoasVindas.trim(),
        mensagem_indisponibilidade: mensagemIndisponibilidade.trim(),
      })
      toast({
        title: 'Configurações salvas com sucesso',
        description:
          'Os parâmetros visuais e textuais do Jetro On-line foram atualizados no banco de dados.',
      })
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar configurações',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-400 text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2 text-[#005B2E]" />
        Carregando parâmetros...
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="border shadow-2xs">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#005B2E]" />
            Identidade e Apresentação do Chat
          </CardTitle>
          <CardDescription className="text-xs">
            Parâmetros que definem a exibição visual e a abordagem inicial do assistente.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Título do Assistente</Label>
              <Input
                value={tituloAssistente}
                onChange={(e) => setTituloAssistente(e.target.value)}
                placeholder="Jetro On-line"
                className="h-9 text-xs"
                required
              />
              <p className="text-[11px] text-gray-400">Exibido no cabeçalho superior do painel.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Placeholder da Caixa de Mensagens
              </Label>
              <Input
                value={placeholderInput}
                onChange={(e) => setPlaceholderInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="h-9 text-xs"
                required
              />
              <p className="text-[11px] text-gray-400">
                Texto de instrução dentro do campo inferior de digitação.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              Saudação Central Animada (Máquina de Escrever)
            </Label>
            <Input
              value={saudacaoPrincipal}
              onChange={(e) => setSaudacaoPrincipal(e.target.value)}
              placeholder="Como posso ajudar?"
              className="h-9 text-xs font-bold"
              required
            />
            <p className="text-[11px] text-gray-400">
              Texto em destaque central no início da interação, digitado dinamicamente com cursor de
              digitação (|).
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Texto Auxiliar de Orientação
            </Label>
            <Textarea
              rows={2}
              value={textoAuxiliar}
              onChange={(e) => setTextoAuxiliar(e.target.value)}
              placeholder="Faça uma pergunta, peça uma análise ou explore as informações disponíveis."
              className="text-xs leading-relaxed"
              required
            />
            <p className="text-[11px] text-gray-400">
              Texto discreto abaixo da saudação que estimula a interação do usuário.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-2xs">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            Mensagens Padrão do Sistema
          </CardTitle>
          <CardDescription className="text-xs">
            Comunicações de boas-vindas e tratamento de eventuais falhas de conectividade.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">Mensagem de Boas-Vindas</Label>
            <Textarea
              rows={2}
              value={mensagemBoasVindas}
              onChange={(e) => setMensagemBoasVindas(e.target.value)}
              placeholder="Olá! Sou o Jetro On-line..."
              className="text-xs leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-700">
              Mensagem de Indisponibilidade Temporária
            </Label>
            <Textarea
              rows={2}
              value={mensagemIndisponibilidade}
              onChange={(e) => setMensagemIndisponibilidade(e.target.value)}
              placeholder="O assistente Jetro On-line está temporariamente indisponível..."
              className="text-xs leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className="bg-[#005B2E] hover:bg-[#004724] text-white text-xs font-semibold h-9 px-6"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {saving ? 'Gravando...' : 'Salvar Configurações Gerais'}
        </Button>
      </div>
    </form>
  )
}
