import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  getJetroOnlineConfig,
  updateJetroOnlineConfig,
  type JetroOnlineConfig,
} from '@/services/jetro-online'
import {
  Sliders,
  Save,
  Play,
  MousePointer2,
  Paperclip,
  Mic,
  GraduationCap,
  ShieldAlert,
} from 'lucide-react'

export function JetroOnlineRecursosScreen() {
  const [config, setConfig] = useState<JetroOnlineConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Estados dos recursos
  const [botaoVideoAtivo, setBotaoVideoAtivo] = useState(true)
  const [botaoTourAtivo, setBotaoTourAtivo] = useState(true)
  const [permitirAnexos, setPermitirAnexos] = useState(false)
  const [permitirVoz, setPermitirVoz] = useState(false)
  const [recomendarAuto, setRecomendarAuto] = useState(true)
  const [maxRecomendacoes, setMaxRecomendacoes] = useState(2)

  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const cfg = await getJetroOnlineConfig()
      if (cfg) {
        setConfig(cfg)
        setBotaoVideoAtivo(cfg.botao_video_ativo)
        setBotaoTourAtivo(cfg.botao_tour_ativo)
        setPermitirAnexos(cfg.permitir_anexos)
        setPermitirVoz(cfg.permitir_voz)
        setRecomendarAuto(cfg.recomendar_universidade_auto)
        setMaxRecomendacoes(cfg.max_recomendacoes_video || 2)
      }
    } catch {
      toast({ title: 'Erro ao carregar recursos', variant: 'destructive' })
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
        botao_video_ativo: botaoVideoAtivo,
        botao_tour_ativo: botaoTourAtivo,
        permitir_anexos: permitirAnexos,
        permitir_voz: permitirVoz,
        recomendar_universidade_auto: recomendarAuto,
        max_recomendacoes_video: Number(maxRecomendacoes) || 2,
      })
      toast({
        title: 'Recursos atualizados com sucesso',
        description:
          'As políticas e controles do chat HURAM On-line foram gravados no banco de dados.',
      })
      await loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar recursos', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card className="border shadow-2xs">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#005B2E]" />
            Disponibilidade de Recursos na Interface
          </CardTitle>
          <CardDescription className="text-xs">
            Habilite ou restrinja botões funcionais conforme políticas operacionais e de segurança
            da empresa.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-4 divide-y">
          {/* Botão Vídeo */}
          <div className="flex items-center justify-between pt-3">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-[#E85D4E] fill-[#E85D4E]" />
                Botão "Vídeo" na Barra Superior (Ajudas Disponíveis)
              </Label>
              <p className="text-[11px] text-gray-500">
                Apresenta a biblioteca de vídeos de treinamento da Universidade HURAM filtrados pela
                tela atual.
              </p>
            </div>
            <Switch checked={botaoVideoAtivo} onCheckedChange={setBotaoVideoAtivo} />
          </div>

          {/* Botão Tour */}
          <div className="flex items-center justify-between pt-3">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <MousePointer2 className="w-3.5 h-3.5 text-gray-800 fill-gray-800" />
                Botão "Tour" na Barra Superior (Ajudas Disponíveis)
              </Label>
              <p className="text-[11px] text-gray-500">
                Inicia passo a passo interativo na tela quando houver roteiro configurado para a
                rota atual.
              </p>
            </div>
            <Switch checked={botaoTourAtivo} onCheckedChange={setBotaoTourAtivo} />
          </div>

          {/* Upload de Anexos */}
          <div className="flex items-center justify-between pt-3">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-gray-600" />
                Upload de Anexos (Clipe)
              </Label>
              <p className="text-[11px] text-gray-500">
                Permite ao usuário anexar planilhas e documentos diretamente na caixa de mensagens
                do assistente.
              </p>
            </div>
            <Switch checked={permitirAnexos} onCheckedChange={setPermitirAnexos} />
          </div>

          {/* Entrada por Voz */}
          <div className="flex items-center justify-between pt-3">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-gray-600" />
                Comando por Voz (Microfone)
              </Label>
              <p className="text-[11px] text-gray-500">
                Disponibiliza transcrição de voz para texto na entrada de dados (mantido desativado
                por padrão).
              </p>
            </div>
            <Switch checked={permitirVoz} onCheckedChange={setPermitirVoz} />
          </div>
        </CardContent>
      </Card>

      {/* Regras da Universidade HURAM com a IA */}
      <Card className="border-gray-200">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#005B2E]" />
            Regras de Recomendação da Universidade HURAM pela IA
          </CardTitle>{' '}
          <CardDescription className="text-xs">
            Parâmetros de integridade: a IA nunca inventa vídeos e recomenda apenas registros ativos
            cadastrados.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-bold text-gray-800">
                Recomendação Automática de Vídeos por Dúvida
              </Label>
              <p className="text-[11px] text-gray-500">
                Quando um usuário perguntar como realizar um procedimento, a IA anexa o vídeo de
                treinamento correspondente.
              </p>
            </div>
            <Switch checked={recomendarAuto} onCheckedChange={setRecomendarAuto} />
          </div>

          <div className="space-y-1.5 pt-2">
            <Label className="text-xs font-semibold text-gray-700">
              Máximo de Vídeos Recomendados por Resposta
            </Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={maxRecomendacoes}
              onChange={(e) => setMaxRecomendacoes(Number(e.target.value))}
              className="h-9 text-xs w-32"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Garantia de Segurança & Confiabilidade:</strong> Estas configurações não
              ampliam nem removem permissões sobre as tabelas e dados reais do ERP. Vídeos de
              módulos restritos permanecem ocultos para usuários sem permissão específica.
            </p>
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
          {saving ? 'Gravando...' : 'Salvar Recursos e Políticas'}
        </Button>
      </div>
    </form>
  )
}
