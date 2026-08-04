import { useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Upload, X, FileText, File } from 'lucide-react'
import { getProductFileUrl } from '@/services/products'
import type { Product, ProductFileState } from '@/lib/product-types'

interface Props {
  product: Product | null
  fileState: ProductFileState
  setFileState: React.Dispatch<React.SetStateAction<ProductFileState>>
}

export function ProductTabImages({ product, fileState, setFileState }: Props) {
  const photoRef = useRef<HTMLInputElement>(null)
  const mainPhotoRef = useRef<HTMLInputElement>(null)
  const techRef = useRef<HTMLInputElement>(null)
  const docRef = useRef<HTMLInputElement>(null)

  const existingPhotos = (product?.photos || []).filter((p) => !fileState.removedPhotos.includes(p))
  const existingDocs = (product?.documents || []).filter(
    (d) => !fileState.removedDocuments.includes(d),
  )

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Foto Principal</Label>
        <div className="flex flex-wrap gap-2 items-center">
          {product?.main_photo && !fileState.removedTechnicalSheet === false && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border">
              <img
                src={getProductFileUrl(product.id, product.main_photo, '200x200')}
                alt="Foto principal"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setFileState((s) => ({ ...s, removedTechnicalSheet: false }))}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {fileState.mainPhoto && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border">
              <img
                src={URL.createObjectURL(fileState.mainPhoto)}
                alt="Nova foto principal"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setFileState((s) => ({ ...s, mainPhoto: null }))}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => mainPhotoRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:bg-[#005B2E]/5"
          >
            <Upload className="w-6 h-6 text-muted-foreground" />
          </button>
          <input
            ref={mainPhotoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setFileState((s) => ({ ...s, mainPhoto: f }))
              if (mainPhotoRef.current) mainPhotoRef.current.value = ''
            }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Fotos Adicionais</Label>
        <div className="flex flex-wrap gap-2">
          {existingPhotos.map((fn) => (
            <div
              key={fn}
              className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border"
            >
              <img
                src={getProductFileUrl(product!.id, fn, '200x200')}
                alt="Foto"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setFileState((s) => ({ ...s, removedPhotos: [...s.removedPhotos, fn] }))
                }
                className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {fileState.newPhotos.map((f, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border"
            >
              <img
                src={URL.createObjectURL(f)}
                alt="Nova foto"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setFileState((s) => ({ ...s, newPhotos: s.newPhotos.filter((_, j) => j !== i) }))
                }
                className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => photoRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:bg-[#005B2E]/5"
          >
            <Upload className="w-6 h-6 text-muted-foreground" />
          </button>
          <input
            ref={photoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              const fs = Array.from(e.target.files || [])
              if (fs.length) setFileState((s) => ({ ...s, newPhotos: [...s.newPhotos, ...fs] }))
              if (photoRef.current) photoRef.current.value = ''
            }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Ficha Técnica</Label>
        <div className="flex flex-wrap gap-2 items-center">
          {product?.technical_sheet && !fileState.removedTechnicalSheet && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border">
              <FileText className="w-4 h-4 text-[#005B2E]" />
              <span className="text-xs truncate max-w-32">{product.technical_sheet}</span>
              <button
                type="button"
                onClick={() => setFileState((s) => ({ ...s, removedTechnicalSheet: true }))}
                className="text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {fileState.technicalSheet && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border">
              <FileText className="w-4 h-4 text-[#005B2E]" />
              <span className="text-xs truncate max-w-32">{fileState.technicalSheet.name}</span>
              <button
                type="button"
                onClick={() => setFileState((s) => ({ ...s, technicalSheet: null }))}
                className="text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => techRef.current?.click()}
            className="px-3 py-2 rounded-lg border-2 border-dashed border-border flex items-center gap-1 text-xs hover:bg-[#005B2E]/5"
          >
            <Upload className="w-4 h-4" /> Anexar
          </button>
          <input
            ref={techRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setFileState((s) => ({ ...s, technicalSheet: f }))
              if (techRef.current) techRef.current.value = ''
            }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Documentos</Label>
        <div className="flex flex-wrap gap-2 items-center">
          {existingDocs.map((fn) => (
            <div
              key={fn}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border"
            >
              <File className="w-4 h-4 text-[#005B2E]" />
              <span className="text-xs truncate max-w-32">{fn}</span>
              <button
                type="button"
                onClick={() =>
                  setFileState((s) => ({ ...s, removedDocuments: [...s.removedDocuments, fn] }))
                }
                className="text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {fileState.newDocuments.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border"
            >
              <File className="w-4 h-4 text-[#005B2E]" />
              <span className="text-xs truncate max-w-32">{f.name}</span>
              <button
                type="button"
                onClick={() =>
                  setFileState((s) => ({
                    ...s,
                    newDocuments: s.newDocuments.filter((_, j) => j !== i),
                  }))
                }
                className="text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => docRef.current?.click()}
            className="px-3 py-2 rounded-lg border-2 border-dashed border-border flex items-center gap-1 text-xs hover:bg-[#005B2E]/5"
          >
            <Upload className="w-4 h-4" /> Anexar
          </button>
          <input
            ref={docRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              const fs = Array.from(e.target.files || [])
              if (fs.length)
                setFileState((s) => ({ ...s, newDocuments: [...s.newDocuments, ...fs] }))
              if (docRef.current) docRef.current.value = ''
            }}
          />
        </div>
      </div>
    </div>
  )
}
