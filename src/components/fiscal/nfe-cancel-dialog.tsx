import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ShieldAlert, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { translatePbMessage } from '@/lib/pocketbase/translate'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  nfe: {
    id: string
    chave_acesso?: string
    authorization_protocol?: string
    focus_nfe_ref?: string
    invoice_id?: string
  } | null
  /** Data/hora de autorização da nota na SEFAZ (ISO) */
  autorizadaEm?: string
  /** Nº da nota para exibição no diálogo */
  numeroNota?: string
  /** Chamado após cancelamento confirmado (sucesso ou rejeição) para recarregar a lista */
  onDone?: () => void
}

const CANCEL_URL = '/backend/v1/huram/fiscal/focus-nfe/cancel'

export default function NfeCancelDialog({
  open,
  onOpenChange,
  nfe,
  autorizadaEm,
  numeroNota,
  onDone,
}: Props) {
  const [justificativa, setJustificativa] = useState('')
  const [loading, setLoading] = useState(false)

  // Prazo legal SEFAZ: 24h após a autorização
  const prazoExpirado = (() => {
    if (!autorizadaEm) return false
    const ms = Date.now() - new Date(autorizadaEm).getTime()
    return ms > 24 * 60 * 60 * 1000
  })()

  useEffect(() => {
    if (!open) {
      setJustificativa('')
      setLoading(false)
    }
  }, [open])

  const enviaCancelamento = async () => {
    if (!nfe) return
    setLoading(true)
    try {
      await pb.send(CANCEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chave_acesso: nfe.chave_acesso || '',
          motivo: justificativa.trim(),
        }),
      })
      toast.success(`Cancelamento da NF-e ${numeroNota || ''} homologado pela SEFAZ.`, {
        duration: 6000,
      })
      onOpenChange(false)
      onDone?.()
    } catch (err: any) {
      const raw = err?.response?.message || err?.data?.message || err?.data?.error || err?.message
      toast.error(translatePbMessage(String(raw || 'Falha ao cancelar a NF-e.')), {
        duration: 9000,
      })
      onOpenChange(false)
      onDone?.()
    }
  }

  const valid = justificativa.trim().length >= 15

  return (
    <Dialog open={open} onOpenChange={(o) => !loading && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <ShieldAlert className="w-5 h-5" />
            Cancelar NF-e {numeroNota}
          </DialogTitle>
          <DialogDescription>
            O cancelamento de NF-e é definitivo e consta no histórico fiscal. A operação envia o
            evento de cancelamento à SEFAZ via Focus NFe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {autorizadaEm && (
            <Alert
              variant={prazoExpirado ? 'destructive' : 'default'}
              className={prazoExpirado ? '' : 'border-sky-300 dark:border-sky-800'}
            >
              <Clock className="h-4 w-4" />
              <AlertDescription>
                NF-e autorizada em <strong>{new Date(autorizadaEm).toLocaleString('pt-BR')}</strong>
                . O prazo legal para cancelamento na SEFAZ é de <strong>24 horas</strong> após a
                autorização.
                {prazoExpirado
                  ? ' Prazo expirado: a SEFAZ provavelmente rejeitará o cancelamento (eventos fora do prazo). Nesse caso, o caminho será emitir uma NF-e de devolução/entrada.'
                  : ''}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="cancel-justificativa">
              Justificativa do cancelamento{' '}
              <span className="text-xs text-muted-foreground">
                (15 a 255 caracteres — exigência legal da SEFAZ)
              </span>
            </Label>
            <Textarea
              id="cancel-justificativa"
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value.slice(0, 255))}
              placeholder="Descreva o motivo do cancelamento (ex.: erro no valor, cancelamento por duplicidade...)"
              rows={4}
              disabled={loading}
            />
            <div className="flex items-center justify-between text-xs">
              <span
                className={
                  justificativa.trim().length === 0
                    ? 'text-muted-foreground'
                    : justificativa.trim().length < 15
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                }
              >
                {justificativa.trim().length < 15
                  ? `Mínimo de 15 caracteres — faltam ${15 - justificativa.trim().length}`
                  : 'Justificativa válida'}
              </span>
              <span className="text-muted-foreground">{justificativa.length}/255</span>
            </div>
          </div>

          {prazoExpirado && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Confirme somente se a SEFAZ do seu estado ainda aceitar o evento fora do prazo.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={loading} onClick={() => onOpenChange(false)}>
            Voltar
          </Button>
          <Button variant="destructive" disabled={loading || !valid} onClick={enviaCancelamento}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Confirmar cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
