import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  listBackups,
  downloadBackup,
  downloadBackupFile,
  deleteBackup,
  formatFileSize,
  type BackupRecord,
} from '@/services/backups'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { BackupCreateDialog } from '@/components/backup-create-dialog'
import { Loader2, Plus, Download, Trash2, AlertCircle, HardDrive } from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  full: 'Completo',
  database: 'Banco de Dados',
  files: 'Arquivos',
  config: 'Configuração',
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-300',
  restored: 'bg-blue-100 text-blue-800 border-blue-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
}

export function BackupPanel() {
  const { isAdmin } = useAuth()
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const loadBackups = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await listBackups()
      setBackups(result.items)
    } catch {
      setError('Erro ao carregar backups.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBackups()
  }, [])
  useRealtime('backups', () => {
    loadBackups()
  })

  const handleDownload = async (backup: BackupRecord) => {
    setDownloadingId(backup.id)
    try {
      const { file_name } = await downloadBackup(backup.id)
      await downloadBackupFile(backup.id, file_name)
    } catch {
      setError('Erro ao baixar backup.')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteBackup(deleteId)
      setDeleteId(null)
      await loadBackups()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  if (!isAdmin) {
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
          <p className="font-bold text-destructive">
            Acesso negado. Apenas usuários SUP podem gerenciar backups.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-[#005B2E]" /> Backups do Sistema
        </h2>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Criar Backup
        </Button>
      </div>

      {error && (
        <Card className="border-destructive/30">
          <CardContent className="py-3 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : backups.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum backup encontrado.
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#01361D] text-white">
                  <th className="text-left px-3 py-3 font-bold">Nome</th>
                  <th className="text-left px-3 py-3 font-bold">Tipo</th>
                  <th className="text-left px-3 py-3 font-bold">Status</th>
                  <th className="text-left px-3 py-3 font-bold">Tamanho</th>
                  <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Criado por</th>
                  <th className="text-left px-3 py-3 font-bold hidden md:table-cell">Data</th>
                  <th className="text-center px-3 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-2 font-medium">{backup.version_name}</td>
                    <td className="px-3 py-2">
                      {TYPE_LABELS[backup.backup_type] || backup.backup_type}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded border ${STATUS_STYLES[backup.status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}
                      >
                        {backup.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">{formatFileSize(backup.file_size)}</td>
                    <td className="px-3 py-2 hidden sm:table-cell">
                      {backup.created_by_name || '—'}
                    </td>
                    <td className="px-3 py-2 hidden md:table-cell whitespace-nowrap">
                      {backup.created ? new Date(backup.created).toLocaleString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(backup)}
                          disabled={downloadingId === backup.id || !backup.file}
                          className="border-[#005B2E] text-[#005B2E]"
                        >
                          {downloadingId === backup.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteId(backup.id)}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <BackupCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={loadBackups}
        onError={setError}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza? Esta ação não pode ser desfeita. O backup será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
