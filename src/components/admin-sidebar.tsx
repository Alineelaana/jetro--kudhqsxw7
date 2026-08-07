import {
  useState,
  useMemo,
  useEffect,
  type ComponentType,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useMenuHistory } from '@/hooks/use-menu-history'
import { useMenuFavorites } from '@/hooks/use-menu-favorites'
import { useMenuBadges } from '@/hooks/use-menu-badges'
import { useModuleSections } from '@/hooks/use-module-sections'
import {
  canViewSales,
  canViewStock,
  canConsultCosts,
  canViewAuditLogs,
  canManageUsers,
  canManageCms,
  canManageBackups,
  canManageAiTraining,
  canViewConfiguracoes,
  canViewPurchasing,
  canViewFiscal,
} from '@/lib/permissions'
import { canViewLogistics } from '@/lib/logistics-permissions'
import { canViewPriceTables } from '@/lib/price-table-permissions'
import { canViewFinancial } from '@/lib/financial-permissions'
import { canViewRH } from '@/lib/rh-permissions'
import { canViewAiModule } from '@/lib/ai-permissions'
import { canViewIndustry } from '@/lib/industrial-permissions'
import { canViewVR } from '@/lib/variable-remuneration-permissions'
import { canViewBI } from '@/lib/bi-permissions'
import { canViewControladoria } from '@/lib/controladoria-permissions'
import { canViewSA } from '@/lib/supplier-allowance-permissions'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  FileText,
  Wrench,
  MessageSquare,
  Users,
  Database,
  Package,
  ShoppingCart,
  ChevronDown,
  DollarSign,
  Briefcase,
  Settings,
  Cog,
  Shield,
  Archive,
  Bot,
  FileSignature,
  Boxes,
  Search,
  X,
  Star,
  Table,
  Bell,
  Truck,
  Wallet,
  UserCog,
  Brain,
  Factory,
  Coins,
  BarChart3,
  Calculator,
  HandCoins,
} from 'lucide-react'

type IconType = ComponentType<{ className?: string }>

interface SubItem {
  to: string
  label: string
  group?: string
}
interface NavItem {
  id?: string
  label: string
  icon: IconType
  to?: string
  submenu?: SubItem[]
  permission?: (role?: string) => boolean
}

interface FlatItem {
  label: string
  to?: string
  id?: string
  parentLabel?: string
  icon?: IconType
}

const SALES_SUBMENU: SubItem[] = [
  { to: '/admin/vendas', label: 'Dashboard de Vendas' },
  { to: '/admin/vendas/pedidos', label: 'Pedidos de Venda' },
  { to: '/admin/vendas/faturamento', label: 'Faturamento' },
  { to: '/admin/vendas/nfe', label: 'Emissão de NF-e' },
  { to: '/admin/vendas/nfce', label: 'Emissão de NFC-e' },
  { to: '/admin/vendas/contratos', label: 'Contratos' },
  { to: '/admin/vendas/devolucoes', label: 'Devoluções' },
  { to: '/admin/vendas/historico', label: 'Histórico de Vendas' },
]

const CRM_SUBMENU: SubItem[] = [
  { to: '/admin/crm', label: 'Dashboard CRM' },
  { to: '/admin/crm/leads', label: 'Leads' },
  { to: '/admin/crm/oportunidades', label: 'Oportunidades' },
  { to: '/admin/crm/funil', label: 'Funil de Vendas' },
  { to: '/admin/crm/agenda', label: 'Agenda' },
  { to: '/admin/crm/propostas', label: 'Propostas' },
  { to: '/admin/crm/historico', label: 'Histórico' },
  { to: '/admin/crm/atividades', label: 'Atividades' },
  { to: '/admin/crm/metas', label: 'Metas' },
  { to: '/admin/crm/relatorios', label: 'Relatórios' },
]

