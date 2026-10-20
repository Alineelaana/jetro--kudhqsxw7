import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Bot,
  MessageSquare,
  UserCheck,
  HelpCircle,
  TrendingUp,
  History,
  Send,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Clock,
  Layers,
  PhoneCall,
  Briefcase,
  Play,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JEH_AVATAR_URL } from '@/lib/jeh-assets'
import { JehAssistantService } from '@/services/jeh-assistant'
import { cn } from '@/lib/utils'

// 6 Cards com textos rigorosamente EXATOS do item 3 da instrução
const JEH_FEATURE_CARDS = [
  {
    id: '01',
    title: 'Atendimento inteligente e humanizado',
    description:
      'Recepciona os visitantes, conduz conversas naturais e oferece uma experiência de atendimento cordial e personalizada.',
    icon: MessageSquare,
  },
  {
    id: '02',
    title: 'Captação automática de leads',
    description:
      'Solicita e registra informações como nome, telefone, empresa e e-mail, organizando os contatos na área comercial do Jetro.',
    icon: UserCheck,
  },
  {
    id: '03',
    title: 'Respostas sobre o ERP',
    description:
      'Consulta sua base de conhecimento para explicar como o Jetro funciona, quais são seus módulos, suas funcionalidades e seus benefícios.',
    icon: HelpCircle,
  },
  {
    id: '04',
    title: 'Identificação de oportunidades comerciais',
    description:
      'Compreende as necessidades apresentadas pelos visitantes, identifica assuntos de interesse e ajuda a qualificar potenciais clientes.',
    icon: TrendingUp,
  },
  {
    id: '05',
    title: 'Histórico de conversas',
    description:
      'Mantém registros dos atendimentos, permitindo que a equipe autorizada consulte as dúvidas apresentadas e acompanhe as oportunidades comerciais.',
    icon: History,
  },
  {
    id: '06',
    title: 'Encaminhamento inteligente',
    description:
      'Quando necessário, direciona o visitante à equipe comercial, preservando as informações coletadas e o contexto do atendimento.',
    icon: PhoneCall,
  },
]

// 6 Benefícios comerciais com textos rigorosamente EXATOS do item 5 da instrução
const JEH_COMMERCIAL_BENEFITS = [
  'Melhor aproveitamento dos contatos recebidos pelo site.',
  'Organização automática das informações de potenciais clientes.',
  'Redução de perguntas repetitivas direcionadas à equipe comercial.',
  'Atendimento inicial disponível conforme a configuração da assistente.',
  'Identificação das principais dúvidas e interesses dos visitantes.',
  'Maior continuidade entre o atendimento virtual e o contato comercial humano.',
]

// Roteiro EXATO dos turnos de conversa da demo interativa (item 4)
interface DemoTurn {
  step: number
  speaker: 'visitor' | 'jeh'
  speakerName: string
  text: string
  actionHint?: string
}

const DEMO_TURNS: DemoTurn[] = [
  {
    step: 1,
    speaker: 'visitor',
    speakerName: 'Visitante',
    text: 'Olá! Gostaria de saber como funciona o Jetro.',
  },
  {
    step: 2,
    speaker: 'jeh',
    speakerName: 'Jeh',
    text: 'Olá! Seja muito bem-vindo ao Jetro! 😊 Sou a Jeh, assistente virtual do sistema. Vou adorar ajudar você a conhecer nossa solução. Como posso chamar você?',
    actionHint: 'Apresentação cordial + Início de qualificação',
  },
  {
    step: 3,
    speaker: 'visitor',
    speakerName: 'Visitante',
    text: 'Meu nome é Carlos.',
  },
  {
    step: 4,
    speaker: 'jeh',
    speakerName: 'Jeh',
    text: 'Prazer, Carlos! O Jetro é um sistema de gestão empresarial que reúne diferentes processos da empresa em uma plataforma integrada. Posso explicar os módulos e mostrar como eles ajudam na rotina empresarial. Antes, você poderia me informar o nome da sua empresa e um contato para continuarmos o atendimento?',
    actionHint: 'Explicação de valor + Solicitação de dados do lead',
  },
  {
    step: 5,
    speaker: 'visitor',
    speakerName: 'Visitante',
    text: 'Minha empresa é uma distribuidora.',
  },
  {
    step: 6,
    speaker: 'jeh',
    speakerName: 'Jeh',
    text: 'Que interessante, Carlos! O Jetro contempla funcionalidades voltadas à gestão comercial e operacional, entre outras áreas. Você gostaria de conhecer primeiro os recursos para vendas, pedidos ou acompanhamento de resultados?',
    actionHint: 'Segmentação comercial + Qualificação de interesse',
  },
]

