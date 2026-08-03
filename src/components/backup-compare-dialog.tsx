import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { compareBackups, type ComparisonResult, type BackupRecord } from '@/services/backups'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { Loader2, GitCompare, ArrowLeft, Plus, Minus, Edit } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  backups: BackupRecord[]
  onError: (msg: string) => void
}

export function BackupCompareDialog({ open, onOpenChange, backups, onError }: Props) {
  const [backupA, setBackupA] = useState('')
  const [backupB, setBackupB] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ComparisonResult | null>(null)

  const handleCompare = async () => {
    if (!backupA || !backupB) return
    setLoading(true)
    try {
      const r = await compareBackups(backupA, backupB)
      setResult(r)
    } catch (err) {
      onError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setResult(null)
    setBackupA('')
    setBackupB('')
  }

  const totalAdded = result?.collections.reduce((s, c) => s + c.summary.added, 0) ?? 0
  const totalRemoved = result?.collections.reduce((s, c) => s + c.summary.removed, 0) ?? 0
  const totalChanged = result?.collections.reduce((s, c) => s + c.summary.changed, 0) ?? 0

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) handleBack()
      }}
    >
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#005B2E] flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            {result ? 'Resultado da Comparação' : 'Comparar Versões de Backup'}
          </DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm space-y-1">
                <p>
                  <strong>A:</strong> {result.backup_a.name}
                </p>
                <p>
                  <strong>B:</strong> {result.backup_b.name}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
              </Button>
            </div>

            <div className="flex gap-3 text-sm">
              <span className="flex items-center gap-1 px-3 py-1 rounded bg-green-100 text-green-800 font-semibold">
                <Plus className="w-3 h-3" /> {totalAdded} adicionados
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded bg-red-100 text-red-800 font-semibold">
                <Minus className="w-3 h-3" /> {totalRemoved} removidos
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded bg-yellow-100 text-yellow-800 font-semibold">
                <Edit className="w-3 h-3" /> {totalChanged} alterados
              </span>
            </div>

            {result.collections.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma diferença encontrada entre os backups.
              </p>
            ) : (
              <Accordion type="multiple" className="w-full">
                {result.collections.map((col) => (
                  <AccordionItem key={col.name} value={col.name}>
                    <AccordionTrigger className="text-sm font-bold">
                      {col.name} (+{col.summary.added} / -{col.summary.removed} / ~
                      {col.summary.changed})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {col.added.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 rounded bg-green-50 border border-green-200 px-3 py-1.5 text-xs"
                          >
                            <Plus className="w-3 h-3 text-green-600 flex-shrink-0" />
                            <span className="font-mono">{item.id}</span>
                          </div>
                        ))}
                        {col.removed.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 rounded bg-red-50 border border-red-200 px-3 py-1.5 text-xs"
                          >
                            <Minus className="w-3 h-3 text-red-600 flex-shrink-0" />
                            <span className="font-mono">{item.id}</span>
                          </div>
                        ))}
                        {col.changed.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 rounded bg-yellow-50 border border-yellow-200 px-3 py-1.5 text-xs"
                          >
                            <Edit className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                            <span className="font-mono">{item.id}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Selecione dois backups para comparar as diferenças entre eles.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Backup A (base)</label>
                <Select value={backupA} onValueChange={setBackupA}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o backup A" />
                  </SelectTrigger>
                  <SelectContent>
                    {backups.map((b) => (
                      <SelectItem key={b.id} value={b.id} disabled={b.id === backupB}>
                        {b.version_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Backup B (comparação)</label>
                <Select value={backupB} onValueChange={setBackupB}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o backup B" />
                  </SelectTrigger>
                  <SelectContent>
                    {backups.map((b) => (
                      <SelectItem key={b.id} value={b.id} disabled={b.id === backupA}>
                        {b.version_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleCompare}
                disabled={loading || !backupA || !backupB}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <GitCompare className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Comparando...' : 'Comparar'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
