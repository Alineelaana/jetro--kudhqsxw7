import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { MkExternalQuotation, MkQuotationProposal } from '@/lib/mk-external-quotations-types'
import { Star } from 'lucide-react'

interface MkEqComparativeProps {
  quotation: MkExternalQuotation
}

export function MkEqComparative({ quotation }: MkEqComparativeProps) {
  const proposals = quotation.proposals || []
  if (proposals.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          Nenhuma proposta recebida ainda.
        </CardContent>
      </Card>
    )
  }

  const criteria: Array<{
    label: string
    get: (p: MkQuotationProposal) => string
    highlight?: (p: MkQuotationProposal) => boolean
  }> = [
    {
      label: 'Valor Final',
      get: (p) => `R$ ${p.final_value || '0'}`,
      highlight: (p) => p.supplier_id === quotation.recommended_supplier_id,
    },
    { label: 'Valor Unitário', get: (p) => `R$ ${p.unit_price || '0'}` },
    { label: 'Desconto', get: (p) => `R$ ${p.discount || '0'}` },
    { label: 'Frete', get: (p) => `R$ ${p.freight || '0'}` },
    { label: 'Prazo Produção', get: (p) => p.production_deadline || '—' },
    { label: 'Prazo Entrega', get: (p) => p.delivery_deadline || '—' },
    { label: 'Condição Pagamento', get: (p) => p.payment_condition || '—' },
    { label: 'Entrada', get: (p) => `R$ ${p.entry || '0'}` },
    { label: 'Parcelas', get: (p) => p.installments || '—' },
    { label: 'Validade Proposta', get: (p) => p.validity || '—' },
    { label: 'Garantia', get: (p) => p.warranty || '—' },
    { label: 'Especificação Técnica', get: (p) => p.technical_specifications || '—' },
    { label: 'Observações', get: (p) => p.observations || '—' },
  ]

  const lowestValue = Math.min(
    ...proposals.map((p) => parseFloat(p.final_value || '0')).filter((v) => v > 0),
  )

  return (
    <Card className="border-2 border-[#005B2E]/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#01361D] text-white">
              <th className="text-left px-3 py-2 font-bold sticky left-0 bg-[#01361D]">Critério</th>
              {proposals.map((p) => (
                <th key={p.id} className="text-left px-3 py-2 font-bold min-w-[140px]">
                  <div className="flex items-center gap-1">
                    {p.supplier_name}
                    {p.supplier_id === quotation.recommended_supplier_id && (
                      <Star className="w-3 h-3 text-[#C89B3C] fill-[#C89B3C]" />
                    )}
                  </div>
                  <span className="text-[10px] font-normal opacity-70">
                    {p.supplier_quotation_number}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((c, idx) => (
              <tr key={idx} className={cn('border-b', idx % 2 === 0 ? 'bg-muted/30' : '')}>
                <td className="px-3 py-2 font-semibold sticky left-0 bg-inherit">{c.label}</td>
                {proposals.map((p) => {
                  const isLowest =
                    c.label === 'Valor Final' && parseFloat(p.final_value || '0') === lowestValue
                  const isRec = c.highlight?.(p)
                  return (
                    <td
                      key={p.id}
                      className={cn(
                        'px-3 py-2',
                        isLowest && 'bg-emerald-50 font-bold',
                        isRec && 'bg-[#C89B3C]/10',
                      )}
                    >
                      {c.get(p)}
                      {isLowest && <span className="ml-1 text-[9px] text-emerald-600">▼</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CardContent className="py-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-3">
          <span>⭐ Fornecedor Recomendado</span>
          <span>▼ Menor Valor</span>
          <span className="text-amber-600">
            ⚠ A seleção não é automática por menor preço — considere todos os critérios.
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
