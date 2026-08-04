import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getApprovals,
  updateApproval,
  getPricingConfigs,
  updatePricingConfig,
  createPricingHistory,
} from '@/services/pricing'
import { updateProduct } from '@/services/products'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  parseNum,
  formatCurrency,
  type PricingApproval,
  type PricingConfig,
} from '@/lib/pricing-types'
import { Check, X, Loader2, FileText, Clock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

export function PricingApprovals() {
  const { user } = useAuth()
  const [approvals, setApprovals] = useState<PricingApproval[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve')
  const [dialogItem, setDialogItem] = useState<PricingApproval | null>(null)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setApprovals(
        (await getApprovals(filter !== 'all' ? filter : undefined)) as unknown as PricingApproval[],
      )
    } catch {
      setApprovals([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [filter])
  useRealtime('pricing_approvals', () => load())

  const openDialog = (item: PricingApproval, action: 'approve' | 'reject') => {
    setDialogItem(item)
    setDialogAction(action)
    setReason('')
    setDialogOpen(true)
  }

  const handleConfirm = async () => {
    if (!dialogItem) return
    if (dialogAction === 'reject' && !reason.trim()) {
      toast({ title: 'Informe o motivo da rejeição', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const isApprove = dialogAction === 'approve'
      await updateApproval(dialogItem.id, {
        status: isApprove ? 'approved' : 'rejected',
        approver_name: (user?.name as string) || '',
        approval_reason: isApprove ? reason : '',
        rejection_reason: isApprove ? '' : reason,
        approved_at: new Date().toISOString(),
      })
      if (isApprove) {
        const cfg = (await getPricingConfigs()) as unknown as PricingConfig[]
        const productCfg = cfg.find((c) => c.product_id === dialogItem.product_id)
        if (productCfg) {
          await updatePricingConfig(productCfg.id, { suggested_price: dialogItem.requested_price })
          await updateProduct(dialogItem.product_id, { price: dialogItem.requested_price })
          await createPricingHistory({
            product_id: dialogItem.product_id,
            product_code: dialogItem.product_code,
            product_name: dialogItem.product_name,
            user_name: (user?.name as string) || '',
            user_role: (user?.role as string) || '',
            previous_price: dialogItem.current_price,
            new_price: dialogItem.requested_price,
            change_reason: `Aprovado por ${(user?.name as string) || ''}`,
            field_changed: 'suggested_price',
            previous_value: dialogItem.current_price,
            new_value: dialogItem.requested_price,
          })
        }
      }
      toast({ title: isApprove ? 'Preço aprovado e aplicado' : 'Alteração rejeitada' })
      setDialogOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao processar', variant: 'destructive' })
    }
    setSaving(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const filtered = filter === 'all' ? approvals : approvals.filter((a) => a.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 focus-visible:ring-[#005B2E]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Aguardando</SelectItem>
            <SelectItem value="approved">Aprovadas</SelectItem>
            <SelectItem value="rejected">Rejeitadas</SelectItem>
            <SelectItem value="all">Todas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Clock className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-bold">
              Nenhuma aprovação {filter === 'pending' ? 'pendente' : 'encontrada'}.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Produto</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">
                    Preço Atual
                  </th>
                  <th className="text-left px-3 py-3 font-bold">Preço Solicitado</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Margem</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Mínima</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold hidden lg:table-cell">
                    Solicitante
                  </th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3">
                      <span className="font-medium">{a.product_name}</span>
                      <p className="text-xs text-muted-foreground">{a.product_code}</p>
                    </td>
                    <td className="px-3 py-3 hidden sm:table-cell">
                      R$ {formatCurrency(a.current_price)}
                    </td>
                    <td className="px-3 py-3 font-bold text-[#005B2E]">
                      R$ {formatCurrency(a.requested_price)}
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      {formatCurrency(a.margin_percent)}%
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      {formatCurrency(a.minimum_margin)}%
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${a.status === 'pending' ? 'bg-amber-100 text-amber-700' : a.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {a.status === 'pending'
                          ? 'Aguardando'
                          : a.status === 'approved'
                            ? 'Aprovada'
                            : 'Rejeitada'}
                      </span>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell text-xs">{a.requester_name}</td>
                    <td className="px-3 py-3">
                      {a.status === 'pending' && (
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDialog(a, 'approve')}
                            className="text-emerald-600 hover:bg-emerald-50"
                            title="Aprovar"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDialog(a, 'reject')}
                            className="text-red-600 hover:bg-red-50"
                            title="Rejeitar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDialogOpen(false)}
        >
          <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6 space-y-3">
              <h3 className="font-bold text-lg text-[#005B2E]">
                {dialogAction === 'approve' ? 'Aprovar Alteração' : 'Rejeitar Alteração'}
              </h3>
              <p className="text-sm">
                Produto: <strong>{dialogItem?.product_name}</strong>
              </p>
              <p className="text-sm">
                Preço: R$ {formatCurrency(dialogItem?.requested_price || '0')}
              </p>
              <div>
                <Label className="text-xs">
                  {dialogAction === 'approve'
                    ? 'Motivo da aprovação (opcional)'
                    : 'Motivo da rejeição (obrigatório)'}
                </Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={saving}
                  className={
                    dialogAction === 'approve'
                      ? 'bg-[#005B2E] hover:bg-[#01361D] text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
                  {dialogAction === 'approve' ? 'Aprovar' : 'Rejeitar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
