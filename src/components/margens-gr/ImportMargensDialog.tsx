import { useState, useRef, useMemo } from 'react'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  FileDown,
  RefreshCw,
  Sliders,
  Check,
  Layers,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  parseExcelOrCsvFile,
  processarLinhas,
  type ParseResult,
  type DetectedColumns,
  type ParsedItemCandidate,
} from '@/lib/margens-gr-parser'
import { downloadModeloExcel } from '@/lib/margens-gr-template'
import {
  batchImportMargens,
  type BatchImportResult,
  getMargensParametros,
  buildParametrosMap,
} from '@/services/margens-comparativo'
import { formatCurrencyBRL } from '@/lib/margens-gr-engine'
import { buildComparativoWorkbook } from '@/lib/comparativo-workbook-adapter'
import { saveWorkbook } from '@/services/spreadsheet-storage'

interface ImportMargensDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSuccess: () => Promise<void> | void
  existingRecordsCount: number
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'summary'

export function ImportMargensDialog({
  open,
  onOpenChange,
  onImportSuccess,
  existingRecordsCount,
}: ImportMargensDialogProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Etapa do fluxo
  const [step, setStep] = useState<ImportStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  // Resultado do parsing
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [customMapping, setCustomMapping] = useState<DetectedColumns>({
    colProduto: -1,
    colCmv: -1,
    colPrecoRivoli: -1,
    colOrdem: -1,
  })

  // Modo de importação (replace ou append). Padrão replace (pois a base está vazia / pedido pede padrão substituir)
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace')

  // Progresso de gravação
  const [progressPercent, setProgressPercent] = useState(0)
  const [currentProgressText, setCurrentProgressText] = useState('')

  // Relatório final
  const [finalReport, setFinalReport] = useState<BatchImportResult | null>(null)

  // Filtro de linhas na pré-visualização (todas, validas, ignoradas)
  const [previewFilter, setPreviewFilter] = useState<'validas' | 'ignoradas' | 'todas'>('validas')

  // Reset de estado ao fechar
  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => {
        setStep('upload')
        setSelectedFile(null)
        setParsing(false)
        setParseError(null)
        setParseResult(null)
        setProgressPercent(0)
        setFinalReport(null)
      }, 200)
    }
    onOpenChange(newOpen)
  }

  // Processamento do arquivo selecionado
  const handleFileSelected = async (file: File) => {
    setSelectedFile(file)
    setParsing(true)
    setParseError(null)

    try {
      const result = await parseExcelOrCsvFile(file)
      setParseResult(result)
      setCustomMapping(result.detectedColumns)
      setStep('preview')
    } catch (err) {
      console.error('Erro ao processar planilha:', err)
      const msg = err instanceof Error ? err.message : 'Falha ao ler o arquivo selecionado.'
      setParseError(msg)
      toast({
        title: 'Erro na leitura do arquivo',
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setParsing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (
        file.name.toLowerCase().endsWith('.xlsx') ||
        file.name.toLowerCase().endsWith('.xls') ||
        file.name.toLowerCase().endsWith('.csv')
      ) {
        handleFileSelected(file)
      } else {
        toast({
          title: 'Formato não suportado',
          description: 'Envie um arquivo do tipo Excel (.xlsx) ou CSV.',
          variant: 'destructive',
        })
      }
    }
  }

  // Recalcula linhas do preview caso o usuário altere o mapeamento de colunas
  const previewData = useMemo(() => {
    if (!parseResult) return null

    // Se o mapeamento é exatamente o mesmo retornado pelo detector, usa o resultado original
    const sameMapping =
      customMapping.colProduto === parseResult.detectedColumns.colProduto &&
      customMapping.colCmv === parseResult.detectedColumns.colCmv &&
      customMapping.colPrecoRivoli === parseResult.detectedColumns.colPrecoRivoli &&
      customMapping.colOrdem === parseResult.detectedColumns.colOrdem

    if (sameMapping) {
      return {
        itensValidos: parseResult.itensValidos,
        itensIgnorados: parseResult.itensIgnorados,
        todasLinhas: parseResult.todasLinhas,
      }
    }

    // Se mudou o mapeamento, recalcula sobre a lista bruta existente
    // Reconstruímos a matriz base das linhas a partir de parseResult
    const rowsRaw: string[][] = [parseResult.headers]
    for (const item of parseResult.todasLinhas) {
      const row: string[] = []
      // Monta as posições
      const maxCol = Math.max(
        parseResult.headers.length,
        customMapping.colProduto,
        customMapping.colCmv,
        customMapping.colPrecoRivoli,
        customMapping.colOrdem,
      )
      for (let i = 0; i <= maxCol; i++) row.push('')

      if (parseResult.detectedColumns.colProduto >= 0) {
        row[parseResult.detectedColumns.colProduto] = item.produto
      }
      if (parseResult.detectedColumns.colCmv >= 0) {
        row[parseResult.detectedColumns.colCmv] = String(item.cmv)
      }
      if (parseResult.detectedColumns.colPrecoRivoli >= 0) {
        row[parseResult.detectedColumns.colPrecoRivoli] = String(item.preco_rivoli)
      }
      if (parseResult.detectedColumns.colOrdem >= 0 && item.ordem !== undefined) {
        row[parseResult.detectedColumns.colOrdem] = String(item.ordem)
      }
      rowsRaw.push(row)
    }

    const { itensValidos, itensIgnorados, todasLinhas } = processarLinhas(rowsRaw, 0, customMapping)

    return { itensValidos, itensIgnorados, todasLinhas }
  }, [parseResult, customMapping])

  // Lista de itens filtrados para exibição na tabela da prévia
  const itensExibidos = useMemo(() => {
    if (!previewData) return []
    if (previewFilter === 'validas') return previewData.itensValidos
    if (previewFilter === 'ignoradas') return previewData.itensIgnorados
    return previewData.todasLinhas
  }, [previewData, previewFilter])

  // Disparar a gravação no PocketBase em lote
  const handleConfirmImport = async () => {
    if (!previewData || previewData.itensValidos.length === 0) {
      toast({
        title: 'Nenhum item válido',
        description: 'Não há itens válidos reconhecidos para importar.',
        variant: 'destructive',
      })
      return
    }

    setStep('importing')
    setProgressPercent(0)
    setCurrentProgressText(`Iniciando importação de ${previewData.itensValidos.length} itens...`)

    try {
      const payload = previewData.itensValidos.map((it) => ({
        produto: it.produto,
        cmv: it.cmv,
        preco_rivoli: it.preco_rivoli,
        ordem: it.ordem,
        ativo: true,
      }))

      const result = await batchImportMargens(payload, importMode, (current, total) => {
        const perc = Math.round((current / total) * 100)
        setProgressPercent(perc)
        setCurrentProgressText(`Importando item ${current} de ${total}...`)
      })

      // Adiciona na conta de ignorados as linhas descartadas na prévia
      result.ignorados += previewData.itensIgnorados.length

      // Sincroniza o Workbook do JetroSpreadsheet gravando APENAS A, B, C
      // e estabelecendo SEMPRE as fórmulas canônicas em D a K
      try {
        const paramRecords = await getMargensParametros()
        const params = buildParametrosMap(paramRecords)
        const wbItems = payload.map((p) => ({
          produto: p.produto,
          cmv: p.cmv,
          preco_rivoli: p.preco_rivoli,
        }))
        const newWb = buildComparativoWorkbook(wbItems, params)
        await saveWorkbook({
          slug: 'comparativo-margens-gr',
          titulo: 'Comparativo Margens GR',
          workbookData: newWb,
          changeSummary: 'Atualização pós-importação com fórmulas canônicas',
        })
      } catch (wbErr) {
        console.warn('Aviso: falha ao sincronizar workbook com fórmulas canônicas:', wbErr)
      }

      setFinalReport(result)
      setStep('summary')

      // Dispara recarregamento automático da tela com recálculo pela engine
      await onImportSuccess()

      toast({
        title: 'Importação concluída',
        description: `${result.importados} itens foram gravados na coleção margens_comparativo_gr.`,
      })
    } catch (err) {
      console.error('Erro na gravação em lote:', err)
      const msg = err instanceof Error ? err.message : 'Falha ao salvar registros no banco.'
      setParseError(msg)
      setStep('preview')
      toast({
        title: 'Erro na importação',
        description: msg,
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-2 border-[#005B2E]/20">
        {/* CABEÇALHO DO MODAL */}
        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-[#005B2E]/5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-md bg-[#005B2E] text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  Importar Planilha Excel (.xlsx)
                  <Badge
                    variant="outline"
                    className="text-[10px] text-[#005B2E] border-[#005B2E]/40 font-semibold"
                  >
                    Comparativo GR
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  Carga em lote de produtos, CMV e Preço Rivoli para recálculo de margens
                </DialogDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadModeloExcel()}
              className="text-xs h-8 border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/10"
              title="Baixar planilha de exemplo com as colunas esperadas"
            >
              <FileDown className="w-3.5 h-3.5 mr-1.5" />
              Baixar Modelo
            </Button>
          </div>
        </DialogHeader>

        {/* CORPO DINÂMICO CONFORME A ETAPA */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* ETAPA 1: SELEÇÃO / ENVIO DO ARQUIVO */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[#005B2E] rounded-xl p-10 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-[#005B2E]/5 flex flex-col items-center justify-center group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(e.target.files[0])
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#005B2E] border border-emerald-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-7 h-7 text-[#005B2E]" />
                </div>

                <h4 className="text-sm font-bold text-gray-900">
                  Clique para selecionar ou arraste o arquivo .xlsx aqui
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-md">
                  Suporta arquivos Excel (.xlsx) e (.csv) contendo colunas de Produto, CMV e Preço
                  Rivoli
                </p>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-400">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    .xlsx
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    .csv
                  </Badge>
                  <span>Até 15MB • Formatação brasileira (R$, vírgula decimal) suportada</span>
                </div>
              </div>

              {parsing && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-[#005B2E] animate-spin" />
                  <span className="text-xs text-emerald-900 font-medium">
                    Analisando estrutura da planilha e detectando colunas...
                  </span>
                </div>
              )}

              {parseError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Erro no processamento:</strong> {parseError}
                  </div>
                </div>
              )}

              {/* CARD DE ORIENTAÇÕES DE FORMATO */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3.5 text-xs text-gray-600 space-y-1.5">
                <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#005B2E]" />
                  Reconhecimento Automático e Tolerante:
                </div>
                <ul className="list-disc pl-5 space-y-1 text-[11px]">
                  <li>
                    O parser localiza automaticamente as colunas pelo cabeçalho (ex:{' '}
                    <code>Produto</code>, <code>CMV</code>, <code>Preço Rivoli</code>,{' '}
                    <code>Ordem</code>).
                  </li>
                  <li>
                    Valores em formato brasileiro (ex: <code>R$ 12,50</code> ou <code>12,50</code>)
                    são aceitos e convertidos com precisão.
                  </li>
                  <li>
                    Linhas de cabeçalhos institucionais, totalizadores e linhas em branco são
                    identificadas e separadas na prévia.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ETAPA 2: PRÉ-VISUALIZAÇÃO, MAPEAMENTO E ESCOLHA DE MODO */}
          {step === 'preview' && parseResult && previewData && (
            <div className="space-y-4">
              {/* STATUS DE LEITURA E RESUMO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border rounded-lg p-3 border-emerald-200 bg-emerald-50/40">
                  <div className="text-[11px] font-semibold text-emerald-900">
                    Arquivo Selecionado
                  </div>
                  <div
                    className="text-sm font-bold text-gray-900 truncate mt-0.5"
                    title={selectedFile?.name}
                  >
                    {selectedFile?.name}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Total: {parseResult.totalLinhasLidas} linha(s) lidas
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-3 border-gray-200">
                  <div className="text-[11px] font-semibold text-gray-600">
                    Reconhecidos p/ Gravação
                  </div>
                  <div className="text-xl font-bold text-[#005B2E] mt-0.5">
                    {previewData.itensValidos.length}{' '}
                    <span className="text-xs font-normal text-gray-500">produtos</span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Prontos para entrar na engine
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-3 border-amber-200 bg-amber-50/40">
                  <div className="text-[11px] font-semibold text-amber-900">Linhas Ignoradas</div>
                  <div className="text-xl font-bold text-amber-700 mt-0.5">
                    {previewData.itensIgnorados.length}{' '}
                    <span className="text-xs font-normal text-gray-500">linhas</span>
                  </div>
                  <div className="text-[10px] text-amber-800 mt-0.5">Totalizadores ou vazias</div>
                </div>
              </div>

              {/* BLOCO DE MAPEAMENTO DE COLUNAS COM DETECÇÃO AUTOMÁTICA */}
              <div className="bg-white rounded-lg border border-gray-200 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#005B2E]" />
                    <span className="text-xs font-bold text-gray-900">
                      Mapeamento de Colunas Detectadas
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    Ajuste manualmente caso a detecção automática tenha errado:
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
                  {/* PRODUTO */}
                  <div>
                    <Label className="text-[11px] font-semibold flex items-center gap-1">
                      Coluna Produto <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={String(customMapping.colProduto)}
                      onValueChange={(v) =>
                        setCustomMapping((prev) => ({ ...prev, colProduto: parseInt(v, 10) }))
                      }
                    >
                      <SelectTrigger className="h-7 text-xs mt-1">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {parseResult.headers.map((h, i) => (
                          <SelectItem key={i} value={String(i)} className="text-xs">
                            Col {i + 1}: {h || `(Coluna ${i + 1})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* CMV */}
                  <div>
                    <Label className="text-[11px] font-semibold flex items-center gap-1">
                      Coluna CMV (Custo)
                    </Label>
                    <Select
                      value={String(customMapping.colCmv)}
                      onValueChange={(v) =>
                        setCustomMapping((prev) => ({ ...prev, colCmv: parseInt(v, 10) }))
                      }
                    >
                      <SelectTrigger className="h-7 text-xs mt-1">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1" className="text-xs text-gray-400">
                          (Nenhuma / Valor 0,00)
                        </SelectItem>
                        {parseResult.headers.map((h, i) => (
                          <SelectItem key={i} value={String(i)} className="text-xs">
                            Col {i + 1}: {h || `(Coluna ${i + 1})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* PREÇO RIVOLI */}
                  <div>
                    <Label className="text-[11px] font-semibold flex items-center gap-1">
                      Coluna Preço Rivoli
                    </Label>
                    <Select
                      value={String(customMapping.colPrecoRivoli)}
                      onValueChange={(v) =>
                        setCustomMapping((prev) => ({ ...prev, colPrecoRivoli: parseInt(v, 10) }))
                      }
                    >
                      <SelectTrigger className="h-7 text-xs mt-1">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1" className="text-xs text-gray-400">
                          (Nenhuma / Valor 0,00)
                        </SelectItem>
                        {parseResult.headers.map((h, i) => (
                          <SelectItem key={i} value={String(i)} className="text-xs">
                            Col {i + 1}: {h || `(Coluna ${i + 1})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ORDEM */}
                  <div>
                    <Label className="text-[11px] font-semibold flex items-center gap-1">
                      Coluna Ordem (Opcional)
                    </Label>
                    <Select
                      value={String(customMapping.colOrdem)}
                      onValueChange={(v) =>
                        setCustomMapping((prev) => ({ ...prev, colOrdem: parseInt(v, 10) }))
                      }
                    >
                      <SelectTrigger className="h-7 text-xs mt-1">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1" className="text-xs text-gray-400">
                          (Automático 1..N)
                        </SelectItem>
                        {parseResult.headers.map((h, i) => (
                          <SelectItem key={i} value={String(i)} className="text-xs">
                            Col {i + 1}: {h || `(Coluna ${i + 1})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* OPÇÃO DE SUBSTITUIR VS ADICIONAR */}
              <div className="bg-amber-50/50 border border-amber-200/80 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-700" />
                    Destino no Banco de Dados (Coleção margens_comparativo_gr)
                  </span>
                  <Badge variant="outline" className="text-[10px] text-amber-800 border-amber-300">
                    Base atual: {existingRecordsCount} produto(s)
                  </Badge>
                </div>

                <RadioGroup
                  value={importMode}
                  onValueChange={(v) => setImportMode(v as 'replace' | 'append')}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1"
                >
                  <label
                    htmlFor="mode-replace"
                    className={`flex items-start gap-2.5 p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                      importMode === 'replace'
                        ? 'bg-white border-[#005B2E] shadow-xs'
                        : 'bg-white/60 border-gray-200 hover:bg-white'
                    }`}
                  >
                    <RadioGroupItem value="replace" id="mode-replace" className="mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900">
                        Substituir todos os registros existentes (Padrão)
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Limpa os registros anteriores e grava exclusivamente os itens desta
                        planilha. Recomendado para atualização integral da tabela.
                      </div>
                    </div>
                  </label>

                  <label
                    htmlFor="mode-append"
                    className={`flex items-start gap-2.5 p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                      importMode === 'append'
                        ? 'bg-white border-[#005B2E] shadow-xs'
                        : 'bg-white/60 border-gray-200 hover:bg-white'
                    }`}
                  >
                    <RadioGroupItem value="append" id="mode-append" className="mt-0.5" />
                    <div>
                      <div className="font-bold text-gray-900">Adicionar aos existentes</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Mantém os {existingRecordsCount} registros existentes e adiciona os novos
                        produtos ao final.
                      </div>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* TABELA DE PRÉ-VISUALIZAÇÃO */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">Prévia dos Dados:</span>
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded p-0.5">
                      <button
                        type="button"
                        onClick={() => setPreviewFilter('validas')}
                        className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                          previewFilter === 'validas'
                            ? 'bg-[#005B2E] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Válidos ({previewData.itensValidos.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewFilter('ignoradas')}
                        className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                          previewFilter === 'ignoradas'
                            ? 'bg-amber-600 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Ignorados ({previewData.itensIgnorados.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewFilter('todas')}
                        className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                          previewFilter === 'todas'
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Todas ({previewData.todasLinhas.length})
                      </button>
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-500">
                    Mostrando {Math.min(itensExibidos.length, 50)} de {itensExibidos.length} linhas
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-[#01361D] text-white uppercase text-[10px] sticky top-0 z-10">
                      <tr>
                        <th className="py-2 px-2.5 w-14 text-center">Linha</th>
                        <th className="py-2 px-2.5">Status</th>
                        <th className="py-2 px-3">Produto</th>
                        <th className="py-2 px-3 text-right">CMV</th>
                        <th className="py-2 px-3 text-right">Preço Rivoli</th>
                        <th className="py-2 px-3">Observação / Motivo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-[11px]">
                      {itensExibidos.slice(0, 50).map((it, idx) => {
                        return (
                          <tr
                            key={idx}
                            className={
                              it.valido
                                ? 'hover:bg-gray-50/80'
                                : 'bg-amber-50/50 hover:bg-amber-100/40 text-gray-500'
                            }
                          >
                            <td className="py-1.5 px-2.5 text-center font-mono text-gray-400">
                              #{it.linhaOriginal}
                            </td>
                            <td className="py-1.5 px-2.5">
                              {it.valido ? (
                                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] h-5 px-1.5">
                                  Válido
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-amber-700 border-amber-400 bg-amber-50 text-[9px] h-5 px-1.5"
                                >
                                  Ignorado
                                </Badge>
                              )}
                            </td>
                            <td className="py-1.5 px-3 font-medium text-gray-900 truncate max-w-[200px]">
                              {it.produto || <span className="text-gray-400 italic">(vazio)</span>}
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono">
                              {formatCurrencyBRL(it.cmv)}
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono font-semibold text-gray-900">
                              {formatCurrencyBRL(it.preco_rivoli)}
                            </td>
                            <td className="py-1.5 px-3 text-[10px] text-gray-500 truncate max-w-[180px]">
                              {it.valido ? 'Pronto p/ gravar' : it.motivoIgnorado || 'Descartado'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 3: GRAVANDO EM LOTE COM BARRA DE PROGRESSO */}
          {step === 'importing' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-[#005B2E] flex items-center justify-center mx-auto animate-pulse">
                <RefreshCw className="w-7 h-7 text-[#005B2E] animate-spin" />
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900">Gravando no Skip Cloud...</h4>
                <p className="text-xs text-gray-500 mt-1">{currentProgressText}</p>
              </div>

              <div className="max-w-md mx-auto space-y-1">
                <Progress value={progressPercent} className="h-2.5 bg-gray-100" />
                <div className="text-[11px] font-mono text-gray-500 text-right">
                  {progressPercent}%
                </div>
              </div>

              <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                Inserindo registros diretamente na coleção <code>margens_comparativo_gr</code>.
                Aguarde...
              </p>
            </div>
          )}

          {/* ETAPA 4: RELATÓRIO FINAL */}
          {step === 'summary' && finalReport && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#005B2E] flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-bold text-gray-900">
                  Importação Concluída com Sucesso!
                </h4>
                <p className="text-xs text-gray-500">
                  Os dados foram salvos no Skip Cloud e a tabela já foi recalculada pela engine.
                </p>
              </div>

              {/* CARDS DE RESUMO DO RELATÓRIO */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                  <div className="text-[11px] font-semibold text-emerald-800">Itens Gravados</div>
                  <div className="text-2xl font-black text-[#005B2E] mt-0.5">
                    {finalReport.importados}
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">Na coleção</div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <div className="text-[11px] font-semibold text-amber-800">Linhas Ignoradas</div>
                  <div className="text-2xl font-black text-amber-700 mt-0.5">
                    {finalReport.ignorados}
                  </div>
                  <div className="text-[10px] text-amber-700 mt-0.5">Totalizadores / vazias</div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-[11px] font-semibold text-gray-600">Erros por Linha</div>
                  <div
                    className={`text-2xl font-black mt-0.5 ${
                      finalReport.erros.length > 0 ? 'text-red-600' : 'text-gray-900'
                    }`}
                  >
                    {finalReport.erros.length}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {finalReport.erros.length > 0 ? 'Requer atenção' : 'Nenhuma falha'}
                  </div>
                </div>
              </div>

              {/* LISTA DE ERROS SE HOUVER */}
              {finalReport.erros.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs space-y-1.5">
                  <div className="font-bold text-red-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Erros durante a gravação:
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] text-red-800 font-mono">
                    {finalReport.erros.map((e, idx) => (
                      <div key={idx}>
                        • Linha {e.linha}: {e.produto} — {e.erro}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#F4FBF7] border border-[#005B2E]/20 rounded-lg p-3 text-xs text-[#005B2E] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  A tela principal está atualizada com os novos produtos e as margens Gran Romano já
                  foram recalculadas.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ COM BOTÕES DE AÇÃO */}
        <DialogFooter className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
          <div>
            {step === 'preview' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('upload')}
                className="text-xs h-8 text-gray-600"
              >
                Voltar / Trocar Arquivo
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step !== 'importing' && step !== 'summary' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleClose(false)}
                className="text-xs h-8"
              >
                Cancelar
              </Button>
            )}

            {step === 'preview' && (
              <Button
                size="sm"
                onClick={handleConfirmImport}
                disabled={!previewData || previewData.itensValidos.length === 0}
                className="text-xs h-8 bg-[#005B2E] hover:bg-[#004724] text-white shadow-xs font-semibold"
              >
                Confirmar e Gravar ({previewData?.itensValidos.length ?? 0} Itens)
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}

            {step === 'summary' && (
              <Button
                size="sm"
                onClick={() => handleClose(false)}
                className="text-xs h-8 bg-[#005B2E] hover:bg-[#004724] text-white shadow-xs"
              >
                Fechar e Ver Comparativo
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
