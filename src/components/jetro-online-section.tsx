import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Bot,
  MessageSquare,
  BarChart3,
  Clock,
  Layers,
  GraduationCap,
  ShieldCheck,
  Send,
  Loader2,
  Video,
  Compass,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JETRO_ONLINE_AVATAR_URL } from '@/lib/jetro-online-assets'
import { cn } from '@/lib/utils'

interface DemoDialogue {
  id: string
  userQuestion: string
  assistantAnswer: string
  category: string
}

const DEMO_DIALOGUES: DemoDialogue[] = [
  {
    id: 'produtos-mais-vendidos',
    userQuestion: 'Quais foram os produtos mais vendidos neste mês?',
    assistantAnswer:
      'Posso consultar os produtos mais vendidos no período e organizar os resultados por quantidade ou faturamento, conforme os dados disponíveis e suas permissões.',
    category: 'Vendas & Faturamento',
  },
  {
    id: 'clientes-inativos',
    userQuestion: 'Quais clientes estão há mais de 30 dias sem comprar?',
    assistantAnswer:
      'Posso identificar os clientes sem compras nesse período e apresentar uma relação para acompanhamento comercial.',
    category: 'Gestão Comercial',
  },
  {
    id: 'contas-a-receber',
    userQuestion: 'Como está a evolução das contas a receber?',
    assistantAnswer:
      'Posso analisar os valores registrados, organizar os resultados por período e apresentar indicadores para facilitar sua avaliação.',
    category: 'Financeiro',
  },
  {
    id: 'cadastrar-cliente',
    userQuestion: 'Como faço para cadastrar um cliente?',
    assistantAnswer:
      'Posso orientar você no processo e indicar um vídeo da Universidade Jetro ou iniciar um tour guiado da tela, quando disponível.',
    category: 'Aprendizado & Operação',
  },
]

const BENEFIT_CARDS = [
  {
    id: '01',
    title: '01. Converse com seus dados',
    description:
      'Faça perguntas sobre informações disponíveis no ERP e obtenha respostas sem precisar procurar manualmente em diversas telas.',
    icon: MessageSquare,
  },
  {
    id: '02',
    title: '02. Análises que ajudam a decidir',
    description:
      'Consulte indicadores, acompanhe resultados e solicite análises de informações comerciais, financeiras e operacionais.',
    icon: BarChart3,
  },
  {
    id: '03',
    title: '03. Menos tempo procurando, mais tempo produzindo',
    description:
      'Encontre informações relevantes com mais agilidade e simplifique tarefas de consulta e acompanhamento.',
    icon: Clock,
  },
  {
    id: '04',
    title: '04. Inteligência integrada à operação',
    description:
      'O Jetro On-line foi projetado para trabalhar com os módulos e informações do próprio sistema, conforme as integrações disponíveis.',
    icon: Layers,
  },
  {
    id: '05',
    title: '05. Aprendizado dentro do ERP',
    description:
      'Por meio da Universidade Jetro, o assistente poderá recomendar vídeos de treinamento e tours interativos para ajudar os usuários a utilizar as funcionalidades do sistema.',
    icon: GraduationCap,
  },
  {
    id: '06',
    title: '06. Informações com controle de acesso',
    description:
      'O assistente deverá respeitar as permissões de cada usuário, apresentando somente as informações às quais ele possui acesso.',
    icon: ShieldCheck,
  },
]

