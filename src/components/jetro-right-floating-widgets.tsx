import React from 'react'
import { Settings, Bot, Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useJetroOnline } from '@/hooks/use-jetro-online'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/**
 * Widgets flutuantes fixados na lateral direita do ERP e da rota /site:
 * - Botão superior: "Personalizar Jetro" (ícone engrenagem), abre a Central de Personalização em gaveta lateral.
 * - Botão inferior: "Jetro On-line" (ícone robô/assistente), abre o painel lateral de conversação inteligente.
 *
 * Características:
 * - Empilhados verticalmente sem sobreposição
 * - Identidade visual premium Jetro (fundo verde-escuro #002817 / #00140b, bordas e detalhes em dourado #C9A227 / #E4C46A)
 * - Posicionados no canto direito (right-4 ou right-5, centralizados/inferiores seguros sem colidir com cabeçalhos ou sinos)
 * - Totalmente responsivos e com transições suaves
 */
export function JetroRightFloatingWidgets() {
  const { pathname } = useLocation()
  const { isFloatingOpen, setIsFloatingOpen } = useJetroOnline()
  const { isCustomizerOpen, setIsCustomizerOpen, preferences } = useUserPreferences()

  // Respeita preferência do usuário de desativar animações
  const animClasses =
    preferences.reducedMotion || !preferences.animationsEnabled
      ? ''
      : 'transition-all duration-300 hover:scale-105 active:scale-95'

  // Ocultar apenas na tela de login raiz ('/') se desejado, mantendo ativo em /site e no ERP
  if (pathname === '/') {
    return null
  }

  return (
    <aside
      aria-label="Atalhos Flutuantes Jetro"
      className="fixed right-3 sm:right-4 md:right-5 bottom-6 z-40 flex flex-col items-center gap-2.5 pointer-events-auto select-none"
    >
      <TooltipProvider delayDuration={150}>
        {/* ============================================================== */}
        {/* 1. BOTÃO SUPERIOR: PERSONALIZAR JETRO                          */}
        {/* ============================================================== */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
              aria-label="Personalizar Jetro"
              className={cn(
                'group relative flex items-center justify-center w-12 h-12 rounded-2xl shadow-xl cursor-pointer border',
                animClasses,
                isCustomizerOpen
                  ? 'bg-[#C9A227] text-[#002817] border-[#E4C46A] shadow-amber-500/20 ring-2 ring-[#C9A227]/40'
                  : 'bg-gradient-to-b from-[#00381C] to-[#001f0f] text-[#E4C46A] hover:text-white border-[#C9A227]/50 hover:border-[#C9A227] shadow-emerald-950/40',
              )}
            >
              <Settings
                className={cn(
                  'w-5 h-5 transition-transform duration-500',
                  isCustomizerOpen ? 'rotate-90' : 'group-hover:rotate-45',
                )}
              />
              {/* Brilho dourado sutil no hover */}
              <span className="absolute inset-0 rounded-2xl bg-[#C9A227]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            sideOffset={10}
            className="bg-[#002817] text-[#E4C46A] border border-[#C9A227]/50 shadow-xl px-3 py-1.5 text-xs font-semibold rounded-lg"
          >
            <div className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-[#E4C46A]" />
              <span>Personalizar Jetro</span>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* ============================================================== */}
        {/* 2. BOTÃO INFERIOR: JETRO ON-LINE (ASSISTENTE INTELIGENTE)       */}
        {/* ============================================================== */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setIsFloatingOpen(!isFloatingOpen)}
              aria-label="Jetro On-line"
              className={cn(
                'group relative flex items-center justify-center w-12 h-12 rounded-2xl shadow-xl cursor-pointer border',
                animClasses,
                isFloatingOpen
                  ? 'bg-[#C9A227] text-[#002817] border-[#E4C46A] shadow-amber-500/20 ring-2 ring-[#C9A227]/40'
                  : 'bg-gradient-to-b from-[#00381C] to-[#001f0f] text-[#E4C46A] hover:text-white border-[#C9A227]/50 hover:border-[#C9A227] shadow-emerald-950/40',
              )}
            >
              <Bot className="w-5 h-5" />
              {/* Ponto indicador de status ativo (verde esmeralda / pulsar) */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-[#002817]" />
              </span>
              <Sparkles className="absolute bottom-1 right-1 w-2.5 h-2.5 text-[#E4C46A] opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            sideOffset={10}
            className="bg-[#002817] text-[#E4C46A] border border-[#C9A227]/50 shadow-xl px-3 py-1.5 text-xs font-semibold rounded-lg"
          >
            <div className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#E4C46A]" />
              <span>Jetro On-line</span>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </aside>
  )
}