const STOCK_SUBMENU: SubItem[] = [
  { to: '/admin/estoque', label: 'Dashboard de Estoque' },
  { to: '/admin/estoque/movimentacoes', label: 'Movimentações' },
  { to: '/admin/estoque/inventario', label: 'Inventário' },
  { to: '/admin/estoque/transferencias', label: 'Transferências' },
  { to: '/admin/estoque/ajustes', label: 'Ajustes de Estoque' },
  { to: '/admin/estoque/lotes', label: 'Controle de Lotes' },
  { to: '/admin/estoque/validade', label: 'Controle de Validade' },
  { to: '/admin/estoque/localizacoes', label: 'Localizações' },
  { to: '/admin/estoque/separacao', label: 'Separação' },
  { to: '/admin/estoque/conferencia', label: 'Conferência' },
  { to: '/admin/estoque/expedicao', label: 'Expedição' },
  { to: '/admin/estoque/recebimento', label: 'Recebimento WMS' },
  { to: '/admin/estoque/enderecamento', label: 'Endereçamento' },
  { to: '/admin/estoque/ondas', label: 'Ondas de Separação' },
  { to: '/admin/estoque/reabastecimento', label: 'Reabastecimento' },
  { to: '/admin/estoque/wms-alertas', label: 'Alertas Operacionais' },
  { to: '/admin/estoque/wms-relatorios', label: 'Relatórios WMS' },
  { to: '/admin/estoque/wms-pallets', label: 'Gestão de Pallets' },
  { to: '/admin/estoque/wms-volumes', label: 'Gestão de Volumes' },
  { to: '/admin/estoque/wms-coletores', label: 'Gestão de Coletores' },
  { to: '/admin/estoque/wms-operadores', label: 'Gestão de Operadores' },
  { to: '/admin/estoque/wms-managerial', label: 'Dashboard Gerencial WMS' },
]

const CONFIG_SUBMENU: SubItem[] = [
  { to: '/admin/configuracoes/dados-empresa', label: 'Dados da Empresa' },
  { to: '/admin/configuracoes/parametros', label: 'Parâmetros' },
  { to: '/admin/configuracoes/permissoes', label: 'Permissões' },
  { to: '/admin/configuracoes/logs', label: 'Logs' },
  { to: '/admin/configuracoes/integracoes', label: 'Integrações' },
  { to: '/admin/configuracoes/apis', label: 'APIs' },
  { to: '/admin/configuracoes/importacao-exportacao', label: 'Import/Export' },
  { to: '/admin/configuracoes/modelos-email', label: 'Modelos de E-mail' },
  { to: '/admin/configuracoes/modelos-documentos', label: 'Modelos de Docs' },
  { to: '/admin/configuracoes/notificacoes', label: 'Notificações' },
  { to: '/admin/configuracoes/numeracoes', label: 'Numerações' },
  { to: '/admin/configuracoes/seguranca', label: 'Segurança' },
  { to: '/admin/configuracoes/backup', label: 'Backup' },
]

const RH_SUBMENU: SubItem[] = [
  { to: '/admin/rh', label: 'Dashboard de RH' },
  { to: '/admin/rh/colaboradores', label: 'Colaboradores' },
  { to: '/admin/rh/cargos', label: 'Cargos' },
  { to: '/admin/rh/departamentos', label: 'Departamentos' },
  { to: '/admin/rh/ponto', label: 'Controle de Ponto' },
  { to: '/admin/rh/ferias', label: 'Férias' },
  { to: '/admin/rh/folha', label: 'Folha de Pagamento' },
  { to: '/admin/rh/beneficios', label: 'Benefícios' },
  { to: '/admin/rh/treinamentos', label: 'Treinamentos' },
  { to: '/admin/rh/documentos', label: 'Documentos' },
  { to: '/admin/rh/aprovacoes', label: 'Aprovações de RH' },
  { to: '/admin/rh/relatorios', label: 'Relatórios de RH' },
]

const INDUSTRIAL_SUBMENU: SubItem[] = [
  { to: '/admin/industria', label: 'Dashboard Industrial' },
  { to: '/admin/industria/catalogo', label: 'Catálogo de Itens' },
  { to: '/admin/industria/bom', label: 'BOM / Estruturas' },
  { to: '/admin/industria/engenharia-bom', label: 'Engenharia BOM' },
  { to: '/admin/industria/formulacoes', label: 'Formulações' },
  { to: '/admin/industria/engenharia', label: 'Engenharia (ECR/ECO)' },
  { to: '/admin/industria/recursos', label: 'Recursos Produtivos' },
  { to: '/admin/industria/roteiros', label: 'Roteiros' },
  { to: '/admin/industria/capacidade', label: 'Capacidade Produtiva' },
  { to: '/admin/industria/plano-mestre', label: 'Plano Mestre' },
  { to: '/admin/industria/aps', label: 'APS & Cronograma' },
  { to: '/admin/industria/planejamento', label: 'Planejamento / MRP' },
  { to: '/admin/industria/custos', label: 'Custos Industriais' },
  { to: '/admin/industria/ordens-producao', label: 'Ordens de Produção' },
  { to: '/admin/industria/execucao', label: 'Execução / Apontamentos' },
  { to: '/admin/industria/fases', label: 'Fases de Produção' },
  { to: '/admin/industria/qualidade', label: 'Qualidade Industrial' },
  { to: '/admin/industria/rastreabilidade', label: 'Rastreabilidade' },
  { to: '/admin/industria/kpis', label: 'Indicadores (KPIs)' },
  { to: '/admin/industria/manutencao', label: 'Manutenção' },
  { to: '/admin/industria/executivo', label: 'Visão Executiva' },
]

