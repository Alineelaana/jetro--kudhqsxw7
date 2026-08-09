import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Link } from 'react-router-dom'
import { Search, Star } from 'lucide-react'
import { logBIAudit } from '@/services/bi'
import { cn } from '@/lib/utils'
import { EXPORT_INVENTORY, INVENTORY_SUMMARY } from '@/lib/corporate-document-engine/inventory'

interface ReportEntry {
  id: string
  category: string
  label: string
  description: string
  route: string
  icon: string
}

const REPORTS: ReportEntry[] = [
  {
    id: 'bi-dashboard',
    category: 'BI / Analytics',
    label: 'Dashboard Executivo',
    description: 'Visão geral integrada',
    route: '/admin/bi',
    icon: '📊',
  },
  {
    id: 'bi-exec',
    category: 'BI / Analytics',
    label: 'Inteligência Executiva',
    description: 'EBITDA, margem, projeções',
    route: '/admin/bi/executive',
    icon: '👑',
  },
  {
    id: 'bi-cross',
    category: 'BI / Analytics',
    label: 'Visão Cruzada',
    description: 'Análises intermodulares',
    route: '/admin/bi/cross-module',
    icon: '🔀',
  },
  {
    id: 'bi-saved',
    category: 'BI / Analytics',
    label: 'Relatórios Salvos',
    description: 'Relatórios personalizados',
    route: '/admin/bi/saved-views',
    icon: '🔖',
  },
  {
    id: 'bi-custom',
    category: 'BI / Analytics',
    label: 'Dashboards Personalizados',
    description: 'Crie seu dashboard',
    route: '/admin/bi/custom-dashboards',
    icon: '🎨',
  },
  {
    id: 'bi-adapta',
    category: 'BI / Analytics',
    label: 'IA ADAPTA',
    description: 'Assistente de inteligência',
    route: '/admin/bi/ai-adapta',
    icon: '🤖',
  },
  {
    id: 'bi-comm',
    category: 'Comercial',
    label: 'Inteligência Comercial',
    description: 'Faturamento, projeção, ranking',
    route: '/admin/bi/commercial',
    icon: '📈',
  },
  {
    id: 'bi-crm',
    category: 'Comercial',
    label: 'Inteligência CRM',
    description: 'Leads, funil, conversão',
    route: '/admin/bi/crm-intel',
    icon: '🎯',
  },
  {
    id: 'bi-fin',
    category: 'Financeiro',
    label: 'Inteligência Financeira',
    description: 'Fluxo de caixa, inadimplência',
    route: '/admin/bi/financial-intel',
    icon: '💰',
  },
  {
    id: 'bi-ind',
    category: 'Industrial',
    label: 'Inteligência Industrial',
    description: 'PCP, OEE, gargalos',
    route: '/admin/bi/industrial-intel',
    icon: '🏭',
  },
  {
    id: 'bi-log',
    category: 'Logística',
    label: 'Inteligência Logística',
    description: 'OTIF, fretes, entregas',
    route: '/admin/bi/logistics-intel',
    icon: '🚚',
  },
  {
    id: 'bi-stock',
    category: 'Estoque',
    label: 'Inteligência de Estoque',
    description: 'Curva ABC, ruptura',
    route: '/admin/bi/stock-intel',
    icon: '📦',
  },
  {
    id: 'bi-fisc',
    category: 'Fiscal',
    label: 'Inteligência Fiscal',
    description: 'NF-e, carga tributária',
    route: '/admin/bi/fiscal-intel',
    icon: '🧾',
  },
  {
    id: 'bi-purch',
    category: 'Compras',
    label: 'Inteligência de Compras',
    description: 'Fornecedores, cotações',
    route: '/admin/bi/purchasing-intel',
    icon: '🛒',
  },
  {
    id: 'bi-mkt',
    category: 'Marketing',
    label: 'Inteligência de Marketing',
    description: 'Investimento, ROI, leads, CPL, CAC, atribuição',
    route: '/admin/marketing',
    icon: '📢',
  },
  {
    id: 'bi-mkt-intel',
    category: 'Marketing',
    label: 'Centro de Inteligência Marketing',
    description: 'Indicadores detalhados de marketing',
    route: '/admin/bi/marketing-intel',
    icon: '📊',
  },
  {
    id: 'bi-trade',
    category: 'Trade',
    label: 'Inteligência Trade Marketing',
    description: 'Campanhas, verbas, ROI',
    route: '/admin/bi/trade-intel',
    icon: '📣',
  },
  {
    id: 'bi-rh',
    category: 'RH',
    label: 'Inteligência de RH',
    description: 'Turnover, absenteísmo',
    route: '/admin/bi/rh-intel',
    icon: '👥',
  },
  {
    id: 'bi-qual',
    category: 'Qualidade',
    label: 'Inteligência de Qualidade',
    description: 'NCs, refugo, rejeição',
    route: '/admin/bi/quality-intel',
    icon: '✅',
  },
  {
    id: 'bi-vr',
    category: 'Comissões',
    label: 'Remuneração Variável',
    description: 'Comissões, metas, campanhas',
    route: '/admin/bi/vr-intel',
    icon: '🏆',
  },
  {
    id: 'bi-projection',
    category: 'Comercial',
    label: 'Projeção de Vendas',
    description: 'Projeção baseada em faturamento e dias úteis',
    route: '/admin/bi/projection',
    icon: '📈',
  },
  {
    id: 'ctrl-dre',
    category: 'Controladoria',
    label: 'DRE',
    description: 'Demonstração de Resultado do Exercício',
    route: '/admin/controladoria/dre',
    icon: '📋',
  },
  {
    id: 'ctrl-balanco',
    category: 'Controladoria',
    label: 'Balanço Patrimonial',
    description: 'Ativo, Passivo e Patrimônio Líquido',
    route: '/admin/controladoria/balanco',
    icon: '⚖️',
  },
  {
    id: 'ctrl-fluxo',
    category: 'Controladoria',
    label: 'Fluxo de Caixa Gerencial',
    description: 'Saldo inicial, a receber, a pagar e projetado',
    route: '/admin/controladoria/fluxo-caixa',
    icon: '💵',
  },
  {
    id: 'ctrl-ebitda',
    category: 'Controladoria',
    label: 'EBITDA',
    description: 'Margem EBITDA e componentes',
    route: '/admin/controladoria/ebitda',
    icon: '💎',
  },
  {
    id: 'ctrl-budget',
    category: 'Controladoria',
    label: 'Orçado × Realizado',
    description: 'Comparativo orçamento vs realizado',
    route: '/admin/controladoria/budget',
    icon: '📊',
  },
  {
    id: 'ctrl-closing',
    category: 'Controladoria',
    label: 'Fechamento Gerencial',
    description: 'Workflow de fechamento periódico',
    route: '/admin/controladoria/fechamento',
    icon: '🔒',
  },
  {
    id: 'ctrl-simulator',
    category: 'Controladoria',
    label: 'Simulador Corporativo',
    description: 'Cenários simulados sobre dados oficiais',
    route: '/admin/controladoria/simulador',
    icon: '🔮',
  },
  {
    id: 'ctrl-consolidacao',
    category: 'Controladoria',
    label: 'Consolidação',
    description: 'Consolidação de empresas e eliminações',
    route: '/admin/controladoria/consolidacao',
    icon: '🏛️',
  },
]

