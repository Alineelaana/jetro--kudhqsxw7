import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createProposal,
  updateProposal,
  generateProposalNumber,
  createHistoryEntry,
} from '@/services/crm'
import { useAuth } from '@/hooks/use-auth'
import {
  PROPOSAL_STATUS,
  PAYMENT_OPTIONS,
  DEADLINE_OPTIONS,
  type CrmProposal,
} from '@/lib/crm-types'
import { Loader2, Save, Plus, X, Send } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ProposalItem {
  product_service: string
  quantity: string
  unit_price: string
  discount: string
  addition: string
  total: string
}

export function CrmProposalDialog({
  open,
  onOpenChange,
  proposal,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  proposal: CrmProposal | null
  onSuccess: () => void
}) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [items, setItems] = useState<ProposalItem[]>([])

  useEffect(() => {
    if (open) {
      if (proposal && proposal.id) {
        setForm({
          client_name: proposal.client_name || '',
          title: proposal.title || '',
          responsible_name: proposal.responsible_name || user?.name || '',
          payment_terms: proposal.payment_terms || '',
          delivery_terms: proposal.delivery_terms || '',
          validity_date: proposal.validity_date || '',
          status: proposal.status || 'Em Elaboração',
          observations: proposal.rejected_reason || '',
          company: proposal.company || 'Jetro',
          filial: proposal.filial || 'Matriz',
        })
        const rawItems = Array.isArray(proposal.items) ? proposal.items : []
        setItems(
          rawItems.length > 0
            ? rawItems.map((i: Record<string, unknown>) => ({
                product_service: (i.product_service as string) || '',
                quantity: String(i.quantity || '1'),
                unit_price: String(i.unit_price || '0'),
                discount: String(i.discount || '0'),
                addition: String(i.addition || '0'),
                total: String(i.total || '0'),
              }))
            : [
                {
                  product_service: '',
                  quantity: '1',
                  unit_price: '0',
                  discount: '0',
                  addition: '0',
                  total: '0',
                },
              ],
        )
      } else {
        setForm({
          status: 'Em Elaboração',
          responsible_name: user?.name || '',
          company: 'Jetro',
          filial: 'Matriz',
          validity_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        })
        setItems([
          {
            product_service: '',
            quantity: '1',
            unit_price: '0',
            discount: '0',
            addition: '0',
            total: '0',
          },
        ])
      }
    }
  }, [open, proposal, user])

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const totals = useMemo(() => {
    const gross = items.reduce(
      (s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unit_price) || 0),
      0,
    )
    const discount = items.reduce((s, i) => s + (parseFloat(i.discount) || 0), 0)
    const addition = items.reduce((s, i) => s + (parseFloat(i.addition) || 0), 0)
    const subtotal = gross - discount + addition
    return { gross, discount, addition, subtotal }
  }, [items])

  const setItem = (idx: number, field: keyof ProposalItem, value: string) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it
        const updated = { ...it, [field]: value }
        const qty = parseFloat(updated.quantity) || 0
        const price = parseFloat(updated.unit_price) || 0
        const disc = parseFloat(updated.discount) || 0
        const add = parseFloat(updated.addition) || 0
        updated.total = String((qty * price - disc + add).toFixed(2))
        return updated
      }),
    )
  }

  const handleSave = async (submitForApproval: boolean) => {
    if (!form.title?.trim()) {
      toast({ title: 'Título é obrigatório', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const userName = (user?.name as string) || 'Sistema'
      const status = submitForApproval ? 'Aguardando Aprovação' : form.status || 'Em Elaboração'
      const data: Record<string, unknown> = {
        ...form,
        status,
        items: items.filter((i) => i.product_service),
        subtotal: String(totals.subtotal.toFixed(2)),
        discount: String(totals.discount.toFixed(2)),
        total: String(totals.subtotal.toFixed(2)),
        gross_value: String(totals.gross.toFixed(2)),
      }
      if (proposal && proposal.id) {
        await updateProposal(proposal.id, data)
      } else {
        const propNum = await generateProposalNumber()
        data.proposal_number = propNum
        const rec = await createProposal(data)
        await createHistoryEntry({
          entity_type: 'proposal',
          entity_id: rec.id,
          entity_name: form.title,
          type: 'create',
          description: 'Proposta criada',
          user_name: userName,
          date: new Date().toISOString(),
          company: form.company,
          filial: form.filial,
        })
      }
      toast({ title: submitForApproval ? 'Proposta enviada para aprovação' : 'Proposta salva' })
      onSuccess()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">
            {proposal && proposal.id ? 'Editar' : 'Nova'} Proposta
            {proposal && proposal.proposal_number ? ` — ${proposal.proposal_number}` : ''}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <Label className="text-xs">Cliente / Lead</Label>
              <Input
                value={form.client_name || ''}
                onChange={(e) => update('client_name', e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="sm:col-span-1">
              <Label className="text-xs">Título *</Label>
              <Input
                value={form.title || ''}
                onChange={(e) => update('title', e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Responsável</Label>
              <Input
                value={form.responsible_name || ''}
                onChange={(e) => update('responsible_name', e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Validade</Label>
              <Input
                type="date"
                value={form.validity_date || ''}
                onChange={(e) => update('validity_date', e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Cond. Pagamento</Label>
              <Select
                value={form.payment_terms || ''}
                onValueChange={(v) => update('payment_terms', v)}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Prazo Entrega</Label>
              <Select
                value={form.delivery_terms || ''}
                onValueChange={(v) => update('delivery_terms', v)}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {DEADLINE_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-bold">Itens da Proposta</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setItems([
                    ...items,
                    {
                      product_service: '',
                      quantity: '1',
                      unit_price: '0',
                      discount: '0',
                      addition: '0',
                      total: '0',
                    },
                  ])
                }
                className="border-[#005B2E] text-[#005B2E]"
              >
                <Plus className="w-3 h-3 mr-1" /> Item
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-2">Produto/Serviço</th>
                    <th className="text-left p-2 w-16">Qtd</th>
                    <th className="text-left p-2 w-24">Vlr Unit.</th>
                    <th className="text-left p-2 w-20">Desc.</th>
                    <th className="text-left p-2 w-20">Acrésc.</th>
                    <th className="text-left p-2 w-24">Total</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td className="p-1">
                        <Input
                          value={it.product_service}
                          onChange={(e) => setItem(i, 'product_service', e.target.value)}
                          className="h-8 text-xs focus-visible:ring-[#005B2E]"
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => setItem(i, 'quantity', e.target.value)}
                          className="h-8 text-xs focus-visible:ring-[#005B2E]"
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          value={it.unit_price}
                          onChange={(e) => setItem(i, 'unit_price', e.target.value)}
                          className="h-8 text-xs focus-visible:ring-[#005B2E]"
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          value={it.discount}
                          onChange={(e) => setItem(i, 'discount', e.target.value)}
                          className="h-8 text-xs focus-visible:ring-[#005B2E]"
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          value={it.addition}
                          onChange={(e) => setItem(i, 'addition', e.target.value)}
                          className="h-8 text-xs focus-visible:ring-[#005B2E]"
                        />
                      </td>
                      <td className="p-1 font-bold">{it.total}</td>
                      <td className="p-1">
                        {items.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                            className="text-red-600 h-8 w-8 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t">
            <div>
              <Label className="text-xs">Valor Bruto</Label>
              <p className="text-sm font-bold">R$ {totals.gross.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-xs">Descontos</Label>
              <p className="text-sm font-bold text-red-600">R$ {totals.discount.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-xs">Acréscimos</Label>
              <p className="text-sm font-bold text-green-600">R$ {totals.addition.toFixed(2)}</p>
            </div>
            <div>
              <Label className="text-xs">Total</Label>
              <p className="text-lg font-black text-[#005B2E]">R$ {totals.subtotal.toFixed(2)}</p>
            </div>
          </div>
          <div>
            <Label className="text-xs">Observações</Label>
            <Textarea
              value={form.observations || ''}
              onChange={(e) => update('observations', e.target.value)}
              rows={2}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="border-[#005B2E] text-[#005B2E]"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
            <Save className="w-4 h-4 mr-2" /> Rascunho
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
            <Send className="w-4 h-4 mr-2" /> Enviar Aprovação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
