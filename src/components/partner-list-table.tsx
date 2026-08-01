import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type PartnerRecord } from '@/components/partner-shared'
import { RESTRICTION_ALERT_TEXT } from '@/lib/partner-constants'
import { formatCpf, formatCnpj } from '@/lib/partner-utils'
import { Pencil, AlertTriangle } from 'lucide-react'

interface Props {
  partners: PartnerRecord[]
  onEdit: (partner: PartnerRecord) => void
}

export function PartnerListTable({ partners, onEdit }: Props) {
  return (
    <div className="space-y-3">
      {partners.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Nenhum parceiro encontrado.</p>
      ) : (
        partners.map((p) => {
          const isRestricted = p.financial_restriction === true
          const isPF = p.person_type === 'PF'
          const name = isPF ? p.full_name : p.company_name
          const doc = isPF ? formatCpf(p.cpf || '') : formatCnpj(p.cnpj || '')
          return (
            <div
              key={p.id}
              className={`rounded-lg border p-4 transition-colors ${
                isRestricted
                  ? 'border-red-400 bg-red-50 shadow-sm'
                  : 'border-border bg-white hover:bg-[#005B2E]/5'
              }`}
            >
              {isRestricted && (
                <div className="flex items-center gap-2 mb-3 bg-red-100 border border-red-400 rounded-lg p-2 text-red-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-bold">{RESTRICTION_ALERT_TEXT}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 flex-1">
                  <div>
                    <p className="text-xs text-muted-foreground">Código</p>
                    <p className="text-sm font-mono">{p.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {isPF ? 'Nome' : 'Razão Social'}
                    </p>
                    <p className="text-sm font-bold truncate max-w-[160px]">{name || '—'}</p>
                  </div>
                  {!isPF && (
                    <div>
                      <p className="text-xs text-muted-foreground">Nome Fantasia</p>
                      <p className="text-sm truncate max-w-[140px]">{p.trade_name || '—'}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground">CPF/CNPJ</p>
                    <p className="text-sm">{doc || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tipo</p>
                    <Badge variant="outline" className="text-xs">
                      {p.partner_type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pessoa</p>
                    <Badge variant="outline" className="text-xs">
                      {isPF ? 'Física' : 'Jurídica'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isRestricted && (
                    <span className="text-xs font-bold text-red-700 bg-red-200 px-2 py-1 rounded-full">
                      RESTRITO
                    </span>
                  )}
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      p.active !== false
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p.active !== false ? 'Ativo' : 'Inativo'}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(p)}
                    className="border-[#005B2E] text-[#005B2E]"
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                  </Button>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
