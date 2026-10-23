import { useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import {
  downloadTemplateExcel,
  parseAndValidateExcel,
  executeImport,
  type ValidationResult,
  type ImportExecutionResult,
} from '@/services/excel-import-service'
import type { CadastroConfig } from '@/lib/cadastros-types'

interface Props {
  config: CadastroConfig
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type DialogStep = 'select' | 'validating' | 'preview' | 'importing' | 'result'

export function ExcelImportDialog({ config, open, onOpenChange, onSuccess }: Props) {
  const { user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<DialogStep>('select')
  const [fileName, setFileName] = useState('')
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [execution, setExecution] = useState<ImportExecutionResult | null>(null)
  const [progress, setProgress] = useState(0)

  const reset = () => {
    setStep('select')
    setFileName('')
    setValidation(null)
    setExecution(null)
    setProgress(0)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen && step === 'importing') return // não fecha durante gravação
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  const handleDownloadTemplate = () => {
    try {
      downloadTemplateExcel(config)
      toast({
        title: 'Modelo Excel gerado',
        description: 'O download da planilha modelo foi iniciado.',
      })
    } catch {
      toast({ title: 'Erro ao gerar modelo', variant: 'destructive' })
    }
  }

  const handleFileSelect = async (file: File) => {
    if (!/\.(xlsx|xlsm)$/i.test(file.name)) {
      toast({
        title: 'Formato inválido',
        description: 'Selecione um arquivo Excel (.xlsx) gerado a partir do modelo oficial.',
        variant: 'destructive',
      })
      return
    }

    setFileName(file.name)
    setStep('validating')
    setValidation(null)
    setExecution(null)

    try {
      const result = await parseAndValidateExcel(file, config)
      setValidation(result)
      setStep('preview')
    } catch (err: any) {
      toast({
        title: 'Erro ao ler a planilha',
        description: err?.message || 'Verifique se o arquivo segue o modelo oficial.',
        variant: 'destructive',
      })
      setStep('select')
    }
  }

  const handleConfirmImport = async () => {
    if (!validation || validation.validRows.length === 0) return
    setStep('importing')
    setProgress(0)

    try {
      const result = await executeImport(config, validation.validRows, user, (processed, total) => {
        setProgress(Math.round((processed / total) * 100))
      })
      setExecution(result)
      setStep('result')
      if (result.successCount > 0) {
        onSuccess()
      }
    } catch (err: any) {
      toast({
        title: 'Erro na importação',
        description: err?.message || 'Falha inesperada durante a gravação.',
        variant: 'destructive',
      })
      setStep('preview')
    }
  }

  const validCount = validation?.validRows.length ?? 0
  const invalidCount = validation?.invalidRows.length ?? 0
  const duplicatesCount = validation?.duplicatesCount ?? 0
  const hasBlockingErrors = invalidCount > 0 && validCount === 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E] flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Importação Excel — {config.label}
          </DialogTitle>
          <DialogDescription>
            Importação aditiva: apenas inclui registros novos. Nada é alterado ou excluído.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xlsm"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
        />

        {/* ETAPA 1: Seleção do arquivo */}
        {step === 'select' && (
          <div className="space-y-4">
            <Alert>
              <Info className="w-4 h-4" />
              <AlertTitle>Antes de importar</AlertTitle>
              <AlertDescription>
                Baixe o modelo Excel específico desta tela, preencha os dados seguindo as instruções
                da aba "Instruções" e envie o arquivo para validação. A prévia mostra exatamente o
                que será gravado antes da confirmação.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="flex-1 border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10 font-semibold"
              >
                <Download className="w-4 h-4 mr-2" /> Baixar Modelo Excel
              </Button>
              <Button
                onClick={() => fileRef.current?.click()}
                className="flex-1 bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                <Upload className="w-4 h-4 mr-2" /> Importar Excel
              </Button>
            </div>

            <div
              className="border-2 border-dashed border-[#005B2E]/30 rounded-lg p-6 text-center cursor-pointer hover:bg-[#005B2E]/5 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto text-[#005B2E]/60 mb-2" />
              <p className="text-sm font-medium">Clique para selecionar o arquivo .xlsx</p>
              <p className="text-xs text-muted-foreground mt-1">
                Validação completa antes de gravar: obrigatórios, CPF/CNPJ, duplicados e vínculos
              </p>
            </div>
          </div>
        )}

        {/* ETAPA 2: Validando */}
        {step === 'validating' && (
          <div className="py-10 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
            <p className="text-sm font-medium">Validando "{fileName}"...</p>
            <p className="text-xs text-muted-foreground">
              Conferindo obrigatórios, formatos, CPF/CNPJ, duplicados e vínculos
            </p>
          </div>
        )}

        {/* ETAPA 3: Prévia */}
        {step === 'preview' && validation && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-center">
                <p className="text-2xl font-black text-emerald-700">{validCount}</p>
                <p className="text-xs font-semibold text-emerald-800">Válidos</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
                <p className="text-2xl font-black text-red-700">{invalidCount}</p>
                <p className="text-xs font-semibold text-red-800">Com erro</p>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
                <p className="text-2xl font-black text-amber-700">{duplicatesCount}</p>
                <p className="text-xs font-semibold text-amber-800">Duplicados</p>
              </div>
            </div>

            {validation.warning && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <AlertTitle>Aviso de Governança</AlertTitle>
                <AlertDescription>{validation.warning}</AlertDescription>
              </Alert>
            )}

            {invalidCount > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertTitle>Corrija a planilha e reenvie</AlertTitle>
                <AlertDescription>
                  Linhas com erro serão ignoradas na gravação. Você pode corrigir o arquivo e
                  reenviá-lo antes de confirmar.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Registros válidos ({validCount})
              </p>
              <div className="max-h-40 overflow-y-auto rounded-lg border border-emerald-200 divide-y divide-emerald-100">
                {validCount === 0 && (
                  <p className="text-xs text-muted-foreground p-3">Nenhum registro válido.</p>
                )}
                {validation.validRows.map((r) => (
                  <div key={r.rowNumber} className="flex items-center gap-2 px-3 py-1.5 text-xs">
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      Linha {r.rowNumber}
                    </Badge>
                    <span className="truncate">{r.summary}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Registros com erro ({invalidCount})
              </p>
              <div className="max-h-52 overflow-y-auto rounded-lg border border-red-200 divide-y divide-red-100">
                {invalidCount === 0 && (
                  <p className="text-xs text-muted-foreground p-3">Nenhum erro encontrado.</p>
                )}
                {validation.invalidRows.map((r) => (
                  <div key={r.rowNumber} className="px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${r.isDuplicate ? 'border-amber-400 text-amber-700' : 'border-red-300 text-red-700'}`}
                      >
                        Linha {r.rowNumber}
                      </Badge>
                      {r.isDuplicate && (
                        <span className="text-[10px] font-bold text-amber-700">
                          DUPLICADO — será ignorado
                        </span>
                      )}
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-red-700">
                      {r.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 4: Gravando */}
        {step === 'importing' && (
          <div className="py-10 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
            <p className="text-sm font-medium">Gravando {validCount} registro(s)...</p>
            <Progress value={progress} className="w-full max-w-sm" />
            <p className="text-xs text-muted-foreground">{progress}% concluído</p>
          </div>
        )}

        {/* ETAPA 5: Relatório final */}
        {step === 'result' && execution && (
          <div className="space-y-4">
            <Alert
              className={
                execution.errorCount === 0
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-amber-200 bg-amber-50'
              }
            >
              {execution.errorCount === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              )}
              <AlertTitle>
                Importação concluída — {execution.successCount} incluído(s), {execution.errorCount}{' '}
                erro(s)
              </AlertTitle>
              <AlertDescription>
                {duplicatesCount} registro(s) ignorado(s) por duplicidade. O log de auditoria desta
                operação foi registrado.
              </AlertDescription>
            </Alert>

            {execution.errors.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-lg border border-red-200 divide-y divide-red-100">
                {execution.errors.map((err, idx) => (
                  <div key={idx} className="px-3 py-1.5 text-xs text-red-700">
                    <span className="font-bold">Linha {err.rowNumber}:</span> {err.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {(step === 'preview' || step === 'result') && (
            <Button variant="outline" onClick={reset}>
              {step === 'result' ? 'Importar outro arquivo' : 'Corrigir e reenviar'}
            </Button>
          )}
          {step === 'select' && (
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
          )}
          {step === 'preview' && (
            <Button
              onClick={handleConfirmImport}
              disabled={validCount === 0}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              Confirmar Importação ({validCount})
            </Button>
          )}
          {(step === 'result' || (step === 'preview' && hasBlockingErrors)) && (
            <Button variant="outline" onClick={() => handleClose(false)}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
