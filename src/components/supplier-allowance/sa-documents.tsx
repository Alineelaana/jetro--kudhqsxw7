import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { VR_COLLECTIONS, vrGetList, vrCreate, vrDelete } from '@/services/verbas-roadmap'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Plus, Search, Loader2, Trash2, FileText, Upload } from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'

export function SaDocuments() {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      setRecords(await vrGetList(VR_COLLECTIONS.documents))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime(VR_COLLECTIONS.documents, () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return !q || (r.name || '').toLowerCase().includes(q)
  })

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const file = files[0]
    const formData = new FormData()
    formData.append('name', file.name)
    formData.append('file', file)
    formData.append('type', file.type)
    formData.append('size', String(file.size))
    formData.append('uploaded_by', user?.name || '')
    try {
      await pb.collection(VR_COLLECTIONS.documents).create(formData)
      toast.success('Documento enviado')
      load()
    } catch {
      toast.error('Erro ao enviar')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Documentos</h3>
        <div>
          <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
          <Button
            onClick={() => fileRef.current?.click()}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Upload className="w-4 h-4 mr-2" /> Enviar Documento
          </Button>
        </div>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar documentos..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      {filtered.length === 0 ? (
        <Card className="border-2 border-dashed border-[#005B2E]/30">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-[#005B2E]/30 mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum documento encontrado</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((r) => (
            <Card
              key={r.id}
              className="border-2 border-[#005B2E]/20 hover:shadow-lg transition-shadow"
            >
              <CardContent className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-8 h-8 text-[#005B2E] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{r.name || '—'}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.type || '—'} •{' '}
                      {r.created ? new Date(r.created).toLocaleDateString('pt-BR') : '—'}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await vrDelete(VR_COLLECTIONS.documents, r.id)
                    load()
                  }}
                  className="text-red-600 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