const LOGISTICS_SUBMENU: SubItem[] = [
  { to: '/admin/logistica', label: 'Dashboard Logístico' },
  { to: '/admin/logistica/rotas', label: 'Rotas' },
  { to: '/admin/logistica/entregas', label: 'Entregas' },
  { to: '/admin/logistica/planejamento', label: 'Planejamento de Rotas' },
  { to: '/admin/logistica/veiculos', label: 'Veículos' },
  { to: '/admin/logistica/motoristas', label: 'Motoristas' },
  { to: '/admin/logistica/romaneios', label: 'Romaneios' },
  { to: '/admin/logistica/fretes', label: 'Fretes' },
  { to: '/admin/logistica/tabelas-frete', label: 'Tabelas de Frete' },
  { to: '/admin/logistica/rastreamento', label: 'Rastreamento' },
  { to: '/admin/logistica/ocorrencias', label: 'Ocorrências' },
  { to: '/admin/logistica/comprovantes', label: 'Comprovantes' },
  { to: '/admin/logistica/custos', label: 'Custos Logísticos' },
  { to: '/admin/logistica/indicadores', label: 'Indicadores' },
  { to: '/admin/logistica/reversa', label: 'Logística Reversa' },
  { to: '/admin/logistica/app-motorista', label: 'App do Motorista' },
  { to: '/admin/logistica/relatorios', label: 'Relatórios' },
]

const FINANCIAL_SUBMENU: SubItem[] = [
  { to: '/admin/financeiro', label: 'Dashboard Financeiro' },
  { to: '/admin/financeiro/contas-receber', label: 'Contas a Receber' },
  { to: '/admin/financeiro/contas-pagar', label: 'Contas a Pagar' },
  { to: '/admin/financeiro/fluxo-caixa', label: 'Fluxo de Caixa' },
  { to: '/admin/financeiro/conciliacao', label: 'Conciliação Bancária' },
  { to: '/admin/financeiro/tesouraria', label: 'Tesouraria' },
  { to: '/admin/financeiro/cheques', label: 'Controle de Cheques' },
  { to: '/admin/financeiro/cartoes', label: 'Cartões' },
  { to: '/admin/financeiro/boletos', label: 'Boletos' },
  { to: '/admin/financeiro/pix', label: 'PIX' },
  { to: '/admin/financeiro/cobrancas', label: 'Cobranças' },
  { to: '/admin/financeiro/caixa', label: 'Caixa' },
  { to: '/admin/financeiro/movimentacoes', label: 'Movimentações Financeiras' },
  { to: '/admin/financeiro/transferencias', label: 'Transferências entre Contas' },
  { to: '/admin/financeiro/aprovacoes', label: 'Aprovações Financeiras' },
  { to: '/admin/financeiro/fechamento', label: 'Fechamento Financeiro' },
  { to: '/admin/financeiro/relatorios', label: 'Relatórios Financeiros' },
]

