import { useState, useRef, useMemo } from 'react'
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Layers,
  Check,
  Eye,
  Columns,
  Table,
  Filter,
  Info,
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import type { SheetData, WorkbookData } from '@/types/spreadsheet'
import {
  extractFullWorkbookFromXlsxBuffer,
  type ExtractedWorkbook,
  type ExtractedSheetInfo,
} from '@/lib/spreadsheet-file-utils'
import {
  analyzeSheetStructure,
  type SheetStructureAnalysis,
  type RowKind,
} from '@/lib/tabela-mae-structure-parser'
import { saveWorkbook } from '@/services/spreadsheet-storage'
import { useAuth } from '@/hooks/use-auth'
import { colIndexToLetter } from '@/lib/spreadsheet-formula-engine'

interface ImportTabelaMaeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentWorkbook: WorkbookData
  currentVersion: number
  onImportSuccess: (newWorkbook: WorkbookData, newVersion: number) => Promise<void> | void
}

type ImportStep = 'upload' | 'sheets_and_preview' | 'importing' | 'summary'

export function ImportTabelaMaeDialog({
  open,
  onOpenChange,
  currentWorkbook,
  currentVersion,
  onImportSuccess,
}: ImportTabelaMaeDialogProps) {
  const { toast } = useToast()
  const { currentUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Etapa do fluxo
  const [step, setStep] = useState<ImportStep>('upload')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  // Workbook extraído do XLSX
  const [extractedWb, setExtractedWb] = useState<ExtractedWorkbook | null>(null)

  // Seleção de abas (marcar/desmarcar)
  const [selectedSheetNames, setSelectedSheetNames] = useState<Set<string>>(new Set())

  // Análise estrutural por aba { [sheetName]: SheetStructureAnalysis }
  const [sheetAnalyses, setSheetAnalyses] = useState<Record<string, SheetStructureAnalysis>>({})

  // Aba atualmente selecionada para prévia
  const [activePreviewSheet, setActivePreviewSheet] = useState<string>('')

  // Modo de gravação: 'replace' (substituir workbook inteiro - padrão) ou 'append' (adicionar abas)
  const [saveMode, setSaveMode] = useState<'replace' | 'append'>('replace')

  // Filtro de linhas na pré-visualização da aba ativa
  const [previewFilter, setPreviewFilter] = useState<'todas' | 'dados' | 'secoes' | 'ignoradas'>(
    'todas',
  )

  // Progresso de importação
  const [progressPercent, setProgressPercent] = useState(0)
  const [currentProgressText, setCurrentProgressText] = useState('')

  // Relatório de importação final
  const [finalReport, setFinalReport] = useState<{
    totalSheets: number
    totalRows: number
    totalSections: number
    totalFormulas: number
    unsupportedFormulas: string[]
    newVersion: number
  } | null>(null)

  // Reset ao fechar
  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => {
        setStep('upload')
        setSelectedFile(null)
        setParsing(false)
        setParseError(null)
        setExtractedWb(null)
        setSelectedSheetNames(new Set())
        setSheetAnalyses({})
        setActivePreviewSheet('')
        setProgressPercent(0)
        setFinalReport(null)
      }, 200)
    }
    onOpenChange(newOpen)
  }

  // Processa o arquivo Excel
  const handleFileSelected = async (file: File) => {
    setSelectedFile(file)
    setParsing(true)
    setParseError(null)

    try {
      const buffer = await file.arrayBuffer()
      const extracted = await extractFullWorkbookFromXlsxBuffer(buffer)

      if (extracted.sheets.length === 0) {
        throw new Error('Nenhuma aba válida encontrada no arquivo Excel.')
      }

      setExtractedWb(extracted)

      // Por padrão seleciona todas as abas detectadas
      const allNames = new Set(extracted.sheets.map((s) => s.name))
      setSelectedSheetNames(allNames)

      // Analisa estrutura de todas as abas
      const analyses: Record<string, SheetStructureAnalysis> = {}
      for (const sheet of extracted.sheets) {
        analyses[sheet.name] = analyzeSheetStructure(sheet)
      }
      setSheetAnalyses(analyses)

      // Ativa a primeira aba para pré-visualização
      setActivePreviewSheet(extracted.sheets[0].name)

      setStep('sheets_and_preview')
    } catch (err) {
      console.error('Erro ao processar XLSX:', err)
      const msg = err instanceof Error ? err.message : 'Falha ao processar arquivo Excel.'
      setParseError(msg)
      toast({
        title: 'Erro ao ler arquivo',
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
          description: 'Envie um arquivo Excel (.xlsx ou .xls).',
          variant: 'destructive',
        })
      }
    }
  }

  // Toggle de seleção de aba
  const handleToggleSheet = (sheetName: string) => {
    setSelectedSheetNames((prev) => {
      const next = new Set(prev)
      if (next.has(sheetName)) {
        if (next.size <= 1) {
          toast({
            title: 'Ao menos uma aba',
            description: 'Você precisa manter pelo menos uma aba selecionada para importar.',
            variant: 'destructive',
          })
          return prev
        }
        next.delete(sheetName)
      } else {
        next.add(sheetName)
      }
      return next
    })
  }

  // Marcar/Desmarcar todas
  const handleSelectAllSheets = (select: boolean) => {
    if (!extractedWb) return
    if (select) {
      setSelectedSheetNames(new Set(extractedWb.sheets.map((s) => s.name)))
    } else {
      // Deixa a primeira selecionada
      setSelectedSheetNames(new Set([extractedWb.sheets[0].name]))
    }
  }

  // Toggle inclusão de coluna na aba ativa
  const handleToggleColumnInActiveSheet = (colIndex: number) => {
    if (!activePreviewSheet || !sheetAnalyses[activePreviewSheet]) return
    setSheetAnalyses((prev) => {
      const current = prev[activePreviewSheet]
      const updatedCols = current.columns.map((c) =>
        c.colIndex === colIndex ? { ...c, included: !c.included } : c,
      )

      // Reconstrói previewSheetData com as novas colunas
      const updatedAnalysis: SheetStructureAnalysis = {
        ...current,
        columns: updatedCols,
        activeColumnsCount: updatedCols.filter((c) => c.included).length,
      }

      return { ...prev, [activePreviewSheet]: updatedAnalysis }
    })
  }

  // Análise da aba atualmente selecionada para prévia
  const currentAnalysis = activePreviewSheet ? sheetAnalyses[activePreviewSheet] : null

  // Linhas filtradas para exibição na tabela da prévia
  const displayedRows = useMemo(() => {
    if (!currentAnalysis) return []
    if (previewFilter === 'dados') return currentAnalysis.rows.filter((r) => r.kind === 'data')
    if (previewFilter === 'secoes') return currentAnalysis.rows.filter((r) => r.kind === 'section')
    if (previewFilter === 'ignoradas')
      return currentAnalysis.rows.filter((r) => r.kind === 'empty' || r.kind === 'title')
    return currentAnalysis.rows
  }, [currentAnalysis, previewFilter])

  // Totalizadores gerais de todas as abas selecionadas
  const totalsSummary = useMemo(() => {
    let totalUsefulRows = 0
    let totalSections = 0
    let totalFormulas = 0
    const unsupportedList: string[] = []

    for (const name of selectedSheetNames) {
      const a = sheetAnalyses[name]
      if (a) {
        totalUsefulRows += a.dataRowsCount
        totalSections += a.sectionRowsCount
        totalFormulas += a.formulaCount
        for (const u of a.unsupportedFormulas) {
          if (!unsupportedList.includes(u)) unsupportedList.push(u)
        }
      }
    }

    return {
      totalSheets: selectedSheetNames.size,
      totalUsefulRows,
      totalSections,
      totalFormulas,
      unsupportedList,
    }
  }, [selectedSheetNames, sheetAnalyses])

  // Executa a importação e gravação no PocketBase
  const handleConfirmImport = async () => {
    if (selectedSheetNames.size === 0 || !extractedWb) return

    setStep('importing')
    setProgressPercent(10)
    setCurrentProgressText('Construindo estrutura do workbook com abas selecionadas...')

    try {
      // 1. Gera as SheetData finais para as abas selecionadas
      const newSheets: SheetData[] = []
      let orderIndex = 0

      // Se for modo 'append', mantém as abas anteriores que não forem sobrescritas
      if (saveMode === 'append') {
        currentWorkbook.sheets.forEach((existingSheet) => {
          if (!selectedSheetNames.has(existingSheet.name)) {
            newSheets.push({ ...existingSheet, order: orderIndex++ })
          }
        })
      }

      const totalSelected = selectedSheetNames.size
      let processedCount = 0

      for (const sheetInfo of extractedWb.sheets) {
        if (!selectedSheetNames.has(sheetInfo.name)) continue

        processedCount++
        const perc = 10 + Math.round((processedCount / totalSelected) * 70)
        setProgressPercent(perc)
        setCurrentProgressText(
          `Processando aba "${sheetInfo.name}" (${processedCount}/${totalSelected})...`,
        )

        const analysis = sheetAnalyses[sheetInfo.name]
        const finalSheetData = analysis
          ? analysis.previewSheetData
          : {
              id: sheetInfo.sheetId,
              name: sheetInfo.name,
              cells: sheetInfo.cells,
              columns: Array.from({ length: Math.max(sheetInfo.maxCol + 3, 15) }, (_, i) => ({
                id: colIndexToLetter(i),
                width: i === 0 ? 240 : 130,
              })),
              rowsCount: Math.max(sheetInfo.maxRow + 10, 60),
              order: orderIndex,
            }

        newSheets.push({
          ...finalSheetData,
          order: orderIndex++,
        })
      }

      const newWorkbookData: WorkbookData = {
        sheets: newSheets,
        activeSheetIndex: 0,
      }

      setProgressPercent(85)
      setCurrentProgressText('Gravando snapshot versionado no banco de dados Jetro...')

      // 2. Salva via saveWorkbook com registro de versão
      const saveRes = await saveWorkbook({
        slug: 'tabela-mae-gr',
        titulo: 'Tabela Mãe GR',
        workbookData: newWorkbookData,
        expectedVersion: currentVersion,
        authorId: currentUser?.id,
        authorName: currentUser?.name || 'Administrador',
        authorEmail: currentUser?.email,
        changeSummary: `Importação Excel multi-aba (${selectedSheetNames.size} abas: ${Array.from(
          selectedSheetNames,
        ).join(', ')})`,
      })

      if (saveRes.conflictDetected) {
        throw new Error(
          `Conflito de versão detectado (versão do servidor #${saveRes.serverVersion}). Atualize e tente novamente.`,
        )
      }

      setProgressPercent(100)
      setCurrentProgressText('Finalizado com sucesso!')

      setFinalReport({
        totalSheets: selectedSheetNames.size,
        totalRows: totalsSummary.totalUsefulRows,
        totalSections: totalsSummary.totalSections,
        totalFormulas: totalsSummary.totalFormulas,
        unsupportedFormulas: totalsSummary.unsupportedList,
        newVersion: saveRes.record.version,
      })

      setStep('summary')

      // Notifica a página com o novo workbook e versão
      await onImportSuccess(newWorkbookData, saveRes.record.version)

      toast({
        title: 'Tabela Mãe importada com sucesso',
        description: `${selectedSheetNames.size} abas e ${totalsSummary.totalUsefulRows} linhas carregadas na grade.`,
      })
    } catch (err) {
      console.error('Erro na importação:', err)
      const msg = err instanceof Error ? err.message : 'Falha ao gravar planilha no banco.'
      setParseError(msg)
      setStep('sheets_and_preview')
      toast({
        title: 'Erro na importação',
        description: msg,
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden border-2 border-[#005B2E]/20">
        {/* CABEÇALHO */}
        <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-[#005B2E]/5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#005B2E] text-white flex items-center justify-center shrink-0 shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-gray-900 flex items-center gap-2">
                  Importador Multi-Aba — Tabela Mãe GR
                  <Badge className="bg-[#005B2E] text-white text-[10px]">Multi-Aba Excel</Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 mt-0.5">
                  Carregamento completo de planilhas complexas com detecção tolerante de cabeçalhos,
                  seções e fórmulas
                </DialogDescription>
              </div>
            </div>

            {selectedFile && (
              <Badge variant="outline" className="text-xs text-gray-700 font-mono">
                {selectedFile.name}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {/* CORPO DINÂMICO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* ETAPA 1: UPLOAD */}
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
                  accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(e.target.files[0])
                    }
                  }}
                />

                <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#005B2E] border border-emerald-200 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-8 h-8 text-[#005B2E]" />
                </div>

                <h4 className="text-sm font-bold text-gray-900">
                  Selecione ou arraste a planilha "TABELA MÃE" (.xlsx)
                </h4>
                <p className="text-xs text-gray-500 mt-1 max-w-md">
                  Suporta arquivos com até dezenas de abas (ex.: Consumo salmoura, INSUMOS, MP, CMV,
                  TABELA MÃE, TAB VAREJO, etc.)
                </p>

                <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-500">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    .xlsx
                  </Badge>
                  <span>
                    Reconhecimento de 1 a 3 linhas de cabeçalho • Preservação de seções • Fórmulas
                    ativas
                  </span>
                </div>
              </div>

              {parsing && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-[#005B2E] animate-spin" />
                  <span className="text-xs text-emerald-900 font-medium">
                    Descompactando OpenXML e inspecionando abas do workbook...
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

              {/* CARD DE DESTAQUES E SUPORTE */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-xs text-gray-600 space-y-2">
                <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#005B2E]" />
                  Recursos do Importador Multi-Aba:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <span className="font-bold text-gray-800">Seletor de Abas:</span>
                    <p className="text-gray-500 mt-0.5">
                      Importe todas as abas de uma só vez ou escolha apenas as necessárias.
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <span className="font-bold text-gray-800">Cabeçalhos Multinível:</span>
                    <p className="text-gray-500 mt-0.5">
                      Combina títulos agrupadores (ex: UNIDADES / CAIXA) com os campos reais.
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <span className="font-bold text-gray-800">Colunas Repetidas:</span>
                    <p className="text-gray-500 mt-0.5">
                      Detecta títulos estaduais repetidos em todas as linhas e desmarca por padrão.
                    </p>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <span className="font-bold text-gray-800">Blocos de Seção:</span>
                    <p className="text-gray-500 mt-0.5">
                      Preserva linhas separadoras de categoria (ex: VIDRO, SACHÊ, BALDE)
                      estilizadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ETAPA 2: SELETOR DE ABAS + PRÉVIA + CONFIGURAÇÃO */}
          {step === 'sheets_and_preview' && extractedWb && (
            <div className="space-y-4">
              {/* RESUMO SUPERIOR */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-2.5">
                  <div className="text-[10px] text-emerald-800 font-semibold uppercase">
                    Abas Selecionadas
                  </div>
                  <div className="text-lg font-bold text-[#005B2E]">
                    {selectedSheetNames.size}{' '}
                    <span className="text-xs font-normal text-gray-500">
                      / {extractedWb.sheets.length}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">
                    Linhas de Dados
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {totalsSummary.totalUsefulRows}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">
                    Seções Detectadas
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {totalsSummary.totalSections}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-2.5">
                  <div className="text-[10px] text-gray-500 font-semibold uppercase">
                    Fórmulas Ativas
                  </div>
                  <div className="text-lg font-bold text-[#005B2E]">
                    {totalsSummary.totalFormulas}
                  </div>
                </div>
              </div>

              {/* SELETOR DE ABAS COM CHECKBOXES */}
              <div className="bg-white border border-gray-200 rounded-lg p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#005B2E]" />
                    <span className="text-xs font-bold text-gray-900">
                      Selecione as Abas para Importar
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSelectAllSheets(true)}
                      className="text-[#005B2E] hover:underline font-semibold text-[11px]"
                    >
                      Selecionar Todas
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllSheets(false)}
                      className="text-gray-500 hover:underline text-[11px]"
                    >
                      Limpar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1">
                  {extractedWb.sheets.map((s) => {
                    const isChecked = selectedSheetNames.has(s.name)
                    const a = sheetAnalyses[s.name]
                    const isCurrent = activePreviewSheet === s.name

                    return (
                      <div
                        key={s.name}
                        onClick={() => setActivePreviewSheet(s.name)}
                        className={`p-2 rounded border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                          isCurrent
                            ? 'ring-2 ring-[#005B2E] border-[#005B2E] bg-emerald-50/40'
                            : isChecked
                              ? 'bg-white border-gray-300 hover:border-[#005B2E]'
                              : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <label
                            className="font-semibold text-gray-900 truncate text-[11px] cursor-pointer flex-1"
                            title={s.name}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {s.name}
                          </label>
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => handleToggleSheet(s.name)}
                            className="mt-0.5"
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1.5">
                          <span>{a?.dataRowsCount ?? s.totalNonEmptyRows} lin</span>
                          {a?.hasSections && (
                            <Badge
                              variant="outline"
                              className="text-[9px] px-1 py-0 h-4 border-amber-300 text-amber-700"
                            >
                              seções
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* MODO DE GRAVAÇÃO */}
              <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-3 space-y-2">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-amber-700" />
                  Destino do Workbook (Tabela Mãe GR)
                </span>

                <RadioGroup
                  value={saveMode}
                  onValueChange={(v) => setSaveMode(v as 'replace' | 'append')}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5"
                >
                  <label
                    htmlFor="save-replace"
                    className={`flex items-start gap-2 p-2 rounded border text-xs cursor-pointer transition-colors ${
                      saveMode === 'replace'
                        ? 'bg-white border-[#005B2E] shadow-2xs font-semibold'
                        : 'bg-white/60 border-gray-200'
                    }`}
                  >
                    <RadioGroupItem value="replace" id="save-replace" className="mt-0.5" />
                    <div>
                      <div className="text-gray-900">Substituir workbook inteiro (Padrão)</div>
                      <div className="text-[10px] text-gray-500 font-normal">
                        Cria o workbook novo exatamente com as {selectedSheetNames.size} abas
                        selecionadas.
                      </div>
                    </div>
                  </label>

                  <label
                    htmlFor="save-append"
                    className={`flex items-start gap-2 p-2 rounded border text-xs cursor-pointer transition-colors ${
                      saveMode === 'append'
                        ? 'bg-white border-[#005B2E] shadow-2xs font-semibold'
                        : 'bg-white/60 border-gray-200'
                    }`}
                  >
                    <RadioGroupItem value="save-append" id="save-append" className="mt-0.5" />
                    <div>
                      <div className="text-gray-900">Adicionar/mesclar abas</div>
                      <div className="text-[10px] text-gray-500 font-normal">
                        Mantém as abas existentes no banco e adiciona ou atualiza estas.
                      </div>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* PRÉ-VISUALIZAÇÃO DA ABA ATIVA */}
              {currentAnalysis && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col space-y-0">
                  {/* CABEÇALHO DA PRÉVIA */}
                  <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-[#005B2E]" />
                      <span className="font-bold text-gray-900">
                        Prévia da Aba:{' '}
                        <span className="text-[#005B2E]">"{currentAnalysis.sheetName}"</span>
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {currentAnalysis.dataRowsCount} linhas úteis
                      </Badge>
                      {currentAnalysis.hasSections && (
                        <Badge className="bg-amber-100 text-amber-800 text-[10px] hover:bg-amber-100">
                          {currentAnalysis.sectionRowsCount} seções preservadas
                        </Badge>
                      )}
                    </div>

                    {/* FILTROS DA TABELA */}
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded p-0.5">
                      <button
                        type="button"
                        onClick={() => setPreviewFilter('todas')}
                        className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                          previewFilter === 'todas'
                            ? 'bg-[#005B2E] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Todas ({currentAnalysis.rows.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewFilter('dados')}
                        className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                          previewFilter === 'dados'
                            ? 'bg-[#005B2E] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Dados ({currentAnalysis.dataRowsCount})
                      </button>
                      {currentAnalysis.hasSections && (
                        <button
                          type="button"
                          onClick={() => setPreviewFilter('secoes')}
                          className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                            previewFilter === 'secoes'
                              ? 'bg-amber-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Seções ({currentAnalysis.sectionRowsCount})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setPreviewFilter('ignoradas')}
                        className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                          previewFilter === 'ignoradas'
                            ? 'bg-gray-700 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        Ignoradas ({currentAnalysis.emptyRowsCount + currentAnalysis.titleRowsCount}
                        )
                      </button>
                    </div>
                  </div>

                  {/* AJUSTE DE COLUNAS DA ABA ATIVA */}
                  <div className="px-4 py-2 bg-gray-50/50 border-b border-gray-200 flex flex-wrap items-center gap-1.5 text-[11px] max-h-24 overflow-y-auto">
                    <span className="font-semibold text-gray-600 flex items-center gap-1">
                      <Columns className="w-3.5 h-3.5 text-[#005B2E]" /> Colunas:
                    </span>
                    {currentAnalysis.columns.map((c) => (
                      <button
                        key={c.colIndex}
                        type="button"
                        onClick={() => handleToggleColumnInActiveSheet(c.colIndex)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                          c.included
                            ? 'bg-emerald-50 text-[#005B2E] border-emerald-300 font-semibold'
                            : 'bg-gray-100 text-gray-400 border-gray-200 line-through'
                        }`}
                        title={`${c.originalHeader} (${c.detectedType}) — Clique para ${
                          c.included ? 'desmarcar' : 'incluir'
                        }`}
                      >
                        {c.letter}: {c.originalHeader.slice(0, 18)}
                        {c.isConstantTitle && ' [Repetido]'}
                      </button>
                    ))}
                  </div>

                  {/* AVISO DE FÓRMULAS NÃO SUPORTADAS SE HOUVER */}
                  {currentAnalysis.unsupportedFormulas.length > 0 && (
                    <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Fórmulas nativas não suportadas pela engine local:{' '}
                        <strong>{currentAnalysis.unsupportedFormulas.join(', ')}</strong>. As
                        células correspondentes serão sinalizadas com <code>#VALOR!</code>.
                      </span>
                    </div>
                  )}

                  {/* TABELA DE PRÉ-VISUALIZAÇÃO */}
                  <div className="max-h-56 overflow-auto">
                    <table className="w-full text-xs text-left border-collapse font-mono">
                      <thead className="bg-[#005B2E] text-white text-[10px] sticky top-0 z-10">
                        <tr>
                          <th className="py-1.5 px-2 w-12 text-center">#</th>
                          <th className="py-1.5 px-2 w-20">Tipo</th>
                          {currentAnalysis.columns
                            .filter((c) => c.included)
                            .slice(0, 10)
                            .map((c) => (
                              <th key={c.colIndex} className="py-1.5 px-2.5 truncate max-w-[140px]">
                                {c.originalHeader}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-[11px]">
                        {displayedRows.slice(0, 40).map((r, rIdx) => {
                          const isSection = r.kind === 'section'
                          const isHeader = r.kind === 'header'
                          const isIgnored = !r.isIncluded

                          return (
                            <tr
                              key={rIdx}
                              className={
                                isSection
                                  ? 'bg-[#E2F0D9] text-[#005B2E] font-bold'
                                  : isHeader
                                    ? 'bg-gray-100 text-gray-800 font-bold'
                                    : isIgnored
                                      ? 'bg-gray-50 text-gray-400 italic'
                                      : 'hover:bg-gray-50'
                              }
                            >
                              <td className="py-1 px-2 text-center text-[10px] text-gray-400">
                                {r.rowIndex}
                              </td>
                              <td className="py-1 px-2 text-[10px]">
                                {isSection ? (
                                  <Badge className="bg-[#005B2E] text-white text-[9px] px-1 py-0 h-4">
                                    Seção
                                  </Badge>
                                ) : isHeader ? (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                                    Cabeçalho
                                  </Badge>
                                ) : isIgnored ? (
                                  <Badge
                                    variant="outline"
                                    className="text-gray-400 text-[9px] px-1 py-0 h-4"
                                  >
                                    Ignorada
                                  </Badge>
                                ) : (
                                  <span className="text-gray-600">Dado</span>
                                )}
                              </td>

                              {/* Conteúdo das células */}
                              {isSection ? (
                                <td
                                  colSpan={currentAnalysis.columns.filter((c) => c.included).length}
                                  className="py-1 px-2.5 font-bold"
                                >
                                  {r.sectionTitle || r.rawRow[0]}
                                </td>
                              ) : (
                                currentAnalysis.columns
                                  .filter((c) => c.included)
                                  .slice(0, 10)
                                  .map((c) => {
                                    const val = r.rawRow[c.colIndex] || ''
                                    return (
                                      <td
                                        key={c.colIndex}
                                        className="py-1 px-2.5 truncate max-w-[140px]"
                                        title={val}
                                      >
                                        {val}
                                      </td>
                                    )
                                  })
                              )}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ETAPA 3: PROCESSANDO E GRAVANDO */}
          {step === 'importing' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-[#005B2E] flex items-center justify-center mx-auto animate-pulse">
                <RefreshCw className="w-8 h-8 text-[#005B2E] animate-spin" />
              </div>

              <div>
                <h4 className="text-base font-bold text-gray-900">Gravando Tabela Mãe GR...</h4>
                <p className="text-xs text-gray-500 mt-1">{currentProgressText}</p>
              </div>

              <div className="max-w-md mx-auto space-y-1">
                <Progress value={progressPercent} className="h-2.5 bg-gray-100" />
                <div className="text-[11px] font-mono text-gray-500 text-right">
                  {progressPercent}%
                </div>
              </div>
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
                  Importação Multi-Aba Concluída!
                </h4>
                <p className="text-xs text-gray-500">
                  O workbook da Tabela Mãe GR foi versionado (Versão #{finalReport.newVersion}) e
                  persistido com sucesso.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                  <div className="text-[11px] font-semibold text-emerald-800">Abas Importadas</div>
                  <div className="text-2xl font-black text-[#005B2E] mt-0.5">
                    {finalReport.totalSheets}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-[11px] font-semibold text-gray-600">Linhas de Dados</div>
                  <div className="text-2xl font-black text-gray-900 mt-0.5">
                    {finalReport.totalRows}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-[11px] font-semibold text-gray-600">Seções Estilizadas</div>
                  <div className="text-2xl font-black text-gray-900 mt-0.5">
                    {finalReport.totalSections}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-[11px] font-semibold text-gray-600">Fórmulas Ativas</div>
                  <div className="text-2xl font-black text-[#005B2E] mt-0.5">
                    {finalReport.totalFormulas}
                  </div>
                </div>
              </div>

              {finalReport.unsupportedFormulas.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Fórmulas marcadas com #VALOR! (Não suportadas na engine web):
                  </div>
                  <div className="text-[11px] font-mono">
                    {finalReport.unsupportedFormulas.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RODAPÉ */}
        <DialogFooter className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
          <div>
            {step === 'sheets_and_preview' && (
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

            {step === 'sheets_and_preview' && (
              <Button
                size="sm"
                onClick={handleConfirmImport}
                disabled={selectedSheetNames.size === 0}
                className="text-xs h-8 bg-[#005B2E] hover:bg-[#004724] text-white shadow-xs font-semibold"
              >
                Importar {selectedSheetNames.size} Abas ({totalsSummary.totalUsefulRows} Linhas)
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}

            {step === 'summary' && (
              <Button
                size="sm"
                onClick={() => handleClose(false)}
                className="text-xs h-8 bg-[#005B2E] hover:bg-[#004724] text-white shadow-xs"
              >
                Abrir Planilha
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
