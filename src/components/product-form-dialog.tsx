import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Package,
  DollarSign,
  FileText,
  Warehouse,
  Truck,
  Image,
  Loader2,
  Save,
  Building2,
  Boxes,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  ShieldCheck,
} from 'lucide-react'
import { ProductTabGeneral } from '@/components/product-tab-general'
import { ProductTabCommercial } from '@/components/product-tab-commercial'
import { ProductTabTax } from '@/components/product-tab-tax'
import { ProductTabStock } from '@/components/product-tab-stock'
import { ProductTabPurchasing } from '@/components/product-tab-purchasing'
import { ProductTabImages } from '@/components/product-tab-images'
import { ProductTabCompanyFiscal } from '@/components/product-tab-company-fiscal'
import { ProductTabUnits } from '@/components/product-tab-units'
import { ProductTabSupplierRefs } from '@/components/product-tab-supplier-refs'
import {
  type Product,
  type ProductFormState,
  type FormVariation,
  getInitialFormState,
  getInitialFileState,
} from '@/lib/product-types'
import { evaluateProductFiscalReadiness } from '@/lib/fiscal-validations'
import { createProduct, updateProduct, getNextProductCode } from '@/services/products'
import { toast } from '@/hooks/use-toast'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSuccess: () => void
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductFormDialogProps) {
  const [activeTab, setActiveTab] = useState('general')
  const [form, setForm] = useState<ProductFormState>(getInitialFormState(product))
  const [files, setFiles] = useState(getInitialFileState())
  const [variations, setVariations] = useState<FormVariation[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [createdProductId, setCreatedProductId] = useState<string | null>(product?.id || null)

  const isEdit = !!product || !!createdProductId
  const currentProductId = product?.id || createdProductId

  // Avaliação do status fiscal
  const fiscalCheck = evaluateProductFiscalReadiness({
    name: form.name,
    ncm: form.ncm,
    unit: form.unit,
    tipo_finalidade: form.tipo_finalidade,
    origin: form.origin,
    ean: form.ean,
    sem_gtin: form.sem_gtin,
    cest: form.cest,
    cfop: form.cfop,
    cst_csosn: form.cst_csosn,
  })

  useEffect(() => {
    if (open) {
      setForm(getInitialFormState(product))
      setFiles(getInitialFileState())
      setErrors({})
      setActiveTab('general')
      setCreatedProductId(product?.id || null)
      if (product?.variations && product.variations.length > 0) {
        setVariations(
          product.variations.map((v, i) => ({
            id: `var-${i}-${Date.now()}`,
            size: v.size,
            color: v.color,
            price: v.price,
          })),
        )
      } else {
        setVariations([])
      }
    }
  }, [open, product])

  const setField = (field: keyof ProductFormState, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateDraft = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'A descrição do produto é obrigatória.'
    if (!form.unit.trim()) errs.unit = 'A unidade base é obrigatória.'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const buildFormData = (code: string, status: 'rascunho' | 'validado_fiscal'): FormData => {
    const fd = new FormData()
    fd.append('code', code)
    fd.append('name', form.name)
    fd.append('description', form.description)
    fd.append('ean', form.sem_gtin ? 'SEM GTIN' : form.ean)
    fd.append('manufacturer_code', form.manufacturer_code)
    fd.append('brand', form.brand)
    fd.append('category', form.category)
    fd.append('subcategory', form.subcategory)
    fd.append('unit', form.unit)
    fd.append('tipo_finalidade', form.tipo_finalidade)
    fd.append('fiscal_status', status)
    fd.append('external_reference', form.external_reference)
    fd.append('product_group', form.product_group)
    fd.append('active', String(form.active))

    if (form.cost_price) fd.append('cost_price', form.cost_price)
    if (form.price) fd.append('price', form.price)
    if (form.profit_margin) fd.append('profit_margin', form.profit_margin)
    if (form.commission) fd.append('commission', form.commission)
    if (form.max_discount) fd.append('max_discount', form.max_discount)

    if (form.ncm) fd.append('ncm', form.ncm)
    if (form.cest) fd.append('cest', form.cest)
    if (form.cfop) fd.append('cfop', form.cfop)
    if (form.origin) fd.append('origin', form.origin)
    if (form.cst_csosn) fd.append('cst_csosn', form.cst_csosn)
    if (form.icms_aliquot) fd.append('icms_aliquot', form.icms_aliquot)
    if (form.ipi) fd.append('ipi', form.ipi)
    if (form.pis) fd.append('pis', form.pis)
    if (form.cofins) fd.append('cofins', form.cofins)

    fd.append('stock', String(parseFloat(form.stock) || 0))
    fd.append('min_stock', String(parseFloat(form.min_stock) || 0))
    fd.append('max_stock', String(parseFloat(form.max_stock) || 0))

    if (form.location) fd.append('location', form.location)
    if (form.lot) fd.append('lot', form.lot)
    if (form.validity) fd.append('validity', form.validity)
    fd.append('allow_lot_control', String(form.allow_lot_control))
    fd.append('allow_validity_control', String(form.allow_validity_control))
    fd.append('allow_serial_number', String(form.allow_serial_number))

    if (form.main_supplier) fd.append('main_supplier', form.main_supplier)
    if (form.supplier_product_code) fd.append('supplier_product_code', form.supplier_product_code)
    if (form.last_cost) fd.append('last_cost', form.last_cost)
    if (form.last_purchase) fd.append('last_purchase', form.last_purchase)
    if (form.replenishment_time) fd.append('replenishment_time', form.replenishment_time)
    if (form.internal_observations) fd.append('internal_observations', form.internal_observations)

    const varsToSave = variations
      .filter((v) => v.size || v.color || v.price)
      .map(({ size, color, price }) => ({ size, color, price }))
    fd.append('variations', JSON.stringify(varsToSave))

    if (files.mainPhoto) {
      fd.append('main_photo', files.mainPhoto)
    }
    for (const file of files.newPhotos) {
      fd.append('photos', file)
    }
    if (files.technicalSheet) {
      fd.append('technical_sheet', files.technicalSheet)
    }
    for (const file of files.newDocuments) {
      fd.append('documents', file)
    }

    return fd
  }

  const handleSave = async (forceValidateFiscal = false) => {
    if (!validateDraft()) {
      setActiveTab('general')
      toast({
        title: 'Preencha os campos obrigatórios básicos.',
        variant: 'destructive',
      })
      return
    }

    // Se o usuário clicou em Validar Fiscal, checa se passa na avaliação
    if (forceValidateFiscal && !fiscalCheck.isReadyForFiscal) {
      toast({
        title: 'Não é possível marcar como Pronto para Operação Fiscal.',
        description: fiscalCheck.errors.join(' '),
        variant: 'destructive',
      })
      return
    }

    const targetFiscalStatus: 'rascunho' | 'validado_fiscal' =
      forceValidateFiscal || fiscalCheck.isReadyForFiscal ? 'validado_fiscal' : 'rascunho'

    setSaving(true)
    try {
      let code = form.code
      if (!isEdit && !code) {
        const next = await getNextProductCode()
        code = next.number
      }

      const fd = buildFormData(code, targetFiscalStatus)
      let savedProd: Product

      if (currentProductId) {
        savedProd = await updateProduct(currentProductId, fd)
        toast({
          title: 'Produto atualizado com sucesso!',
          description:
            targetFiscalStatus === 'validado_fiscal'
              ? 'Status: Pronto para Operação Fiscal.'
              : 'Salvo como rascunho.',
        })
      } else {
        savedProd = await createProduct(fd)
        setCreatedProductId(savedProd.id)
        toast({
          title: 'Produto cadastrado com sucesso!',
          description: `Código gerado: ${savedProd.code}. Agora configure as regras por empresa.`,
        })
      }

      onSuccess()
    } catch (err: unknown) {
      const e = err as { message?: string }
      toast({
        title: 'Erro ao salvar produto.',
        description: e?.message || 'Verifique os dados e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
        {/* Cabeçalho Rico com Status Fiscal */}
        <DialogHeader className="px-6 pt-5 pb-3 border-b bg-muted/20 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#005B2E]/10 text-[#005B2E] rounded-md">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  {isEdit
                    ? `Editar Produto: ${form.name || form.code}`
                    : 'Novo Cadastro de Produto'}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  DEC Eldorado e Gran Romano — Cadastro Multiestabelecimento para NF-e mod 55
                </p>
              </div>
            </div>

            {/* Badge de Status Fiscal */}
            <div className="flex items-center gap-2">
              {fiscalCheck.isReadyForFiscal ? (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 py-1 px-2.5 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Pronto p/ NF-e
                </Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 py-1 px-2.5 text-xs font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Rascunho Incompleto
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Abas do Roteiro */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 border-b shrink-0 bg-background overflow-x-auto">
            <TabsList className="bg-transparent h-11 p-0 gap-1 justify-start">
              <TabsTrigger
                value="general"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#005B2E] data-[state=active]:border-b-2 data-[state=active]:border-[#005B2E] rounded-none px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <Package className="w-3.5 h-3.5" /> Geral
              </TabsTrigger>
              <TabsTrigger
                value="tax"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#005B2E] data-[state=active]:border-b-2 data-[state=active]:border-[#005B2E] rounded-none px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> Fiscal Geral
              </TabsTrigger>
              <TabsTrigger
                value="company_fiscal"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#005B2E] data-[state=active]:border-b-2 data-[state=active]:border-[#005B2E] rounded-none px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5" /> Fiscal por Empresa
              </TabsTrigger>
              <TabsTrigger
                value="units"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#005B2E] data-[state=active]:border-b-2 data-[state=active]:border-[#005B2E] rounded-none px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <Boxes className="w-3.5 h-3.5" /> Apresentações (Unidades)
              </TabsTrigger>
              <TabsTrigger
                value="supplier_refs"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#005B2E] data-[state=active]:border-b-2 data-[state=active]:border-[#005B2E] rounded-none px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> De-Para Fornecedor
              </TabsTrigger>
              <TabsTrigger
                value="prices"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#005B2E] data-[state=active]:border-b-2 data-[state=active]:border-[#005B2E] rounded-none px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" /> Preços / Comercial
              </TabsTrigger>
              <TabsTrigger
                value="stock"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#005B2E] data-[state=active]:border-b-2 data-[state=active]:border-[#005B2E] rounded-none px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <Warehouse className="w-3.5 h-3.5" /> Estoque
              </TabsTrigger>
              <TabsTrigger
                value="purchasing"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#005B2E] data-[state=active]:border-b-2 data-[state=active]:border-[#005B2E] rounded-none px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <Truck className="w-3.5 h-3.5" /> Compras
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="data-[state=active]:bg-transparent data-[state=active]:text-[#005B2E] data-[state=active]:border-b-2 data-[state=active]:border-[#005B2E] rounded-none px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <Image className="w-3.5 h-3.5" /> Mídia
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent value="general" className="m-0 focus-visible:outline-none">
              <ProductTabGeneral
                form={form}
                setField={setField}
                errors={errors}
                variations={variations}
                setVariations={setVariations}
              />
            </TabsContent>

            <TabsContent value="tax" className="m-0 focus-visible:outline-none">
              <ProductTabTax form={form} setField={setField} errors={errors} />
            </TabsContent>

            <TabsContent value="company_fiscal" className="m-0 focus-visible:outline-none">
              <ProductTabCompanyFiscal
                productId={currentProductId}
                productCode={form.code}
                productName={form.name}
                baseNcm={form.ncm}
                baseOrigin={form.origin}
                baseTipoFinalidade={form.tipo_finalidade}
              />
            </TabsContent>

            <TabsContent value="units" className="m-0 focus-visible:outline-none">
              <ProductTabUnits productId={currentProductId} baseUnit={form.unit || 'UN'} />
            </TabsContent>

            <TabsContent value="supplier_refs" className="m-0 focus-visible:outline-none">
              <ProductTabSupplierRefs productId={currentProductId} baseUnit={form.unit || 'UN'} />
            </TabsContent>

            <TabsContent value="prices" className="m-0 focus-visible:outline-none">
              <ProductTabCommercial form={form} setField={setField} />
            </TabsContent>

            <TabsContent value="stock" className="m-0 focus-visible:outline-none">
              <ProductTabStock form={form} setField={setField} />
            </TabsContent>

            <TabsContent value="purchasing" className="m-0 focus-visible:outline-none">
              <ProductTabPurchasing form={form} setField={setField} />
            </TabsContent>

            <TabsContent value="media" className="m-0 focus-visible:outline-none">
              <ProductTabImages product={product} fileState={files} setFileState={setFiles} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Rodapé com Ações de Gravação e Validação Fiscal */}
        <DialogFooter className="px-6 py-3 border-t bg-muted/20 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            {fiscalCheck.isReadyForFiscal ? (
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> NCM e parâmetros válidos para NF-e mod 55
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {fiscalCheck.errors.length > 0
                  ? fiscalCheck.errors[0]
                  : 'Faltam dados fiscais para validar'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Fechar
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="border-border text-foreground hover:bg-muted"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Salvar como Rascunho
            </Button>

            <Button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving || !fiscalCheck.isReadyForFiscal}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-1" />
              )}
              Validar e Liberar para Fiscal
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