const FISCAL_SUBMENU: SubItem[] = [
  { to: '/admin/fiscal', label: 'Dashboard Fiscal', group: 'Visão Geral' },
  { to: '/admin/fiscal/entrada', label: 'Entrada de Notas', group: 'Documentos' },
  { to: '/admin/fiscal/nfe', label: 'Emissão de NF-e', group: 'Documentos' },
  { to: '/admin/fiscal/nfse', label: 'Emissão de NFS-e', group: 'Documentos' },
  { to: '/admin/fiscal/nfce', label: 'NFC-e', group: 'Documentos' },
  { to: '/admin/fiscal/cte', label: 'CT-e', group: 'Documentos' },
  { to: '/admin/fiscal/mdfe', label: 'MDF-e', group: 'Documentos' },
  { to: '/admin/fiscal/documentos', label: 'Documentos Fiscais', group: 'Documentos' },
  { to: '/admin/fiscal/apuracao', label: 'Apuração de Impostos', group: 'Apuração' },
  { to: '/admin/fiscal/sped', label: 'SPED', group: 'Apuração' },
  { to: '/admin/fiscal/livros', label: 'Livros Fiscais', group: 'Apuração' },
  {
    to: '/admin/fiscal/reforma-dashboard',
    label: 'Reforma: Dashboard',
    group: 'Reforma Tributária',
  },
  { to: '/admin/fiscal/reforma-cbs-ibs', label: 'Reforma: CBS/IBS', group: 'Reforma Tributária' },
  {
    to: '/admin/fiscal/reforma-seletivo',
    label: 'Reforma: Imposto Seletivo',
    group: 'Reforma Tributária',
  },
  {
    to: '/admin/fiscal/reforma-classificacao',
    label: 'Reforma: Classificação',
    group: 'Reforma Tributária',
  },
  { to: '/admin/fiscal/reforma-regras', label: 'Reforma: Regras', group: 'Reforma Tributária' },
  {
    to: '/admin/fiscal/reforma-transicao',
    label: 'Reforma: Transição',
    group: 'Reforma Tributária',
  },
  {
    to: '/admin/fiscal/reforma-creditos',
    label: 'Reforma: Créditos/Débitos',
    group: 'Reforma Tributária',
  },
  {
    to: '/admin/fiscal/reforma-simulador',
    label: 'Reforma: Simulador',
    group: 'Reforma Tributária',
  },
  {
    to: '/admin/fiscal/reforma-validacao',
    label: 'Reforma: Validação',
    group: 'Reforma Tributária',
  },
  { to: '/admin/fiscal/correcao', label: 'Carta de Correção', group: 'Gestão' },
  { to: '/admin/fiscal/manifestacao', label: 'Manifestação', group: 'Gestão' },
  { to: '/admin/fiscal/inutilizacao', label: 'Inutilização', group: 'Gestão' },
  { to: '/admin/fiscal/certificados', label: 'Certificados Digitais', group: 'Gestão' },
  { to: '/admin/fiscal/configuracoes', label: 'Configurações Fiscais', group: 'Gestão' },
  { to: '/admin/fiscal/relatorios', label: 'Relatórios Fiscais', group: 'Gestão' },
]

const AI_SUBMENU: SubItem[] = [
  { to: '/admin/ia/dashboard', label: 'Dashboard de IA' },
  { to: '/admin/ia/assistente', label: 'Assistente IA' },
  { to: '/admin/ia/agentes', label: 'Agentes' },
  { to: '/admin/ia/automacoes', label: 'Automações' },
  { to: '/admin/ia/fluxos', label: 'Fluxos Inteligentes' },
  { to: '/admin/ia/base-conhecimento', label: 'Base de Conhecimento' },
  { to: '/admin/ia/treinamento', label: 'Treinamento da IA' },
  { to: '/admin/ia/historico', label: 'Histórico de Interações' },
  { to: '/admin/ia/aprovacoes', label: 'Aprovações da IA' },
  { to: '/admin/ia/configuracoes', label: 'Configurações da IA' },
]

const CONTROLADORIA_SUBMENU: SubItem[] = [
  { to: '/admin/controladoria', label: 'Cockpit Executivo' },
  { to: '/admin/controladoria/dre', label: 'DRE' },
  { to: '/admin/controladoria/balanco', label: 'Balanço' },
  { to: '/admin/controladoria/fluxo-caixa', label: 'Fluxo de Caixa Gerencial' },
  { to: '/admin/controladoria/budget', label: 'Budget' },
  { to: '/admin/controladoria/forecast', label: 'Forecast' },
  { to: '/admin/controladoria/simulador', label: 'Simulações' },
  { to: '/admin/controladoria/kpis', label: 'KPIs' },
  { to: '/admin/controladoria/drivers', label: 'Drivers' },
  { to: '/admin/controladoria/materialidade', label: 'Materialidade' },
  { to: '/admin/controladoria/consolidacao', label: 'Consolidação' },
  { to: '/admin/controladoria/configuracoes', label: 'Configurações' },
]

