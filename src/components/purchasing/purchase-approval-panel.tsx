import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  getPurchaseRequests,
  getPurchaseOrders,
  updatePurchaseRequest,
  updatePurchaseOrder,
} from '@/services/purchasing'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import {
  STATUS_COLORS,
  type PurchaseRequest,
  type PurchaseOrder,
  type HistoryEntry,
} from '@/lib/purchasing-types'
import { Check, X, AlertCircle, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface ApprovalItem {
  id: string
  type: 'request' | 'order'
  request_number: string
  order_number: string
  requester: string
  supplier_name: string
  total_value: string
  created: string
  status: string
  history: HistoryEntry[]
}

export function PurchaseApprovalPanel() {
  const { user } = useAuth()
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<'reject' | 'adjust'>('reject')
  const [dialogItem, setDialogItem] = useState<ApprovalItem | null>(null)
  const [justification, setJustification] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [reqs, orders] = await Promise.all([getPurchaseRequests(), getPurchaseOrders()])
      const pending: ApprovalItem[] = []
      ;(reqs as unknown as PurchaseRequest[]).forEach((r) => {
        if (r.status === 'Aguardando Aprovação')
          pending.push({
            id: r.id,
            type: 'request',
            request_number: r.request_number,
            order_number: '—',
            requester: r.requester,
            supplier_name: '—',
            total_value: '—',
            created: r.created,
            status: r.status,
            history: r.history || [],
          })
      })
      ;(orders as unknown as PurchaseOrder[]).forEach((o) => {
        if (o.status === 'Aguardando Aprovação')
          pending.push({
            id: o.id,
            type: 'order',
            request_number: '—',
            order_number: o.order_number,
            requester: o.buyer,
            supplier_name: o.supplier_name,
            total_value: o.total_value,
            created: o.created,
            status: o.status,
            history: o.history || [],
          })
      })
      setItems(pending)
    } catch {
      setItems([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('purchase_orders', () => load())
  useRealtime('purchase_requests', () => load())

  const handleApprove = async (item: ApprovalItem) => {
    const history = [
      ...item.history,
      {
        action: 'Aprovado',
        user: (user?.name as string) || '',
        date: new Date().toISOString(),
        note: '',
      },
    ]
    try {
      if (item.type === 'request')
        await updatePurchaseRequest(item.id, { status: 'Aprovada', history })
      else await updatePurchaseOrder(item.id, { status: 'Aprovado', history })
      toast.success('Item aprovado')
      load()
    } catch {
      toast.error('Erro ao aprovar')
    }
  }

  const openDialog = (item: ApprovalItem, action: 'reject' | 'adjust') => {
    setDialogItem(item)
    setDialogAction(action)
    setJustification('')
    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    if (!justification.trim()) {
      toast.error('Justificativa é obrigatória')
      return
    }
    setSaving(true)
    const isReject = dialogAction === 'reject'
    const actionLabel = isReject ? 'Reprovado' : 'Solicitar Ajustes'
    const newStatus = isReject
      ? dialogItem!.type === 'request'
        ? 'Reprovada'
        : 'Cancelado'
      : 'Rascunho'
    const history = [
      ...(dialogItem!.history || []),
      {
        action: actionLabel,
        user: (user?.name as string) || '',
        date: new Date().toISOString(),
        note: justification,
      },
    ]
    try {
      if (dialogItem!.type === 'request')
        await updatePurchaseRequest(dialogItem!.id, { status: newStatus, history })
      else await updatePurchaseOrder(dialogItem!.id, { status: newStatus, history })
      toast.success(isReject ? 'Item reprovado' : 'Ajustes solicitados')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao processar')
    }
    setSaving(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">Aprovação de Compras</h3>
      {items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum item aguardando aprovação.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Nº Solicitação</th>
                  <th className="text-left px-3 py-3 font-bold">Nº Pedido</th>
                  <th className="text-left px-3 py-3 font-bold">Solicitante</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Fornecedor</th>
                  <th className="text-left px-3 py-3 font-bold">Valor Total</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Data</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={`${item.type}-${item.id}`}
                    className="border-b border-border hover:bg-[#005B2E]/5"
                  >
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {item.request_number}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        {item.order_number}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium">{item.requester || '—'}</td>
                    <td className="px-3 py-3 hidden md:table-cell">{item.supplier_name || '—'}</td>
                    <td className="px-3 py-3 font-bold">
                      {item.total_value !== '—' ? `R$ ${item.total_value}` : '—'}
                    </td>
                    <td className="px-3 py-3 text-xs hidden sm:table-cell">
                      {item.created ? new Date(item.created).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${STATUS_COLORS[item.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApprove(item)}
                          className="text-emerald-600 hover:bg-emerald-50"
                          title="Aprovar"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDialog(item, 'reject')}
                          className="text-red-600 hover:bg-red-50"
                          title="Reprovar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openDialog(item, 'adjust')}
                          className="text-amber-600 hover:bg-amber-50"
                          title="Solicitar Ajustes"
                        >
                          <AlertCircle className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'reject' ? 'Reprovar Item' : 'Solicitar Ajustes'}
            </DialogTitle>
          </DialogHeader>
          <div>
            <Label className="text-xs">
              {dialogAction === 'reject' ? 'Justificativa (obrigatório)' : 'Observação'}
            </Label>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="focus-visible:ring-[#005B2E]"
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
