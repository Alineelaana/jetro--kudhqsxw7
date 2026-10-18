import {
  ArrowRight,
  CheckCircle2,
  UserCheck,
  ShoppingBag,
  Box,
  Receipt,
  PieChart,
} from 'lucide-react'

export function EndToEndProcessSection() {
  const steps = [
    {
      step: '01',
      title: 'Cadastro & Análise',
      subtitle: 'Comercial & Compliance',
      icon: UserCheck,
      description:
        'Cadastro unificado de clientes PF/PJ com validação cadastral, alçada de crédito, definição de tabelas de preço e vínculos com vendedores/RCA.',
      output: 'Cliente homologado e apto para negociações',
    },
    {
      step: '02',
      title: 'Negociação & Pedido',
      subtitle: 'Força de Vendas & CRM',
      icon: ShoppingBag,
      description:
        'Entrada de pedidos com reserva imediata de estoque, validação automática de rentabilidade, cálculo de impostos e alçadas de desconto por gestor.',
      output: 'Pedido emitido com saldo reservado',
    },
    {
      step: '03',
      title: 'Separação & WMS',
      subtitle: 'Cadeia de Suprimentos',
      icon: Box,
      description:
        'Geração de ondas de separação no WMS, conferência cega por leitor de código de barras, montagem de volumes, paletes e romaneio de expedição.',
      output: 'Carga conferida e romaneio pronto',
    },
    {
      step: '04',
      title: 'Faturamento & Fiscal',
      subtitle: 'Conformidade Eletrônica',
      icon: Receipt,
      description:
        'Autorização instantânea de NF-e, CT-e e MDF-e junto à SEFAZ, geração automática de títulos no contas a receber e emissão de boletos/Pix.',
      output: 'Documentos fiscais e financeiro liquidados',
    },
    {
      step: '05',
      title: 'Resultados & BI',
      subtitle: 'Inteligência Estratégica',
      icon: PieChart,
      description:
        'Atualização dos indicadores executivos de margem, giro, rentabilidade por produto/cliente e consultas analíticas pelo Jetro On-line.',
      output: 'Decisões embasadas em dados em tempo real',
    },
  ]

  return (
    <section id="fluxo" className="py-20 sm:py-28 bg-[#001c10] text-white border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-12">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-[#C9A227]/30 text-[#f6d77c] text-xs font-bold uppercase tracking-wider">
            Processos Corporativos Conectados
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Gestão conectada de <span className="text-[#C9A227]">ponta a ponta.</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Elimine silos operacionais. Do momento em que um cliente é cadastrado até a análise de
            rentabilidade gerencial, cada evento aciona as etapas seguintes sem necessidade de
            redigitação.
          </p>
        </div>

        {/* Diagrama de Fluxo Linear Responsivo */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon
            return (
              <div
                key={s.step}
                className="relative rounded-2xl bg-slate-950/70 border border-white/10 p-5 flex flex-col justify-between hover:border-[#C9A227]/50 transition-all duration-300 group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#C9A227] tracking-tight">
                      {s.step}
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-[#C9A227] group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {s.subtitle}
                    </span>
                    <h3 className="text-base font-bold text-white group-hover:text-[#f6d77c] transition-colors mt-0.5">
                      {s.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{s.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 space-y-1">
                  <span className="text-[9px] uppercase font-bold text-emerald-400 block tracking-wider">
                    Resultado da etapa:
                  </span>
                  <div className="text-[11px] text-slate-300 flex items-start gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                    <span>{s.output}</span>
                  </div>
                </div>

                {/* Seta indicativa para desktop entre cards (exceto último) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[#002817] border border-[#C9A227]/60 items-center justify-center text-[#C9A227] shadow-md pointer-events-none">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quadro de Governança do Processo */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950/80 to-emerald-950/40 border border-[#C9A227]/30 p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="space-y-2 lg:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
                Segurança em Cada Transição
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Rastreabilidade integral sem brechas operacionais
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Todas as alterações de status, aprovações de desconto, cancelamentos ou emissões
                geram registros invioláveis na trilha de auditoria do Jetro, com usuário, data, IP,
                valores anteriores e justificativas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Alçadas de aprovação para regras sensíveis</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Reserva e baixa automática em estoque</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span>Geração de financeiro vinculada à nota fiscal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
