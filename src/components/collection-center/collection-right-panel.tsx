import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CollectionQuickActions } from './collection-quick-actions'
import { CollectionTimeline } from './collection-timeline'
import { type QueueItem } from '@/lib/collection-center-types'
import { getBlockedOrders, getRecentOrders } from '@/services/collection-center-extended'
import { Phone, Package, AlertCircle, Calendar } from 'lucide-react'

export function CollectionRightPanel({
  client,
  queueItems,
  onAction,
}: {
  client: QueueItem | null
  queueItems: QueueItem[]
  onAction: (key: string) => void
}) {
  const [blockedOrders, setBlockedOrders] = useState<any[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    if (client?.cliente) {
      getBlockedOrders(client.cliente).then(setBlockedOrders)
      getRecentOrders(client.cliente).then(setRecentOrders)
    } else {
      setBlockedOrders([])
      setRecentOrders([])
    }
  }, [client?.cliente])

  if (!client) return null
  const today = new Date().toISOString().split('T')[0]
  const promessasHoje =
    client.collectionRecord?.promise_status === 'Pendente' &&
    client.collectionRecord?.promise_date === today
  const agendaPromessas = queueItems.filter(
    (i) =>
      i.collectionRecord?.promise_date === today &&
      i.collectionRecord?.promise_status === 'Pendente',
  )
  const agendaQuebradas = queueItems.filter(
    (i) => i.collectionRecord?.promise_status === 'Quebrada',
  )
  const agendaSemContato = queueItems.filter((i) => !i.ultimoContato)

  return (
    <div className="space-y-2">
      <Card className="border-2 border-[#005B2E]/20 shadow-md p-2">
        <p className="text-xs font-bold text-[#005B2E] mb-1.5">Ações Rápidas</p>
        <CollectionQuickActions onAction={onAction} />
      </Card>

      <Card className="border-2 border-[#005B2E]/20 shadow-md p-2">
        <p className="text-xs font-bold text-[#005B2E] mb-1 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> Agenda Hoje
        </p>
        <div className="space-y-0.5 text-xs">
          {agendaPromessas.length > 0 && (
            <p className="text-blue-600">🔵 {agendaPromessas.length} promessa(s) para hoje</p>
          )}
          {agendaQuebradas.length > 0 && (
            <p className="text-red-600">🔴 {agendaQuebradas.length} promessa(s) quebrada(s)</p>
          )}
          {agendaSemContato.length > 0 && (
            <p className="text-orange-600">🟠 {agendaSemContato.length} cliente(s) sem contato</p>
          )}
          {agendaPromessas.length === 0 &&
            agendaQuebradas.length === 0 &&
            agendaSemContato.length === 0 && (
              <p className="text-muted-foreground">Nenhuma tarefa para hoje</p>
            )}
        </div>
      </Card>

      {(promessasHoje ||
        blockedOrders.length > 0 ||
        !client.ultimoContato ||
        client.collectionRecord?.promise_status === 'Quebrada' ||
        client.collectionRecord?.dispute_status === 'Aberta') && (
        <Card className="border-2 border-amber-300 shadow-md p-2">
          <p className="text-xs font-bold text-amber-600 mb-1">Alertas</p>
          <div className="space-y-0.5 text-xs">
            {promessasHoje && <p>🔵 Promessa para hoje</p>}
            {!client.ultimoContato && <p>🟠 Cliente sem contato registrado</p>}
            {blockedOrders.length > 0 && <p>🔴 {blockedOrders.length} pedido(s) bloqueado(s)</p>}
            {client.collectionRecord?.promise_status === 'Quebrada' && <p>🔴 Promessa quebrada</p>}
            {client.collectionRecord?.dispute_status === 'Aberta' && <p>🟣 Disputa pendente</p>}
          </div>
        </Card>
      )}

      <CollectionTimeline cliente={client.cliente} />

      <Card className="border-2 border-[#005B2E]/20 shadow-md p-2">
        <p className="text-xs font-bold text-[#005B2E] mb-1">Integração Comercial</p>
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" /> RCA:{' '}
            {client.collectionRecord?.next_action_responsible || '—'}
          </div>
          {blockedOrders.length > 0 && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertCircle className="w-3 h-3" /> {blockedOrders.length} pedido(s) bloqueado(s)
            </div>
          )}
          <div className="flex items-center gap-1">
            <Package className="w-3 h-3" /> {recentOrders.length} pedido(s) recente(s)
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full h-7 text-xs mt-1"
            onClick={() => onAction('escalate')}
          >
            Acionar Vendedor
          </Button>
        </div>
      </Card>
    </div>
  )
}
