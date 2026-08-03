import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'
import { type FormVariation } from '@/lib/product-types'

interface Props {
  variations: FormVariation[]
  onChange: (variations: FormVariation[]) => void
}

export function ProductVariationsSection({ variations, onChange }: Props) {
  const addVariation = () => {
    onChange([
      ...variations,
      { id: `var-${Date.now()}-${variations.length}`, size: '', color: '', price: '' },
    ])
  }

  const updateVariation = (
    index: number,
    field: keyof Omit<FormVariation, 'id'>,
    value: string,
  ) => {
    onChange(variations.map((v, i) => (i === index ? { ...v, [field]: value } : v)))
  }

  const removeVariation = (index: number) => {
    onChange(variations.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Variações do Produto</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addVariation}
          className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/5"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar variação
        </Button>
      </div>
      {variations.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-2">
          Nenhuma variação adicionada. As variações estarão disponíveis na tela de vendas e
          orçamentos.
        </p>
      ) : (
        <div className="space-y-2">
          {variations.map((v, i) => (
            <div
              key={v.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end p-3 rounded-lg border border-border bg-muted/30"
            >
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Tamanho</Label>
                <Input
                  value={v.size}
                  onChange={(e) => updateVariation(i, 'size', e.target.value)}
                  placeholder="Ex: P, M, G"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Cor</Label>
                <Input
                  value={v.color}
                  onChange={(e) => updateVariation(i, 'color', e.target.value)}
                  placeholder="Ex: Azul"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Preço (R$)</Label>
                <Input
                  value={v.price}
                  onChange={(e) => updateVariation(i, 'price', e.target.value)}
                  placeholder="Ex: 12,50"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeVariation(i)}
                className="text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
