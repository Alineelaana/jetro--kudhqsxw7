import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { ProductTabProps } from '@/lib/product-types'

export function ProductTabObservations({ form, setField }: ProductTabProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Observações Internas</Label>
        <Textarea
          value={form.internal_observations}
          onChange={(e) => setField('internal_observations', e.target.value)}
          rows={8}
          placeholder="Observações internas sobre o produto, restrições, cuidados especiais, etc."
          className="focus-visible:ring-[#005B2E]"
        />
      </div>
    </div>
  )
}
