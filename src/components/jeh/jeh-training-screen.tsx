import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { JehPageHeader } from './jeh-header'
import {
  JehAssistantService,
  type JehKnowledgeItem,
  type JehQAItem,
} from '@/services/jeh-assistant'
import {
  Cpu,
  RefreshCw,
  PlusCircle,
  Database,
  FileCheck2,
  Trash2,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react'

export function JehTrainingScreen() {
  const [knowledgeList, setKnowledgeList] = useState<JehKnowledgeItem[]>([])
  const [qaList, setQaList] = useState<JehQAItem[]>([])
  const [loading, setLoading] = useState(true)
  const [reindexing, setReindexing] = useState(false)
  const [lastReindexResult, setLastReindexResult] = useState<{
    count: number
    date: string
  } | null>(null)

  // Quick QA training form
  const [quickQuestion, setQuickQuestion] = useState('')
  const [quickAnswer, setQuickAnswer] = useState('')
  const [quickCategory, setQuickCategory] = useState('Geral')
  const [quickSaving, setQuickSaving] = useState(false)

  const { toast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [kb, qa] = await Promise.all([
        JehAssistantService.listKnowledge(),
        JehAssistantService.listQA(),
      ])
      setKnowledgeList(kb)
      setQaList(qa)
    } catch {
      toast({
        title: 'Erro ao carregar dados de treinamento',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleReindex = async () => {
    setReindexing(true)
    try {
      const res = await JehAssistantService.reindexKnowledgeBase()
      setLastReindexResult({
        count: res.processedCount,
        date: new Date(res.timestamp).toLocaleTimeString('pt-BR'),
      })
      toast({
        title: 'Base reprocessada e sincronizada',
        description: `${res.processedCount} registros ativos foram validados para o agente Jeh.`,
      })
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao reprocessar base',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setReindexing(false)
    }
  }

  const handleQuickAddQA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickQuestion.trim() || !quickAnswer.trim()) return

    setQuickSaving(true)
    try {
      await JehAssistantService.createQA({
        question: quickQuestion,
        official_answer: quickAnswer,
        variations: [],
        category: quickCategory || 'Geral',
        status: 'ativo',
      })
      toast({
        title: 'Nova resposta treinada com sucesso',
        description: 'O conhecimento foi incorporado diretamente ao repositório oficial da Jeh.',
      })
      setQuickQuestion('')
      setQuickAnswer('')
      await loadData()
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar resposta',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setQuickSaving(false)
    }
  }

  const handleDeactivateOutdated = async (id: string, type: 'kb' | 'qa') => {
    try {
      if (type === 'kb') {
        await JehAssistantService.updateKnowledge(id, { status: 'inativo' })
      } else {
        await JehAssistantService.updateQA(id, { status: 'inativo' })
      }
      toast({ title: 'Item desativado com sucesso' })
      await loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao desativar', description: err.message, variant: 'destructive' })
    }
  }

  // Estatísticas de prontidão do treinamento
  const activeKbCount = knowledgeList.filter((k) => k.status === 'aprovado').length
  const pendingKbCount = knowledgeList.filter(
    (k) => k.status === 'rascunho' || k.status === 'revisar',
  ).length
  const activeQaCount = qaList.filter((q) => q.status === 'ativo').length

  return (
    <div className="space-y-6">
      <JehPageHeader
        title="Treinamento e Indexação da Jeh"
        description="Reprocessamento da base vetorial/textual, treinamento ágil de respostas e higienização de conteúdos."
        action={
          <Button
            size="sm"
            onClick={handleReindex}
            disabled={reindexing || loading}
            className="h-8 text-xs bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${reindexing ? 'animate-spin' : ''}`} />
            {reindexing ? 'Reprocessando...' : 'Reprocessar Base do Agente'}
          </Button>
        }
      />

      {/* PAINEL DE STATUS DE INDEXAÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase">
              Base Ativa Indexada
            </CardTitle>
            <Database className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-black text-gray-900">{activeKbCount + activeQaCount}</div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {activeKbCount} documentos + {activeQaCount} perguntas oficiais
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase">
              Pendentes de Homologação
            </CardTitle>
            <FileCheck2 className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-2xl font-black text-amber-700">{pendingKbCount}</div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Rascunhos ou conteúdos aguardando revisão
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-xs">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-gray-500 uppercase">
              Última Sincronização
            </CardTitle>
            <Cpu className="w-4 h-4 text-[#C9A227]" />
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="text-lg font-bold text-gray-900">
              {lastReindexResult ? `Hoje às ${lastReindexResult.date}` : 'Pronta para sincronizar'}
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              {lastReindexResult
                ? `${lastReindexResult.count} itens validados`
                : 'Agente jeh-institucional ativo'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FORMULÁRIO DE TREINAMENTO RÁPIDO */}
        <Card className="shadow-xs border-2 border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-[#005B2E]" />
              Treinamento Rápido de Resposta
            </CardTitle>
            <CardDescription className="text-xs">
              Adicione diretamente uma nova pergunta e resposta oficial à inteligência da Jeh.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <form onSubmit={handleQuickAddQA} className="space-y-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Pergunta do Usuário / Dúvida Comum *
                </Label>
                <Input
                  required
                  placeholder="Ex: Como funciona o faturamento recorrente?"
                  value={quickQuestion}
                  onChange={(e) => setQuickQuestion(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Resposta Oficial de Ensino *</Label>
                <Textarea
                  required
                  rows={4}
                  placeholder="Insira a resposta exata que a assistente deve fixar..."
                  value={quickAnswer}
                  onChange={(e) => setQuickAnswer(e.target.value)}
                  className="text-xs leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Assunto / Categoria</Label>
                <Input
                  placeholder="Ex: Faturamento, Comercial, Geral"
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={quickSaving}
                className="w-full text-xs bg-[#005B2E] hover:bg-[#01361D] text-white h-8 font-semibold"
              >
                {quickSaving
                  ? 'Registrando Conhecimento...'
                  : 'Treinar Assistente com esta Resposta'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* HIGIENIZAÇÃO E CONTEÚDOS DESATUALIZADOS */}
        <Card className="shadow-xs">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Higienização de Conteúdos da Base
            </CardTitle>
            <CardDescription className="text-xs">
              Desative conteúdos obsoletos ou antigos para prevenir respostas incorretas da Jeh.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {knowledgeList.length === 0 && qaList.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Nenhum registro para higienização.
                </div>
              ) : (
                <>
                  {knowledgeList.slice(0, 4).map((kb) => (
                    <div
                      key={kb.id}
                      className="p-2.5 border rounded-lg bg-gray-50/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">{kb.title}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>Cat: {kb.category}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-[9px] py-0">
                            {kb.status}
                          </Badge>
                        </div>
                      </div>
                      {kb.status !== 'inativo' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateOutdated(kb.id, 'kb')}
                          className="h-7 text-[11px] text-red-600 border-red-200 hover:bg-red-50 shrink-0"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Desativar
                        </Button>
                      )}
                    </div>
                  ))}

                  {qaList.slice(0, 4).map((qa) => (
                    <div
                      key={qa.id}
                      className="p-2.5 border rounded-lg bg-gray-50/70 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">Q: {qa.question}</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <HelpCircle className="w-3 h-3 text-blue-500 shrink-0" />
                          <span className="truncate">{qa.official_answer}</span>
                        </div>
                      </div>
                      {qa.status !== 'inativo' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivateOutdated(qa.id, 'qa')}
                          className="h-7 text-[11px] text-red-600 border-red-200 hover:bg-red-50 shrink-0"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Desativar
                        </Button>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
