import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Download, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { useCorporateDocuments } from '@/hooks/use-corporate-documents'
import { getProjectionData, logProjectionExport } from '@/services/projection'
import { ProjectionFilters } from './projection/projection-filters'
import { ProjectionKPIs } from './projection/projection-kpis'
import { ProjectionTable } from './projection/projection-table'
import { ProjectionCharts } from './projection/projection-charts'
import { ProjectionConfigDialog } from './projection/projection-config-dialog'
import {
  DIMENSIONS,
  EMPTY_FILTERS,
  PROJECTION_FORMULA,
  type ProjectionData,
  type ProjectionFilters as FilterType,
} from '@/lib/projection-utils'
import type { ExportFormat, DocumentSection } from '@/lib/corporate-document-engine/types'
import { toast } from 'sonner'

export function BiProjection() {
  const { user } = useAuth()
  const { generate } = useCorporateDocuments()
  const [filters, setFilters] = useState<FilterType>({ ...EMPTY_FILTERS })
  const [data, setData] = useState<ProjectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dimension, setDimension] = useState('rca')
  const [configOpen, setConfigOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const load = async () => {
    try {
      setData(await getProjectionData(filters))
    } catch {
      setData(null)
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [filters])
  useRealtime('sales_orders', () => load())
  useRealtime('sales_goals', () => load())

  const compParts = (filters.competencia || '').split('-')
  const configMes = parseInt(compParts[1]) || new Date().getMonth() + 1
  const configAno = parseInt(compParts[0]) || new Date().getFullYear()

  const currentRows = useMemo(() => data?.dimensions[dimension] || [], [data, dimension])
  const dimLabel = DIMENSIONS.find((d) => d.key === dimension)?.label || ''

  const handleExport = async (format: ExportFormat) => {
    if (!data) return
    setExporting(true)
    const sections: DocumentSection[] = [
      {
        title: 'Indicadores Principais',
        summary: [
          { label: 'Meta', value: `R$ ${data.kpis.meta.toFixed(2)}` },
          { label: 'Faturado', value: `R$ ${data.kpis.faturado.toFixed(2)}` },
          { label: 'Vendido', value: `R$ ${data.kpis.vendido.toFixed(2)}` },
          { label: 'Projeção', value: `R$ ${data.kpis.projecao.toFixed(2)}` },
          { label: '% Meta', value: `${data.kpis.pct_meta.toFixed(1)}%` },
          {
            label: 'Dias Úteis',
            value: `${data.kpis.dias_uteis_decorridos}/${data.kpis.dias_uteis_totais}`,
          },
        ],
      },
      {
        title: `Análise por ${dimLabel}`,
        headers: [dimLabel, 'Faturado', 'Projeção', '% Meta', 'Status'],
        rows: currentRows.map((r) => [
          r.name,
          `R$ ${r.faturado.toFixed(2)}`,
          `R$ ${r.projecao.toFixed(2)}`,
          r.meta > 0 ? `${r.pct_meta.toFixed(1)}%` : 'N/A',
          r.status,
        ]),
      },
    ]
    try {
      const result = await generate({
        title: 'Projeção de Vendas',
        module: 'bi',
        documentType: 'projection',
        format,
        sections,
        stamp: {
          empresa: filters.empresa,
          filial: filters.filial,
          userName: (user?.name as string) || 'Usuário',
          userRole: (user?.role as string) || 'PADRAO',
          module: 'bi',
          documentType: 'projection',
          filters: { competencia: filters.competencia },
        },
        recordCount: currentRows.length,
        filters: { competencia: filters.competencia },
      })
      if (result.success) toast.success('Documento gerado com sucesso')
      else toast.error(result.error || 'Erro ao gerar documento')
      logProjectionExport(format, filters)
    } catch {
      toast.error('Erro ao exportar')
    }
    setExporting(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!data)
    return <p className="text-center py-6 text-muted-foreground">Erro ao carregar dados.</p>

  return (
    <div className="space-y-4">
      <ProjectionFilters
        filters={filters}
        onFilterChange={setFilters}
        onClear={() => setFilters({ ...EMPTY_FILTERS, competencia: filters.competencia })}
        onOpenConfig={() => setConfigOpen(true)}
      />
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={exporting}
          onClick={() => handleExport('pdf')}
        >
          <Download className="w-3.5 h-3.5 mr-1" /> PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={exporting}
          onClick={() => handleExport('png')}
        >
          <ImageIcon className="w-3.5 h-3.5 mr-1" /> Imagem
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {PROJECTION_FORMULA} | Competência: {data.competencia} | Dias úteis: {data.elapsed_days}/
        {data.total_days}
      </p>
      <ProjectionKPIs kpis={data.kpis} />
      <ProjectionCharts kpis={data.kpis} rows={currentRows} dailyEvolution={data.daily_evolution} />
      <Tabs value={dimension} onValueChange={setDimension}>
        <TabsList className="flex-wrap">
          {DIMENSIONS.map((d) => (
            <TabsTrigger key={d.key} value={d.key}>
              {d.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <ProjectionTable
        rows={currentRows}
        dimensionLabel={dimLabel}
        onRowClick={(name) => {
          const m: Record<string, keyof FilterType> = {
            rca: 'rca',
            gerente: 'gerente',
            fornecedor: 'fornecedor',
            produto: 'produto',
            regiao: 'regiao',
          }
          const key = m[dimension]
          if (key) setFilters({ ...filters, [key]: name })
        }}
      />
      <ProjectionConfigDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        mes={configMes}
        ano={configAno}
        empresa={filters.empresa}
        filial={filters.filial}
      />
    </div>
  )
}
