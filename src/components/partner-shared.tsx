import type {
  PartnerFormState,
  FinancialEntry,
  RestrictionEntry,
  DocumentMetadata,
} from '@/lib/partner-types'
import { getFileUrl } from '@/lib/partner-utils'
import { Label } from '@/components/ui/label'
import { Upload, FileText } from 'lucide-react'

export interface PartnerFieldProps {
  form: PartnerFormState
  update: (field: keyof PartnerFormState, value: string) => void
  onFileChange: (field: string, file: File | null) => void
  existingFiles?: Record<string, string>
  partnerId?: string
}

export interface PartnerRecord {
  id: string
  partner_type: string
  person_type: 'PF' | 'PJ'
  active: boolean
  blocked: boolean
  email: string
  phone: string
  address: string
  address_number: string
  address_complement: string
  address_district: string
  address_city: string
  address_state: string
  reference_point: string
  cep: string
  full_name: string
  cpf: string
  birth_date: string
  marital_status: string
  profession: string
  monthly_income: string
  rg_cnh: string
  document_type: string
  document_number: string
  document_issuer: string
  document_issue_date: string
  document_validity: string
  company_name: string
  trade_name: string
  cnpj: string
  state_registration: string
  observations: string
  client_id: string
  income_proof: string
  address_proof: string
  rg_cnh_doc: string
  financial_history: FinancialEntry[]
  financial_restriction: boolean
  restriction_reason: string
  restriction_history: RestrictionEntry[]
  documents_metadata: DocumentMetadata[]
  rca_id?: string
  televendas_id?: string
  responsavel_comercial_digital_id?: string
  created: string
  updated: string
}

export function FileUploadField({
  label,
  field,
  existingFile,
  partnerId,
  onFileChange,
}: {
  label: string
  field: string
  existingFile?: string
  partnerId?: string
  onFileChange: (field: string, file: File | null) => void
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="flex items-center gap-2">
        <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm flex-1">
          <Upload className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{existingFile || 'Escolher arquivo'}</span>
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => onFileChange(field, e.target.files?.[0] || null)}
          />
        </label>
        {existingFile && partnerId && (
          <a
            href={getFileUrl(partnerId, existingFile)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#005B2E] hover:text-[#01361D] flex-shrink-0"
          >
            <FileText className="w-5 h-5" />
          </a>
        )}
      </div>
    </div>
  )
}
