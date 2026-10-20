import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { HeroSection } from '@/components/hero-section'
import { AboutJetroSection } from '@/components/about-jetro-section'
import { PlatformModulesSection } from '@/components/platform-modules-section'
import { SystemScreensGallery } from '@/components/system-screens-gallery'
import { EndToEndProcessSection } from '@/components/end-to-end-process-section'
import { JehSection } from '@/components/jeh-section'
import { JetroOnlineSection } from '@/components/jetro-online-section'
import { AiComparisonSection } from '@/components/ai-comparison-section'
import { UniversityJetroSection } from '@/components/university-jetro-section'
import { WhyJetroSection } from '@/components/why-jetro-section'
import { FeaturesHighlightSection } from '@/components/features-highlight-section'
import { BudgetForm } from '@/components/budget-form'
import { FinalCTA } from '@/components/final-cta'
import { SiteClientsSection } from '@/components/site-clients-section'
import { SiteTestimonialsSection } from '@/components/site-testimonials-section'
import { SeoHead } from '@/components/seo-head'
import { useSettings } from '@/hooks/use-settings'
import { PhoneCall, ShieldCheck, Mail, Sparkles } from 'lucide-react'

export default function Index() {
  const { isAuthenticated, loading } = useAuth()
  const { whatsappNumber } = useSettings()
  const safeWhatsapp = whatsappNumber || '5531991297619'
  const [selectedService] = useState<string>('Apresentação Comercial Jetro ERP')

  // Se o usuário está logado, redireciona para a área interna (/admin) garantindo que nunca fique em /site
  if (!loading && isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const scrollToContact = () => {
    const el = document.getElementById('contato')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main className="min-h-screen bg-[#001c10] text-slate-100 selection:bg-[#C9A227] selection:text-gray-950">
      {/* 1. SEO & Metadados Otimizados */}
      <SeoHead />

      {/* 2. Hero Section: Logotipo oficial, novo título e protagonista visual real */}
      <HeroSection onOpenBudget={scrollToContact} />

      {/* 3. Posicionamento Institucional: "Inteligência que conecta sua gestão" */}
      <AboutJetroSection />

      {/* 4. Soluções & Módulos Reais do ERP */}
      <PlatformModulesSection />

      {/* 5. Galeria Interativa: "Conheça o Jetro por dentro" com dados protegidos */}
      <SystemScreensGallery />

      {/* 6. Fluxos Empresariais de Ponta a Ponta */}
      <EndToEndProcessSection />

      {/* 7. Assistentes de IA: Jeh (pública/comercial) e Jetro On-line (interno/copiloto) */}
      <div id="ia" className="scroll-mt-20">
        <JehSection />
        <JetroOnlineSection />
        <AiComparisonSection />
      </div>

      {/* 8. Universidade Jetro: Vídeos, tutoriais e tours guiados */}
      <UniversityJetroSection />

      {/* 9. Por que conhecer o Jetro: Diferenciais reais */}
      <WhyJetroSection />

      {/* 10. Recursos Operacionais em Destaque */}
      <FeaturesHighlightSection />

      {/* 10.1 Seção Nossos Clientes */}
      <SiteClientsSection />

      {/* 10.2 Seção Depoimentos de Clientes com Aprovação Administrativa */}
      <SiteTestimonialsSection />

      {/* 11. Conversão Comercial & Formulário Estruturado */}
      <section
        id="contato"
        className="py-20 sm:py-28 bg-[#00140b] relative border-t border-white/5"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-[#002817] text-white px-6 sm:px-10 py-10 sm:py-12 text-center space-y-3 rounded-t-2xl border border-[#C9A227]/40 border-b-0 shadow-2xl">
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-[#C9A227]/40 text-[#f6d77c] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
              Solicitação de Demonstração Guiada
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Fale com nossos consultores de solução
            </h2>
            <p className="text-slate-200 max-w-2xl mx-auto text-xs sm:text-base leading-relaxed">
              Conte-nos brevemente o segmento e os objetivos da sua empresa para que nossa equipe
              demonstre os módulos Jetro mais indicados para sua operação.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-300">
              <a
                href="https://wa.me/5531991297619"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#f6d77c] font-bold hover:underline"
              >
                <PhoneCall className="w-4 h-4 text-[#C9A227]" />
                WhatsApp Comercial: +55 (31) 99129-7619
              </a>
              <span className="hidden sm:inline text-white/30">|</span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                Armazenamento seguro em conformidade com LGPD
              </span>
            </div>
          </div>

          <div className="bg-slate-950 px-6 sm:px-10 pb-10 pt-8 rounded-b-2xl border border-[#C9A227]/40 border-t-0 shadow-2xl">
            <BudgetForm whatsappNumber={safeWhatsapp} selectedService={selectedService} />
          </div>
        </div>
      </section>

      {/* 12. Chamada Final de Conversão */}
      <FinalCTA onOpenBudget={scrollToContact} />
    </main>
  )
}
