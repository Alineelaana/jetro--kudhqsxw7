import { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getMedia, uploadMedia } from '@/services/cms'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { Search, Image as ImageIcon, Loader2, Upload, X } from 'lucide-react'

interface MediaItem {
  id: string
  name: string
  file: string
  type: string
}

interface MediaPickerProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function MediaPicker({ value, onChange, label = 'Selecionar' }: MediaPickerProps) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const media = await getMedia()
      setItems(media as unknown as MediaItem[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  const getUrl = (item: MediaItem) =>
    pb.files.getURL(
      { id: item.id, collectionId: 'cms_media', collectionName: 'cms_media' } as never,
      item.file,
    )

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', file.name)
      formData.append('type', file.type)
      formData.append('size', String(file.size))
      formData.append('folder', 'SEO')
      formData.append('alt_text', '')
      formData.append('caption', '')
      formData.append('usage_locations', '[]')
      formData.append('uploaded_by', (user?.id as string) || '')
      const result = await uploadMedia(formData)
      onChange(getUrl(result as unknown as MediaItem))
      toast.success('Imagem enviada e selecionada!')
      setOpen(false)
    } catch {
      toast.error('Erro ao enviar imagem.')
    }
    setUploading(false)
    e.target.value = ''
  }

  const filtered = items.filter(
    (i) =>
      i.type?.startsWith('image/') &&
      (!search || i.name.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="flex items-center gap-2">
      {value && (
        <div className="relative">
          <img
            src={value}
            alt=""
            className="w-12 h-12 rounded-md object-cover border border-border"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="border-[#005B2E] text-[#005B2E] font-bold"
          >
            <ImageIcon className="w-4 h-4 mr-1" /> {label}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Selecionar Imagem</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="pl-10"
              />
            </div>
            <Label className="cursor-pointer">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-[#005B2E] text-[#005B2E] font-bold"
              >
                <span>
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-1" /> Enviar
                    </>
                  )}
                </span>
              </Button>
              <input type="file" onChange={handleUpload} className="hidden" accept="image/*" />
            </Label>
          </div>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Nenhuma imagem encontrada.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onChange(getUrl(item))
                    setOpen(false)
                  }}
                  className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[#005B2E] transition-colors"
                >
                  <img src={getUrl(item)} alt={item.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
