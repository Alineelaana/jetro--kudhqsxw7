import { useState, useEffect, useMemo, useRef } from 'react'
import {
  type CommissionMixItem,
  type CommissionMixFilter,
  type ImportPreviewItem,
  type ImportValidationResult,
  listCommissionMix,
  updateCommissionMixItem,
  executeBulkUpdate,
  getDistinctAttributes,
  downloadModeloComissaoMix,
  validateImportRows,
  applyImportBatch,
  exportCommissionMixExcel,
} from '@/services/comissao-mix'
import { parseExcelOrCsvFile } from '@/lib/margens-gr-parser'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { JetroTable } from '@/components/jetro-table'
import type { JetroColumnDef } from '@/components/jetro-table/types'
import { Checkbox } from '@/components/ui/checkbox'

// Shadcn UI primitives
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Textarea } from '@/components/ui/textarea'

// Icons
import {
  Star,
  Percent,
  Search,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  FileDown,
  Upload,
  Pencil,
  History,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  UserCheck,
  RotateCcw,
  SlidersHorizontal,
  Package,
} from 'lucide-react'

export default function ComissoesMixPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  // Permissão: SUP, FINANCEIRO ou COMERCIAL
  const userRole = (user as any)?.role || 'PADRAO'
  const canEdit = ['SUP', 'FINANCEIRO', 'COMERCIAL'].includes(userRole)

  // Estado dos Favoritos
  const [isFavorito, setIsFavorito] = useState(false)

  // Dados principais
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<CommissionMixItem[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Opções distintas de filtros
  const [filterOptions, setFilterOptions] = useState<{
    brands: string[]
    suppliers: string[]
    categories: string[]
    productLines: string[]
  }>({
    brands: [],
    suppliers: [],
    categories: [],
    productLines: [],
  })

  // Filtros aplicados
  const [filters, setFilters] = useState<CommissionMixFilter>({
    search: '',
    code: '',
    ean: '',
    description: '',
    brand: '',
    supplier: '',
    category: '',
    commission_type: 'all',
    status: 'all',
  })
  const [filtrosAvancadosAbertos, setFiltrosAvancadosAbertos] = useState(false)

  // Modal de Edição Individual
  const [editItem, setEditItem] = useState<CommissionMixItem | null>(null)
  const [editPerc, setEditPerc] = useState('')
  const [editVigencia, setEditVigencia] = useState('')
  const [editMotivo, setEditMotivo] = useState('')
  const [editStatus, setEditStatus] = useState<'Ativo' | 'Inativo'>('Ativo')
  const [salvandoIndividual, setSalvandoIndividual] = useState(false)

  // Modal de Histórico por Produto
  const [historyItem, setHistoryItem] = useState<CommissionMixItem | null>(null)

  // Modal de Edição em Massa
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkFilterType, setBulkFilterType] = useState<
    'brand' | 'supplier' | 'category' | 'product_line' | 'selected' | 'all_filtered'
  >('brand')
  const [bulkFilterValue, setBulkFilterValue] = useState('')
  const [bulkNewPerc, setBulkNewPerc] = useState('3.0')
  const [bulkVigencia, setBulkVigencia] = useState(new Date().toISOString().slice(0, 10))
  const [bulkMotivo, setBulkMotivo] = useState('Revisão periódica de mix')
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)

  // Modal de Importação Excel
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'applying' | 'done'>('upload')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [parsingImport, setParsingImport] = useState(false)
  const [importValidation, setImportValidation] = useState<ImportValidationResult | null>(null)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, percent: 0 })
  const [importResult, setImportResult] = useState<{
    successCount: number
    errorCount: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Carga inicial
  useEffect(() => {
    carregarDados()
    carregarOpcoesFiltro()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const data = await listCommissionMix(filters)
      setItems(data)
    } catch (err: any) {
      toast({
        title: 'Erro ao carregar Comissões MIX',
        description: err.message || 'Falha ao consultar banco de dados.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarOpcoesFiltro = async () => {
    try {
      const opts = await getDistinctAttributes()
      setFilterOptions(opts)
    } catch (e) {
      console.warn('Erro ao carregar opções distintas:', e)
    }
  }

  // Recarregar quando filtros mudarem
  const aplicarFiltros = () => {
    carregarDados()
  }

  const limparFiltros = () => {
    const defaultF: CommissionMixFilter = {
      search: '',
      code: '',
      ean: '',
      description: '',
      brand: '',
      supplier: '',
      category: '',
      commission_type: 'all',
      status: 'all',
    }
    setFilters(defaultF)
    listCommissionMix(defaultF).then(setItems)
    toast({
      title: 'Filtros limpos',
      description: 'Todos os filtros foram restaurados para o padrão.',
    })
  }

  // Quantidade de produtos afetados no cálculo da Edição em Massa
  const produtosAfetadosEmMassa = useMemo(() => {
    if (bulkFilterType === 'selected') {
      return items.filter((it) => selectedIds.includes(it.id))
    }
    if (bulkFilterType === 'all_filtered') {
      return items
    }
    if (bulkFilterType === 'brand' && bulkFilterValue) {
      return items.filter((it) => it.brand === bulkFilterValue)
    }
    if (bulkFilterType === 'supplier' && bulkFilterValue) {
      return items.filter((it) => it.supplier === bulkFilterValue)
    }
    if (bulkFilterType === 'category' && bulkFilterValue) {
      return items.filter((it) => it.category === bulkFilterValue)
    }
    if (bulkFilterType === 'product_line' && bulkFilterValue) {
      return items.filter((it) => it.product_line === bulkFilterValue)
    }
    return []
  }, [bulkFilterType, bulkFilterValue, items, selectedIds])

  // Ações de Edição Individual
  const abrirEdicaoIndividual = (item: CommissionMixItem) => {
    setEditItem(item)
    setEditPerc(String(item.commission_percentage ?? 0))
    setEditVigencia(item.vigencia_inicio || new Date().toISOString().slice(0, 10))
    setEditMotivo('Ajuste individual no ERP')
    setEditStatus(item.status || 'Ativo')
  }

  const salvarEdicaoIndividual = async () => {
    if (!editItem) return
    const percNum = parseFloat(editPerc)
    if (isNaN(percNum) || percNum < 0 || percNum > 100) {
      toast({
        title: 'Percentual inválido',
        description: 'Informe um percentual de comissão entre 0% e 100%.',
        variant: 'destructive',
      })
      return
    }

    setSalvandoIndividual(true)
    try {
      const updated = await updateCommissionMixItem({
        id: editItem.id,
        commission_percentage: percNum,
        vigencia_inicio: editVigencia,
        status: editStatus,
        motivo: editMotivo || 'Ajuste manual individual',
        tipo_alteracao: 'INDIVIDUAL',
      })

      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
      setEditItem(null)
      toast({
        title: 'Comissão atualizada com sucesso',
        description: `${updated.product_name}: ${percNum}% a partir de ${editVigencia}.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao salvar comissão',
        description: err.message || 'Falha ao atualizar registro.',
        variant: 'destructive',
      })
    } finally {
      setSalvandoIndividual(false)
    }
  }

  // Ações de Edição em Massa
  const confirmarEdicaoEmMassa = async () => {
    const percNum = parseFloat(bulkNewPerc)
    if (isNaN(percNum) || percNum < 0 || percNum > 100) {
      toast({
        title: 'Percentual inválido',
        description: 'Informe um percentual entre 0% e 100%.',
        variant: 'destructive',
      })
      return
    }

    setBulkSaving(true)
    try {
      let fType: 'ids' | 'brand' | 'supplier' | 'category' | 'product_line' | 'all' = 'brand'
      let fVal = bulkFilterValue
      let targetIds: string[] | undefined = undefined

      if (bulkFilterType === 'selected') {
        fType = 'ids'
        targetIds = selectedIds
      } else if (bulkFilterType === 'all_filtered') {
        fType = 'ids'
        targetIds = items.map((it) => it.id)
      } else {
        fType = bulkFilterType
        fVal = bulkFilterValue
      }

      const res = await executeBulkUpdate({
        filter_type: fType,
        filter_value: fVal,
        ids: targetIds,
        new_percentage: percNum,
        vigencia_inicio: bulkVigencia,
        motivo: bulkMotivo,
      })

      setBulkConfirmOpen(false)
      setBulkDialogOpen(false)
      await carregarDados()

      toast({
        title: 'Edição em massa concluída',
        description: res.message || `${res.total_afetados} produtos atualizados com sucesso.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro na edição em massa',
        description: err.message || 'Falha ao processar atualização em lote.',
        variant: 'destructive',
      })
    } finally {
      setBulkSaving(false)
    }
  }

  // Ações de Importação Excel
  const handleSelecionarArquivoImportacao = async (file: File) => {
    setImportFile(file)
    setParsingImport(true)
    try {
      const parsed = await parseExcelOrCsvFile(file)
      // Constrói matriz de linhas a partir das linhas lidas
      const rows: string[][] = [parsed.headers]
      for (const rowObj of parsed.todasLinhas) {
        // Tenta mapear os campos lidos
        rows.push([
          rowObj.produto, // Coluna 0 (pode conter código ou nome)
          '',
          rowObj.produto,
          String(rowObj.cmv || rowObj.preco_rivoli || ''),
        ])
      }

      // Se parsed.todasLinhas não veio com estrutura direta de colunas completas,
      // faremos um fallback mais direto com o leitor da planilha
      const validation = await validateImportRows(
        parsed.headers.length > 0 ? [parsed.headers, ...rows.slice(1)] : rows,
        items,
      )
      setImportValidation(validation)
      setImportStep('preview')
    } catch (err: any) {
      toast({
        title: 'Falha ao ler arquivo',
        description: err.message || 'Não foi possível analisar a planilha.',
        variant: 'destructive',
      })
    } finally {
      setParsingImport(false)
    }
  }

  const handleConfirmarImportacao = async () => {
    if (!importValidation || importValidation.validos.length === 0) return

    setImportStep('applying')
    setImportProgress({ current: 0, total: importValidation.validos.length, percent: 0 })

    try {
      const res = await applyImportBatch(importValidation.validos, (curr, tot) => {
        setImportProgress({
          current: curr,
          total: tot,
          percent: Math.round((curr / tot) * 100),
        })
      })

      setImportResult(res)
      setImportStep('done')
      await carregarDados()

      toast({
        title: 'Importação finalizada',
        description: `${res.successCount} produto(s) atualizados com sucesso no catálogo de comissões MIX.`,
      })
    } catch (err: any) {
      toast({
        title: 'Erro ao aplicar importação',
        description: err.message || 'Falha ao gravar alterações no banco.',
        variant: 'destructive',
      })
    }
  }

  // Exportação Excel
  const handleExportarExcel = () => {
    exportCommissionMixExcel(
      items,
      `comissoes_mix_jetro_${new Date().toISOString().slice(0, 10)}.xlsx`,
    )
    toast({
      title: 'Planilha exportada com sucesso',
      description: `${items.length} produto(s) exportados no formato Excel compatível com reimportação.`,
    })
  }

  // Exportação PDF
  const handleExportarPdf = () => {
    window.print()
  }

  // Definição das colunas da JetroTable
  const columns: JetroColumnDef<CommissionMixItem>[] = useMemo(
    () => [
      {
        id: 'select',
        header: '',
        defaultWidth: 46,
        minWidth: 46,
        maxWidth: 46,
        sortable: false,
        hideable: false,
        resizable: false,
        draggable: false,
        align: 'center',
        cell: ({ row }) => {
          const isSelected = selectedIds.includes(row.id)
          return (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => {
                  setSelectedIds((prev) =>
                    checked ? [...prev, row.id] : prev.filter((id) => id !== row.id),
                  )
                }}
                aria-label={`Selecionar item ${row.product_code}`}
              />
            </div>
          )
        },
      },
      {
        id: 'product_ean',
        header: 'EAN',
        accessorKey: 'product_ean',
        dataType: 'text',
        defaultWidth: 140,
        cell: ({ value }) => (
          <span className="font-mono text-xs text-muted-foreground">{String(value || '—')}</span>
        ),
      },
      {
        id: 'product_code',
        header: 'Código do Produto',
        accessorKey: 'product_code',
        dataType: 'text',
        defaultWidth: 150,
        cell: ({ value }) => (
          <span className="font-mono text-xs font-bold text-[#002817] dark:text-[#E4C46A]">
            {String(value || '')}
          </span>
        ),
      },
      {
        id: 'product_name',
        header: 'Descrição do Produto',
        accessorKey: 'product_name',
        dataType: 'text',
        defaultWidth: 280,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground truncate" title={row.product_name}>
              {row.product_name}
            </span>
            {(row.brand || row.category) && (
              <span className="text-[11px] text-muted-foreground">
                {[row.brand, row.category].filter(Boolean).join(' • ')}
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'brand',
        header: 'Marca',
        accessorKey: 'brand',
        dataType: 'text',
        defaultWidth: 130,
        cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
      },
      {
        id: 'supplier',
        header: 'Fornecedor',
        accessorKey: 'supplier',
        dataType: 'text',
        defaultWidth: 150,
        cell: ({ value }) => <span className="text-xs truncate">{String(value || '—')}</span>,
      },
      {
        id: 'price',
        header: 'Preço (R$)',
        accessorKey: 'price',
        dataType: 'currency',
        align: 'right',
        defaultWidth: 120,
        getSortValue: (row) => row.price || 0,
        cell: ({ value }) => (
          <span className="text-xs font-mono">
            {value ? `R$ ${Number(value).toFixed(2)}` : '—'}
          </span>
        ),
      },
      {
        id: 'commission_percentage',
        header: '% Comissão',
        accessorKey: 'commission_percentage',
        dataType: 'percent',
        align: 'right',
        defaultWidth: 140,
        getSortValue: (row) => row.commission_percentage || 0,
        cell: ({ row }) => {
          const perc = row.commission_percentage || 0
          const hasPerc = perc > 0
          return (
            <Badge
              variant="outline"
              className={`font-mono text-xs font-bold ${
                hasPerc
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'border-muted-foreground/30 text-muted-foreground'
              }`}
            >
              {perc.toFixed(2)}%
            </Badge>
          )
        },
      },
      {
        id: 'status',
        header: 'Situação',
        accessorKey: 'status',
        dataType: 'text',
        align: 'center',
        defaultWidth: 110,
        cell: ({ row }) => {
          const isAtivo = row.status === 'Ativo'
          return (
            <Badge
              variant="outline"
              className={`text-[11px] font-semibold ${
                isAtivo
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400'
                  : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/30 dark:text-red-400'
              }`}
            >
              {row.status}
            </Badge>
          )
        },
      },
      {
        id: 'vigencia_inicio',
        header: 'Início da Vigência',
        accessorKey: 'vigencia_inicio',
        dataType: 'date',
        defaultWidth: 140,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">
            {row.vigencia_inicio
              ? new Date(`${row.vigencia_inicio}T00:00:00`).toLocaleDateString('pt-BR')
              : '—'}
          </span>
        ),
      },
      {
        id: 'updated',
        header: 'Última Alteração',
        accessorKey: 'updated',
        dataType: 'date',
        defaultWidth: 180,
        cell: ({ row }) => (
          <div className="flex flex-col text-[11px] text-muted-foreground">
            <span className="truncate">{row.updated_by_user_name || 'Sistema'}</span>
            <span className="font-mono">
              {row.updated ? new Date(row.updated).toLocaleString('pt-BR') : '—'}
            </span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Ações',
        align: 'center',
        sortable: false,
        hideable: false,
        resizable: false,
        draggable: false,
        defaultWidth: 110,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => abrirEdicaoIndividual(row)}
                className="h-7 w-7 p-0 text-[#002817] hover:bg-[#002817]/10 dark:text-[#E4C46A]"
                title="Editar Percentual e Vigência"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHistoryItem(row)}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              title="Ver Histórico de Vigências e Alterações"
            >
              <History className="w-3.5 h-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [canEdit, selectedIds],
  )

  return (
    <div className="space-y-4 pb-16 print:p-0 print:space-y-4">
      {/* 1. CABEÇALHO COMPACTO JETRO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-xl p-4 sm:p-5 shadow-2xs print:border-none print:shadow-none">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#002817] text-[#C89B3C] flex items-center justify-center font-bold shadow-xs">
              <Percent className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#002817] dark:text-[#E4C46A]">
              Comissões MIX
            </h1>
            <button
              type="button"
              onClick={() => setIsFavorito(!isFavorito)}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-amber-500 transition-colors"
              title={isFavorito ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
            >
              <Star
                className={`w-5 h-5 ${
                  isFavorito ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'
                }`}
              />
            </button>

            <Badge
              variant="outline"
              className="font-bold text-xs border-[#002817]/30 bg-[#002817]/5 text-[#002817] dark:text-[#E4C46A]"
            >
              {items.length} Itens no Mix
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Definição e governança de percentuais de comissão por produto/item com histórico perene
            de vigência.
          </p>
        </div>

        {/* Barra de Ações Rápidas no Cabeçalho */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadModeloComissaoMix()}
            className="text-xs h-9 border-[#002817]/30 text-[#002817] dark:text-[#E4C46A] hover:bg-[#002817]/5"
            title="Baixar planilha padrão (.xlsx) para preenchimento de comissões"
          >
            <FileDown className="w-3.5 h-3.5 mr-1.5 text-[#C89B3C]" />
            Baixar Modelo
          </Button>

          {canEdit && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setImportStep('upload')
                  setImportFile(null)
                  setImportValidation(null)
                  setImportDialogOpen(true)
                }}
                className="text-xs h-9 border-[#002817]/30 text-[#002817] dark:text-[#E4C46A] hover:bg-[#002817]/5"
                title="Importar planilha Excel de comissões"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5 text-[#C89B3C]" />
                Importar Excel
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setBulkFilterType(selectedIds.length > 0 ? 'selected' : 'brand')
                  setBulkDialogOpen(true)
                }}
                className="text-xs h-9 bg-[#002817] hover:bg-[#00381C] text-white font-semibold"
                title="Edição em massa por Marca, Fornecedor, Categoria ou Seleção"
              >
                <Layers className="w-3.5 h-3.5 mr-1.5 text-[#C89B3C]" />
                Edição em Massa
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarExcel}
            className="text-xs h-9"
            title="Exportar dados filtrados para Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
            Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarPdf}
            className="text-xs h-9"
            title="Imprimir ou salvar PDF da visualização atual"
          >
            PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={carregarDados}
            disabled={loading}
            className="text-xs h-9 w-9 p-0"
            title="Recarregar dados"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* 2. CARD DE FILTROS */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-2xs print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Busca textual rápida */}
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs font-semibold">
              Busca Rápida (EAN, Código, Descrição ou Marca)
            </Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Digite o código interno, EAN, descrição do produto ou marca..."
                value={filters.search || ''}
                onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                className="pl-8 text-xs h-9"
              />
            </div>
          </div>

          {/* Filtro por Situação (Ativo/Inativo) */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Situação Cadastral</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(val: any) => setFilters((prev) => ({ ...prev, status: val }))}
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="Todas as situações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Situações</SelectItem>
                <SelectItem value="Ativo">Somente Ativos</SelectItem>
                <SelectItem value="Inativo">Somente Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro por Comissão (Com/Sem) */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Comissionamento</Label>
            <Select
              value={filters.commission_type || 'all'}
              onValueChange={(val: any) =>
                setFilters((prev) => ({ ...prev, commission_type: val }))
              }
            >
              <SelectTrigger className="text-xs h-9">
                <SelectValue placeholder="Com e sem comissão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Produtos</SelectItem>
                <SelectItem value="with">Com Comissão (&gt; 0%)</SelectItem>
                <SelectItem value="without">Sem Comissão (0%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filtros Avançados Expansíveis */}
        {filtrosAvancadosAbertos && (
          <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Marca */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Marca</Label>
              <Select
                value={filters.brand || 'all'}
                onValueChange={(v) =>
                  setFilters((prev) => ({ ...prev, brand: v === 'all' ? '' : v }))
                }
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Todas as marcas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as marcas</SelectItem>
                  {filterOptions.brands.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fornecedor */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Fornecedor</Label>
              <Select
                value={filters.supplier || 'all'}
                onValueChange={(v) =>
                  setFilters((prev) => ({ ...prev, supplier: v === 'all' ? '' : v }))
                }
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Todos os fornecedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fornecedores</SelectItem>
                  {filterOptions.suppliers.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Categoria</Label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(v) =>
                  setFilters((prev) => ({ ...prev, category: v === 'all' ? '' : v }))
                }
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {filterOptions.categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Faixa de Percentual */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Faixa de % Comissão (Mín — Máx)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Mín %"
                  value={filters.percentage_min ?? ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      percentage_min: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                  className="text-xs h-9"
                />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Máx %"
                  value={filters.percentage_max ?? ''}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      percentage_max: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                  className="text-xs h-9"
                />
              </div>
            </div>
          </div>
        )}

        {/* Linha de botões dos filtros */}
        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setFiltrosAvancadosAbertos(!filtrosAvancadosAbertos)}
            className="text-xs text-[#002817] dark:text-[#E4C46A]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            {filtrosAvancadosAbertos
              ? 'Ocultar Filtros Avançados'
              : 'Mais Filtros (Marca, Categoria, Faixas)'}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={limparFiltros}
              className="text-xs h-8"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Limpar Filtros
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={aplicarFiltros}
              className="text-xs h-8 bg-[#002817] hover:bg-[#00381C] text-white"
            >
              <Filter className="w-3.5 h-3.5 mr-1 text-[#C89B3C]" />
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* 3. TABELA PADRÃO JETRO (Reorganização, Ordenação, Seleção, Ocultação de Colunas) */}
      <div className="bg-card border border-border rounded-xl p-3 shadow-2xs">
        <JetroTable
          screenId="comercial.comissoes.mix"
          data={items}
          columns={columns}
          loading={loading}
          rowKey="id"
          exportTitle="Comissões MIX de Produtos — Jetro ERP"
          exportFilename={`comissoes_mix_jetro_${new Date().toISOString().slice(0, 10)}.xlsx`}
          toolbarExtra={
            selectedIds.length > 0 ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {selectedIds.length} selecionado(s)
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds([])}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  Limpar seleção
                </Button>
              </div>
            ) : null
          }
        />
      </div>

      {/* 4. MODAL DE EDIÇÃO INDIVIDUAL */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-w-md bg-card border border-border">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-[#002817] dark:text-[#E4C46A]" />
              <DialogTitle className="text-base font-bold text-[#002817] dark:text-[#E4C46A]">
                Editar Comissão MIX do Item
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              A alteração vale a partir do início da vigência indicado. Comissões faturadas em datas
              anteriores preservam o percentual gravado na época.
            </DialogDescription>
          </DialogHeader>

          {editItem && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 space-y-1">
                <div className="font-bold text-foreground text-sm">{editItem.product_name}</div>
                <div className="flex items-center gap-3 text-muted-foreground text-[11px] font-mono">
                  <span>Código: {editItem.product_code}</span>
                  <span>EAN: {editItem.product_ean || '—'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Novo Percentual de Comissão (%) *</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editPerc}
                    onChange={(e) => setEditPerc(e.target.value)}
                    className="pr-8 text-xs font-bold"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Início da Vigência *</Label>
                <Input
                  type="date"
                  value={editVigencia}
                  onChange={(e) => setEditVigencia(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Situação</Label>
                <Select value={editStatus} onValueChange={(val: any) => setEditStatus(val)}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Motivo / Justificativa *</Label>
                <Textarea
                  placeholder="Ex: Alinhamento de margem comercial com a indústria..."
                  value={editMotivo}
                  onChange={(e) => setEditMotivo(e.target.value)}
                  className="text-xs min-h-[60px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditItem(null)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={salvandoIndividual}
              onClick={salvarEdicaoIndividual}
              className="bg-[#002817] hover:bg-[#00381C] text-white text-xs font-semibold"
            >
              {salvandoIndividual ? 'Gravando...' : 'Salvar Alteração'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. MODAL DE HISTÓRICO POR PRODUTO */}
      <Dialog open={!!historyItem} onOpenChange={(open) => !open && setHistoryItem(null)}>
        <DialogContent className="max-w-2xl bg-card border border-border">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#002817] dark:text-[#E4C46A]" />
              <DialogTitle className="text-base font-bold text-[#002817] dark:text-[#E4C46A]">
                Histórico de Vigências e Alterações de Comissão
              </DialogTitle>
            </div>
            {historyItem && (
              <DialogDescription className="text-xs text-muted-foreground">
                Item: <b>{historyItem.product_code}</b> — {historyItem.product_name}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto space-y-2 py-2">
            {historyItem?.history && historyItem.history.length > 0 ? (
              historyItem.history
                .slice()
                .reverse()
                .map((entry, idx) => (
                  <div
                    key={idx}
                    className="border border-border/70 rounded-lg p-3 bg-muted/20 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="font-bold text-xs bg-[#002817]/5 text-[#002817] dark:text-[#E4C46A] border-[#002817]/20"
                        >
                          {entry.percentual_anterior.toFixed(2)}% →{' '}
                          {entry.novo_percentual.toFixed(2)}%
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          Vigência a partir de:{' '}
                          <b className="text-foreground">
                            {new Date(`${entry.vigencia_inicio}T00:00:00`).toLocaleDateString(
                              'pt-BR',
                            )}
                          </b>
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {entry.tipo_alteracao || 'ALTERAÇÃO'}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
                      <span>
                        Alterado por: <b className="text-foreground">{entry.usuario_nome}</b>
                      </span>
                      <span className="font-mono">
                        {new Date(entry.data).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    {entry.motivo && (
                      <div className="text-[11px] italic bg-background/70 p-1.5 rounded border border-border/50 text-foreground">
                        "{entry.motivo}"
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Nenhum histórico adicional registrado para este item.
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setHistoryItem(null)}
              className="text-xs"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 6. MODAL DE EDIÇÃO EM MASSA */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-lg bg-card border border-border">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#002817] dark:text-[#E4C46A]" />
              <DialogTitle className="text-base font-bold text-[#002817] dark:text-[#E4C46A]">
                Edição em Massa de Comissões MIX
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Atualize a alíquota de dezenas ou centenas de produtos simultaneamente de forma
              auditada.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            {/* Escolha do escopo */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Critério de Aplicação em Lote</Label>
              <Select
                value={bulkFilterType}
                onValueChange={(val: any) => {
                  setBulkFilterType(val)
                  setBulkFilterValue('')
                }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="selected">
                    Itens Selecionados na Tabela ({selectedIds.length} selecionados)
                  </SelectItem>
                  <SelectItem value="all_filtered">
                    Todos os Itens Filtrados Atual ({items.length} itens)
                  </SelectItem>
                  <SelectItem value="brand">Por Marca</SelectItem>
                  <SelectItem value="supplier">Por Fornecedor</SelectItem>
                  <SelectItem value="category">Por Categoria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Valor do filtro se por atributo */}
            {bulkFilterType === 'brand' && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Selecione a Marca *</Label>
                <Select value={bulkFilterValue} onValueChange={setBulkFilterValue}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Escolha a marca..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.brands.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {bulkFilterType === 'supplier' && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Selecione o Fornecedor *</Label>
                <Select value={bulkFilterValue} onValueChange={setBulkFilterValue}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Escolha o fornecedor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.suppliers.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {bulkFilterType === 'category' && (
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Selecione a Categoria *</Label>
                <Select value={bulkFilterValue} onValueChange={setBulkFilterValue}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="Escolha a categoria..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filterOptions.categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Novo percentual e vigência */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Novo % de Comissão *</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={bulkNewPerc}
                    onChange={(e) => setBulkNewPerc(e.target.value)}
                    className="pr-8 text-xs font-bold"
                  />
                  <span className="absolute right-2.5 top-2.5 text-xs text-muted-foreground">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Início da Vigência *</Label>
                <Input
                  type="date"
                  value={bulkVigencia}
                  onChange={(e) => setBulkVigencia(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Motivo / Justificativa da Alteração *</Label>
              <Textarea
                placeholder="Ex: Campanha trimestral de incentivo por linha de produtos..."
                value={bulkMotivo}
                onChange={(e) => setBulkMotivo(e.target.value)}
                className="text-xs min-h-[60px]"
              />
            </div>

            {/* Quadro de Impacto Quantitativo */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs text-amber-900 dark:text-amber-200">
                  Produtos que receberão o percentual de <b>{bulkNewPerc}%</b>:
                </span>
              </div>
              <Badge className="bg-amber-600 text-white font-bold text-xs">
                {produtosAfetadosEmMassa.length} produtos
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBulkDialogOpen(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={produtosAfetadosEmMassa.length === 0}
              onClick={() => setBulkConfirmOpen(true)}
              className="bg-[#002817] hover:bg-[#00381C] text-white text-xs font-semibold"
            >
              Prosseguir com Confirmação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de Confirmação Rígida da Edição em Massa */}
      <AlertDialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#002817] dark:text-[#E4C46A]">
              Confirmar Edição em Massa de {produtosAfetadosEmMassa.length} Itens?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs space-y-2 text-muted-foreground">
              <p>
                Você está prestes a definir a comissão de{' '}
                <b>{produtosAfetadosEmMassa.length} produtos</b> para{' '}
                <b className="text-foreground">{bulkNewPerc}%</b> com vigência a partir de{' '}
                <b className="text-foreground">{bulkVigencia}</b>.
              </p>
              <p>
                Esta alteração será registrada no histórico de cada item e no log central de
                auditoria com o motivo: <i>"{bulkMotivo}"</i>.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkSaving} className="text-xs">
              Voltar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={bulkSaving}
              onClick={confirmarEdicaoEmMassa}
              className="bg-[#002817] hover:bg-[#00381C] text-white text-xs font-bold"
            >
              {bulkSaving ? 'Gravando em lote...' : 'Confirmar e Aplicar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 7. MODAL DE IMPORTAÇÃO DE PLANILHA EXCEL */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-3xl bg-card border border-border">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#002817] dark:text-[#E4C46A]" />
              <DialogTitle className="text-base font-bold text-[#002817] dark:text-[#E4C46A]">
                Importar Comissões MIX via Planilha Excel
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Identifica os produtos por Código interno ou EAN. Nunca cria produtos novos nem altera
              dados cadastrais: somente atualiza percentual e início da vigência com histórico.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* ETAPA 1: Upload */}
            {importStep === 'upload' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-[#002817] dark:hover:border-[#E4C46A] rounded-xl p-8 text-center cursor-pointer transition-colors bg-muted/20 hover:bg-[#002817]/5 flex flex-col items-center justify-center group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleSelecionarArquivoImportacao(e.target.files[0])
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-full bg-[#002817]/10 text-[#002817] dark:text-[#E4C46A] flex items-center justify-center mb-2.5">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-foreground">
                  Clique para selecionar o arquivo Excel (.xlsx) ou arraste aqui
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  Utilize a planilha modelo fornecida pelo sistema com colunas: Código, EAN,
                  Percentual e Vigência.
                </p>

                {parsingImport && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#002817] dark:text-[#E4C46A]">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Validando produtos contra o catálogo real...
                  </div>
                )}
              </div>
            )}

            {/* ETAPA 2: Prévia e Validação */}
            {importStep === 'preview' && importValidation && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                    <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">
                      Válidos para Gravação
                    </span>
                    <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                      {importValidation.validos.length} itens
                    </span>
                  </div>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 block">
                      Não Encontrados
                    </span>
                    <span className="text-lg font-bold text-amber-700 dark:text-amber-400">
                      {importValidation.naoEncontrados.length} itens
                    </span>
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <span className="text-[11px] font-semibold text-red-800 dark:text-red-300 block">
                      Inválidos (Erros)
                    </span>
                    <span className="text-lg font-bold text-red-700 dark:text-red-400">
                      {importValidation.invalidos.length} itens
                    </span>
                  </div>
                </div>

                {/* Tabela de prévia */}
                <div className="border border-border rounded-lg max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 border-b border-border sticky top-0 text-[11px]">
                      <tr>
                        <th className="p-2">Linha</th>
                        <th className="p-2">Código</th>
                        <th className="p-2">Descrição</th>
                        <th className="p-2 text-right">Atual</th>
                        <th className="p-2 text-right">Novo %</th>
                        <th className="p-2">Vigência</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {importValidation.validos.slice(0, 30).map((v, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="p-2 font-mono text-[11px]">{v.linha}</td>
                          <td className="p-2 font-mono font-bold">{v.product_code}</td>
                          <td className="p-2 truncate max-w-[200px]">{v.product_name}</td>
                          <td className="p-2 text-right font-mono text-muted-foreground">
                            {v.percentual_atual.toFixed(2)}%
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {v.novo_percentual.toFixed(2)}%
                          </td>
                          <td className="p-2 font-mono">{v.vigencia_inicio}</td>
                          <td className="p-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] text-emerald-700 border-emerald-400"
                            >
                              Válido
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {importValidation.naoEncontrados.slice(0, 15).map((ne, idx) => (
                        <tr
                          key={`ne-${idx}`}
                          className="bg-amber-500/5 text-amber-900 dark:text-amber-200"
                        >
                          <td className="p-2 font-mono text-[11px]">{ne.linha}</td>
                          <td className="p-2 font-mono">{ne.product_code}</td>
                          <td className="p-2 italic truncate max-w-[200px]">{ne.product_name}</td>
                          <td className="p-2 text-right">—</td>
                          <td className="p-2 text-right font-mono">
                            {ne.novo_percentual.toFixed(2)}%
                          </td>
                          <td className="p-2 font-mono">{ne.vigencia_inicio}</td>
                          <td className="p-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] text-amber-700 border-amber-400"
                            >
                              Não Cadastrado
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {importValidation.validos.length > 30 && (
                  <p className="text-[11px] text-muted-foreground text-center">
                    Exibindo os primeiros 30 registros válidos de um total de{' '}
                    {importValidation.validos.length}.
                  </p>
                )}
              </div>
            )}

            {/* ETAPA 3: Aplicando em progresso */}
            {importStep === 'applying' && (
              <div className="py-6 space-y-3 text-center">
                <RefreshCw className="w-8 h-8 mx-auto text-[#002817] dark:text-[#E4C46A] animate-spin" />
                <h4 className="text-sm font-bold text-foreground">
                  Gravando histórico e atualizando comissões...
                </h4>
                <p className="text-xs text-muted-foreground">
                  Processando item {importProgress.current} de {importProgress.total} (
                  {importProgress.percent}%)
                </p>
                <Progress value={importProgress.percent} className="h-2 max-w-md mx-auto" />
              </div>
            )}

            {/* ETAPA 4: Concluído */}
            {importStep === 'done' && importResult && (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-foreground">
                  Importação Concluída com Sucesso!
                </h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  <b>{importResult.successCount} produtos</b> tiveram seus percentuais atualizados
                  com registro perene de auditoria e vigência.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            {importStep === 'preview' && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImportStep('upload')}
                  className="text-xs"
                >
                  Voltar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={importValidation?.validos.length === 0}
                  onClick={handleConfirmarImportacao}
                  className="bg-[#002817] hover:bg-[#00381C] text-white text-xs font-semibold"
                >
                  Confirmar e Gravar {importValidation?.validos.length} Itens
                </Button>
              </>
            )}

            {(importStep === 'upload' || importStep === 'done') && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setImportDialogOpen(false)}
                className="text-xs"
              >
                Fechar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
