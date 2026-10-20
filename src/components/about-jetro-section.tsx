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
    <section id="sobre" className="py-20 sm:py-28 bg-[#00140b] text-white border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-12">
        {/* Posicionamento Principal */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-[#C9A227]/30 text-[#f6d77c] text-xs font-bold uppercase tracking-wider">
            Posicionamento Institucional
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Inteligência que conecta <span className="text-[#C9A227]">sua gestão.</span>
          </h2>

          <p className="text-slate-200 text-base sm:text-lg lg:text-xl leading-relaxed font-medium">
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
              className="rounded-2xl bg-slate-950/70 border border-white/10 p-6 flex flex-col justify-between hover:border-[#C9A227]/50 transition-all duration-300 group shadow-lg"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-[#C9A227] font-black text-sm group-hover:scale-105 transition-transform">
                  0{idx + 1}
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#f6d77c] transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{p.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-1.5 text-xs text-[#f6d77c] font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
                <span>Pilar ativo no ERP</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quadro Institucional Tecnológico */}
        <div className="rounded-2xl bg-slate-950 border border-[#C9A227]/30 p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
                Arquitetura Corporativa
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Desenvolvido para sustentar o crescimento sustentável da sua empresa
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Empresas em expansão enfrentam o desafio da fragmentação de controles: uma planilha
                para preços, outra para faturamento, anotações de estoque e relatórios defasados. O
                HURAM centraliza essa engrenagem em uma arquitetura segura, com banco de dados em
                nuvem, controle de sessões e auditoria contínua.
              </p>
              <div className="pt-2">
                <Button
                  onClick={handleCTA}
                  className="bg-[#005A36] hover:bg-[#004225] border border-[#C9A227]/40 text-white font-bold text-xs sm:text-sm px-6 py-5 rounded-xl cursor-pointer"
                >
                  <span>Converse com um especialista</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
                <Database className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Base Única</h4>
                <p className="text-xs text-slate-400">
                  Sem duplicidade de cadastros e com integridade referencial.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
                <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
                <h4 className="text-sm font-bold text-white">Governança</h4>
                <p className="text-xs text-slate-400">
                  Trilha de auditoria por criticidade e alçadas de decisão.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
                <Cpu className="w-5 h-5 text-[#f6d77c]" />
                <h4 className="text-sm font-bold text-white">IA Nativa</h4>
                <p className="text-xs text-slate-400">
                  Jeh e HURAM On-line operando dentro dos limites de segurança.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Multiempresa</h4>
                <p className="text-xs text-slate-400">
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
