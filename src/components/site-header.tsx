import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Menu, X, ArrowUpRight, Clock, FileCode2, LogOut } from 'lucide-react'
import { logoHuramLight, logoHuramDark } from '@/lib/brand-assets'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useBrand } from '@/hooks/use-brand'
import { canViewScreenDocs } from '@/lib/permissions'
import { NotificationBell } from '@/components/notification-bell'
import { Building2, Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  const { brand, empresasDoUsuario, empresaAtivaId, setEmpresaAtivaId } = useBrand()
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

  const isSup = userRole?.toUpperCase() === 'SUP'
  const hasMultipleEmpresas = isSup || empresasDoUsuario.length > 1

  // Logo e nomes dinâmicos da marca ativa
  const headerLogoSrc = isAuthenticated && brand.logoUrl ? brand.logoUrl : logoHuramLight
  const headerBrandName = isAuthenticated && brand.nomeExibicao ? brand.nomeExibicao : 'HURAM'

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all border-b border-[var(--brand-primary-dark,#042820)] bg-[var(--brand-primary,#063D30)]/95 backdrop-blur-md text-white shadow-[0_4px_20px_rgba(4,40,32,0.35)]"
      style={
        isAuthenticated
          ? {
              backgroundColor: 'var(--brand-primary, #063D30)',
              borderBottomColor: 'var(--brand-primary-dark, #042820)',
            }
          : undefined
      }
    >
      {/* Linha superior de acabamento com a cor secundária (dourado HURAM ou secundária da marca) */}
      <div
        className="h-0.5 w-full bg-gradient-to-r from-transparent via-[var(--brand-secondary,#C69B45)] to-transparent opacity-70"
        style={
          isAuthenticated
            ? {
                background: `linear-gradient(to right, transparent, var(--brand-secondary, #C69B45), transparent)`,
              }
            : undefined
        }
      />

      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        <a
          href={isAuthenticated ? '/admin' : '#inicio'}
          onClick={(e) => {
            if (!isAuthenticated) {
              e.preventDefault()
              handleNavClick('#inicio')
            }
          }}
          className="flex items-center gap-3 group py-1 cursor-pointer"
          title={`${headerBrandName} — Sistema Inteligente de Gestão`}
        >
          <img
            src={headerLogoSrc}
            alt={`${headerBrandName} — Sistema Inteligente de Gestão`}
            className="h-10 sm:h-11 w-auto max-w-[160px] sm:max-w-[200px] object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm"
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-xl font-bold tracking-tight font-heading leading-none text-white">
              {headerBrandName}
            </span>
            <span
              className="text-[10px] font-semibold tracking-wider text-[var(--brand-secondary,#C69B45)] uppercase mt-0.5"
              style={isAuthenticated ? { color: 'var(--brand-secondary, #C69B45)' } : undefined}
            >
              Sistema Inteligente de Gestão
            </span>
          </div>
        </a>

        {/* Se usuário autenticado: Cabeçalho com cor primária da marca ativa, textos e controles claros */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3 2xl:gap-4">
            {/* Seletor de Empresa Ativa (SUP e Multiempresa) */}
            {hasMultipleEmpresas && empresasDoUsuario.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 text-xs text-white/95 font-medium bg-[var(--brand-primary-dark,#042820)]/80 hover:bg-white/15 border border-white/20 px-2.5 sm:px-3 py-1.5 rounded-lg shadow-2xs shrink-0 cursor-pointer transition-colors max-w-[220px]"
                    title="Trocar empresa ativa (troca a marca em tempo real sem recarregar)"
                  >
                    <Building2
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: 'var(--brand-secondary, #C69B45)' }}
                    />
                    <span className="truncate max-w-[140px] text-left">
                      <span className="text-white/60 text-[10px] block leading-none">
                        Empresa Ativa
                      </span>
                      <strong className="font-semibold text-xs leading-tight block truncate">
                        {brand.empresaNome || headerBrandName}
                      </strong>
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-white/70 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 bg-white text-[#202B28] border border-[#E4EAE6] shadow-xl p-1.5 rounded-xl z-50"
                >
                  <DropdownMenuLabel
                    className="text-xs font-bold px-2 py-1.5 flex items-center justify-between"
                    style={{ color: 'var(--brand-primary, #063D30)' }}
                  >
                    <span>Selecionar Empresa</span>
                    {isSup && (
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: 'var(--brand-primary-soft, rgba(6, 61, 48, 0.1))',
                          color: 'var(--brand-primary, #063D30)',
                        }}
                      >
                        SUP
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#E4EAE6]" />
                  <div className="max-h-60 overflow-y-auto space-y-0.5">
                    {empresasDoUsuario.map((emp) => {
                      const isSelected =
                        brand.empresaId === emp.id ||
                        (!brand.empresaId && !empresaAtivaId && emp.padrao)
                      const displayName = emp.marca_nome_exibicao || emp.nome_fantasia || emp.name
                      const hasBrand = !!(
                        emp.marca_cor_primaria ||
                        emp.marca_nome_exibicao ||
                        emp.marca_logo
                      )

                      return (
                        <DropdownMenuItem
                          key={emp.id}
                          onClick={() => setEmpresaAtivaId(emp.id)}
                          className={cn(
                            'flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors',
                            isSelected
                              ? 'text-white font-semibold'
                              : 'hover:bg-[#F1F4F2] text-[#202B28]',
                          )}
                          style={
                            isSelected
                              ? { backgroundColor: 'var(--brand-primary, #063D30)' }
                              : undefined
                          }
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/40"
                              style={{
                                backgroundColor: emp.marca_cor_primaria || '#063D30',
                              }}
                            />
                            <div className="min-w-0">
                              <div className="truncate font-medium">{displayName}</div>
                              {hasBrand && (
                                <div
                                  className={cn(
                                    'text-[10px]',
                                    isSelected ? 'text-white/80' : 'text-muted-foreground',
                                  )}
                                >
                                  Marca personalizada
                                </div>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white" />}
                        </DropdownMenuItem>
                      )
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Indicador de Horário e Fuso */}
            <div
              className="hidden md:flex items-center gap-2 text-xs text-white/90 font-medium bg-[var(--brand-primary-dark,#042820)]/80 border border-white/15 px-2.5 sm:px-3 py-1.5 rounded-lg shadow-2xs shrink-0"
              title={`Fuso horário do perfil: ${saudacaoInfo.fusoUtilizado}`}
            >
              <Clock
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: 'var(--brand-secondary, #C69B45)' }}
              />
              <span className="tabular-nums">
                {saudacaoInfo.horaAtualFormatada} <span className="text-white/40">•</span>{' '}
                <span className="text-white/70 font-normal">Fuso:</span>{' '}
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
                className={`h-8 sm:h-9 px-2.5 sm:px-3 text-xs font-semibold bg-white/10 border-white/20 text-white hover:bg-white hover:text-[var(--brand-primary,#063D30)] shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0 ${animClasses}`}
                title="Abrir especificação técnica e regras de negócio da tela atual"
              >
                <FileCode2
                  className="w-3.5 h-3.5"
                  style={{ color: 'var(--brand-secondary, #C69B45)' }}
                />
                <span className="hidden sm:inline">Lógica da Tela</span>
              </Button>
            )}

            {/* Botão de Notificações (sino) */}
            <div className="shrink-0 flex items-center">
              <NotificationBell
                className="hover:bg-white/10 text-white rounded-lg h-8 sm:h-9 w-8 sm:w-9"
                iconClassName="text-white w-4 h-4 sm:w-5 sm:h-5"
              />
            </div>

            {/* Botão "Sair" */}
            <button
              type="button"
              onClick={signOut}
              className={`flex items-center gap-1.5 text-xs font-semibold text-red-200 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-lg border border-red-400/40 bg-red-950/40 hover:bg-red-600 hover:border-red-600 cursor-pointer shadow-2xs shrink-0 ${animClasses}`}
              title="Encerrar sessão"
            >
              <LogOut className="w-3.5 h-3.5 text-red-300 group-hover:text-white" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        ) : (
          /* Se visitante não autenticado: Mantém a navegação institucional pública EXATAMENTE como original */
          <>
            {/* Desktop Navigation */}
            <nav
              className="hidden xl:flex items-center gap-6 2xl:gap-7"
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
                  className="text-xs 2xl:text-sm font-medium text-white/85 hover:text-white transition-colors py-1 cursor-pointer hover:font-semibold relative group"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C69B45] transition-all duration-200 group-hover:w-full" />
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                onClick={() => handleNavClick('#contato')}
                variant="outline"
                size="sm"
                className="border-white/25 text-white bg-white/10 hover:bg-white hover:text-[#063D30] hover:border-white text-xs font-semibold px-4.5 h-9.5 rounded-lg cursor-pointer transition-all shadow-2xs"
              >
                Demonstração
              </Button>

              <Button
                asChild
                size="sm"
                className="bg-white hover:bg-[#F8FAF9] text-[#063D30] font-semibold text-xs px-4.5 h-9.5 rounded-lg shadow-sm hover:shadow transition-all border border-white"
              >
                <Link to={isAuthenticated ? '/admin' : '/'} className="flex items-center gap-1.5">
                  <span className="text-[#063D30] font-bold">
                    {isAuthenticated ? 'Ir para o ERP' : 'Acessar o sistema'}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#C69B45]" />
                </Link>
              </Button>
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-white hover:text-[#C69B45] transition-colors focus:outline-none"
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Drawer (apenas para visitantes não logados no site institucional) */}
      {!isAuthenticated && mobileMenuOpen && (
        <div className="xl:hidden border-b border-[#042820] bg-[#063D30] text-white px-5 py-6 space-y-4 animate-in fade-in duration-200 shadow-2xl">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(link.href)
                }}
                className="text-sm font-medium text-white/90 py-2.5 border-b border-white/10 hover:text-[#C69B45] hover:font-semibold transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 flex flex-col gap-2.5">
            <Button
              onClick={() => handleNavClick('#contato')}
              variant="outline"
              className="w-full border-white/20 text-white bg-white/10 hover:bg-white hover:text-[#063D30] py-2.5 text-xs font-semibold rounded-lg cursor-pointer"
            >
              Solicitar Demonstração
            </Button>

            <Button
              asChild
              className="w-full bg-white hover:bg-[#F8FAF9] text-[#063D30] font-bold py-2.5 text-xs rounded-lg shadow-sm"
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
