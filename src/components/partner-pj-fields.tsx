import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FileUploadField, type PartnerFieldProps } from '@/components/partner-shared'
import { formatCnpj, formatCep, formatPhone, lookupCep, lookupCnpj } from '@/lib/partner-utils'
import { Loader2, Building2 } from 'lucide-react'

export function PartnerPjFields({
  form,
  update,
  onFileChange,
  existingFiles,
  partnerId,
}: PartnerFieldProps) {
  const [importing, setImporting] = useState(false)

  const handleCep = async (cep: string) => {
    update('cep', formatCep(cep))
    const data = await lookupCep(cep)
    if (data) {
      const addr =
        `${data.logradouro || ''}, ${data.bairro || ''}, ${data.localidade || ''} - ${data.uf || ''}`.trim()
      update('address', addr)
    }
  }

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
    if (data.cep) update('cep', formatCep(data.cep))
    if (data.razao_social) update('company_name', data.razao_social)
    if (data.nome_fantasia) update('trade_name', data.nome_fantasia)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Razão social</Label>
          <Input
            value={form.company_name}
            onChange={(e) => update('company_name', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Nome fantasia</Label>
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
          <Label className="text-sm font-semibold">Inscrição estadual</Label>
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
        Importar endereço da Receita Federal
      </Button>
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
      <FileUploadField
        label="Comprovante de endereço"
        field="address_proof"
        existingFile={existingFiles?.address_proof}
        partnerId={partnerId}
        onFileChange={onFileChange}
      />
    </div>
  )
}
