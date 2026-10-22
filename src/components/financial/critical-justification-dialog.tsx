import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { logCriticalAction } from './financial-advanced-service'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

interface CriticalJustificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  actionType:
    | 'alteracao_valor'
    | 'alteracao_vencimento'
    | 'estorno'
    | 'cancelamento'
    | 'baixa_manual'
  recordId: string
  module: string
  details?: string
  dadosAnteriores?: any
  dadosNovos?: any
  onConfirm: (justificativa: string) => Promise<void>
}

export function CriticalJustificationDialog({
  open,
  onOpenChange,
  title,
  actionType,
  recordId,
  module,
  details,
  dadosAnteriores,
  dadosNovos,
  onConfirm,
}: CriticalJustificationDialogProps) {
  const { user } = useAuth()
  const [justificativa, setJustificativa] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleExecute = async () => {
    if (justificativa.trim().length < 8) {
      toast.error('Informe uma justificativa válida com no mínimo 8 caracteres.')
      return
    }

    setSubmitting(true)
    try {
      // 1. Executa a ação do chamador
      await onConfirm(justificativa)

      // 2. Registra o log de auditoria
      await logCriticalAction({
        registroId: recordId,
        modulo: module,
        tipoAcao: actionType,
        justificativa,
        usuarioNome: user?.name || user?.email || 'Usuário',
        usuarioId: user?.id || 'sys',
        dadosAnteriores,
        dadosNovos,
      })

      toast.success('Ação auditada e gravada com sucesso.')
      onOpenChange(false)
      setJustificativa('')
    } catch (err: any) {
      toast.error(err?.message || 'Falha ao registrar alteração crítica.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 leading-relaxed">
            <strong>Atenção:</strong> Esta é uma operação crítica sujeita à governança e auditoria
            financeira permanente. É <strong>obrigatório</strong> informar o motivo e a
            justificativa para registro na trilha de auditoria.
          </div>

          {details && <p className="text-xs text-muted-foreground">{details}</p>}

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Justificativa da Alteração *</Label>
            <Textarea
              rows={3}
              placeholder="Ex: Correção de valor autorizada pela gerência devido a devolução parcial..."
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              className="text-xs focus-visible:ring-[#005B2E]"
            />
            <span className="text-[10px] text-muted-foreground">Mínimo de 8 caracteres.</span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleExecute}
            disabled={submitting || justificativa.trim().length < 8}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Processando...
              </>
            ) : (
              'Confirmar e Auditar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
