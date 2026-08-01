import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SettingsProvider } from '@/hooks/use-settings'
import { AuthProvider } from '@/hooks/use-auth'
import { ClientAuthProvider } from '@/hooks/use-client-auth'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Admin from './pages/Admin'
import AdminRegister from './pages/AdminRegister'
import ClientLogin from './pages/ClientLogin'
import PasswordRecovery from './pages/PasswordRecovery'
import ClientArea from './pages/ClientArea'
import PoliticaPrivacidade from './pages/PoliticaPrivacidade'
import PoliticaComercial from './pages/PoliticaComercial'
import TermosDeUso from './pages/TermosDeUso'
import PoliticaCookies from './pages/PoliticaCookies'
import Layout from './components/Layout'

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <AuthProvider>
        <SettingsProvider>
          <ClientAuthProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/cadastro" element={<AdminRegister />} />
              </Route>
              <Route path="/cliente/login" element={<ClientLogin />} />
              <Route path="/cliente/recuperar-senha" element={<PasswordRecovery />} />
              <Route path="/cliente" element={<ClientArea />} />
              <Route path="/politica-de-privacidade" element={<PoliticaPrivacidade />} />
              <Route path="/politica-comercial" element={<PoliticaComercial />} />
              <Route path="/termos-de-uso" element={<TermosDeUso />} />
              <Route path="/politica-de-cookies" element={<PoliticaCookies />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ClientAuthProvider>
        </SettingsProvider>
      </AuthProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
