import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Truck,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRightLeft,
  Barcode,
} from 'lucide-react'
import {
  getSupplierProductRefs,
  saveSupplierProductRef,
  deleteSupplierProductRef,
} from '@/services/products'
import type { SupplierProductRef } from '@/lib/product-types'
import { isValidConversionFactor, formatExactDecimal } from '@/lib/fiscal-validations'
import { toast } from '@/hooks/use-toast'

interface Props {
  productId: string | null
  baseUnit?: string
}

export function ProductTabSupplierRefs({ productId, baseUnit = 'UN' }: Props) {
  const [refs, setRefs] = useState<SupplierProductRef[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form de adição
  const [isAdding, setIsAdding] = useState(false)
  const [supplierId, setSupplierId] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [supplierCode, setSupplierCode] = useState('')
  const [supplierDesc, setSupplierDesc] = useState('')
  const [supplierUnit, setSupplierUnit] = useState('CX')
  const [conversionFactor, setConversionFactor] = useState('1.0000')
  const [supplierGtin, setSupplierGtin] = useState('')
  const [context, setContext] = useState('entrada_xml')
  const [validationError, setValidationError] = useState<string | null>(null)

  const loadRefs = async () => {
    if (!productId) return
    setLoading(true)
    try {
      const data = await getSupplierProductRefs(productId)
      setRefs(data)
    } catch {
      toast({
        title: 'Não foi possível carregar as referências de fornecedores.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      loadRefs()
    }
  }, [productId])

  const handleCreate = async () => {
    setValidationError(null)
    if (!productId) return
    if (!supplierId.trim()) {
      setValidationError('Identificação/CNPJ do fornecedor é obrigatória.')
      return
    }
    if (!supplierCode.trim()) {
      setValidationError('O código do produto no fornecedor (cProd do XML) é obrigatório.')
      return
    }
    if (!isValidConversionFactor(conversionFactor)) {
      setValidationError('O fator de conversão de entrada deve ser estritamente positivo (> 0).')
      return
    }

    setSaving(true)
    try {
      await saveSupplierProductRef({
        product_id: productId,
        supplier_id: supplierId.trim(),
        supplier_name: supplierName.trim() || undefined,
        supplier_product_code: supplierCode.trim(),
        supplier_description: supplierDesc.trim() || undefined,
        supplier_unit: supplierUnit.trim().toUpperCase() || undefined,
        conversion_factor: formatExactDecimal(conversionFactor, 4),
        operator: 'multiply',
        supplier_gtin: supplierGtin.trim() || undefined,
        context: context.trim() || 'entrada_xml',
        is_validated: true,
        validated_at: new Date().toISOString(),
      })

      toast({
        title: 'Referência de fornecedor associada com sucesso!',
        description: 'De-Para de XML configurado e validado.',
      })

      setIsAdding(false)
      setSupplierId('')
      setSupplierName('')
      setSupplierCode('')
      setSupplierDesc('')
      setSupplierUnit('CX')
      setConversionFactor('1.0000')
      setSupplierGtin('')
      await loadRefs()
    } catch (err: unknown) {
      const e = err as { message?: string }
      toast({
        title: 'Erro ao associar referência do fornecedor.',
        description: e?.message || 'Verifique se a relação já existe para este contexto.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta referência de fornecedor?')) return
    try {
      await deleteSupplierProductRef(id)
      toast({ title: 'Referência excluída com sucesso.' })
      await loadRefs()
    } catch {
      toast({ title: 'Erro ao excluir referência.', variant: 'destructive' })
    }
  }

  if (!productId) {
    return (
      <Card className="border-dashed border-2 border-border/80">
        <CardContent className="py-10 text-center space-y-2">
          <Truck className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="font-bold text-foreground">Referências de Fornecedores (De-Para XML)</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Salve o produto para mapear códigos de fornecedores, caixas e conversões validadas para
            importação automática de NF-e sem ambiguidade.
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
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#005B2E]" /> Associação Fornecedor ×
            Produto Interno
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Evita associações ambíguas e garante conversão correta na importação de XML
          </p>
        </div>

        {!isAdding && (
          <Button
            type="button"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold h-9"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Nova Referência de Fornecedor
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-2 border-[#005B2E]/40 bg-emerald-50/20 dark:bg-emerald-950/10">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-[#005B2E] flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> Mapear Código do Fornecedor (De-Para)
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Identificação / CNPJ do Fornecedor *
                </Label>
                <Input
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  placeholder="Ex: 01.234.567/0001-89 ou ID"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Razão Social / Nome Fantasia</Label>
                <Input
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Ex: Fornecedor Papéis e Embalagens Ltda"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Código no Fornecedor (cProd) *</Label>
                <Input
                  value={supplierCode}
                  onChange={(e) => setSupplierCode(e.target.value)}
                  placeholder="Ex: REF-FORN-987"
                  className="h-8 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Unidade no XML (uCom)</Label>
                <Input
                  value={supplierUnit}
                  onChange={(e) => setSupplierUnit(e.target.value.toUpperCase())}
                  placeholder="Ex: CX, FD"
                  className="h-8 text-xs font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Fator de Conversão para {baseUnit} *
                </Label>
                <Input
                  value={conversionFactor}
                  onChange={(e) => setConversionFactor(e.target.value)}
                  placeholder="Ex: 12.0000"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Descrição do Fornecedor (xProd)</Label>
                <Input
                  value={supplierDesc}
                  onChange={(e) => setSupplierDesc(e.target.value)}
                  placeholder="Descrição conforme impressa no XML"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5 text-muted-foreground" /> GTIN do Fornecedor
                  (cEAN)
                </Label>
                <Input
                  value={supplierGtin}
                  onChange={(e) => setSupplierGtin(e.target.value)}
                  placeholder="Ex: 7891234567890 ou vazio"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleCreate}
                disabled={saving}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold h-8 text-xs"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                ) : (
                  <Save className="w-3.5 h-3.5 mr-1" />
                )}
                Gravar De-Para
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#005B2E]" />
          Carregando referências...
        </div>
      ) : refs.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Nenhum de-para de fornecedor cadastrado ainda. A importação de XML solicitará associação
            na primeira entrada.
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-md overflow-hidden bg-card">
          <table className="w-full text-xs">
            <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold border-b">
              <tr>
                <th className="py-2.5 px-3 text-left">Fornecedor</th>
                <th className="py-2.5 px-3 text-left">Código Fornecedor</th>
                <th className="py-2.5 px-3 text-left">Unidade XML</th>
                <th className="py-2.5 px-3 text-right">Fator Conversão</th>
                <th className="py-2.5 px-3 text-left">Conversão Interna</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center w-12">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {refs.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20">
                  <td className="py-2 px-3 font-semibold">{r.supplier_name || r.supplier_id}</td>
                  <td className="py-2 px-3 font-mono font-bold text-[#005B2E]">
                    {r.supplier_product_code}
                  </td>
                  <td className="py-2 px-3 font-mono">{r.supplier_unit || 'UN'}</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">
                    {r.conversion_factor}
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">
                    1 {r.supplier_unit || 'UN'} = {r.conversion_factor} {baseUnit}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px] py-0 border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Validado
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => r.id && handleDelete(r.id)}
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
