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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import pb from '@/lib/pocketbase/client'
import { toast } from '@/hooks/use-toast'
import { Loader2, Mail, Send } from 'lucide-react'
import signatureImg from '@/assets/chatgpt-image-1-de-ago.de-2026-155412-d05ee.png'

interface SendMessageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  clientName: string
  clientEmail: string
  authorName?: string
  onSuccess?: () => void
}

export function SendMessageDialog({
  open,
  onOpenChange,
  requestId,
  clientName,
  clientEmail,
  authorName = 'Atendente',
  onSuccess,
}: SendMessageDialogProps) {
  const [subject, setSubject] = useState('Orçamento Velora Log — Proposta Comercial')
  const [content, setContent] = useState(
    `Olá ${clientName},\n\nConforme solicitado, enviamos em anexo/abaixo os detalhes do seu orçamento para a operação logística.\n\nFicamos à disposição para quaisquer dúvidas.`,
  )
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!clientEmail) {
      toast({
        title: 'E-mail ausente',
        description: 'O cliente não possui e-mail cadastrado.',
        variant: 'destructive',
      })
      return
    }

    setSending(true)
    try {
      await pb.send('/backend/v1/send-budget-email', {
        method: 'POST',
        body: JSON.stringify({
          request_id: requestId,
          recipient_email: clientEmail,
          subject,
          content,
          author_name: authorName,
        }),
      })

      toast({
        title: 'E-mail Enviado!',
        description: `Orçamento enviado para ${clientEmail} com sucesso.`,
      })

      if (onSuccess) onSuccess()
      onOpenChange(false)
    } catch {
      toast({
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar o e-mail de orçamento.',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-[#005B2E]">
            <Mail className="w-5 h-5 text-[#C89B3C]" /> Enviar Orçamento por E-mail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Destinatário</Label>
            <Input value={`${clientName} <${clientEmail || 'Sem e-mail'}>`} disabled />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Assunto do E-mail</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Assunto"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Mensagem / Observações</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="Digite o texto do e-mail..."
            />
          </div>

          {/* Email Professional Signature Preview */}
          <div className="border border-border/80 rounded-xl p-4 bg-muted/20 space-y-3">
            <Label className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground">
              Assinatura Profissional Velora Log
            </Label>
            <div className="space-y-2">
              <p className="text-sm text-foreground">Atenciosamente,</p>
              <p className="text-sm font-bold text-[#005B2E]">
                {authorName} — Velora Log Operações Logísticas
              </p>
              <div className="rounded-lg overflow-hidden border border-border shadow-sm max-w-[580px]">
                <img
                  src={signatureImg}
                  alt="Assinatura Comercial Velora Log"
                  className="w-full h-auto object-contain block"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !clientEmail}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" /> Enviar E-mail
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
