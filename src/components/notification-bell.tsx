import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'
import {
  getNotifications,
  markNotificationAsRead,
  type Notification,
} from '@/services/notifications'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

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
            notifications.slice(0, 20).map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  'w-full text-left p-3 border-b border-border hover:bg-[#005B2E]/5 transition-colors',
                  !n.read && 'bg-[#005B2E]/5',
                )}
              >
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#005B2E] mt-1.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.created).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
