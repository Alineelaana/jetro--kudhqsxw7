import { useState, useEffect } from 'react'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  createLead,
  updateLead,
  generateLeadNumber,
  checkLeadDuplicate,
  createOpportunity,
  generateOpportunityNumber,
  createHistoryEntry,
} from '@/services/crm'
import { useAuth } from '@/hooks/use-auth'
import {
  LEAD_SOURCES,
  LEAD_STATUS,
  LEAD_TEMPERATURES,
  PERSON_TYPES,
  COMPANY_SIZES,
  type CrmLead,
} from '@/lib/crm-types'
import { Loader2, Save, AlertCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

function calcScore(q: Record<string, string>): { score: number; temp: string } {
  let s = 0
  if (q.orcamento && parseFloat(q.orcamento) > 0) s += 15
  if (q.prazo && q.prazo !== 'Sem prazo') s += 20
  if (q.autoridade && q.autoridade !== 'Não') s += 15
  if (q.funcionarios && parseInt(q.funcionarios) > 10) s += 10
  if (q.faturamento && parseFloat(q.faturamento) > 100000) s += 15
  if (q.regiao) s += 10
  if (q.concorrente) s += 5
  if (q.necessidade) s += 10
  return { score: Math.min(s, 100), temp: s > 70 ? 'Quente' : s >= 40 ? 'Morno' : 'Frio' }
}

export function CrmLeadDialog({
  open,
  onOpenChange,
  lead,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  lead: CrmLead | null
  onSuccess: () => void
}) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<Record<string, string>>({})
  const [qualif, setQualif] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setError('')
      setFieldErrors({})
      if (lead) {
        setForm({
          name: lead.name || '',
          trade_name: lead.trade_name || '',
          person_type: lead.person_type || 'PF',
          cpf_cnpj: lead.cpf_cnpj || '',
          phone: lead.phone || '',
          whatsapp: lead.whatsapp || '',
          email: lead.email || '',
          city: lead.city || '',
          state: lead.state || '',
          segment: lead.segment || '',
          company_size: lead.company_size || '',
          lead_source: lead.lead_source || '',
          campaign: lead.campaign || '',
          product_interest: lead.product_interest || '',
          entry_date: lead.entry_date || new Date().toISOString().split('T')[0],
          next_action: lead.next_action || '',
          observations: lead.observations || '',
          status: lead.status || 'Novo',
          company: lead.company || 'Jetro',
          filial: lead.filial || 'Matriz',
        })
        const qd = lead.qualification_data || {}
        setQualif({
          necessidade: (qd.necessidade as string) || '',
          produto_interesse: (qd.produto_interesse as string) || '',
          orcamento: (qd.orcamento as string) || '',
          prazo: (qd.prazo as string) || '',
          autoridade: (qd.autoridade as string) || '',
          funcionarios: (qd.funcionarios as string) || '',
          faturamento: (qd.faturamento as string) || '',
          regiao: (qd.regiao as string) || '',
          potencial: (qd.potencial as string) || '',
          concorrente: (qd.concorrente as string) || '',
          observacoes: (qd.observacoes as string) || '',
          temperature: lead.temperature || 'Frio',
        })
      } else {
        setForm({
          person_type: 'PF',
          lead_source: 'Site',
          status: 'Novo',
          entry_date: new Date().toISOString().split('T')[0],
          company: 'Jetro',
          filial: 'Matriz',
        })
        setQualif({ temperature: 'Frio' })
      }
    }
  }, [open, lead])

  const update = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }))
    setFieldErrors((p) => ({ ...p, [k]: '' }))
  }
  const updateQ = (k: string, v: string) => setQualif((p) => ({ ...p, [k]: v }))

  const handleSave = async (convert: boolean = false) => {
    setError('')
    setFieldErrors({})
    if (!form.name?.trim()) {
      setFieldErrors({ name: 'Nome é obrigatório' })
      return
    }
    const checks = [
      { f: 'cpf_cnpj', v: form.cpf_cnpj, label: 'CPF/CNPJ' },
      { f: 'email', v: form.email, label: 'E-mail' },
      { f: 'phone', v: form.phone, label: 'Telefone' },
    ]
    for (const c of checks) {
      if (c.v?.trim()) {
        const dup = await checkLeadDuplicate(c.f, c.v, lead?.id)
        if (dup) {
          setFieldErrors({ [c.f]: `${c.label} já cadastrado em outro lead` })
          return
        }
      }
    }
    setSaving(true)
    try {
      const { score, temp } = calcScore(qualif)
      const leadNumber = lead?.lead_number || (await generateLeadNumber())
      const userName = (user?.name as string) || (user?.email as string) || 'Sistema'
      const data: Record<string, unknown> = {
        ...form,
        lead_number: leadNumber,
        responsible_id: lead?.responsible_id || user?.id || '',
        responsible_name: lead?.responsible_name || userName,
        qualification_data: qualif,
        temperature: qualif.temperature || temp,
        qualification_score: score,
        converted: convert,
      }
      let savedId = lead?.id
      if (lead) {
        await updateLead(lead.id, data)
      } else {
        const rec = await createLead(data)
        savedId = rec.id
      }
      await createHistoryEntry({
        entity_type: 'lead',
        entity_id: savedId || '',
        entity_name: form.name,
        type: lead ? 'update' : 'create',
        description: lead ? 'Lead atualizado' : 'Lead criado',
        user_name: userName,
        date: new Date().toISOString(),
        company: form.company,
        filial: form.filial,
      })
      if (convert && savedId) {
        const oppNum = await generateOpportunityNumber()
        const opp = await createOpportunity({
          opportunity_number: oppNum,
          lead_id: savedId,
          client_name: form.name,
          title: `Oportunidade - ${form.name}`,
          product_service: form.product_interest || '',
          estimated_value: qualif.orcamento || '0',
          probability: score,
          open_date: new Date().toISOString().split('T')[0],
          status: 'Em Aberto',
          responsible_id: user?.id || '',
          responsible_name: userName,
          company: form.company,
          filial: form.filial,
          stage_entered_at: new Date().toISOString(),
        })
        await updateLead(savedId, { status: 'Convertido', converted: true, opportunity_id: opp.id })
        toast({ title: 'Lead convertido em oportunidade!' })
      } else {
        toast({ title: lead ? 'Lead atualizado' : 'Lead criado' })
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar'
      setError(msg)
    }
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">
            {lead ? 'Editar' : 'Novo'} Lead{lead ? ` — ${lead.lead_number}` : ''}
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="dados">
          <TabsList>
            <TabsTrigger value="dados">Dados do Lead</TabsTrigger>
            <TabsTrigger value="qualif">Qualificação</TabsTrigger>
          </TabsList>
          <TabsContent value="dados" className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Nome / Razão Social *</Label>
                <Input
                  value={form.name || ''}
                  onChange={(e) => update('name', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
                {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Nome Fantasia</Label>
                <Input
                  value={form.trade_name || ''}
                  onChange={(e) => update('trade_name', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Tipo de Pessoa</Label>
                <Select
                  value={form.person_type || 'PF'}
                  onValueChange={(v) => update('person_type', v)}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PERSON_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">CPF / CNPJ</Label>
                <Input
                  value={form.cpf_cnpj || ''}
                  onChange={(e) => update('cpf_cnpj', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
                {fieldErrors.cpf_cnpj && (
                  <p className="text-xs text-red-500">{fieldErrors.cpf_cnpj}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Telefone</Label>
                <Input
                  value={form.phone || ''}
                  onChange={(e) => update('phone', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
                {fieldErrors.phone && <p className="text-xs text-red-500">{fieldErrors.phone}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">WhatsApp</Label>
                <Input
                  value={form.whatsapp || ''}
                  onChange={(e) => update('whatsapp', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">E-mail</Label>
                <Input
                  value={form.email || ''}
                  onChange={(e) => update('email', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
                {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Cidade</Label>
                <Input
                  value={form.city || ''}
                  onChange={(e) => update('city', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Estado</Label>
                <Input
                  value={form.state || ''}
                  onChange={(e) => update('state', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Segmento</Label>
                <Input
                  value={form.segment || ''}
                  onChange={(e) => update('segment', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Porte da Empresa</Label>
                <Select
                  value={form.company_size || ''}
                  onValueChange={(v) => update('company_size', v)}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Origem do Lead</Label>
                <Select
                  value={form.lead_source || ''}
                  onValueChange={(v) => update('lead_source', v)}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Campanha</Label>
                <Input
                  value={form.campaign || ''}
                  onChange={(e) => update('campaign', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Produto/Serviço de Interesse</Label>
                <Input
                  value={form.product_interest || ''}
                  onChange={(e) => update('product_interest', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Data de Entrada</Label>
                <Input
                  type="date"
                  value={form.entry_date || ''}
                  onChange={(e) => update('entry_date', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Status</Label>
                <Select value={form.status || 'Novo'} onValueChange={(v) => update('status', v)}>
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm font-semibold">Próxima Ação</Label>
                <Input
                  value={form.next_action || ''}
                  onChange={(e) => update('next_action', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm font-semibold">Observações</Label>
                <Textarea
                  value={form.observations || ''}
                  onChange={(e) => update('observations', e.target.value)}
                  rows={2}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="qualif" className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm font-semibold">Necessidade do Cliente</Label>
                <Textarea
                  value={qualif.necessidade || ''}
                  onChange={(e) => updateQ('necessidade', e.target.value)}
                  rows={2}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Orçamento Estimado</Label>
                <Input
                  value={qualif.orcamento || ''}
                  onChange={(e) => updateQ('orcamento', e.target.value)}
                  placeholder="R$"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Prazo para Compra</Label>
                <Select value={qualif.prazo || ''} onValueChange={(v) => updateQ('prazo', v)}>
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Imediato">Imediato</SelectItem>
                    <SelectItem value="30 dias">30 dias</SelectItem>
                    <SelectItem value="60 dias">60 dias</SelectItem>
                    <SelectItem value="90 dias">90 dias</SelectItem>
                    <SelectItem value="Sem prazo">Sem prazo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Autoridade de Decisão</Label>
                <Select
                  value={qualif.autoridade || ''}
                  onValueChange={(v) => updateQ('autoridade', v)}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim — Decisor</SelectItem>
                    <SelectItem value="Influenciador">Influenciador</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Nº de Funcionários</Label>
                <Input
                  type="number"
                  value={qualif.funcionarios || ''}
                  onChange={(e) => updateQ('funcionarios', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Faturamento Estimado</Label>
                <Input
                  value={qualif.faturamento || ''}
                  onChange={(e) => updateQ('faturamento', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Região Atendida</Label>
                <Input
                  value={qualif.regiao || ''}
                  onChange={(e) => updateQ('regiao', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Potencial de Compra</Label>
                <Input
                  value={qualif.potencial || ''}
                  onChange={(e) => updateQ('potencial', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Concorrente Atual</Label>
                <Input
                  value={qualif.concorrente || ''}
                  onChange={(e) => updateQ('concorrente', e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Classificação (Frio/Morno/Quente)</Label>
                <Select
                  value={qualif.temperature || 'Frio'}
                  onValueChange={(v) => updateQ('temperature', v)}
                >
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_TEMPERATURES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-sm font-semibold">Observações de Qualificação</Label>
                <Textarea
                  value={qualif.observacoes || ''}
                  onChange={(e) => updateQ('observacoes', e.target.value)}
                  rows={2}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="border-blue-600 text-blue-600"
          >
            <Save className="w-4 h-4 mr-2" /> Salvar e Converter
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
