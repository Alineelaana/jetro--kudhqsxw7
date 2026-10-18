import { useState, MouseEvent } from 'react'
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Database,
  Bot,
  BarChart3,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import heroBgImage from '@/assets/whatsapp-image-2026-08-09-at-23.34.40-78c1f.jpeg'

interface HeroSectionProps {
  onOpenBudget?: () => void
}

export function HeroSection({ onOpenBudget }: HeroSectionProps) {
  const [transformStyle, setTransformStyle] = useState('scale(1) translate(0px, 0px)')

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e
    const { width, height, left, top } = currentTarget.getBoundingClientRect()
    const x = (clientX - left) / width - 0.5
    const y = (clientY - top) / height - 0.5
    setTransformStyle(`scale(1.04) translate(${x * -16}px, ${y * -16}px)`)
  }

  const handleMouseLeave = () => {
    setTransformStyle('scale(1) translate(0px, 0px)')
  }

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleContact = () => {
    if (onOpenBudget) {
      onOpenBudget()
    } else {
      scrollTo('contato')
    }
  }

  return (
    <section
      id="inicio"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-[#001c10] text-white"
    >
      {/* Background visual institucional com efeito paralaxe suave */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={heroBgImage}
          alt="Interface do ERP Inteligente Jetro"
          className="w-full h-full object-cover object-center opacity-75 transition-transform duration-700 ease-out"
          style={{ transform: transformStyle }}
        />
        {/* Camada gradiente refinada para contraste impecável e elegância corporativa */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#001c10]/90 via-[#001c10]/75 to-[#001c10]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(201,162,39,0.12),transparent_60%)]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-6xl text-center space-y-8">
        {/* Tag institucional */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-[#C9A227]/40 text-[#f6d77c] text-xs sm:text-sm font-bold uppercase tracking-wider backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-[#C9A227] animate-pulse" />
          <span>Jetro · Inteligência que conecta sua gestão</span>
        </div>

        {/* Título Oficial Solicitado */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12] drop-shadow-md max-w-4xl mx-auto">
          Sua empresa mais conectada.{' '}
          <span className="text-[#C9A227] block sm:inline">Sua gestão mais inteligente.</span>
        </h1>

        {/* Subtítulo Oficial Solicitado */}
        <p className="text-slate-200 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
          Conheça o Jetro, uma plataforma desenvolvida para reunir gestão empresarial, análise de
          informações e inteligência artificial em uma experiência integrada, segura e orientada a
          resultados operacionais.
        </p>

        {/* Botões de Ação Direcionados a Canais Reais */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Button
            onClick={() => scrollTo('solucoes')}
            size="lg"
            className="w-full sm:w-auto bg-[#005A36] hover:bg-[#004225] text-white font-bold text-sm sm:text-base px-7 py-6 rounded-xl border border-[#C9A227]/40 shadow-lg shadow-[#005A36]/30 transition-all cursor-pointer"
          >
            <span>Explorar Soluções</span>
            <Layers className="w-4 h-4 ml-2" />
          </Button>

          <Button
            onClick={() => scrollTo('jetro-online')}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto bg-black/40 hover:bg-black/60 border-[#C9A227] text-[#f6d77c] font-bold text-sm sm:text-base px-7 py-6 rounded-xl backdrop-blur-sm cursor-pointer"
          >
            <Bot className="w-4 h-4 mr-2 text-[#C9A227]" />
            <span>Conhecer o Jetro On-line</span>
          </Button>

          <Button
            onClick={handleContact}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-[#C9A227] to-[#a88219] hover:from-[#d8b030] hover:to-[#b88f20] text-gray-950 font-black text-sm sm:text-base px-7 py-6 rounded-xl shadow-lg shadow-[#C9A227]/20 transition-all group cursor-pointer"
          >
            <span>Solicitar Demonstração</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Protagonismo Visual: Mockup Interativo da Interface do ERP */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-[#C9A227]/30 bg-black/50 p-2 sm:p-3 shadow-2xl backdrop-blur-xl">
            {/* Barra da Janela do ERP */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 rounded-t-xl border-b border-white/10 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-slate-300">
                  erp.jetro.com.br · Visão Operacional Integrada
                </span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Sistema em Operação
              </span>
            </div>

            {/* Painel Interno Demonstrativo da Interface Real do ERP */}
            <div className="bg-slate-950/90 p-4 sm:p-6 rounded-b-xl text-left space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl bg-slate-900/80 border border-emerald-500/20">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Gestão Comercial
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white">48 Pedidos</div>
                  <div className="text-[11px] text-emerald-400 font-medium mt-1">
                    Fluxo integrado com faturamento
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-slate-900/80 border border-emerald-500/20">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Financeiro & Caixa
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-[#f6d77c]">Conciliado</div>
                  <div className="text-[11px] text-slate-300 font-medium mt-1">
                    Contas a pagar/receber em dia
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-slate-900/80 border border-emerald-500/20">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    WMS & Logística
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white">12 Romaneios</div>
                  <div className="text-[11px] text-emerald-400 font-medium mt-1">
                    Separação & expedição ativas
                  </div>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-slate-900/80 border border-[#C9A227]/30 bg-emerald-950/20">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#C9A227] block mb-1">
                    Assistente Jetro
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-white">On-line</div>
                  <div className="text-[11px] text-[#f6d77c] font-medium mt-1">
                    Consultas via linguagem natural
                  </div>
                </div>
              </div>

              {/* Linha de status rápido */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Módulos integrados em base única (Skip Cloud)
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                  Trilhas de auditoria, MFA e matriz de permissões
                </span>
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                  BI com drill-down e exportação estruturada
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Destaques estruturais */}
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto text-left">
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/40 border border-white/10 hover:border-[#C9A227]/50 transition-colors">
            <div className="text-[#f6d77c] font-bold text-xs sm:text-sm mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#C9A227]" /> Gestão Integrada
            </div>
            <div className="text-slate-300 text-[11px] sm:text-xs">
              Vendas, estoque, financeiro e fiscal conectados em tempo real.
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/40 border border-white/10 hover:border-[#C9A227]/50 transition-colors">
            <div className="text-[#f6d77c] font-bold text-xs sm:text-sm mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" /> Controle & Auditoria
            </div>
            <div className="text-slate-300 text-[11px] sm:text-xs">
              Logs completos, alçadas de aprovação e matriz por perfil.
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/40 border border-white/10 hover:border-[#C9A227]/50 transition-colors">
            <div className="text-[#f6d77c] font-bold text-xs sm:text-sm mb-1 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-[#C9A227]" /> Duas Inteligências
            </div>
            <div className="text-slate-300 text-[11px] sm:text-xs">
              Jeh no atendimento ao visitante e Jetro On-line na operação interna.
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900/40 border border-white/10 hover:border-[#C9A227]/50 transition-colors">
            <div className="text-[#f6d77c] font-bold text-xs sm:text-sm mb-1 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#C9A227]" /> Universidade & Tours
            </div>
            <div className="text-slate-300 text-[11px] sm:text-xs">
              Treinamentos em vídeo, tutoriais e tours interativos na tela.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
