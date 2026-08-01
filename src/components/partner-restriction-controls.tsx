import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertTriangle, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react'
import { toggleFinancialRestriction } from '@/services/partners'
import { canManageRestrictions } from '@/lib/permissions'
import { RESTRICTION_ALERT_TEXT } from '@/lib/partner-constants'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import type { PartnerRecord } from '@/components/partner-shared'

interface Props {
  partner: PartnerRecord
  onSuccess: () => void
}

export function PartnerRestrictionControls({ partner, onSuccess }: Props) {
  const { user, userRole } = useAuth()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const isRestricted = partner.financial_restriction === true
  const canManage = canManageRestrictions(userRole)
  const userName = (user?.name as string) || (user?.email as string) || 'Sistema'

  const handleToggle = async () => {
    if (!reason.trim()) return
    setSaving(true)
    try {
      await toggleFinancialRestriction(
        partner.id,
        isRestricted ? 'remove' : 'activate',
        reason.trim(),
        userName,
      )
      toast({
        title: isRestricted ? 'Restrição removida' : 'Restrição ativada',
        description: 'O histórico foi registrado.',
      })
      setReason('')
      setOpen(false)
      onSuccess()
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a restrição.',
        variant: 'destructive',
      })
    }
    setSaving(false)
  }

  return (
    <>
      {isRestricted && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-300 rounded-lg p-3 text-red-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-bold">{RESTRICTION_ALERT_TEXT}</span>
        </div>
      )}
      {canManage && (
        <Button
          type="button"
          variant={isRestricted ? 'outline' : 'destructive'}
          onClick={() => setOpen(true)}
          className="font-bold"
        >
          {isRestricted ? (
            <>
              <ShieldCheck className="w-4 h-4 mr-2" /> Remover Restrição Financeira Interna
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 mr-2" /> Cliente com Restrição Financeira Interna
            </>
          )}
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isRestricted ? 'Remover Restrição Financeira' : 'Ativar Restrição Financeira'}
            </DialogTitle>
            <DialogDescription>
              {isRestricted
                ? 'Informe o motivo da remoção da restrição.'
                : 'Confirme a ativação e informe o motivo.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Motivo</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descreva o motivo..."
                rows={3}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleToggle}
              disabled={saving || !reason.trim()}
              variant={isRestricted ? 'default' : 'destructive'}
              className="font-bold"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