export function JetroOnlineSection() {
  const [selectedDialogueId, setSelectedDialogueId] = useState<string>(DEMO_DIALOGUES[0].id)
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [displayedAnswer, setDisplayedAnswer] = useState<string>('')

  const activeDialogue =
    DEMO_DIALOGUES.find((d) => d.id === selectedDialogueId) || DEMO_DIALOGUES[0]

  // Efeito suave de simulação de digitação ao selecionar nova pergunta na demo interativa
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let charIdx = 0
    setIsTyping(true)
    setDisplayedAnswer('')

    const fullText = activeDialogue.assistantAnswer
    const interval = setInterval(() => {
      charIdx += 2
      if (charIdx <= fullText.length) {
        setDisplayedAnswer(fullText.slice(0, charIdx))
      } else {
        setDisplayedAnswer(fullText)
        setIsTyping(false)
        clearInterval(interval)
      }
    }, 18)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [selectedDialogueId, activeDialogue.assistantAnswer])

  const handleSelectQuestion = (id: string) => {
    if (id === selectedDialogueId && !isTyping) return
    setSelectedDialogueId(id)
  }

  const handleScrollToSection = (targetId: string) => {
    const el = document.getElementById(targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      id="jetro-online"
      className="relative bg-gradient-to-b from-[#002413] via-[#00381C] to-[#001D0F] text-white py-16 sm:py-24 lg:py-28 overflow-hidden border-y border-[#C9A227]/30"
    >
      {/* Elementos sutis de fundo tecnológico / iluminação ambiente */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#005B2E]/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#C9A227]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#005B2E]/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10 space-y-16 sm:space-y-24">
        {/* ============================================================== */}
        {/* 1. BLOCO DE INTRODUÇÃO COM IMAGEM EM DESTAQUE EXPRESSIVO      */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Lado Esquerdo: Imagem Oficial em Destaque Expressivo */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-[340px] sm:max-w-[400px]">
              {/* Efeito de halo dourado elegante */}
              <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-[#005B2E] via-[#C9A227] to-[#FFE28A] opacity-60 blur-xl group-hover:opacity-85 transition-opacity duration-500 animate-pulse" />

              {/* Moldura circular com borda dourada sofisticada */}
              <div className="relative aspect-square w-full rounded-full p-2 bg-gradient-to-tr from-[#C9A227] via-[#FFE28A] to-[#8E6E17] shadow-2xl">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#002613] relative border-2 border-[#00381C]">
                  <img
                    src={JETRO_ONLINE_AVATAR_URL}
                    alt="Assistente Jetro On-line"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Badge sutil com indicador verde pulsante */}
                  <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 bg-[#002817]/90 backdrop-blur-md border border-[#C9A227]/80 px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                    </span>
                    <span className="text-[11px] font-bold tracking-wider text-white uppercase">
                      Jetro On-line Ativo
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: Textos do Usuário */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#005B2E]/60 border border-[#C9A227]/60 text-[#FFE28A] text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-[#C9A227]" />
              <span>A inteligência que transforma dados em respostas.</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Seu ERP agora conversa com você.
            </h2>

            <div className="space-y-4 text-slate-200 text-base sm:text-lg leading-relaxed font-normal">
              <p>
                Imagine ter um assistente inteligente disponível para ajudar a compreender
                informações, consultar dados, analisar resultados e encontrar respostas sem precisar
                navegar por diversas telas e relatórios.
              </p>
              <p>
                Com o Jetro On-line, você pode fazer perguntas em linguagem natural e receber
                informações organizadas para apoiar suas atividades e decisões.
              </p>
              <p className="font-semibold text-white pt-1 border-l-2 border-[#C9A227] pl-3.5">
                Mais do que um chat, o Jetro On-line foi concebido para ser um assistente
                inteligente integrado à gestão empresarial.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. 6 CARDS DE BENEFÍCIOS (ELEGANTES, ÍCONES DISCRETOS, OBJETIVOS) */}
        {/* ============================================================== */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FFE28A]">
              Benefícios Estratégicos
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Gestão ágil com inteligência integrada a cada etapa da sua empresa
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {BENEFIT_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.id}
                  className="group relative rounded-2xl p-6 sm:p-7 bg-[#002B17]/70 hover:bg-[#00381E] border border-[#C9A227]/30 hover:border-[#C9A227] transition-all duration-300 shadow-xl space-y-3 backdrop-blur-xs hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-[#001D0F] border border-[#C9A227]/50 text-[#FFE28A] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-[#C9A227]" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#C9A227]/70 group-hover:text-[#FFE28A]">
                      {card.id}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FFE28A] transition-colors leading-snug">
                    {card.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. ÁREA DE EXEMPLOS E EXPERIÊNCIA INTERATIVA                  */}
        {/* ============================================================== */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#005B2E]/60 text-emerald-200 text-xs font-semibold border border-emerald-500/40">
              <Bot className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Experiência Interativa Demonstrativa</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Você pergunta. O Jetro ajuda a encontrar a resposta.
            </h3>
            <p className="text-sm sm:text-base text-slate-300">
              Clique nas perguntas sugeridas abaixo para experimentar como o Jetro On-line responde
              em cenários ilustrativos no cotidiano empresarial.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
            {/* Lado Esquerdo: Perguntas Sugeridas Clicáveis */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFE28A] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Perguntas Sugeridas (Clique para testar):
                </span>
              </div>

              <div className="space-y-2.5">
                {DEMO_DIALOGUES.map((dialogue) => {
                  const isSelected = dialogue.id === selectedDialogueId
                  return (
                    <button
                      key={dialogue.id}
                      type="button"
                      onClick={() => handleSelectQuestion(dialogue.id)}
                      className={cn(
                        'w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-md group relative overflow-hidden',
                        isSelected
                          ? 'bg-[#004724] border-[#C9A227] ring-1 ring-[#C9A227]'
                          : 'bg-[#002816]/80 hover:bg-[#00341D] border-emerald-900/60 hover:border-[#C9A227]/50 text-slate-200',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/30 text-emerald-200 border border-white/10">
                          {dialogue.category}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-[#FFE28A] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FFE28A] animate-ping" />
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-white group-hover:text-[#FFE28A] transition-colors leading-snug">
                        "{dialogue.userQuestion}"
                      </p>
                    </button>
                  )
                })}
              </div>

              <div className="p-3 rounded-lg bg-black/40 border border-white/10 text-[11px] text-slate-300 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#C9A227] shrink-0" />
                <span>
                  Ambiente demonstrativo com cenários ilustrativos. Nenhum dado operacional restrito
                  é exposto no site público.
                </span>
              </div>
            </div>

            {/* Lado Direito: Chat Interativo Demonstrativo */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border-2 border-[#C9A227]/70 bg-[#001F12] shadow-2xl overflow-hidden flex flex-col h-[460px]">
                {/* Cabeçalho do Chat Demonstrativo */}
                <div className="bg-gradient-to-r from-[#002B17] via-[#003B20] to-[#002B17] px-4 py-3 border-b border-[#C9A227]/40 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-[#C9A227] shrink-0 shadow-md bg-[#001A0E]">
                      <img
                        src={JETRO_ONLINE_AVATAR_URL}
                        alt="Jetro On-line"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-white">Jetro On-line</h4>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#C9A227]/25 text-[#FFE28A] font-bold border border-[#C9A227]/40 uppercase tracking-wider">
                          Demo
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                        </span>
                        <span className="text-[11px] text-emerald-200 font-medium">
                          Disponível · Pronto para responder
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#FFE28A]/80 hidden sm:inline-block bg-black/30 px-2 py-1 rounded border border-white/10">
                    Cenário Ilustrativo
                  </span>
                </div>

                {/* Área de Conversa do Chat */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-gradient-to-b from-[#001A0E] to-[#00140B] text-xs sm:text-sm">
                  {/* Pergunta do Usuário */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-[#005B2E] text-white p-3.5 shadow-md border border-emerald-400/30">
                      <span className="block text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-1">
                        Você perguntou:
                      </span>
                      <p className="font-medium leading-relaxed">{activeDialogue.userQuestion}</p>
                    </div>
                  </div>

                  {/* Resposta do Assistente */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[#C9A227] shrink-0 shadow-md bg-[#001D0F] mt-1">
                      <img
                        src={JETRO_ONLINE_AVATAR_URL}
                        alt="Jetro On-line"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-xs bg-[#002D19] border border-[#C9A227]/50 text-slate-100 p-4 shadow-lg space-y-2">
                      <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                        <span className="text-[11px] font-bold text-[#FFE28A] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                          Jetro On-line
                        </span>
                        <span className="text-[10px] text-emerald-300/80">
                          Resposta inteligente
                        </span>
                      </div>

                      <p className="leading-relaxed text-slate-100">
                        {displayedAnswer}
                        {isTyping && (
                          <span className="inline-block w-1.5 h-4 ml-1 bg-[#C9A227] animate-pulse align-middle" />
                        )}
                      </p>

                      {!isTyping && (
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 text-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-[#C9A227]" />
                            Exemplo ilustrativo auditado
                          </span>
                          <span>Segurança e permissões respeitadas</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Caixa Inferior Simulada */}
                <div className="p-3 bg-[#002414] border-t border-emerald-900/60 flex items-center gap-2">
                  <div className="flex-1 bg-[#00190D] border border-emerald-900 rounded-xl px-3 py-2 text-xs text-slate-400 flex items-center justify-between">
                    <span className="truncate">
                      Clique em outra pergunta sugerida ao lado para testar...
                    </span>
                    {isTyping && <Loader2 className="w-3.5 h-3.5 text-[#C9A227] animate-spin" />}
                  </div>
                  <Button
                    size="sm"
                    disabled
                    className="h-9 px-3 bg-[#005B2E] text-white opacity-60 cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. BLOCO DE APRENDIZADO — UNIVERSIDADE JETRO                  */}
        {/* ============================================================== */}
        <div className="rounded-3xl p-8 sm:p-10 lg:p-12 bg-gradient-to-r from-[#002816] via-[#00381E] to-[#002816] border border-[#C9A227]/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A227]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005B2E]/60 border border-[#C9A227]/50 text-[#FFE28A] text-xs font-bold uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-[#C9A227]" />
                <span>Capacitação Integrada</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                Jetro On-line também ensina você a utilizar o sistema.
              </h3>

              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                Mais do que tirar dúvidas sobre números, o assistente inteligente apoia o
                desenvolvimento contínuo da sua equipe, orientando colaboradores em tempo real e
                reduzindo a curva de aprendizado do ERP com total autonomia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-black/30 border border-white/10">
                  <Video className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-white">Vídeos de Treinamento</h5>
                    <p className="text-[11px] text-slate-300">
                      Recomendações pontuais da Universidade Jetro para a tela em que você está.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-black/30 border border-white/10">
                  <Compass className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-white">Tours Guiados Interativos</h5>
                    <p className="text-[11px] text-slate-300">
                      Passo a passo visual na interface para aprender fazendo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-black/30 border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-white">Orientações Passo a Passo</h5>
                    <p className="text-[11px] text-slate-300">
                      Instruções claras para operações, cadastros e lançamentos complexos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-black/30 border border-white/10">
                  <HelpCircle className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs text-white">
                      Respostas a Dúvidas sobre Telas
                    </h5>
                    <p className="text-[11px] text-slate-300">
                      Esclarecimento contextualizado para destravar tarefas do dia a dia.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="p-6 rounded-2xl bg-[#001D0F]/90 border-2 border-[#C9A227]/50 shadow-xl space-y-4 max-w-sm text-center">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-[#005B2E] to-[#002613] border-2 border-[#C9A227] flex items-center justify-center text-[#FFE28A] shadow-lg">
                  <GraduationCap className="w-8 h-8 text-[#C9A227]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Universidade Jetro</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Conteúdos organizados por módulo para capacitar sua equipe com velocidade e
                    padronização operacional.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => handleScrollToSection('solucoes')}
                    variant="outline"
                    className="w-full border-[#C9A227] text-[#FFE28A] hover:bg-[#C9A227]/20 font-bold text-xs cursor-pointer"
                  >
                    <span>Conhecer Estrutura de Treinamento</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5. FECHAMENTO — CITAÇÃO E BOTÃO "CONHECER O JETRO"             */}
        {/* ============================================================== */}
        <div className="text-center max-w-3xl mx-auto space-y-6 pt-4">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FFE28A]">
            Evolução Contínua
          </span>

          <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Uma nova maneira de trabalhar com informações.
          </h3>

          <blockquote className="text-base sm:text-xl text-slate-200 italic leading-relaxed border-y border-[#C9A227]/40 py-6 px-4">
            "O Jetro On-line aproxima as pessoas dos dados e transforma consultas complexas em
            conversas simples, tornando a gestão mais acessível, inteligente e produtiva."
          </blockquote>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => handleScrollToSection('solucoes')}
              size="lg"
              className="w-full sm:w-auto bg-[#C9A227] hover:bg-[#b58f1f] text-[#002816] font-black text-base px-8 py-6 rounded-xl shadow-xl transition-all cursor-pointer group"
            >
              <span>Conhecer o Jetro</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              onClick={() => handleScrollToSection('orcamento')}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-[#C9A227]/70 text-white hover:bg-white/10 font-bold text-base px-8 py-6 rounded-xl cursor-pointer"
            >
              Solicitar Demonstração Comercial
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
