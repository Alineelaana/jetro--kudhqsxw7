import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileUploadField, type PartnerFieldProps } from '@/components/partner-shared'
import { PartnerAddressFields } from '@/components/partner-address-fields'
import { PartnerDocumentSection } from '@/components/partner-document-section'
import { formatCpf, MARITAL_STATUS_OPTIONS } from '@/lib/partner-utils'

export function PartnerPfFields({
  form,
  update,
  onFileChange,
  existingFiles,
  partnerId,
}: PartnerFieldProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Nome Completo *</Label>
          <Input
            value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">CPF *</Label>
          <Input
            value={form.cpf}
            onChange={(e) => update('cpf', formatCpf(e.target.value))}
            placeholder="000.000.000-00"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Data de Nascimento *</Label>
          <Input
            type="date"
            value={form.birth_date}
            onChange={(e) => update('birth_date', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">E-mail *</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Telefone *</Label>
          <Input
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Estado Civil *</Label>
          <Select value={form.marital_status} onValueChange={(v) => update('marital_status', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {MARITAL_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Profissão *</Label>
          <Input
            value={form.profession}
            onChange={(e) => update('profession', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Renda Mensal *</Label>
          <Input
            value={form.monthly_income}
            onChange={(e) => update('monthly_income', e.target.value)}
            placeholder="R$ 0,00"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>

      <p className="text-sm font-bold text-[#005B2E]">Endereço</p>
      <PartnerAddressFields form={form} update={update} onFileChange={onFileChange} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FileUploadField
          label="Comprovante de Renda"
          field="income_proof"
          existingFile={existingFiles?.income_proof}
          partnerId={partnerId}
          onFileChange={onFileChange}
        />
        <FileUploadField
          label="Comprovante de Endereço"
          field="address_proof"
          existingFile={existingFiles?.address_proof}
          partnerId={partnerId}
          onFileChange={onFileChange}
        />
      </div>

      <PartnerDocumentSection
        form={form}
        update={update}
        onFileChange={onFileChange}
        existingFiles={existingFiles}
        partnerId={partnerId}
      />
    </div>
  )
}
