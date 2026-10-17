import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Clock, AlertTriangle, LogOut } from 'lucide-react'

// Intervalos de verificação e contagem
const CHECK_INTERVAL_MS = 1000
const WARNING_WINDOW_SECONDS = 30
const DEFAULT_TIMEOUT_MINUTES = 5

export function InactivityTracker() {
  const { isAuthenticated, user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Tempo de inatividade configurado para o usuário (em minutos)
  const timeoutMinutes =
    typeof user?.inactivity_timeout_minutes === 'number' && user.inactivity_timeout_minutes > 0
      ? user.inactivity_timeout_minutes
      : DEFAULT_TIMEOUT_MINUTES

  const totalTimeoutSeconds = timeoutMinutes * 60

  const [warningOpen, setWarningOpen] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(WARNING_WINDOW_SECONDS)

  // Armazena timestamp do último evento de interação
  const lastActivityRef = useRef<number>(Date.now())
  const hasLoggedOutRef = useRef<boolean>(false)

  // Reset da inatividade chamado a cada evento do usuário
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    if (warningOpen) {
      setWarningOpen(false)
    }
  }, [warningOpen])

  // Reset de estado quando o usuário muda de sessão
  useEffect(() => {
    if (isAuthenticated) {
      lastActivityRef.current = Date.now()
      hasLoggedOutRef.current = false
      setWarningOpen(false)
    }
  }, [isAuthenticated, user?.id])

  // Não monitorar inatividade na tela de login
  const isLoginPage = location.pathname === '/' || location.pathname === '/login'

  // Efeito para escutar eventos de interação real do usuário
  useEffect(() => {
    if (!isAuthenticated || isLoginPage) return

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    let throttleTimer: ReturnType<typeof setTimeout> | null = null

    const handleUserActivity = () => {
      // Pequeno throttle de 500ms para evitar chamadas excessivas em mousemove/scroll intenso
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          throttleTimer = null
        }, 500)
        // Só atualiza lastActivity se o modal de aviso não estiver ativo
        // (quando o modal de aviso está aberto, exige ação deliberada no botão "Continuar conectado")
        if (!warningOpen) {
          lastActivityRef.current = Date.now()
        }
      }
    }

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleUserActivity, { passive: true })
    })

    return () => {
      if (throttleTimer) clearTimeout(throttleTimer)
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleUserActivity)
      })
    }
  }, [isAuthenticated, isLoginPage, warningOpen])

  // Logout por inatividade com redirecionamento e mensagem explicativa
  const handleLogoutDueToInactivity = useCallback(() => {
    if (hasLoggedOutRef.current) return
    hasLoggedOutRef.current = true
    setWarningOpen(false)
    signOut()
    navigate('/', {
      replace: true,
      state: {
        inactivityMessage:
          'Sessão encerrada por inatividade. Por motivos de segurança, realize o login novamente.',
      },
    })
  }, [signOut, navigate])

  // Efeito de contagem e checagem periódica do tempo ocioso
  useEffect(() => {
    if (!isAuthenticated || isLoginPage) {
      if (warningOpen) setWarningOpen(false)
      return
    }

    const interval = setInterval(() => {
      const now = Date.now()
      const idleSeconds = Math.floor((now - lastActivityRef.current) / 1000)
      const remaining = totalTimeoutSeconds - idleSeconds

      if (remaining <= 0) {
        // Tempo expirado
        handleLogoutDueToInactivity()
      } else if (remaining <= WARNING_WINDOW_SECONDS) {
        // Janela de aviso (últimos 30 segundos)
        setSecondsRemaining(remaining)
        setWarningOpen(true)
      } else {
        // Ainda dentro do período seguro
        if (warningOpen) {
          setWarningOpen(false)
        }
      }
    }, CHECK_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isAuthenticated, isLoginPage, totalTimeoutSeconds, warningOpen, handleLogoutDueToInactivity])

  // Handler para quando o usuário clica em "Continuar conectado" no aviso prévio
  const handleStayConnected = () => {
    lastActivityRef.current = Date.now()
    setWarningOpen(false)
    setSecondsRemaining(WARNING_WINDOW_SECONDS)
  }

  // Handler para encerramento imediato pelo usuário no modal
  const handleManualLogout = () => {
    setWarningOpen(false)
    signOut()
    navigate('/', { replace: true })
  }

  if (!isAuthenticated || isLoginPage) {
    return null
  }

  return (
    <Dialog open={warningOpen} onOpenChange={(open) => !open && handleStayConnected()}>
      <DialogContent className="sm:max-w-[440px] border-2 border-[#C89B3C] shadow-2xl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <DialogTitle className="text-center text-lg font-bold text-foreground">
            Aviso de Inatividade
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-muted-foreground">
            Você está inativo há quase{' '}
            <strong className="text-foreground">{timeoutMinutes} minuto(s)</strong>. Por motivos de
            segurança, sua sessão será encerrada automaticamente em:
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center gap-3">
          <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 animate-spin" />
          <span className="text-3xl font-black text-amber-700 dark:text-amber-400 font-mono tracking-wider">
            00:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
          </span>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Clique no botão abaixo para continuar sua sessão ou encerre agora.
        </p>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleManualLogout}
            className="w-full sm:w-auto text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" /> Encerrar agora
          </Button>
          <Button
            type="button"
            onClick={handleStayConnected}
            className="w-full sm:flex-1 bg-[#005B2E] hover:bg-[#01361D] text-white font-bold shadow-md"
          >
            Continuar conectado
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
