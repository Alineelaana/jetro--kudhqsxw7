import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PartnerPfFields } from '@/components/partner-pf-fields'
import { PartnerPjFields } from '@/components/partner-pj-fields'
import { PartnerFinancialDialog } from '@/components/partner-financial-dialog'
import { PartnerRestrictionControls } from '@/components/partner-restriction-controls'
import { PartnerTypeManager } from '@/components/partner-type-manager'
import { PartnerResponsiblesSection } from '@/components/partner-responsibles-section'
import { type PartnerFieldProps, type PartnerRecord } from '@/components/partner-shared'
import {
  createPartner,
  updatePartner,
  createClientForPartner,
  updateClientPassword,
} from '@/services/partners'
import { getPartnerTypes } from '@/services/partner-types'
import { EMPTY_PARTNER_FORM, type PartnerFormState } from '@/lib/partner-types'
import { Loader2, Save, Ban, Unlock, Wallet, AlertCircle, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  partner: PartnerRecord | null
  onSuccess: () => void
}

export function PartnerFormDialog({ open, onOpenChange, partner, onSuccess }: Props) {
  const { user } = useAuth()
  const [form, setForm] = useState<PartnerFormState>(EMPTY_PARTNER_FORM)
  const [files, setFiles] = useState<Record<string, File | null>>({})
  const [partnerTypes, setPartnerTypes] = useState<string[]>(['Cliente', 'Fornecedor', 'Usuário'])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [financialOpen, setFinancialOpen] = useState(false)
  const [rcaId, setRcaId] = useState('')
  const [televendasId, setTelevendasId] = useState('')
  const [responsavelDigitalId, setResponsavelDigitalId] = useState('')
  const isEditing = !!partner
  const isCliente = form.partner_type === 'Cliente'
  const userName = (user?.name as string) || (user?.email as string) || 'Sistema'

  useEffect(() => {
    getPartnerTypes()
      .then(setPartnerTypes)
      .catch(() => {})
  }, [open])

  useEffect(() => {
    if (partner) {
      setForm({
        partner_type: partner.partner_type || 'Cliente',
        person_type: partner.person_type || 'PF',
        email: partner.email || '',
        phone: partner.phone || '',
        cep: partner.cep || '',
        address: partner.address || '',
        address_number: partner.address_number || '',
        address_complement: partner.address_complement || '',
        address_district: partner.address_district || '',
        address_city: partner.address_city || '',
        address_state: partner.address_state || '',
        reference_point: partner.reference_point || '',
        full_name: partner.full_name || '',
        cpf: partner.cpf || '',
        birth_date: partner.birth_date || '',
        marital_status: partner.marital_status || '',
        profession: partner.profession || '',
        monthly_income: partner.monthly_income || '',
        rg_cnh: partner.rg_cnh || '',
        document_type: partner.document_type || '',
        document_number: partner.document_number || '',
        document_issuer: partner.document_issuer || '',
        document_issue_date: partner.document_issue_date || '',
        document_validity: partner.document_validity || '',
        company_name: partner.company_name || '',
        trade_name: partner.trade_name || '',
        cnpj: partner.cnpj || '',
        state_registration: partner.state_registration || '',
        observations: partner.observations || '',
        password: '',
        active: partner.active !== false,
        blocked: partner.blocked === true,
      })
    } else {
      setForm(EMPTY_PARTNER_FORM)
    }
    setRcaId(partner?.rca_id || '')
    setTelevendasId(partner?.televendas_id || '')
    setResponsavelDigitalId(partner?.responsavel_comercial_digital_id || '')
    setFiles({})
    setError('')
  }, [partner, open])

  const update = (field: keyof PartnerFormState, value: string) =>
    setForm((p) => ({ ...p, [field]: value }))
  const setFile = (field: string, file: File | null) => setFiles((p) => ({ ...p, [field]: file }))
  const existingFiles = partner
    ? {
        income_proof: partner.income_proof || '',
        address_proof: partner.address_proof || '',
        rg_cnh_doc: partner.rg_cnh_doc || '',
      }
    : {}
  const fieldProps: PartnerFieldProps = {
    form,
    update,
    onFileChange: setFile,
    existingFiles,
    partnerId: partner?.id,
  }

  const handleToggleBlocked = async () => {
    if (!partner) return
    try {
      const { updatePartnerField } = await import('@/services/partners')
      await updatePartnerField(partner.id, { blocked: !partner.blocked })
      toast({ title: partner.blocked ? 'Desbloqueado' : 'Bloqueado' })
      onSuccess()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isCliente && !isEditing && !form.email.trim()) {
      setError('E-mail é obrigatório para clientes.')
      return
    }
    if (isCliente && !isEditing && !form.password.trim()) {
      setError('Senha é obrigatória para clientes.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const formData = new FormData()
      const { password, ...fields } = form
      Object.entries(fields).forEach(([k, v]) => {
        if (typeof v === 'boolean') formData.append(k, v ? 'true' : 'false')
        else if (v !== undefined && v !== null) formData.append(k, String(v))
      })
      Object.entries(files).forEach(([k, f]) => {
        if (f) formData.append(k, f)
      })
      formData.append('rca_id', rcaId)
      formData.append('televendas_id', televendasId)
      formData.append('responsavel_comercial_digital_id', responsavelDigitalId)
      if (isEditing) {
        await updatePartner(partner.id, formData)
        if (isCliente && password) {
          if (partner.client_id) {
            await updateClientPassword(partner.client_id, password)
          } else if (form.email) {
            const name = form.person_type === 'PF' ? form.full_name : form.company_name
            await createClientForPartner(form.email, password, name || 'Cliente', partner.id)
          }
        }
        toast({ title: 'Parceiro atualizado' })
      } else {
        const created = await createPartner(formData)
        if (isCliente && form.email && password) {
          const name = form.person_type === 'PF' ? form.full_name : form.company_name
          await createClientForPartner(form.email, password, name || 'Cliente', created.id)
        }
        toast({ title: 'Parceiro criado' })
      }
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar.')
    }
    setSubmitting(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <Lock className="w-5 h-5 text-[#005B2E]" />
              {isEditing ? 'Editar Parceiro' : 'Novo Parceiro'}
              {isEditing && partner?.blocked && (
                <span className="text-xs bg-red-100 text-red-700 border border-red-300 px-2 py-0.5 rounded-full font-bold">
                  BLOQUEADO
                </span>
              )}
              {isEditing && partner?.financial_restriction && (
                <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                  RESTRITO
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Tipo de Parceiro</Label>
                <Select value={form.partner_type} onValueChange={(v) => update('partner_type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {partnerTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Tipo de Pessoa *</Label>
                <Select value={form.person_type} onValueChange={(v) => update('person_type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PF">Pessoa Física</SelectItem>
                    <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <PartnerTypeManager
              onTypesChange={() =>
                getPartnerTypes()
                  .then(setPartnerTypes)
                  .catch(() => {})
              }
            />

            {form.person_type === 'PF' && <PartnerPfFields {...fieldProps} />}
            {form.person_type === 'PJ' && <PartnerPjFields {...fieldProps} />}

            <PartnerResponsiblesSection
              rcaId={rcaId}
              televendasId={televendasId}
              responsavelDigitalId={responsavelDigitalId}
              onRcaChange={setRcaId}
              onTelevendasChange={setTelevendasId}
              onDigitalChange={setResponsavelDigitalId}
            />

            {isCliente && (
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">
                  {isEditing ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
                </Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Observações</Label>
              <Textarea
                value={form.observations}
                onChange={(e) => update('observations', e.target.value)}
                rows={3}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="flex items-center gap-3 bg-muted/40 px-4 py-3 rounded-lg border border-border">
              <span className="text-sm font-bold">Ativo</span>
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm((p) => ({ ...p, active: v }))}
                className="data-[state=checked]:bg-[#005B2E]"
              />
              <span
                className={`text-sm font-bold ${form.active ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {form.active ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            {isEditing && partner && (
              <PartnerRestrictionControls partner={partner} onSuccess={onSuccess} />
            )}

            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {error}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              {isEditing && isCliente && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFinancialOpen(true)}
                    className="border-[#C89B3C] text-[#C89B3C] hover:bg-[#C89B3C]/10 font-bold"
                  >
                    <Wallet className="w-4 h-4 mr-2" /> Financeiro
                  </Button>
                  <Button
                    type="button"
                    variant={partner.blocked ? 'outline' : 'destructive'}
                    onClick={handleToggleBlocked}
                    className="font-bold"
                  >
                    {partner.blocked ? (
                      <>
                        <Unlock className="w-4 h-4 mr-2" /> Desbloquear cliente
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4 mr-2" /> Bloquear cliente
                      </>
                    )}
                  </Button>
                </>
              )}
              <div className="flex-1" />
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}{' '}
                Salvar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <PartnerFinancialDialog
        open={financialOpen}
        onOpenChange={setFinancialOpen}
        partner={partner}
        responsibleUser={userName}
        onSuccess={onSuccess}
      />
    </>
  )
}
