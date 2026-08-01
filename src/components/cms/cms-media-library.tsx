import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getMedia, uploadMedia, deleteMedia, updateMedia } from '@/services/cms'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { Upload, Search, Trash2, Loader2, FileImage, FileText, Film, Folder } from 'lucide-react'

interface MediaItem {
  id: string
  name: string
  file: string
  type: string
  size: number
  alt_text: string
  folder: string
  created: string
}

export function CmsMediaLibrary() {
  const { user } = useAuth()
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [folder, setFolder] = useState('')
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    try {
      setItems((await getMedia()) as unknown as MediaItem[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('cms_media', () => load())

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
      'video/mp4',
    ]
    if (!allowed.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido.')
      return
    }
    if (file.size > 52428800) {
      toast.error('Arquivo muito grande (máx 50MB).')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', file.name)
      formData.append('type', file.type)
      formData.append('size', String(file.size))
      formData.append('folder', folder || 'Geral')
      formData.append('alt_text', '')
      formData.append('caption', '')
      formData.append('usage_locations', '[]')
      formData.append('uploaded_by', (user?.id as string) || '')
      await uploadMedia(formData)
      toast.success('Arquivo enviado com sucesso!')
    } catch {
      toast.error('Erro ao enviar arquivo.')
    }
    setUploading(false)
    e.target.value = ''
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return
    try {
      await deleteMedia(id)
      toast.success('Arquivo excluído.')
    } catch {
      toast.error('Erro ao excluir.')
    }
  }

  const filtered = items.filter(
    (i) => !search || i.name.toLowerCase().includes(search.toLowerCase()),
  )
  const folders = [...new Set(items.map((i) => i.folder || 'Geral'))]

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-8 h-8 text-[#005B2E]" />
    if (type.startsWith('video/')) return <Film className="w-8 h-8 text-[#C89B3C]" />
    return <FileText className="w-8 h-8 text-muted-foreground" />
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar arquivos..."
                className="pl-10"
              />
            </div>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="border border-border rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="">Pasta: Geral</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <Label className="flex items-center gap-2 cursor-pointer">
              <Button asChild className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
                <span>
                  {uploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}{' '}
                  Enviar Arquivo
                </span>
              </Button>
              <input
                type="file"
                onChange={handleUpload}
                className="hidden"
                accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.mp4"
              />
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Formatos aceitos: PNG, JPG, JPEG, WEBP, SVG, PDF, MP4 (máx 50MB)
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-bold">Nenhum arquivo na biblioteca.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className="border border-border group">
              <CardContent className="p-3 space-y-2">
                <div className="aspect-square rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden">
                  {item.type.startsWith('image/') ? (
                    <img
                      src={pb.files.getURL(
                        {
                          id: item.id,
                          collectionId: 'cms_media',
                          collectionName: 'cms_media',
                        } as never,
                        item.file,
                      )}
                      alt={item.alt_text || item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getFileIcon(item.type)
                  )}
                </div>
                <p className="text-xs font-bold truncate">{item.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {item.folder} · {(item.size / 1024).toFixed(0)}KB
                </p>
                <Button
                  onClick={() => handleDelete(item.id, item.name)}
                  variant="ghost"
                  size="sm"
                  className="w-full text-red-500 hover:text-red-600 text-xs"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Excluir
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
