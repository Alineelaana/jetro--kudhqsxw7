import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
  Bell,
  CheckCheck,
  Loader2,
  PackageX,
  TrendingDown,
  LifeBuoy,
  AlertCircle,
  MessageCircle,
} from 'lucide-react'
import {
  getNotifications,
  markNotificationAsRead,
  type Notification,
} from '@/services/notifications'
import { resolveAlert, parseAlertFromLink } from '@/services/alerts'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [resolving, setResolving] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setNotifications(await getNotifications())
    } catch {
      /* noop */
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('notifications', () => load())

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleClick = async (n: Notification) => {
    if (!n.read) await markNotificationAsRead(n.id)
    setOpen(false)
    if (n.link) navigate(n.link)
    load()
  }

  const handleResolve = async (n: Notification) => {
    const alertInfo = parseAlertFromLink(n.link)
    if (!alertInfo) return
    setResolving(n.id)
    try {
      await resolveAlert(alertInfo.type, alertInfo.id)
      if (!n.read) await markNotificationAsRead(n.id)
      toast({ title: 'Alerta resolvido' })
      load()
    } catch {
      toast({ title: 'Erro ao resolver alerta', variant: 'destructive' })
    }
    setResolving(null)
  }

  const getIcon = (n: Notification) => {
    if (n.type === 'stock_low') return <PackageX className="w-4 h-4 text-amber-600 shrink-0" />
    if (n.type === 'price_below_cost')
      return <TrendingDown className="w-4 h-4 text-red-600 shrink-0" />
    if (n.type === 'chamado_atribuido')
      return <LifeBuoy className="w-4 h-4 text-[#005B2E] shrink-0" />
    if (n.type === 'chamado_aprovacao')
      return <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
    if (n.type === 'chamado_status' || n.type === 'chamado_comunicacao')
      return <MessageCircle className="w-4 h-4 text-blue-600 shrink-0" />
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-[#005B2E]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <p className="font-bold text-sm text-[#005B2E]">Notificações</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhuma notificação</p>
          ) : (
            notifications.slice(0, 20).map((n) => {
              const alertInfo = parseAlertFromLink(n.link)
              return (
                <div
                  key={n.id}
                  className={cn(
                    'w-full text-left p-3 border-b border-border hover:bg-[#005B2E]/5 transition-colors',
                    !n.read && 'bg-[#005B2E]/5',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-[#005B2E] mt-1.5 shrink-0" />
                    )}
                    {n.read && <div className="w-2 shrink-0" />}
                    {getIcon(n)}
                    <button className="flex-1 min-w-0 text-left" onClick={() => handleClick(n)}>
                      <p className="text-sm font-semibold text-foreground">{n.title}</p>
                      {n.message && (
                        <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(n.created).toLocaleString('pt-BR')}
                      </p>
                    </button>
                    {alertInfo && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResolve(n)}
                        disabled={resolving === n.id}
                        className="text-[#005B2E] hover:bg-[#005B2E]/10 h-7 px-2 shrink-0"
                        title="Resolver alerta"
                      >
                        {resolving === n.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCheck className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
