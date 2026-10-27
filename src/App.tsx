import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
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
import { RootRoute } from '@/components/auth/root-route'
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

// Fiscal, CRM e Comercial
const Fiscal = lazy(() => import('./pages/Fiscal'))
const CRM = lazy(() => import('./pages/CRM'))
const Commercial = lazy(() => import('./pages/Commercial'))

// Notificações e Módulos Centrais
const Notifications = lazy(() => import('./pages/Notifications'))
const AIModule = lazy(() => import('./pages/AIModule'))
const IaPage = lazy(() => import('./pages/IaPage'))
const Industry = lazy(() => import('./pages/Industry'))
const Phase0Foundation = lazy(() => import('./pages/Phase0Foundation'))
const PlatformLayer = lazy(() => import('./pages/PlatformLayer'))
const Blueprint = lazy(() => import('./pages/Blueprint'))
const VariableRemuneration = lazy(() => import('./pages/VariableRemuneration'))
const InteligenciaPage = lazy(() => import('./pages/InteligenciaPage'))
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
const MarketingPage = lazy(() => import('./pages/MarketingPage'))
const SupplierAllowance = lazy(() => import('./pages/SupplierAllowance'))
const TradeMarketing = lazy(() => import('./pages/TradeMarketing'))
const MarketingEnterprise = lazy(() => import('./pages/MarketingEnterprise'))

// Central de Chamados & TI
const ChamadosPage = lazy(() => import('@/pages/ChamadosPage'))

