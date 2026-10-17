import { useState, useRef } from 'react'
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Layers,
  Clock,
  Shield,
  FileCode,
  Info,
  RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { syncObsidianNotes } from '@/services/segundo-cerebro'
import type { SegundoCerebroSyncLog } from '@/types/segundo-cerebro'

interface SettingsProps {
  syncLogs: SegundoCerebroSyncLog[]
  onSyncCompleted: () => void
  userRole?: string
}

export function SegundoCerebroSettings({ syncLogs, onSyncCompleted, userRole }: SettingsProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [syncResult, setSyncResult] = useState<{
    summary: string
    errors: string[]
  } | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setSyncResult(null)

    const notesToSync: Array<{
      title: string
      path: string
      content: string
      area?: string
      tags?: string[]
      wikilinks?: string[]
    }> = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
          const content = await file.text()
          const title = file.name.replace(/\.(md|markdown)$/i, '')
          // inferir área do path se disponível ou deixar padrão
          const path = (file as any).webkitRelativePath || file.name

          notesToSync.push({
            title,
            path,
            content,
          })
        }
      }

      if (notesToSync.length === 0) {
        toast({
          title: 'Nenhum arquivo .md selecionado',
          description: 'Selecione arquivos Markdown do cofre Obsidian.',
          variant: 'destructive',
        })
        setUploading(false)
        return
      }

      const res = await syncObsidianNotes({
        notes: notesToSync,
        source_type: 'obsidian_file',
        file_name: files.length === 1 ? files[0].name : `${files.length}_notas_obsidian`,
      })

      setSyncResult({
        summary: res.summary,
        errors: res.errors || [],
      })

      toast({
        title: 'Sincronização Concluída',
        description: res.summary,
      })

      onSyncCompleted()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha no processamento'
      toast({
        title: 'Erro na sincronização do Obsidian',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Decisão Obsidian conforme especificação */}
      <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#005B2E]/10 flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5 text-[#005B2E]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Conectar Obsidian — Central de Ingestão de Notas
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              Cofres Obsidian são locais por arquitetura. A integração opera via upload de arquivos
              individuais <code>.md</code> ou estrutura de pastas. O sistema calcula o hash dos
              arquivos, preserva títulos, tags, pastas e links internos <code>[[wikilinks]]</code>,
              e identifica automaticamente novos, modificados e excluídos.
            </p>
          </div>
        </div>

        {/* Status de Sincronização Automática Indisponível conforme requisito */}
        <div className="p-3.5 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-stone-700">
            <Info className="w-4 h-4 text-stone-500" />
            <span>
              Sincronização contínua em segundo plano:{' '}
              <strong>Indisponível — aguardando caminho de integração</strong>
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] bg-stone-200/60 border-stone-300 text-stone-700"
          >
            Unidirecional Obsidian → Jetro
          </Badge>
        </div>

        {/* Zona de Upload */}
        <div className="border-2 border-dashed border-[#005B2E]/40 hover:border-[#005B2E] rounded-xl p-6 text-center bg-stone-50/50 hover:bg-stone-50 transition-colors">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept=".md,.markdown"
            className="hidden"
            id="obsidian-upload-input"
          />
          <UploadCloud className="w-10 h-10 text-[#005B2E] mx-auto mb-2 opacity-80" />
          <h4 className="text-sm font-bold text-gray-800">
            Selecione ou arraste notas .md do seu cofre Obsidian
          </h4>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Envie arquivos Markdown. As tags (#tag) e links internos ([[nota]]) serão mapeados e
            indexados no motor do Segundo Cérebro.
          </p>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4 bg-[#005B2E] hover:bg-[#004724] text-white text-xs font-semibold px-5 h-9 shadow-xs"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Processando e Indexando Notas...
              </span>
            ) : (
              'Selecionar Notas .md do Computador'
            )}
          </Button>
        </div>

        {/* Resultado do Último Upload */}
        {syncResult && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Resultado da Sincronização:
            </div>
            <p>{syncResult.summary}</p>
            {syncResult.errors.length > 0 && (
              <div className="text-rose-800 pt-1">
                <strong>Pendências registradas:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-[11px]">
                  {syncResult.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Matriz de Permissões e Governança Conforme Requisito 1 & 15 */}
      <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#005B2E]" />
          <h3 className="text-sm font-bold text-gray-900">
            Governança de Acesso e Segurança Documental
          </h3>
        </div>
        <p className="text-xs text-gray-600">
          O acesso ao módulo não concede acesso a todos os documentos. Cada consulta da IA aplica
          filtros server-side por categoria e nível de confidencialidade do usuário.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
            <span className="font-bold text-gray-800 block">Público / Geral</span>
            <span className="text-[11px] text-gray-500">
              Acesso irrestrito a todos os colaboradores autorizados no módulo.
            </span>
          </div>
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
            <span className="font-bold text-amber-900 block">Estratégico</span>
            <span className="text-[11px] text-amber-800/80">
              Restrito a perfis SUP, Comercial e Financeiro. Oculto para perfis operacionais.
            </span>
          </div>
          <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-200">
            <span className="font-bold text-rose-900 block">Confidencial</span>
            <span className="text-[11px] text-rose-800/80">
              Exclusivo de diretoria e superusuário (SUP). Bloqueado para os demais.
            </span>
          </div>
        </div>
      </Card>

      {/* Histórico e Log de Sincronizações */}
      <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <h3 className="text-sm font-bold text-gray-900">
              Registro de Sincronizações e Auditoria de Cargas
            </h3>
          </div>
          <span className="text-[11px] text-gray-400">Total de registros: {syncLogs.length}</span>
        </div>

        {syncLogs.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-3 text-center">
            Nenhuma sincronização gravada no histórico.
          </p>
        ) : (
          <div className="space-y-2">
            {syncLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border border-gray-100 bg-stone-50/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {log.file_name || 'Carga Obsidian'}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] ${
                        log.status === 'sucesso'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {log.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{log.summary}</p>
                </div>
                <div className="text-right text-[10px] text-gray-400">
                  <span>{new Date(log.created).toLocaleDateString('pt-BR')}</span>
                  <span className="block font-medium text-gray-600">{log.user_name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
