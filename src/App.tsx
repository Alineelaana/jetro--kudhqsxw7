import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/error-boundary'
import { SettingsProvider } from '@/hooks/use-settings'
import { SystemParamsProvider } from '@/hooks/use-system-params'
import { AuthProvider } from '@/hooks/use-auth'
import { ClientAuthProvider } from '@/hooks/use-client-auth'
import { CmsContentProvider } from '@/hooks/use-cms-content'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'
import AdminRegister from './pages/AdminRegister'
import AdminPasswordRecovery from './pages/AdminPasswordRecovery'
import ClientLogin from './pages/ClientLogin'
import ClientRegister from './pages/ClientRegister'
import PasswordRecovery from './pages/PasswordRecovery'
import ClientArea from './pages/ClientArea'
import ClientPasswordReset from './pages/ClientPasswordReset'
import PoliticaPrivacidade from './pages/PoliticaPrivacidade'
import PoliticaComercial from './pages/PoliticaComercial'
import TermosDeUso from './pages/TermosDeUso'
import PoliticaCookies from './pages/PoliticaCookies'
import Products from './pages/Products'
import Cadastros from './pages/Cadastros'
import PriceTablesPage from './pages/PriceTablesPage'
import SalesDashboardPage from './pages/sales/SalesDashboardPage'
import SalesOrdersPage from './pages/sales/SalesOrdersPage'
import InvoicingPage from './pages/sales/InvoicingPage'
import NfePage from './pages/sales/NfePage'
import NfcePage from './pages/sales/NfcePage'
import ContractsPage from './pages/sales/ContractsPage'
import SalesReturnsPage from './pages/sales/SalesReturnsPage'
import SalesHistoryPage from './pages/sales/SalesHistoryPage'
import StockPage from './pages/StockPage'
import WmsScreen from './pages/WmsScreen'
import Layout from './components/Layout'
import { ConfiguracoesLayout } from '@/components/configuracoes/configuracoes-layout'
import { EmpresaScreen } from '@/components/configuracoes/empresa-screen'
import { ParametrosScreen } from '@/components/configuracoes/parametros-screen'
import { ConfigCrudScreen } from '@/components/configuracoes/config-crud-screen'
import { LogsScreen } from '@/components/configuracoes/logs-screen'
import { ApisScreen } from '@/components/configuracoes/apis-screen'
import { ImportExportScreen } from '@/components/configuracoes/import-export-screen'
import { PermissionMatrixScreen } from '@/components/configuracoes/permission-matrix-screen'
import { SegurancaScreen } from '@/components/configuracoes/seguranca-screen'
import Notifications from './pages/Notifications'
import { BackupScreen } from '@/components/configuracoes/backup-screen'
import {
  INTEGRATIONS_CONFIG,
  EMAIL_TEMPLATE_CONFIG,
  DOC_TEMPLATE_CONFIG,
  NOTIFICATION_CONFIG,
  NUMERATION_CONFIG,
} from '@/lib/configuracoes-config'

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <TooltipProvider>
        <AuthProvider>
          <SettingsProvider>
            <SystemParamsProvider>
              <ClientAuthProvider>
                <CmsContentProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/admin/produtos" element={<Products />} />
                      <Route path="/admin/cadastros" element={<Cadastros />} />
                      <Route path="/admin/tabelas-precos" element={<PriceTablesPage />} />
                      <Route path="/admin/vendas" element={<SalesDashboardPage />} />
                      <Route path="/admin/vendas/pedidos" element={<SalesOrdersPage />} />
                      <Route path="/admin/vendas/faturamento" element={<InvoicingPage />} />
                      <Route path="/admin/vendas/nfe" element={<NfePage />} />
                      <Route path="/admin/vendas/nfce" element={<NfcePage />} />
                      <Route path="/admin/vendas/contratos" element={<ContractsPage />} />
                      <Route path="/admin/vendas/devolucoes" element={<SalesReturnsPage />} />
                      <Route path="/admin/vendas/historico" element={<SalesHistoryPage />} />
                      <Route path="/admin/estoque" element={<StockPage screen="dashboard" />} />
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
                      <Route path="/admin/estoque/lotes" element={<StockPage screen="batches" />} />
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
                      <Route path="/admin/estoque/ondas" element={<StockPage screen="waves" />} />
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
                      <Route path="/admin/configuracoes" element={<ConfiguracoesLayout />}>
                        <Route index element={<Navigate to="dados-empresa" replace />} />
                        <Route path="dados-empresa" element={<EmpresaScreen />} />
                        <Route path="parametros" element={<ParametrosScreen />} />
                        <Route path="permissoes" element={<PermissionMatrixScreen />} />
                        <Route path="logs" element={<LogsScreen />} />
                        <Route
                          path="integracoes"
                          element={<ConfigCrudScreen config={INTEGRATIONS_CONFIG} />}
                        />
                        <Route path="apis" element={<ApisScreen />} />
                        <Route path="importacao-exportacao" element={<ImportExportScreen />} />
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
                      <Route path="/admin/notificacoes" element={<Notifications />} />
                      <Route path="/admin/cadastro" element={<AdminRegister />} />
                      <Route path="/admin/recuperar-senha" element={<AdminPasswordRecovery />} />
                      <Route path="/cliente/login" element={<ClientLogin />} />
                      <Route path="/cliente/cadastro" element={<ClientRegister />} />
                      <Route path="/cliente/recuperar-senha" element={<PasswordRecovery />} />
                      <Route path="/cliente/redefinir-senha" element={<ClientPasswordReset />} />
                      <Route path="/_/" element={<ClientPasswordReset />} />
                      <Route path="/cliente" element={<ClientArea />} />
                      <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
                      <Route path="/politica-comercial" element={<PoliticaComercial />} />
                      <Route path="/termos-de-uso" element={<TermosDeUso />} />
                      <Route path="/politica-de-cookies" element={<PoliticaCookies />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </CmsContentProvider>
              </ClientAuthProvider>
            </SystemParamsProvider>
          </SettingsProvider>
        </AuthProvider>
      </TooltipProvider>
    </ErrorBoundary>
  </BrowserRouter>
)

export default App
