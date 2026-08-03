import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createBackup } from '@/services/backups'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'
import { Loader2, Database } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
  onError: (msg: string) => void
}

export function BackupCreateDialog({ open, onOpenChange, onCreated, onError }: Props) {
  const [name, setName] = useState('')
  const [backupType, setBackupType] = useState('full')
  const [observations, setObservations] = useState('')
  const [creating, setCreating] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const handleCreate = async () => {
    setCreating(true)
    setFieldErrors({})
    try {
      await createBackup({
        version_name: name,
        backup_type: backupType,
        observations,
      })
      onOpenChange(false)
      setName('')
      setBackupType('full')
      setObservations('')
      onCreated()
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      onError(getErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#005B2E]">Criar Novo Backup</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="backup-name">Nome do Backup *</Label>
            <Input
              id="backup-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Cópia VeloraLog"
              disabled={creating}
            />
            {fieldErrors.version_name && (
              <p className="text-sm text-red-500">{fieldErrors.version_name}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label>Tipo de Backup</Label>
            <Select value={backupType} onValueChange={setBackupType} disabled={creating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Completo</SelectItem>
                <SelectItem value="database">Banco de Dados</SelectItem>
                <SelectItem value="files">Arquivos</SelectItem>
                <SelectItem value="config">Configuração</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="backup-obs">Observações</Label>
            <Textarea
              id="backup-obs"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações opcionais..."
              rows={3}
              disabled={creating}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Database className="w-4 h-4 mr-2" />
            )}
            {creating ? 'Criando...' : 'Criar Backup'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
