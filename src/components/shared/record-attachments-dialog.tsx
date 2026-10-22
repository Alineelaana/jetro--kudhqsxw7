import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Paperclip, Upload, Trash2, Download, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'

export interface RecordAttachment {
  id: string
  module: string
  record_id: string
  file_name: string
  file_size?: number
  file_type?: string
  category?: string
  description?: string
  empresa?: string
  uploaded_by_name?: string
  file?: string
  created?: string
}

interface RecordAttachmentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  module: 'DP' | 'RH' | 'SST' | string
  recordId: string
  recordTitle?: string
}

export function RecordAttachmentsDialog({
  open,
  onOpenChange,
  module,
  recordId,
  recordTitle,
}: RecordAttachmentsDialogProps) {
  const { user } = useAuth()
  const [attachments, setAttachments] = useState<RecordAttachment[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')

  const loadAttachments = async () => {
    if (!recordId) return
    setLoading(true)
    try {
      const records = await pb.collection('generic_attachments').getFullList<RecordAttachment>({
        filter: `record_id = "${recordId}" && module = "${module}"`,
        sort: '-created',
      })
      setAttachments(records)
    } catch (err) {
      console.warn('Erro ao carregar anexos:', err)
      setAttachments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open && recordId) {
      loadAttachments()
      setSelectedFile(null)
      setDescription('')
      setCategory('')
    }
  }, [open, recordId, module])

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo para anexar')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('module', module)
      formData.append('record_id', recordId)
      formData.append('file_name', selectedFile.name)
      formData.append('file_size', String(selectedFile.size))
      formData.append('file_type', selectedFile.type || 'application/octet-stream')
      formData.append('category', category || 'Documento Geral')
      formData.append('description', description)
      formData.append('empresa', (user as any)?.empresa_id || '')
      formData.append('uploaded_by_name', user?.name || user?.email || 'Usuário')
      formData.append('file', selectedFile)

      await pb.collection('generic_attachments').create(formData)
      toast.success('Arquivo anexado com sucesso!')
      setSelectedFile(null)
      setDescription('')
      setCategory('')
      loadAttachments()
    } catch (err: any) {
      console.error(err)
      toast.error(err?.message || 'Erro ao anexar arquivo')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (attId: string) => {
    try {
      await pb.collection('generic_attachments').delete(attId)
      toast.success('Anexo removido')
      setAttachments((prev) => prev.filter((a) => a.id !== attId))
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao excluir anexo')
    }
  }

  const getFileUrl = (item: RecordAttachment) => {
    if (!item.file) return '#'
    return pb.files.getURL(item, item.file)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#005B2E]">
            <Paperclip className="w-5 h-5" />
            Anexos e Documentos — {module}
          </DialogTitle>
          {recordTitle && (
            <p className="text-xs text-muted-foreground truncate">
              Vínculo: <strong className="text-foreground">{recordTitle}</strong>
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Seção de Upload */}
          <div className="p-3 border rounded-lg bg-muted/30 space-y-3">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Novo Anexo
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Categoria / Tipo de Documento</Label>
                <Input
                  placeholder="Ex: Atestado, Contrato, ASO, Certificado"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Descrição rápida</Label>
                <Input
                  placeholder="Observação sobre o arquivo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="file"
                id="file-upload-input"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0])
                  }
                }}
              />
              <label
                htmlFor="file-upload-input"
                className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium border rounded cursor-pointer hover:bg-muted text-foreground bg-white"
              >
                <Upload className="w-3.5 h-3.5 mr-1 text-[#005B2E]" />
                {selectedFile ? selectedFile.name : 'Selecionar Arquivo'}
              </label>

              {selectedFile && (
                <span className="text-xs text-muted-foreground">
                  ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
              )}

              <Button
                size="sm"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="ml-auto h-8 bg-[#005B2E] hover:bg-[#01361D] text-white text-xs"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Anexando...
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 mr-1" /> Salvar Anexo
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Lista de Anexos */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              Arquivos Vinculados ({attachments.length})
            </p>
            {loading ? (
              <div className="py-6 flex justify-center text-xs text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin text-[#005B2E]" />
              </div>
            ) : attachments.length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed rounded-lg text-xs text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-1 opacity-40" />
                Nenhum anexo salvo para este registro.
              </div>
            ) : (
              <div className="space-y-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2.5 border rounded-md bg-white hover:bg-muted/40 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <FileText className="w-4 h-4 text-[#005B2E] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground truncate">{att.file_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {att.category ? `${att.category} • ` : ''}
                          {att.uploaded_by_name ? `Enviado por ${att.uploaded_by_name} • ` : ''}
                          {att.created ? new Date(att.created).toLocaleDateString('pt-BR') : ''}
                          {att.description ? ` — ${att.description}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        className="h-7 px-2 text-[#005B2E] hover:bg-[#005B2E]/10"
                      >
                        <a href={getFileUrl(att)} target="_blank" rel="noopener noreferrer">
                          <Download className="w-3.5 h-3.5 mr-1" /> Baixar
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(att.id)}
                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50"
                        title="Excluir anexo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
