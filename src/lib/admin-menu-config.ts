import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Tag,
  Users,
  DollarSign,
  Truck,
  Boxes,
  Factory,
  FileCheck,
  HeartPulse,
  BarChart3,
  Settings,
  Bell,
  TrendingUp,
  Layers,
  ShieldCheck,
  Headset,
  UserCog,
  HardHat,
  Percent,
  Calculator,
  FileSearch,
  PieChart,
  Handshake,
  Megaphone,
  CalendarClock,
  Container,
  ClipboardList,
  FileSpreadsheet,
  Sparkles,
  Inbox,
  Bot,
  UserCheck,
  type LucideIcon,
} from 'lucide-react'
import {
  canViewSales,
  canViewStock,
  canViewConfiguracoes,
  canViewPurchasing,
  canViewFiscal,
  canViewAiModule,
  canManageUsers,
  canManageCms,
  canManageAiTraining,
  canChangeAiSettings,
  canManageConfiguracoes,
  canManageIntegrations,
  canManageApis,
  canManageBackups,
  canManagePermissions,
  canManageSystemParams,
  canViewAuditLogs,
  canConsultCosts,
  canViewConformidade,
  canViewScreenDocs,
  canViewSegundoCerebro,
  canViewPlanilhasConvertidas,
  canViewPlanilhasTabelaMaeGr,
  canManageJetroOnline,
  canViewPlatformInfra,
  canViewReportSchedules,
} from '@/lib/permissions'
import { canViewFinancial } from '@/lib/financial-permissions'
import { canViewLogistics } from '@/lib/logistics-permissions'
import { canViewTransporte } from '@/lib/transporte-permissions'
import { canViewIndustry } from '@/lib/industrial-permissions'
import { canViewCRM } from '@/lib/crm-permissions'
import { canViewPriceTables } from '@/lib/price-table-permissions'
import { canViewRH, canViewRH as canViewDP } from '@/lib/rh-permissions'
import { canViewTradeMarketing } from '@/lib/trade-marketing-permissions'
import { canViewSA } from '@/lib/supplier-allowance-permissions'
import { canViewBI } from '@/lib/bi-permissions'
import { canViewControladoria } from '@/lib/controladoria-permissions'
import { canViewVR } from '@/lib/variable-remuneration-permissions'
import { canViewAtendimentoModule } from '@/lib/atendimento-permissions'

export interface MenuChild {
  label: string
  route: string
  icon?: LucideIcon
  perm?: (r: string | undefined) => boolean
}

export interface MenuEntry {
  label: string
  icon: LucideIcon
  route: string
  perm?: (r: string | undefined) => boolean
  children?: MenuChild[]
}

export interface MenuGroup {
  title: string
  items: MenuEntry[]
}

/**
 * Ordena alfabeticamente itens e seus respectivos submenus por nome exibido (label) em pt-BR.
 * Validação de integridade do menu administrativo.
 */