const VERBAS_SUBMENU: SubItem[] = [
  { to: '/admin/verbas/cockpit', label: 'Cockpit' },
  { to: '/admin/verbas/acordos', label: 'Acordos' },
  { to: '/admin/verbas/conta-corrente', label: 'Conta Corrente' },
  { to: '/admin/verbas/movimentacoes', label: 'Movimentações' },
  { to: '/admin/verbas/apuracoes', label: 'Apurações' },
  { to: '/admin/verbas/apropriacoes', label: 'Apropriações' },
  { to: '/admin/verbas/consumos', label: 'Consumos' },
  { to: '/admin/verbas/liquidacoes', label: 'Liquidações' },
  { to: '/admin/verbas/relatorios', label: 'Relatórios' },
  { to: '/admin/verbas/configuracoes', label: 'Configurações' },
]

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Empresa',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'budgets', label: 'Orçamentos', icon: FileText },
      { id: 'services', label: 'Serviços', icon: Wrench },
      { id: 'chat', label: 'Chat', icon: MessageSquare },
      { to: '/admin/notificacoes', label: 'Notificações', icon: Bell },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { label: 'CRM', icon: Users, submenu: CRM_SUBMENU, permission: canViewSales },
      { id: 'partners', label: 'Clientes e Fornecedores', icon: Users },
      { label: 'Vendas', icon: ShoppingCart, submenu: SALES_SUBMENU, permission: canViewSales },
      { to: '/admin/produtos', label: 'Produtos', icon: Package },
      {
        to: '/admin/tabelas-precos',
        label: 'Tabela de Preços',
        icon: Table,
        permission: canViewPriceTables,
      },
      { id: 'contracts', label: 'Contratos', icon: FileSignature, permission: canViewSales },
    ],
  },
  {
    title: 'Suprimentos',
    items: [
      { id: 'purchasing', label: 'Compras', icon: Briefcase, permission: canViewPurchasing },
      { label: 'Estoque', icon: Boxes, submenu: STOCK_SUBMENU, permission: canViewStock },
      {
        to: '/admin/cadastros',
        label: 'Cadastros',
        icon: Database,
        permission: canViewConfiguracoes,
      },
    ],
  },
  {
    title: 'Operações',
    items: [
      {
        label: 'Industrial',
        icon: Factory,
        submenu: INDUSTRIAL_SUBMENU,
        permission: canViewIndustry,
      },
      { label: 'Logística', icon: Truck, submenu: LOGISTICS_SUBMENU, permission: canViewLogistics },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      {
        label: 'Financeiro',
        icon: Wallet,
        submenu: FINANCIAL_SUBMENU,
        permission: canViewFinancial,
      },
      { label: 'Fiscal', icon: FileText, submenu: FISCAL_SUBMENU, permission: canViewFiscal },
      {
        id: 'pricing',
        label: 'Custos e Precificação',
        icon: DollarSign,
        permission: canConsultCosts,
      },
      {
        label: 'Controladoria & Performance Empresarial',
        icon: Calculator,
        submenu: CONTROLADORIA_SUBMENU,
        permission: canViewControladoria,
      },
      {
        label: 'Verbas de Fornecedores',
        icon: HandCoins,
        submenu: VERBAS_SUBMENU,
        permission: canViewSA,
      },
    ],
  },
  {
    title: 'Gestão de Pessoas',
    items: [{ label: 'RH', icon: UserCog, submenu: RH_SUBMENU, permission: canViewRH }],
  },
  {
    title: 'Remuneração',
    items: [
      {
        to: '/admin/remuneracao',
        label: 'Remuneração Variável',
        icon: Coins,
        permission: canViewVR,
      },
    ],
  },
  {
    title: 'BI / Analytics',
    items: [
      {
        label: 'BI / Analytics',
        icon: BarChart3,
        submenu: [
          { to: '/admin/bi', label: 'Dashboard' },
          { to: '/admin/bi/cross-module', label: 'Visão Cruzada' },
          { to: '/admin/bi/sales', label: 'Analytics de Vendas' },
          { to: '/admin/bi/stock', label: 'Analytics de Estoque' },
          { to: '/admin/bi/financial', label: 'Analytics Financeiro' },
          { to: '/admin/bi/industrial', label: 'Analytics Industrial' },
          { to: '/admin/bi/saved-views', label: 'Relatórios Salvos' },
        ],
        permission: canViewBI,
      },
    ],
  },
  {
    title: 'Inteligência',
    items: [
      {
        label: 'Inteligência Artificial',
        icon: Brain,
        submenu: AI_SUBMENU,
        permission: canViewAiModule,
      },
    ],
  },
  {
    title: 'Administração',
    items: [
      { id: 'users', label: 'Usuários', icon: Settings, permission: canManageUsers },
      {
        to: '/admin/configuracoes/permissoes',
        label: 'Permissões',
        icon: Shield,
        permission: canManageUsers,
      },
      { id: 'cms', label: 'CMS', icon: Archive, permission: canManageCms },
      { id: 'audit', label: 'Auditoria', icon: Shield, permission: canViewAuditLogs },
      { id: 'backups', label: 'Backups', icon: Database, permission: canManageBackups },
      { id: 'ai', label: 'Treinamento IA', icon: Bot, permission: canManageAiTraining },
      {
        label: 'Configurações',
        icon: Cog,
        submenu: CONFIG_SUBMENU,
        permission: canViewConfiguracoes,
      },
    ],
  },
]

