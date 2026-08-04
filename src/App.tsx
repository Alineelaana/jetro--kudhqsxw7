import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ErrorBoundary } from '@/components/error-boundary'
import { SettingsProvider } from '@/hooks/use-settings'
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
import Layout from './components/Layout'

const App = () => (
  <BrowserRouter>
    <ErrorBoundary>
      <TooltipProvider>
        <AuthProvider>
          <SettingsProvider>
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
                    <Route path="/admin/estoque/validade" element={<StockPage screen="expiry" />} />
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
          </SettingsProvider>
        </AuthProvider>
      </TooltipProvider>
    </ErrorBoundary>
  </BrowserRouter>
)

export default App
