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
      className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 bg-white text-[#202B28] border-b border-[#E4EAE6]"
    >
      {/* Background sutil corporativo com luzes de ambientação */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#F1F4F2] via-[#F8FAF9] to-transparent rounded-full blur-3xl opacity-70" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#C69B45]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -left-40 w-96 h-96 bg-[#063D30]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-6xl text-center space-y-8">
        {/* Tag institucional */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F0] border border-[#C69B45]/30 text-[#063D30] text-xs sm:text-sm font-semibold tracking-wide shadow-2xs">
          <Sparkles className="w-4 h-4 text-[#C69B45]" />
          <span>HURAM · Inteligência que conecta sua gestão</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E87517]" />
        </div>

        {/* Título Oficial */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-[#063D30] tracking-tight leading-[1.12] max-w-4xl mx-auto">
          Sua empresa mais conectada.{' '}
          <span className="text-[#116B50] block sm:inline">Sua gestão mais inteligente.</span>
        </h1>

        {/* Subtítulo Oficial */}
        <p className="text-[#66736D] text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
          Conheça o HURAM, uma plataforma desenvolvida para reunir gestão empresarial, análise de
          informações e inteligência artificial em uma experiência integrada, segura e orientada a
          resultados operacionais.
        </p>

        {/* Botões de Ação Direcionados a Canais Reais */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Button
            onClick={() => scrollTo('solucoes')}
            size="lg"
            className="w-full sm:w-auto bg-[#063D30] hover:bg-[#042820] text-white font-semibold text-sm sm:text-base px-7 py-6 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <span>Explorar Soluções</span>
            <Layers className="w-4 h-4 ml-2 text-[#C69B45]" />
          </Button>

          <Button
            onClick={() => scrollTo('jetro-online')}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto bg-white hover:bg-[#F8FAF9] border-[#063D30]/25 text-[#063D30] font-semibold text-sm sm:text-base px-7 py-6 rounded-xl cursor-pointer shadow-2xs"
          >
            <Bot className="w-4 h-4 mr-2 text-[#C69B45]" />
            <span>Conhecer o HURAM On-line</span>
          </Button>

          <Button
            onClick={handleContact}
            size="lg"
            className="w-full sm:w-auto bg-[#C69B45] hover:bg-[#b58b38] text-white font-semibold text-sm sm:text-base px-7 py-6 rounded-xl shadow-sm hover:shadow transition-all group cursor-pointer"
          >
            <span>Solicitar Demonstração</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Protagonismo Visual: Mockup Interativo da Interface do ERP */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-[#E4EAE6] bg-white p-2 sm:p-3 shadow-[0_12px_40px_rgba(6,61,48,0.08)]">
            {/* Barra da Janela do ERP */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#F8FAF9] rounded-t-xl border-b border-[#E4EAE6] text-xs text-[#66736D]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="ml-2 font-mono text-[11px] text-[#202B28]/80 font-medium">
                  erp.huram.com.br · Visão Operacional Integrada
                </span>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#063D30] text-[10px] font-semibold border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Sistema em Operação
              </span>
            </div>

            {/* Painel Interno Demonstrativo da Interface Real do ERP */}
            <div className="bg-white p-4 sm:p-6 rounded-b-xl text-left space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6]">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#66736D] block mb-1">
                    Gestão Comercial
                  </span>
                  <div className="text-xl sm:text-2xl font-bold font-heading text-[#063D30]">
                    48 Pedidos
                  </div>
                  <div className="text-[11px] text-[#116B50] font-medium mt-1">
                    Fluxo integrado com faturamento
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6]">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#66736D] block mb-1">
                    Financeiro & Caixa
                  </span>
                  <div className="text-xl sm:text-2xl font-bold font-heading text-[#063D30]">
                    Conciliado
                  </div>
                  <div className="text-[11px] text-[#66736D] font-medium mt-1">
                    Contas a pagar/receber em dia
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6]">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#66736D] block mb-1">
                    WMS & Logística
                  </span>
                  <div className="text-xl sm:text-2xl font-bold font-heading text-[#063D30]">
                    12 Romaneios
                  </div>
                  <div className="text-[11px] text-[#116B50] font-medium mt-1">
                    Separação & expedição ativas
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-[#F8FAF9] border border-[#C69B45]/40 bg-[#FAF7F0]/40">
                  <span className="text-[11px] uppercase font-bold tracking-wider text-[#C69B45] block mb-1">
                    Assistente HURAM
                  </span>
                  <div className="text-xl sm:text-2xl font-bold font-heading text-[#063D30]">
                    On-line
                  </div>
                  <div className="text-[11px] text-[#C69B45] font-medium mt-1">
                    Consultas via linguagem natural
                  </div>
                </div>
              </div>

              {/* Linha de status rápido */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E4EAE6] text-xs text-[#66736D]">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#116B50]" />
                  Módulos integrados em base única (Skip Cloud)
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C69B45]" />
                  Trilhas de auditoria, MFA e matriz de permissões
                </span>
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-[#116B50]" />
                  BI com drill-down e exportação estruturada
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Destaques estruturais */}
        <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-white border border-[#E4EAE6] hover:border-[#116B50]/40 transition-all shadow-2xs hover:shadow-xs group">
            <div className="text-[#063D30] font-bold text-xs sm:text-sm mb-1 flex items-center gap-2 group-hover:text-[#116B50] transition-colors">
              <div className="w-7 h-7 rounded-lg bg-[#EBF3EF] flex items-center justify-center text-[#116B50]">
                <Zap className="w-4 h-4 text-[#116B50]" />
              </div>
              Gestão Integrada
            </div>
            <div className="text-[#66736D] text-[11px] sm:text-xs leading-relaxed pt-1">
              Vendas, estoque, financeiro e fiscal conectados em tempo real.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E4EAE6] hover:border-[#C69B45]/40 transition-all shadow-2xs hover:shadow-xs group">
            <div className="text-[#063D30] font-bold text-xs sm:text-sm mb-1 flex items-center gap-2 group-hover:text-[#C69B45] transition-colors">
              <div className="w-7 h-7 rounded-lg bg-[#FAF7F0] flex items-center justify-center text-[#C69B45]">
                <ShieldCheck className="w-4 h-4 text-[#C69B45]" />
              </div>
              Controle & Auditoria
            </div>
            <div className="text-[#66736D] text-[11px] sm:text-xs leading-relaxed pt-1">
              Logs completos, alçadas de aprovação e matriz por perfil.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E4EAE6] hover:border-[#E87517]/40 transition-all shadow-2xs hover:shadow-xs group">
            <div className="text-[#063D30] font-bold text-xs sm:text-sm mb-1 flex items-center gap-2 group-hover:text-[#E87517] transition-colors">
              <div className="w-7 h-7 rounded-lg bg-[#FDF4EC] flex items-center justify-center text-[#E87517]">
                <Bot className="w-4 h-4 text-[#E87517]" />
              </div>
              Duas Inteligências
            </div>
            <div className="text-[#66736D] text-[11px] sm:text-xs leading-relaxed pt-1">
              Jeh no atendimento ao visitante e HURAM On-line na operação interna.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#E4EAE6] hover:border-[#116B50]/40 transition-all shadow-2xs hover:shadow-xs group">
            <div className="text-[#063D30] font-bold text-xs sm:text-sm mb-1 flex items-center gap-2 group-hover:text-[#116B50] transition-colors">
              <div className="w-7 h-7 rounded-lg bg-[#EBF3EF] flex items-center justify-center text-[#116B50]">
                <BarChart3 className="w-4 h-4 text-[#116B50]" />
              </div>
              Universidade & Tours
            </div>
            <div className="text-[#66736D] text-[11px] sm:text-xs leading-relaxed pt-1">
              Treinamentos em vídeo, tutoriais e tours interativos na tela.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
