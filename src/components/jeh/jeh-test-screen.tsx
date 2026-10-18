import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { JehPageHeader } from './jeh-header'
import { JehAssistantService, type JehEvaluationRating } from '@/services/jeh-assistant'
import {
  Bot,
  User,
  Send,
  ThumbsUp,
  AlertCircle,
  ThumbsDown,
  Edit3,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react'

interface TestChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  evaluationSubmitted?: JehEvaluationRating
  sources?: any[]
}

export function JehTestScreen() {
  const [messages, setMessages] = useState<TestChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Eu sou a Assistente Institucional Jeh em ambiente de teste e homologação. Como posso ajudar com informações sobre a plataforma e regras institucionais?',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [sending, setSending] = useState(false)

  // Dialog de correção de resposta
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false)
  const [selectedMessageForCorrection, setSelectedMessageForCorrection] = useState<{
    question: string
    assistantReply: string
  } | null>(null)
  const [correctedAnswer, setCorrectedAnswer] = useState('')
  const [correctionCategory, setCorrectionCategory] = useState('Geral')
  const [savingCorrection, setSavingCorrection] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, sending])

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputMessage.trim() || sending) return

    const questionText = inputMessage.trim()
    const userMsg: TestChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: questionText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInputMessage('')
    setSending(true)

    try {
      // Passar histórico das últimas mensagens trocadas
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await JehAssistantService.sendTestMessage(questionText, historyPayload)
      const assistantMsg: TestChatMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: any) {
      toast({
        title: 'Falha no teste',
        description: err.message || 'Erro ao chamar o endpoint de teste da Jeh.',
        variant: 'destructive',
      })
      const errorMsg: TestChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao consultar o agente de teste institucional.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setSending(false)
    }
  }

  // Avaliação de resposta (correta / parcial / incorreta)
  const handleEvaluate = async (
    msgIndex: number,
    rating: JehEvaluationRating,
    msg: TestChatMessage,
  ) => {
    // Procura a última pergunta do usuário que antecedeu essa resposta
    let userQuestion = ''
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userQuestion = messages[i].content
        break
      }
    }

    try {
      await JehAssistantService.submitEvaluation({
        question: userQuestion || 'Pergunta não identificada',
        assistant_reply: msg.content,
        evaluation: rating,
      })

      setMessages((prev) =>
        prev.map((m, idx) => (idx === msgIndex ? { ...m, evaluationSubmitted: rating } : m)),
      )

      toast({
        title: 'Avaliação registrada',
        description: `Resposta marcada como "${rating}". Obrigado pelo feedback de treinamento!`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao registrar avaliação',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  // Abrir diálogo para sugerir/criar resposta correta
  const handleOpenCorrection = (msgIndex: number, msg: TestChatMessage) => {
    let userQuestion = ''
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userQuestion = messages[i].content
        break
      }
    }

    setSelectedMessageForCorrection({
      question: userQuestion || 'Pergunta do usuário',
      assistantReply: msg.content,
    })
    setCorrectedAnswer(msg.content)
    setCorrectionCategory('Geral')
    setCorrectionDialogOpen(true)
  }

  // Salvar resposta corrigida encaminhada para aprovação (como rascunho sem alterar base oficial automaticamente)
  const handleSaveCorrection = async () => {
    if (!selectedMessageForCorrection || !correctedAnswer.trim()) return

    setSavingCorrection(true)
    try {
      // 1. Cadastra na coleção de perguntas e respostas como RASCUNHO (para posterior aprovação)
      await JehAssistantService.createQA({
        question: selectedMessageForCorrection.question,
        official_answer: correctedAnswer.trim(),
        variations: [],
        category: correctionCategory,
        status: 'rascunho',
      })

      // 2. Registra a avaliação do teste com a sugestão
      await JehAssistantService.submitEvaluation({
        question: selectedMessageForCorrection.question,
        assistant_reply: selectedMessageForCorrection.assistantReply,
        evaluation: 'incorreta',
        suggested_answer: correctedAnswer.trim(),
        notes: 'Correção enviada via ambiente de teste para aprovação do supervisor.',
      })

      toast({
        title: 'Correção encaminhada com sucesso',
        description:
          'A resposta sugerida foi cadastrada como rascunho para aprovação do supervisor.',
      })
      setCorrectionDialogOpen(false)
    } catch (err: any) {
      toast({
        title: 'Erro ao encaminhar correção',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setSavingCorrection(false)
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          'Histórico reiniciado. Faça novas perguntas institucionais para validar a base de conhecimento.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  return (
    <div className="space-y-4">
      <JehPageHeader
        title="Testar Assistente Jeh"
        description="Ambiente de homologação isolado. Funciona mesmo com a assistente inativa para o público externo."
        action={
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-emerald-300 text-emerald-800 bg-emerald-50 text-xs py-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Ambiente de Teste Autenticado
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="h-8 text-xs text-gray-600 hover:text-gray-900"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reiniciar Conversa
            </Button>
          </div>
        }
      />

      {/* PAINEL DE CHAT DE TESTE */}
      <Card className="border shadow-sm flex flex-col h-[650px] overflow-hidden">
        <CardHeader className="p-3.5 px-4 border-b bg-gray-50/70 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#005B2E] text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span>Jeh (Modo Homologação)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-gray-500">
                Endpoint interno{' '}
                <code className="font-mono text-gray-700">/backend/v1/jeh/test-chat</code>
              </p>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Validação de Alucinações & Precisão</span>
          </div>
        </CardHeader>

        {/* LISTA DE MENSAGENS COM ROLAGEM */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
          {messages.map((msg, index) => {
            const isAssistant = msg.role === 'assistant'
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  isAssistant ? 'self-start' : 'ml-auto flex-row-reverse'
                }`}
              >
                {/* AVATAR */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                    isAssistant ? 'bg-[#005B2E]' : 'bg-gray-800'
                  }`}
                >
                  {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* CORPO DA MENSAGEM */}
                <div className="space-y-1.5">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isAssistant
                        ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                        : 'bg-[#005B2E] text-white rounded-tr-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <div
                      className={`text-[10px] mt-1.5 text-right ${
                        isAssistant ? 'text-gray-400' : 'text-emerald-100'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {/* BARRA DE AVALIAÇÃO E CORREÇÃO PARA RESPOSTAS DO ASSISTENTE */}
                  {isAssistant && msg.id !== 'welcome' && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[10px] font-semibold text-gray-500 mr-1">Avaliar:</span>

                      {/* Botão Correta */}
                      <Button
                        variant={msg.evaluationSubmitted === 'correta' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleEvaluate(index, 'correta', msg)}
                        disabled={!!msg.evaluationSubmitted}
                        className={`h-6 text-[10px] px-2 ${
                          msg.evaluationSubmitted === 'correta'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Correta
                      </Button>

                      {/* Botão Parcial */}
                      <Button
                        variant={msg.evaluationSubmitted === 'parcial' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleEvaluate(index, 'parcial', msg)}
                        disabled={!!msg.evaluationSubmitted}
                        className={`h-6 text-[10px] px-2 ${
                          msg.evaluationSubmitted === 'parcial'
                            ? 'bg-amber-600 text-white hover:bg-amber-700'
                            : 'text-amber-700 border-amber-200 hover:bg-amber-50'
                        }`}
                      >
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Parcial
                      </Button>

                      {/* Botão Incorreta */}
                      <Button
                        variant={msg.evaluationSubmitted === 'incorreta' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleEvaluate(index, 'incorreta', msg)}
                        disabled={!!msg.evaluationSubmitted}
                        className={`h-6 text-[10px] px-2 ${
                          msg.evaluationSubmitted === 'incorreta'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'text-red-700 border-red-200 hover:bg-red-50'
                        }`}
                      >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        Incorreta
                      </Button>

                      {/* Botão Corrigir Resposta */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenCorrection(index, msg)}
                        className="h-6 text-[10px] px-2 text-[#005B2E] hover:bg-[#005B2E]/10 font-semibold ml-1"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Corrigir Resposta
                      </Button>

                      {msg.evaluationSubmitted && (
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 border-emerald-300 text-emerald-800 bg-emerald-50"
                        >
                          <CheckCircle className="w-2.5 h-2.5 mr-1" />
                          Gravado
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {sending && (
            <div className="flex gap-3 max-w-[80%] self-start">
              <div className="w-7 h-7 rounded-full bg-[#005B2E] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white border border-gray-200 rounded-2xl rounded-tl-none text-xs text-gray-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#005B2E] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#005B2E] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#005B2E] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-gray-500 ml-1">
                  Jeh consultando base de conhecimento...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT DE ENVIO */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t bg-white flex items-center gap-2 shrink-0"
        >
          <Input
            placeholder="Digite uma pergunta de teste para a Jeh..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={sending}
            className="text-xs h-9"
          />
          <Button
            type="submit"
            disabled={sending || !inputMessage.trim()}
            className="h-9 px-4 text-xs bg-[#005B2E] hover:bg-[#01361D] text-white shrink-0 font-semibold"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Enviar
          </Button>
        </form>
      </Card>

      {/* DIÁLOGO CORRIGIR RESPOSTA (SEM ALTERAR BASE OFICIAL AUTOMATICAMENTE) */}
      <Dialog open={correctionDialogOpen} onOpenChange={setCorrectionDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#005B2E]" />
              Corrigir Resposta da Assistente
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              A resposta correta será cadastrada como rascunho e encaminhada para aprovação do
              supervisor, sem alterar a base de produção imediatamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-2">
            <div className="p-3 bg-gray-50 rounded-lg border text-xs space-y-1">
              <span className="font-semibold text-gray-500 uppercase text-[10px]">
                Pergunta do Usuário
              </span>
              <p className="font-bold text-gray-900">{selectedMessageForCorrection?.question}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Resposta Oficial Correta *</Label>
              <Textarea
                rows={5}
                required
                placeholder="Insira a resposta correta e precisa que a Jeh deveria ter fornecido..."
                value={correctedAnswer}
                onChange={(e) => setCorrectedAnswer(e.target.value)}
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Assunto / Categoria</Label>
              <Input
                placeholder="Ex: Comercial, Institucional, Suporte"
                value={correctionCategory}
                onChange={(e) => setCorrectionCategory(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-md text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Regra de Governança:</strong> Este envio não altera a resposta pública em
                tempo real. Ele gera um registro em status <em>Rascunho</em> na Central para revisão
                humana.
              </span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCorrectionDialogOpen(false)}
              disabled={savingCorrection}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSaveCorrection}
              disabled={savingCorrection || !correctedAnswer.trim()}
              className="text-xs bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {savingCorrection ? 'Encaminhando...' : 'Encaminhar para Aprovação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
