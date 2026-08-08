import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import {
  canApproveExternalQuotation,
  canGeneratePurchaseFromQuotation,
} from '@/lib/mk-external-quotations-permissions'
import {
  approveEq,
  rejectEq,
  requestEqAdjustment,
  generateEqPurchaseRequest,
} from '@/services/mk-external-quotations'
import { getApprovalLevel } from '@/lib/mk-external-quotations-types'
import type { MkExternalQuotation } from '@/lib/mk-external-quotations-types'
import { MkEqComparative } from '@/components/trade-marketing/mk-eq-comparative'
import { Check, X, RotateCcw, FilePlus, ShoppingCart, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface MkEqApproverProps {
  quotation: MkExternalQuotation
  onChanged: () => void
}

export function MkEqApprover({ quotation, onChanged }: MkEqApproverProps) {
  const { userRole, user } = useAuth()
  const [notes, setNotes] = useState('')
  const [acting, setActing] = useState(false)
  const userName = (user?.name as string) || ''
  const userId = user?.id || ''

  const recommendedProposal = quotation.proposals?.find(
    (p) => p.supplier_id === quotation.recommended_supplier_id,
  )
  const value = recommendedProposal ? parseFloat(recommendedProposal.final_value || '0') : 0
  const approvalLevel = getApprovalLevel(value)
  const canApprove = canApproveExternalQuotation(userRole)
  const canPurchase = canGeneratePurchaseFromQuotation(userRole)
  const isApproved = quotation.status === 'aprovada'
  const isRejected = quotation.status === 'rejeitada'
  const isAwaiting = quotation.status === 'aguardando_aprovacao'

  const handleAction = async (action: 'approve' | 'reject' | 'adjust' | 'purchase') => {
    setActing(true)
    try {
      if (action === 'approve') await approveEq(quotation.id, notes, userName, userId)
      else if (action === 'reject') await rejectEq(quotation.id, notes, userName, userId)
      else if (action === 'adjust') await requestEqAdjustment(quotation.id, notes, userName, userId)
      else if (action === 'purchase') {
        const num = await generateEqPurchaseRequest(quotation.id, userName)
        toast.success(`Solicitação de compra ${num} gerada`)
        onChanged()
        return
      }
      toast.success(
        action === 'approve'
          ? 'Cotação aprovada'
          : action === 'reject'
            ? 'Cotação rejeitada'
            : 'Ajuste solicitado',
      )
      onChanged()
    } catch {
      toast.error('Erro ao processar ação')
    }
    setActing(false)
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground">Valor Recomendado</p>
              <p className="font-bold text-[#005B2E]">R$ {value.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Nível de Aprovação</p>
              <p className="font-bold">{approvalLevel.label}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Fornecedor</p>
              <p className="font-bold truncate">{quotation.recommended_supplier_name || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Campanha</p>
              <p className="font-bold truncate">{quotation.campaign_name || '—'}</p>
            </div>
          </div>
          {quotation.recommendation_justification && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
              <p className="font-semibold text-amber-800 mb-1">Justificativa da Recomendação</p>
              <p className="text-amber-700">{quotation.recommendation_justification}</p>
            </div>
          )}
          {(quotation.negotiation_history || []).length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-1">Histórico de Negociação</p>
              <div className="space-y-1">
                {(quotation.negotiation_history || []).map((n) => (
                  <div key={n.id} className="text-xs flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      Rodada {n.round}
                    </Badge>
                    <span>
                      {n.supplier_name}: R$ {n.previous_value} → R$ {n.new_value}
                    </span>
                    <span className="text-muted-foreground">({n.date})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold mb-1">Comparativo de Propostas</p>
            <MkEqComparative quotation={quotation} />
          </div>
        </CardContent>
      </Card>

      {(quotation.approval_data || []).length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-3">
            <p className="text-xs font-semibold mb-2">Histórico de Aprovações</p>
            {(quotation.approval_data || []).map((a) => (
              <div key={a.id} className="text-xs flex items-center gap-2 mb-1">
                <Badge
                  variant={
                    a.action === 'approve'
                      ? 'default'
                      : a.action === 'reject'
                        ? 'destructive'
                        : 'secondary'
                  }
                  className="text-[10px]"
                >
                  {a.action}
                </Badge>
                <span>
                  {a.user} — {new Date(a.date).toLocaleString('pt-BR')}
                </span>
                {a.notes && <span className="text-muted-foreground">({a.notes})</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isAwaiting && canApprove && (
        <Card className="border-2 border-[#005B2E]/30">
          <CardContent className="py-4 space-y-3">
            <div>
              <Label className="text-xs">Observações da Decisão</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Registre sua justificativa..."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleAction('approve')}
                disabled={acting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="w-4 h-4 mr-1" /> Aprovar
              </Button>
              <Button
                onClick={() => handleAction('reject')}
                disabled={acting}
                variant="destructive"
              >
                <X className="w-4 h-4 mr-1" /> Rejeitar
              </Button>
              <Button onClick={() => handleAction('adjust')} disabled={acting} variant="outline">
                <RotateCcw className="w-4 h-4 mr-1" /> Solicitar Ajuste
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isApproved && canPurchase && !quotation.purchase_request_id && (
        <Card className="border-2 border-[#005B2E]/30">
          <CardContent className="py-4">
            <p className="text-sm mb-3">
              Cotação aprovada. Gere a solicitação de compra para continuar no módulo de Compras.
            </p>
            <Button
              onClick={() => handleAction('purchase')}
              disabled={acting}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {acting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-2" />
              )}{' '}
              Gerar Solicitação de Compra
            </Button>
          </CardContent>
        </Card>
      )}

      {quotation.purchase_request_number && (
        <Card className="border-2 border-emerald-300">
          <CardContent className="py-3">
            <p className="text-sm text-emerald-700 font-semibold">
              ✓ Solicitação de Compra {quotation.purchase_request_number} gerada
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              O processo continua no módulo de Compras. O Financeiro recebe as informações através
              do fluxo oficial.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
