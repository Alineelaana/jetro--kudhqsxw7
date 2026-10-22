import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/error-boundary'
import { SettingsProvider } from '@/hooks/use-settings'
import { SystemParamsProvider } from '@/hooks/use-system-params'
import { AuthProvider } from '@/hooks/use-auth'
import { AuthorizationProvider } from '@/hooks/use-authorization'
import { ClientAuthProvider } from '@/hooks/use-client-auth'
import { CmsContentProvider } from '@/hooks/use-cms-content'
import { JetroOnlineProvider } from '@/hooks/use-jetro-online'
import { TourProvider } from '@/lib/tours/tour-context'
import { UserPreferencesProvider } from '@/hooks/use-user-preferences'
import { BrandProvider } from '@/hooks/use-brand'
import Layout from './components/Layout'

// Páginas de entrada essenciais
import LoginPage from './pages/Login'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'

// Guards e wrappers estáticos
import { JetroOnlineProtectedRoute } from '@/components/jetro-online-central/jetro-online-protected-route'
import { AiAdminProtectedRoute } from '@/components/ai-module/ai-admin-protected-route'
import { BiCenterWrapper } from '@/components/bi/bi-center-wrapper'
import { getMarketingIntelligence } from '@/services/marketing-bi'
import {
  INTEGRATIONS_CONFIG,
  EMAIL_TEMPLATE_CONFIG,
  DOC_TEMPLATE_CONFIG,
  NOTIFICATION_CONFIG,
  NUMERATION_CONFIG,
} from '@/lib/configuracoes-config'

// Lazy loading das telas e módulos do ERP para eliminar OOM durante vite build
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AdminRegister = lazy(() => import('./pages/AdminRegister'))
const AdminPasswordRecovery = lazy(() => import('./pages/AdminPasswordRecovery'))
const ClientLogin = lazy(() => import('./pages/ClientLogin'))
const ClientRegister = lazy(() => import('./pages/ClientRegister'))
const PasswordRecovery = lazy(() => import('./pages/PasswordRecovery'))
const ClientArea = lazy(() => import('./pages/ClientArea'))
const ClientTracking = lazy(() => import('./pages/ClientTracking'))
const ClientPasswordReset = lazy(() => import('./pages/ClientPasswordReset'))

// Páginas institucionais / de conformidade
const PoliticaPrivacidade = lazy(() => import('./pages/PoliticaPrivacidade'))
const PoliticaComercial = lazy(() => import('./pages/PoliticaComercial'))
const TermosDeUso = lazy(() => import('./pages/TermosDeUso'))
const PoliticaCookies = lazy(() => import('./pages/PoliticaCookies'))
const PoliticaSeguranca = lazy(() => import('./pages/PoliticaSeguranca'))
const CentralDePrivacidade = lazy(() => import('./pages/CentralDePrivacidade'))
const CanalDePrivacidade = lazy(() => import('./pages/CanalDePrivacidade'))
const PoliticaLicenciamento = lazy(() => import('./pages/PoliticaLicenciamento'))
const PoliticaSla = lazy(() => import('./pages/PoliticaSla'))
const PoliticaBackupContinuidade = lazy(() => import('./pages/PoliticaBackupContinuidade'))

// Vendas, Comissões, Produtos e Cadastros
const Products = lazy(() => import('./pages/Products'))
const Cadastros = lazy(() => import('./pages/Cadastros'))
const PriceTablesPage = lazy(() => import('./pages/PriceTablesPage'))
const CommissionRules = lazy(() => import('./pages/CommissionRules'))
const ComissaoAnaliticaPage = lazy(() => import('./pages/sales/ComissaoAnaliticaPage'))
const ComissoesMixPage = lazy(() => import('./pages/sales/ComissoesMixPage'))
const PremiacoesPage = lazy(() => import('./pages/sales/PremiacoesPage'))
const DescontosDeducoesPage = lazy(() => import('./pages/sales/DescontosDeducoesPage'))
const SalesDashboardPage = lazy(() => import('./pages/sales/SalesDashboardPage'))
const InserirClientesScreen = lazy(() =>
  import('@/components/vendas/inserir-clientes-screen').then((m) => ({
    default: m.InserirClientesScreen,
  })),
)
const SalesOrdersPage = lazy(() => import('./pages/sales/SalesOrdersPage'))
const SalesOrdersQueryPage = lazy(() => import('./pages/sales/SalesOrdersQueryPage'))
const InvoicingPage = lazy(() => import('./pages/sales/InvoicingPage'))
const NfePage = lazy(() => import('./pages/sales/NfePage'))
const NfcePage = lazy(() => import('./pages/sales/NfcePage'))
const ContractsPage = lazy(() => import('./pages/sales/ContractsPage'))
const SalesReturnsPage = lazy(() => import('./pages/sales/SalesReturnsPage'))
const SalesHistoryPage = lazy(() => import('./pages/sales/SalesHistoryPage'))

// Estoque e WMS
const StockPage = lazy(() => import('./pages/StockPage'))
const WmsScreen = lazy(() => import('./pages/WmsScreen'))

// Logística e Transporte
const Logistics = lazy(() => import('./pages/Logistics'))
const Transporte = lazy(() => import('./pages/Transporte'))

// Financeiro
const Financial = lazy(() => import('./pages/Financial'))
const CollectionCenterConfig = lazy(() => import('./pages/CollectionCenterConfig'))
const CollectionCenterCertification = lazy(() => import('./pages/CollectionCenterCertification'))

// RH e Conformidade
const RH = lazy(() => import('./pages/RH'))
const Conformidade = lazy(() => import('./pages/Conformidade'))

// Fiscal e CRM
const Fiscal = lazy(() => import('./pages/Fiscal'))
const CRM = lazy(() => import('./pages/CRM'))

// Notificações e Módulos Centrais
const Notifications = lazy(() => import('./pages/Notifications'))
const AIModule = lazy(() => import('./pages/AIModule'))
const Industry = lazy(() => import('./pages/Industry'))
const Phase0Foundation = lazy(() => import('./pages/Phase0Foundation'))
const PlatformLayer = lazy(() => import('./pages/PlatformLayer'))
const Blueprint = lazy(() => import('./pages/Blueprint'))
const VariableRemuneration = lazy(() => import('./pages/VariableRemuneration'))
const BI = lazy(() => import('./pages/BI'))
const Performance = lazy(() => import('./pages/Performance'))
const ValidityAlerts = lazy(() => import('./pages/ValidityAlerts'))
const BudgetRequestsPanel = lazy(() =>
  import('@/components/budget-requests-panel').then((m) => ({
    default: m.BudgetRequestsPanel,
  })),
)
const Atendimento = lazy(() => import('./pages/Atendimento'))
const DP = lazy(() => import('./pages/DP'))
const SST = lazy(() => import('./pages/SST'))
const Promotions = lazy(() => import('./pages/Promotions'))
const Precificacao = lazy(() => import('./pages/Precificacao'))
const Auditoria = lazy(() => import('./pages/Auditoria'))
const UsersAdminPage = lazy(() => import('./pages/UsersAdminPage'))
const ReportSchedulesPage = lazy(() => import('./pages/admin/ReportSchedulesPage'))
const CentralDocumentacaoPage = lazy(() => import('./pages/admin/CentralDocumentacaoPage'))
const SegundoCerebroPage = lazy(() => import('./pages/admin/SegundoCerebroPage'))
const ComparativoMargensGrPage = lazy(() => import('./pages/admin/ComparativoMargensGrPage'))
const TabelaMaeGrPage = lazy(() => import('./pages/admin/TabelaMaeGrPage'))
const Controladoria = lazy(() => import('./pages/Controladoria'))
const SupplierAllowance = lazy(() => import('./pages/SupplierAllowance'))
const TradeMarketing = lazy(() => import('./pages/TradeMarketing'))
const MarketingEnterprise = lazy(() => import('./pages/MarketingEnterprise'))

// Central de Chamados
const MeusChamadosScreen = lazy(() => import('@/components/chamados/meus-chamados-screen'))
const NovoChamadoScreen = lazy(() => import('@/components/chamados/novo-chamado-screen'))
const ChamadoDetalhesScreen = lazy(() => import('@/components/chamados/chamado-detalhes-screen'))
const ConfiguracaoSlaScreen = lazy(() => import('@/components/chamados/configuracao-sla-screen'))
const PainelChamadosScreen = lazy(() => import('@/components/chamados/painel-chamados-screen'))

// Telas de Configurações
const ConfiguracoesLayout = lazy(() =>
  import('@/components/configuracoes/configuracoes-layout').then((m) => ({
    default: m.ConfiguracoesLayout,
  })),
)
const EmpresaScreen = lazy(() =>
  import('@/components/configuracoes/empresa-screen').then((m) => ({
    default: m.EmpresaScreen,
  })),
)
const ParametrosScreen = lazy(() =>
  import('@/components/configuracoes/parametros-screen').then((m) => ({
    default: m.ParametrosScreen,
  })),
)
const ConfigCrudScreen = lazy(() =>
  import('@/components/configuracoes/config-crud-screen').then((m) => ({
    default: m.ConfigCrudScreen,
  })),
)
const LogsScreen = lazy(() =>
  import('@/components/configuracoes/logs-screen').then((m) => ({
    default: m.LogsScreen,
  })),
)
const ApisScreen = lazy(() =>
  import('@/components/configuracoes/apis-screen').then((m) => ({
    default: m.ApisScreen,
  })),
)
const ImportExportScreen = lazy(() =>
  import('@/components/configuracoes/import-export-screen').then((m) => ({
    default: m.ImportExportScreen,
  })),
)

