import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Github, GitBranch, FileText, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export function GitHubConnectionButton() {
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    setOpen(true)
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        title="Conexão GitHub"
        className="text-white/60 hover:text-[#E4C46A] relative"
      >
        <Github className="w-5 h-5" />
        <span
          className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400"
          title="Indisponível"
        />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E] flex items-center gap-2">
              <Github className="w-5 h-5" />
              Conexão com GitHub
            </DialogTitle>
            <DialogDescription>
              A conexão com GitHub é um recurso premium que permite versionar migrações e habilitar
              controle de alterações do projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="font-semibold text-amber-800 mb-1">Status: Não conectado</p>
              <p className="text-amber-700 text-xs">
                A integração com GitHub ainda não está ativada para este projeto. Para conectá-la,
                acesse as configurações da plataforma Skip Cloud e ative a sincronização com o
                repositório.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-[#005B2E] flex items-center gap-1.5">
                <GitBranch className="w-4 h-4" />
                Versionamento local (alternativa temporária)
              </p>
              <p className="text-muted-foreground text-xs">
                Até que a conexão esteja disponível, as migrações em{' '}
                <code className="bg-muted px-1 rounded text-xs">pocketbase/migrations/</code> e os
                hooks em <code className="bg-muted px-1 rounded text-xs">pocketbase/hooks/</code> já
                estão versionados localmente no repositório do projeto. Cada migração possui
                numeração sequencial (0001–0159) e é idempotente. Consulte{' '}
                <code className="bg-muted px-1 rounded text-xs">
                  docs/LOCAL_MIGRATION_VERSIONING_GUIDE.md
                </code>{' '}
                para o guia completo de versionamento local.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-[#005B2E] flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                Documentação de validação
              </p>
              <p className="text-muted-foreground text-xs">
                Consulte{' '}
                <code className="bg-muted px-1 rounded text-xs">
                  docs/E2E_FLOW_VALIDATION.md
                </code>{' '}
                para o relatório completo da validação end-to-end do fluxo Logística → WMS →
                Transporte → Logística.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                toast.info(
                  'Para ativar a conexão GitHub, acesse as configurações da plataforma Skip Cloud.',
                  { duration: 5000 },
                )
                setOpen(false)
              }}
            >
              <ExternalLink className="w-4 h-4 mr-1" /> Configurações Skip Cloud
            </Button>
            <Button
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              onClick={() => setOpen(false)}
            >
              Entendi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
