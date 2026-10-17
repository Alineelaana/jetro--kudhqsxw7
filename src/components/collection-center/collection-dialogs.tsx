import { useState, type ReactNode } from 'react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Save } from 'lucide-react'
import {
  CONTACT_CHANNELS,
  CONTACT_RESULTS,
  PAYMENT_METHODS,
  DISPUTE_REASONS,
  NEXT_ACTION_TYPES,
  PRIORITIES,
} from '@/lib/collection-center-types'
import {
  saveContact,
  savePromise,
  saveDispute,
  logSendCollection,
} from '@/services/collection-center'
import { toast } from 'sonner'
import { buildWhatsAppUrl } from '@/lib/utils'

function Field({
  label,
  children,
  span2,
}: {
  label: string
  children: ReactNode
  span2?: boolean
}) {
  return (
    <div className={span2 ? 'sm:col-span-2 space-y-1' : 'space-y-1'}>
      <Label className="text-xs font-semibold">{label}</Label>
      {children}
    </div>
  )
}

const inputCls = 'h-9 text-sm focus-visible:ring-[#005B2E]'

export function ContactDialog({
  open,
  onOpenChange,
  cliente,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  cliente: string
  onSaved: () => void
}) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const handleSave = async () => {
    setSaving(true)
    try {
      await saveContact(cliente, { ...form, datetime: new Date().toISOString() })
      toast.success('Contato registrado')
      onOpenChange(false)
      setForm({})
      onSaved()
    } catch {
      toast.error('Erro ao registrar contato')
    }
    setSaving(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">Registrar Contato — {cliente}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Canal *">
            <Select
              value={form.channel || ''}
              onValueChange={(v) => setForm({ ...form, channel: v })}
            >
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_CHANNELS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Telefone/E-mail">
            <Input
              className={inputCls}
              value={form.contact || ''}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
            />
          </Field>
          <Field label="Pessoa Contatada">
            <Input
              className={inputCls}
              value={form.person || ''}
              onChange={(e) => setForm({ ...form, person: e.target.value })}
            />
          </Field>
          <Field label="Assunto">
            <Input
              className={inputCls}
              value={form.subject || ''}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
          </Field>
          <Field label="Observação" span2>
            <Textarea
              className="text-sm focus-visible:ring-[#005B2E]"
              rows={2}
              value={form.observation || ''}
              onChange={(e) => setForm({ ...form, observation: e.target.value })}
            />
          </Field>
          <Field label="Resultado *">
            <Select
              value={form.result || ''}
              onValueChange={(v) => setForm({ ...form, result: v })}
            >
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_RESULTS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Próxima Ação">
            <Select
              value={form.next_action || ''}
              onValueChange={(v) => setForm({ ...form, next_action: v })}
            >
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {NEXT_ACTION_TYPES.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Data Próx. Ação">
            <Input
              type="date"
              className={inputCls}
              value={form.next_action_date || ''}
              onChange={(e) => setForm({ ...form, next_action_date: e.target.value })}
            />
          </Field>
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
            )}{' '}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PromiseDialog({
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
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const totalSaldo = selectedTitles.reduce(
    (s, r) => s + (parseFloat(r.valor_original || '0') - parseFloat(r.valor_recebido || '0')),
    0,
  )
  const handleSave = async () => {
    setSaving(true)
    try {
      await savePromise(cliente, {
        value: form.value || String(totalSaldo),
        date: form.date,
        payment_method: form.payment_method,
        responsible: form.responsible,
        observation: form.observation,
        title_ids: selectedTitles.map((t) => t.id),
      })
      toast.success('Promessa registrada')
      onOpenChange(false)
      setForm({})
      onSaved()
    } catch {
      toast.error('Erro ao registrar promessa')
    }
    setSaving(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">Registrar Promessa — {cliente}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm">
            Títulos selecionados: {selectedTitles.length} | Saldo: R$ {totalSaldo.toFixed(2)}
          </p>
          <Field label="Valor Prometido *">
            <Input
              type="number"
              className={inputCls}
              defaultValue={totalSaldo.toFixed(2)}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </Field>
          <Field label="Data Prometida *">
            <Input
              type="date"
              className={inputCls}
              value={form.date || ''}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Field>
          <Field label="Forma de Pagamento">
            <Select
              value={form.payment_method || ''}
              onValueChange={(v) => setForm({ ...form, payment_method: v })}
            >
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Responsável">
            <Input
              className={inputCls}
              value={form.responsible || ''}
              onChange={(e) => setForm({ ...form, responsible: e.target.value })}
            />
          </Field>
          <Field label="Observação">
            <Textarea
              className="text-sm focus-visible:ring-[#005B2E]"
              rows={2}
              value={form.observation || ''}
              onChange={(e) => setForm({ ...form, observation: e.target.value })}
            />
          </Field>
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
            )}{' '}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DisputeDialog({
  open,
  onOpenChange,
  cliente,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  cliente: string
  onSaved: () => void
}) {
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const handleSave = async () => {
    setSaving(true)
    try {
      await saveDispute(cliente, {
        reason: form.reason,
        responsible: form.responsible,
        deadline: form.deadline,
      })
      toast.success('Disputa aberta')
      onOpenChange(false)
      setForm({})
      onSaved()
    } catch {
      toast.error('Erro ao abrir disputa')
    }
    setSaving(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">Abrir Disputa — {cliente}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Motivo *">
            <Select
              value={form.reason || ''}
              onValueChange={(v) => setForm({ ...form, reason: v })}
            >
              <SelectTrigger className={inputCls}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {DISPUTE_REASONS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Responsável">
            <Input
              className={inputCls}
              value={form.responsible || ''}
              onChange={(e) => setForm({ ...form, responsible: e.target.value })}
            />
          </Field>
          <Field label="Prazo">
            <Input
              type="date"
              className={inputCls}
              value={form.deadline || ''}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </Field>
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
            )}{' '}
            Abrir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SendCollectionDialog({
  open,
  onOpenChange,
  cliente,
  phone,
  totalVencido,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  cliente: string
  phone: string
  totalVencido: number
  onSaved: () => void
}) {
  const [channel, setChannel] = useState('WhatsApp')
  const [saving, setSaving] = useState(false)
  const message = `Olá! Identificamos títulos vencidos em nome de ${cliente} no valor de R$ ${totalVencido.toFixed(2)}. Por favor, entre em contato para regularização. - Jetro`
  const handleSend = async () => {
    setSaving(true)
    try {
      await logSendCollection(cliente, channel, message)
      if (channel === 'WhatsApp' && phone) window.open(buildWhatsAppUrl(phone, message), '_blank')
      else if (channel === 'E-mail')
        window.open(`mailto:?subject=Cobrança - ${cliente}&body=${encodeURIComponent(message)}`)
      toast.success('Cobrança enviada')
      onOpenChange(false)
      onSaved()
    } catch {
      toast.error('Erro ao enviar cobrança')
    }
    setSaving(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">Enviar Cobrança — {cliente}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Canal">
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger className={inputCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="E-mail">E-mail</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Mensagem" span2>
            <Textarea
              className="text-sm focus-visible:ring-[#005B2E]"
              rows={4}
              defaultValue={message}
              readOnly
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}{' '}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
