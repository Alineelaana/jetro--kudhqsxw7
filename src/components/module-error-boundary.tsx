import React, { Component, type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Clock,
  Settings,
  WifiOff,
  FileQuestion,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export type ModuleErrorType =
  | 'unexpected'
  | 'unauthorized'
  | 'session_expired'
  | 'unconfigured'
  | 'network'
  | 'not_found'

export interface ModuleErrorBoundaryProps {
  children: ReactNode
  moduleName?: string
  fallbackType?: ModuleErrorType
  onReset?: () => void
}

interface ModuleErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorType: ModuleErrorType
  showDetails: boolean
}

function classifyError(error: Error | null, explicitType?: ModuleErrorType): ModuleErrorType {
  if (explicitType) return explicitType
  if (!error) return 'unexpected'

  const message = (error.message || '').toLowerCase()
  const name = (error.name || '').toLowerCase()

  if (
    message.includes('401') ||
    message.includes('unauthorized') ||
    message.includes('não autorizado') ||
    message.includes('token expired') ||
    message.includes('sessão expirada')
  ) {
    return 'session_expired'
  }

  if (
    message.includes('403') ||
    message.includes('forbidden') ||
    message.includes('acesso negado') ||
    message.includes('sem permissão') ||
    message.includes('permissão insuficiente')
  ) {
    return 'unauthorized'
  }

  if (
    message.includes('404') ||
    message.includes('not found') ||
    message.includes('não encontrado') ||
    message.includes('registro inexistente')
  ) {
    return 'not_found'
  }

  if (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('offline') ||
    message.includes('conexão') ||
    message.includes('abort') ||
    name.includes('aborterror')
  ) {
    return 'network'
  }

  if (
    message.includes('não configurado') ||
    message.includes('unconfigured') ||
    message.includes('sem empresa') ||
    message.includes('sem filial')
  ) {
    return 'unconfigured'
  }

  return 'unexpected'
}

interface ErrorConfig {
  icon: typeof AlertTriangle
  title: string
  description: string
  actionLabel: string
  action: (onReset?: () => void) => void
  badgeColor: string
}

const ERROR_CONFIGS: Record<ModuleErrorType, ErrorConfig> = {
  unexpected: {
    icon: AlertTriangle,
    title: 'Algo deu errado nesta seção',
    description:
      'Ocorreu uma falha inesperada ao carregar este conteúdo. Tente recarregar a seção.',
    actionLabel: 'Tentar novamente',
    action: (onReset) => onReset?.(),
    badgeColor: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  },
  unauthorized: {
    icon: ShieldAlert,
    title: 'Acesso Restrito',
    description:
      'Seu perfil atual não possui permissão para visualizar este módulo. Caso necessite de acesso, solicite ao Administrador do sistema.',
    actionLabel: 'Voltar ao Início',
    action: () => {
      if (typeof window !== 'undefined') window.location.href = '/admin'
    },
    badgeColor: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
  },
  session_expired: {
    icon: Clock,
    title: 'Sessão Expirada',
    description:
      'Sua sessão foi encerrada por tempo de inatividade ou renovação de credenciais. Faça login novamente para continuar.',
    actionLabel: 'Ir para o Login',
    action: () => {
      if (typeof window !== 'undefined') window.location.href = '/admin'
    },
    badgeColor: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  },
  unconfigured: {
    icon: Settings,
    title: 'Dados Não Configurados',
    description:
      'Este recurso requer configurações organizacionais prévias (como empresa ou filial vinculada). Procure o Administrador para completar seu cadastro.',
    actionLabel: 'Recarregar',
    action: (onReset) => onReset?.(),
    badgeColor: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  },
  network: {
    icon: WifiOff,
    title: 'Falha de Comunicação Temporária',
    description:
      'Não foi possível estabelecer contato com os servidores no momento. Verifique sua conexão e tente novamente.',
    actionLabel: 'Tentar novamente',
    action: (onReset) => onReset?.(),
    badgeColor: 'text-sky-600 bg-sky-500/10 border-sky-500/20',
  },
  not_found: {
    icon: FileQuestion,
    title: 'Registro Inexistente',
    description: 'O item ou tela solicitada não foi localizado no banco de dados ou foi removido.',
    actionLabel: 'Voltar ao Início',
    action: () => {
      if (typeof window !== 'undefined') window.location.href = '/admin'
    },
    badgeColor: 'text-stone-600 bg-stone-500/10 border-stone-500/20',
  },
}

export class ModuleErrorBoundary extends Component<
  ModuleErrorBoundaryProps,
  ModuleErrorBoundaryState
> {
  constructor(props: ModuleErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorType: 'unexpected',
      showDetails: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ModuleErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorType: classifyError(error),
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error(
      `[ModuleErrorBoundary] Falha capturada no módulo "${this.props.moduleName || 'desconhecido'}":`,
      error,
      errorInfo,
    )
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorType: 'unexpected',
      showDetails: false,
    })
    this.props.onReset?.()
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children
    }

    const type = this.props.fallbackType || this.state.errorType
    const config = ERROR_CONFIGS[type] || ERROR_CONFIGS.unexpected
    const Icon = config.icon

    return (
      <div className="w-full p-4 sm:p-6 my-2">
        <Card className="border border-border/80 shadow-sm bg-card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#005B2E] via-[#D4AF37] to-[#005B2E]" />
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div
                className={`p-3 rounded-xl border flex-shrink-0 ${config.badgeColor}`}
                aria-hidden="true"
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-foreground">{config.title}</h3>
                  {this.props.moduleName && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                      Módulo: {this.props.moduleName}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {config.description}
                </p>

                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => config.action(this.handleReset)}
                    className="bg-[#005B2E] hover:bg-[#01361D] text-white font-medium text-xs sm:text-sm h-9 px-4 rounded-lg shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    {config.actionLabel}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                    className="text-xs h-9 text-muted-foreground hover:text-foreground"
                  >
                    {this.state.showDetails ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5 mr-1" /> Ocultar diagnóstico
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 mr-1" /> Diagnóstico técnico
                      </>
                    )}
                  </Button>
                </div>

                {this.state.showDetails && (
                  <div className="mt-4 pt-3 border-t border-border/60">
                    <div className="rounded-md bg-muted/60 p-3 font-mono text-[11px] text-muted-foreground overflow-x-auto space-y-1">
                      <p className="font-semibold text-foreground">
                        {this.state.error?.name || 'Erro'}:{' '}
                        {this.state.error?.message || 'Sem mensagem'}
                      </p>
                      {this.state.error?.stack && (
                        <pre className="whitespace-pre-wrap text-[10px] leading-tight text-muted-foreground/80 max-h-36 overflow-y-auto">
                          {this.state.error.stack}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
