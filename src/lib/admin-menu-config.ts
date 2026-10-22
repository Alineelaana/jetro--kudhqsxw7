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
import { canViewValidityAlerts } from '@/lib/validity-permissions'

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
            label: 'Dados da Empresa',
            route: '/admin/configuracoes/dados-empresa',
            perm: canManageConfiguracoes,
          },
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
          {
            label: 'SLA Chamados',
            route: '/admin/configuracoes/sla-chamados',
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
      {
        label: 'Validade e Vencimentos',
        icon: CalendarClock,
        route: '/admin/validade',
        perm: canViewValidityAlerts,
        children: [
          { label: 'Central de Alertas', route: '/admin/validade' },
          { label: 'Chat IA', route: '/admin/validade/chat' },
          { label: 'Dashboard', route: '/admin/validade/dashboard' },
          { label: 'Regras', route: '/admin/validade/regras' },
        ],
      },
    ],
  },
  {
    title: 'Chamados',
    items: [
      {
        label: 'Chamados',
        icon: Inbox,
        route: '/admin/chamados',
        children: [
          { label: 'Configuração de SLA', route: '/admin/chamados/sla' },
          { label: 'Meus Chamados', route: '/admin/chamados' },
          { label: 'Novo Chamado', route: '/admin/chamados/novo' },
          { label: 'Painel', route: '/admin/chamados/painel' },
        ],
      },
    ],
  },
  {
    title: 'Comercial',
    items: [
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
        label: 'CRM',
        icon: Users,
        route: '/admin/crm',
        perm: canViewCRM,
        children: [
          { label: 'Agenda', route: '/admin/crm/agenda' },
          { label: 'Atividades', route: '/admin/crm/atividades' },
          { label: 'Automação', route: '/admin/crm/automacao' },
          { label: 'Config. Funil', route: '/admin/crm/funil-config' },
          { label: 'Funil', route: '/admin/crm/funil' },
          { label: 'Histórico', route: '/admin/crm/historico' },
          { label: 'Leads', route: '/admin/crm/leads' },
          { label: 'Metas', route: '/admin/crm/metas' },
          { label: 'Motivos de Perda', route: '/admin/crm/motivos-perda' },
          { label: 'Oportunidades', route: '/admin/crm/oportunidades' },
          { label: 'Propostas', route: '/admin/crm/propostas' },
          { label: 'Relatórios', route: '/admin/crm/relatorios' },
        ],
      },
      {
        label: 'Marketing Enterprise',
        icon: Megaphone,
        route: '/admin/marketing',
        perm: canViewTradeMarketing,
        children: [
          { label: 'Aprovação de Peças', route: '/admin/marketing/aprovacao-pecas' },
          { label: 'Atribuição', route: '/admin/marketing/atribuicao' },
          { label: 'Biblioteca', route: '/admin/marketing/biblioteca' },
          { label: 'Brand', route: '/admin/marketing/brand' },
          { label: 'Calendário Editorial', route: '/admin/marketing/calendario' },
          { label: 'Cockpit', route: '/admin/marketing' },
          { label: 'Jobs', route: '/admin/marketing/jobs' },
          { label: 'Mídia', route: '/admin/marketing/midia' },
          { label: 'Solicitações', route: '/admin/marketing/solicitacoes' },
          { label: 'Templates', route: '/admin/marketing/templates' },
          { label: 'Trade Marketing', route: '/admin/trade-marketing' },
        ],
      },
      {
        label: 'Comissões',
        icon: Percent,
        route: '/admin/comissao-analitica',
        perm: canViewSales,
        children: [
          { label: 'Comissão Analítica', route: '/admin/comissao-analitica' },
          { label: 'Comissões MIX', route: '/admin/comissoes-mix' },
          { label: 'Descontos e Deduções', route: '/admin/descontos-deducoes' },
          { label: 'Premiações', route: '/admin/premiacoes' },
          { label: 'Regras de Comissão', route: '/admin/regras-comissao' },
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
      { label: 'Promoções', icon: Percent, route: '/admin/promocoes', perm: canViewSales },
      {
        label: 'Tabelas de Preços',
        icon: Tag,
        route: '/admin/tabelas-precos',
        perm: canViewPriceTables,
      },
      {
        label: 'Trade Marketing',
        icon: Megaphone,
        route: '/admin/trade-marketing',
        perm: canViewTradeMarketing,
        children: [
          { label: 'Ações', route: '/admin/trade-marketing/acoes' },
          { label: 'Aplicação em Produtos', route: '/admin/trade-marketing/aplicacao-produtos' },
          { label: 'Calendário', route: '/admin/trade-marketing/calendario' },
          { label: 'Conta Corrente', route: '/admin/trade-marketing/conta-corrente' },
          { label: 'Dashboard', route: '/admin/trade-marketing' },
          { label: 'Materiais', route: '/admin/trade-marketing/materiais' },
          { label: 'Planejamento Anual', route: '/admin/trade-marketing/planejamento-anual' },
          { label: 'Prestação de Contas', route: '/admin/trade-marketing/prestacao-contas' },
        ],
      },
      {
        label: 'Vendas',
        icon: ShoppingCart,
        route: '/admin/vendas',
        perm: canViewSales,
        children: [
          {
            label: 'Consulta de Pedidos',
            route: '/admin/vendas/consulta-pedidos',
            perm: canViewSales,
          },
          { label: 'Contratos', route: '/admin/vendas/contratos' },
          { label: 'Devoluções', route: '/admin/vendas/devolucoes' },
          { label: 'Faturamento', route: '/admin/vendas/faturamento' },
          { label: 'Histórico', route: '/admin/vendas/historico' },
          {
            label: 'Inserir Clientes',
            route: '/admin/vendas/inserir-clientes',
            perm: canViewSales,
          },
          { label: 'NFC-e', route: '/admin/vendas/nfce' },
          { label: 'NF-e', route: '/admin/vendas/nfe' },
          { label: 'Pedidos', route: '/admin/vendas/pedidos' },
        ],
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
          { label: 'Apuração', route: '/admin/fiscal/apuracao' },
          { label: 'Carta de Correção', route: '/admin/fiscal/correcao' },
          { label: 'Certificados', route: '/admin/fiscal/certificados' },
          { label: 'Configurações', route: '/admin/fiscal/configuracoes' },
          { label: 'CT-e', route: '/admin/fiscal/cte' },
          { label: 'Documentos', route: '/admin/fiscal/documentos' },
          { label: 'Entrada', route: '/admin/fiscal/entrada' },
          { label: 'Inutilização', route: '/admin/fiscal/inutilizacao' },
          { label: 'Livros', route: '/admin/fiscal/livros' },
          { label: 'Manifestação', route: '/admin/fiscal/manifestacao' },
          { label: 'MDF-e', route: '/admin/fiscal/mdfe' },
          { label: 'NFC-e', route: '/admin/fiscal/nfce' },
          { label: 'NF-e', route: '/admin/fiscal/nfe' },
          { label: 'NFS-e', route: '/admin/fiscal/nfse' },
          { label: 'Reforma Tributária', route: '/admin/fiscal/reforma-dashboard' },
          { label: 'Relatórios', route: '/admin/fiscal/relatorios' },
          { label: 'SPED', route: '/admin/fiscal/sped' },
        ],
      },
    ],
  },
  {
    title: 'Inteligência',
    items: [
      {
        label: 'BI',
        icon: BarChart3,
        route: '/admin/bi',
        perm: canViewBI,
        children: [
          { label: 'Central de Relatórios', route: '/admin/bi/report-center' },
          { label: 'Commercial', route: '/admin/bi/commercial' },
          { label: 'Cross-Module', route: '/admin/bi/cross-module' },
          { label: 'Dashboards Custom.', route: '/admin/bi/custom-dashboards' },
          { label: 'Estoque', route: '/admin/bi/stock' },
          { label: 'Executive', route: '/admin/bi/executive' },
          { label: 'Financeiro', route: '/admin/bi/financial' },
          { label: 'Industrial', route: '/admin/bi/industrial' },
          { label: 'Intel. Compras', route: '/admin/bi/purchasing-intel' },
          { label: 'Intel. CRM', route: '/admin/bi/crm-intel' },
          { label: 'Intel. Estoque', route: '/admin/bi/stock-intel' },
          { label: 'Intel. Financeira', route: '/admin/bi/financial-intel' },
          { label: 'Intel. Fiscal', route: '/admin/bi/fiscal-intel' },
          { label: 'Intel. Industrial', route: '/admin/bi/industrial-intel' },
          { label: 'Intel. Logística', route: '/admin/bi/logistics-intel' },
          { label: 'Intel. Manutenção', route: '/admin/bi/maintenance-intel' },
          { label: 'Intel. Qualidade', route: '/admin/bi/quality-intel' },
          { label: 'Intel. RH', route: '/admin/bi/rh-intel' },
          { label: 'Intel. Trade', route: '/admin/bi/trade-intel' },
          { label: 'Intel. VR', route: '/admin/bi/vr-intel' },
          { label: 'Projeção de Vendas', route: '/admin/bi/projection' },
          { label: 'Sales', route: '/admin/bi/sales' },
          { label: 'Views Salvas', route: '/admin/bi/saved-views' },
        ],
      },
      {
        label: 'Controladoria',
        icon: PieChart,
        route: '/admin/controladoria',
        perm: canViewControladoria,
        children: [
          { label: 'Balanço', route: '/admin/controladoria/balanco' },
          { label: 'Centros de Resultado', route: '/admin/controladoria/centros-resultado' },
          { label: 'Cockpit Executivo', route: '/admin/controladoria' },
          { label: 'Comentários', route: '/admin/controladoria/comentarios' },
          { label: 'Configurações', route: '/admin/controladoria/configuracoes' },
          { label: 'Consolidação', route: '/admin/controladoria/consolidacao' },
          { label: 'DRE', route: '/admin/controladoria/dre' },
          { label: 'DRE Analítica', route: '/admin/controladoria/dre-analitica' },
          { label: 'Drivers', route: '/admin/controladoria/drivers' },
          { label: 'EBITDA', route: '/admin/controladoria/ebitda' },
          { label: 'Fechamento Gerencial', route: '/admin/controladoria/fechamento' },
          { label: 'Fluxo de Caixa', route: '/admin/controladoria/fluxo-caixa' },
          { label: 'Forecast', route: '/admin/controladoria/forecast' },
          { label: 'KPIs Corporativos', route: '/admin/controladoria/kpis' },
          { label: 'Materialidade', route: '/admin/controladoria/materialidade' },
          { label: 'Orçado × Realizado', route: '/admin/controladoria/budget' },
          { label: 'Reclassificações', route: '/admin/controladoria/reclassificacoes' },
          { label: 'Simulador Corporativo', route: '/admin/controladoria/simulador' },
          { label: 'Visões Salvas', route: '/admin/controladoria/visoes-salvas' },
        ],
      },
      {
        label: 'Inteligência Artificial',
        icon: Bot,
        route: '/admin/ia/dashboard',
        perm: canViewAiModule,
        children: [
          { label: 'Agentes', route: '/admin/ia/agentes', perm: canViewAiModule },
          { label: 'Aprovações', route: '/admin/ia/aprovacoes', perm: canViewAiModule },
          { label: 'Assistente', route: '/admin/ia/assistente', perm: canViewAiModule },
          { label: 'Automações', route: '/admin/ia/automacoes', perm: canViewAiModule },
          {
            label: 'Base de Conhecimento',
            route: '/admin/ia/base-conhecimento',
            perm: canViewAiModule,
          },
          { label: 'Configurações', route: '/admin/ia/configuracoes', perm: canChangeAiSettings },
          { label: 'Fluxos', route: '/admin/ia/fluxos', perm: canViewAiModule },
          { label: 'Histórico', route: '/admin/ia/historico', perm: canViewAiModule },
          { label: 'Treinamento', route: '/admin/ia/treinamento', perm: canManageAiTraining },
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
        label: 'Estoque',
        icon: Boxes,
        route: '/admin/estoque',
        perm: canViewStock,
        children: [
          { label: 'Ajustes', route: '/admin/estoque/ajustes' },
          { label: 'Alertas WMS', route: '/admin/estoque/wms-alertas' },
          { label: 'Coletores', route: '/admin/estoque/wms-coletores' },
          { label: 'Conferência', route: '/admin/estoque/conferencia' },
          { label: 'Endereçamento', route: '/admin/estoque/enderecamento' },
          { label: 'Expedição', route: '/admin/estoque/expedicao' },
          { label: 'Gerencial WMS', route: '/admin/estoque/wms-managerial' },
          { label: 'Inventário', route: '/admin/estoque/inventario' },
          { label: 'Localizações', route: '/admin/estoque/localizacoes' },
          { label: 'Lotes', route: '/admin/estoque/lotes' },
          { label: 'Movimentações', route: '/admin/estoque/movimentacoes' },
          { label: 'Ondas', route: '/admin/estoque/ondas' },
          { label: 'Operadores', route: '/admin/estoque/wms-operadores' },
          { label: 'Pallets', route: '/admin/estoque/wms-pallets' },
          { label: 'Reabastecimento', route: '/admin/estoque/reabastecimento' },
          { label: 'Recebimento', route: '/admin/estoque/recebimento' },
          { label: 'Relatórios WMS', route: '/admin/estoque/wms-relatorios' },
          { label: 'Separação', route: '/admin/estoque/separacao' },
          { label: 'Transferências', route: '/admin/estoque/transferencias' },
          { label: 'Validade', route: '/admin/estoque/validade' },
          { label: 'Volumes', route: '/admin/estoque/wms-volumes' },
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
        label: 'Logística',
        icon: Truck,
        route: '/admin/logistica',
        perm: canViewLogistics,
        children: [
          { label: 'Central de Exceções', route: '/admin/logistica/excecoes' },
          { label: 'Coletas', route: '/admin/logistica/coletas' },
          { label: 'Devoluções/Reversa', route: '/admin/logistica/reversa' },
          { label: 'Indicadores', route: '/admin/logistica/indicadores' },
          { label: 'Planejamento Logístico', route: '/admin/logistica/planejamento' },
          { label: 'Relatórios', route: '/admin/logistica/relatorios' },
          { label: 'Romaneios', route: '/admin/logistica/romaneios' },
          { label: 'Transferências', route: '/admin/logistica/transferencias' },
        ],
      },
      {
        label: 'Transporte',
        icon: Container,
        route: '/admin/transporte',
        perm: canViewTransporte,
        children: [
          { label: 'App Motorista', route: '/admin/transporte/app-motorista' },
          { label: 'Comprovantes', route: '/admin/transporte/comprovantes' },
          { label: 'Custos', route: '/admin/transporte/custos' },
          { label: 'Dashboard', route: '/admin/transporte' },
          { label: 'Entregas', route: '/admin/transporte/entregas' },
          { label: 'Formação de Cargas', route: '/admin/transporte/cargas' },
          { label: 'Fretes', route: '/admin/transporte/fretes' },
          { label: 'Motoristas', route: '/admin/transporte/motoristas' },
          { label: 'Ocorrências', route: '/admin/transporte/ocorrencias' },
          { label: 'Rastreamento', route: '/admin/transporte/rastreamento' },
          { label: 'Relatórios', route: '/admin/transporte/relatorios' },
          { label: 'Rotas', route: '/admin/transporte/rotas' },
          { label: 'Roteirização', route: '/admin/transporte/roteirizacao' },
          { label: 'Tabelas de Frete', route: '/admin/transporte/tabelas-frete' },
          { label: 'Veículos', route: '/admin/transporte/veiculos' },
          { label: 'Viagens', route: '/admin/transporte/viagens' },
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
    title: 'Verbas',
    items: [
      {
        label: 'Verbas de Fornecedores',
        icon: Handshake,
        route: '/admin/verbas',
        perm: canViewSA,
        children: [
          { label: 'Aplicação em Produtos', route: '/admin/verbas/aplicacao-produtos' },
          { label: 'Apurações', route: '/admin/verbas/apuracoes' },
          { label: 'Auditoria Corporativa', route: '/admin/verbas/auditoria-corporativa' },
          { label: 'Cockpit', route: '/admin/verbas/cockpit' },
          { label: 'Consumos', route: '/admin/verbas/consumos' },
          { label: 'Conta Corrente', route: '/admin/verbas/conta-corrente' },
          { label: 'Contas Correntes', route: '/admin/verbas/contas-correntes' },
          { label: 'Cotações Externas', route: '/admin/verbas/cotacoes-externas' },
          { label: 'Créditos Avulsos', route: '/admin/verbas/creditos-avulsos' },
          { label: 'Documentos', route: '/admin/verbas/documentos' },
          { label: 'Gastos de Trade', route: '/admin/verbas/gastos-trade' },
          { label: 'Gestão de Acordos', route: '/admin/verbas/acordos' },
          { label: 'Movimentações', route: '/admin/verbas/movimentacoes' },
          { label: 'Prestação de Contas', route: '/admin/verbas/prestacao-contas' },
          { label: 'Verbas por Fornecedor', route: '/admin/verbas/por-fornecedor' },
          { label: 'Versionamento', route: '/admin/verbas/versionamento-relatorios' },
        ],
      },
    ],
  },
]

export const ADMIN_MENU: MenuGroup[] = sortAdminMenu(RAW_ADMIN_MENU)
