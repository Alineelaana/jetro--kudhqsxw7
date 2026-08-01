import { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { FloatingChat } from '@/components/floating-chat'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PolicyLayoutProps {
  title: string
  lastUpdated: string
  children: ReactNode
}

export function PolicyLayout({ title, lastUpdated, children }: PolicyLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-[#01361D] text-white py-12 border-b border-[#C89B3C]/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[#E4C46A] hover:text-white transition-colors text-sm font-bold mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao início
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black gold-gradient-text">{title}</h1>
            <p className="text-white/60 text-sm mt-2">Última atualização: {lastUpdated}</p>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-lg max-w-none space-y-6 text-foreground/80 leading-relaxed">
              {children}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <FloatingWhatsApp />
    </div>
  )
}
