import { Building2, Cpu, CheckCircle2, ShieldCheck, Database, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AboutJetroSection() {
  const pillars = [
    {
      title: 'Integração Nativa sem Remendos',
      description:
        'Todos os módulos operam sob um modelo de dados relacional unificado. Um pedido registrado reflete instantaneamente no WMS, reserva estoque, alimenta a conciliação financeira e prepara a nota fiscal.',
    },
    {
      title: 'Decisões com Base em Fatos',
      description:
        'Transforme dados transacionais em conhecimento gerencial. Dashboards de BI com drill-down, simulações de cenários e agendamento de relatórios levam a diretoria além do achismo.',
    },
    {
      title: 'Inteligência Artificial Integrada',
      description:
        'Dois assistentes especializados em funções complementares: recepção humanizada e triagem de oportunidades pelo site (Jeh) e análises operacionais em linguagem natural no ERP (HURAM On-line).',
    },
  ]

  const handleCTA = () => {
    const el = document.getElementById('contato')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="sobre"
      className="py-20 sm:py-28 bg-[#F8FAF9] text-[#202B28] border-b border-[#E4EAE6]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-12">
        {/* Posicionamento Principal */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1F4F2] border border-[#063D30]/15 text-[#063D30] text-xs font-semibold tracking-wide">
            Posicionamento Institucional
          </div>

          <h2 className="text-3xl sm:text-5xl font-semibold font-heading text-[#063D30] tracking-tight leading-tight">
            Inteligência que conecta <span className="text-[#116B50]">sua gestão.</span>
          </h2>

          <p className="text-[#66736D] text-base sm:text-lg lg:text-xl leading-relaxed font-normal">
            Uma plataforma de gestão empresarial desenvolvida para integrar processos, organizar
            informações, acompanhar operações e transformar dados em conhecimento para decisões mais
            inteligentes.
          </p>
        </div>

        {/* 3 Blocos Estruturais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {pillars.map((p, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-[#E4EAE6] p-6 sm:p-8 flex flex-col justify-between hover:border-[#116B50]/40 transition-all duration-300 group shadow-sm hover:shadow-md"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6] flex items-center justify-center text-[#063D30] font-semibold font-heading text-sm group-hover:border-[#116B50]/40 transition-colors">
                  0{idx + 1}
                </div>
                <h3 className="text-lg font-semibold font-heading text-[#063D30] group-hover:text-[#116B50] transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed font-normal">
                  {p.description}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-[#E4EAE6] flex items-center gap-2 text-xs text-[#063D30] font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#116B50]" />
                <span>Pilar ativo no ERP</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quadro Institucional Tecnológico */}
        <div className="rounded-2xl bg-white border border-[#E4EAE6] p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C69B45]">
                Arquitetura Corporativa
              </span>
              <h3 className="text-2xl sm:text-3xl font-semibold font-heading text-[#063D30] leading-snug">
                Desenvolvido para sustentar o crescimento sustentável da sua empresa
              </h3>
              <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed font-normal">
                Empresas em expansão enfrentam o desafio da fragmentação de controles: uma planilha
                para preços, outra para faturamento, anotações de estoque e relatórios defasados. O
                HURAM centraliza essa engrenagem em uma arquitetura segura, com banco de dados em
                nuvem, controle de sessões e auditoria contínua.
              </p>
              <div className="pt-2">
                <Button
                  onClick={handleCTA}
                  className="bg-[#063D30] hover:bg-[#042820] text-white font-semibold text-xs sm:text-sm px-6 py-5 rounded-xl cursor-pointer shadow-sm hover:shadow transition-all"
                >
                  <span>Converse com um especialista</span>
                  <ArrowRight className="w-4 h-4 ml-2 text-[#C69B45]" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6] space-y-1.5 text-left">
                <Database className="w-5 h-5 text-[#116B50]" />
                <h4 className="text-sm font-semibold font-heading text-[#063D30]">Base Única</h4>
                <p className="text-xs text-[#66736D] leading-relaxed">
                  Sem duplicidade de cadastros e com integridade referencial.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6] space-y-1.5 text-left">
                <ShieldCheck className="w-5 h-5 text-[#C69B45]" />
                <h4 className="text-sm font-semibold font-heading text-[#063D30]">Governança</h4>
                <p className="text-xs text-[#66736D] leading-relaxed">
                  Trilha de auditoria por criticidade e alçadas de decisão.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6] space-y-1.5 text-left">
                <Cpu className="w-5 h-5 text-[#116B50]" />
                <h4 className="text-sm font-semibold font-heading text-[#063D30]">IA Nativa</h4>
                <p className="text-xs text-[#66736D] leading-relaxed">
                  Jeh e HURAM On-line operando dentro dos limites de segurança.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6] space-y-1.5 text-left">
                <Building2 className="w-5 h-5 text-[#063D30]" />
                <h4 className="text-sm font-semibold font-heading text-[#063D30]">Multiempresa</h4>
                <p className="text-xs text-[#66736D] leading-relaxed">
                  Estrutura preparada para matrizes, filiais e múltiplos depósitos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
