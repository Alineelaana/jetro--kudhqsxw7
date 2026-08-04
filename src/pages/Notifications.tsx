import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, ArrowLeft, Check, X, FileText, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getUnifiedNotifications,
  resolveUnifiedNotification,
  markUnifiedAsRead,
  type UnifiedNotification,
} from '@/services/unified-notifications'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'

const typeConfig: Record<string, { label: string; color: string; icon: typeof Bell }> = {
  approval: { label: 'Aprovação', color: 'bg-amber-100 text-amber-700', icon: FileText },
  expiration: { label: 'Expiração', color: 'bg-red-100 text-red-700', icon: Clock },
  system: { label: 'Sistema', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
}

export default function Notifications() {
  const navigate = useNavigate()
  const [items, setItems] = useState<UnifiedNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const load = useCallback(async () => {
    try {
      setItems(await getUnifiedNotifications())
    } catch {
      setItems([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('pricing_approvals', () => load())
  useRealtime('notifications', () => load())
  useRealtime('price_tables', () => load())

  const filtered = items.filter((n) => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false
    if (statusFilter === 'unread' && n.read) return false
    if (statusFilter === 'read' && !n.read) return false
    if (statusFilter === 'resolved' && !n.resolved) return false
    return true
  })

  const handleRead = async (n: UnifiedNotification) => {
    await markUnifiedAsRead(n)
    toast({ title: 'Marcado como lido' })
    load()
  }

  const handleResolve = async (n: UnifiedNotification, action: 'approve' | 'reject') => {
    try {
      await resolveUnifiedNotification(n, action)
      toast({ title: action === 'approve' ? 'Aprovação concedida' : 'Aprovação rejeitada' })
      load()
    } catch {
      toast({ title: 'Erro ao resolver', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Bell className="w-8 h-8 text-[#005B2E] animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#005B2E]" />
          <h1 className="text-2xl font-black text-foreground">Notificações</h1>
        </div>
        <Link to="/admin">
          <Button variant="outline" className="border-[#005B2E] text-[#005B2E] font-bold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Button>
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['all', 'approval', 'expiration', 'system'].map((t) => (
          <Button
            key={t}
            size="sm"
            variant={typeFilter === t ? 'default' : 'outline'}
            className={cn(
              typeFilter === t ? 'bg-[#005B2E] text-white' : 'border-[#005B2E]/30 text-[#005B2E]',
            )}
            onClick={() => setTypeFilter(t)}
          >
            {t === 'all' ? 'Todas' : typeConfig[t]?.label || t}
          </Button>
        ))}
        <div className="w-px h-8 bg-border mx-1" />
        {['all', 'unread', 'read', 'resolved'].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? 'default' : 'outline'}
            className={cn(
              statusFilter === s ? 'bg-[#005B2E] text-white' : 'border-[#005B2E]/30 text-[#005B2E]',
            )}
            onClick={() => setStatusFilter(s)}
          >
            {s === 'all'
              ? 'Todos'
              : s === 'unread'
                ? 'Não lidas'
                : s === 'read'
                  ? 'Lidas'
                  : 'Resolvidas'}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Nenhuma notificação encontrada.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((n) => {
            const cfg = typeConfig[n.type]
            const Icon = cfg?.icon || Bell
            return (
              <Card
                key={n.id}
                className={cn(
                  'border-l-4',
                  !n.read && 'bg-[#005B2E]/5',
                  n.type === 'approval' && 'border-l-amber-400',
                  n.type === 'expiration' && 'border-l-red-400',
                  n.type === 'system' && 'border-l-blue-400',
                )}
              >
                <CardContent className="p-3 flex items-start gap-3">
                  <Icon className="w-4 h-4 mt-0.5 shrink-0 text-[#005B2E]" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn('text-xs font-bold px-2 py-0.5 rounded', cfg?.color)}>
                        {cfg?.label}
                      </span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[#005B2E]" />}
                      {n.resolved && (
                        <span className="text-xs font-bold text-emerald-600">Resolvido</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {n.created ? new Date(n.created).toLocaleString('pt-BR') : '—'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {!n.read && n.type === 'system' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[#005B2E]"
                        onClick={() => handleRead(n)}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {n.type === 'approval' && !n.resolved && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-emerald-600 hover:bg-emerald-50"
                          onClick={() => handleResolve(n, 'approve')}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-red-600 hover:bg-red-50"
                          onClick={() => handleResolve(n, 'reject')}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                    {n.link && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[#005B2E]"
                        onClick={() => navigate(n.link!)}
                      >
                        →
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
