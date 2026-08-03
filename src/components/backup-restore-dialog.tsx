import { useState } from 'react'
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
import { AlertCircle, Loader2, RotateCcw } from 'lucide-react'
import { restoreBackup } from '@/services/backups'
import { getErrorMessage } from '@/lib/pocketbase/errors'

interface Props {
  backupId: string | null
  backupName: string
  onOpenChange: (open: boolean) => void
  onRestored: () => void
  onError: (msg: string) => void
}

export function BackupRestoreDialog({
  backupId,
  backupName,
  onOpenChange,
  onRestored,
  onError,
}: Props) {
  const [restoring, setRestoring] = useState(false)

  const handleRestore = async () => {
    if (!backupId) return
    setRestoring(true)
    try {
      await restoreBackup(backupId)
      onOpenChange(false)
      onRestored()
    } catch (err) {
      onError(getErrorMessage(err))
    } finally {
      setRestoring(false)
    }
  }

  return (
    <AlertDialog open={!!backupId} onOpenChange={(open) => !open && onOpenChange(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#005B2E]">Restaurar Backup</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Você está prestes a restaurar o backup <strong>{backupName}</strong>. Todos os dados
                atuais serão substituídos pelos dados deste backup.
              </p>
              <div className="flex items-start gap-2 rounded-lg bg-yellow-50 border border-yellow-300 p-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Esta ação não pode ser desfeita. Recomendamos criar um backup do estado atual
                  antes de prosseguir.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={restoring}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRestore}
            disabled={restoring}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white"
          >
            {restoring ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            {restoring ? 'Restaurando...' : 'Restaurar Agora'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