function getItemKey(item: FlatItem): string {
  return item.to || item.id || item.label
}

function StarToggle({ isPinned, onToggle }: { isPinned: boolean; onToggle: () => void }) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.stopPropagation()
          onToggle()
        }
      }}
      className="shrink-0 p-0.5 rounded transition-colors cursor-pointer"
      aria-label={isPinned ? 'Desafixar dos favoritos' : 'Fixar nos favoritos'}
    >
      <Star
        className={cn(
          'w-3.5 h-3.5',
          isPinned ? 'fill-amber-400 text-amber-400' : 'text-gray-300 hover:text-amber-400',
        )}
      />
    </span>
  )
}

function MenuBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function CollapsedBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  )
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  onNavigate,
  collapsed = false,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
  onNavigate?: () => void
  collapsed?: boolean
}) {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const { expanded: openMenus, toggle: toggleMenu } = useModuleSections(
    'admin-sidebar',
    user?.id as string,
  )
  const [searchOpen, setSearchOpen] = useState(false)
  const { history, recordVisit } = useMenuHistory(user?.id as string)
  const { favorites, toggleFavorite, isFavorite } = useMenuFavorites(user?.id as string)
  const badges = useMenuBadges(user?.id as string)

  const allFlatItems = useMemo<FlatItem[]>(() => {
    const items: FlatItem[] = []
    for (const section of SECTIONS) {
      for (const item of section.items) {
        if (item.permission && !item.permission(user?.role as string)) continue
        if (item.submenu) {
          for (const sub of item.submenu)
            items.push({ label: sub.label, to: sub.to, parentLabel: item.label, icon: item.icon })
        } else if (item.to) {
          items.push({ label: item.label, to: item.to, icon: item.icon })
        } else if (item.id) {
          items.push({ label: item.label, id: item.id, icon: item.icon })
        }
      }
    }
    return items
  }, [user?.role])

  const favoriteItems = useMemo<FlatItem[]>(
    () => allFlatItems.filter((item) => favorites.has(getItemKey(item))),
    [allFlatItems, favorites],
  )

  const filteredItems = useMemo<FlatItem[] | null>(() => {
    const q = search.trim().toLowerCase()
    if (!q) return null
    const matches = allFlatItems.filter((item) => item.label.toLowerCase().includes(q))
    matches.sort((a, b) => {
      const aKey = getItemKey(a)
      const bKey = getItemKey(b)
      const aFav = favorites.has(aKey) ? 1 : 0
      const bFav = favorites.has(bKey) ? 1 : 0
      if (bFav !== aFav) return bFav - aFav
      const aCount = history[aKey]?.count || 0
      const bCount = history[bKey]?.count || 0
      if (bCount !== aCount) return bCount - aCount
      const aLast = history[aKey]?.lastVisited || 0
      const bLast = history[bKey]?.lastVisited || 0
      return bLast - aLast
    })
    return matches
  }, [search, allFlatItems, history, favorites])

  useEffect(() => {
    setActiveIndex(0)
  }, [search])

  const handleTabChange = (tab: string) => {
    recordVisit(tab)
    onTabChange(tab)
  }

  const handleSearchItem = (item: FlatItem) => {
    recordVisit(getItemKey(item))
    if (item.id) onTabChange(item.id)
    onNavigate?.()
    setSearch('')
    setSearchOpen(false)
  }

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (!filteredItems || filteredItems.length === 0) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setSearch('')
      }
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % filteredItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filteredItems[activeIndex]
      if (item) handleSearchItem(item)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setSearch('')
    }
  }

  const renderSearchResults = (onClose?: () => void) => {
    if (!filteredItems) return null
    if (filteredItems.length === 0)
      return (
        <div className="px-3 py-8 text-center text-sm text-gray-400">Nenhuma tela encontrada</div>
      )
    return (
      <div className="flex flex-col gap-0.5">
        {filteredItems.map((item, idx) => {
          const isActive = idx === activeIndex
          const key = getItemKey(item)
          const visits = history[key]?.count || 0
          const pinned = favorites.has(key)
          if (item.to)
            return (
              <Link
                key={`${item.to}-${idx}`}
                to={item.to}
                onClick={() => {
                  recordVisit(item.to!)
                  onNavigate?.()
                  setSearch('')
                  onClose?.()
                }}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between',
                  isActive
                    ? 'bg-gray-100 text-[#005B2E]'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-[#005B2E]',
                )}
              >
                <span>
                  {item.parentLabel && (
                    <span className="text-xs text-gray-400 block">{item.parentLabel}</span>
                  )}
                  {item.label}
                </span>
                <div className="flex items-center gap-1">
                  <StarToggle isPinned={pinned} onToggle={() => toggleFavorite(key)} />
                  {visits > 0 && <span className="text-xs text-amber-500">★</span>}
                </div>
              </Link>
            )
          return (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => handleSearchItem(item)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left w-full flex items-center justify-between',
                isActive ? 'bg-[#005B2E] text-white' : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              <span>
                {item.parentLabel && (
                  <span className="text-xs text-gray-400 block">{item.parentLabel}</span>
                )}
                {item.label}
              </span>
              <div className="flex items-center gap-1">
                <StarToggle isPinned={pinned} onToggle={() => toggleFavorite(key)} />
                {visits > 0 && <span className="text-xs text-amber-400">★</span>}
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  const renderFavoriteItem = (fItem: FlatItem) => {
    const key = getItemKey(fItem)
    const Icon = fItem.icon!
    if (fItem.to)
      return (
        <Link
          key={key}
          to={fItem.to}
          onClick={() => {
            recordVisit(fItem.to!)
            onNavigate?.()
          }}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-[#005B2E] transition-colors group"
        >
          <Icon className="w-4 h-4" />
          <span className="flex-1">
            {fItem.parentLabel && (
              <span className="text-xs text-gray-400 block">{fItem.parentLabel}</span>
            )}
            {fItem.label}
          </span>
          <StarToggle isPinned={true} onToggle={() => toggleFavorite(key)} />
        </Link>
      )
    if (fItem.id)
      return (
        <button
          key={key}
          onClick={() => handleTabChange(fItem.id!)}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
            activeTab === fItem.id ? 'bg-[#005B2E] text-white' : 'text-gray-600 hover:bg-gray-100',
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="flex-1">{fItem.label}</span>
          <StarToggle isPinned={true} onToggle={() => toggleFavorite(key)} />
        </button>
      )
    return null
  }

  const renderCollapsedFavorite = (fItem: FlatItem) => {
    const key = getItemKey(fItem)
    const Icon = fItem.icon!
    const tooltipLabel = fItem.parentLabel ? `${fItem.parentLabel} — ${fItem.label}` : fItem.label
    if (fItem.to)
      return (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <Link
              to={fItem.to}
              onClick={() => {
                recordVisit(fItem.to!)
                onNavigate?.()
              }}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#005B2E] transition-colors"
            >
              <Icon className="w-4 h-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">{tooltipLabel}</TooltipContent>
        </Tooltip>
      )
    if (fItem.id)
      return (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleTabChange(fItem.id!)}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                activeTab === fItem.id
                  ? 'bg-[#005B2E] text-white'
                  : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              <Icon className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{tooltipLabel}</TooltipContent>
        </Tooltip>
      )
    return null
  }

  if (collapsed) {
    return (
      <nav className="flex flex-col items-center gap-1 p-2">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Buscar tela"
            >
              <Search className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="right" align="start" className="w-72 p-3">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                autoFocus
                type="text"
                placeholder="Buscar tela..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-8 pr-8 h-9 text-sm bg-gray-50 border-gray-200"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {renderSearchResults(() => setSearchOpen(false))}
            </div>
          </PopoverContent>
        </Popover>

        {favoriteItems.length > 0 && (
          <>
            <div className="h-px w-6 bg-gray-200 my-1" />
            {favoriteItems.map(renderCollapsedFavorite)}
          </>
        )}

        <div className="h-px w-6 bg-gray-200 my-1" />

        {SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col items-center gap-1">
            {section.items.map((item) => {
              if (item.permission && !item.permission(user?.role as string)) return null
              const Icon = item.icon

              if (item.submenu) {
                return (
                  <div key={item.label} className="relative group">
                    <button
                      onClick={() => toggleMenu(item.label)}
                      className={cn(
                        'relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                        openMenus.has(item.label)
                          ? 'bg-gray-100 text-[#005B2E]'
                          : 'text-gray-600 hover:bg-gray-100',
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <CollapsedBadge count={badges[item.label] || 0} />
                    </button>{' '}
                    <div
                      className={cn(
                        'absolute left-full ml-2 top-0 z-50 bg-white rounded-lg shadow-lg border p-1 min-w-[200px]',
                        openMenus.has(item.label) ? 'block' : 'hidden group-hover:block',
                      )}
                    >
                      <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">
                        {item.label}
                      </div>
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          onClick={() => {
                            recordVisit(sub.to)
                            onNavigate?.()
                          }}
                          className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-[#005B2E] transition-colors"
                        >
                          {sub.label}
                          <StarToggle
                            isPinned={isFavorite(sub.to)}
                            onToggle={() => toggleFavorite(sub.to)}
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }

              if (item.to) {
                return (
                  <Tooltip key={item.label}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.to}
                        onClick={() => {
                          recordVisit(item.to!)
                          onNavigate?.()
                        }}
                        className="relative flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-[#005B2E] transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <CollapsedBadge count={badges[item.label] || 0} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleTabChange(item.id!)}
                      className={cn(
                        'relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                        activeTab === item.id
                          ? 'bg-[#005B2E] text-white'
                          : 'text-gray-600 hover:bg-gray-100',
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <CollapsedBadge count={badges[item.id!] || 0} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            })}
          </div>
        ))}
      </nav>
    )
  }

  return (
    <nav className="flex flex-col gap-1 p-3">
      <div className="relative mb-2">
        <label htmlFor="sidebar-search" className="sr-only">
          Buscar tela
        </label>
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <Input
          id="sidebar-search"
          type="text"
          placeholder="Buscar tela..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-8 pr-8 h-9 text-sm bg-gray-50 border-gray-200"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Limpar busca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {filteredItems !== null ? (
        filteredItems.length > 0 ? (
          renderSearchResults()
        ) : (
          <div className="px-3 py-8 text-center text-sm text-gray-400">Nenhuma tela encontrada</div>
        )
      ) : (
        <>
          {favoriteItems.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                Favoritos
              </div>
              {favoriteItems.map(renderFavoriteItem)}
            </div>
          )}

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {section.title}
              </div>
              {section.items.map((item) => {
                if (item.permission && !item.permission(user?.role as string)) return null
                const Icon = item.icon

                if (item.submenu) {
                  const isOpen = openMenus.has(item.label)
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 flex items-center gap-2">
                          {item.label}
                          <MenuBadge count={badges[item.label] || 0} />
                        </span>
                        <ChevronDown
                          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
                        />
                      </button>
                      {isOpen && (
                        <div className="ml-7 flex flex-col gap-0.5 mt-0.5">
                          {item.submenu
                            .reduce<{ group: string; items: SubItem[] }[]>((acc, sub) => {
                              const g = sub.group || ''
                              const last = acc[acc.length - 1]
                              if (last && last.group === g) last.items.push(sub)
                              else acc.push({ group: g, items: [sub] })
                              return acc
                            }, [])
                            .map((grp, gi) => (
                              <div key={gi}>
                                {grp.group && (
                                  <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                                    {grp.group}
                                  </div>
                                )}
                                {grp.items.map((sub) => (
                                  <Link
                                    key={sub.to}
                                    to={sub.to}
                                    onClick={() => {
                                      recordVisit(sub.to)
                                      onNavigate?.()
                                    }}
                                    className="flex items-center justify-between px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-[#005B2E] transition-colors group"
                                  >
                                    <span>{sub.label}</span>
                                    <StarToggle
                                      isPinned={isFavorite(sub.to)}
                                      onToggle={() => toggleFavorite(sub.to)}
                                    />
                                  </Link>
                                ))}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )
                }

                if (item.to) {
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => {
                        recordVisit(item.to!)
                        onNavigate?.()
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-[#005B2E] transition-colors group"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="flex-1">{item.label}</span>
                      <MenuBadge count={badges[item.label] || 0} />
                      <StarToggle
                        isPinned={isFavorite(item.to!)}
                        onToggle={() => toggleFavorite(item.to!)}
                      />
                    </Link>
                  )
                }

                return (
                  <button
                    key={item.label}
                    onClick={() => handleTabChange(item.id!)}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                      activeTab === item.id
                        ? 'bg-[#005B2E] text-white'
                        : 'text-gray-600 hover:bg-gray-100',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="flex-1">{item.label}</span>
                    <MenuBadge count={badges[item.id!] || 0} />
                    <StarToggle
                      isPinned={isFavorite(item.id!)}
                      onToggle={() => toggleFavorite(item.id!)}
                    />
                  </button>
                )
              })}
            </div>
          ))}
        </>
      )}
    </nav>
  )
}
