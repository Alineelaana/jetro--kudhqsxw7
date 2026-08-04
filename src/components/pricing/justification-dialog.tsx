import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface JustificationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  reason: string
  setReason: (v: string) => void
  justification: string
  setJustification: (v: string) => void
  relatedDocument: string
  setRelatedDocument: (v: string) => void
  relatedCampaign: string
  setRelatedCampaign: (v: string) => void
  observations: string
  setObservations: (v: string) => void
  saving?: boolean
  blockReasons?: string[]
}

export function JustificationDialog({
  open,
  onClose,
  onConfirm,
  reason,
  setReason,
  justification,
  setJustification,
  relatedDocument,
  setRelatedDocument,
  relatedCampaign,
  setRelatedCampaign,
  observations,
  setObservations,
  saving,
  blockReasons = [],
}: JustificationDialogProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6 space-y-3">
          <h3 className="font-bold text-lg text-[#005B2E]">Justificativa Obrigatória</h3>
          <p className="text-sm text-muted-foreground">
            Toda alteração de preço requer justificativa completa.
          </p>
          {blockReasons.length > 0 && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm space-y-1">
              <p className="font-bold">Bloqueios detectados:</p>
              {blockReasons.map((b, i) => (
                <p key={i}>• {b}</p>
              ))}
            </div>
          )}
          <div className="space-y-1">
            <Label className="text-xs">Motivo *</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Aumento de custo"
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Justificativa *</Label>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Documento Relacionado</Label>
              <Input
                value={relatedDocument}
                onChange={(e) => setRelatedDocument(e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Campanha Relacionada</Label>
              <Input
                value={relatedCampaign}
                onChange={(e) => setRelatedCampaign(e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Observações</Label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={2}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={
                saving || !reason.trim() || !justification.trim() || blockReasons.length > 0
              }
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Confirmar e Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
