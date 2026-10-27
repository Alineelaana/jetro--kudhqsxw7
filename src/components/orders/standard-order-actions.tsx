import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Save, CheckCircle2, Send, Check, Printer, XCircle } from 'lucide-react'

export interface StandardOrderActionsProps {
  status: string
  loading?: boolean
  canValidate?: boolean
  canSubmitApproval?: boolean
  canConfirm?: boolean
  canCancel?: boolean
  onSaveDraft: () => void
  onValidate: () => void
  onSubmitApproval: () => void
  onConfirm: () => void
  onPrint: () => void
  onCancel: () => void
  onClose?: () => void
}

export function StandardOrderActions({
  status,
  loading = false,
  canValidate = true,
  canSubmitApproval = true,
  canConfirm = true,
  canCancel = true,
  onSaveDraft,
  onValidate,
  onSubmitApproval,
  onConfirm,
  onPrint,
  onCancel,
  onClose,
}: StandardOrderActionsProps) {
  const isCanceled = status === 'Cancelado'
  const isFinalized =
    status === 'Concluído' || status === 'Faturado Totalmente' || status === 'Recebido Totalmente'

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t bg-background sticky bottom-0 z-10 py-2">
      <div className="flex items-center gap-2">
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Fechar
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          disabled={loading}
          className="text-foreground hover:bg-muted"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          Imprimir / Gerar PDF
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Cancelar (se não cancelado e nem concluído) */}
        {!isCanceled && !isFinalized && canCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            Cancelar Pedido
          </Button>
        )}

        {/* Salvar Rascunho */}
        {!isCanceled && !isFinalized && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            disabled={loading}
            className="border-slate-300 dark:border-slate-700 font-medium"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1.5" />
            )}
            Salvar Rascunho
          </Button>
        )}

        {/* Validar */}
        {!isCanceled && !isFinalized && canValidate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onValidate}
            disabled={loading}
            className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 font-medium"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Validar Regras
          </Button>
        )}

        {/* Enviar para Aprovação */}
        {!isCanceled && !isFinalized && canSubmitApproval && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onSubmitApproval}
            disabled={loading}
            className="bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-200 font-semibold"
          >
            <Send className="w-4 h-4 mr-1.5" />
            Enviar p/ Aprovação
          </Button>
        )}

        {/* Confirmar Pedido */}
        {!isCanceled && !isFinalized && canConfirm && (
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Check className="w-4 h-4 mr-1.5" />
            )}
            Confirmar Pedido
          </Button>
        )}
      </div>
    </div>
  )
}
