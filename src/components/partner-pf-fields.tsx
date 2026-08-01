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
import { formatCpf, formatCep, lookupCep, MARITAL_STATUS_OPTIONS } from '@/lib/partner-utils'

export function PartnerPfFields({
  form,
  update,
  onFileChange,
  existingFiles,
  partnerId,
}: PartnerFieldProps) {
  const handleCep = async (cep: string) => {
    update('cep', formatCep(cep))
    const data = await lookupCep(cep)
    if (data) {
      const addr =
        `${data.logradouro || ''}, ${data.bairro || ''}, ${data.localidade || ''} - ${data.uf || ''}`.trim()
      update('address', addr)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Nome completo</Label>
          <Input
            value={form.full_name}
            onChange={(e) => update('full_name', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">CPF</Label>
          <Input
            value={form.cpf}
            onChange={(e) => update('cpf', formatCpf(e.target.value))}
            placeholder="000.000.000-00"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Data de nascimento</Label>
          <Input
            type="date"
            value={form.birth_date}
            onChange={(e) => update('birth_date', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">E-mail</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Estado civil</Label>
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
          <Label className="text-sm font-semibold">Profissão</Label>
          <Input
            value={form.profession}
            onChange={(e) => update('profession', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Renda mensal</Label>
          <Input
            value={form.monthly_income}
            onChange={(e) => update('monthly_income', e.target.value)}
            placeholder="R$ 0,00"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">RG ou CNH</Label>
          <Input
            value={form.rg_cnh}
            onChange={(e) => update('rg_cnh', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">CEP</Label>
          <Input
            value={form.cep}
            onChange={(e) => handleCep(e.target.value)}
            placeholder="00000-000"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Endereço</Label>
          <Input
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-sm font-semibold">Ponto de referência</Label>
          <Input
            value={form.reference_point}
            onChange={(e) => update('reference_point', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FileUploadField
          label="Comprovante de renda"
          field="income_proof"
          existingFile={existingFiles?.income_proof}
          partnerId={partnerId}
          onFileChange={onFileChange}
        />
        <FileUploadField
          label="Comprovante de endereço"
          field="address_proof"
          existingFile={existingFiles?.address_proof}
          partnerId={partnerId}
          onFileChange={onFileChange}
        />
        <FileUploadField
          label="Documento RG/CNH"
          field="rg_cnh_doc"
          existingFile={existingFiles?.rg_cnh_doc}
          partnerId={partnerId}
          onFileChange={onFileChange}
        />
      </div>
    </div>
  )
}
