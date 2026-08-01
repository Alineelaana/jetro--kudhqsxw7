import { useState, useEffect } from 'react'
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
import { AlertCircle, Loader2 } from 'lucide-react'
import { updateBudgetRequestStatus } from '@/services/budget-requests'
import { STATUS_COLORS } from '@/lib/types'

interface StatusUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recordId: string
  selectedStatus: string
  authorName: string
  onSuccess: () => void
}

export function StatusUpdateDialog({
  open,
  onOpenChange,
  recordId,
  selectedStatus,
  authorName,
  onSuccess,
}: StatusUpdateDialogProps) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setNote('')
      setError('')
    }
  }, [open, selectedStatus])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await updateBudgetRequestStatus(recordId, selectedStatus, note, authorName)
      onOpenChange(false)
      onSuccess()
    } catch {
      setError('Erro ao atualizar status. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Status</DialogTitle>
          <DialogDescription>Registre o andamento desta solicitação.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Novo Status</Label>
            <span
              className={`inline-block text-sm font-bold px-3 py-1.5 rounded border ${
                STATUS_COLORS[selectedStatus] || ''
              }`}
            >
              {selectedStatus}
            </span>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-sm font-semibold">
              Nota
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: enviei o orçamento em PDF, fechei a venda..."
              rows={4}
              className="resize-none focus-visible:ring-[#005B2E]"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
