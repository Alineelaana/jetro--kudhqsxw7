import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Loader2, Save } from 'lucide-react'
import { createProduct, updateProduct, getNextProductCode } from '@/services/products'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { toast } from '@/hooks/use-toast'
import {
  type Product,
  type ProductFormState,
  type ProductFileState,
  type FormVariation,
  getInitialFormState,
  getInitialFileState,
} from '@/lib/product-types'
import { ProductTabGeneral } from '@/components/product-tab-general'
import { ProductTabCommercial } from '@/components/product-tab-commercial'
import { ProductTabTax } from '@/components/product-tab-tax'
import { ProductTabStock } from '@/components/product-tab-stock'
import { ProductTabPurchasing } from '@/components/product-tab-purchasing'
import { ProductTabImages } from '@/components/product-tab-images'
import { ProductTabObservations } from '@/components/product-tab-observations'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSuccess: () => void
}

const TEXT_FIELDS: (keyof ProductFormState)[] = [
  'ean',
  'manufacturer_code',
  'name',
  'description',
  'brand',
  'category',
  'subcategory',
  'unit',
  'cost_price',
  'price',
  'profit_margin',
  'commission',
  'max_discount',
  'ncm',
  'cest',
  'cfop',
  'origin',
  'cst_csosn',
  'icms_aliquot',
  'ipi',
  'pis',
  'cofins',
  'location',
  'lot',
  'validity',
  'main_supplier',
  'supplier_product_code',
  'last_cost',
  'last_purchase',
  'replenishment_time',
  'internal_observations',
]

export function ProductFormDialog({ open, onOpenChange, product, onSuccess }: Props) {
  const [form, setForm] = useState<ProductFormState>(getInitialFormState())
  const [variations, setVariations] = useState<FormVariation[]>([])
  const [fileState, setFileState] = useState<ProductFileState>(getInitialFileState())
  const [activeTab, setActiveTab] = useState('general')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(getInitialFormState(product))
      setVariations(
        Array.isArray(product?.variations)
          ? product.variations.map((v, i) => ({
              id: `var-${Date.now()}-${i}`,
              size: String(v?.size || ''),
              color: String(v?.color || ''),
              price: String(v?.price || ''),
            }))
          : [],
      )
      setFileState(getInitialFileState())
      setErrors({})
      setActiveTab('general')
    }
  }, [open, product])

  const setField = (field: keyof ProductFormState, value: string | boolean) => {
    setForm((p) => ({ ...p, [field]: value }))
    setErrors((p) => {
      const n = { ...p }
      delete n[field]
      return n
    })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Descrição do produto é obrigatória.'
    if (!form.description.trim()) e.description = 'Descrição resumida é obrigatória.'
    if (!form.ncm.trim()) e.ncm = 'NCM é obrigatório.'
    if (!form.ean.trim()) e.ean = 'EAN é obrigatório.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      for (const f of TEXT_FIELDS) fd.append(f, String(form[f] || '').trim())
      fd.append('active', String(form.active))
      fd.append('allow_lot_control', String(form.allow_lot_control))
      fd.append('allow_validity_control', String(form.allow_validity_control))
      fd.append('allow_serial_number', String(form.allow_serial_number))
      fd.append('stock', String(parseInt(form.stock, 10) || 0))
      fd.append('min_stock', String(parseInt(form.min_stock, 10) || 0))
      fd.append('max_stock', String(parseInt(form.max_stock, 10) || 0))
      fd.append(
        'variations',
        JSON.stringify(
          variations
            .filter((v) => v.size || v.color || v.price)
            .map(({ size, color, price }) => ({ size, color, price })),
        ),
      )
      if (fileState.mainPhoto) fd.append('main_photo', fileState.mainPhoto)
      for (const f of fileState.newPhotos) fd.append('photos', f)
      if (fileState.technicalSheet) fd.append('technical_sheet', fileState.technicalSheet)
      for (const f of fileState.newDocuments) fd.append('documents', f)
      if (product) {
        for (const f of fileState.removedPhotos) fd.append('photos-', f)
        if (fileState.removedTechnicalSheet && product.technical_sheet)
          fd.append('technical_sheet-', product.technical_sheet)
        for (const f of fileState.removedDocuments) fd.append('documents-', f)
        await updateProduct(product.id, fd)
        toast({ title: 'Produto atualizado' })
      } else {
        const { number } = await getNextProductCode()
        fd.append('code', number)
        await createProduct(fd)
        toast({ title: 'Produto cadastrado' })
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      const se = extractFieldErrors(err)
      if (Object.keys(se).length > 0) setErrors(se)
      toast({ title: 'Erro ao salvar produto', variant: 'destructive' })
    }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E]">
            {product ? 'Editar Produto' : 'Cadastrar Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full flex-wrap h-auto">
              <TabsTrigger value="general">Dados Gerais</TabsTrigger>
              <TabsTrigger value="commercial">Comercial</TabsTrigger>
              <TabsTrigger value="tax">Fiscal</TabsTrigger>
              <TabsTrigger value="stock">Estoque</TabsTrigger>
              <TabsTrigger value="purchasing">Compras</TabsTrigger>
              <TabsTrigger value="images">Imagens e Anexos</TabsTrigger>
              <TabsTrigger value="observations">Observações</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="mt-4">
              <ProductTabGeneral
                form={form}
                setField={setField}
                errors={errors}
                variations={variations}
                setVariations={setVariations}
              />
            </TabsContent>
            <TabsContent value="commercial" className="mt-4">
              <ProductTabCommercial form={form} setField={setField} />
            </TabsContent>
            <TabsContent value="tax" className="mt-4">
              <ProductTabTax form={form} setField={setField} errors={errors} />
            </TabsContent>
            <TabsContent value="stock" className="mt-4">
              <ProductTabStock form={form} setField={setField} />
            </TabsContent>
            <TabsContent value="purchasing" className="mt-4">
              <ProductTabPurchasing form={form} setField={setField} />
            </TabsContent>
            <TabsContent value="images" className="mt-4">
              <ProductTabImages
                product={product}
                fileState={fileState}
                setFileState={setFileState}
              />
            </TabsContent>
            <TabsContent value="observations" className="mt-4">
              <ProductTabObservations form={form} setField={setField} />
            </TabsContent>
          </Tabs>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}{' '}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
