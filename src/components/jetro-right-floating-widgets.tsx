import React from 'react'
import { Settings, Bot, Sparkles } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useJetroOnline } from '@/hooks/use-jetro-online'
import { useUserPreferences } from '@/hooks/use-user-preferences'
import { useAuth } from '@/hooks/use-auth'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/**
 * Abas verticais fixadas diretamente na borda direita da tela (right: 0),
 * conforme referência visual aprovada:
 * - Encaixadas / coladas à borda direita (não flutuantes afastadas)
 * - Retângulos verticais (mais altos que largos, formato gaveta)
 * - Cantos arredondados exclusivamente no lado esquerdo (rounded-l-xl)
 * - Dispostas verticalmente uma abaixo da outra:
 *     1. Jetro On-line: verde-escuro institucional (#002817) com ícone do assistente em branco.
 *     2. Personalizar: dourado (#C9A227 / #E4C46A) com ícone de engrenagem.
 * - Disponíveis EXCLUSIVAMENTE para usuários autenticados no ERP Jetro.
 * - Nunca exibidas no site público nem na tela de login deslogada.
 */
export function JetroRightFloatingWidgets() {
  const { pathname } = useLocation()
  const { isAuthenticated, loading } = useAuth()
  const { isFloatingOpen, setIsFloatingOpen } = useJetroOnline()
  const { isCustomizerOpen, setIsCustomizerOpen, preferences } = useUserPreferences()

  // Regra fundamental: visível APENAS para usuário autenticado no ERP Jetro
  if (loading || !isAuthenticated) {
    return null
  }

  // Ocultar na rota raiz pública ou caso o usuário esteja em rota pública sem contexto ERP
  if (pathname === '/') {
    return null
  }

  // Respeita preferência do usuário de redução de animações
  const reduced = preferences.reducedMotion || !preferences.animationsEnabled

  const tabTransition = reduced
    ? ''
    : 'transition-all duration-200 ease-out hover:-translate-x-1.5 active:translate-x-0'

  return (
    <aside
      aria-label="Abas Rápidas do Sistema HURAM"
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-end gap-2 pointer-events-auto select-none"
    >
      <TooltipProvider delayDuration={120}>
        {/* ============================================================== */}
        {/* 1. ABA SUPERIOR: HURAM ON-LINE (ASSISTENTE ERP)               */}
        {/*    Cor: Verde-escuro institucional (#003D30)                   */}
        {/*    Ícone: Assistente em branco com detalhe sutil               */}
        {/* ============================================================== */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setIsFloatingOpen(!isFloatingOpen)}
              aria-label="HURAM On-line"
              className={cn(
                'group relative flex flex-col items-center justify-center w-11 sm:w-12 h-20 sm:h-22 rounded-l-xl cursor-pointer border border-r-0 shadow-lg',
                'bg-gradient-to-b from-[#004A3A] via-[#003D30] to-[#002820] text-white',
                'border-[#D6A755]/40 hover:border-[#D6A755]/80 shadow-emerald-950/50',
                tabTransition,
                isFloatingOpen &&
                  'ring-2 ring-emerald-400/60 border-emerald-400 bg-[#002820] -translate-x-1 shadow-2xl',
              )}
            >
              {/* Efeito de destaque na borda esquerda */}
              <span
                className={cn(
                  'absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#D6A755] transition-opacity',
                  isFloatingOpen ? 'opacity-100' : 'opacity-80 group-hover:opacity-100',
                )}
              />

              {/* Ícone do assistente centralizado */}
              <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/10 group-hover:bg-white/15 transition-colors">
                <Bot className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white transition-transform group-hover:scale-110" />
                {/* Ponto indicador de status ativo (verde esmeralda pulsante) */}
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 border border-[#003D30]" />
                </span>
              </div>

              {/* Rótulo / Tag vertical compacta */}
              <span className="mt-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#D6A755] group-hover:text-white transition-colors">
                IA
              </span>

              {/* Sparkles sutil */}
              <Sparkles className="absolute bottom-1.5 left-2 w-2.5 h-2.5 text-[#D6A755]/60 group-hover:text-[#D6A755] transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            sideOffset={8}
            className="bg-[#003D30] text-white border border-[#D6A755]/60 shadow-2xl px-3.5 py-2 text-xs font-semibold rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>HURAM On-line</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#D6A755] text-slate-950 font-black">
                    ERP
                  </span>
                </div>
                <div className="text-[10px] text-white/70">Assistente corporativo integrado</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* ============================================================== */}
        {/* 2. ABA INFERIOR: PERSONALIZAR (CENTRAL DE PERSONALIZAÇÃO)      */}
        {/*    Cor: Dourada (#D6A755)                                      */}
        {/*    Ícone: Engrenagem escura/branca para alto contraste         */}
        {/* ============================================================== */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(!isCustomizerOpen)}
              aria-label="Personalizar HURAM"
              className={cn(
                'group relative flex flex-col items-center justify-center w-11 sm:w-12 h-20 sm:h-22 rounded-l-xl cursor-pointer border border-r-0 shadow-lg',
                'bg-gradient-to-b from-[#E8C47D] via-[#D6A755] to-[#B88636] text-[#003D30]',
                'border-[#D6A755] hover:border-[#FFF1B8] shadow-amber-950/40',
                tabTransition,
                isCustomizerOpen &&
                  'ring-2 ring-amber-300 border-white bg-[#E0B76A] -translate-x-1 shadow-2xl',
              )}
            >
              {/* Efeito de destaque na borda esquerda */}
              <span
                className={cn(
                  'absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#003D30] transition-opacity',
                  isCustomizerOpen ? 'opacity-100' : 'opacity-80 group-hover:opacity-100',
                )}
              />

              {/* Ícone de engrenagem */}
              <div className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#003D30]/15 group-hover:bg-[#003D30]/25 transition-colors">
                <Settings
                  className={cn(
                    'w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#003D30] transition-transform duration-500',
                    isCustomizerOpen ? 'rotate-90' : 'group-hover:rotate-45',
                  )}
                />
              </div>

              {/* Rótulo / Tag vertical compacta */}
              <span className="mt-1 text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#003D30] group-hover:text-black transition-colors">
                Tema
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="left"
            sideOffset={8}
            className="bg-[#003D30] text-white border border-[#D6A755]/60 shadow-2xl px-3.5 py-2 text-xs font-semibold rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[#D6A755]/20 flex items-center justify-center">
                <Settings className="w-3.5 h-3.5 text-[#D6A755]" />
              </div>
              <div className="text-left">
                <div className="font-bold text-[#D6A755]">Personalizar HURAM</div>
                <div className="text-[10px] text-white/70">Aparência, layout, textos e tabelas</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </aside>
  )
}
