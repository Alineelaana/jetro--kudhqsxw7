import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FileUploadField, type PartnerFieldProps } from '@/components/partner-shared'
import { PartnerAddressFields } from '@/components/partner-address-fields'
import { formatCnpj, formatPhone, formatCep, lookupCnpj } from '@/lib/partner-utils'
import { Loader2, Building2, AlertCircle } from 'lucide-react'

const CNPJ_FIELDS: Array<{
  key: string
  getValue: (d: NonNullable<Awaited<ReturnType<typeof lookupCnpj>>>) => string
}> = [
  { key: 'company_name', getValue: (d) => d.nome || '' },
  { key: 'trade_name', getValue: (d) => d.fantasia || '' },
  { key: 'cnpj', getValue: (d) => formatCnpj(d.cnpj || '') },
  { key: 'address', getValue: (d) => [d.logradouro, d.numero].filter(Boolean).join(', ').trim() },
  { key: 'address_complement', getValue: (d) => d.complemento || '' },
  { key: 'address_district', getValue: (d) => d.bairro || '' },
  { key: 'address_city', getValue: (d) => d.municipio || '' },
  { key: 'address_state', getValue: (d) => d.uf || '' },
  { key: 'cep', getValue: (d) => formatCep(d.cep || '') },
  { key: 'email', getValue: (d) => d.email || '' },
  { key: 'phone', getValue: (d) => formatPhone(d.telefone || '') },
]

export function PartnerPjFields({
  form,
  update,
  onFileChange,
  existingFiles,
  partnerId,
}: PartnerFieldProps) {
  const [importing, setImporting] = useState(false)
  const [cnpjError, setCnpjError] = useState('')
  const [confirmOverwrite, setConfirmOverwrite] = useState(false)
  const [pendingData, setPendingData] = useState<Record<string, string> | null>(null)
  const editedFields = useRef<Set<string>>(new Set())

  const manualUpdate = (field: keyof PartnerFieldProps['form'], value: string) => {
    editedFields.current.add(field as string)
    update(field, value)
  }

  const applyData = (data: Record<string, string>, overwriteEdited: boolean) => {
    Object.entries(data).forEach(([field, value]) => {
      if (!overwriteEdited && editedFields.current.has(field)) return
      update(field as keyof PartnerFieldProps['form'], value)
    })
  }

  const handleCnpjLookup = async () => {
    const cleanCnpj = form.cnpj.replace(/\D/g, '')
    if (cleanCnpj.length !== 14) {
      setCnpjError('CNPJ deve conter 14 dígitos.')
      return
    }
    setCnpjError('')
    setImporting(true)
    const data = await lookupCnpj(form.cnpj)
    setImporting(false)
    if (!data) {
      setCnpjError('Não foi possível obter os dados. Verifique o CNPJ e tente novamente.')
      return
    }
    const fieldMap: Record<string, string> = {}
    CNPJ_FIELDS.forEach(({ key, getValue }) => {
      fieldMap[key] = getValue(data)
    })
    const hasEditedWithValues = Object.keys(fieldMap).some(
      (field) => editedFields.current.has(field) && (form as Record<string, unknown>)[field],
    )
    if (hasEditedWithValues) {
      setPendingData(fieldMap)
      setConfirmOverwrite(true)
    } else {
      applyData(fieldMap, false)
    }
  }

  const handleCnpjKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleCnpjLookup()
    }
  }

  const handleConfirmOverwrite = () => {
    if (pendingData) applyData(pendingData, true)
    setPendingData(null)
  }

  const handleCancelOverwrite = () => {
    if (pendingData) applyData(pendingData, false)
    setPendingData(null)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Razão Social</Label>
          <Input
            value={form.company_name}
            onChange={(e) => manualUpdate('company_name', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Nome Fantasia</Label>
          <Input
            value={form.trade_name}
            onChange={(e) => manualUpdate('trade_name', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-sm font-semibold">CNPJ</Label>
          <div className="flex items-center gap-2">
            <Input
              value={form.cnpj}
              onChange={(e) => {
                manualUpdate('cnpj', formatCnpj(e.target.value))
                setCnpjError('')
              }}
              onKeyDown={handleCnpjKeyDown}
              placeholder="00.000.000/0000-00"
              className="focus-visible:ring-[#005B2E]"
            />
            {importing && <Loader2 className="w-5 h-5 text-[#005B2E] animate-spin flex-shrink-0" />}
          </div>
          {cnpjError && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {cnpjError}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Digite o CNPJ e pressione Enter para buscar os dados na Receita Federal.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Inscrição Estadual</Label>
          <Input
            value={form.state_registration}
            onChange={(e) => manualUpdate('state_registration', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">E-mail</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => manualUpdate('email', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Telefone</Label>
          <Input
            value={form.phone}
            onChange={(e) => manualUpdate('phone', formatPhone(e.target.value))}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleCnpjLookup}
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
      <PartnerAddressFields form={form} update={manualUpdate} onFileChange={onFileChange} />
      <FileUploadField
        label="Comprovante de Endereço"
        field="address_proof"
        existingFile={existingFiles?.address_proof}
        partnerId={partnerId}
        onFileChange={onFileChange}
      />
      <AlertDialog open={confirmOverwrite} onOpenChange={setConfirmOverwrite}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sobrescrever campos editados?</AlertDialogTitle>
            <AlertDialogDescription>
              Alguns campos já foram preenchidos manualmente. Deseja substituí-los pelos dados da
              Receita Federal?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelOverwrite}>
              Manter campos atuais
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOverwrite}>
              Sim, sobrescrever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
