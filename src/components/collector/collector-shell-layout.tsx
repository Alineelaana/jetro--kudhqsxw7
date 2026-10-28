import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Clock,
  LogOut,
  Smartphone,
  ChevronLeft,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/custom_hooks/useAuth'
import {
  getLocalActiveShift,
  getOfflineQueue,
  syncOfflineQueue,
  getStoredDevice,
  playAudioFeedback,
} from '@/services/collector'

interface CollectorShellLayoutProps {
  title: string
  subtitle?: string
  backRoute?: string
  children: React.ReactNode
}

export const CollectorShellLayout: React.FC<CollectorShellLayoutProps> = ({
  title,
  subtitle,
  backRoute = '/admin/coletor',
  children,
}) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const activeShift = getLocalActiveShift()
  const device = getStoredDevice()

  const refreshQueue = () => {
    const q = getOfflineQueue()
    setPendingCount(q.length)
  }

  useEffect(() => {
    refreshQueue()
    const handleOnline = () => {
      setIsOnline(true)
      handleSync()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    const interval = setInterval(refreshQueue, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const handleSync = async () => {
    if (!navigator.onLine || isSyncing) return
    setIsSyncing(true)
    try {
      const res = await syncOfflineQueue()
      if (res.synced > 0 && soundEnabled) {
        playAudioFeedback('success')
      }
      refreshQueue()
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans select-none">
      {/* Top Header do Coletor - Otimizado para Toque e Visibilidade */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-emerald-800/40 shadow-md">
        <div className="flex items-center gap-2">
          {backRoute && (
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 active:scale-95"
              onClick={() => navigate(backRoute)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base md:text-lg text-emerald-400 tracking-wide uppercase">
                {title}
              </span>
              {activeShift ? (
                <Badge className="bg-emerald-600/30 text-emerald-300 border-emerald-500/40 text-xs px-2 py-0.5">
                  Turno Ativo
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs px-2 py-0.5">
                  Sem Turno
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-md">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Status Indicators: Rede, Fila Offline, Som, Dispositivo */}
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Badge
              variant="outline"
              className="bg-emerald-950/40 text-emerald-400 border-emerald-600/40 flex items-center gap-1 text-xs px-2 py-1"
            >
              <Wifi className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Online</span>
            </Badge>
          ) : (
            <Badge
              variant="destructive"
              className="flex items-center gap-1 text-xs px-2 py-1 animate-pulse"
            >
              <WifiOff className="h-3.5 w-3.5" />
              <span>Offline</span>
            </Badge>
          )}

          {pendingCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing || !isOnline}
              className="h-8 bg-amber-950/40 text-amber-300 border-amber-600/50 hover:bg-amber-900/60 text-xs px-2 flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
              </span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-slate-400 hover:text-slate-100"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Silenciar bipes' : 'Ativar bipes'}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <VolumeX className="h-4 w-4 text-slate-500" />
            )}
          </Button>
        </div>
      </header>

      {/* Barra de Contexto do Operador & Dispositivo */}
      <div className="px-3 py-1.5 bg-slate-900/70 border-b border-slate-800 text-xs flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
            <strong className="text-slate-300">{device?.codigo || 'Coletor 01'}</strong>
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="truncate max-w-[140px] sm:max-w-xs text-slate-300 font-medium">
            {user?.name || user?.email || 'Operador'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {activeShift && (
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3 text-emerald-400" />
              {new Date(activeShift.data_inicio).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/coletor/turno')}
            className="h-6 text-[11px] px-2 text-slate-400 hover:text-emerald-300"
          >
            {activeShift ? 'Fechar Turno' : 'Abrir Turno'}
            <LogOut className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Conteúdo Central Otimizado para Dispositivos e Telas Pequenas */}
      <main className="flex-1 p-3 overflow-y-auto max-w-4xl w-full mx-auto">{children}</main>
    </div>
  )
}
