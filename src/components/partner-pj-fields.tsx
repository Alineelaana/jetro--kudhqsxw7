import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FileUploadField, type PartnerFieldProps } from '@/components/partner-shared'
import { PartnerAddressFields } from '@/components/partner-address-fields'
import { formatCnpj, formatPhone, lookupCnpj } from '@/lib/partner-utils'
import { Loader2, Building2 } from 'lucide-react'

export function PartnerPjFields({
  form,
  update,
  onFileChange,
  existingFiles,
  partnerId,
}: PartnerFieldProps) {
  const [importing, setImporting] = useState(false)

  const handleImportCnpj = async () => {
    setImporting(true)
    const data = await lookupCnpj(form.cnpj)
    setImporting(false)
    if (!data) return
    const addr = [data.descricao_tipo_de_logradouro, data.logradouro, data.numero]
      .filter(Boolean)
      .join(' ')
    update(
      'address',
      `${addr}, ${data.bairro || ''}, ${data.municipio || ''} - ${data.uf || ''}`.trim(),
    )
    if (data.cep) update('cep', data.cep)
    if (data.bairro) update('address_district', data.bairro)
    if (data.municipio) update('address_city', data.municipio)
    if (data.uf) update('address_state', data.uf)
    if (data.razao_social) update('company_name', data.razao_social)
    if (data.nome_fantasia) update('trade_name', data.nome_fantasia)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Razão Social</Label>
          <Input
            value={form.company_name}
            onChange={(e) => update('company_name', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Nome Fantasia</Label>
          <Input
            value={form.trade_name}
            onChange={(e) => update('trade_name', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">CNPJ</Label>
          <Input
            value={form.cnpj}
            onChange={(e) => update('cnpj', formatCnpj(e.target.value))}
            placeholder="00.000.000/0000-00"
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Inscrição Estadual</Label>
          <Input
            value={form.state_registration}
            onChange={(e) => update('state_registration', e.target.value)}
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
          <Label className="text-sm font-semibold">Telefone</Label>
          <Input
            value={form.phone}
            onChange={(e) => update('phone', formatPhone(e.target.value))}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleImportCnpj}
        disabled={importing || !form.cnpj}
        className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 font-bold"
      >
        {importing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Building2 className="w-4 h-4 mr-2" />
        )}
        Importar da Receita Federal
      </Button>
      <p className="text-sm font-bold text-[#005B2E]">Endereço</p>
      <PartnerAddressFields form={form} update={update} onFileChange={onFileChange} />
      <FileUploadField
        label="Comprovante de Endereço"
        field="address_proof"
        existingFile={existingFiles?.address_proof}
        partnerId={partnerId}
        onFileChange={onFileChange}
      />
    </div>
  )
}
