import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, ArrowUpRight, Clock, FileCode2, LogOut } from 'lucide-react'
import { logoHuramDark } from '@/lib/brand-assets'
import { useAuth } from '@/hooks/use-auth'
import { canViewScreenDocs } from '@/lib/permissions'
import { NotificationBell } from '@/components/notification-bell'
import {
  getSaudacaoAtual,
  resolveSafeTimeZone,
  getMsAteProximaVirada,
  type SaudacaoInfo,
} from '@/lib/jetro-greeting'
import { useUserPreferences } from '@/hooks/use-user-preferences'

interface SiteHeaderProps {
  onOpenScreenLogic?: () => void
}

export function SiteHeader({ onOpenScreenLogic }: SiteHeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated, user, userRole, signOut } = useAuth()
  const { preferences } = useUserPreferences()
  const { pathname } = useLocation()

  // Extrair fuso do usuário conforme a mesma regra do perfil e saudação
  const userRecord = user as
    | {
        fuso_horario?: string
        timezone?: string
      }
    | null
    | undefined

  const userTimeZone = userRecord?.fuso_horario || userRecord?.timezone || null
  const safeTimeZone = useMemo(() => resolveSafeTimeZone(userTimeZone), [userTimeZone])

  const [saudacaoInfo, setSaudacaoInfo] = useState<SaudacaoInfo>(() => {
    return getSaudacaoAtual(safeTimeZone)
  })

  const atualizarHorario = useCallback(() => {
    setSaudacaoInfo(getSaudacaoAtual(safeTimeZone))
  }, [safeTimeZone])

  useEffect(() => {
    if (!isAuthenticated) return

    atualizarHorario()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        atualizarHorario()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    let timerId: ReturnType<typeof setTimeout> | undefined
    const scheduleNextTransition = () => {
      const ms = getMsAteProximaVirada(safeTimeZone)
      timerId = setTimeout(() => {
        atualizarHorario()
        scheduleNextTransition()
      }, ms)
    }
    scheduleNextTransition()

    // Atualiza a cada 30 segundos para manter horário sempre sincronizado
    const interval = setInterval(() => {
      atualizarHorario()
    }, 30000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (timerId) clearTimeout(timerId)
      clearInterval(interval)
    }
  }, [isAuthenticated, safeTimeZone, atualizarHorario])

  const canAccessDocs = canViewScreenDocs(userRole)
  const animClasses =
    preferences?.reducedMotion || !preferences?.animationsEnabled
      ? ''
      : 'transition-all duration-200'

  const navLinks = [
    { label: 'Início', href: '#inicio' },
    { label: 'A HURAM', href: '#sobre' },
    { label: 'Soluções', href: '#solucoes' },
    { label: 'Por Dentro do ERP', href: '#telas' },
    { label: 'Fluxo Integrado', href: '#fluxo' },
    { label: 'Inteligência Artificial', href: '#ia' },
    { label: 'Universidade HURAM', href: '#universidade' },
    { label: 'Diferenciais', href: '#diferenciais' },
    { label: 'Contato', href: '#contato' },
  ]

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false)
    if (href.startsWith('#')) {
      const targetId = href.replace('#', '')
      if (!targetId || targetId === 'inicio') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      const el = document.getElementById(targetId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#C69B45]/30 bg-[#063D30]/95 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault()
            handleNavClick('#inicio')
          }}
          className="flex items-center gap-3 group py-1"
          title="HURAM — Sistema Inteligente de Gestão"
        >
          <img
            src={logoHuramDark}
            alt="HURAM — Sistema Inteligente de Gestão"
            className="h-11 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105 rounded-md bg-[#042820] p-1 border border-[#C69B45]/30"
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-xl font-black tracking-tight text-white leading-none">HURAM</span>
            <span className="text-[10px] font-semibold tracking-wider text-[#C69B45] uppercase mt-0.5">
              Sistema Inteligente de Gestão
            </span>
          </div>
        </a>

        {/* Se usuário autenticado: Cabeçalho unificado e limpo com Horário/Fuso, Lógica da Tela, Notificações e Sair */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3 2xl:gap-4">
            {/* Indicador de Horário e Fuso: formato "16:13 • Fuso: America/Sao_Paulo" */}
            <div
              className="flex items-center gap-2 text-xs text-slate-300 font-medium bg-black/20 border border-white/10 px-2.5 sm:px-3 py-1.5 rounded-lg shadow-2xs shrink-0"
              title={`Fuso horário do perfil: ${saudacaoInfo.fusoUtilizado}`}
            >
              <Clock className="w-3.5 h-3.5 text-[#C69B45] shrink-0" />
              <span className="tabular-nums">
                {saudacaoInfo.horaAtualFormatada} <span className="text-white/40">•</span>{' '}
                <span className="text-slate-400 font-normal">Fuso:</span>{' '}
                <strong className="text-white font-semibold">{saudacaoInfo.fusoUtilizado}</strong>
              </span>
            </div>

            {/* Botão "Lógica da Tela" (acessível para perfil SUP / Administrador) */}
            {canAccessDocs && onOpenScreenLogic && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenScreenLogic}
                className={`h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-semibold bg-[#042820]/80 border-[#C69B45]/40 text-[#C69B45] hover:bg-[#C69B45] hover:text-[#063D30] shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0 ${animClasses}`}
                title="Abrir especificação técnica e regras de negócio da tela atual"
              >
                <FileCode2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lógica da Tela</span>
              </Button>
            )}

            {/* Botão de Notificações (sino) com tema harmonizado ao topo escuro */}
            <div className="shrink-0 flex items-center">
              <NotificationBell
                className="hover:bg-white/10 text-white rounded-lg h-8 sm:h-9 w-8 sm:w-9"
                iconClassName="text-[#C69B45] w-4 h-4 sm:w-5 sm:h-5"
              />
            </div>

            {/* Botão "Sair" */}
            <button
              type="button"
              onClick={signOut}
              className={`flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-red-300 px-2.5 sm:px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-950/30 hover:bg-red-900/50 hover:border-red-400 cursor-pointer shadow-2xs shrink-0 ${animClasses}`}
              title="Encerrar sessão"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        ) : (
          /* Se visitante não autenticado: Mantém a navegação institucional pública EXATAMENTE como original */
          <>
            {/* Desktop Navigation */}
            <nav
              className="hidden xl:flex items-center gap-5 2xl:gap-6"
              aria-label="Navegação Principal"
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavClick(link.href)
                  }}
                  className="text-xs 2xl:text-sm font-medium text-slate-200 hover:text-[#C9A227] transition-colors py-1 cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                onClick={() => handleNavClick('#contato')}
                variant="outline"
                size="sm"
                className="border-[#C69B45]/50 text-white bg-transparent hover:bg-[#C69B45]/15 hover:border-[#C69B45] text-xs font-semibold px-4 cursor-pointer"
              >
                Demonstração
              </Button>

              <Button
                asChild
                size="sm"
                className="bg-[#063D30] hover:bg-[#042820] border border-[#C69B45]/50 text-white font-semibold text-xs px-4 shadow-sm hover:shadow-md transition-all"
              >
                <Link to={isAuthenticated ? '/admin' : '/'} className="flex items-center gap-1.5">
                  <span>{isAuthenticated ? 'Ir para o ERP' : 'Acessar o sistema'}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#C69B45]" />
                </Link>
              </Button>
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-white hover:text-[#C9A227] transition-colors focus:outline-none"
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Drawer (apenas para visitantes não logados no site institucional) */}
      {!isAuthenticated && mobileMenuOpen && (
        <div className="xl:hidden border-b border-[#C9A227]/30 bg-[#001c10] px-5 py-6 space-y-4 animate-in fade-in duration-200">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(link.href)
                }}
                className="text-sm font-medium text-slate-200 py-2.5 border-b border-white/5 hover:text-[#C9A227] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 flex flex-col gap-2">
            <Button
              onClick={() => handleNavClick('#contato')}
              variant="outline"
              className="w-full border-[#C9A227]/50 text-white hover:bg-[#C9A227]/10 py-2.5 text-xs font-semibold"
            >
              Solicitar Demonstração
            </Button>

            <Button
              asChild
              className="w-full bg-[#005A36] hover:bg-[#004225] border border-[#C9A227]/40 text-white font-semibold py-2.5 text-xs"
            >
              <Link to={isAuthenticated ? '/admin' : '/'} onClick={() => setMobileMenuOpen(false)}>
                {isAuthenticated ? 'Ir para o ERP' : 'Acessar o sistema'}
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
