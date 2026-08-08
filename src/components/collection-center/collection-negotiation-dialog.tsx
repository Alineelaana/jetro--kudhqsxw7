import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Save, AlertTriangle } from 'lucide-react'
import { formatCurrency, computeSaldo } from '@/lib/collection-center-types'
import { canApplyDiscount, getDiscountLimit } from '@/lib/collection-center-permissions'
import { useAuth } from '@/hooks/use-auth'
import { submitNegotiation, logAuditEntry } from '@/services/collection-center-extended'
import { toast } from 'sonner'

export function CollectionNegotiationDialog({
  open,
  onOpenChange,
  cliente,
  selectedTitles,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  cliente: string
  selectedTitles: any[]
  onSaved: () => void
}) {
  const { user } = useAuth()
  const role = (user as any)?.role
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const totalSaldo = selectedTitles.reduce((s, r) => s + computeSaldo(r), 0)
  const juros = parseFloat(form.juros || '0')
  const multa = parseFloat(form.multa || '0')
  const discountPercent = parseFloat(form.discountPercent || '0')
  const desconto = (totalSaldo * discountPercent) / 100
  const negotiatedValue = totalSaldo + juros + multa - desconto
  const alcadaLimit = getDiscountLimit(role)
  const withinAlcada = canApplyDiscount(role, discountPercent)

  const handleSave = async () => {
    setSaving(true)
    try {
      await submitNegotiation(
        cliente,
        {
          originalValue: totalSaldo,
          interest: juros,
          penalty: multa,
          discount: desconto,
          discountPercent,
          negotiatedValue,
          entrada: parseFloat(form.entrada || '0'),
          parcels: parseInt(form.parcels || '0'),
          newDate: form.newDate || '',
          condition: form.condition || '',
          observation: form.observation || '',
        },
        withinAlcada,
      )
      await logAuditEntry({
        action: withinAlcada ? 'negotiation_confirmed' : 'negotiation_approval_requested',
        target_collection: 'financial_collections',
        target_id: cliente,
        target_summary: `Negociação ${cliente} - ${formatCurrency(negotiatedValue)}`,
        new_value: JSON.stringify({ negotiatedValue, discountPercent, withinAlcada }),
      })
      toast.success(withinAlcada ? 'Negociação confirmada' : 'Enviado para aprovação')
      onOpenChange(false)
      setForm({})
      onSaved()
    } catch {
      toast.error('Erro ao registrar negociação')
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">Negociar — {cliente}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-muted-foreground">Saldo Total</p>
              <p className="font-bold">{formatCurrency(totalSaldo)}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-xs text-muted-foreground">Valor Negociado</p>
              <p className="font-bold text-[#005B2E]">{formatCurrency(negotiatedValue)}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Juros</Label>
              <Input
                type="number"
                className="h-8 text-sm"
                value={form.juros || ''}
                onChange={(e) => setForm({ ...form, juros: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Multa</Label>
              <Input
                type="number"
                className="h-8 text-sm"
                value={form.multa || ''}
                onChange={(e) => setForm({ ...form, multa: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Desconto %</Label>
              <Input
                type="number"
                className="h-8 text-sm"
                value={form.discountPercent || ''}
                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs">Entrada</Label>
              <Input
                type="number"
                className="h-8 text-sm"
                value={form.entrada || ''}
                onChange={(e) => setForm({ ...form, entrada: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Parcelas</Label>
              <Input
                type="number"
                className="h-8 text-sm"
                value={form.parcels || ''}
                onChange={(e) => setForm({ ...form, parcels: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs">Nova Data</Label>
              <Input
                type="date"
                className="h-8 text-sm"
                value={form.newDate || ''}
                onChange={(e) => setForm({ ...form, newDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Condição</Label>
            <Input
              className="h-8 text-sm"
              value={form.condition || ''}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
            />
          </div>
          <div>
            <Label className="text-xs">Observação</Label>
            <Textarea
              className="text-sm"
              rows={2}
              value={form.observation || ''}
              onChange={(e) => setForm({ ...form, observation: e.target.value })}
            />
          </div>
          {!withinAlcada && discountPercent > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 p-2 rounded text-xs text-amber-700">
              <AlertTriangle className="w-4 h-4" /> Desconto acima da alçada ({alcadaLimit}%).
              Enviado para aprovação.
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
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {withinAlcada ? 'Confirmar' : 'Enviar Aprovação'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
