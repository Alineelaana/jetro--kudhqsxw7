import { ReactNode } from 'react'
import { ArrowLeft, ShieldCheck, FileText, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PolicyLayoutProps {
  title: string
  lastUpdated: string
  heroImage?: string
  heroBadge?: string
  heroDescription?: string
  children: ReactNode
}

export function PolicyLayout({
  title,
  lastUpdated,
  heroImage,
  heroBadge,
  heroDescription,
  children,
}: PolicyLayoutProps) {
  return (
    <>
      <section className="relative bg-gradient-to-b from-[#001D0F] via-[#002E1B] to-[#001D0F] text-white overflow-hidden border-b border-[#C89B3C]/30 py-10 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#005A36]/30 via-transparent to-transparent pointer-events-none" />

        {heroImage && (
          <div className="absolute inset-0 z-0 opacity-20 lg:opacity-25 pointer-events-none overflow-hidden">
            <img
              src={heroImage}
              alt=""
              className="w-full h-full object-cover object-center filter blur-[1px] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#001D0F] via-[#001D0F]/85 to-[#001D0F]" />
          </div>
        )}

        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#E4C46A] hover:text-white transition-colors text-sm font-bold mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
            Voltar ao início
          </Link>

          {heroImage ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                {heroBadge && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C89B3C]/15 border border-[#C89B3C]/40 text-[#E5B85C] text-xs font-semibold tracking-wide">
                    <Sparkles className="h-3.5 w-3.5 text-[#C89B3C]" />
                    <span>{heroBadge}</span>
                  </div>
                )}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  {title}
                </h1>
                {heroDescription && (
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                    {heroDescription}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-gray-300">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/40 border border-[#C89B3C]/30 font-medium text-[#E4C46A]">
                    <FileText className="w-3.5 h-3.5 text-[#C89B3C]" />
                    Última atualização: {lastUpdated}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black/40 border border-emerald-500/30 font-medium text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Documento Oficial
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto rounded-2xl overflow-hidden border-2 border-[#C89B3C]/50 shadow-2xl shadow-black/80 group">
                  <img
                    src={heroImage}
                    alt={title}
                    className="w-full h-52 sm:h-64 lg:h-72 object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001D0F] via-transparent to-transparent opacity-80 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-[#C89B3C]/40 text-xs text-gray-200">
                    <p className="font-bold text-[#E5B85C] text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" />
                      Jetro Intelligence
                    </p>
                    <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">
                      Governança comercial, licenciamento inteligente e transparência para a sua
                      operação.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl sm:text-4xl font-black gold-gradient-text">{title}</h1>
              <p className="text-white/60 text-sm mt-2">Última atualização: {lastUpdated}</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none space-y-6 text-foreground/80 leading-relaxed">
            {children}
          </div>
        </div>
      </section>
    </>
  )
}