const SegurancaScreen = lazy(() =>
  import('@/components/configuracoes/seguranca-screen').then((m) => ({
    default: m.SegurancaScreen,
  })),
)
const BackupScreen = lazy(() =>
  import('@/components/configuracoes/backup-screen').then((m) => ({
    default: m.BackupScreen,
  })),
)

// Jetro On-line central
const JetroOnlineLayout = lazy(() =>
  import('@/components/jetro-online-central/jetro-online-layout').then((m) => ({
    default: m.JetroOnlineLayout,
  })),
)
const JetroOnlineGeneralSettingsScreen = lazy(() =>
  import('@/components/jetro-online-central/jetro-online-general-settings').then((m) => ({
    default: m.JetroOnlineGeneralSettingsScreen,
  })),
)
const JetroOnlineUniversidadeScreen = lazy(() =>
  import('@/components/jetro-online-central/jetro-online-universidade').then((m) => ({
    default: m.JetroOnlineUniversidadeScreen,
  })),
)
const JetroOnlinePerguntasScreen = lazy(() =>
  import('@/components/jetro-online-central/jetro-online-perguntas').then((m) => ({
    default: m.JetroOnlinePerguntasScreen,
  })),
)
const JetroOnlineHistoricoScreen = lazy(() =>
  import('@/components/jetro-online-central/jetro-online-historico').then((m) => ({
    default: m.JetroOnlineHistoricoScreen,
  })),
)
const JetroOnlineSugestoesScreen = lazy(() =>
  import('@/components/jetro-online-central/jetro-online-sugestoes').then((m) => ({
    default: m.JetroOnlineSugestoesScreen,
  })),
)
const JetroOnlineRecursosScreen = lazy(() =>
  import('@/components/jetro-online-central/jetro-online-recursos').then((m) => ({
    default: m.JetroOnlineRecursosScreen,
  })),
)
const JetroOnlineToursScreen = lazy(() =>
  import('@/components/jetro-online-central/jetro-online-tours').then((m) => ({
    default: m.JetroOnlineToursScreen,
  })),
)
const JetroOnlineRelatoriosScreen = lazy(() =>
  import('@/components/jetro-online-central/jetro-online-relatorios').then((m) => ({
    default: m.JetroOnlineRelatoriosScreen,
  })),
)

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[40vh] w-full p-8">
    <div className="w-7 h-7 rounded-full border-2 border-[#063D30] border-t-transparent animate-spin" />
  </div>
)

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <TooltipProvider>
        <AuthProvider>
          <AuthorizationProvider>
            <SettingsProvider>
              <SystemParamsProvider>
                <ClientAuthProvider>
                  <CmsContentProvider>
                    <UserPreferencesProvider>
                      <BrandProvider>
                        <JetroOnlineProvider>
                          <TourProvider>
                            <Toaster />
                            <Sonner />
                            <Routes>
                              <Route element={<Layout />}>
                                <Route path="/" element={<LoginPage />} />
                                <Route path="/admin" element={<Admin />} />
                                <Route path="/admin/dashboard" element={<DashboardPage />} />
                                <Route path="/admin/orcamentos" element={<BudgetRequestsPanel />} />

                                {/* Central de Chamados Corporativa */}
                                <Route path="/admin/chamados" element={<MeusChamadosScreen />} />
                                <Route
                                  path="/admin/chamados/meus"
                                  element={<MeusChamadosScreen />}
                                />
                                <Route
                                  path="/admin/chamados/novo"
                                  element={<NovoChamadoScreen />}
                                />
                                <Route
                                  path="/admin/chamados/painel"
                                  element={<PainelChamadosScreen />}
                                />
                                <Route
                                  path="/admin/chamados/sla"
                                  element={<ConfiguracaoSlaScreen />}
                                />
                                <Route
                                  path="/admin/configuracoes/sla-chamados"
                                  element={<ConfiguracaoSlaScreen />}
                                />
                                <Route
                                  path="/admin/chamados/:id"
                                  element={<ChamadoDetalhesScreen />}
                                />

                                <Route path="/admin/produtos" element={<Products />} />
                                <Route
                                  path="/admin/cadastros"
                                  element={<Navigate to="/admin/cadastros/bancos" replace />}
                                />
                                <Route path="/admin/cadastros/:screen" element={<Cadastros />} />
                                <Route path="/admin/tabelas-precos" element={<PriceTablesPage />} />
                                <Route
                                  path="/admin/regras-comissao"
                                  element={<CommissionRules />}
                                />
                                <Route
                                  path="/admin/comissao-analitica"
                                  element={<ComissaoAnaliticaPage />}
                                />
                                <Route path="/admin/comissoes-mix" element={<ComissoesMixPage />} />
                                <Route path="/admin/premiacoes" element={<PremiacoesPage />} />
                                <Route
                                  path="/admin/descontos-deducoes"
                                  element={<DescontosDeducoesPage />}
                                />
                                <Route
                                  path="/admin/logistica"
                                  element={<Logistics screen="dashboard" />}
                                />
                                <Route
                                  path="/admin/logistica/rotas"
                                  element={<Logistics screen="routes" />}
                                />
                                <Route
                                  path="/admin/logistica/entregas"
                                  element={<Logistics screen="deliveries" />}
                                />
                                <Route
                                  path="/admin/logistica/veiculos"
                                  element={<Logistics screen="vehicles" />}
                                />
                                <Route
                                  path="/admin/logistica/motoristas"
                                  element={<Logistics screen="drivers" />}
                                />
                                <Route
                                  path="/admin/logistica/romaneios"
                                  element={<Logistics screen="romaneios" />}
                                />
                                <Route
                                  path="/admin/logistica/fretes"
                                  element={<Logistics screen="freights" />}
                                />
                                <Route
                                  path="/admin/logistica/tabelas-frete"
                                  element={<Logistics screen="freight_tables" />}
                                />
                                <Route
                                  path="/admin/logistica/rastreamento"
                                  element={<Logistics screen="tracking" />}
                                />
                                <Route
                                  path="/admin/logistica/ocorrencias"
                                  element={<Logistics screen="occurrences" />}
                                />
                                <Route
                                  path="/admin/logistica/comprovantes"
                                  element={<Logistics screen="proof" />}
                                />
                                <Route
                                  path="/admin/logistica/custos"
                                  element={<Logistics screen="costs" />}
                                />
                                <Route
                                  path="/admin/logistica/planejamento"
                                  element={<Logistics screen="orchestration_planning" />}
                                />
                                <Route
                                  path="/admin/logistica/indicadores"
                                  element={<Logistics screen="indicators" />}
                                />
                                <Route
                                  path="/admin/logistica/reversa"
                                  element={<Logistics screen="reverse_logistics" />}
                                />
                                <Route
                                  path="/admin/logistica/app-motorista"
                                  element={<Logistics screen="driver_app" />}
                                />
                                <Route
                                  path="/admin/logistica/relatorios"
                                  element={<Logistics screen="reports" />}
                                />
                                <Route
                                  path="/admin/logistica/transferencias"
                                  element={<Logistics screen="transfers" />}
                                />
                                <Route
                                  path="/admin/logistica/coletas"
                                  element={<Logistics screen="collections" />}
                                />
                                <Route
                                  path="/admin/logistica/excecoes"
                                  element={<Logistics screen="exceptions" />}
                                />
                                <Route
                                  path="/admin/transporte"
                                  element={<Transporte screen="dashboard" />}
                                />
                                <Route
                                  path="/admin/transporte/cargas"
                                  element={<Transporte screen="load_building" />}
                                />
                                <Route
                                  path="/admin/transporte/roteirizacao"
                                  element={<Transporte screen="routing" />}
                                />
                                <Route
                                  path="/admin/transporte/viagens"
                                  element={<Transporte screen="journeys" />}
                                />
                                <Route
                                  path="/admin/transporte/rotas"
                                  element={<Transporte screen="routes" />}
                                />
                                <Route
                                  path="/admin/transporte/entregas"
                                  element={<Transporte screen="deliveries" />}
                                />
                                <Route
                                  path="/admin/transporte/veiculos"
                                  element={<Transporte screen="vehicles" />}
                                />
                                <Route
                                  path="/admin/transporte/motoristas"
                                  element={<Transporte screen="drivers" />}
                                />
                                <Route
                                  path="/admin/transporte/fretes"
                                  element={<Transporte screen="freights" />}
                                />
                                <Route
                                  path="/admin/transporte/tabelas-frete"
                                  element={<Transporte screen="freight_tables" />}
                                />
                                <Route
                                  path="/admin/transporte/rastreamento"
                                  element={<Transporte screen="tracking" />}
                                />
                                <Route
                                  path="/admin/transporte/ocorrencias"
                                  element={<Transporte screen="occurrences" />}
                                />
                                <Route
                                  path="/admin/transporte/comprovantes"
                                  element={<Transporte screen="proof" />}
                                />
                                <Route
                                  path="/admin/transporte/custos"
                                  element={<Transporte screen="costs" />}
                                />
                                <Route
                                  path="/admin/transporte/app-motorista"
                                  element={<Transporte screen="driver_app" />}
                                />
                                <Route
                                  path="/admin/transporte/relatorios"
                                  element={<Transporte screen="reports" />}
                                />
                                <Route path="/admin/vendas" element={<SalesDashboardPage />} />
                                <Route
                                  path="/admin/vendas/inserir-clientes"
                                  element={<InserirClientesScreen />}
                                />
                                <Route path="/admin/vendas/pedidos" element={<SalesOrdersPage />} />
                                <Route
                                  path="/admin/vendas/consulta-pedidos"
                                  element={<SalesOrdersQueryPage />}
                                />
                                <Route
                                  path="/admin/vendas/faturamento"
                                  element={<InvoicingPage />}
                                />
                                <Route path="/admin/vendas/nfe" element={<NfePage />} />
                                <Route path="/admin/vendas/nfce" element={<NfcePage />} />
                                <Route path="/admin/vendas/contratos" element={<ContractsPage />} />
                                <Route
                                  path="/admin/vendas/devolucoes"
                                  element={<SalesReturnsPage />}
                                />
                                <Route
                                  path="/admin/vendas/historico"
                                  element={<SalesHistoryPage />}
                                />
                                <Route
                                  path="/admin/estoque"
                                  element={<StockPage screen="dashboard" />}
                                />
                                <Route
                                  path="/admin/estoque/movimentacoes"
                                  element={<StockPage screen="movements" />}
                                />
                                <Route
                                  path="/admin/estoque/inventario"
                                  element={<StockPage screen="inventory" />}
                                />
                                <Route
                                  path="/admin/estoque/transferencias"
                                  element={<StockPage screen="transfers" />}
                                />
                                <Route
                                  path="/admin/estoque/ajustes"
                                  element={<StockPage screen="adjustments" />}
                                />
                                <Route
                                  path="/admin/estoque/lotes"
                                  element={<StockPage screen="batches" />}
                                />
                                <Route
                                  path="/admin/estoque/validade"
                                  element={<StockPage screen="expiry" />}
                                />
                                <Route
                                  path="/admin/estoque/localizacoes"
                                  element={<StockPage screen="locations" />}
                                />
                                <Route
                                  path="/admin/estoque/separacao"
                                  element={<StockPage screen="picking" />}
                                />
                                <Route
                                  path="/admin/estoque/conferencia"
                                  element={<StockPage screen="checking" />}
                                />
                                <Route
                                  path="/admin/estoque/expedicao"
                                  element={<StockPage screen="expedition" />}
                                />
                                <Route
                                  path="/admin/estoque/recebimento"
                                  element={<StockPage screen="receiving" />}
                                />
                                <Route
                                  path="/admin/estoque/enderecamento"
                                  element={<StockPage screen="putaway" />}
                                />
                                <Route
                                  path="/admin/estoque/ondas"
                                  element={<StockPage screen="waves" />}
                                />
                                <Route
                                  path="/admin/estoque/reabastecimento"
                                  element={<StockPage screen="replenishment" />}
                                />
                                <Route
                                  path="/admin/estoque/wms-alertas"
                                  element={<WmsScreen screen="wms-alerts" />}
                                />
                                <Route
                                  path="/admin/estoque/wms-relatorios"
                                  element={<WmsScreen screen="wms-reports" />}
                                />
                                <Route
                                  path="/admin/estoque/wms-pallets"
                                  element={<WmsScreen screen="wms-pallets" />}
                                />
                                <Route
                                  path="/admin/estoque/wms-volumes"
                                  element={<WmsScreen screen="wms-volumes" />}
                                />
                                <Route
                                  path="/admin/estoque/wms-coletores"
                                  element={<WmsScreen screen="wms-collectors" />}
                                />
                                <Route
                                  path="/admin/estoque/wms-operadores"
                                  element={<WmsScreen screen="wms-operators" />}
                                />
                                <Route
                                  path="/admin/estoque/wms-managerial"
                                  element={<WmsScreen screen="wms-managerial" />}
                                />
                                {/* Central de Configurações do Jetro On-line */}
                                <Route
                                  path="/admin/configuracoes/jetro-online"
                                  element={
                                    <JetroOnlineProtectedRoute>
                                      <JetroOnlineLayout />
                                    </JetroOnlineProtectedRoute>
                                  }
                                >
                                  <Route index element={<JetroOnlineGeneralSettingsScreen />} />
                                  <Route
                                    path="universidade"
                                    element={<JetroOnlineUniversidadeScreen />}
                                  />
                                  <Route
                                    path="perguntas"
                                    element={<JetroOnlinePerguntasScreen />}
                                  />
                                  <Route
                                    path="historico"
                                    element={<JetroOnlineHistoricoScreen />}
                                  />
                                  <Route
                                    path="sugestoes"
                                    element={<JetroOnlineSugestoesScreen />}
                                  />
                                  <Route path="recursos" element={<JetroOnlineRecursosScreen />} />
                                  <Route path="tours" element={<JetroOnlineToursScreen />} />
                                  <Route
                                    path="relatorios"
                                    element={<JetroOnlineRelatoriosScreen />}
                                  />
                                </Route>

                                <Route
                                  path="/admin/configuracoes"
                                  element={<ConfiguracoesLayout />}
                                >
                                  <Route index element={<Navigate to="dados-empresa" replace />} />
                                  <Route path="dados-empresa" element={<EmpresaScreen />} />
                                  <Route path="parametros" element={<ParametrosScreen />} />
                                  <Route
                                    path="permissoes"
                                    element={
                                      <Navigate to="/admin/cadastros/perfis-permissoes" replace />
                                    }
                                  />
                                  <Route path="logs" element={<LogsScreen />} />
                                  <Route
                                    path="integracoes"
                                    element={<ConfigCrudScreen config={INTEGRATIONS_CONFIG} />}
                                  />
                                  <Route path="apis" element={<ApisScreen />} />
                                  <Route
                                    path="importacao-exportacao"
                                    element={<ImportExportScreen />}
                                  />
                                  <Route
                                    path="modelos-email"
                                    element={<ConfigCrudScreen config={EMAIL_TEMPLATE_CONFIG} />}
                                  />
                                  <Route
                                    path="modelos-documentos"
                                    element={<ConfigCrudScreen config={DOC_TEMPLATE_CONFIG} />}
                                  />
                                  <Route
                                    path="notificacoes"
                                    element={<ConfigCrudScreen config={NOTIFICATION_CONFIG} />}
                                  />
                                  <Route
                                    path="numeracoes"
                                    element={<ConfigCrudScreen config={NUMERATION_CONFIG} />}
                                  />
                                  <Route path="seguranca" element={<SegurancaScreen />} />
                                  <Route path="backup" element={<BackupScreen />} />
                                </Route>
                                {/* Módulo Financeiro (6 Telas Oficiais) */}
                                <Route
                                  path="/admin/financeiro"
                                  element={<Financial screen="central" />}
                                />
                                <Route
                                  path="/admin/financeiro/contas-a-receber-cobranca"
                                  element={<Financial screen="contas-a-receber-cobranca" />}
                                />
                                <Route
                                  path="/admin/financeiro/contas-a-pagar-tesouraria"
                                  element={<Financial screen="contas-a-pagar-tesouraria" />}
                                />
                                <Route
                                  path="/admin/financeiro/bancos-conciliacao"
                                  element={<Financial screen="bancos-conciliacao" />}
                                />
                                <Route
                                  path="/admin/financeiro/planejamento-gestao"
                                  element={<Financial screen="planejamento-gestao" />}
                                />
                                <Route
                                  path="/admin/financeiro/configuracoes-financeiras"
                                  element={<Financial screen="configuracoes-financeiras" />}
                                />

                                {/* Redirecionamentos de Rotas Antigas do Financeiro */}
                                <Route
                                  path="/admin/financeiro/contas-receber"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-receber-cobranca"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/boletos"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-receber-cobranca"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/cartoes"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-receber-cobranca"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/cheques"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-receber-cobranca"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/pix"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-receber-cobranca"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/cobrancas"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-receber-cobranca"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/cobranca-config"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-receber-cobranca"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/cobranca-certificacao"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-receber-cobranca"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/contas-pagar"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-pagar-tesouraria"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/tesouraria"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-pagar-tesouraria"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/caixa"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-pagar-tesouraria"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/movimentacoes"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-pagar-tesouraria"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/transferencias"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-pagar-tesouraria"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/aprovacoes"
                                  element={
                                    <Navigate
                                      to="/admin/financeiro/contas-a-pagar-tesouraria"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/conciliacao"
                                  element={
                                    <Navigate to="/admin/financeiro/bancos-conciliacao" replace />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/fluxo-caixa"
                                  element={
                                    <Navigate to="/admin/financeiro/planejamento-gestao" replace />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/fechamento"
                                  element={
                                    <Navigate to="/admin/financeiro/planejamento-gestao" replace />
                                  }
                                />
                                <Route
                                  path="/admin/financeiro/relatorios"
                                  element={
                                    <Navigate to="/admin/financeiro/planejamento-gestao" replace />
                                  }
                                />
                                {/* Módulo Recursos Humanos (7 Telas Oficiais) */}
                                <Route path="/admin/rh" element={<RH screen="painel" />} />
                                <Route
                                  path="/admin/rh/aprovacoes"
                                  element={<RH screen="aprovacoes" />}
                                />
                                <Route
                                  path="/admin/rh/carreira-desenvolvimento"
                                  element={<RH screen="carreira-desenvolvimento" />}
                                />
                                <Route
                                  path="/admin/rh/clima-engajamento"
                                  element={<RH screen="clima-engajamento" />}
                                />
                                <Route
                                  path="/admin/rh/estrutura-organizacional"
                                  element={<RH screen="estrutura-organizacional" />}
                                />
                                <Route
                                  path="/admin/rh/gestao-talentos"
                                  element={<RH screen="gestao-talentos" />}
                                />
                                <Route
                                  path="/admin/rh/jornada-colaborador"
                                  element={<RH screen="jornada-colaborador" />}
                                />

                                {/* Redirecionamentos de Rotas Antigas de RH */}
                                <Route
                                  path="/admin/rh/colaboradores"
                                  element={<Navigate to="/admin/rh/gestao-talentos" replace />}
                                />
                                <Route
                                  path="/admin/rh/cargos"
                                  element={
                                    <Navigate to="/admin/rh/estrutura-organizacional" replace />
                                  }
                                />
                                <Route
                                  path="/admin/rh/departamentos"
                                  element={
                                    <Navigate to="/admin/rh/estrutura-organizacional" replace />
                                  }
                                />
                                <Route
                                  path="/admin/rh/organograma"
                                  element={
                                    <Navigate to="/admin/rh/estrutura-organizacional" replace />
                                  }
                                />
                                <Route
                                  path="/admin/rh/posicoes"
                                  element={
                                    <Navigate to="/admin/rh/estrutura-organizacional" replace />
                                  }
                                />
                                <Route
                                  path="/admin/rh/carreira"
                                  element={
                                    <Navigate to="/admin/rh/carreira-desenvolvimento" replace />
                                  }
                                />
                                <Route
                                  path="/admin/rh/treinamentos"
                                  element={
                                    <Navigate to="/admin/rh/carreira-desenvolvimento" replace />
                                  }
                                />
                                <Route
                                  path="/admin/rh/pdi"
                                  element={
                                    <Navigate to="/admin/rh/carreira-desenvolvimento" replace />
                                  }
                                />
                                <Route
                                  path="/admin/rh/sucessao"
                                  element={
                                    <Navigate to="/admin/rh/carreira-desenvolvimento" replace />
                                  }
                                />
                                <Route
                                  path="/admin/rh/avaliacao-competencias"
                                  element={<Navigate to="/admin/rh/gestao-talentos" replace />}
                                />
                                <Route
                                  path="/admin/rh/competencias"
                                  element={<Navigate to="/admin/rh/gestao-talentos" replace />}
                                />
                                <Route
                                  path="/admin/rh/nine-box"
                                  element={<Navigate to="/admin/rh/gestao-talentos" replace />}
                                />
                                <Route
                                  path="/admin/rh/talent-review"
                                  element={<Navigate to="/admin/rh/gestao-talentos" replace />}
                                />
                                <Route
                                  path="/admin/rh/calibracao"
                                  element={<Navigate to="/admin/rh/gestao-talentos" replace />}
                                />
                                <Route
                                  path="/admin/rh/clima"
                                  element={<Navigate to="/admin/rh/clima-engajamento" replace />}
                                />
                                <Route
                                  path="/admin/rh/engajamento"
                                  element={<Navigate to="/admin/rh/clima-engajamento" replace />}
                                />
                                <Route
                                  path="/admin/rh/feedback"
                                  element={<Navigate to="/admin/rh/clima-engajamento" replace />}
                                />
                                <Route
                                  path="/admin/rh/reconhecimento"
                                  element={<Navigate to="/admin/rh/clima-engajamento" replace />}
                                />
                                <Route
                                  path="/admin/rh/onboarding"
                                  element={<Navigate to="/admin/rh/jornada-colaborador" replace />}
                                />
                                <Route
                                  path="/admin/rh/offboarding"
                                  element={<Navigate to="/admin/rh/jornada-colaborador" replace />}
                                />
                                <Route
                                  path="/admin/rh/documentos"
                                  element={<Navigate to="/admin/rh/jornada-colaborador" replace />}
                                />
                                <Route
                                  path="/admin/rh/cockpit"
                                  element={<Navigate to="/admin/rh" replace />}
                                />
                                <Route
                                  path="/admin/rh/ponto"
                                  element={<Navigate to="/admin/dp/jornada-ponto" replace />}
                                />
                                <Route
                                  path="/admin/rh/ferias"
                                  element={<Navigate to="/admin/dp/ferias-afastamentos" replace />}
                                />
                                <Route
                                  path="/admin/rh/folha"
                                  element={<Navigate to="/admin/dp/folha-beneficios" replace />}
                                />
                                <Route
                                  path="/admin/rh/beneficios"
                                  element={<Navigate to="/admin/dp/folha-beneficios" replace />}
                                />
                                <Route
                                  path="/admin/rh/relatorios"
                                  element={<Navigate to="/admin/rh" replace />}
                                />
                                <Route
                                  path="/admin/rh/adapta"
                                  element={
                                    <Navigate to="/admin/configuracoes/jetro-online" replace />
                                  }
                                />
                                <Route path="/admin/conformidade" element={<Conformidade />} />
                                <Route
                                  path="/admin/fiscal"
                                  element={<Fiscal screen="dashboard" />}
                                />
                                <Route
                                  path="/admin/fiscal/entrada"
                                  element={<Fiscal screen="entrada" />}
                                />
                                <Route path="/admin/fiscal/nfe" element={<Fiscal screen="nfe" />} />
                                <Route
                                  path="/admin/fiscal/nfse"
                                  element={<Fiscal screen="nfse" />}
                                />
                                <Route
                                  path="/admin/fiscal/nfce"
                                  element={<Fiscal screen="nfce" />}
                                />
                                <Route path="/admin/fiscal/cte" element={<Fiscal screen="cte" />} />
                                <Route
                                  path="/admin/fiscal/mdfe"
                                  element={<Fiscal screen="mdfe" />}
                                />
                                <Route
                                  path="/admin/fiscal/apuracao"
                                  element={<Fiscal screen="apuracao" />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-dashboard"
                                  element={<Fiscal screen="reforma_dashboard" />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-cbs-ibs"
                                  element={<Fiscal screen="reforma_cbs_ibs" />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-seletivo"
                                  element={<Fiscal screen="reforma_seletivo" />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-classificacao"
                                  element={<Fiscal screen="reforma_classificacao" />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-regras"
                                  element={<Fiscal screen="reforma_regras" />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-transicao"
                                  element={<Fiscal screen="reforma_transicao" />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-creditos"
                                  element={<Fiscal screen="reforma_creditos" />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-simulador"
                                  element={<Fiscal screen="reforma_simulador" />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-validacao"
                                  element={<Fiscal screen="reforma_validacao" />}
                                />
                                <Route
                                  path="/admin/fiscal/sped"
                                  element={<Fiscal screen="sped" />}
                                />
                                <Route
                                  path="/admin/fiscal/livros"
                                  element={<Fiscal screen="livros" />}
                                />
                                <Route
                                  path="/admin/fiscal/correcao"
                                  element={<Fiscal screen="correcao" />}
                                />
                                <Route
                                  path="/admin/fiscal/manifestacao"
                                  element={<Fiscal screen="manifestacao" />}
                                />
                                <Route
                                  path="/admin/fiscal/documentos"
                                  element={<Fiscal screen="documentos" />}
                                />
                                <Route
                                  path="/admin/fiscal/inutilizacao"
                                  element={<Fiscal screen="inutilizacao" />}
                                />
                                <Route
                                  path="/admin/fiscal/certificados"
                                  element={<Fiscal screen="certificados" />}
                                />
                                <Route
                                  path="/admin/fiscal/configuracoes"
                                  element={<Fiscal screen="configuracoes" />}
                                />
                                <Route
                                  path="/admin/fiscal/relatorios"
                                  element={<Fiscal screen="relatorios" />}
                                />
                                <Route path="/admin/crm" element={<CRM screen="dashboard" />} />
                                <Route path="/admin/crm/leads" element={<CRM screen="leads" />} />
                                <Route
                                  path="/admin/crm/oportunidades"
                                  element={<CRM screen="oportunidades" />}
                                />
                                <Route path="/admin/crm/funil" element={<CRM screen="funil" />} />
                                <Route
                                  path="/admin/crm/funil-config"
                                  element={<CRM screen="funil-config" />}
                                />
                                <Route path="/admin/crm/agenda" element={<CRM screen="agenda" />} />
                                <Route
                                  path="/admin/crm/propostas"
                                  element={<CRM screen="propostas" />}
                                />
                                <Route
                                  path="/admin/crm/historico"
                                  element={<CRM screen="historico" />}
                                />
                                <Route
                                  path="/admin/crm/atividades"
                                  element={<CRM screen="atividades" />}
                                />
                                <Route
                                  path="/admin/crm/motivos-perda"
                                  element={<CRM screen="motivos-perda" />}
                                />
                                <Route path="/admin/crm/metas" element={<CRM screen="metas" />} />
                                <Route
                                  path="/admin/crm/automacao"
                                  element={<CRM screen="automacao" />}
                                />
                                <Route
                                  path="/admin/crm/relatorios"
                                  element={<CRM screen="relatorios" />}
                                />
                                <Route path="/admin/notificacoes" element={<Notifications />} />
                                <Route
                                  path="/admin/ia/dashboard"
                                  element={<AIModule screen="dashboard" />}
                                />
                                <Route
                                  path="/admin/ia/assistente"
                                  element={<AIModule screen="assistant" />}
                                />
                                <Route
                                  path="/admin/ia/agentes"
                                  element={<AIModule screen="agents" />}
                                />
                                <Route
                                  path="/admin/ia/automacoes"
                                  element={<AIModule screen="automations" />}
                                />
                                <Route
                                  path="/admin/ia/fluxos"
                                  element={<AIModule screen="flows" />}
                                />
                                <Route
                                  path="/admin/ia/base-conhecimento"
                                  element={<AIModule screen="knowledge" />}
                                />
                                <Route
                                  path="/admin/ia/treinamento"
                                  element={
                                    <AiAdminProtectedRoute>
                                      <AIModule screen="training" />
                                    </AiAdminProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/admin/ia/historico"
                                  element={<AIModule screen="history" />}
                                />
                                <Route
                                  path="/admin/ia/aprovacoes"
                                  element={<AIModule screen="approvals" />}
                                />
                                <Route
                                  path="/admin/ia/configuracoes"
                                  element={
                                    <AiAdminProtectedRoute>
                                      <AIModule screen="settings" />
                                    </AiAdminProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/admin/governanca-adapta"
                                  element={
                                    <Navigate to="/admin/configuracoes/jetro-online" replace />
                                  }
                                />
                                {/* Módulo Indústria e Produção (7 Telas Oficiais) */}
                                <Route path="/admin/industria/*" element={<Industry />} />

                                {/* Redirecionamentos de Rotas Industriais Antigas */}
                                <Route
                                  path="/admin/industria/executivo"
                                  element={<Navigate to="/admin/industria" replace />}
                                />
                                <Route
                                  path="/admin/industria/cockpit"
                                  element={<Navigate to="/admin/industria" replace />}
                                />
                                <Route
                                  path="/admin/industria/intelligence"
                                  element={<Navigate to="/admin/industria" replace />}
                                />
                                <Route
                                  path="/admin/industria/kpis"
                                  element={<Navigate to="/admin/industria" replace />}
                                />
                                <Route
                                  path="/admin/industria/dashboard"
                                  element={<Navigate to="/admin/industria" replace />}
                                />
                                <Route
                                  path="/admin/industria/catalogo"
                                  element={
                                    <Navigate to="/admin/industria/fichas-tecnicas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/industria/especificacoes"
                                  element={
                                    <Navigate to="/admin/industria/fichas-tecnicas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/industria/conversoes"
                                  element={
                                    <Navigate to="/admin/industria/fichas-tecnicas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/industria/bom"
                                  element={
                                    <Navigate to="/admin/industria/fichas-tecnicas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/industria/engenharia-bom"
                                  element={
                                    <Navigate to="/admin/industria/fichas-tecnicas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/industria/formulacoes"
                                  element={
                                    <Navigate to="/admin/industria/fichas-tecnicas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/industria/engenharia"
                                  element={
                                    <Navigate to="/admin/industria/fichas-tecnicas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/industria/roteiros"
                                  element={
                                    <Navigate to="/admin/industria/fichas-tecnicas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/industria/plano-mestre"
                                  element={<Navigate to="/admin/industria/planejamento" replace />}
                                />
                                <Route
                                  path="/admin/industria/aps"
                                  element={<Navigate to="/admin/industria/planejamento" replace />}
                                />
                                <Route
                                  path="/admin/industria/capacidade"
                                  element={<Navigate to="/admin/industria/planejamento" replace />}
                                />
                                <Route
                                  path="/admin/industria/ordens-producao"
                                  element={
                                    <Navigate to="/admin/industria/ordem-producao" replace />
                                  }
                                />
                                <Route
                                  path="/admin/industria/execucao"
                                  element={
                                    <Navigate to="/admin/industria/ordem-producao" replace />
                                  }
                                />
                                <Route
                                  path="/admin/industria/fases"
                                  element={
                                    <Navigate to="/admin/industria/ordem-producao" replace />
                                  }
                                />
                                <Route
                                  path="/admin/industria/rastreabilidade"
                                  element={<Navigate to="/admin/industria/qualidade" replace />}
                                />
                                <Route
                                  path="/admin/industria/recursos"
                                  element={<Navigate to="/admin/industria/manutencao" replace />}
                                />
                                <Route
                                  path="/admin/industria/calibracao"
                                  element={<Navigate to="/admin/industria/manutencao" replace />}
                                />
                                <Route
                                  path="/admin/industria/adapta"
                                  element={
                                    <Navigate to="/admin/configuracoes/jetro-online" replace />
                                  }
                                />
                                <Route
                                  path="/admin/phase0-foundation"
                                  element={<Phase0Foundation />}
                                />
                                <Route path="/admin/platform-layer" element={<PlatformLayer />} />
                                <Route path="/admin/blueprint" element={<Blueprint />} />
                                <Route path="/admin/cadastro" element={<AdminRegister />} />
                                <Route
                                  path="/admin/recuperar-senha"
                                  element={<AdminPasswordRecovery />}
                                />
                                <Route
                                  path="/admin/remuneracao"
                                  element={<VariableRemuneration screen="dashboard" />}
                                />
                                <Route
                                  path="/admin/remuneracao/regras"
                                  element={<VariableRemuneration screen="rules" />}
                                />
                                <Route
                                  path="/admin/remuneracao/apuracao"
                                  element={<VariableRemuneration screen="apuration" />}
                                />
                                <Route
                                  path="/admin/remuneracao/simulador"
                                  element={<VariableRemuneration screen="simulator" />}
                                />
                                <Route
                                  path="/admin/remuneracao/aprovacoes"
                                  element={<VariableRemuneration screen="approvals" />}
                                />
                                <Route
                                  path="/admin/remuneracao/historico"
                                  element={<VariableRemuneration screen="history" />}
                                />
                                <Route
                                  path="/admin/remuneracao/contestacoes"
                                  element={<VariableRemuneration screen="contests" />}
                                />
                                <Route
                                  path="/admin/remuneracao/campanhas"
                                  element={<VariableRemuneration screen="campaigns" />}
                                />
                                <Route
                                  path="/admin/remuneracao/ranking"
                                  element={<VariableRemuneration screen="ranking" />}
                                />
                                <Route
                                  path="/admin/remuneracao/metas"
                                  element={<VariableRemuneration screen="goals" />}
                                />
                                <Route
                                  path="/admin/remuneracao/metas-gestao"
                                  element={<VariableRemuneration screen="goals-management" />}
                                />
                                <Route
                                  path="/admin/remuneracao/metas-premiacoes"
                                  element={<VariableRemuneration screen="goals-awards" />}
                                />
                                <Route
                                  path="/admin/remuneracao/metas-comunicacoes"
                                  element={<VariableRemuneration screen="goals-communications" />}
                                />
                                <Route
                                  path="/admin/remuneracao/metas-vendedor"
                                  element={<VariableRemuneration screen="goals-seller" />}
                                />
                                <Route path="/admin/bi" element={<BI screen="dashboard" />} />
                                <Route
                                  path="/admin/bi/executive"
                                  element={<BI screen="executive" />}
                                />
                                <Route
                                  path="/admin/bi/commercial"
                                  element={<BI screen="commercial" />}
                                />
                                <Route
                                  path="/admin/bi/financial-intel"
                                  element={<BI screen="financial-intel" />}
                                />
                                <Route
                                  path="/admin/bi/industrial-intel"
                                  element={<BI screen="industrial-intel" />}
                                />
                                <Route
                                  path="/admin/bi/logistics-intel"
                                  element={<BI screen="logistics-intel" />}
                                />
                                <Route
                                  path="/admin/bi/stock-intel"
                                  element={<BI screen="stock-intel" />}
                                />
                                <Route
                                  path="/admin/bi/fiscal-intel"
                                  element={<BI screen="fiscal-intel" />}
                                />
                                <Route
                                  path="/admin/bi/purchasing-intel"
                                  element={<BI screen="purchasing-intel" />}
                                />
                                <Route
                                  path="/admin/bi/crm-intel"
                                  element={<BI screen="crm-intel" />}
                                />
                                <Route
                                  path="/admin/bi/trade-intel"
                                  element={<BI screen="trade-intel" />}
                                />
                                <Route
                                  path="/admin/bi/rh-intel"
                                  element={<BI screen="rh-intel" />}
                                />
                                <Route
                                  path="/admin/bi/quality-intel"
                                  element={<BI screen="quality-intel" />}
                                />
                                <Route
                                  path="/admin/bi/maintenance-intel"
                                  element={<BI screen="maintenance-intel" />}
                                />
                                <Route
                                  path="/admin/bi/vr-intel"
                                  element={<BI screen="vr-intel" />}
                                />
                                <Route
                                  path="/admin/bi/custom-dashboards"
                                  element={<BI screen="custom-dashboards" />}
                                />
                                <Route
                                  path="/admin/bi/ai-adapta"
                                  element={
                                    <Navigate to="/admin/configuracoes/jetro-online" replace />
                                  }
                                />
                                <Route
                                  path="/admin/bi/cross-module"
                                  element={<BI screen="cross-module" />}
                                />
                                <Route
                                  path="/admin/bi/projection"
                                  element={<BI screen="projection" />}
                                />
                                <Route path="/admin/bi/sales" element={<BI screen="sales" />} />
                                <Route path="/admin/bi/stock" element={<BI screen="stock" />} />
                                <Route
                                  path="/admin/bi/financial"
                                  element={<BI screen="financial" />}
                                />
                                <Route
                                  path="/admin/bi/industrial"
                                  element={<BI screen="industrial" />}
                                />
                                <Route
                                  path="/admin/bi/saved-views"
                                  element={<BI screen="saved-views" />}
                                />
                                <Route
                                  path="/admin/bi/marketing-intel"
                                  element={
                                    <BiCenterWrapper
                                      title="Inteligência de Marketing"
                                      description="Indicadores de marketing enterprise"
                                      loadFunction={getMarketingIntelligence}
                                      realtimeCollection="mk_requests"
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/bi/report-center"
                                  element={<BI screen="report-center" />}
                                />
                                <Route
                                  path="/admin/performance"
                                  element={<Performance screen="dashboard" />}
                                />
                                <Route
                                  path="/admin/performance/comercial"
                                  element={<Performance screen="comercial" />}
                                />
                                <Route
                                  path="/admin/performance/financeiro"
                                  element={<Performance screen="financeiro" />}
                                />
                                <Route
                                  path="/admin/performance/fiscal"
                                  element={<Performance screen="fiscal" />}
                                />
                                <Route
                                  path="/admin/performance/compras"
                                  element={<Performance screen="compras" />}
                                />
                                <Route
                                  path="/admin/performance/estoque"
                                  element={<Performance screen="estoque" />}
                                />
                                <Route
                                  path="/admin/performance/logistica"
                                  element={<Performance screen="logistica" />}
                                />
                                <Route
                                  path="/admin/performance/producao"
                                  element={<Performance screen="producao" />}
                                />
                                <Route
                                  path="/admin/performance/marketing"
                                  element={<Performance screen="marketing" />}
                                />
                                <Route
                                  path="/admin/performance/rh"
                                  element={<Performance screen="rh" />}
                                />
                                <Route
                                  path="/admin/performance/ti"
                                  element={<Performance screen="ti" />}
                                />
                                <Route
                                  path="/admin/performance/administrativo"
                                  element={<Performance screen="administrativo" />}
                                />
                                <Route
                                  path="/admin/performance/estrategico"
                                  element={<Performance screen="estrategico" />}
                                />
                                <Route
                                  path="/admin/performance/geral"
                                  element={<Performance screen="geral" />}
                                />
                                <Route
                                  path="/admin/performance/gamification"
                                  element={<Performance screen="gamification" />}
                                />
                                <Route
                                  path="/admin/performance/config"
                                  element={<Performance screen="config" />}
                                />
                                <Route
                                  path="/admin/performance/chat"
                                  element={<Performance screen="chat" />}
                                />
                                <Route
                                  path="/admin/validade"
                                  element={<ValidityAlerts screen="alerts" />}
                                />
                                <Route
                                  path="/admin/validade/dashboard"
                                  element={<ValidityAlerts screen="dashboard" />}
                                />
                                <Route
                                  path="/admin/validade/regras"
                                  element={<ValidityAlerts screen="regras" />}
                                />
                                <Route
                                  path="/admin/validade/chat"
                                  element={<ValidityAlerts screen="chat" />}
                                />
                                <Route
                                  path="/admin/atendimento"
                                  element={<Atendimento screen="dashboard" />}
                                />
                                {/* Módulo Departamento Pessoal (6 Telas Oficiais) */}
                                <Route path="/admin/dp" element={<DP screen="painel" />} />
                                <Route
                                  path="/admin/dp/colaboradores-contratos"
                                  element={<DP screen="colaboradores-contratos" />}
                                />
                                <Route
                                  path="/admin/dp/ferias-afastamentos"
                                  element={<DP screen="ferias-afastamentos" />}
                                />
                                <Route
                                  path="/admin/dp/folha-beneficios"
                                  element={<DP screen="folha-beneficios" />}
                                />
                                <Route
                                  path="/admin/dp/jornada-ponto"
                                  element={<DP screen="jornada-ponto" />}
                                />
                                <Route
                                  path="/admin/dp/obrigacoes-esocial"
                                  element={<DP screen="obrigacoes-esocial" />}
                                />

                                {/* Redirecionamentos de Rotas Antigas de DP */}
                                <Route
                                  path="/admin/dp/admissions"
                                  element={
                                    <Navigate to="/admin/dp/colaboradores-contratos" replace />
                                  }
                                />
                                <Route
                                  path="/admin/dp/contracts"
                                  element={
                                    <Navigate to="/admin/dp/colaboradores-contratos" replace />
                                  }
                                />
                                <Route
                                  path="/admin/dp/contract-changes"
                                  element={
                                    <Navigate to="/admin/dp/colaboradores-contratos" replace />
                                  }
                                />
                                <Route
                                  path="/admin/dp/rescisoes"
                                  element={
                                    <Navigate to="/admin/dp/colaboradores-contratos" replace />
                                  }
                                />
                                <Route
                                  path="/admin/dp/reintegracao"
                                  element={
                                    <Navigate to="/admin/dp/colaboradores-contratos" replace />
                                  }
                                />
                                <Route
                                  path="/admin/dp/jornadas"
                                  element={<Navigate to="/admin/dp/jornada-ponto" replace />}
                                />
                                <Route
                                  path="/admin/dp/escalas"
                                  element={<Navigate to="/admin/dp/jornada-ponto" replace />}
                                />
                                <Route
                                  path="/admin/dp/ponto"
                                  element={<Navigate to="/admin/dp/jornada-ponto" replace />}
                                />
                                <Route
                                  path="/admin/dp/banco-horas"
                                  element={<Navigate to="/admin/dp/jornada-ponto" replace />}
                                />
                                <Route
                                  path="/admin/dp/horas-extras"
                                  element={<Navigate to="/admin/dp/jornada-ponto" replace />}
                                />
                                <Route
                                  path="/admin/dp/folha"
                                  element={<Navigate to="/admin/dp/folha-beneficios" replace />}
                                />
                                <Route
                                  path="/admin/dp/rubricas"
                                  element={<Navigate to="/admin/dp/folha-beneficios" replace />}
                                />
                                <Route
                                  path="/admin/dp/13-salario"
                                  element={<Navigate to="/admin/dp/folha-beneficios" replace />}
                                />
                                <Route
                                  path="/admin/dp/beneficios"
                                  element={<Navigate to="/admin/dp/folha-beneficios" replace />}
                                />
                                <Route
                                  path="/admin/dp/consignados"
                                  element={<Navigate to="/admin/dp/folha-beneficios" replace />}
                                />
                                <Route
                                  path="/admin/dp/encargos"
                                  element={<Navigate to="/admin/dp/folha-beneficios" replace />}
                                />
                                <Route
                                  path="/admin/dp/provisoes"
                                  element={<Navigate to="/admin/dp/folha-beneficios" replace />}
                                />
                                <Route
                                  path="/admin/dp/ferias"
                                  element={<Navigate to="/admin/dp/ferias-afastamentos" replace />}
                                />
                                <Route
                                  path="/admin/dp/afastamentos"
                                  element={<Navigate to="/admin/dp/ferias-afastamentos" replace />}
                                />
                                <Route
                                  path="/admin/dp/licencas"
                                  element={<Navigate to="/admin/dp/ferias-afastamentos" replace />}
                                />
                                <Route
                                  path="/admin/dp/esocial"
                                  element={<Navigate to="/admin/dp/obrigacoes-esocial" replace />}
                                />
                                <Route
                                  path="/admin/dp/esocial-monitor"
                                  element={<Navigate to="/admin/dp/obrigacoes-esocial" replace />}
                                />
                                <Route
                                  path="/admin/dp/fgts"
                                  element={<Navigate to="/admin/dp/obrigacoes-esocial" replace />}
                                />
                                <Route
                                  path="/admin/dp/tabelas-tributarias"
                                  element={<Navigate to="/admin/dp/obrigacoes-esocial" replace />}
                                />
                                <Route
                                  path="/admin/dp/sindicatos"
                                  element={<Navigate to="/admin/dp/obrigacoes-esocial" replace />}
                                />
                                <Route
                                  path="/admin/dp/convencoes"
                                  element={<Navigate to="/admin/dp/obrigacoes-esocial" replace />}
                                />
                                <Route
                                  path="/admin/dp/dissidio"
                                  element={<Navigate to="/admin/dp/obrigacoes-esocial" replace />}
                                />
                                <Route
                                  path="/admin/dp/documentos-obrigatorios"
                                  element={<Navigate to="/admin/dp/obrigacoes-esocial" replace />}
                                />
                                <Route
                                  path="/admin/dp/esocial-layouts"
                                  element={<Navigate to="/admin/dp/obrigacoes-esocial" replace />}
                                />
                                <Route
                                  path="/admin/dp/exames"
                                  element={<Navigate to="/admin/sst/saude-ocupacional" replace />}
                                />
                                <Route
                                  path="/admin/dp/epis"
                                  element={<Navigate to="/admin/sst/epis-treinamentos" replace />}
                                />
                                <Route
                                  path="/admin/dp/relatorios"
                                  element={<Navigate to="/admin/dp" replace />}
                                />
                                <Route
                                  path="/admin/dp/adapta"
                                  element={
                                    <Navigate to="/admin/configuracoes/jetro-online" replace />
                                  }
                                />

                                {/* Módulo SST (8 Telas Oficiais) */}
                                <Route path="/admin/sst" element={<SST screen="painel" />} />
                                <Route
                                  path="/admin/sst/central-conformidade"
                                  element={<SST screen="central-conformidade" />}
                                />
                                <Route
                                  path="/admin/sst/documentos-obrigacoes"
                                  element={<SST screen="documentos-obrigacoes" />}
                                />
                                <Route
                                  path="/admin/sst/epis-treinamentos"
                                  element={<SST screen="epis-treinamentos" />}
                                />
                                <Route
                                  path="/admin/sst/gestao-riscos-pgr"
                                  element={<SST screen="gestao-riscos-pgr" />}
                                />
                                <Route
                                  path="/admin/sst/relatorios-sst"
                                  element={<SST screen="relatorios-sst" />}
                                />
                                <Route
                                  path="/admin/sst/saude-ocupacional"
                                  element={<SST screen="saude-ocupacional" />}
                                />
                                <Route
                                  path="/admin/sst/seguranca-prevencao"
                                  element={<SST screen="seguranca-prevencao" />}
                                />

                                {/* Redirecionamentos de Rotas Antigas de SST */}
                                <Route
                                  path="/admin/sst/cockpit"
                                  element={<Navigate to="/admin/sst" replace />}
                                />
                                <Route
                                  path="/admin/sst/reports"
                                  element={<Navigate to="/admin/sst/relatorios-sst" replace />}
                                />
                                <Route
                                  path="/admin/sst/gro"
                                  element={<Navigate to="/admin/sst/gestao-riscos-pgr" replace />}
                                />
                                <Route
                                  path="/admin/sst/risk-inventory"
                                  element={<Navigate to="/admin/sst/gestao-riscos-pgr" replace />}
                                />
                                <Route
                                  path="/admin/sst/risk-matrix"
                                  element={<Navigate to="/admin/sst/gestao-riscos-pgr" replace />}
                                />
                                <Route
                                  path="/admin/sst/action-plans"
                                  element={<Navigate to="/admin/sst/gestao-riscos-pgr" replace />}
                                />
                                <Route
                                  path="/admin/sst/work-environments"
                                  element={<Navigate to="/admin/sst/gestao-riscos-pgr" replace />}
                                />
                                <Route
                                  path="/admin/sst/exposure-groups"
                                  element={<Navigate to="/admin/sst/gestao-riscos-pgr" replace />}
                                />
                                <Route
                                  path="/admin/sst/environmental-assessments"
                                  element={<Navigate to="/admin/sst/gestao-riscos-pgr" replace />}
                                />
                                <Route
                                  path="/admin/sst/apr"
                                  element={<Navigate to="/admin/sst/gestao-riscos-pgr" replace />}
                                />
                                <Route
                                  path="/admin/sst/moc"
                                  element={<Navigate to="/admin/sst/gestao-riscos-pgr" replace />}
                                />
                                <Route
                                  path="/admin/sst/psychosocial-assessments"
                                  element={<Navigate to="/admin/sst/gestao-riscos-pgr" replace />}
                                />
                                <Route
                                  path="/admin/sst/pcmso"
                                  element={<Navigate to="/admin/sst/saude-ocupacional" replace />}
                                />
                                <Route
                                  path="/admin/sst/aso"
                                  element={<Navigate to="/admin/sst/saude-ocupacional" replace />}
                                />
                                <Route
                                  path="/admin/sst/medical-records"
                                  element={<Navigate to="/admin/sst/saude-ocupacional" replace />}
                                />
                                <Route
                                  path="/admin/sst/vaccination"
                                  element={<Navigate to="/admin/sst/saude-ocupacional" replace />}
                                />
                                <Route
                                  path="/admin/sst/epis"
                                  element={<Navigate to="/admin/sst/epis-treinamentos" replace />}
                                />
                                <Route
                                  path="/admin/sst/epcs"
                                  element={<Navigate to="/admin/sst/epis-treinamentos" replace />}
                                />
                                <Route
                                  path="/admin/sst/certificates"
                                  element={<Navigate to="/admin/sst/epis-treinamentos" replace />}
                                />
                                <Route
                                  path="/admin/sst/training-matrix"
                                  element={<Navigate to="/admin/sst/epis-treinamentos" replace />}
                                />
                                <Route
                                  path="/admin/sst/accidents"
                                  element={<Navigate to="/admin/sst/seguranca-prevencao" replace />}
                                />
                                <Route
                                  path="/admin/sst/cat"
                                  element={<Navigate to="/admin/sst/seguranca-prevencao" replace />}
                                />
                                <Route
                                  path="/admin/sst/incidents"
                                  element={<Navigate to="/admin/sst/seguranca-prevencao" replace />}
                                />
                                <Route
                                  path="/admin/sst/investigations"
                                  element={<Navigate to="/admin/sst/seguranca-prevencao" replace />}
                                />
                                <Route
                                  path="/admin/sst/cipa"
                                  element={<Navigate to="/admin/sst/seguranca-prevencao" replace />}
                                />
                                <Route
                                  path="/admin/sst/sesmt"
                                  element={<Navigate to="/admin/sst/seguranca-prevencao" replace />}
                                />
                                <Route
                                  path="/admin/sst/inspections"
                                  element={<Navigate to="/admin/sst/seguranca-prevencao" replace />}
                                />
                                <Route
                                  path="/admin/sst/non-conformities"
                                  element={<Navigate to="/admin/sst/seguranca-prevencao" replace />}
                                />
                                <Route
                                  path="/admin/sst/dds"
                                  element={<Navigate to="/admin/sst/seguranca-prevencao" replace />}
                                />
                                <Route
                                  path="/admin/sst/work-permits"
                                  element={<Navigate to="/admin/sst/seguranca-prevencao" replace />}
                                />
                                <Route
                                  path="/admin/sst/lockout"
                                  element={<Navigate to="/admin/sst/seguranca-prevencao" replace />}
                                />
                                <Route
                                  path="/admin/sst/emergencies"
                                  element={<Navigate to="/admin/sst/seguranca-prevencao" replace />}
                                />
                                <Route
                                  path="/admin/sst/brigade"
                                  element={<Navigate to="/admin/sst/seguranca-prevencao" replace />}
                                />
                                <Route
                                  path="/admin/sst/compliance"
                                  element={
                                    <Navigate to="/admin/sst/central-conformidade" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/nr-catalog"
                                  element={
                                    <Navigate to="/admin/sst/central-conformidade" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/ergonomics"
                                  element={
                                    <Navigate to="/admin/sst/central-conformidade" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/confined-spaces"
                                  element={
                                    <Navigate to="/admin/sst/central-conformidade" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/height-work"
                                  element={
                                    <Navigate to="/admin/sst/central-conformidade" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/nr10-electrical"
                                  element={
                                    <Navigate to="/admin/sst/central-conformidade" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/nr11-material-handling"
                                  element={
                                    <Navigate to="/admin/sst/central-conformidade" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/nr12-machines"
                                  element={
                                    <Navigate to="/admin/sst/central-conformidade" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/nr13-boilers"
                                  element={
                                    <Navigate to="/admin/sst/central-conformidade" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/nr15-insalubridade"
                                  element={
                                    <Navigate to="/admin/sst/central-conformidade" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/nr16-periculosidade"
                                  element={
                                    <Navigate to="/admin/sst/central-conformidade" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/audit-checklists"
                                  element={
                                    <Navigate to="/admin/sst/central-conformidade" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/indicators"
                                  element={<Navigate to="/admin/sst" replace />}
                                />
                                <Route
                                  path="/admin/sst/ppp"
                                  element={
                                    <Navigate to="/admin/sst/documentos-obrigacoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/ltcat"
                                  element={
                                    <Navigate to="/admin/sst/documentos-obrigacoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/documents"
                                  element={
                                    <Navigate to="/admin/sst/documentos-obrigacoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/esocial-monitor"
                                  element={
                                    <Navigate to="/admin/sst/documentos-obrigacoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/obligations-calendar"
                                  element={
                                    <Navigate to="/admin/sst/documentos-obrigacoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/sst/adapta"
                                  element={
                                    <Navigate to="/admin/configuracoes/jetro-online" replace />
                                  }
                                />
                                <Route
                                  path="/admin/promocoes"
                                  element={<Promotions screen="dashboard" />}
                                />
                                <Route
                                  path="/admin/marketing"
                                  element={<MarketingEnterprise screen="cockpit" />}
                                />
                                <Route
                                  path="/admin/marketing/solicitacoes"
                                  element={<MarketingEnterprise screen="requests" />}
                                />
                                <Route
                                  path="/admin/marketing/jobs"
                                  element={<MarketingEnterprise screen="jobs" />}
                                />
                                <Route
                                  path="/admin/marketing/aprovacao-pecas"
                                  element={<MarketingEnterprise screen="approval" />}
                                />
                                <Route
                                  path="/admin/marketing/calendario"
                                  element={<MarketingEnterprise screen="calendar" />}
                                />
                                <Route
                                  path="/admin/marketing/midia"
                                  element={<MarketingEnterprise screen="media" />}
                                />
                                <Route
                                  path="/admin/marketing/atribuicao"
                                  element={<MarketingEnterprise screen="attribution" />}
                                />
                                <Route
                                  path="/admin/marketing/brand"
                                  element={<MarketingEnterprise screen="brand" />}
                                />
                                <Route
                                  path="/admin/marketing/biblioteca"
                                  element={<MarketingEnterprise screen="library" />}
                                />
                                <Route
                                  path="/admin/marketing/templates"
                                  element={<MarketingEnterprise screen="templates" />}
                                />
                                <Route
                                  path="/admin/trade-marketing"
                                  element={<TradeMarketing screen="dashboard" />}
                                />
                                <Route
                                  path="/admin/trade-marketing/calendario"
                                  element={<TradeMarketing screen="calendar" />}
                                />
                                <Route
                                  path="/admin/trade-marketing/acoes"
                                  element={<TradeMarketing screen="actions" />}
                                />
                                <Route
                                  path="/admin/trade-marketing/verbas-fornecedor"
                                  element={<TradeMarketing screen="verbas" />}
                                />
                                <Route
                                  path="/admin/trade-marketing/materiais"
                                  element={<TradeMarketing screen="materials" />}
                                />
                                <Route
                                  path="/admin/trade-marketing/prestacao-contas"
                                  element={<TradeMarketing screen="accountability" />}
                                />
                                <Route
                                  path="/admin/trade-marketing/planejamento-anual"
                                  element={<TradeMarketing screen="annual-plan" />}
                                />
                                <Route
                                  path="/admin/trade-marketing/adapta"
                                  element={
                                    <Navigate to="/admin/configuracoes/jetro-online" replace />
                                  }
                                />
                                <Route
                                  path="/admin/trade-marketing/cotacoes-externas"
                                  element={<TradeMarketing screen="cotacoes-externas" />}
                                />
                                <Route
                                  path="/admin/trade-marketing/conta-corrente"
                                  element={<SupplierAllowance screen="accounts" />}
                                />
                                <Route
                                  path="/admin/trade-marketing/aplicacao-produtos"
                                  element={<SupplierAllowance screen="appropriations" />}
                                />
                                <Route
                                  path="/admin/precificacao"
                                  element={<Navigate to="/admin/precificacao/aprovacoes" replace />}
                                />
                                <Route
                                  path="/admin/precificacao/:screen"
                                  element={<Precificacao />}
                                />
                                <Route
                                  path="/admin/agendamento-relatorios"
                                  element={<ReportSchedulesPage />}
                                />
                                <Route
                                  path="/admin/central-documentacao"
                                  element={<CentralDocumentacaoPage />}
                                />
                                <Route
                                  path="/admin/segundo-cerebro"
                                  element={<SegundoCerebroPage />}
                                />
                                <Route
                                  path="/admin/planilhas/convertidas/comparativo-margens-gr"
                                  element={<ComparativoMargensGrPage />}
                                />
                                <Route
                                  path="/admin/planilhas/convertidas/tabela-mae-gr"
                                  element={<TabelaMaeGrPage />}
                                />
                                <Route path="/admin/usuarios" element={<UsersAdminPage />} />
                                <Route path="/admin/auditoria" element={<Auditoria />} />
                                <Route
                                  path="/admin/controladoria"
                                  element={<Controladoria screen="dashboard" />}
                                />
                                <Route
                                  path="/admin/controladoria/dre"
                                  element={<Controladoria screen="dre" />}
                                />
                                <Route
                                  path="/admin/controladoria/dre-analitica"
                                  element={<Controladoria screen="dre-analitica" />}
                                />
                                <Route
                                  path="/admin/controladoria/kpis"
                                  element={<Controladoria screen="kpis" />}
                                />
                                <Route
                                  path="/admin/controladoria/drivers"
                                  element={<Controladoria screen="drivers" />}
                                />
                                <Route
                                  path="/admin/controladoria/budget"
                                  element={<Controladoria screen="budget" />}
                                />
                                <Route
                                  path="/admin/controladoria/forecast"
                                  element={<Controladoria screen="forecast" />}
                                />
                                <Route
                                  path="/admin/controladoria/fechamento"
                                  element={<Controladoria screen="fechamento" />}
                                />
                                <Route
                                  path="/admin/controladoria/simulador"
                                  element={<Controladoria screen="simulador" />}
                                />
                                <Route
                                  path="/admin/controladoria/consolidacao"
                                  element={<Controladoria screen="consolidacao" />}
                                />
                                <Route
                                  path="/admin/controladoria/materialidade"
                                  element={<Controladoria screen="materialidade" />}
                                />
                                <Route
                                  path="/admin/controladoria/reclassificacoes"
                                  element={<Controladoria screen="reclassificacoes" />}
                                />
                                <Route
                                  path="/admin/controladoria/visoes-salvas"
                                  element={<Controladoria screen="visoes-salvas" />}
                                />
                                <Route
                                  path="/admin/controladoria/comentarios"
                                  element={<Controladoria screen="comentarios" />}
                                />
                                <Route
                                  path="/admin/controladoria/centros-resultado"
                                  element={<Controladoria screen="centros-resultado" />}
                                />
                                <Route
                                  path="/admin/controladoria/ebitda"
                                  element={<Controladoria screen="ebitda" />}
                                />
                                <Route
                                  path="/admin/controladoria/adapta"
                                  element={
                                    <Navigate to="/admin/configuracoes/jetro-online" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/balanco"
                                  element={<Controladoria screen="balanco" />}
                                />
                                <Route
                                  path="/admin/controladoria/fluxo-caixa"
                                  element={<Controladoria screen="fluxo-caixa" />}
                                />
                                <Route
                                  path="/admin/controladoria/configuracoes"
                                  element={<Controladoria screen="configuracoes" />}
                                />
                                <Route
                                  path="/admin/verbas"
                                  element={<SupplierAllowance screen="dashboard" />}
                                />
                                <Route
                                  path="/admin/verbas/cockpit"
                                  element={<SupplierAllowance screen="cockpit" />}
                                />
                                <Route
                                  path="/admin/verbas/acordos"
                                  element={<SupplierAllowance screen="agreements" />}
                                />
                                <Route
                                  path="/admin/verbas/conta-corrente"
                                  element={<SupplierAllowance screen="accounts" />}
                                />
                                <Route
                                  path="/admin/verbas/movimentacoes"
                                  element={<SupplierAllowance screen="movements" />}
                                />
                                <Route
                                  path="/admin/verbas/apuracoes"
                                  element={<SupplierAllowance screen="accruals" />}
                                />
                                <Route
                                  path="/admin/verbas/aplicacao-produtos"
                                  element={<SupplierAllowance screen="appropriations" />}
                                />
                                <Route
                                  path="/admin/verbas/consumos"
                                  element={<SupplierAllowance screen="consumptions" />}
                                />
                                <Route
                                  path="/admin/verbas/prestacao-contas"
                                  element={<SupplierAllowance screen="settlements" />}
                                />
                                <Route
                                  path="/admin/verbas/por-fornecedor"
                                  element={<TradeMarketing screen="verbas" />}
                                />
                                <Route
                                  path="/admin/verbas/cotacoes-externas"
                                  element={<TradeMarketing screen="cotacoes-externas" />}
                                />
                                <Route
                                  path="/admin/verbas/gastos-trade"
                                  element={<SupplierAllowance screen="trade-expenses" />}
                                />
                                <Route
                                  path="/admin/verbas/creditos-avulsos"
                                  element={<SupplierAllowance screen="adhoc-credits" />}
                                />
                                <Route
                                  path="/admin/verbas/documentos"
                                  element={<SupplierAllowance screen="documents" />}
                                />
                                <Route
                                  path="/admin/verbas/auditoria-corporativa"
                                  element={<SupplierAllowance screen="corporate-audit" />}
                                />
                                <Route
                                  path="/admin/verbas/contas-correntes"
                                  element={<SupplierAllowance screen="current-accounts" />}
                                />
                                <Route
                                  path="/admin/verbas/adapta"
                                  element={
                                    <Navigate to="/admin/configuracoes/jetro-online" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/versionamento-relatorios"
                                  element={<SupplierAllowance screen="report-versions" />}
                                />
                                <Route path="/cliente/login" element={<ClientLogin />} />
                                <Route path="/cliente/cadastro" element={<ClientRegister />} />
                                <Route
                                  path="/cliente/recuperar-senha"
                                  element={<PasswordRecovery />}
                                />
                                <Route
                                  path="/cliente/redefinir-senha"
                                  element={<ClientPasswordReset />}
                                />
                                <Route path="/_/" element={<ClientPasswordReset />} />
                                <Route path="/cliente" element={<ClientArea />} />
                                <Route path="/cliente/rastreamento" element={<ClientTracking />} />
                                <Route
                                  path="/politica-de-privacidade"
                                  element={<PoliticaPrivacidade />}
                                />
                                <Route path="/politica-comercial" element={<PoliticaComercial />} />
                                <Route path="/termos-de-uso" element={<TermosDeUso />} />
                                <Route path="/politica-de-cookies" element={<PoliticaCookies />} />
                                <Route
                                  path="/politica-de-seguranca"
                                  element={<PoliticaSeguranca />}
                                />
                                <Route
                                  path="/central-de-privacidade"
                                  element={<CentralDePrivacidade />}
                                />
                                <Route
                                  path="/canal-de-privacidade"
                                  element={<CanalDePrivacidade />}
                                />
                                <Route
                                  path="/politica-de-licenciamento"
                                  element={<PoliticaLicenciamento />}
                                />
                                <Route path="/politica-de-sla" element={<PoliticaSla />} />
                                <Route
                                  path="/politica-de-backup-continuidade"
                                  element={<PoliticaBackupContinuidade />}
                                />
                                <Route path="*" element={<NotFound />} />
                              </Route>
                            </Routes>
                          </TourProvider>
                        </JetroOnlineProvider>
                      </BrandProvider>
                    </UserPreferencesProvider>
                  </CmsContentProvider>
                </ClientAuthProvider>
              </SystemParamsProvider>
            </SettingsProvider>
          </AuthorizationProvider>
        </AuthProvider>
      </TooltipProvider>
    </ErrorBoundary>
  </BrowserRouter>
)

export default App
