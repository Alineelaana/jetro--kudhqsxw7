import { useState } from 'react'
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
import { Loader2, Code2, Download, Crown, FileCode, Database, Settings } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BackupCodeExportDialog({ open, onOpenChange }: Props) {
  const [exporting, setExporting] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    await new Promise((r) => setTimeout(r, 1500))
    setExporting(false)
    setShowUpgrade(true)
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => setShowUpgrade(false), 300)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose()
        onOpenChange(o)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#005B2E] flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Exportar Código do Projeto
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">
              <Crown className="w-3 h-3 mr-1" /> Premium
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Exporte todo o código-fonte do seu projeto, incluindo frontend, hooks e migrações do
            banco de dados.
          </DialogDescription>
        </DialogHeader>

        {showUpgrade ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <h4 className="font-bold text-yellow-800">Recurso Premium</h4>
              </div>
              <p className="text-sm text-yellow-700">
                A exportação de código completo está disponível apenas para planos Premium. Faça
                upgrade para baixar todo o código-fonte do seu projeto, incluindo:
              </p>
              <ul className="text-sm text-yellow-700 space-y-1 ml-4">
                <li className="flex items-center gap-2">
                  <FileCode className="w-3.5 h-3.5" /> Frontend completo (React + TypeScript)
                </li>
                <li className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5" /> Migrações e schema do banco
                </li>
                <li className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" /> Hooks e configurações
                </li>
              </ul>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold"
              onClick={() => window.open('https://goskip.app/pricing', '_blank')}
            >
              <Crown className="w-4 h-4 mr-2" /> Fazer Upgrade para Premium
            </Button>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <FileCode className="w-4 h-4 text-[#005B2E]" />
                <span>Frontend (React, TypeScript, TailwindCSS)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Database className="w-4 h-4 text-[#005B2E]" />
                <span>Migrações PocketBase e schema</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4 text-[#005B2E]" />
                <span>Hooks e configurações do backend</span>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Fechar
          </Button>
          {!showUpgrade && (
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {exporting ? 'Preparando...' : 'Exportar Código'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