// Etapas do fluxo da Jeh
const JEH_WORKFLOW_STEPS = [
  { step: '1', title: 'Visitante inicia contato' },
  { step: '2', title: 'Jeh recepciona' },
  { step: '3', title: 'Esclarece dúvidas' },
  { step: '4', title: 'Registra o lead' },
  { step: '5', title: 'Identifica necessidades' },
  { step: '6', title: 'Apoia o encaminhamento comercial' },
]

export function JehSection() {
  const [currentStep, setCurrentStep] = useState<number>(2) // Começa mostrando a 1ª interação do visitante + resposta da Jeh
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [assistantStatus, setAssistantStatus] = useState<'ativa' | 'inativa' | null>(null)

  // Consulta do status real no banco (Skip Cloud / settings: jeh_assistant_status)
  useEffect(() => {
    let mounted = true
    JehAssistantService.getAssistantStatus()
      .then((st) => {
        if (mounted) setAssistantStatus(st)
      })
      .catch(() => {
        if (mounted) setAssistantStatus('inativa')
      })
    return () => {
      mounted = false
    }
  }, [])

  const handleNextStep = () => {
    if (currentStep < DEMO_TURNS.length) {
      setIsTyping(true)
      const next = Math.min(currentStep + 2, DEMO_TURNS.length)
      setTimeout(() => {
        setCurrentStep(next)
        setIsTyping(false)
      }, 350)
    }
  }

  const handleResetDemo = () => {
    setCurrentStep(2)
  }

  const handleOpenPublicChat = () => {
    window.dispatchEvent(new CustomEvent('open-jeh-chat'))
  }

  const handleScrollToSection = (targetId: string) => {
    const el = document.getElementById(targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const visibleTurns = DEMO_TURNS.filter((t) => t.step <= currentStep)

  return (
    <section
      id="jeh"
      className="relative bg-white text-[#202B28] py-16 sm:py-20 lg:py-24 border-b border-[#E4EAE6] overflow-hidden"
    >
      {/* Âncora alternativa para preservar links legados (#nine-ia) e diretos (#ia) */}
      <span id="nine-ia" className="absolute -top-24 pointer-events-none" />
      <span id="ia" className="absolute -top-24 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10 space-y-16 sm:space-y-20">
        {/* ============================================================== */}
        {/* 1. CABEÇALHO E APRESENTAÇÃO INSTITUCIONAL DA JEH                */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Coluna Visual de Identificação */}
          <div className="lg:col-span-4 flex justify-center lg:justify-start">
            <div className="relative flex flex-col items-center text-center">
              <div className="relative">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full p-1 bg-white border-2 border-[#116B50] shadow-sm">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#F8FAF9] relative">
                    <img
                      src={JEH_AVATAR_URL}
                      alt="Jeh — Assistente Comercial Jetro"
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                </div>
              </div>

              {/* Status e Identificação da Assistente */}
              <div className="mt-4 flex flex-col items-center gap-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8FAF9] border border-[#E4EAE6]">
                  <span className="relative flex h-2 w-2">
                    {assistantStatus === 'ativa' && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#116B50] opacity-75" />
                    )}
                    <span
                      className={cn(
                        'relative inline-flex rounded-full h-2 w-2',
                        assistantStatus === 'ativa' ? 'bg-[#116B50]' : 'bg-amber-500',
                      )}
                    />
                  </span>
                  <span className="text-[11px] font-semibold tracking-wider text-[#063D30] uppercase">
                    {assistantStatus === 'ativa' ? 'Jeh Ativa no Site' : 'Assistente em Ajuste'}
                  </span>
                </div>
                <span className="text-xs text-[#66736D] font-normal">
                  Assistente Virtual Comercial Jetro
                </span>
              </div>
            </div>
          </div>

          {/* Coluna Textual */}
          <div className="lg:col-span-8 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1F4F2] border border-[#063D30]/15 text-[#063D30] text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#C69B45]" />
              <span>Experiência do Visitante & Relacionamento Comercial</span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-heading text-[#063D30] tracking-tight">
                Conheça a Jeh
              </h2>
              <p className="text-lg sm:text-xl text-[#116B50] font-medium mt-1 font-heading">
                Sua primeira conexão inteligente com o Jetro.
              </p>
            </div>

            <div className="space-y-3 text-[#66736D] text-sm sm:text-base leading-relaxed font-normal">
              <p>
                A Jeh é a assistente virtual comercial do Jetro, desenvolvida para transformar o
                primeiro contato com nossos visitantes em uma experiência acolhedora, informativa e
                personalizada.
              </p>
              <p>
                Muito além de responder mensagens, ela foi concebida para apresentar o ERP,
                esclarecer dúvidas, identificar necessidades empresariais e conectar potenciais
                clientes à nossa equipe comercial.
              </p>
              <p className="font-medium text-[#202B28] border-l-2 border-[#116B50] pl-3">
                Enquanto conversa com os visitantes, a Jeh pode organizar as informações fornecidas,
                registrar oportunidades de negócio e ajudar a garantir que nenhum contato importante
                seja perdido.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {assistantStatus === 'ativa' && (
                <Button
                  onClick={handleOpenPublicChat}
                  className="bg-[#063D30] hover:bg-[#042820] text-white font-semibold text-sm px-6 py-5 rounded-xl shadow-xs transition-all cursor-pointer group"
                >
                  <MessageSquare className="w-4 h-4 mr-2 text-[#C69B45]" />
                  <span>Conversar com a Jeh Agora</span>
                  <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => handleScrollToSection('orcamento')}
                className="border-[#063D30]/25 text-[#063D30] hover:bg-[#F8FAF9] font-semibold text-sm px-6 py-5 rounded-xl cursor-pointer"
              >
                Solicitar Apresentação Comercial
              </Button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. 6 CARDS DE FUNCIONALIDADES DA JEH                            */}
        {/* ============================================================== */}
        <div className="space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C69B45]">
              Recursos de Atendimento Comercial
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold font-heading text-[#063D30]">
              Funcionalidades projetadas para acolher, informar e qualificar
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {JEH_FEATURE_CARDS.map((card) => {
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
        {/* 3. DEMO INTERATIVA DA JEH                                      */}
        {/* ============================================================== */}
        <div className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F4F2] text-[#063D30] text-xs font-semibold border border-[#063D30]/15">
              <Bot className="w-3.5 h-3.5 text-[#116B50]" />
              <span>Simulação Interativa de Conversa</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-semibold font-heading text-[#063D30] tracking-tight">
              Do primeiro contato à oportunidade de negócio.
            </h3>
            <p className="text-sm sm:text-base text-[#66736D] font-normal">
              Acompanhe como a Jeh conduz um atendimento real e converte o interesse do visitante em
              uma oportunidade qualificada para a equipe comercial.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto text-left">
            {/* Lado Esquerdo: Janela da Conversa */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#E4EAE6] bg-white shadow-md overflow-hidden flex flex-col h-[520px]">
                {/* Topbar da Conversa */}
                <div className="bg-[#F8FAF9] px-4 py-3 border-b border-[#E4EAE6] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full overflow-hidden border border-[#E4EAE6] shrink-0 bg-white">
                      <img
                        src={JEH_AVATAR_URL}
                        alt="Jeh"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-semibold font-heading text-[#063D30]">Jeh</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#063D30] font-medium border border-emerald-200 uppercase tracking-wider">
                          Atendimento Comercial
                        </span>
                      </div>
                      <span className="text-[11px] text-[#66736D] font-normal">
                        Atendimento ilustrativo demonstrativo
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#66736D] hidden sm:inline-block bg-white px-2 py-1 rounded border border-[#E4EAE6]">
                    Demonstração Ilustrativa
                  </span>
                </div>

                {/* Balões da Conversa */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-white text-xs sm:text-sm">
                  {visibleTurns.map((turn) => {
                    const isVisitor = turn.speaker === 'visitor'
                    return (
                      <div
                        key={turn.step}
                        className={cn(
                          'flex items-start gap-2.5',
                          isVisitor ? 'justify-end' : 'justify-start',
                        )}
                      >
                        {!isVisitor && (
                          <div className="w-7 h-7 rounded-full overflow-hidden border border-[#E4EAE6] shrink-0 bg-[#F8FAF9] mt-1 shadow-2xs">
                            <img
                              src={JEH_AVATAR_URL}
                              alt="Jeh"
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                        )}

                        <div
                          className={cn(
                            'max-w-[85%] rounded-2xl p-3.5 space-y-1',
                            isVisitor
                              ? 'bg-[#063D30] text-white rounded-tr-xs font-normal'
                              : 'bg-[#F8FAF9] text-[#202B28] rounded-tl-xs border border-[#E4EAE6]',
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-1">
                            <span
                              className={cn(
                                'text-[10px] font-semibold uppercase tracking-wider',
                                isVisitor ? 'text-slate-200' : 'text-[#063D30]',
                              )}
                            >
                              {turn.speakerName}
                            </span>
                            {turn.actionHint && (
                              <span className="text-[10px] text-[#66736D] italic hidden sm:inline font-normal">
                                {turn.actionHint}
                              </span>
                            )}
                          </div>
                          <p className="leading-relaxed whitespace-pre-line text-xs sm:text-sm pt-0.5">
                            {turn.text}
                          </p>
                        </div>
                      </div>
                    )
                  })}

                  {isTyping && (
                    <div className="flex items-center gap-2 text-[#66736D] text-xs pl-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-[#E4EAE6] bg-[#F8FAF9]">
                        <img
                          src={JEH_AVATAR_URL}
                          alt="Jeh"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="bg-[#F8FAF9] border border-[#E4EAE6] px-3 py-1.5 rounded-2xl text-[11px] text-[#063D30]">
                        Avançando diálogo...
                      </div>
                    </div>
                  )}
                </div>

                {/* Controles da Simulação */}
                <div className="p-3 bg-[#F8FAF9] border-t border-[#E4EAE6] flex flex-wrap items-center justify-between gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#66736D]">
                      Etapa {Math.min(currentStep, DEMO_TURNS.length)} de {DEMO_TURNS.length}
                    </span>
                    <span className="text-[#66736D] text-xs">•</span>
                    <span className="text-[11px] text-[#063D30] font-medium hidden sm:inline">
                      {currentStep < DEMO_TURNS.length
                        ? 'Clique para avançar a conversa'
                        : 'Simulação concluída com sucesso!'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentStep > 2 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleResetDemo}
                        className="h-8 text-xs text-[#66736D] hover:text-[#063D30] hover:bg-white"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Reiniciar
                      </Button>
                    )}
                    {currentStep < DEMO_TURNS.length ? (
                      <Button
                        size="sm"
                        onClick={handleNextStep}
                        disabled={isTyping}
                        className="h-8 bg-[#063D30] hover:bg-[#042820] text-white font-semibold text-xs shadow-xs cursor-pointer"
                      >
                        <Play className="w-3 h-3 mr-1 fill-current" />
                        Avançar Diálogo
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={handleResetDemo}
                        className="h-8 bg-[#116B50] hover:bg-[#0d533e] text-white font-semibold text-xs cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Ver Novamente
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lado Direito: Fluxo Visual */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-6 rounded-2xl bg-white border border-[#E4EAE6] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E4EAE6] pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#063D30] flex items-center gap-2 font-heading">
                    <Layers className="w-4 h-4 text-[#116B50]" />
                    Fluxo do Atendimento Comercial
                  </span>
                  <span className="text-[10px] text-[#66736D] font-mono">Passo a Passo</span>
                </div>

                <div className="space-y-2.5">
                  {JEH_WORKFLOW_STEPS.map((step, idx) => (
                    <div
                      key={step.step}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6] text-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#063D30] text-white flex items-center justify-center font-semibold text-[11px] shrink-0">
                        {step.step}
                      </div>
                      <span className="font-medium text-[#202B28]">{step.title}</span>
                      {idx < JEH_WORKFLOW_STEPS.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-[#66736D] ml-auto shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#E4EAE6] text-[11px] text-[#66736D] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#116B50] shrink-0 mt-0.5" />
                  <span>
                    Demonstração ilustrativa baseada nos fluxos oficiais configurados na Central da
                    Jeh. Em conformidade com a LGPD e regras de privacidade.
                  </span>
                </div>
              </div>

              {/* Mensagem Principal destacada */}
              <div className="p-5 rounded-2xl bg-[#F8FAF9] border border-[#E4EAE6] shadow-2xs text-center space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C69B45]">
                  Proposta Comercial de Valor
                </span>
                <p className="text-base sm:text-lg font-semibold font-heading text-[#063D30] leading-snug">
                  "A Jeh não apenas conversa. Ela transforma atendimentos em oportunidades
                  comerciais."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 4. BENEFÍCIOS COMERCIAIS DA JEH                                 */}
        {/* ============================================================== */}
        <div className="p-8 sm:p-10 rounded-2xl bg-[#F8FAF9] border border-[#E4EAE6] shadow-xs space-y-6 text-left">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C69B45] flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-[#116B50]" />
              Benefícios para sua Operação Comercial
            </span>
            <h3 className="text-2xl sm:text-3xl font-semibold font-heading text-[#063D30]">
              Resultados objetivos no relacionamento com interessados
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {JEH_COMMERCIAL_BENEFITS.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-white border border-[#E4EAE6] shadow-2xs hover:border-[#116B50]/30 transition-colors"
              >
                <div className="h-5 w-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#116B50]" />
                </div>
                <p className="text-xs sm:text-sm text-[#202B28]/85 font-normal leading-relaxed">
                  {benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