export function sortMenuItems(items: MenuEntry[]): MenuEntry[] {
  return [...items]
    .map((item) => {
      const sortedChildren = item.children
        ? [...item.children].sort((a, b) =>
            a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base', numeric: true }),
          )
        : undefined
      return {
        ...item,
        children: sortedChildren,
      }
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR', { sensitivity: 'base', numeric: true }))
}

/**
 * Ordena automaticamente todos os menus principais (grupos) em ordem alfabética por título,
 * e seus submenus/itens por label. Garante que novos menus criados futuramente herdem
 * o posicionamento alfabético automático.
 */
export function sortAdminMenu(groups: MenuGroup[]): MenuGroup[] {
  return [...groups]
    .map((group) => ({
      ...group,
      items: sortMenuItems(group.items),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base', numeric: true }))
}

const RAW_ADMIN_MENU: MenuGroup[] = [
  {
    title: 'Administração',
    items: [
      {
        label: 'Agendamento de Relatórios',
        icon: CalendarClock,
        route: '/admin/agendamento-relatorios',
        perm: canViewReportSchedules,
      },
      { label: 'Auditoria', icon: FileSearch, route: '/admin/auditoria', perm: canViewAuditLogs },
      {
        label: 'Central de Documentação Técnica',
        icon: FileText,
        route: '/admin/central-documentacao',
        perm: canViewScreenDocs,
      },
      {
        label: 'Usuários',
        icon: Users,
        route: '/admin/usuarios',
        perm: canManageUsers,
      },
      {
        label: 'Configurações do HURAM On-line',
        icon: Sparkles,
        route: '/admin/configuracoes/jetro-online',
        perm: canManageJetroOnline,
        children: [
          { label: 'Configurações Gerais', route: '/admin/configuracoes/jetro-online' },
          { label: 'Histórico de Conversas', route: '/admin/configuracoes/jetro-online/historico' },
          { label: 'Perguntas dos Usuários', route: '/admin/configuracoes/jetro-online/perguntas' },
          { label: 'Recursos do Assistente', route: '/admin/configuracoes/jetro-online/recursos' },
          {
            label: 'Relatórios de Utilização',
            route: '/admin/configuracoes/jetro-online/relatorios',
          },
          { label: 'Sugestões Inteligentes', route: '/admin/configuracoes/jetro-online/sugestoes' },
          { label: 'Tours Guiados', route: '/admin/configuracoes/jetro-online/tours' },
          { label: 'Universidade HURAM', route: '/admin/configuracoes/jetro-online/universidade' },
        ],
      },
      {
        label: 'Configurações',
        icon: Settings,
        route: '/admin/configuracoes',
        perm: canViewConfiguracoes,
        children: [
          { label: 'APIs', route: '/admin/configuracoes/apis', perm: canManageApis },
          { label: 'Backup', route: '/admin/configuracoes/backup', perm: canManageBackups },
          {
            label: 'Importação/Exportação',
            route: '/admin/configuracoes/importacao-exportacao',
            perm: canManageConfiguracoes,
          },
          {
            label: 'Integrações',
            route: '/admin/configuracoes/integracoes',
            perm: canManageIntegrations,
          },
          { label: 'Logs', route: '/admin/configuracoes/logs', perm: canViewAuditLogs },
          {
            label: 'Modelos de Documentos',
            route: '/admin/configuracoes/modelos-documentos',
            perm: canManageConfiguracoes,
          },
          {
            label: 'Modelos de Email',
            route: '/admin/configuracoes/modelos-email',
            perm: canManageConfiguracoes,
          },
          {
            label: 'Notificações',
            route: '/admin/configuracoes/notificacoes',
            perm: canManageConfiguracoes,
          },
          {
            label: 'Numerações',
            route: '/admin/configuracoes/numeracoes',
            perm: canManageConfiguracoes,
          },
          {
            label: 'Parâmetros',
            route: '/admin/configuracoes/parametros',
            perm: canManageSystemParams,
          },
          {
            label: 'Segurança',
            route: '/admin/configuracoes/seguranca',
            perm: canManageConfiguracoes,
          },
        ],
      },
      {
        label: 'Phase0 Foundation',
        icon: Layers,
        route: '/admin/phase0-foundation',
        perm: canViewPlatformInfra,
      },
      {
        label: 'Platform Layer',
        icon: Layers,
        route: '/admin/platform-layer',
        perm: canViewPlatformInfra,
      },
    ],
  },
  {
    title: 'Chamados / TI',
    items: [
      {
        label: 'Central de Chamados',
        icon: Inbox,
        route: '/admin/chamados/central',
      },
      {
        label: 'Meus Chamados',
        icon: FileText,
        route: '/admin/chamados/meus-chamados',
      },
      {
        label: 'Painel e SLA',
        icon: Clock,
        route: '/admin/chamados/painel-sla',
      },
    ],
  },
  {
    title: 'Comercial',
    items: [
      {
        label: 'Comercial',
        icon: ShoppingCart,
        route: '/admin/comercial',
        perm: canViewSales,
        children: [
          { label: 'Central Comercial', route: '/admin/comercial' },
          { label: 'Clientes', route: '/admin/comercial/clientes' },
          { label: 'Comissão Analítica', route: '/admin/comissao-analitica' },
          { label: 'Comissões', route: '/admin/comercial/comissoes' },
          {
            label: 'Consulta de Pedidos',
            route: '/admin/vendas/consulta-pedidos',
          },
          {
            label: 'Contratos e Devoluções',
            route: '/admin/comercial/contratos-devolucoes',
          },
          {
            label: 'Cotações e Cotador',
            route: '/admin/comercial/cotacoes-cotador',
          },
          { label: 'CRM', route: '/admin/comercial/crm' },
          {
            label: 'Pedidos e Faturamento',
            route: '/admin/comercial/pedidos-faturamento',
          },
          {
            label: 'Relatórios Comerciais',
            route: '/admin/comercial/relatorios',
          },
          {
            label: 'Remuneração Variável',
            route: '/admin/comercial/remuneracao-variavel',
          },
          {
            label: 'Tabelas de Preço e Descontos',
            route: '/admin/comercial/tabelas-preco-descontos',
          },
        ],
      },
      {
        label: 'Cadastros',
        icon: FileText,
        route: '/admin/cadastros',
        perm: canViewConfiguracoes,
        children: [
          { label: 'Bancos', route: '/admin/cadastros/bancos' },
          { label: 'Categorias', route: '/admin/cadastros/categorias' },
          { label: 'Centros de Custo', route: '/admin/cadastros/centros-custo' },
          { label: 'Clientes', route: '/admin/cadastros/clientes' },
          { label: 'Condições de Pagamento', route: '/admin/cadastros/condicoes-pagamento' },
          { label: 'Contas Bancárias', route: '/admin/cadastros/contas-bancarias' },
          { label: 'Empresas', route: '/admin/cadastros/empresas' },
          { label: 'Filiais', route: '/admin/cadastros/filiais' },
          { label: 'Formas de Pagamento', route: '/admin/cadastros/formas-pagamento' },
          { label: 'Fornecedores', route: '/admin/cadastros/fornecedores' },
          { label: 'Marcas', route: '/admin/cadastros/marcas' },
          { label: 'Perfis e Permissões', route: '/admin/cadastros/perfis-permissoes' },
          { label: 'Plano de Contas', route: '/admin/cadastros/plano-contas' },
          { label: 'Produtos', route: '/admin/cadastros/produtos' },
          { label: 'Representantes', route: '/admin/cadastros/representantes' },
          { label: 'Serviços', route: '/admin/cadastros/servicos' },
          { label: 'Subcategorias', route: '/admin/cadastros/subcategorias' },
          { label: 'Tabelas de Preços', route: '/admin/cadastros/tabelas-precos' },
          { label: 'Transportadoras', route: '/admin/cadastros/transportadoras' },
          { label: 'Unidades de Medida', route: '/admin/cadastros/unidades-medida' },
          { label: 'Usuários', route: '/admin/cadastros/usuarios' },
          { label: 'Vendedores', route: '/admin/cadastros/vendedores' },
        ],
      },
      {
        label: 'Precificação',
        icon: Calculator,
        route: '/admin/precificacao',
        perm: canConsultCosts,
        children: [
          { label: 'Aprovações', route: '/admin/precificacao/aprovacoes' },
          { label: 'Central de Preços', route: '/admin/precificacao/produtos' },
          { label: 'Cofre de Preços', route: '/admin/precificacao/cofre' },
          { label: 'Comparador de Custos', route: '/admin/precificacao/comparador' },
          { label: 'Dashboard', route: '/admin/precificacao/dashboard' },
          { label: 'Inteligência Comercial', route: '/admin/precificacao/inteligencia' },
          { label: 'Linha do Tempo', route: '/admin/precificacao/linha-tempo' },
          { label: 'Monitor de Riscos', route: '/admin/precificacao/riscos' },
          { label: 'Simulações', route: '/admin/precificacao/simulacoes' },
          { label: 'Sugestões IA', route: '/admin/precificacao/sugestoes-ia' },
          { label: 'Tabelas de Preços', route: '/admin/precificacao/tabelas' },
          { label: 'Versões', route: '/admin/precificacao/versoes' },
        ],
      },
      { label: 'Produtos', icon: Package, route: '/admin/produtos' },
      {
        label: 'Tabelas de Preços',
        icon: Tag,
        route: '/admin/tabelas-precos',
        perm: canViewPriceTables,
      },
    ],
  },
  {
    title: 'DP & RH',
    items: [
      {
        label: 'Conformidade',
        icon: ShieldCheck,
        route: '/admin/conformidade',
        perm: canViewConformidade,
      },
      {
        label: 'Departamento Pessoal',
        icon: UserCheck,
        route: '/admin/dp',
        perm: canViewDP,
        children: [
          { label: 'Colaboradores e Contratos', route: '/admin/dp/colaboradores-contratos' },
          { label: 'Férias e Afastamentos', route: '/admin/dp/ferias-afastamentos' },
          { label: 'Folha e Benefícios', route: '/admin/dp/folha-beneficios' },
          { label: 'Jornada e Ponto', route: '/admin/dp/jornada-ponto' },
          { label: 'Obrigações e eSocial', route: '/admin/dp/obrigacoes-esocial' },
          { label: 'Painel DP', route: '/admin/dp' },
        ],
      },
      {
        label: 'Recursos Humanos',
        icon: HeartPulse,
        route: '/admin/rh',
        perm: canViewRH,
        children: [
          { label: 'Aprovações RH', route: '/admin/rh/aprovacoes' },
          { label: 'Carreira e Desenvolvimento', route: '/admin/rh/carreira-desenvolvimento' },
          { label: 'Clima e Engajamento', route: '/admin/rh/clima-engajamento' },
          { label: 'Estrutura Organizacional', route: '/admin/rh/estrutura-organizacional' },
          { label: 'Gestão de Talentos', route: '/admin/rh/gestao-talentos' },
          { label: 'Jornada do Colaborador', route: '/admin/rh/jornada-colaborador' },
          { label: 'Painel RH', route: '/admin/rh' },
        ],
      },
      {
        label: 'SST',
        icon: HardHat,
        route: '/admin/sst',
        perm: canViewRH,
        children: [
          { label: 'Central de Conformidade SST', route: '/admin/sst/central-conformidade' },
          { label: 'Documentos e Obrigações', route: '/admin/sst/documentos-obrigacoes' },
          { label: 'EPIs e Treinamentos', route: '/admin/sst/epis-treinamentos' },
          { label: 'Gestão de Riscos e PGR (NR-1)', route: '/admin/sst/gestao-riscos-pgr' },
          { label: 'Painel SST', route: '/admin/sst' },
          { label: 'Relatórios SST', route: '/admin/sst/relatorios-sst' },
          { label: 'Saúde Ocupacional', route: '/admin/sst/saude-ocupacional' },
          { label: 'Segurança e Prevenção', route: '/admin/sst/seguranca-prevencao' },
        ],
      },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      {
        label: 'Financeiro',
        icon: DollarSign,
        route: '/admin/financeiro',
        perm: canViewFinancial,
        children: [
          {
            label: 'Bancos e Conciliação',
            route: '/admin/financeiro/bancos-conciliacao',
          },
          {
            label: 'Central Financeira',
            route: '/admin/financeiro',
          },
          {
            label: 'Configurações Financeiras',
            route: '/admin/financeiro/configuracoes-financeiras',
          },
          {
            label: 'Contas a Pagar e Tesouraria',
            route: '/admin/financeiro/contas-a-pagar-tesouraria',
          },
          {
            label: 'Contas a Receber e Cobrança',
            route: '/admin/financeiro/contas-a-receber-cobranca',
          },
          {
            label: 'Planejamento e Gestão',
            route: '/admin/financeiro/planejamento-gestao',
          },
        ],
      },
    ],
  },
  {
    title: 'Fiscal',
    items: [
      {
        label: 'Fiscal',
        icon: FileCheck,
        route: '/admin/fiscal',
        perm: canViewFiscal,
        children: [
          { label: 'Central Fiscal', route: '/admin/fiscal' },
          {
            label: 'Certificados e Configurações',
            route: '/admin/fiscal/certificados-configuracoes',
          },
          { label: 'Compras e Entradas', route: '/admin/fiscal/compras-entradas' },
          { label: 'Documentos Fiscais', route: '/admin/fiscal/documentos' },
          { label: 'Escrituração e Obrigações', route: '/admin/fiscal/escrituracao' },
          { label: 'Reforma Tributária', route: '/admin/fiscal/reforma' },
          { label: 'Relatórios Fiscais', route: '/admin/fiscal/relatorios' },
        ],
      },
    ],
  },
  {
    title: 'Inteligência',
    items: [
      {
        label: 'Inteligência',
        icon: BarChart3,
        route: '/admin/inteligencia',
        perm: canViewBI,
        children: [
          { label: 'Central de Inteligência', route: '/admin/inteligencia' },
          {
            label: 'Dashboards e Projeções',
            route: '/admin/inteligencia/dashboards-projecoes',
          },
          {
            label: 'Inteligência por Área',
            route: '/admin/inteligencia/por-area',
          },
          {
            label: 'Relatórios e Agendamentos',
            route: '/admin/inteligencia/relatorios',
          },
        ],
      },
      {
        label: 'Controladoria',
        icon: PieChart,
        route: '/admin/controladoria',
        perm: canViewControladoria,
        children: [
          {
            label: 'Configurações e Visões',
            route: '/admin/controladoria/configuracoes',
          },
          {
            label: 'DRE e Demonstrações',
            route: '/admin/controladoria',
          },
          {
            label: 'Fechamento e Consolidação',
            route: '/admin/controladoria/fechamento-consolidacao',
          },
          {
            label: 'Planejamento',
            route: '/admin/controladoria/planejamento',
          },
          {
            label: 'Simulador de Cenários',
            route: '/admin/controladoria/simulador',
          },
        ],
      },
      {
        label: 'IA',
        icon: Bot,
        route: '/admin/ia/assistente',
        perm: canViewAiModule,
        children: [
          {
            label: 'Agentes e Automações',
            route: '/admin/ia/agentes-automacoes',
            perm: canViewAiModule,
          },
          {
            label: 'Assistente de IA',
            route: '/admin/ia/assistente',
            perm: canViewAiModule,
          },
          {
            label: 'Base de Conhecimento',
            route: '/admin/ia/base-conhecimento',
            perm: canViewAiModule,
          },
          {
            label: 'Histórico e Aprovações',
            route: '/admin/ia/historico-aprovacoes',
            perm: canViewAiModule,
          },
        ],
      },
      {
        label: 'Remuneração Variável',
        icon: TrendingUp,
        route: '/admin/remuneracao',
        perm: canViewVR,
        children: [
          { label: 'Apuração', route: '/admin/remuneracao/apuracao' },
          { label: 'Aprovações', route: '/admin/remuneracao/aprovacoes' },
          { label: 'Campanhas', route: '/admin/remuneracao/campanhas' },
          { label: 'Comunicações de Metas', route: '/admin/remuneracao/metas-comunicacoes' },
          { label: 'Contestações', route: '/admin/remuneracao/contestacoes' },
          { label: 'Gestão de Metas', route: '/admin/remuneracao/metas-gestao' },
          { label: 'Histórico', route: '/admin/remuneracao/historico' },
          { label: 'Metas', route: '/admin/remuneracao/metas' },
          { label: 'Premiações', route: '/admin/remuneracao/metas-premiacoes' },
          { label: 'Ranking', route: '/admin/remuneracao/ranking' },
          { label: 'Regras', route: '/admin/remuneracao/regras' },
          { label: 'Simulador', route: '/admin/remuneracao/simulador' },
          { label: 'Visão do Vendedor', route: '/admin/remuneracao/metas-vendedor' },
        ],
      },
      {
        label: 'Segundo Cérebro da Empresa',
        icon: Bot,
        route: '/admin/segundo-cerebro',
        perm: canViewSegundoCerebro,
      },
    ],
  },
  {
    title: 'Operação',
    items: [
      {
        label: 'Estoque e WMS',
        icon: Boxes,
        route: '/admin/estoque',
        perm: canViewStock,
        children: [
          { label: 'Central de Estoque', route: '/admin/estoque' },
          { label: 'Inventário e Conferência', route: '/admin/estoque/inventario' },
          { label: 'Lotes e Validade', route: '/admin/estoque/lotes' },
          { label: 'Movimentações', route: '/admin/estoque/movimentacoes' },
          { label: 'WMS Gerencial', route: '/admin/estoque/wms-gerencial' },
          { label: 'WMS Operacional', route: '/admin/estoque/wms-operacional' },
        ],
      },
      {
        label: 'Indústria',
        icon: Factory,
        route: '/admin/industria',
        perm: canViewIndustry,
        children: [
          {
            label: 'Central Industrial',
            route: '/admin/industria',
          },
          {
            label: 'Custos e Eficiência',
            route: '/admin/industria/custos',
          },
          {
            label: 'Fichas Técnicas',
            route: '/admin/industria/fichas-tecnicas',
          },
          {
            label: 'Manutenção e Recursos',
            route: '/admin/industria/manutencao',
          },
          {
            label: 'Ordem de Produção',
            route: '/admin/industria/ordem-producao',
          },
          {
            label: 'Planejamento e Ordens',
            route: '/admin/industria/planejamento',
          },
          {
            label: 'Qualidade e Rastreabilidade',
            route: '/admin/industria/qualidade',
          },
        ],
      },
      {
        label: 'Logística e Transporte',
        icon: Truck,
        route: '/admin/logistica',
        perm: canViewLogistics,
        children: [
          { label: 'Central Logística', route: '/admin/logistica' },
          { label: 'Custos e Indicadores', route: '/admin/logistica/custos-indicadores' },
          { label: 'Distribuição e Entregas', route: '/admin/logistica/distribuicao-entregas' },
          { label: 'Frete e Tabelas', route: '/admin/logistica/frete-tabelas' },
          {
            label: 'Ocorrências e Rastreabilidade',
            route: '/admin/logistica/ocorrencias-rastreabilidade',
          },
          { label: 'Rotas e Roteirização', route: '/admin/logistica/rotas-roteirizacao' },
          { label: 'Transporte e Frota', route: '/admin/logistica/transporte-frota' },
        ],
      },
    ],
  },
  {
    title: 'Planilhas Convertidas',
    items: [
      {
        label: 'Planilhas Convertidas',
        icon: FileSpreadsheet,
        route: '/admin/planilhas/convertidas/comparativo-margens-gr',
        perm: canViewPlanilhasConvertidas,
        children: [
          {
            label: 'Comparativo Margens GR',
            route: '/admin/planilhas/convertidas/comparativo-margens-gr',
            icon: FileSpreadsheet,
            perm: canViewPlanilhasConvertidas,
          },
          {
            label: 'Tabela Mãe GR',
            route: '/admin/planilhas/convertidas/tabela-mae-gr',
            icon: FileSpreadsheet,
            perm: canViewPlanilhasTabelaMaeGr,
          },
        ],
      },
    ],
  },
  {
    title: 'Principal',
    items: [
      {
        label: 'Principal',
        icon: LayoutDashboard,
        route: '/admin',
        children: [
          {
            label: 'Atendimento',
            icon: Headset,
            route: '/admin/atendimento',
            perm: canViewAtendimentoModule,
          },
          { label: 'Dashboard', icon: LayoutDashboard, route: '/admin/dashboard' },
          { label: 'Notificações', icon: Bell, route: '/admin/notificacoes' },
          {
            label: 'Solicitações de Orçamento',
            icon: ClipboardList,
            route: '/admin/orcamentos',
          },
        ],
      },
    ],
  },
  {
    title: 'Marketing e Verbas',
    items: [
      {
        label: 'Marketing e Verbas',
        icon: Megaphone,
        route: '/admin/marketing',
        perm: (r) => canViewTradeMarketing(r) || canViewSA(r),
        children: [
          {
            label: 'Biblioteca e Templates',
            route: '/admin/marketing/biblioteca-templates',
          },
          {
            label: 'Central de Marketing',
            route: '/admin/marketing',
          },
          {
            label: 'Cotações Externas',
            route: '/admin/marketing/cotacoes-externas',
          },
          {
            label: 'Relatórios e Auditoria de Marketing',
            route: '/admin/marketing/relatorios-auditoria',
          },
          {
            label: 'Solicitações e Jobs',
            route: '/admin/marketing/solicitacoes-jobs',
          },
          {
            label: 'Trade Marketing',
            route: '/admin/marketing/trade-marketing',
          },
          {
            label: 'Verbas de Fornecedor',
            route: '/admin/marketing/verbas-fornecedor',
          },
        ],
      },
    ],
  },
]

export const ADMIN_MENU: MenuGroup[] = sortAdminMenu(RAW_ADMIN_MENU)
