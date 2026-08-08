import { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createEq,
  updateEq,
  getCorporateSuppliers,
  getTradeActions,
} from '@/services/mk-external-quotations'
import { EQ_PRIORITY } from '@/lib/mk-external-quotations-types'
import type { MkExternalQuotation } from '@/lib/mk-external-quotations-types'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface MkEqFormProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  editing: MkExternalQuotation | null
  onSaved: () => void
  userName: string
}

export function MkEqForm({ open, onOpenChange, editing, onSaved, userName }: MkEqFormProps) {
  const [saving, setSaving] = useState(false)
  const [suppliers, setSuppliers] = useState<Record<string, unknown>[]>([])
  const [actions, setActions] = useState<Record<string, unknown>[]>([])
  const [form, setForm] = useState({
    title: '',
    requester: userName,
    area: 'Marketing',
    company: '',
    branch: '',
    cost_center: '',
    campaign_name: '',
    action_name: '',
    contract_type: '',
    description: '',
    specifications: '',
    quantity: '',
    unit: 'un',
    desired_deadline: '',
    delivery_location: '',
    proposal_deadline: '',
    priority: 'normal',
    observations: '',
    sponsoring_supplier_id: '',
    sponsoring_supplier_name: '',
  })

  useEffect(() => {
    getCorporateSuppliers()
      .then(setSuppliers)
      .catch(() => {})
    getTradeActions()
      .then(setActions)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title || '',
        requester: editing.requester || userName,
        area: editing.area || 'Marketing',
        company: editing.company || '',
        branch: editing.branch || '',
        cost_center: editing.cost_center || '',
        campaign_name: editing.campaign_name || '',
        action_name: editing.action_name || '',
        contract_type: editing.contract_type || '',
        description: editing.description || '',
        specifications: editing.specifications || '',
        quantity: editing.quantity || '',
        unit: editing.unit || 'un',
        desired_deadline: editing.desired_deadline || '',
        delivery_location: editing.delivery_location || '',
        proposal_deadline: editing.proposal_deadline || '',
        priority: editing.priority || 'normal',
        observations: editing.observations || '',
        sponsoring_supplier_id: editing.sponsoring_supplier_id || '',
        sponsoring_supplier_name: editing.sponsoring_supplier_name || '',
      })
    } else {
      setForm({
        title: '',
        requester: userName,
        area: 'Marketing',
        company: '',
        branch: '',
        cost_center: '',
        campaign_name: '',
        action_name: '',
        contract_type: '',
        description: '',
        specifications: '',
        quantity: '',
        unit: 'un',
        desired_deadline: '',
        delivery_location: '',
        proposal_deadline: '',
        priority: 'normal',
        observations: '',
        sponsoring_supplier_id: '',
        sponsoring_supplier_name: '',
      })
    }
  }, [editing, userName, open])

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Título é obrigatório')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        await updateEq(editing.id, {
          ...form,
          status: editing.status === 'rascunho' ? 'em_preparacao' : editing.status,
        })
        toast.success('Cotação atualizada')
      } else {
        await createEq({ ...form, status: 'em_preparacao' })
        toast.success('Cotação criada')
      }
      onSaved()
    } catch {
      toast.error('Erro ao salvar cotação')
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Cotação' : 'Nova Cotação Externa'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Título *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="focus-visible:ring-[#005B2E]"
              placeholder="Ex: Confecção Catálogo Linha 2027"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Solicitante</Label>
              <Input
                value={form.requester}
                onChange={(e) => setForm({ ...form, requester: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Área</Label>
              <Input
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Empresa</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Filial</Label>
              <Input
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Centro de Custo</Label>
              <Input
                value={form.cost_center}
                onChange={(e) => setForm({ ...form, cost_center: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Tipo de Contrato</Label>
              <Input
                value={form.contract_type}
                onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
                placeholder="Ex: Serviço de Impressão"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Campanha</Label>
              <Input
                value={form.campaign_name}
                onChange={(e) => setForm({ ...form, campaign_name: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Ação Trade</Label>
              <Select
                value={form.action_name}
                onValueChange={(v) => setForm({ ...form, action_name: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((a) => (
                    <SelectItem key={a.id as string} value={(a.title as string) || ''}>
                      {(a.title as string) || '—'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="focus-visible:ring-[#005B2E]"
              rows={2}
              placeholder="Ex: Impressão de 5.000 catálogos, 48 páginas..."
            />
          </div>
          <div>
            <Label className="text-xs">Especificações Técnicas</Label>
            <Textarea
              value={form.specifications}
              onChange={(e) => setForm({ ...form, specifications: e.target.value })}
              className="focus-visible:ring-[#005B2E]"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Quantidade</Label>
              <Input
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Unidade</Label>
              <Input
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Prioridade</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v })}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EQ_PRIORITY.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Prazo Desejado</Label>
              <Input
                type="date"
                value={form.desired_deadline}
                onChange={(e) => setForm({ ...form, desired_deadline: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label className="text-xs">Prazo Propostas</Label>
              <Input
                type="date"
                value={form.proposal_deadline}
                onChange={(e) => setForm({ ...form, proposal_deadline: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Local de Entrega</Label>
            <Input
              value={form.delivery_location}
              onChange={(e) => setForm({ ...form, delivery_location: e.target.value })}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <div>
            <Label className="text-xs">Observações</Label>
            <Textarea
              value={form.observations}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
              className="focus-visible:ring-[#005B2E]"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{' '}
            {editing ? 'Atualizar' : 'Criar'} Cotação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
