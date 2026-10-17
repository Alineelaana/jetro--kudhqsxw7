import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  FileSpreadsheet,
  Download,
  Printer,
  RotateCcw,
  Save,
  Search,
  Sliders,
  TableProperties,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Database,
  RefreshCw,
  Plus,
  Trash2,
  ArrowUpDown,
  FileQuestion,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import {
  type MargemInputRow,
  type MargemParametros,
  PARAMETROS_DEFAULT,
  calcularTabelaMargens,
  formatCurrencyBRL,
  formatPercent,
  formatPercentDirect,
} from '@/lib/margens-gr-engine'
import {
  getMargensComparativo,
  getMargensParametros,
  buildParametrosMap,
  saveMultipleMargensItems,
  updateMargemParametro,
  createMargemItem,
  deleteMargemItem,
  type MargemParametroRecord,
} from '@/services/margens-comparativo'
import { exportMargensToExcel, exportMargensToPdf } from '@/lib/margens-gr-export'
import { downloadModeloExcel } from '@/lib/margens-gr-template'
import { ImportMargensDialog } from '@/components/margens-gr/ImportMargensDialog'
import { Upload, FileDown, LayoutGrid, Sheet } from 'lucide-react'
import { JetroSpreadsheet } from '@/components/spreadsheet/JetroSpreadsheet'
import { buildComparativoWorkbook } from '@/lib/comparativo-workbook-adapter'
import { getWorkbookBySlug, saveWorkbook } from '@/services/spreadsheet-storage'
import type { WorkbookData } from '@/types/spreadsheet'

