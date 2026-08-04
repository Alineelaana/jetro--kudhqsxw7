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
