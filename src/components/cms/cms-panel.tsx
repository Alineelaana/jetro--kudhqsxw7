import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { initializeCmsContent } from '@/services/cms'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  LayoutDashboard,
  PanelTop,
  Home,
  Image,
  Layers,
  FileText,
  Package,
  Building2,
  MousePointerClick,
  Images,
  Palette,
  Menu,
  PanelBottom,
  Search,
  Code,
  History,
  Rocket,
} from 'lucide-react'
import { CmsOverview } from '@/components/cms/cms-overview'
import { CmsHeaderSettings } from '@/components/cms/cms-header-settings'
import { CmsHomepage } from '@/components/cms/cms-homepage'
import { CmsBanners } from '@/components/cms/cms-banners'
import { CmsSections } from '@/components/cms/cms-sections'
import { CmsContentTexts } from '@/components/cms/cms-content-texts'
import { CmsServicesSettings, CmsInstitutional } from '@/components/cms/cms-content-blocks'
import { CmsButtonsLinks } from '@/components/cms/cms-buttons-links'
import { CmsMediaLibrary } from '@/components/cms/cms-media-library'
import { CmsVisualIdentity } from '@/components/cms/cms-visual-identity'
import { CmsNavigationMenu } from '@/components/cms/cms-navigation-menu'
import { CmsFooterSettings } from '@/components/cms/cms-footer-settings'
import { CmsSeoSettings, CmsScripts } from '@/components/cms/cms-seo-scripts'
import { CmsChangeHistory, CmsPublication } from '@/components/cms/cms-workflow'

const CMS_TABS = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'header', label: 'Cabeçalho', icon: PanelTop },
  { id: 'homepage', label: 'Página Inicial', icon: Home },
  { id: 'banners', label: 'Banners', icon: Image },
  { id: 'sections', label: 'Seções do Site', icon: Layers },
  { id: 'texts', label: 'Conteúdos e Textos', icon: FileText },
  { id: 'services', label: 'Serviços', icon: Package },
  { id: 'institutional', label: 'Institucional', icon: Building2 },
  { id: 'buttons', label: 'Botões e Chamadas', icon: MousePointerClick },
  { id: 'media', label: 'Imagens e Mídia', icon: Images },
  { id: 'identity', label: 'Identidade Visual', icon: Palette },
  { id: 'navigation', label: 'Menu de Navegação', icon: Menu },
  { id: 'footer', label: 'Rodapé', icon: PanelBottom },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'scripts', label: 'Scripts e Integrações', icon: Code },
  { id: 'history', label: 'Histórico de Alterações', icon: History },
  { id: 'publish', label: 'Publicação', icon: Rocket },
] as const

export function CmsPanel() {
  const { isAdmin, user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    if (isAdmin && user?.id) {
      initializeCmsContent(user.id as string)
        .catch(() => {})
        .finally(() => setInitializing(false))
    } else {
      setInitializing(false)
    }
  }, [isAdmin, user])

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-bold text-red-600">Acesso Negado</p>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Apenas usuários com perfil SUP (Gestão) podem acessar o módulo de Gestão do Site.
        </p>
      </div>
    )
  }

  if (initializing) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground">Gestão do Site</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie todo o conteúdo, identidade visual e publicação do site
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-60 flex-shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {CMS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#005B2E] text-white shadow-md'
                    : 'text-muted-foreground hover:bg-[#005B2E]/10 hover:text-[#005B2E]'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1 min-w-0">
          {activeTab === 'overview' && <CmsOverview />}
          {activeTab === 'header' && <CmsHeaderSettings />}
          {activeTab === 'homepage' && <CmsHomepage />}
          {activeTab === 'banners' && <CmsBanners />}
          {activeTab === 'sections' && <CmsSections />}
          {activeTab === 'texts' && <CmsContentTexts />}
          {activeTab === 'services' && <CmsServicesSettings />}
          {activeTab === 'institutional' && <CmsInstitutional />}
          {activeTab === 'buttons' && <CmsButtonsLinks />}
          {activeTab === 'media' && <CmsMediaLibrary />}
          {activeTab === 'identity' && <CmsVisualIdentity />}
          {activeTab === 'navigation' && <CmsNavigationMenu />}
          {activeTab === 'footer' && <CmsFooterSettings />}
          {activeTab === 'seo' && <CmsSeoSettings />}
          {activeTab === 'scripts' && <CmsScripts />}
          {activeTab === 'history' && <CmsChangeHistory />}
          {activeTab === 'publish' && <CmsPublication />}
        </div>
      </div>
    </div>
  )
}
