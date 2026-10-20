import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Bot,
  MessageSquare,
  BarChart3,
  Clock,
  GraduationCap,
  Compass,
  ShieldCheck,
  Send,
  Loader2,
  Video,
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

// 6 Cards EXATOS exigidos na especificação (item 6)
const JETRO_ONLINE_CARDS = [
  {
    id: '01',
    title: 'Consultas inteligentes',
    description: 'Perguntas sobre clientes, pedidos, produtos e outras informações autorizadas.',
    icon: MessageSquare,
  },
  {
    id: '02',
    title: 'Análise de resultados',
    description: 'Apoio na interpretação de indicadores comerciais, financeiros e operacionais.',
    icon: BarChart3,
  },
  {
    id: '03',
    title: 'Produtividade',
    description: 'Redução do tempo gasto procurando informações em diferentes telas.',
    icon: Clock,
  },
  {
    id: '04',
    title: 'Universidade Jetro',
    description: 'Recomendação de vídeos e treinamentos relacionados às dúvidas dos usuários.',
    icon: GraduationCap,
  },
  {
    id: '05',
    title: 'Tours guiados',
    description: 'Orientação interativa para aprender a utilizar as funcionalidades do ERP.',
    icon: Compass,
  },
  {
    id: '06',
    title: 'Segurança',
    description: 'Acesso às informações conforme as permissões individuais de cada usuário.',
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
      className="relative bg-[#F8FAF9] text-[#202B28] py-16 sm:py-20 lg:py-24 overflow-hidden border-b border-[#E4EAE6]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10 space-y-16 sm:space-y-20">
        {/* ============================================================== */}
        {/* 1. APRESENTAÇÃO DO JETRO ON-LINE                                */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Coluna Visual */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <div className="relative flex flex-col items-center text-center">
              <div className="relative">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full p-1 bg-white border-2 border-[#116B50] shadow-sm">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white relative">
                    <img
                      src={JETRO_ONLINE_AVATAR_URL}
                      alt="Assistente Jetro On-line"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>

              {/* Badge de Identificação */}
              <div className="mt-4 flex flex-col items-center gap-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E4EAE6]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#116B50] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#116B50]" />
                  </span>
                  <span className="text-[11px] font-semibold tracking-wider text-[#063D30] uppercase">
                    Jetro On-line Integrado
                  </span>
                </div>
                <span className="text-xs text-[#66736D] font-normal">
                  Assistente Inteligente Operacional do ERP
                </span>
              </div>
            </div>
          </div>

          {/* Coluna Textual */}
          <div className="lg:col-span-8 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1F4F2] border border-[#063D30]/15 text-[#063D30] text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#C69B45]" />
              <span>Ambiente Operacional do ERP & Decisão Diária</span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-heading text-[#063D30] tracking-tight">
                Jetro On-line
              </h2>
              <p className="text-lg sm:text-xl text-[#116B50] font-medium mt-1 font-heading">
                Seu ERP conversa com você. Seus dados ajudam a encontrar respostas.
              </p>
            </div>

            <div className="space-y-3 text-[#66736D] text-sm sm:text-base leading-relaxed font-normal">
              <p>
                O Jetro On-line é o assistente inteligente integrado ao ambiente operacional do ERP.
              </p>
              <p>
                Ele foi desenvolvido para ajudar os usuários a encontrar informações, interpretar
                indicadores, analisar resultados e compreender as funcionalidades do sistema por
                meio de conversas em linguagem natural.
              </p>
              <p className="font-medium text-[#202B28] border-l-2 border-[#116B50] pl-3">
                Em vez de navegar por diversas telas para localizar uma informação, o usuário pode
                fazer uma pergunta e receber uma resposta organizada, de acordo com os dados
                disponíveis e suas permissões de acesso.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => handleScrollToSection('solucoes')}
                className="bg-[#063D30] hover:bg-[#042820] text-white font-semibold text-sm px-6 py-5 rounded-xl shadow-xs transition-all cursor-pointer group"
              >
                <span>Conhecer os Módulos do ERP</span>
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform text-[#C69B45]" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleScrollToSection('orcamento')}
                className="border-[#063D30]/25 text-[#063D30] hover:bg-white font-semibold text-sm px-6 py-5 rounded-xl cursor-pointer"
              >
                Solicitar Demonstração Operacional
              </Button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. 6 CARDS EXATOS DO JETRO ON-LINE                            */}
        {/* ============================================================== */}
        <div className="space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C69B45]">
              Recursos Operacionais Integrados
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold font-heading text-[#063D30]">
              Inteligência aplicada ao dia a dia da gestão empresarial
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {JETRO_ONLINE_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.id}
                  className="rounded-2xl p-6 bg-white border border-[#E4EAE6] hover:border-[#116B50]/40 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between space-y-3 group text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6] text-[#063D30] flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4 text-[#116B50]" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#66736D]">
                      {card.id}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-semibold font-heading text-[#063D30] group-hover:text-[#116B50] transition-colors leading-snug">
                      {card.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed font-normal">
                      {card.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. DEMO INTERATIVA DO JETRO ON-LINE                           */}
        {/* ============================================================== */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F4F2] text-[#063D30] text-xs font-semibold border border-[#063D30]/15">
              <Bot className="w-3.5 h-3.5 text-[#116B50]" />
              <span>Experiência Interativa Demonstrativa</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-semibold font-heading text-[#063D30] tracking-tight">
              Você pergunta. O Jetro ajuda a encontrar a resposta.
            </h3>
            <p className="text-sm sm:text-base text-[#66736D] font-normal">
              Clique nas perguntas sugeridas abaixo para experimentar como o Jetro On-line responde
              em cenários ilustrativos no cotidiano empresarial.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto text-left">
            {/* Lado Esquerdo: Perguntas Sugeridas */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#063D30] flex items-center gap-1.5 font-heading">
                  <MessageSquare className="w-3.5 h-3.5 text-[#116B50]" />
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
                        'w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-2xs group relative overflow-hidden',
                        isSelected
                          ? 'bg-white border-[#116B50] ring-1 ring-[#116B50]'
                          : 'bg-white hover:bg-[#F8FAF9] border-[#E4EAE6] text-[#202B28]',
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F8FAF9] text-[#063D30] border border-[#E4EAE6]">
                          {dialogue.category}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-semibold text-[#116B50] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#116B50] animate-ping" />
                            Ativo
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs sm:text-sm font-semibold font-heading text-[#063D30] group-hover:text-[#116B50] transition-colors leading-snug">
                        "{dialogue.userQuestion}"
                      </p>
                    </button>
                  )
                })}
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#E4EAE6] text-[11px] text-[#66736D] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#C69B45] shrink-0" />
                <span>
                  Ambiente demonstrativo com cenários ilustrativos. Jetro On-line com dados reais é
                  restrito aos usuários autenticados no ERP com perfil autorizado.
                </span>
              </div>
            </div>

            {/* Lado Direito: Chat Demonstrativo */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#E4EAE6] bg-white shadow-md overflow-hidden flex flex-col h-[480px]">
                {/* Cabeçalho */}
                <div className="bg-[#F8FAF9] px-4 py-3 border-b border-[#E4EAE6] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="relative h-9 w-9 rounded-full overflow-hidden border border-[#E4EAE6] shrink-0 shadow-2xs bg-white">
                      <img
                        src={JETRO_ONLINE_AVATAR_URL}
                        alt="Jetro On-line"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold font-heading text-[#063D30]">
                          Jetro On-line
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#063D30] font-medium border border-emerald-200 uppercase tracking-wider">
                          Demo
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#116B50] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#116B50]" />
                        </span>
                        <span className="text-[11px] text-[#66736D] font-normal">
                          Disponível · Pronto para responder
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#66736D] hidden sm:inline-block bg-white px-2 py-1 rounded border border-[#E4EAE6]">
                    Cenário Ilustrativo
                  </span>
                </div>

                {/* Área de Conversa */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-white text-xs sm:text-sm">
                  {/* Pergunta do Usuário */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#063D30] text-white p-3.5 shadow-2xs">
                      <span className="block text-[10px] font-semibold text-slate-200 uppercase tracking-wider mb-1">
                        Você perguntou:
                      </span>
                      <p className="font-normal leading-relaxed">{activeDialogue.userQuestion}</p>
                    </div>
                  </div>

                  {/* Resposta do Assistente */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E4EAE6] shrink-0 bg-[#F8FAF9] mt-1 shadow-2xs">
                      <img
                        src={JETRO_ONLINE_AVATAR_URL}
                        alt="Jetro On-line"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#F8FAF9] border border-[#E4EAE6] text-[#202B28] p-4 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
                        <span className="text-[11px] font-semibold text-[#063D30] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#C69B45]" />
                          Jetro On-line
                        </span>
                        <span className="text-[10px] text-[#66736D]">Resposta inteligente</span>
                      </div>

                      <p className="leading-relaxed text-[#202B28] font-normal">
                        {displayedAnswer}
                        {isTyping && (
                          <span className="inline-block w-1.5 h-4 ml-1 bg-[#116B50] animate-pulse align-middle" />
                        )}
                      </p>

                      {!isTyping && (
                        <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-[#66736D]">
                          <span className="flex items-center gap-1 text-[#116B50] font-medium">
                            <CheckCircle2 className="w-3 h-3 text-[#116B50]" />
                            Exemplo ilustrativo auditado
                          </span>
                          <span>Segurança e permissões respeitadas</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Caixa Inferior */}
                <div className="p-3 bg-[#F8FAF9] border-t border-[#E4EAE6] flex items-center gap-2 shrink-0">
                  <div className="flex-1 bg-white border border-[#E4EAE6] rounded-xl px-3 py-2 text-xs text-[#66736D] flex items-center justify-between">
                    <span className="truncate">
                      Clique em outra pergunta sugerida ao lado para testar...
                    </span>
                    {isTyping && <Loader2 className="w-3.5 h-3.5 text-[#116B50] animate-spin" />}
                  </div>
                  <Button
                    size="sm"
                    disabled
                    className="h-9 px-3 bg-[#063D30] text-white opacity-60 cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. BLOCO EDUCACIONAL                                            */}
        {/* ============================================================== */}
        <div className="rounded-2xl p-8 sm:p-10 lg:p-12 bg-white border border-[#E4EAE6] shadow-sm relative overflow-hidden text-left">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F1F4F2] border border-[#063D30]/15 text-[#063D30] text-xs font-semibold tracking-wide">
                <GraduationCap className="w-4 h-4 text-[#116B50]" />
                <span>Capacitação Integrada</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold font-heading text-[#063D30] leading-tight">
                Jetro On-line também ensina você a utilizar o sistema.
              </h3>

              <p className="text-[#66736D] text-sm sm:text-base leading-relaxed font-normal">
                Mais do que tirar dúvidas sobre números, o assistente inteligente apoia o
                desenvolvimento contínuo da sua equipe, orientando colaboradores em tempo real e
                reduzindo a curva de aprendizado do ERP com total autonomia.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6]">
                  <Video className="w-4 h-4 text-[#116B50] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-xs text-[#063D30] font-heading">
                      Vídeos de Treinamento
                    </h5>
                    <p className="text-[11px] text-[#66736D] leading-relaxed">
                      Recomendações pontuais da Universidade Jetro para a tela em que você está.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6]">
                  <Compass className="w-4 h-4 text-[#116B50] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-xs text-[#063D30] font-heading">
                      Tours Guiados Interativos
                    </h5>
                    <p className="text-[11px] text-[#66736D] leading-relaxed">
                      Passo a passo visual na interface para aprender fazendo.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6]">
                  <CheckCircle2 className="w-4 h-4 text-[#116B50] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-xs text-[#063D30] font-heading">
                      Orientações Passo a Passo
                    </h5>
                    <p className="text-[11px] text-[#66736D] leading-relaxed">
                      Instruções claras para operações, cadastros e lançamentos complexos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6]">
                  <HelpCircle className="w-4 h-4 text-[#116B50] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-xs text-[#063D30] font-heading">
                      Respostas a Dúvidas sobre Telas
                    </h5>
                    <p className="text-[11px] text-[#66736D] leading-relaxed">
                      Esclarecimento contextualizado para destravar tarefas do dia a dia.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-[#E4EAE6] shadow-xs space-y-4 max-w-sm text-center">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-white border border-[#E4EAE6] flex items-center justify-center text-[#063D30] shadow-2xs">
                  <GraduationCap className="w-8 h-8 text-[#116B50]" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold font-heading text-[#063D30]">
                    Universidade Jetro
                  </h4>
                  <p className="text-xs text-[#66736D] mt-1 leading-relaxed font-normal">
                    Conteúdos organizados por módulo para capacitar sua equipe com velocidade e
                    padronização operacional.
                  </p>
                </div>
                <div className="pt-2">
                  <Button
                    onClick={() => handleScrollToSection('solucoes')}
                    variant="outline"
                    className="w-full border-[#063D30]/25 text-[#063D30] hover:bg-white font-semibold text-xs cursor-pointer"
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
        {/* 5. FECHAMENTO                                                  */}
        {/* ============================================================== */}
        <div className="text-center max-w-3xl mx-auto space-y-6 pt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C69B45]">
            Evolução Contínua
          </span>

          <h3 className="text-2xl sm:text-4xl font-semibold font-heading text-[#063D30] tracking-tight leading-tight">
            Uma nova maneira de trabalhar com informações.
          </h3>

          <blockquote className="text-base sm:text-xl text-[#66736D] italic leading-relaxed border-y border-[#E4EAE6] py-6 px-4 font-normal">
            "O Jetro On-line aproxima as pessoas dos dados e transforma consultas complexas em
            conversas simples, tornando a gestão mais acessível, inteligente e produtiva."
          </blockquote>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => handleScrollToSection('solucoes')}
              size="lg"
              className="w-full sm:w-auto bg-[#063D30] hover:bg-[#042820] text-white font-semibold text-base px-8 py-6 rounded-xl shadow-xs transition-all cursor-pointer group"
            >
              <span>Conhecer o Jetro</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform text-[#C69B45]" />
            </Button>

            <Button
              onClick={() => handleScrollToSection('orcamento')}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-[#063D30]/25 text-[#063D30] hover:bg-white font-semibold text-base px-8 py-6 rounded-xl cursor-pointer"
            >
              Solicitar Demonstração Comercial
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
