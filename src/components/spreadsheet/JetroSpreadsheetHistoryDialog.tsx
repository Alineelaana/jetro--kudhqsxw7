import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { History, RotateCcw, User, Calendar, FileText } from 'lucide-react'
import { getWorkbookVersions, restoreWorkbookVersion } from '@/services/spreadsheet-storage'
import type { WorkbookRecord, WorkbookVersionRecord } from '@/types/spreadsheet'

interface JetroSpreadsheetHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
  canRestore: boolean
  onRestored: (record: WorkbookRecord) => void
}

export const JetroSpreadsheetHistoryDialog: React.FC<JetroSpreadsheetHistoryDialogProps> = ({
  open,
  onOpenChange,
  slug,
  canRestore,
  onRestored,
}) => {
  const [versions, setVersions] = useState<WorkbookVersionRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<WorkbookVersionRecord | null>(null)

  useEffect(() => {
    if (open) {
      loadVersions()
    }
  }, [open, slug])

  const loadVersions = async () => {
    try {
      setLoading(true)
      const list = await getWorkbookVersions(slug)
      setVersions(list)
      if (list.length > 0) {
        setSelectedVersion(list[0])
      }
    } catch (err) {
      console.error('Erro ao carregar histórico de versões:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (verNum: number) => {
    if (!canRestore) return
    try {
      setRestoring(true)
      const updated = await restoreWorkbookVersion(slug, verNum)
      onRestored(updated)
      onOpenChange(false)
    } catch (err) {
      console.error('Erro ao restaurar versão:', err)
    } finally {
      setRestoring(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#005B2E]">
            <History className="w-5 h-5 text-[#005B2E]" />
            Histórico de Versões da Planilha
          </DialogTitle>
          <DialogDescription className="text-xs">
            Consulte versões salvas e reverta alterações a qualquer momento com segurança.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500">Carregando versões...</div>
          ) : versions.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              Nenhuma versão arquivada encontrada para esta planilha.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-md">
              {versions.map((ver) => {
                const dateStr = ver.created ? new Date(ver.created).toLocaleString('pt-BR') : '—'
                return (
                  <div
                    key={ver.id}
                    className={`p-3 flex items-center justify-between gap-3 text-xs hover:bg-gray-50 transition-colors ${
                      selectedVersion?.id === ver.id ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          Versão #{ver.version_number}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            ver.origin === 'autosave'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-[#005B2E] border-emerald-200'
                          }`}
                        >
                          {ver.origin === 'autosave' ? 'Salvamento Automático' : 'Manual / Marco'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {dateStr}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          {ver.author_name || 'Usuário Jetro'}
                        </span>
                      </div>

                      {ver.description && (
                        <p className="text-[11px] text-gray-600 italic">"{ver.description}"</p>
                      )}
                    </div>

                    {canRestore && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={restoring}
                        onClick={() => handleRestore(ver.version_number)}
                        className="text-xs h-7 text-[#005B2E] border-[#005B2E]/30 hover:bg-emerald-50 shrink-0"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Restaurar
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
