import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTour } from '@/lib/tours/tour-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react'

export function JetroTourOverlay() {
  const {
    activeTour,
    currentStepIndex,
    totalSteps,
    currentStep,
    targetRect,
    isSelectorMissing,
    nextStep,
    prevStep,
    skipTour,
    finishTour,
    goToStep,
  } = useTour()

  // Atalhos de teclado: Esc (sair), Direita (avançar), Esquerda (voltar)
  useEffect(() => {
    if (!activeTour) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipTour()
      } else if (e.key === 'ArrowRight') {
        nextStep()
      } else if (e.key === 'ArrowLeft') {
        prevStep()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTour, nextStep, prevStep, skipTour])

  if (!activeTour || !currentStep) return null

  const isLastStep = currentStepIndex === totalSteps - 1
  const isFirstStep = currentStepIndex === 0

  // Cálculo da posição do popover com safe viewport bounding
  const popoverWidth = Math.min(420, window.innerWidth - 32)
  let popoverTop = 0
  let popoverLeft = 0
  let placement: 'top' | 'bottom' | 'left' | 'right' | 'center' = currentStep.posicao || 'bottom'

  if (!targetRect || isSelectorMissing) {
    // Se o elemento não for encontrado na tela, centralizar modal com elegância
    placement = 'center'
    popoverTop = Math.max(30, (window.innerHeight - 280) / 2)
    popoverLeft = Math.max(16, (window.innerWidth - popoverWidth) / 2)
  } else {
    const margin = 16
    const estimatedHeight = 260

    if (placement === 'bottom') {
      popoverTop = targetRect.bottom + margin
      popoverLeft = targetRect.left + (targetRect.width - popoverWidth) / 2

      // Viewport bounds correction
      if (popoverTop + estimatedHeight > window.innerHeight - 20) {
        placement = 'top'
        popoverTop = Math.max(20, targetRect.top - estimatedHeight - margin)
      }
    } else if (placement === 'top') {
      popoverTop = Math.max(20, targetRect.top - estimatedHeight - margin)
      popoverLeft = targetRect.left + (targetRect.width - popoverWidth) / 2
    } else if (placement === 'left') {
      popoverTop = targetRect.top + (targetRect.height - estimatedHeight) / 2
      popoverLeft = Math.max(16, targetRect.left - popoverWidth - margin)
    } else if (placement === 'right') {
      popoverTop = targetRect.top + (targetRect.height - estimatedHeight) / 2
      popoverLeft = targetRect.right + margin
      if (popoverLeft + popoverWidth > window.innerWidth - 16) {
        placement = 'bottom'
        popoverTop = targetRect.bottom + margin
        popoverLeft = targetRect.left
      }
    }

    // Correção horizontal para não vazar da tela
    if (popoverLeft < 16) popoverLeft = 16
    if (popoverLeft + popoverWidth > window.innerWidth - 16) {
      popoverLeft = window.innerWidth - popoverWidth - 16
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-auto">
      {/* 1. Backdrop escurecido com recorte visual (clipping hole) no elemento destacado */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-auto transition-opacity duration-300"
        style={{ background: 'transparent' }}
      >
        <defs>
          <mask id="tour-mask">
            {/* Máscara branca cobre tudo */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Recorte preto suave sobre o elemento destacado */}
            {targetRect && !isSelectorMissing && (
              <rect
                x={targetRect.left - 6}
                y={targetRect.top - 6}
                width={targetRect.width + 12}
                height={targetRect.height + 12}
                rx="8"
                ry="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Camada escurecida suave */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 15, 8, 0.72)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* 2. Borda pulsante e dourada ao redor do elemento em foco */}
      {targetRect && !isSelectorMissing && (
        <div
          className="absolute pointer-events-none rounded-lg border-2 border-[#C9A227] shadow-[0_0_20px_rgba(201,162,39,0.5)] z-[100000] animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* 3. Popover explicativo Jetro (Verde #005B2E + Dourado #C9A227 + Branco) */}
      <AnimatePresence mode="wait">
        <div
          key={`tour-step-${currentStepIndex}`}
          className="absolute z-[100001] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: `${popoverTop}px`,
            left: `${popoverLeft}px`,
            width: `${popoverWidth}px`,
          }}
        >
          {/* Barra superior com identidade visual Jetro */}
          <div className="bg-[#005B2E] text-white px-4 py-3 flex items-center justify-between border-b border-[#004824]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#C9A227] flex items-center justify-center text-[#00381B] font-bold text-xs shadow-inner">
                <Compass className="w-4 h-4 text-[#00381B]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                  Tour Jetro • {activeTour.modulo || 'Módulo'}
                </span>
                <span className="text-sm font-bold truncate max-w-[240px]">
                  {activeTour.titulo}
                </span>
              </div>
            </div>

            <button
              onClick={skipTour}
              aria-label="Fechar tour"
              className="text-white/70 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Conteúdo da Etapa */}
          <div className="p-4 flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="bg-emerald-50 text-[#005B2E] border-emerald-300 font-semibold text-xs px-2.5 py-0.5"
              >
                Etapa {currentStepIndex + 1} de {totalSteps}
              </Badge>

              {/* Indicadores de bolinha com clique direto */}
              <div className="flex items-center gap-1">
                {activeTour.etapas.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToStep(idx)}
                    aria-label={`Ir para etapa ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStepIndex
                        ? 'w-6 bg-[#C9A227]'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Aviso quando o elemento específico estiver recolhido ou indisponível */}
            {isSelectorMissing && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  O elemento apontado por esta etapa não está visível neste instante (pode estar
                  recolhido ou numa aba inativa). Você pode continuar normalmente.
                </span>
              </div>
            )}

            <div>
              <h4 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C9A227]" />
                {currentStep.titulo}
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {currentStep.texto}
              </p>
            </div>

            {/* Dica interativa opcional */}
            {currentStep.dicaInterativa && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2 text-xs text-slate-600">
                <HelpCircle className="w-4 h-4 text-[#005B2E] shrink-0 mt-0.5" />
                <span className="font-medium text-slate-700">{currentStep.dicaInterativa}</span>
              </div>
            )}
          </div>

          {/* Rodapé com Navegação */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={skipTour}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium underline underline-offset-4"
            >
              Pular tour
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={isFirstStep}
                className="h-8 px-2.5 text-xs text-slate-700"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Anterior
              </Button>

              {isLastStep ? (
                <Button
                  size="sm"
                  onClick={finishTour}
                  className="h-8 px-3.5 text-xs bg-[#005B2E] hover:bg-[#004824] text-white font-semibold shadow-sm"
                >
                  Concluir Tour
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="h-8 px-3.5 text-xs bg-[#005B2E] hover:bg-[#004824] text-white font-semibold shadow-sm"
                >
                  Próxima
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </AnimatePresence>
    </div>
  )
}
