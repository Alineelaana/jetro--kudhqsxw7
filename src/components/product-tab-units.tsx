import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Boxes,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  Barcode,
  Layers,
  Scale,
} from 'lucide-react'
import { getProductUnits, saveProductUnit, deleteProductUnit } from '@/services/products'
import type { ProductUnit } from '@/lib/product-types'
import { isValidGtin, isValidConversionFactor, formatExactDecimal } from '@/lib/fiscal-validations'
import { toast } from '@/hooks/use-toast'

interface Props {
  productId: string | null
  baseUnit?: string
}

export function ProductTabUnits({ productId, baseUnit = 'UN' }: Props) {
  const [units, setUnits] = useState<ProductUnit[]>([])
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  // Form para nova apresentação
  const [isAdding, setIsAdding] = useState(false)
  const [newUnitCode, setNewUnitCode] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newFactor, setNewFactor] = useState('1.0000')
  const [newOperator, setNewOperator] = useState<'multiply' | 'divide'>('multiply')
  const [newGtin, setNewGtin] = useState('')
  const [newSemGtin, setNewSemGtin] = useState(true)
  const [newIsTaxable, setNewIsTaxable] = useState(false)
  const [newTaxableUnit, setNewTaxableUnit] = useState('')
  const [newTaxableFactor, setNewTaxableFactor] = useState('1.0000')
  const [newIsSales, setNewIsSales] = useState(true)
  const [newIsPurchase, setNewIsPurchase] = useState(true)
  const [validationError, setValidationError] = useState<string | null>(null)

  const loadUnits = async () => {
    if (!productId) return
    setLoading(true)
    try {
      const data = await getProductUnits(productId)
      setUnits(data)
    } catch {
      toast({
        title: 'Não foi possível carregar as unidades do produto.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      loadUnits()
    }
  }, [productId])

  const handleCreate = async () => {
    setValidationError(null)
    if (!productId) return
    if (!newUnitCode.trim()) {
      setValidationError('O código da unidade é obrigatório (ex: CX, FD, MIL).')
      return
    }
    if (!isValidConversionFactor(newFactor)) {
      setValidationError('O fator de conversão deve ser estritamente maior que zero (> 0).')
      return
    }
    if (!newSemGtin && newGtin.trim()) {
      if (!isValidGtin(newGtin, false)) {
        setValidationError('O código GTIN/EAN possui dígito verificador inválido.')
        return
      }
    }

    setSavingId('new')
    try {
      await saveProductUnit({
        product_id: productId,
        unit_code: newUnitCode.trim().toUpperCase(),
        description: newDescription.trim() || undefined,
        conversion_factor: formatExactDecimal(newFactor, 4),
        operator: newOperator,
        gtin: newSemGtin ? 'SEM GTIN' : newGtin.trim() || undefined,
        sem_gtin: newSemGtin,
        is_taxable_unit: newIsTaxable,
        taxable_unit_code: newTaxableUnit.trim().toUpperCase() || undefined,
        taxable_factor: newIsTaxable ? formatExactDecimal(newTaxableFactor, 4) : undefined,
        is_sales_unit: newIsSales,
        is_purchase_unit: newIsPurchase,
        active: true,
      })

      toast({
        title: 'Apresentação cadastrada com sucesso!',
        description: `Unidade ${newUnitCode} adicionada para conversão.`,
      })

      // Reset
      setIsAdding(false)
      setNewUnitCode('')
      setNewDescription('')
      setNewFactor('1.0000')
      setNewGtin('')
      setNewSemGtin(true)
      setNewIsTaxable(false)
      await loadUnits()
    } catch (err: unknown) {
      const e = err as { message?: string }
      toast({
        title: 'Erro ao cadastrar apresentação.',
        description: e?.message || 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta unidade de conversão?')) return
    try {
      await deleteProductUnit(id)
      toast({ title: 'Unidade removida com sucesso.' })
      await loadUnits()
    } catch {
      toast({ title: 'Erro ao excluir unidade.', variant: 'destructive' })
    }
  }

  if (!productId) {
    return (
      <Card className="border-dashed border-2 border-border/80">
        <CardContent className="py-10 text-center space-y-2">
          <Boxes className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="font-bold text-foreground">Apresentações e Unidades de Conversão</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Salve o produto para configurar caixas, fardos, pallets e suas relações de conversão com
            a unidade base ({baseUnit}).
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#005B2E]" /> Unidade Base do Cadastro
          </h4>
          <p className="text-sm font-bold text-[#005B2E] mt-0.5">
            {baseUnit}{' '}
            <span className="text-xs font-normal text-muted-foreground">(Fator 1.0000)</span>
          </p>
        </div>

        {!isAdding && (
          <Button
            type="button"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold h-9"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Nova Apresentação / Embalagem
          </Button>
        )}
      </div>

      {/* Formulário de Adição */}
      {isAdding && (
        <Card className="border-2 border-[#005B2E]/40 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-[#005B2E] flex items-center gap-1.5">
                <Boxes className="w-4 h-4" /> Cadastrar Nova Apresentação / Embalagem
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(false)}
                className="h-7 text-xs"
              >
                Cancelar
              </Button>
            </div>

            {validationError && (
              <div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Código Unidade *</Label>
                <Input
                  value={newUnitCode}
                  onChange={(e) => setNewUnitCode(e.target.value.toUpperCase())}
                  placeholder="Ex: CX, FD, MIL"
                  className="h-8 text-xs font-mono uppercase"
                  maxLength={6}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs font-semibold">Descrição da Apresentação</Label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ex: Caixa com 12 unidades"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Operador</Label>
                <Select
                  value={newOperator}
                  onValueChange={(v: 'multiply' | 'divide') => setNewOperator(v)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiply">Multiplica (1 CX = X {baseUnit})</SelectItem>
                    <SelectItem value="divide">Divide (1 {baseUnit} = X)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-[#C89B3C]" /> Fator de Conversão *
                </Label>
                <Input
                  value={newFactor}
                  onChange={(e) => setNewFactor(e.target.value)}
                  placeholder="Ex: 12.0000"
                  className="h-8 text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground">Estritamente positivo (&gt; 0)</p>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold flex items-center gap-1">
                    <Barcode className="w-3.5 h-3.5 text-muted-foreground" /> GTIN / EAN da
                    Embalagem
                  </Label>
                  <div className="flex items-center gap-1.5">
                    <Switch
                      checked={newSemGtin}
                      onCheckedChange={(v) => {
                        setNewSemGtin(v)
                        if (v) setNewGtin('')
                      }}
                      className="scale-75"
                    />
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      SEM GTIN
                    </span>
                  </div>
                </div>
                <Input
                  value={newGtin}
                  onChange={(e) => setNewGtin(e.target.value)}
                  disabled={newSemGtin}
                  placeholder={
                    newSemGtin ? 'Embalagem sem código de barras (SEM GTIN)' : 'Ex: 7891234567890'
                  }
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={newIsSales}
                    onCheckedChange={setNewIsSales}
                    className="scale-75"
                  />
                  <span className="text-xs font-medium">Permite Venda</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={newIsPurchase}
                    onCheckedChange={setNewIsPurchase}
                    className="scale-75"
                  />
                  <span className="text-xs font-medium">Permite Entrada</span>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                onClick={handleCreate}
                disabled={savingId === 'new'}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold h-8 text-xs"
              >
                {savingId === 'new' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Save className="w-3.5 h-3.5 mr-1" />
                )}
                Gravar Apresentação
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Apresentações Existentes */}
      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#005B2E]" />
          Carregando unidades...
        </div>
      ) : units.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma apresentação adicional cadastrada. O produto opera na unidade base ({baseUnit}).
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-md overflow-hidden bg-card">
          <table className="w-full text-xs">
            <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold border-b">
              <tr>
                <th className="py-2.5 px-3 text-left">Unidade</th>
                <th className="py-2.5 px-3 text-left">Descrição</th>
                <th className="py-2.5 px-3 text-right">Fator de Conversão</th>
                <th className="py-2.5 px-3 text-left">Relação Base</th>
                <th className="py-2.5 px-3 text-left">GTIN / Código</th>
                <th className="py-2.5 px-3 text-center">Operações</th>
                <th className="py-2.5 px-3 text-center w-12">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {units.map((u) => (
                <tr key={u.id} className="hover:bg-muted/20">
                  <td className="py-2 px-3 font-mono font-bold text-[#005B2E]">{u.unit_code}</td>
                  <td className="py-2 px-3">{u.description || '—'}</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">
                    {u.conversion_factor}
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">
                    1 {u.unit_code} = {u.conversion_factor} {baseUnit}
                  </td>
                  <td className="py-2 px-3 font-mono">
                    {u.sem_gtin ? (
                      <Badge variant="outline" className="text-[10px] py-0">
                        SEM GTIN
                      </Badge>
                    ) : (
                      u.gtin || '—'
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {u.is_purchase_unit && (
                        <Badge className="bg-blue-100 text-blue-800 text-[10px] py-0 border-blue-200">
                          Entrada
                        </Badge>
                      )}
                      {u.is_sales_unit && (
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px] py-0 border-emerald-200">
                          Venda
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => u.id && handleDelete(u.id)}
                      className="h-7 w-7 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
