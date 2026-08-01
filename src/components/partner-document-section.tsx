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

export function PartnerDocumentSection({
  form,
  update,
  onFileChange,
  existingFiles,
  partnerId,
}: PartnerFieldProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-bold text-[#005B2E]">Documento (RG / CNH)</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Tipo de Documento</Label>
          <Select value={form.document_type} onValueChange={(v) => update('document_type', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RG">RG</SelectItem>
              <SelectItem value="CNH">CNH</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Número</Label>
          <Input
            value={form.document_number}
            onChange={(e) => update('document_number', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Órgão Emissor</Label>
          <Input
            value={form.document_issuer}
            onChange={(e) => update('document_issuer', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Data de Emissão</Label>
          <Input
            type="date"
            value={form.document_issue_date}
            onChange={(e) => update('document_issue_date', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold">Validade (quando existir)</Label>
          <Input
            type="date"
            value={form.document_validity}
            onChange={(e) => update('document_validity', e.target.value)}
            className="focus-visible:ring-[#005B2E]"
          />
        </div>
      </div>
      <FileUploadField
        label="Documento RG/CNH (arquivo)"
        field="rg_cnh_doc"
        existingFile={existingFiles?.rg_cnh_doc}
        partnerId={partnerId}
        onFileChange={onFileChange}
      />
    </div>
  )
}
