import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { AlertCircle, Loader2, Save, X, Upload, Hash } from 'lucide-react'
import {
  createProduct,
  updateProduct,
  getNextProductCode,
  getProductPhotoUrl,
} from '@/services/products'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { type Product, type FormVariation, type ProductVariation } from '@/lib/product-types'
import { ProductVariationsSection } from '@/components/product-variations-section'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSuccess: () => void
}

export function ProductFormDialog({ open, onOpenChange, product, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ncm, setNcm] = useState('')
  const [ean, setEan] = useState('')
  const [unit, setUnit] = useState('')
  const [price, setPrice] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [active, setActive] = useState(true)
  const [stock, setStock] = useState('0')
  const [minStock, setMinStock] = useState('0')
  const [variations, setVariations] = useState<FormVariation[]>([])
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [removedPhotos, setRemovedPhotos] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName(product?.name || '')
      setDescription(product?.description || '')
      setNcm(product?.ncm || '')
      setEan(product?.ean || '')
      setUnit(product?.unit || '')
      setPrice(product?.price || '')
      setBrand(product?.brand || '')
      setCategory(product?.category || '')
      setActive(product?.active !== false)
      setStock(String(product?.stock ?? 0))
      setMinStock(String(product?.min_stock ?? 0))
      setVariations(
        Array.isArray(product?.variations)
          ? product.variations.map((v: ProductVariation, i: number) => ({
              id: `var-${Date.now()}-${i}`,
              size: String(v?.size || ''),
              color: String(v?.color || ''),
              price: String(v?.price || ''),
            }))
          : [],
      )
      setNewPhotos([])
      setRemovedPhotos([])
      setErrors({})
    }
  }, [open, product])

  const existingPhotos = (product?.photos || []).filter((p) => !removedPhotos.includes(p))

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewPhotos((prev) => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeNewPhoto = (index: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingPhoto = (filename: string) => {
    setRemovedPhotos((prev) => [...prev, filename])
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Nome é obrigatório.'
    if (!description.trim()) e.description = 'Descrição é obrigatória.'
    if (!ncm.trim()) e.ncm = 'NCM é obrigatório.'
    if (!ean.trim()) e.ean = 'EAN é obrigatório.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('description', description.trim())
      formData.append('ncm', ncm.trim())
      formData.append('ean', ean.trim())
      formData.append('unit', unit.trim())
      formData.append('price', price.trim())
      formData.append('brand', brand.trim())
      formData.append('category', category.trim())
      formData.append('active', String(active))
      formData.append('stock', String(parseInt(stock, 10) || 0))
      formData.append('min_stock', String(parseInt(minStock, 10) || 0))
      formData.append(
        'variations',
        JSON.stringify(
          variations
            .filter((v) => v.size.trim() || v.color.trim() || v.price.trim())
            .map(({ size, color, price }) => ({ size, color, price })),
        ),
      )

      if (!product) {
        const { number } = await getNextProductCode()
        formData.append('code', number)
      }

      for (const file of newPhotos) {
        formData.append('photos', file)
      }

      if (product) {
        for (const filename of removedPhotos) {
          formData.append('photos-', filename)
        }
        await updateProduct(product.id, formData)
        toast({ title: 'Produto atualizado' })
      } else {
        await createProduct(formData)
        toast({ title: 'Produto cadastrado' })
      }
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      const serverErrors = extractFieldErrors(err)
      if (Object.keys(serverErrors).length > 0) {
        setErrors(serverErrors)
      }
      toast({ title: 'Erro ao salvar produto', variant: 'destructive' })
    }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E]">
            {product ? 'Editar Produto' : 'Cadastrar Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Nome *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Caixa de Papelão 40x30x30"
              className="focus-visible:ring-[#005B2E]"
            />
            {errors.name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Descrição *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Descrição detalhada do produto"
              className="focus-visible:ring-[#005B2E]"
            />
            {errors.description && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.description}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">NCM *</Label>
              <Input
                value={ncm}
                onChange={(e) => setNcm(e.target.value)}
                placeholder="Ex: 4819.10.00"
                className="focus-visible:ring-[#005B2E]"
              />
              {errors.ncm && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.ncm}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">EAN *</Label>
              <Input
                value={ean}
                onChange={(e) => setEan(e.target.value)}
                placeholder="Ex: 7891234567890"
                className="focus-visible:ring-[#005B2E]"
              />
              {errors.ean && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.ean}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Unidade</Label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Ex: un, kg, cx"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Preço (R$)</Label>
              <Input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 8,50"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Marca</Label>
              <Input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ex: PackLog"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Categoria</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Embalagens"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Estoque (quantidade)</Label>
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                min="0"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Estoque mínimo</Label>
              <Input
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="0"
                min="0"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={active} onCheckedChange={setActive} />
              <Label className="text-sm font-semibold">Produto ativo</Label>
            </div>
          </div>
          <ProductVariationsSection variations={variations} onChange={setVariations} />
          {product?.code ? (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border border-border">
              <Hash className="w-4 h-4 text-[#C89B3C]" />
              <span className="text-sm text-muted-foreground">Código:</span>
              <span className="text-sm font-bold text-[#005B2E]">{product.code}</span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              O código do produto será gerado automaticamente ao salvar.
            </p>
          )}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Fotos do produto</Label>
            <div className="flex flex-wrap gap-2">
              {existingPhotos.map((filename) => (
                <div
                  key={filename}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border"
                >
                  <img
                    src={getProductPhotoUrl(product!.id, filename, '200x200')}
                    alt="Foto do produto"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(filename)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {newPhotos.map((file, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Nova foto"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewPhoto(i)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:bg-[#005B2E]/5 transition-colors"
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
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