export default function ComparativoMargensGrPage() {
  const { userRole } = useAuth()
  const { toast } = useToast()

  // Permissões RBAC Jetro: quem pode editar e salvar (SUP, COMERCIAL, FINANCEIRO)
  const canEdit = useMemo(() => {
    return ['SUP', 'COMERCIAL', 'FINANCEIRO'].includes(userRole || '')
  }, [userRole])

  // Estados de dados
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'comparativo' | 'parametros'>('comparativo')

  // Alternância de visão: Planilha Excel Interativa (Spreadsheet) vs Visão Analítica (Cards e Filtros)
  const [viewMode, setViewMode] = useState<'spreadsheet' | 'analitica'>('spreadsheet')

  // Banco / Estado salvo
  const [dbRows, setDbRows] = useState<MargemInputRow[]>([])
  const [dbParamRecords, setDbParamRecords] = useState<MargemParametroRecord[]>([])
  const [parametros, setParametros] = useState<MargemParametros>(PARAMETROS_DEFAULT)

  // Estado do Workbook serializado
  const [savedWorkbookData, setSavedWorkbookData] = useState<WorkbookData | null>(null)
  const [workbookVersion, setWorkbookVersion] = useState<number>(1)

  // Estado editável em memória (para cálculo inline reativo)
  const [editedRows, setEditedRows] = useState<MargemInputRow[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Filtros e busca
  const [searchTerm, setSearchTerm] = useState('')
  const [somenteNegativos, setSomenteNegativos] = useState(false)

  // Diálogo para adicionar novo SKU manualmente
  const [isNewSkuOpen, setIsNewSkuOpen] = useState(false)
  const [newSkuData, setNewSkuData] = useState({ produto: '', cmv: '', preco_rivoli: '' })

  // Diálogo de importação de Excel (.xlsx)
  const [isImportOpen, setIsImportOpen] = useState(false)

  // Diálogo de confirmação de exclusão
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // 1. Carregar dados do Skip Cloud e Snapshot do Workbook
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [compRecords, paramRecords, savedWb] = await Promise.all([
        getMargensComparativo(),
        getMargensParametros(),
        getWorkbookBySlug('comparativo-margens-gr'),
      ])

      const mappedRows: MargemInputRow[] = compRecords.map((r) => ({
        id: r.id,
        produto: r.produto,
        cmv: Number(r.cmv) || 0,
        preco_rivoli: Number(r.preco_rivoli) || 0,
        ativo: r.ativo,
        ordem: r.ordem,
      }))

      setDbRows(mappedRows)
      setEditedRows(mappedRows)
      setDbParamRecords(paramRecords)
      setParametros(buildParametrosMap(paramRecords))

      if (savedWb && savedWb.workbook_data) {
        setSavedWorkbookData(savedWb.workbook_data)
        setWorkbookVersion(savedWb.version)
      } else {
        const built = buildComparativoWorkbook(mappedRows, buildParametrosMap(paramRecords))
        setSavedWorkbookData(built)
      }

      setHasUnsavedChanges(false)
    } catch (err) {
      console.error('Erro ao carregar dados do comparativo de margens:', err)
      toast({
        title: 'Erro de comunicação com o banco',
        description: 'Não foi possível carregar as informações do comparativo.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 2. Engine de cálculo em tempo real
  const { linhasCalculadas, resumo } = useMemo(() => {
    return calcularTabelaMargens(editedRows, parametros)
  }, [editedRows, parametros])

  // Linhas filtradas para exibição na tabela
  const linhasFiltradas = useMemo(() => {
    return linhasCalculadas.filter((l) => {
      const matchSearch = l.produto.toLowerCase().includes(searchTerm.toLowerCase().trim())
      const matchNeg = somenteNegativos ? l.isMargemNegativa : true
      return matchSearch && matchNeg
    })
  }, [linhasCalculadas, searchTerm, somenteNegativos])

  // Manipulação de inputs de edição inline
  const handleInputChange = (id: string, field: 'cmv' | 'preco_rivoli', rawValue: string) => {
    const parsed = parseFloat(rawValue.replace(',', '.'))
    const validValue = Number.isNaN(parsed) ? 0 : parsed

    setEditedRows((prev) =>
      prev.map((row) => {
        if (row.id === id) {
          return { ...row, [field]: validValue }
        }
        return row
      }),
    )
    setHasUnsavedChanges(true)
  }

  // Restaurar dados originais (último estado salvo no banco)
  const handleRestore = () => {
    setEditedRows([...dbRows])
    setHasUnsavedChanges(false)
    toast({
      title: 'Valores restaurados',
      description: 'A visualização voltou ao último estado salvo no banco de dados.',
    })
  }

  // Salvar alterações no PocketBase
  const handleSave = async () => {
    if (!canEdit) {
      toast({
        title: 'Permissão insuficiente',
        description: 'Seu perfil de usuário não tem autorização para alterar estes dados.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const toUpdate = editedRows.map((r) => ({
        id: r.id,
        cmv: r.cmv,
        preco_rivoli: r.preco_rivoli,
      }))
      await saveMultipleMargensItems(toUpdate)
      setDbRows([...editedRows])
      setHasUnsavedChanges(false)
      toast({
        title: 'Alterações salvas com sucesso',
        description: 'Os valores de CMV e Preço Rivoli foram persistidos no banco.',
      })
    } catch (err) {
      console.error('Erro ao salvar alterações:', err)
      toast({
        title: 'Falha ao salvar',
        description: 'Ocorreu um erro ao persistir as alterações no Skip Cloud.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Atualizar alíquota de parâmetro
  const handleUpdateParametro = async (recordId: string, novaAliquotaStr: string) => {
    const val = parseFloat(novaAliquotaStr.replace(',', '.'))
    if (Number.isNaN(val) || val < 0) {
      toast({
        title: 'Valor inválido',
        description: 'Informe um percentual numérico positivo válido.',
        variant: 'destructive',
      })
      return
    }

    try {
      await updateMargemParametro(recordId, val)
      const updatedParams = await getMargensParametros()
      setDbParamRecords(updatedParams)
      setParametros(buildParametrosMap(updatedParams))
      toast({
        title: 'Parâmetro atualizado',
        description: 'As deduções de margens foram recalculadas instantaneamente.',
      })
    } catch (err) {
      console.error('Erro ao atualizar parâmetro:', err)
      toast({
        title: 'Erro ao salvar parâmetro',
        description: 'Não foi possível persistir a nova alíquota no banco.',
        variant: 'destructive',
      })
    }
  }

  // Criar novo SKU
  const handleCreateSku = async () => {
    if (!newSkuData.produto.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Informe a descrição/nome do produto.',
        variant: 'destructive',
      })
      return
    }

    const cmv = parseFloat(newSkuData.cmv.replace(',', '.')) || 0
    const preco_rivoli = parseFloat(newSkuData.preco_rivoli.replace(',', '.')) || 0

    try {
      await createMargemItem({
        produto: newSkuData.produto.trim(),
        cmv,
        preco_rivoli,
      })
      setIsNewSkuOpen(false)
      setNewSkuData({ produto: '', cmv: '', preco_rivoli: '' })
      await loadData()
      toast({
        title: 'SKU cadastrado',
        description: 'O produto foi adicionado à coleção de Comparativo de Margens.',
      })
    } catch (err) {
      console.error('Erro ao criar SKU:', err)
      toast({
        title: 'Erro ao cadastrar',
        description: 'Não foi possível cadastrar o SKU no banco.',
        variant: 'destructive',
      })
    }
  }

  // Deletar SKU
  const handleDeleteSku = async () => {
    if (!deleteTargetId) return
    try {
      await deleteMargemItem(deleteTargetId)
      setDeleteTargetId(null)
      await loadData()
      toast({
        title: 'Item removido',
        description: 'O produto foi removido da coleção.',
      })
    } catch (err) {
      console.error('Erro ao remover SKU:', err)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível remover o registro do banco.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50/50 overflow-hidden">
      {/* CABEÇALHO DO MÓDULO */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#005B2E]/10 text-[#005B2E] flex items-center justify-center shrink-0 border border-[#005B2E]/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#005B2E] uppercase tracking-wider">
                  Planilhas Convertidas
                </span>
                <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-300">
                  Gran Romano
                </Badge>
                {hasUnsavedChanges && (
                  <Badge className="bg-amber-500 text-white text-[10px] hover:bg-amber-600">
                    Alterações não salvas
                  </Badge>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Comparativo Margens GR
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Modelo nativo de margem final vendendo ao Preço Rivoli com deduções de tributos,
                comissão e frete
              </p>
            </div>
          </div>

          {/* BARRA DE AÇÕES SUPERIOR */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="text-xs h-8 text-gray-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRestore}
              disabled={!hasUnsavedChanges || loading}
              className="text-xs h-8 text-gray-700"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Restaurar
            </Button>

            {canEdit && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saving || loading}
                className="text-xs h-8 bg-[#005B2E] hover:bg-[#004724] text-white shadow-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            )}

            <div className="h-5 w-px bg-gray-200 mx-1" />

            {/* BOTÃO DE IMPORTAÇÃO DE EXCEL (RBAC: canEdit) */}
            {canEdit && (
              <Button
                size="sm"
                onClick={() => setIsImportOpen(true)}
                className="text-xs h-8 bg-[#005B2E] hover:bg-[#004724] text-white shadow-xs font-semibold"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Importar Excel
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadModeloExcel()}
              className="text-xs h-8 text-gray-700 hover:text-[#005B2E]"
              title="Baixar planilha de modelo com os cabeçalhos esperados para carga"
            >
              <FileDown className="w-3.5 h-3.5 mr-1.5 text-[#005B2E]" />
              Baixar Modelo
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => exportMargensToExcel(linhasCalculadas, resumo)}
              disabled={linhasCalculadas.length === 0}
              className="text-xs h-8 text-gray-700 hover:text-[#005B2E]"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Excel (.csv)
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => exportMargensToPdf(linhasCalculadas, resumo, parametros)}
              disabled={linhasCalculadas.length === 0}
              className="text-xs h-8 text-gray-700 hover:text-[#005B2E]"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              Imprimir / PDF
            </Button>
          </div>
        </div>

        {/* NAVEGAÇÃO DE VISÃO E ABAS */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <Button
                size="sm"
                variant={viewMode === 'spreadsheet' ? 'default' : 'ghost'}
                onClick={() => setViewMode('spreadsheet')}
                className={`text-xs h-7 px-3 gap-1.5 font-medium ${
                  viewMode === 'spreadsheet'
                    ? 'bg-[#005B2E] text-white hover:bg-[#004724] shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <Sheet className="w-3.5 h-3.5" />
                Planilha Excel Interativa
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'analitica' ? 'default' : 'ghost'}
                onClick={() => setViewMode('analitica')}
                className={`text-xs h-7 px-3 gap-1.5 font-medium ${
                  viewMode === 'analitica'
                    ? 'bg-[#005B2E] text-white hover:bg-[#004724] shadow-xs'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Visão Gerencial / Analítica
              </Button>
            </div>

            {viewMode === 'analitica' && (
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as 'comparativo' | 'parametros')}
                className="w-auto"
              >
                <TabsList className="h-8 bg-gray-100 p-0.5">
                  <TabsTrigger
                    value="comparativo"
                    className="text-xs h-7 px-3 data-[state=active]:bg-white data-[state=active]:text-[#005B2E] data-[state=active]:font-semibold"
                  >
                    <TableProperties className="w-3.5 h-3.5 mr-1.5" />
                    Comparativo ({linhasCalculadas.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="parametros"
                    className="text-xs h-7 px-3 data-[state=active]:bg-white data-[state=active]:text-[#005B2E] data-[state=active]:font-semibold"
                  >
                    <Sliders className="w-3.5 h-3.5 mr-1.5" />
                    Premissas & Parâmetros
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>

          {/* DICA DE ENGENHARIA DE CÁLCULO */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5 text-[#005B2E]" />
            <span>
              Fórmulas ativas na grade: ICMS (1,20%), PIS (1,45%), COFINS (6,68%), Comissão (3%) e
              Frete (3%) sobre Preço Rivoli.
            </span>
          </div>
        </div>
      </header>

      {/* MODO PLANILHA EXCEL INTERATIVA */}
      {viewMode === 'spreadsheet' && savedWorkbookData && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <JetroSpreadsheet
            slug="comparativo-margens-gr"
            title="Comparativo Margens GR"
            initialWorkbook={savedWorkbookData}
            canEdit={canEdit}
            canRestore={canEdit}
            onSave={async (wb) => {
              setSaving(true)
              try {
                const res = await saveWorkbook({
                  slug: 'comparativo-margens-gr',
                  titulo: 'Comparativo Margens GR',
                  workbookData: wb,
                  expectedVersion: workbookVersion,
                  changeSummary: 'Alterações manuais na grade Excel',
                })
                setSavedWorkbookData(wb)
                setWorkbookVersion(res.record.version)
                setHasUnsavedChanges(false)
                toast({
                  title: 'Planilha salva com sucesso',
                  description: `Versão #${res.record.version} persistida no banco do Jetro.`,
                })
              } catch (err) {
                console.error('Erro ao salvar planilha:', err)
                toast({
                  title: 'Erro ao salvar',
                  description: 'Não foi possível salvar o estado da planilha.',
                  variant: 'destructive',
                })
              } finally {
                setSaving(false)
              }
            }}
          />
        </div>
      )}

      {/* ÁREA DE CONTEÚDO PRINCIPAL (MODO ANALÍTICO) */}
      {viewMode === 'analitica' && (
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {' '}
          {activeTab === 'comparativo' && (
            <>
              {/* CARDS DE RESUMO (TOTALIZADORES) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CARD 1: TRIBUTOS */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Tributos Totais</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-xs">
                        ICMS ({formatPercentDirect(parametros.icmsPercentual)}) + PIS (
                        {formatPercentDirect(parametros.pisPercentual)}) + COFINS (
                        {formatPercentDirect(parametros.cofinsPercentual)}) ={' '}
                        {formatPercentDirect(resumo.totalTributosPercentual)} sobre o Preço Rivoli
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">
                    {formatPercentDirect(resumo.totalTributosPercentual)}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    ICMS 1,20% + PIS 1,45% + COFINS 6,68%
                  </p>
                  <div className="absolute top-0 right-0 h-1 w-full bg-[#005B2E]" />
                </div>

                {/* CARD 2: COMISSÃO + FRETE */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Comissão + Frete</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-xs">
                        Comissão ({formatPercentDirect(parametros.comissaoPercentual)}) + Frete (
                        {formatPercentDirect(parametros.fretePercentual)}) ={' '}
                        {formatPercentDirect(resumo.totalComissaoFretePercentual)} calculados sobre
                        o Preço Rivoli
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">
                    {formatPercentDirect(resumo.totalComissaoFretePercentual)}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Comissão 3,00% + Frete 3,00% s/ Rivoli
                  </p>
                  <div className="absolute top-0 right-0 h-1 w-full bg-[#C9A227]" />
                </div>

                {/* CARD 3: MARGEM MÉDIA FINAL */}
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                    <span>Margem Média Final</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-xs">
                        Média aritmética da margem percentual final de todos os SKUs após CMV +
                        tributos + comissão + frete
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div
                    className={`text-2xl font-bold mt-2 ${
                      resumo.margemMediaFinalPercentual < 0 ? 'text-red-600' : 'text-[#005B2E]'
                    }`}
                  >
                    {formatPercent(resumo.margemMediaFinalPercentual)}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    após CMV + tributos + comissão + frete
                  </p>
                  <div className="absolute top-0 right-0 h-1 w-full bg-[#005B2E]" />
                </div>

                {/* CARD 4: SKUS COM MARGEM NEGATIVA */}
                <div
                  className={`rounded-lg border p-4 shadow-xs relative overflow-hidden ${
                    resumo.skusNegativosCount > 0
                      ? 'bg-red-50/50 border-red-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                    <span>SKUs c/ Margem Negativa</span>
                    <AlertCircle
                      className={`w-3.5 h-3.5 ${
                        resumo.skusNegativosCount > 0 ? 'text-red-600' : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div
                    className={`text-2xl font-bold mt-2 ${
                      resumo.skusNegativosCount > 0 ? 'text-red-700' : 'text-emerald-700'
                    }`}
                  >
                    {resumo.skusNegativosCount}{' '}
                    <span className="text-sm font-normal text-gray-500">de {resumo.totalSkus}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {resumo.skusNegativosCount > 0
                      ? 'Exigem revisão urgente de preço ou custo'
                      : 'Todos os SKUs possuem margem positiva'}
                  </p>
                  <div
                    className={`absolute top-0 right-0 h-1 w-full ${
                      resumo.skusNegativosCount > 0 ? 'bg-red-600' : 'bg-emerald-500'
                    }`}
                  />
                </div>
              </div>

              {/* BARRA DE FILTROS E PESQUISA */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Filtrar por produto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs bg-gray-50/50"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                  <Button
                    variant={somenteNegativos ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setSomenteNegativos((prev) => !prev)}
                    className="text-xs h-8"
                  >
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                    {somenteNegativos
                      ? 'Exibindo apenas negativos'
                      : `Ver negativos (${resumo.skusNegativosCount})`}
                  </Button>

                  {canEdit && (
                    <Button
                      size="sm"
                      onClick={() => setIsNewSkuOpen(true)}
                      className="text-xs h-8 bg-gray-900 hover:bg-black text-white"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Novo SKU
                    </Button>
                  )}
                </div>
              </div>

              {/* TABELA DE COMPARATIVO */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden flex flex-col">
                {/* LEGENDA DE IDENTIFICAÇÃO VISUAL */}
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between text-[11px] text-gray-600 gap-2">
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-gray-700">Diferenciação visual:</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-amber-50 border border-amber-300" />
                      <span className="font-medium text-amber-900">
                        Entrada editável (CMV, Preço Rivoli)
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-gray-100 border border-gray-300" />
                      <span className="text-gray-600">
                        Calculado automaticamente (somente leitura)
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-red-100 border border-red-300" />
                      <span className="text-red-700 font-medium">Margem Negativa</span>
                    </span>
                  </div>

                  <div className="text-gray-500">
                    Total exibido: <strong>{linhasFiltradas.length}</strong> de{' '}
                    <strong>{linhasCalculadas.length}</strong> produtos
                  </div>
                </div>

                {/* ESTADO VAZIO ELEGANTE (QUANDO AINDA NÃO HÁ DADOS NO BANCO) */}
                {linhasCalculadas.length === 0 && !loading && (
                  <div className="p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-[#005B2E] flex items-center justify-center mb-4">
                      <Database className="w-8 h-8 text-[#005B2E]" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Nenhum produto cadastrado no banco de dados
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      A coleção <code>margens_comparativo_gr</code> no Skip Cloud está vazia.
                      Conforme as diretrizes da plataforma, os dados de produtos e custos devem ser
                      importados diretamente pelo painel administrativo do Skip Cloud (aba{' '}
                      <strong>Collections</strong> &gt; <strong>margens_comparativo_gr</strong> &gt;{' '}
                      <em>Import CSV/Excel</em>) ou cadastrados através do botão abaixo.
                    </p>
                    <div className="mt-6 flex items-center gap-3 flex-wrap justify-center">
                      {canEdit && (
                        <Button
                          size="sm"
                          onClick={() => setIsImportOpen(true)}
                          className="bg-[#005B2E] hover:bg-[#004724] text-white text-xs h-8 font-semibold shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                          Importar Planilha Excel (.xlsx)
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadModeloExcel()}
                        className="text-xs h-8 text-gray-700 hover:text-[#005B2E]"
                      >
                        <FileDown className="w-3.5 h-3.5 mr-1.5 text-[#005B2E]" />
                        Baixar Modelo (.xlsx)
                      </Button>
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsNewSkuOpen(true)}
                          className="text-xs h-8 text-gray-700"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          Cadastrar Manualmente
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* TABELA COM DADOS */}
                {linhasCalculadas.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#01361D] text-white uppercase text-[10px] tracking-wider sticky top-0 z-10 select-none">
                        <tr>
                          <th className="py-2.5 px-3 border-r border-[#002817] font-semibold w-64 min-w-[200px]">
                            Produto
                          </th>
                          <th
                            className="py-2.5 px-3 border-r border-[#002817] text-right font-semibold w-28 bg-[#004523]"
                            title="Campo editável: recalcula toda a linha"
                          >
                            CMV (R$) ✏️
                          </th>
                          <th
                            className="py-2.5 px-3 border-r border-[#002817] text-right font-semibold w-32 bg-[#004523]"
                            title="Campo editável: preço efetivo de venda Rivoli"
                          >
                            Preço Rivoli (R$) ✏️
                          </th>
                          <th
                            className="py-2.5 px-3 border-r border-[#002817] text-right font-semibold w-32"
                            title="Premissa: CMV + Tributos (ICMS + PIS + COFINS)"
                          >
                            Preço Mín. c/ Trib.
                          </th>
                          <th className="py-2.5 px-2.5 border-r border-[#002817] text-right font-semibold w-24">
                            ICMS ({formatPercentDirect(parametros.icmsPercentual)})
                          </th>
                          <th className="py-2.5 px-2.5 border-r border-[#002817] text-right font-semibold w-24">
                            PIS ({formatPercentDirect(parametros.pisPercentual)})
                          </th>
                          <th className="py-2.5 px-2.5 border-r border-[#002817] text-right font-semibold w-24">
                            COFINS ({formatPercentDirect(parametros.cofinsPercentual)})
                          </th>
                          <th className="py-2.5 px-2.5 border-r border-[#002817] text-right font-semibold w-24">
                            Comissão ({formatPercentDirect(parametros.comissaoPercentual)})
                          </th>
                          <th className="py-2.5 px-2.5 border-r border-[#002817] text-right font-semibold w-24">
                            Frete ({formatPercentDirect(parametros.fretePercentual)})
                          </th>
                          <th className="py-2.5 px-3 border-r border-[#002817] text-right font-semibold w-32 bg-[#002817]">
                            Margem Final R$
                          </th>
                          <th className="py-2.5 px-3 border-r border-[#002817] text-right font-semibold w-28 bg-[#002817]">
                            Margem Final %
                          </th>
                          {canEdit && (
                            <th className="py-2.5 px-2 text-center font-semibold w-12">Ações</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 font-mono text-[11px]">
                        {linhasFiltradas.map((row, idx) => {
                          const isNeg = row.isMargemNegativa
                          return (
                            <tr
                              key={row.id}
                              className={`transition-colors ${
                                isNeg
                                  ? 'bg-red-50/70 hover:bg-red-100/60'
                                  : idx % 2 === 0
                                    ? 'bg-white hover:bg-gray-50'
                                    : 'bg-gray-50/40 hover:bg-gray-100/60'
                              }`}
                            >
                              {/* NOME DO PRODUTO */}
                              <td className="py-2 px-3 text-gray-900 font-sans font-medium truncate max-w-[220px]">
                                {row.produto}
                              </td>

                              {/* CMV (EDITÁVEL) */}
                              <td className="py-1 px-2 text-right bg-amber-50/30">
                                <Input
                                  type="text"
                                  disabled={!canEdit}
                                  value={row.cmv.toString()}
                                  onChange={(e) => handleInputChange(row.id, 'cmv', e.target.value)}
                                  className="h-7 text-right font-mono text-xs px-2 bg-white border-amber-300 focus-visible:ring-amber-500"
                                />
                              </td>

                              {/* PREÇO RIVOLI (EDITÁVEL) */}
                              <td className="py-1 px-2 text-right bg-amber-50/30">
                                <Input
                                  type="text"
                                  disabled={!canEdit}
                                  value={row.preco_rivoli.toString()}
                                  onChange={(e) =>
                                    handleInputChange(row.id, 'preco_rivoli', e.target.value)
                                  }
                                  className="h-7 text-right font-mono text-xs px-2 bg-white border-amber-300 focus-visible:ring-amber-500 font-semibold text-gray-900"
                                />
                              </td>

                              {/* PREÇO MÍNIMO C/ TRIBUTOS */}
                              <td className="py-2 px-3 text-right text-gray-700 bg-gray-50/60">
                                {formatCurrencyBRL(row.precoMinimoComTributos)}
                              </td>

                              {/* ICMS */}
                              <td className="py-2 px-2.5 text-right text-gray-600">
                                {formatCurrencyBRL(row.icmsValor)}
                              </td>

                              {/* PIS */}
                              <td className="py-2 px-2.5 text-right text-gray-600">
                                {formatCurrencyBRL(row.pisValor)}
                              </td>

                              {/* COFINS */}
                              <td className="py-2 px-2.5 text-right text-gray-600">
                                {formatCurrencyBRL(row.cofinsValor)}
                              </td>

                              {/* COMISSÃO */}
                              <td className="py-2 px-2.5 text-right text-gray-600">
                                {formatCurrencyBRL(row.comissaoValor)}
                              </td>

                              {/* FRETE */}
                              <td className="py-2 px-2.5 text-right text-gray-600">
                                {formatCurrencyBRL(row.freteValor)}
                              </td>

                              {/* MARGEM FINAL R$ */}
                              <td
                                className={`py-2 px-3 text-right font-bold ${
                                  isNeg
                                    ? 'text-red-700 bg-red-100/50'
                                    : 'text-gray-900 bg-emerald-50/30'
                                }`}
                              >
                                {formatCurrencyBRL(row.margemFinalRs)}
                              </td>

                              {/* MARGEM FINAL % */}
                              <td
                                className={`py-2 px-3 text-right font-bold ${
                                  isNeg
                                    ? 'text-red-700 bg-red-100/50'
                                    : 'text-[#005B2E] bg-emerald-50/30'
                                }`}
                              >
                                {formatPercent(row.margemFinalPercentual)}
                              </td>

                              {/* AÇÕES */}
                              {canEdit && (
                                <td className="py-1 px-2 text-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteTargetId(row.id)}
                                    className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    title="Remover SKU"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </td>
                              )}
                            </tr>
                          )
                        })}
                      </tbody>
                      {/* LINHA DE RESUMO / TOTALIZADORES FIXA AO FINAL */}
                      <tfoot className="bg-gray-100 border-t-2 border-[#005B2E] text-[11px] font-semibold text-gray-900">
                        <tr>
                          <td className="py-2.5 px-3">Totais ({linhasFiltradas.length} itens)</td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {formatCurrencyBRL(resumo.somaCmv)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {formatCurrencyBRL(resumo.somaPrecoRivoli)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-gray-500">—</td>
                          <td className="py-2.5 px-2.5 text-right text-gray-500">—</td>
                          <td className="py-2.5 px-2.5 text-right text-gray-500">—</td>
                          <td className="py-2.5 px-2.5 text-right text-gray-500">—</td>
                          <td className="py-2.5 px-2.5 text-right text-gray-500">—</td>
                          <td className="py-2.5 px-2.5 text-right text-gray-500">—</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                            {formatCurrencyBRL(resumo.somaMargemFinalRs)}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-mono font-bold ${
                              resumo.margemMediaFinalPercentual < 0
                                ? 'text-red-700'
                                : 'text-[#005B2E]'
                            }`}
                          >
                            {formatPercent(resumo.margemMediaFinalPercentual)}
                          </td>
                          {canEdit && <td />}
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
          {/* ABA DE PREMISSAS & PARÂMETROS */}
          {activeTab === 'parametros' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-md bg-[#005B2E]/10 text-[#005B2E] flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      Premissas e Parâmetros de Dedução
                    </h3>
                    <p className="text-xs text-gray-500">
                      Alíquotas percentuais configuradas no banco de dados. Alterações são aplicadas
                      imediatamente aos cálculos da tela.
                    </p>
                  </div>
                </div>

                {/* TABELA DE PARÂMETROS */}
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Parâmetro</th>
                        <th className="py-2.5 px-3">Base de Cálculo</th>
                        <th className="py-2.5 px-3">Descrição / Nota Técnica</th>
                        <th className="py-2.5 px-3 text-right w-36">Alíquota (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dbParamRecords.map((param) => (
                        <tr key={param.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-3 font-semibold text-gray-900">{param.nome}</td>
                          <td className="py-3 px-3 text-gray-600">
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-emerald-50 text-[#005B2E] border-emerald-200"
                            >
                              Preço Rivoli
                            </Badge>
                          </td>
                          <td className="py-3 px-3 text-gray-500 text-[11px]">
                            {param.descricao || '—'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                disabled={!canEdit}
                                defaultValue={param.aliquota_percentual}
                                onBlur={(e) => handleUpdateParametro(param.id, e.target.value)}
                                className="w-20 h-7 text-right font-mono text-xs px-2"
                              />
                              <span className="text-gray-500 font-mono">%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* NOTA DOCUMENTAL COMPLETA */}
                <div className="mt-5 p-4 rounded-md bg-[#F4FBF7] border border-[#005B2E]/20 text-xs text-gray-700 space-y-2">
                  <div className="font-semibold text-[#005B2E] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#005B2E]" />
                    Regras de Negócio e Fórmula Oficial Extraída
                  </div>
                  <p className="leading-relaxed">
                    <strong>1. Deduções diretas sobre Preço Rivoli:</strong> Comissão (3%) e Frete
                    (3%) são calculados diretamente sobre o Preço Rivoli (preço efetivo de venda),
                    assim como ICMS (1,20%), PIS (1,45%) e COFINS (6,68%). Total de deduções sobre
                    Preço Rivoli:{' '}
                    <strong>{formatPercentDirect(resumo.totalDeducoesPercentual)}</strong>.
                  </p>
                  <p className="leading-relaxed">
                    <strong>2. Preço Mínimo Tributado:</strong> Considera estritamente{' '}
                    <code>CMV + ICMS + PIS + COFINS</code> (sem frete e sem comissão), conforme
                    premissa original da planilha modelo.
                  </p>
                  <p className="leading-relaxed">
                    <strong>3. Margem Final:</strong> Margem R$ ={' '}
                    <code>Preço Rivoli − CMV − Deduções Totais</code>. Margem % ={' '}
                    <code>Margem R$ ÷ Preço Rivoli</code>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* MODAL PARA NOVO SKU */}
      <Dialog open={isNewSkuOpen} onOpenChange={setIsNewSkuOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E] flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Novo Produto / SKU
            </DialogTitle>
            <DialogDescription className="text-xs">
              Cadastre um novo item para simulação na engine de margens Gran Romano.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Nome / Descrição do Produto</Label>
              <Input
                placeholder="Ex: Azeitona verde fatiada 160g"
                value={newSkuData.produto}
                onChange={(e) => setNewSkuData({ ...newSkuData, produto: e.target.value })}
                className="mt-1 h-8 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">CMV (R$)</Label>
                <Input
                  placeholder="0.00"
                  value={newSkuData.cmv}
                  onChange={(e) => setNewSkuData({ ...newSkuData, cmv: e.target.value })}
                  className="mt-1 h-8 text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Preço Rivoli (R$)</Label>
                <Input
                  placeholder="0.00"
                  value={newSkuData.preco_rivoli}
                  onChange={(e) => setNewSkuData({ ...newSkuData, preco_rivoli: e.target.value })}
                  className="mt-1 h-8 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewSkuOpen(false)}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleCreateSku}
              className="bg-[#005B2E] hover:bg-[#004724] text-white text-xs h-8"
            >
              Adicionar SKU
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <Dialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-700 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Excluir Produto
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tem certeza que deseja remover este produto da coleção do comparativo? Esta ação é
              irreversível.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTargetId(null)}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSku}
              className="text-xs h-8"
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DE IMPORTAÇÃO DE EXCEL (.xlsx / .csv) */}
      <ImportMargensDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportSuccess={loadData}
        existingRecordsCount={dbRows.length}
      />
    </div>
  )
}
