import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VERBA_USAGE_PURPOSES } from '@/lib/tm-verbas-types'
import type { TmVerbaRow } from '@/lib/tm-verbas-types'
import { linkVerbaToAction } from '@/services/tm-verbas'
import { Loader2, Link2 } from 'lucide-react'
import { toast } from 'sonner'

interface TmVerbaLinkDialogProps {
  verba: TmVerbaRow | null
  actions: any[]
  onClose: () => void
}

export function TmVerbaLinkDialog({ verba, actions, onClose }: TmVerbaLinkDialogProps) {
  const [actionId, setActionId] = useState('')
  const [purpose, setPurpose] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (verba) {
      setActionId('')
      setPurpose('')
    }
  }, [verba])

  const handleLink = async () => {
    if (!verba || !actionId || !purpose) {
      toast.error('Selecione a ação e a finalidade')
      return
    }
    setLoading(true)
    try {
      await linkVerbaToAction(actionId, verba.agreement_id, verba.supplier_name, purpose)
      toast.success('Verba vinculada à ação')
      onClose()
    } catch {
      toast.error('Erro ao vincular verba')
    }
    setLoading(false)
  }

  return (
    <Dialog
      open={!!verba}
      onOpenChange={(o) => {
        if (!o) onClose()
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E] flex items-center gap-2">
            <Link2 className="w-4 h-4" /> Vincular Verba a Ação
          </DialogTitle>
        </DialogHeader>
        {verba && (
          <div className="space-y-3">
            <div className="bg-muted rounded p-2 text-sm">
              <p>
                <strong>Fornecedor:</strong> {verba.supplier_name}
              </p>
              <p>
                <strong>Saldo:</strong> R$ {verba.current_balance}
              </p>
            </div>
            <div>
              <Label>Ação / Campanha *</Label>
              <Select value={actionId} onValueChange={setActionId}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione a ação" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.title} ({a.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Finalidade do Custeio *</Label>
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione a finalidade" />
                </SelectTrigger>
                <SelectContent>
                  {VERBA_USAGE_PURPOSES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-amber-600">
              ⚠️ A verba custeia a ação, mas não pode ser aplicada ao preço do produto.
            </p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleLink}
            disabled={loading}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Vincular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
