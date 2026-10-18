import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import type { JetroTour, JetroTourStep } from '@/services/jetro-online'
import {
  getJetroTourForRoute,
  recordTourExecution,
  updateTourExecution,
} from '@/services/jetro-online'
import { JETRO_TOURS_CATALOG } from '@/lib/tours/tours-catalog'

interface TourContextType {
  activeTour: JetroTour | null
  currentStepIndex: number
  totalSteps: number
  currentStep: JetroTourStep | null
  targetRect: DOMRect | null
  isSelectorMissing: boolean
  availableTourForCurrentRoute: JetroTour | null
  startTour: (tour?: JetroTour) => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (index: number) => void
  skipTour: () => void
  finishTour: () => void
  validateTourSelectors: (tour: JetroTour) => {
    isValid: boolean
    missingStepIndex?: number
    missingSelector?: string
  }
}

const TourContext = createContext<TourContextType | null>(null)

export function TourProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [activeTour, setActiveTour] = useState<JetroTour | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isSelectorMissing, setIsSelectorMissing] = useState(false)
  const [availableTour, setAvailableTour] = useState<JetroTour | null>(null)

  // Tracking de auditoria da execução atual
  const executionIdRef = useRef<string | null>(null)
  const startTimeRef = useRef<number>(0)

  // Carrega ou detecta se há tour para a rota atual
  useEffect(() => {
    let isMounted = true
    const checkRoute = async () => {
      const tour = await getJetroTourForRoute(location.pathname)
      if (isMounted) {
        setAvailableTour(tour)
      }
    }
    checkRoute()
    return () => {
      isMounted = false
    }
  }, [location.pathname])

  // Validador de seletores
  const validateTourSelectors = useCallback(
    (
      tour: JetroTour,
    ): { isValid: boolean; missingStepIndex?: number; missingSelector?: string } => {
      for (let i = 0; i < tour.etapas.length; i++) {
        const step = tour.etapas[i]
        if (step.seletor) {
          try {
            const el = document.querySelector(step.seletor)
            if (!el) {
              return { isValid: false, missingStepIndex: i + 1, missingSelector: step.seletor }
            }
          } catch {
            return { isValid: false, missingStepIndex: i + 1, missingSelector: step.seletor }
          }
        }
      }
      return { isValid: true }
    },
    [],
  )

  // Atualiza a posição do elemento alvo a cada etapa ou scroll/resize
  const updateTargetRect = useCallback(() => {
    if (!activeTour) {
      setTargetRect(null)
      setIsSelectorMissing(false)
      return
    }

    const step = activeTour.etapas[currentStepIndex]
    if (!step || !step.seletor) {
      setTargetRect(null)
      setIsSelectorMissing(false)
      return
    }

    try {
      const element = document.querySelector(step.seletor)
      if (element) {
        // Scroll suave até o elemento com margem de segurança
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
        setIsSelectorMissing(false)
      } else {
        setTargetRect(null)
        setIsSelectorMissing(true)
      }
    } catch {
      setTargetRect(null)
      setIsSelectorMissing(true)
    }
  }, [activeTour, currentStepIndex])

  // Recalcula o rect periodicamente enquanto o tour estiver ativo (suporta abas e animações)
  useEffect(() => {
    if (!activeTour) return

    updateTargetRect()
    const handleResize = () => updateTargetRect()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleResize, true)

    const timer = setTimeout(updateTargetRect, 300)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleResize, true)
      clearTimeout(timer)
    }
  }, [activeTour, currentStepIndex, updateTargetRect])

  const startTour = useCallback(
    async (customTour?: JetroTour) => {
      const tourToStart = customTour || availableTour
      if (!tourToStart || tourToStart.etapas.length === 0) return

      setActiveTour(tourToStart)
      setCurrentStepIndex(0)
      startTimeRef.current = Date.now()

      // Registrar início no banco de dados para métricas de auditoria
      try {
        const execId = await recordTourExecution({
          tour_id: tourToStart.id,
          tour_titulo: tourToStart.titulo,
          rota: tourToStart.rota || location.pathname,
          modulo: tourToStart.modulo || 'Geral',
          status: 'iniciado',
          etapa_final: 1,
          total_etapas: tourToStart.etapas.length,
        })
        executionIdRef.current = execId
      } catch {
        /* silencioso em caso de falha de rede */
      }
    },
    [availableTour, location.pathname],
  )

  const finishTour = useCallback(async () => {
    if (!activeTour) return
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)

    if (executionIdRef.current) {
      await updateTourExecution(executionIdRef.current, {
        status: 'concluido',
        etapa_final: activeTour.etapas.length,
        tempo_segundos: duration,
      })
    }

    setActiveTour(null)
    setCurrentStepIndex(0)
    setTargetRect(null)
  }, [activeTour])

  const skipTour = useCallback(async () => {
    if (!activeTour) return
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000)

    if (executionIdRef.current) {
      await updateTourExecution(executionIdRef.current, {
        status: 'interrompido',
        etapa_final: currentStepIndex + 1,
        tempo_segundos: duration,
        observacoes: `Interrompido pelo usuário na etapa ${currentStepIndex + 1} de ${activeTour.etapas.length}`,
      })
    }

    setActiveTour(null)
    setCurrentStepIndex(0)
    setTargetRect(null)
  }, [activeTour, currentStepIndex])

  const nextStep = useCallback(() => {
    if (!activeTour) return
    if (currentStepIndex < activeTour.etapas.length - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    } else {
      finishTour()
    }
  }, [activeTour, currentStepIndex, finishTour])

  const prevStep = useCallback(() => {
    if (!activeTour) return
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }, [activeTour, currentStepIndex])

  const goToStep = useCallback(
    (index: number) => {
      if (!activeTour) return
      if (index >= 0 && index < activeTour.etapas.length) {
        setCurrentStepIndex(index)
      }
    },
    [activeTour],
  )

  const currentStep = activeTour ? activeTour.etapas[currentStepIndex] || null : null

  return (
    <TourContext.Provider
      value={{
        activeTour,
        currentStepIndex,
        totalSteps: activeTour ? activeTour.etapas.length : 0,
        currentStep,
        targetRect,
        isSelectorMissing,
        availableTourForCurrentRoute: availableTour,
        startTour,
        nextStep,
        prevStep,
        goToStep,
        skipTour,
        finishTour,
        validateTourSelectors,
      }}
    >
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour deve ser utilizado dentro de um TourProvider')
  }
  return context
}