function ChamadoDetalhesRedirect() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/admin/chamados?tab=detalhe&id=${id || ''}`} replace />
}

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
                                <Route path="/" element={<RootRoute />} />
                                <Route path="/admin" element={<Admin />} />
                                <Route path="/admin/dashboard" element={<DashboardPage />} />
                                <Route path="/admin/orcamentos" element={<BudgetRequestsPanel />} />

                                {/* MÓDULO CHAMADOS: 3 TELAS OFICIAIS */}
                                <Route
                                  path="/admin/chamados"
                                  element={<ChamadosPage screen="central" />}
                                />
                                <Route
                                  path="/admin/chamados/painel"
                                  element={<ChamadosPage screen="painel" />}
                                />
                                <Route
                                  path="/admin/chamados/sla"
                                  element={<ChamadosPage screen="sla" />}
                                />

                                {/* REDIRECIONAMENTOS DE ROTAS LEGADAS DO MÓDULO CHAMADOS/TI */}
                                <Route
                                  path="/admin/chamados/central"
                                  element={<Navigate to="/admin/chamados" replace />}
                                />
                                <Route
                                  path="/admin/chamados/meus-chamados"
                                  element={<Navigate to="/admin/chamados" replace />}
                                />
                                <Route
                                  path="/admin/chamados/meus"
                                  element={<Navigate to="/admin/chamados" replace />}
                                />
                                <Route
                                  path="/admin/chamados/novo"
                                  element={<Navigate to="/admin/chamados?tab=novo" replace />}
                                />
                                <Route
                                  path="/admin/chamados/painel-sla"
                                  element={<Navigate to="/admin/chamados/painel" replace />}
                                />
                                <Route
                                  path="/admin/configuracoes/sla-chamados"
                                  element={<Navigate to="/admin/chamados/sla" replace />}
                                />
                                <Route
                                  path="/admin/chamados/:id"
                                  element={<ChamadoDetalhesRedirect />}
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
                                {/* MÓDULO LOGÍSTICA & TRANSPORTE: 7 TELAS OFICIAIS */}
                                <Route
                                  path="/admin/logistica"
                                  element={<Logistics screen="central" />}
                                />
                                <Route
                                  path="/admin/logistica/transporte-frota"
                                  element={<Logistics screen="transporte-frota" />}
                                />
                                <Route
                                  path="/admin/logistica/distribuicao-entregas"
                                  element={<Logistics screen="distribuicao-entregas" />}
                                />
                                <Route
                                  path="/admin/logistica/rotas-roteirizacao"
                                  element={<Logistics screen="rotas-roteirizacao" />}
                                />
                                <Route
                                  path="/admin/logistica/frete-tabelas"
                                  element={<Logistics screen="frete-tabelas" />}
                                />
                                <Route
                                  path="/admin/logistica/ocorrencias-rastreabilidade"
                                  element={<Logistics screen="ocorrencias-rastreabilidade" />}
                                />
                                <Route
                                  path="/admin/logistica/custos-indicadores"
                                  element={<Logistics screen="custos-indicadores" />}
                                />

                                {/* REDIRECIONAMENTOS DE ROTAS LEGADAS DE LOGÍSTICA */}
                                <Route
                                  path="/admin/logistica/veiculos"
                                  element={
                                    <Navigate to="/admin/logistica/transporte-frota" replace />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/motoristas"
                                  element={
                                    <Navigate to="/admin/logistica/transporte-frota" replace />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/entregas"
                                  element={
                                    <Navigate to="/admin/logistica/distribuicao-entregas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/romaneios"
                                  element={
                                    <Navigate to="/admin/logistica/distribuicao-entregas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/coletas"
                                  element={
                                    <Navigate to="/admin/logistica/distribuicao-entregas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/transferencias"
                                  element={
                                    <Navigate to="/admin/logistica/distribuicao-entregas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/reversa"
                                  element={
                                    <Navigate to="/admin/logistica/distribuicao-entregas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/app-motorista"
                                  element={
                                    <Navigate to="/admin/logistica/distribuicao-entregas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/rotas"
                                  element={
                                    <Navigate to="/admin/logistica/rotas-roteirizacao" replace />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/planejamento"
                                  element={
                                    <Navigate to="/admin/logistica/rotas-roteirizacao" replace />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/fretes"
                                  element={<Navigate to="/admin/logistica/frete-tabelas" replace />}
                                />
                                <Route
                                  path="/admin/logistica/tabelas-frete"
                                  element={<Navigate to="/admin/logistica/frete-tabelas" replace />}
                                />
                                <Route
                                  path="/admin/logistica/ocorrencias"
                                  element={
                                    <Navigate
                                      to="/admin/logistica/ocorrencias-rastreabilidade"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/rastreamento"
                                  element={
                                    <Navigate
                                      to="/admin/logistica/ocorrencias-rastreabilidade"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/comprovantes"
                                  element={
                                    <Navigate
                                      to="/admin/logistica/ocorrencias-rastreabilidade"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/custos"
                                  element={
                                    <Navigate to="/admin/logistica/custos-indicadores" replace />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/indicadores"
                                  element={
                                    <Navigate to="/admin/logistica/custos-indicadores" replace />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/relatorios"
                                  element={
                                    <Navigate to="/admin/logistica/custos-indicadores" replace />
                                  }
                                />
                                <Route
                                  path="/admin/logistica/excecoes"
                                  element={<Navigate to="/admin/logistica" replace />}
                                />

                                {/* REDIRECIONAMENTOS DE ROTAS LEGADAS DE TRANSPORTE */}
                                <Route
                                  path="/admin/transporte"
                                  element={<Navigate to="/admin/logistica" replace />}
                                />
                                <Route
                                  path="/admin/transporte/veiculos"
                                  element={
                                    <Navigate to="/admin/logistica/transporte-frota" replace />
                                  }
                                />
                                <Route
                                  path="/admin/transporte/motoristas"
                                  element={
                                    <Navigate to="/admin/logistica/transporte-frota" replace />
                                  }
                                />
                                <Route
                                  path="/admin/transporte/entregas"
                                  element={
                                    <Navigate to="/admin/logistica/distribuicao-entregas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/transporte/cargas"
                                  element={
                                    <Navigate to="/admin/logistica/rotas-roteirizacao" replace />
                                  }
                                />
                                <Route
                                  path="/admin/transporte/roteirizacao"
                                  element={
                                    <Navigate to="/admin/logistica/rotas-roteirizacao" replace />
                                  }
                                />
                                <Route
                                  path="/admin/transporte/viagens"
                                  element={
                                    <Navigate to="/admin/logistica/rotas-roteirizacao" replace />
                                  }
                                />
                                <Route
                                  path="/admin/transporte/rotas"
                                  element={
                                    <Navigate to="/admin/logistica/rotas-roteirizacao" replace />
                                  }
                                />
                                <Route
                                  path="/admin/transporte/fretes"
                                  element={<Navigate to="/admin/logistica/frete-tabelas" replace />}
                                />
                                <Route
                                  path="/admin/transporte/tabelas-frete"
                                  element={<Navigate to="/admin/logistica/frete-tabelas" replace />}
                                />
                                <Route
                                  path="/admin/transporte/rastreamento"
                                  element={
                                    <Navigate
                                      to="/admin/logistica/ocorrencias-rastreabilidade"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/transporte/ocorrencias"
                                  element={
                                    <Navigate
                                      to="/admin/logistica/ocorrencias-rastreabilidade"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/transporte/comprovantes"
                                  element={
                                    <Navigate
                                      to="/admin/logistica/ocorrencias-rastreabilidade"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/transporte/custos"
                                  element={
                                    <Navigate to="/admin/logistica/custos-indicadores" replace />
                                  }
                                />
                                <Route
                                  path="/admin/transporte/app-motorista"
                                  element={
                                    <Navigate to="/admin/logistica/distribuicao-entregas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/transporte/relatorios"
                                  element={
                                    <Navigate to="/admin/logistica/custos-indicadores" replace />
                                  }
                                />
                                {/* MÓDULO COMERCIAL (10 Telas Oficiais) */}
                                <Route path="/admin/comercial" element={<Commercial />} />
                                <Route path="/admin/comercial/central" element={<Commercial />} />
                                <Route path="/admin/comercial/clientes" element={<Commercial />} />
                                <Route path="/admin/comercial/comissoes" element={<Commercial />} />
                                <Route
                                  path="/admin/comercial/contratos-devolucoes"
                                  element={<Commercial />}
                                />
                                <Route path="/admin/comercial/crm" element={<Commercial />} />
                                <Route
                                  path="/admin/comercial/cotacoes-cotador"
                                  element={<Commercial />}
                                />
                                <Route
                                  path="/admin/comercial/pedidos-faturamento"
                                  element={<Commercial />}
                                />
                                <Route
                                  path="/admin/comercial/relatorios"
                                  element={<Commercial />}
                                />
                                <Route
                                  path="/admin/comercial/remuneracao-variavel"
                                  element={<Commercial />}
                                />
                                <Route
                                  path="/admin/comercial/tabelas-preco-descontos"
                                  element={<Commercial />}
                                />

                                {/* TELAS PRESERVADAS INTOCADAS (Comissão Analítica e Consulta de Pedidos) */}
                                <Route
                                  path="/admin/vendas/consulta-pedidos"
                                  element={<SalesOrdersQueryPage />}
                                />

                                {/* REDIRECIONAMENTOS DE ROTAS LEGADAS DE VENDAS */}
                                <Route
                                  path="/admin/vendas"
                                  element={<Navigate to="/admin/comercial" replace />}
                                />
                                <Route
                                  path="/admin/vendas/pedidos"
                                  element={
                                    <Navigate to="/admin/comercial/pedidos-faturamento" replace />
                                  }
                                />
                                <Route
                                  path="/admin/vendas/faturamento"
                                  element={
                                    <Navigate to="/admin/comercial/pedidos-faturamento" replace />
                                  }
                                />
                                <Route
                                  path="/admin/vendas/orcamentos"
                                  element={
                                    <Navigate to="/admin/comercial/pedidos-faturamento" replace />
                                  }
                                />
                                <Route
                                  path="/admin/vendas/inserir-clientes"
                                  element={<Navigate to="/admin/comercial/clientes" replace />}
                                />
                                <Route
                                  path="/admin/vendas/contratos"
                                  element={
                                    <Navigate to="/admin/comercial/contratos-devolucoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/vendas/devolucoes"
                                  element={
                                    <Navigate to="/admin/comercial/contratos-devolucoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/vendas/historico"
                                  element={
                                    <Navigate to="/admin/comercial/pedidos-faturamento" replace />
                                  }
                                />
                                <Route
                                  path="/admin/vendas/nfe"
                                  element={<Navigate to="/admin/fiscal/documentos" replace />}
                                />
                                <Route
                                  path="/admin/vendas/nfce"
                                  element={<Navigate to="/admin/fiscal/documentos" replace />}
                                />

                                {/* REDIRECIONAMENTOS DE ROTAS LEGADAS DE COMISSÕES E DESCONTOS (Comissão Analítica mantida intacta acima) */}
                                <Route
                                  path="/admin/regras-comissao"
                                  element={<Navigate to="/admin/comercial/comissoes" replace />}
                                />
                                <Route
                                  path="/admin/comissoes-mix"
                                  element={<Navigate to="/admin/comercial/comissoes" replace />}
                                />
                                <Route
                                  path="/admin/premiacoes"
                                  element={<Navigate to="/admin/comercial/comissoes" replace />}
                                />
                                <Route
                                  path="/admin/descontos-deducoes"
                                  element={
                                    <Navigate
                                      to="/admin/comercial/tabelas-preco-descontos"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/promocoes"
                                  element={
                                    <Navigate
                                      to="/admin/comercial/tabelas-preco-descontos"
                                      replace
                                    />
                                  }
                                />
                                {/* Módulo Estoque e WMS (6 Telas Oficiais) */}
                                <Route
                                  path="/admin/estoque"
                                  element={<StockPage screen="central" />}
                                />
                                <Route
                                  path="/admin/estoque/movimentacoes"
                                  element={<StockPage screen="movimentacoes" />}
                                />
                                <Route
                                  path="/admin/estoque/inventario"
                                  element={<StockPage screen="inventario" />}
                                />
                                <Route
                                  path="/admin/estoque/lotes"
                                  element={<StockPage screen="lotes" />}
                                />
                                <Route
                                  path="/admin/estoque/wms-operacional"
                                  element={<StockPage screen="wms-operacional" />}
                                />
                                <Route
                                  path="/admin/estoque/wms-gerencial"
                                  element={<StockPage screen="wms-gerencial" />}
                                />

                                {/* Redirecionamentos de Rotas Antigas de Estoque e WMS */}
                                <Route
                                  path="/admin/estoque/transferencias"
                                  element={<Navigate to="/admin/estoque/movimentacoes" replace />}
                                />
                                <Route
                                  path="/admin/estoque/ajustes"
                                  element={<Navigate to="/admin/estoque/movimentacoes" replace />}
                                />
                                <Route
                                  path="/admin/estoque/conferencia"
                                  element={<Navigate to="/admin/estoque/inventario" replace />}
                                />
                                <Route
                                  path="/admin/estoque/posicao"
                                  element={<Navigate to="/admin/estoque" replace />}
                                />
                                <Route
                                  path="/admin/estoque/validade"
                                  element={<Navigate to="/admin/estoque/lotes" replace />}
                                />
                                <Route
                                  path="/admin/estoque/localizacoes"
                                  element={<Navigate to="/admin/estoque/wms-operacional" replace />}
                                />
                                <Route
                                  path="/admin/estoque/separacao"
                                  element={<Navigate to="/admin/estoque/wms-operacional" replace />}
                                />
                                <Route
                                  path="/admin/estoque/expedicao"
                                  element={<Navigate to="/admin/estoque/wms-operacional" replace />}
                                />
                                <Route
                                  path="/admin/estoque/recebimento"
                                  element={<Navigate to="/admin/estoque/wms-operacional" replace />}
                                />
                                <Route
                                  path="/admin/estoque/enderecamento"
                                  element={<Navigate to="/admin/estoque/wms-operacional" replace />}
                                />
                                <Route
                                  path="/admin/estoque/ondas"
                                  element={<Navigate to="/admin/estoque/wms-operacional" replace />}
                                />
                                <Route
                                  path="/admin/estoque/reabastecimento"
                                  element={<Navigate to="/admin/estoque/wms-operacional" replace />}
                                />
                                <Route
                                  path="/admin/estoque/wms-alertas"
                                  element={<Navigate to="/admin/estoque" replace />}
                                />
                                <Route
                                  path="/admin/estoque/wms-relatorios"
                                  element={<Navigate to="/admin/estoque/wms-gerencial" replace />}
                                />
                                <Route
                                  path="/admin/estoque/wms-pallets"
                                  element={<Navigate to="/admin/estoque/wms-operacional" replace />}
                                />
                                <Route
                                  path="/admin/estoque/wms-volumes"
                                  element={<Navigate to="/admin/estoque/wms-operacional" replace />}
                                />
                                <Route
                                  path="/admin/estoque/wms-coletores"
                                  element={<Navigate to="/admin/estoque/wms-operacional" replace />}
                                />
                                <Route
                                  path="/admin/estoque/wms-operadores"
                                  element={<Navigate to="/admin/estoque/wms-operacional" replace />}
                                />
                                <Route
                                  path="/admin/estoque/wms-managerial"
                                  element={<Navigate to="/admin/estoque/wms-gerencial" replace />}
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
                                  <Route index element={<Navigate to="parametros" replace />} />
                                  <Route
                                    path="dados-empresa"
                                    element={<Navigate to="/admin/cadastros/empresas" replace />}
                                  />
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
                                {/* Módulo Fiscal (Telas Oficiais com Arquitetura de CFOP e CGO) */}
                                <Route path="/admin/fiscal" element={<Fiscal />} />
                                <Route path="/admin/fiscal/central" element={<Fiscal />} />
                                <Route path="/admin/fiscal/documentos" element={<Fiscal />} />
                                <Route path="/admin/fiscal/escrituracao" element={<Fiscal />} />
                                <Route path="/admin/fiscal/reforma" element={<Fiscal />} />
                                <Route
                                  path="/admin/fiscal/certificados-configuracoes"
                                  element={<Fiscal />}
                                />
                                <Route path="/admin/fiscal/compras-entradas" element={<Fiscal />} />
                                <Route path="/admin/fiscal/relatorios" element={<Fiscal />} />
                                <Route path="/admin/fiscal/operacoes" element={<Fiscal />} />
                                <Route path="/admin/fiscal/matriz-cfop" element={<Fiscal />} />
                                <Route path="/admin/fiscal/simulador-cfop" element={<Fiscal />} />

                                {/* Redirecionamentos de Rotas Antigas do Módulo Fiscal */}
                                <Route
                                  path="/admin/fiscal/dashboard"
                                  element={<Navigate to="/admin/fiscal/central" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/nfe"
                                  element={<Navigate to="/admin/fiscal/documentos" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/nfce"
                                  element={<Navigate to="/admin/fiscal/documentos" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/nfse"
                                  element={<Navigate to="/admin/fiscal/documentos" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/cte"
                                  element={<Navigate to="/admin/fiscal/documentos" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/mdfe"
                                  element={<Navigate to="/admin/fiscal/documentos" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/cte-mdfe"
                                  element={<Navigate to="/admin/fiscal/documentos" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/correcao"
                                  element={<Navigate to="/admin/fiscal/documentos" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/carta-correcao"
                                  element={<Navigate to="/admin/fiscal/documentos" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/manifestacao"
                                  element={<Navigate to="/admin/fiscal/documentos" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/inutilizacao"
                                  element={<Navigate to="/admin/fiscal/documentos" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/sped"
                                  element={<Navigate to="/admin/fiscal/escrituracao" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/livros"
                                  element={<Navigate to="/admin/fiscal/escrituracao" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/apuracao"
                                  element={<Navigate to="/admin/fiscal/escrituracao" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-dashboard"
                                  element={<Navigate to="/admin/fiscal/reforma" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-cbs-ibs"
                                  element={<Navigate to="/admin/fiscal/reforma" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-seletivo"
                                  element={<Navigate to="/admin/fiscal/reforma" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-classificacao"
                                  element={<Navigate to="/admin/fiscal/reforma" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-regras"
                                  element={<Navigate to="/admin/fiscal/reforma" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-transicao"
                                  element={<Navigate to="/admin/fiscal/reforma" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-creditos"
                                  element={<Navigate to="/admin/fiscal/reforma" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-simulador"
                                  element={<Navigate to="/admin/fiscal/reforma" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/reforma-validacao"
                                  element={<Navigate to="/admin/fiscal/reforma" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/certificados"
                                  element={
                                    <Navigate
                                      to="/admin/fiscal/certificados-configuracoes"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/fiscal/configuracoes"
                                  element={
                                    <Navigate
                                      to="/admin/fiscal/certificados-configuracoes"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/fiscal/entrada"
                                  element={<Navigate to="/admin/fiscal/compras-entradas" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/compras"
                                  element={<Navigate to="/admin/fiscal/compras-entradas" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/entradas"
                                  element={<Navigate to="/admin/fiscal/compras-entradas" replace />}
                                />
                                <Route
                                  path="/admin/fiscal/xml-import"
                                  element={<Navigate to="/admin/fiscal/compras-entradas" replace />}
                                />
                                {/* REDIRECIONAMENTOS DE ROTAS LEGADAS DE CRM */}
                                <Route
                                  path="/admin/crm"
                                  element={<Navigate to="/admin/comercial/crm" replace />}
                                />
                                <Route
                                  path="/admin/crm/leads"
                                  element={<Navigate to="/admin/comercial/crm" replace />}
                                />
                                <Route
                                  path="/admin/crm/oportunidades"
                                  element={<Navigate to="/admin/comercial/crm" replace />}
                                />
                                <Route
                                  path="/admin/crm/funil"
                                  element={<Navigate to="/admin/comercial/crm" replace />}
                                />
                                <Route
                                  path="/admin/crm/funil-config"
                                  element={<Navigate to="/admin/comercial/crm" replace />}
                                />
                                <Route
                                  path="/admin/crm/agenda"
                                  element={<Navigate to="/admin/comercial/crm" replace />}
                                />
                                <Route
                                  path="/admin/crm/propostas"
                                  element={<Navigate to="/admin/comercial/crm" replace />}
                                />
                                <Route
                                  path="/admin/crm/historico"
                                  element={<Navigate to="/admin/comercial/crm" replace />}
                                />
                                <Route
                                  path="/admin/crm/atividades"
                                  element={<Navigate to="/admin/comercial/crm" replace />}
                                />
                                <Route
                                  path="/admin/crm/motivos-perda"
                                  element={<Navigate to="/admin/comercial/crm" replace />}
                                />
                                <Route
                                  path="/admin/crm/metas"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/crm/automacao"
                                  element={<Navigate to="/admin/comercial/crm" replace />}
                                />
                                <Route
                                  path="/admin/crm/relatorios"
                                  element={<Navigate to="/admin/comercial/crm" replace />}
                                />
                                <Route path="/admin/notificacoes" element={<Notifications />} />

                                {/* MÓDULO IA (4 TELAS OFICIAIS) */}
                                <Route path="/admin/ia" element={<IaPage screen="assistente" />} />
                                <Route
                                  path="/admin/ia/assistente"
                                  element={<IaPage screen="assistente" />}
                                />
                                <Route
                                  path="/admin/ia/agentes-automacoes"
                                  element={<IaPage screen="agentes-automacoes" />}
                                />
                                <Route
                                  path="/admin/ia/base-conhecimento"
                                  element={<IaPage screen="base-conhecimento" />}
                                />
                                <Route
                                  path="/admin/ia/historico-aprovacoes"
                                  element={<IaPage screen="historico-aprovacoes" />}
                                />
                                <Route path="/admin/ia/:slug" element={<IaPage />} />

                                {/* REDIRECIONAMENTOS DE ROTAS LEGADAS DO MÓDULO IA */}
                                <Route
                                  path="/admin/ia/dashboard"
                                  element={<Navigate to="/admin/ia/assistente" replace />}
                                />
                                <Route
                                  path="/admin/ia/agentes"
                                  element={<Navigate to="/admin/ia/agentes-automacoes" replace />}
                                />
                                <Route
                                  path="/admin/ia/automacoes"
                                  element={<Navigate to="/admin/ia/agentes-automacoes" replace />}
                                />
                                <Route
                                  path="/admin/ia/fluxos"
                                  element={<Navigate to="/admin/ia/agentes-automacoes" replace />}
                                />
                                <Route
                                  path="/admin/ia/treinamento"
                                  element={<Navigate to="/admin/ia/base-conhecimento" replace />}
                                />
                                <Route
                                  path="/admin/ia/historico"
                                  element={<Navigate to="/admin/ia/historico-aprovacoes" replace />}
                                />
                                <Route
                                  path="/admin/ia/aprovacoes"
                                  element={<Navigate to="/admin/ia/historico-aprovacoes" replace />}
                                />
                                <Route
                                  path="/admin/ia/configuracoes"
                                  element={<Navigate to="/admin/ia/historico-aprovacoes" replace />}
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
                                {/* REDIRECIONAMENTOS DE ROTAS LEGADAS DE REMUNERAÇÃO VARIÁVEL E METAS */}
                                <Route
                                  path="/admin/remuneracao"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/remuneracao/regras"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/remuneracao/apuracao"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/remuneracao/simulador"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/remuneracao/aprovacoes"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/remuneracao/historico"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/remuneracao/contestacoes"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/remuneracao/campanhas"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/remuneracao/ranking"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/remuneracao/metas"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/remuneracao/metas-gestao"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/remuneracao/metas-premiacoes"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/remuneracao/metas-comunicacoes"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                <Route
                                  path="/admin/remuneracao/metas-vendedor"
                                  element={
                                    <Navigate to="/admin/comercial/remuneracao-variavel" replace />
                                  }
                                />
                                {/* MÓDULO INTELIGÊNCIA (4 TELAS OFICIAIS) */}
                                <Route path="/admin/inteligencia" element={<InteligenciaPage />} />
                                <Route
                                  path="/admin/inteligencia/:slug"
                                  element={<InteligenciaPage />}
                                />

                                {/* REDIRECIONAMENTOS DAS ROTAS LEGADAS DE BI PARA INTELIGÊNCIA */}
                                <Route
                                  path="/admin/bi"
                                  element={<Navigate to="/admin/inteligencia" replace />}
                                />
                                <Route
                                  path="/admin/bi/executive"
                                  element={<Navigate to="/admin/inteligencia" replace />}
                                />
                                <Route
                                  path="/admin/bi/commercial"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/financial-intel"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/industrial-intel"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/logistics-intel"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/stock-intel"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/fiscal-intel"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/purchasing-intel"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/crm-intel"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/trade-intel"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/rh-intel"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/quality-intel"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/maintenance-intel"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/vr-intel"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/custom-dashboards"
                                  element={
                                    <Navigate
                                      to="/admin/inteligencia/dashboards-projecoes"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/bi/ai-adapta"
                                  element={
                                    <Navigate to="/admin/configuracoes/jetro-online" replace />
                                  }
                                />
                                <Route
                                  path="/admin/bi/cross-module"
                                  element={<Navigate to="/admin/inteligencia" replace />}
                                />
                                <Route
                                  path="/admin/bi/projection"
                                  element={
                                    <Navigate
                                      to="/admin/inteligencia/dashboards-projecoes"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/bi/sales"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/stock"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/financial"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/industrial"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/saved-views"
                                  element={
                                    <Navigate
                                      to="/admin/inteligencia/dashboards-projecoes"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/bi/marketing-intel"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/bi/report-center"
                                  element={<Navigate to="/admin/inteligencia/relatorios" replace />}
                                />
                                <Route
                                  path="/admin/bi/*"
                                  element={<Navigate to="/admin/inteligencia" replace />}
                                />

                                {/* REDIRECIONAMENTOS DAS ROTAS LEGADAS DE PERFORMANCE PARA INTELIGÊNCIA */}
                                <Route
                                  path="/admin/performance"
                                  element={<Navigate to="/admin/inteligencia" replace />}
                                />
                                <Route
                                  path="/admin/performance/comercial"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/performance/financeiro"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/performance/fiscal"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/performance/compras"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/performance/estoque"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/performance/logistica"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/performance/producao"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/performance/marketing"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/performance/rh"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/performance/ti"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/performance/administrativo"
                                  element={<Navigate to="/admin/inteligencia/por-area" replace />}
                                />
                                <Route
                                  path="/admin/performance/estrategico"
                                  element={<Navigate to="/admin/inteligencia" replace />}
                                />
                                <Route
                                  path="/admin/performance/geral"
                                  element={<Navigate to="/admin/inteligencia" replace />}
                                />
                                <Route
                                  path="/admin/performance/gamification"
                                  element={<Navigate to="/admin/inteligencia" replace />}
                                />
                                <Route
                                  path="/admin/performance/config"
                                  element={<Navigate to="/admin/inteligencia" replace />}
                                />
                                <Route
                                  path="/admin/performance/chat"
                                  element={<Navigate to="/admin/inteligencia" replace />}
                                />
                                <Route
                                  path="/admin/performance/*"
                                  element={<Navigate to="/admin/inteligencia" replace />}
                                />
                                {/* Redirecionamento das Rotas Antigas de Validade para Lotes e Validade */}
                                <Route
                                  path="/admin/validade"
                                  element={<Navigate to="/admin/estoque/lotes" replace />}
                                />
                                <Route
                                  path="/admin/validade/dashboard"
                                  element={<Navigate to="/admin/estoque/lotes" replace />}
                                />
                                <Route
                                  path="/admin/validade/regras"
                                  element={<Navigate to="/admin/estoque/lotes" replace />}
                                />
                                <Route
                                  path="/admin/validade/chat"
                                  element={<Navigate to="/admin/estoque/lotes" replace />}
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
                                {/* MÓDULO MARKETING E VERBAS (7 TELAS OFICIAIS UNIFICADAS) */}
                                <Route path="/admin/marketing" element={<MarketingPage />} />
                                <Route
                                  path="/admin/marketing/central"
                                  element={<MarketingPage />}
                                />
                                <Route
                                  path="/admin/marketing/solicitacoes-jobs"
                                  element={<MarketingPage />}
                                />
                                <Route
                                  path="/admin/marketing/biblioteca-templates"
                                  element={<MarketingPage />}
                                />
                                <Route
                                  path="/admin/marketing/trade-marketing"
                                  element={<MarketingPage />}
                                />
                                <Route
                                  path="/admin/marketing/verbas-fornecedor"
                                  element={<MarketingPage />}
                                />
                                <Route
                                  path="/admin/marketing/cotacoes-externas"
                                  element={<MarketingPage />}
                                />
                                <Route
                                  path="/admin/marketing/relatorios-auditoria"
                                  element={<MarketingPage />}
                                />

                                {/* REDIRECIONAMENTOS DE ROTAS LEGADAS DE MARKETING */}
                                <Route
                                  path="/admin/marketing/solicitacoes"
                                  element={
                                    <Navigate to="/admin/marketing/solicitacoes-jobs" replace />
                                  }
                                />
                                <Route
                                  path="/admin/marketing/jobs"
                                  element={
                                    <Navigate to="/admin/marketing/solicitacoes-jobs" replace />
                                  }
                                />
                                <Route
                                  path="/admin/marketing/aprovacao-pecas"
                                  element={
                                    <Navigate to="/admin/marketing/solicitacoes-jobs" replace />
                                  }
                                />
                                <Route
                                  path="/admin/marketing/calendario"
                                  element={
                                    <Navigate to="/admin/marketing/solicitacoes-jobs" replace />
                                  }
                                />
                                <Route
                                  path="/admin/marketing/midia"
                                  element={
                                    <Navigate to="/admin/marketing/solicitacoes-jobs" replace />
                                  }
                                />
                                <Route
                                  path="/admin/marketing/atribuicao"
                                  element={
                                    <Navigate to="/admin/marketing/relatorios-auditoria" replace />
                                  }
                                />
                                <Route
                                  path="/admin/marketing/brand"
                                  element={
                                    <Navigate to="/admin/marketing/biblioteca-templates" replace />
                                  }
                                />
                                <Route
                                  path="/admin/marketing/biblioteca"
                                  element={
                                    <Navigate to="/admin/marketing/biblioteca-templates" replace />
                                  }
                                />
                                <Route
                                  path="/admin/marketing/templates"
                                  element={
                                    <Navigate to="/admin/marketing/biblioteca-templates" replace />
                                  }
                                />

                                {/* REDIRECIONAMENTOS DE ROTAS LEGADAS DE TRADE MARKETING */}
                                <Route
                                  path="/admin/trade-marketing"
                                  element={
                                    <Navigate to="/admin/marketing/trade-marketing" replace />
                                  }
                                />
                                <Route
                                  path="/admin/trade-marketing/calendario"
                                  element={
                                    <Navigate to="/admin/marketing/trade-marketing" replace />
                                  }
                                />
                                <Route
                                  path="/admin/trade-marketing/acoes"
                                  element={
                                    <Navigate to="/admin/marketing/trade-marketing" replace />
                                  }
                                />
                                <Route
                                  path="/admin/trade-marketing/verbas-fornecedor"
                                  element={
                                    <Navigate to="/admin/marketing/verbas-fornecedor" replace />
                                  }
                                />
                                <Route
                                  path="/admin/trade-marketing/materiais"
                                  element={
                                    <Navigate to="/admin/marketing/trade-marketing" replace />
                                  }
                                />
                                <Route
                                  path="/admin/trade-marketing/prestacao-contas"
                                  element={
                                    <Navigate to="/admin/marketing/trade-marketing" replace />
                                  }
                                />
                                <Route
                                  path="/admin/trade-marketing/planejamento-anual"
                                  element={
                                    <Navigate to="/admin/marketing/trade-marketing" replace />
                                  }
                                />
                                <Route
                                  path="/admin/trade-marketing/adapta"
                                  element={
                                    <Navigate to="/admin/configuracoes/jetro-online" replace />
                                  }
                                />
                                <Route
                                  path="/admin/trade-marketing/cotacoes-externas"
                                  element={
                                    <Navigate to="/admin/marketing/cotacoes-externas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/trade-marketing/conta-corrente"
                                  element={
                                    <Navigate to="/admin/marketing/verbas-fornecedor" replace />
                                  }
                                />
                                <Route
                                  path="/admin/trade-marketing/aplicacao-produtos"
                                  element={
                                    <Navigate to="/admin/marketing/verbas-fornecedor" replace />
                                  }
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
                                {/* MÓDULO CONTROLADORIA (5 TELAS OFICIAIS) */}
                                <Route
                                  path="/admin/controladoria"
                                  element={<Controladoria screen="dre-demonstracoes" />}
                                />
                                <Route
                                  path="/admin/controladoria/dre-demonstracoes"
                                  element={<Controladoria screen="dre-demonstracoes" />}
                                />
                                <Route
                                  path="/admin/controladoria/planejamento"
                                  element={<Controladoria screen="planejamento" />}
                                />
                                <Route
                                  path="/admin/controladoria/fechamento-consolidacao"
                                  element={<Controladoria screen="fechamento-consolidacao" />}
                                />
                                <Route
                                  path="/admin/controladoria/simulador"
                                  element={<Controladoria screen="simulador" />}
                                />
                                <Route
                                  path="/admin/controladoria/configuracoes"
                                  element={<Controladoria screen="configuracoes" />}
                                />

                                {/* REDIRECIONAMENTOS DE ROTAS LEGADAS DE CONTROLADORIA */}
                                <Route
                                  path="/admin/controladoria/dre"
                                  element={
                                    <Navigate to="/admin/controladoria/dre-demonstracoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/dre-analitica"
                                  element={
                                    <Navigate to="/admin/controladoria/dre-demonstracoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/ebitda"
                                  element={
                                    <Navigate to="/admin/controladoria/dre-demonstracoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/balanco"
                                  element={
                                    <Navigate to="/admin/controladoria/dre-demonstracoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/budget"
                                  element={
                                    <Navigate to="/admin/controladoria/planejamento" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/forecast"
                                  element={
                                    <Navigate to="/admin/controladoria/planejamento" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/drivers"
                                  element={
                                    <Navigate to="/admin/controladoria/planejamento" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/centros-resultado"
                                  element={
                                    <Navigate to="/admin/controladoria/planejamento" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/centros"
                                  element={
                                    <Navigate to="/admin/controladoria/planejamento" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/fechamento"
                                  element={
                                    <Navigate
                                      to="/admin/controladoria/fechamento-consolidacao"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/consolidacao"
                                  element={
                                    <Navigate
                                      to="/admin/controladoria/fechamento-consolidacao"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/reclassificacoes"
                                  element={
                                    <Navigate
                                      to="/admin/controladoria/fechamento-consolidacao"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/materialidade"
                                  element={
                                    <Navigate
                                      to="/admin/controladoria/fechamento-consolidacao"
                                      replace
                                    />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/visoes-salvas"
                                  element={
                                    <Navigate to="/admin/controladoria/configuracoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/visoes"
                                  element={
                                    <Navigate to="/admin/controladoria/configuracoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/comentarios"
                                  element={
                                    <Navigate to="/admin/controladoria/configuracoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/kpis"
                                  element={
                                    <Navigate to="/admin/controladoria/dre-demonstracoes" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/fluxo-caixa"
                                  element={<Navigate to="/admin/financeiro" replace />}
                                />
                                <Route
                                  path="/admin/controladoria/adapta"
                                  element={
                                    <Navigate to="/admin/configuracoes/jetro-online" replace />
                                  }
                                />
                                <Route
                                  path="/admin/controladoria/*"
                                  element={
                                    <Navigate to="/admin/controladoria/dre-demonstracoes" replace />
                                  }
                                />
                                {/* REDIRECIONAMENTOS DE ROTAS LEGADAS DE VERBAS (ORIGEM ÚNICA EM /admin/marketing/verbas-fornecedor) */}
                                <Route
                                  path="/admin/verbas"
                                  element={
                                    <Navigate to="/admin/marketing/verbas-fornecedor" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/cockpit"
                                  element={<Navigate to="/admin/marketing" replace />}
                                />
                                <Route
                                  path="/admin/verbas/acordos"
                                  element={
                                    <Navigate to="/admin/marketing/verbas-fornecedor" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/conta-corrente"
                                  element={
                                    <Navigate to="/admin/marketing/verbas-fornecedor" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/movimentacoes"
                                  element={
                                    <Navigate to="/admin/marketing/relatorios-auditoria" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/apuracoes"
                                  element={
                                    <Navigate to="/admin/marketing/verbas-fornecedor" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/aplicacao-produtos"
                                  element={
                                    <Navigate to="/admin/marketing/verbas-fornecedor" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/consumos"
                                  element={
                                    <Navigate to="/admin/marketing/verbas-fornecedor" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/prestacao-contas"
                                  element={
                                    <Navigate to="/admin/marketing/verbas-fornecedor" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/por-fornecedor"
                                  element={
                                    <Navigate to="/admin/marketing/verbas-fornecedor" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/cotacoes-externas"
                                  element={
                                    <Navigate to="/admin/marketing/cotacoes-externas" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/gastos-trade"
                                  element={
                                    <Navigate to="/admin/marketing/relatorios-auditoria" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/creditos-avulsos"
                                  element={
                                    <Navigate to="/admin/marketing/verbas-fornecedor" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/documentos"
                                  element={
                                    <Navigate to="/admin/marketing/relatorios-auditoria" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/auditoria-corporativa"
                                  element={
                                    <Navigate to="/admin/marketing/relatorios-auditoria" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/contas-correntes"
                                  element={
                                    <Navigate to="/admin/marketing/verbas-fornecedor" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/adapta"
                                  element={
                                    <Navigate to="/admin/configuracoes/jetro-online" replace />
                                  }
                                />
                                <Route
                                  path="/admin/verbas/versionamento-relatorios"
                                  element={
                                    <Navigate to="/admin/marketing/relatorios-auditoria" replace />
                                  }
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
