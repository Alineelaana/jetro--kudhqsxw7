import { useState, useEffect, useCallback, useMemo } from 'react'
import { Sparkles, Calendar as CalendarIcon, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { JetroCalendar } from '@/components/jetro-agenda/jetro-calendar'
import { useJetroOnline } from '@/hooks/use-jetro-online'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import {
  getSaudacaoAtual,
  formatarSaudacaoCompleta,
  extrairPrimeiroNome,
  getMensagemTratamento,
  TEXTO_AGENDA_CONFIRMAÇÃO,
  getMsAteProximaVirada,
  resolveSafeTimeZone,
  type SaudacaoInfo,
} from '@/lib/jetro-greeting'

export function IntelligentHomeScreen() {
  const { user, signOut } = useAuth()
  const { setIsFloatingOpen } = useJetroOnline()
  const { preferences } = useUserPreferences()

  // Extrair fuso e tratamento do usuário (ou das preferências)
  const userRecord = user as
    | {
        name?: string
        email?: string
        fuso_horario?: string
        timezone?: string
        tratamento?: string
      }
    | null
    | undefined

  const userTimeZone = userRecord?.fuso_horario || userRecord?.timezone || null
  const safeTimeZone = useMemo(() => resolveSafeTimeZone(userTimeZone), [userTimeZone])
  const tratamento = userRecord?.tratamento || null

  // Primeiro nome real extraído do cadastro — nunca fixo ou fictício
  const primeiroNome = useMemo(() => {
    return extrairPrimeiroNome(userRecord?.name, userRecord?.email)
  }, [userRecord?.name, userRecord?.email])

  // Linha 1 de boas-vindas conforme TRATAMENTO
  const linhaBoasVindasTratamento = useMemo(() => {
    return getMensagemTratamento(tratamento)
  }, [tratamento])

  // Estado da saudação dinâmica (calculada exclusivamente no fuso do cliente, nunca no servidor)
  const [saudacaoInfo, setSaudacaoInfo] = useState<SaudacaoInfo>(() => {
    return getSaudacaoAtual(safeTimeZone)
  })

  // Função para reavaliar a saudação
  const atualizarSaudacao = useCallback(() => {
    setSaudacaoInfo(getSaudacaoAtual(safeTimeZone))
  }, [safeTimeZone])

  // Efeito 1: Reavaliar ao acessar a tela, ao retornar à aba (visibilitychange) e na virada de período
  useEffect(() => {
    atualizarSaudacao()

    // 1. Ouvinte ao retornar à aba (visibilitychange)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        atualizarSaudacao()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 2. Timer na virada de período inteligente (05:00, 12:00 ou 18:00)
    let timerId: ReturnType<typeof setTimeout> | undefined

    const scheduleNextTransition = () => {
      const ms = getMsAteProximaVirada(safeTimeZone)
      timerId = setTimeout(() => {
        atualizarSaudacao()
        scheduleNextTransition()
      }, ms)
    }

    scheduleNextTransition()

    // 3. Checagem periódica a cada 30 segundos como salvaguarda (sem necessidade de F5)
    const backupInterval = setInterval(() => {
      atualizarSaudacao()
    }, 30000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (timerId) clearTimeout(timerId)
      clearInterval(backupInterval)
    }
  }, [safeTimeZone, atualizarSaudacao])

  // Saudação formatada: "Bom dia, Carlos! ☀️"
  const fraseSaudacao = useMemo(() => {
    return formatarSaudacaoCompleta(saudacaoInfo.saudacao, primeiroNome, saudacaoInfo.icone)
  }, [saudacaoInfo, primeiroNome])

  // Respeita preferência de redução de animações da Central de Personalização
  const animClasses =
    preferences.reducedMotion || !preferences.animationsEnabled ? '' : 'transition-all duration-300'

  return (
    <div
      className="flex flex-col min-h-full p-3 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full pb-12 space-y-4"
      data-tour-id="admin-home-header"
    >
      {/* ==================================================================== */}
      {/* FAIXA VERDE-ESMERALDA PROFUNDO INSTITUCIONAL COM DETALHES DOURADOS    */}
      {/* APRESENTAÇÃO DE BOAS-VINDAS PERSONALIZADA (REPOSICIONADA PARA O TOPO) */}
      {/* ==================================================================== */}
      <section
        className={`relative overflow-hidden rounded-2xl border border-[#C9A227]/30 shadow-lg text-white ${animClasses}`}
        style={{
          background: 'linear-gradient(135deg, #002817 0%, #004423 55%, #002817 100%)',
        }}
        data-tour-id="admin-home-welcome"
      >
        {/* Detalhes dourados discretos de fundo (textura e brilho institucional) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#C9A227]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-[#005B2E]/30 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#C9A227]/60 to-transparent"
        />

        <div className="relative px-5 py-5 sm:px-6 sm:py-6 lg:px-7 lg:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            {/* Bloco de Saudação e Mensagens de Boas-Vindas */}
            <div className="space-y-2.5 max-w-3xl">
              {/* Badge institucional discreta dourada */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/40 text-[#E4C46A] text-[11px] font-bold tracking-wide uppercase">
                <Sparkles className="w-3 h-3 text-[#E4C46A]" />
                <span>Jetro Sistema Inteligente</span>
              </div>

              {/* Saudação principal em destaque */}
              <h1 className="text-2xl sm:text-3xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                {fraseSaudacao}
              </h1>

              {/* Mensagem de boas-vindas com tratamento cadastrado */}
              <div className="space-y-1 text-sm sm:text-base text-emerald-100/95 leading-relaxed">
                <p className="font-semibold text-[#E4C46A]">{linhaBoasVindasTratamento}</p>
                <p className="text-emerald-50/90 text-xs sm:text-sm">{TEXTO_AGENDA_CONFIRMAÇÃO}</p>
                <p className="text-emerald-100/80 text-xs sm:text-sm pt-0.5">
                  Bom trabalho! Se precisar de ajuda, é só{' '}
                  <button
                    type="button"
                    onClick={() => setIsFloatingOpen(true)}
                    className="inline-flex items-center gap-1 font-bold text-[#E4C46A] hover:text-white underline underline-offset-4 decoration-[#C9A227] hover:decoration-white transition-colors cursor-pointer"
                    title="Abrir assistente Jetro On-line"
                  >
                    <span>chamar o Jetro On-line</span>
                    <MessageSquare className="w-3.5 h-3.5 inline shrink-0" />
                  </button>{' '}
                  no canto direito da sua tela.
                </p>
              </div>
            </div>

            {/* Ação rápida para abrir o Jetro On-line lateral */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFloatingOpen(true)}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#d4ad2d] text-[#002817] font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-transform active:scale-95 cursor-pointer ${animClasses}`}
                title="Abrir painel do Jetro On-line"
              >
                <Sparkles className="w-4 h-4 fill-[#002817]" />
                <span>Chamar Jetro On-line</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* CALENDÁRIO E AGENDA CORPORATIVA JETRO (REPOSICIONADOS MAIS PARA CIMA) */}
      {/* ==================================================================== */}
      <section className="w-full" data-tour-id="admin-home-agenda">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#005B2E]" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Calendário e Agenda Corporativa
            </h2>
          </div>
        </div>

        <JetroCalendar
          currentUser={
            user
              ? {
                  id: String(user.id || ''),
                  email: String(user.email || ''),
                  name: (user as { name?: string })?.name
                    ? String((user as { name?: string }).name)
                    : undefined,
                }
              : undefined
          }
        />
      </section>
    </div>
  )
}
