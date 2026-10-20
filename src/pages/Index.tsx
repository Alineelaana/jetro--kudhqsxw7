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
  const [selectedService] = useState<string>('Apresentação Comercial HURAM ERP')

  // Se o usuário está logado (ou se pb.authStore já é válido mesmo antes de loading terminar),
  // redireciona para a área interna (/admin) garantindo que nunca fique em /site
  if (isAuthenticated || (!loading && isAuthenticated)) {
    return <Navigate to="/admin" replace />
  }
  const scrollToContact = () => {
    const el = document.getElementById('contato')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#202B28] selection:bg-[#C69B45] selection:text-white font-sans">
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
        className="py-20 sm:py-28 bg-[#F8FAF9] relative border-t border-[#E4EAE6]"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-[#063D30] text-white px-6 sm:px-10 py-10 sm:py-12 text-center space-y-3 rounded-t-2xl border border-[#063D30] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C69B45]/10 rounded-full blur-3xl pointer-events-none" />
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#C69B45]/50 text-[#C69B45] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#C69B45]" />
              Solicitação de Demonstração Guiada
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold font-heading text-white tracking-tight">
              Fale com nossos consultores de solução
            </h2>
            <p className="text-slate-200 max-w-2xl mx-auto text-xs sm:text-base leading-relaxed font-normal">
              Conte-nos brevemente o segmento e os objetivos da sua empresa para que nossa equipe
              demonstre os módulos HURAM mais indicados para sua operação.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-slate-300">
              <a
                href="https://wa.me/5531991297619"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-white font-semibold hover:text-[#C69B45] transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-[#C69B45]" />
                WhatsApp Comercial: +55 (31) 99129-7619
              </a>
              <span className="hidden sm:inline text-white/30">|</span>
              <span className="inline-flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-[#C69B45]" />
                Armazenamento seguro em conformidade com LGPD
              </span>
            </div>
          </div>

          <div className="bg-white px-6 sm:px-10 pb-10 pt-8 rounded-b-2xl border border-[#E4EAE6] border-t-0 shadow-xl">
            <BudgetForm whatsappNumber={safeWhatsapp} selectedService={selectedService} />
          </div>
        </div>
      </section>

      {/* 12. Chamada Final de Conversão */}
      <FinalCTA onOpenBudget={scrollToContact} />
    </main>
  )
}
