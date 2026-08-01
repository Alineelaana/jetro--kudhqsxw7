import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SettingsProvider } from '@/hooks/use-settings'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <SettingsProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SettingsProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
