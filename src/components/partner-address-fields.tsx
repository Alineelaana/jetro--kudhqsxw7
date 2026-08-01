import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type PartnerFieldProps } from '@/components/partner-shared'
import { formatCep, lookupCep } from '@/lib/partner-utils'

export function PartnerAddressFields({ form, update }: PartnerFieldProps) {
  const handleCep = async (cep: string) => {
    update('cep', formatCep(cep))
    const data = await lookupCep(cep)
    if (data) {
      update('address', data.logradouro || '')
      update('address_district', data.bairro || '')
      update('address_city', data.localidade || '')
      update('address_state', data.uf || '')
    }
  }

  return (
    <div className="space-y-4">
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
          <Label className="text-sm font-semibold">Rua</Label>
          <Input
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Número</Label>
          <Input
            value={form.address_number}
            onChange={(e) => update('address_number', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Complemento</Label>
          <Input
            value={form.address_complement}
            onChange={(e) => update('address_complement', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Bairro</Label>
          <Input
            value={form.address_district}
            onChange={(e) => update('address_district', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Cidade</Label>
          <Input
            value={form.address_city}
            onChange={(e) => update('address_city', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Estado</Label>
          <Input
            value={form.address_state}
            onChange={(e) => update('address_state', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Ponto de Referência</Label>
          <Input
            value={form.reference_point}
            onChange={(e) => update('reference_point', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
    </div>
  )
}