const CATEGORIES = [
  'BI / Analytics',
  'Comercial',
  'Financeiro',
  'Marketing',
  'Estoque',
  'Compras',
  'Fiscal',
  'Industrial',
  'Logística',
  'RH',
  'Trade',
  'Qualidade',
  'Comissões',
  'Controladoria',
]

export function BiReportCenter() {
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bi_report_favorites')
      if (saved) setFavorites(JSON.parse(saved))
    } catch {
      /* ignore */
    }
    logBIAudit('view', '', 'Visualizacao: Central Corporativa de Relatorios')
  }, [])

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      localStorage.setItem('bi_report_favorites', JSON.stringify(next))
      return next
    })
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return REPORTS
    const q = search.toLowerCase()
    return REPORTS.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    )
  }, [search])

  const favReports = filtered.filter((r) => favorites.includes(r.id))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar relatório..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      {favReports.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#005B2E] mb-2">⭐ Favoritos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favReports.map((r) => (
              <ReportCard key={r.id} report={r} isFav={true} onToggleFav={toggleFav} />
            ))}
          </div>
        </div>
      )}
      {CATEGORIES.map((cat) => {
        const catReports = filtered.filter((r) => r.category === cat && !favorites.includes(r.id))
        if (catReports.length === 0) return null
        return (
          <div key={cat}>
            <h3 className="text-sm font-bold text-[#005B2E] mb-2">{cat}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {catReports.map((r) => (
                <ReportCard key={r.id} report={r} isFav={false} onToggleFav={toggleFav} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ReportCard({
  report,
  isFav,
  onToggleFav,
}: {
  report: ReportEntry
  isFav: boolean
  onToggleFav: (id: string) => void
}) {
  return (
    <Card className="border-2 border-[#005B2E]/20 hover:shadow-lg transition-shadow">
      <CardContent className="py-3 flex items-center gap-3">
        <span className="text-2xl">{report.icon}</span>
        <div className="flex-1 min-w-0">
          <Link to={report.route} className="block">
            <p className="font-bold text-sm text-foreground hover:text-[#005B2E]">{report.label}</p>
            <p className="text-xs text-muted-foreground truncate">{report.description}</p>
          </Link>
        </div>
        <button
          onClick={() => onToggleFav(report.id)}
          className="opacity-50 hover:opacity-100 transition-opacity"
        >
          <Star
            className={cn(
              'w-4 h-4',
              isFav ? 'fill-[#C89B3C] text-[#C89B3C]' : 'text-muted-foreground',
            )}
          />
        </button>
      </CardContent>
    </Card>
  )
}
