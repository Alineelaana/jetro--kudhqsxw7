import { useState, useEffect, useCallback, useMemo } from 'react'
import { Sparkles, Calendar as CalendarIcon, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { JetroCalendar } from '@/components/jetro-agenda/jetro-calendar'
import { useJetroOnline } from '@/hooks/use-jetro-online'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import pb from '@/lib/pocketbase/client'
import {
  getSaudacaoAtual,
  formatarSaudacaoCompleta,
  extrairPrimeiroNome,
  TEXTO_AGENDA_CONFIRMAÇÃO,
  getMsAteProximaVirada,
  resolveSafeTimeZone,
  type SaudacaoInfo,
} from '@/lib/jetro-greeting'

export function IntelligentHomeScreen() {
  const { user } = useAuth()
  const { setIsFloatingOpen } = useJetroOnline()
  const { preferences } = useUserPreferences()

  // Extrair fuso, nome e avatar do usuário autenticado (da mesma fonte de dados do perfil)
  const userRecord = user as
    | {
        id?: string
        name?: string
        email?: string
        avatar?: string
        fuso_horario?: string
        timezone?: string
        updated?: string
      }
    | null
    | undefined

  const currentUserId = userRecord?.id ? String(userRecord.id) : ''
  const [avatarFileName, setAvatarFileName] = useState<string>(() => userRecord?.avatar || '')
  const [avatarVersion, setAvatarVersion] = useState<number>(Date.now())

  // Sincroniza quando o objeto user no contexto de autenticação mudar
  useEffect(() => {
    if (userRecord?.avatar !== undefined) {
      setAvatarFileName(userRecord.avatar || '')
    }
  }, [userRecord?.avatar])

  // Revalida dados do usuário no PocketBase ao focar a aba ou retornar à tela
  const revalidarPerfilUsuario = useCallback(async () => {
    if (!currentUserId) return
    try {
      const fresh = await pb.collection('users').getOne(currentUserId, { requestKey: null })
      if (fresh) {
        if (fresh.avatar !== avatarFileName) {
          setAvatarFileName((fresh.avatar as string) || '')
        }
        setAvatarVersion(Date.now())
      }
    } catch {
      /* ignore gracefully */
    }
  }, [currentUserId, avatarFileName])

  // Reavalia ao focar ou ao visibilidade da página mudar
  useEffect(() => {
    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        revalidarPerfilUsuario()
      }
    }
    window.addEventListener('focus', handleFocusOrVisible)
    document.addEventListener('visibilitychange', handleFocusOrVisible)
    return () => {
      window.removeEventListener('focus', handleFocusOrVisible)
      document.removeEventListener('visibilitychange', handleFocusOrVisible)
    }
  }, [revalidarPerfilUsuario])

  // URL da foto de perfil: gerada de forma segura pelo cliente PocketBase oficial
  const avatarUrl = useMemo(() => {
    if (!currentUserId || !avatarFileName) return ''
    try {
      // Usa pb.files.getUrl ou constrói via API padrão do PocketBase
      const base = pb.files.getUrl(
        { id: currentUserId, collectionName: 'users' } as any,
        avatarFileName,
      )
      // Adiciona versão de cache para refletir trocas recentes
      return `${base}?v=${avatarVersion}`
    } catch {
      const pbUrl = import.meta.env.VITE_POCKETBASE_URL || ''
      return `${pbUrl}/api/files/users/${currentUserId}/${avatarFileName}?v=${avatarVersion}`
    }
  }, [currentUserId, avatarFileName, avatarVersion])

  // Iniciais do usuário para o fallback elegante
  const userInitials = useMemo(() => {
    const fullName = (userRecord?.name || '').trim()
    if (fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean)
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    const email = (userRecord?.email || '').trim()
    if (email) return email.substring(0, 2).toUpperCase()
    return 'JT'
  }, [userRecord?.name, userRecord?.email])

  const userTimeZone = userRecord?.fuso_horario || userRecord?.timezone || null
  const safeTimeZone = useMemo(() => resolveSafeTimeZone(userTimeZone), [userTimeZone])

  // Primeiro nome real extraído do cadastro — nunca fixo ou fictício
  const primeiroNome = useMemo(() => {
    return extrairPrimeiroNome(userRecord?.name, userRecord?.email)
  }, [userRecord?.name, userRecord?.email])

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
                <span>HURAM — Sistema Inteligente de Gestão</span>
              </div>

              {/* Saudação principal em destaque integrada com a foto de perfil do usuário */}
              <div className="flex items-center gap-3 sm:gap-4 pt-1">
                <Avatar
                  className="w-11 h-11 sm:w-13 sm:h-13 lg:w-14 lg:h-14 rounded-full border-2 border-[#D4AF37]/80 shadow-md ring-2 ring-[#002817]/40 shrink-0 bg-[#002817]"
                  style={{
                    boxShadow: '0 0 0 1px rgba(212, 175, 55, 0.35), 0 4px 12px rgba(0, 0, 0, 0.35)',
                  }}
                >
                  {avatarUrl ? (
                    <AvatarImage
                      src={avatarUrl}
                      alt={userRecord?.name || 'Foto de Perfil'}
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-[#00381D] to-[#012211] text-[#E4C46A] border border-[#D4AF37]/40 font-bold text-xs sm:text-sm lg:text-base tracking-wider">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    {fraseSaudacao}
                  </h1>
                </div>
              </div>

              {/* Mensagens de boas-vindas e orientações */}
              <div className="space-y-1.5 text-sm sm:text-base text-emerald-100/95 leading-relaxed">
                <p className="text-emerald-50/95 text-xs sm:text-sm font-medium">
                  {TEXTO_AGENDA_CONFIRMAÇÃO}
                </p>
                <p className="text-emerald-100/85 text-xs sm:text-sm pt-0.5">
                  Desejamos a você um excelente dia de trabalho! Sempre que precisar de ajuda, o{' '}
                  <button
                    type="button"
                    onClick={() => setIsFloatingOpen(true)}
                    className="inline-flex items-center gap-1 font-bold text-[#E4C46A] hover:text-white underline underline-offset-4 decoration-[#C9A227] hover:decoration-white transition-colors cursor-pointer"
                    title="Abrir assistente HURAM On-line no canto direito"
                  >
                    <span>HURAM On-line</span>
                    <MessageSquare className="w-3.5 h-3.5 inline shrink-0" />
                  </button>{' '}
                  estará à sua disposição no canto direito da tela.
                </p>
              </div>
            </div>
            {/* Ação rápida para abrir o HURAM On-line lateral */}
            <div className="shrink-0 self-start sm:self-center">
              <Button
                type="button"
                onClick={() => setIsFloatingOpen(true)}
                className="bg-[#063D30] hover:bg-[#042820] text-white border border-[#C69B45]/50 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer group"
                title="Abrir painel do HURAM On-line"
              >
                <MessageSquare className="w-4 h-4 text-[#C69B45] group-hover:scale-110 transition-transform" />
                <span>Chamar HURAM On-line</span>
              </Button>
            </div>{' '}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* CALENDÁRIO E AGENDA CORPORATIVA JETRO (REPOSICIONADOS MAIS PARA CIMA) */}
      {/* ==================================================================== */}
      <section className="w-full" data-tour-id="admin-home-agenda">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#063D30]" />
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
