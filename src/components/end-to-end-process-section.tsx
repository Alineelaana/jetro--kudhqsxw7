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
    <section
      id="fluxo"
      className="py-20 sm:py-28 bg-white text-[#202B28] border-b border-[#E4EAE6]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-12">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1F4F2] border border-[#063D30]/15 text-[#063D30] text-xs font-semibold tracking-wide">
            Processos Corporativos Conectados
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-heading text-[#063D30] tracking-tight">
            Gestão conectada de <span className="text-[#116B50]">ponta a ponta.</span>
          </h2>
          <p className="text-[#66736D] text-sm sm:text-base leading-relaxed font-normal">
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
                className="relative rounded-2xl bg-white border border-[#E4EAE6] p-5 sm:p-6 flex flex-col justify-between hover:border-[#116B50]/40 transition-all duration-300 group shadow-xs hover:shadow-md text-left"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-heading text-[#063D30] tracking-tight">
                      {s.step}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6] flex items-center justify-center text-[#116B50] group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C69B45] block">
                      {s.subtitle}
                    </span>
                    <h3 className="text-base font-semibold font-heading text-[#063D30] group-hover:text-[#116B50] transition-colors mt-0.5">
                      {s.title}
                    </h3>
                  </div>

                  <p className="text-xs text-[#66736D] leading-relaxed font-normal">
                    {s.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E4EAE6] space-y-1">
                  <span className="text-[9px] uppercase font-semibold text-[#116B50] block tracking-wider">
                    Resultado da etapa:
                  </span>
                  <div className="text-[11px] text-[#202B28]/80 flex items-start gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#116B50] shrink-0 mt-0.5" />
                    <span>{s.output}</span>
                  </div>
                </div>

                {/* Seta indicativa para desktop entre cards (exceto último) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-[#E4EAE6] items-center justify-center text-[#063D30] shadow-xs pointer-events-none">
                    <ArrowRight className="w-3 h-3 text-[#116B50]" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quadro de Governança do Processo */}
        <div className="rounded-2xl bg-[#F8FAF9] border border-[#E4EAE6] p-6 sm:p-8 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="space-y-2 lg:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C69B45]">
                Segurança em Cada Transição
              </span>
              <h3 className="text-xl sm:text-2xl font-semibold font-heading text-[#063D30]">
                Rastreabilidade integral sem brechas operacionais
              </h3>
              <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed font-normal">
                Todas as alterações de status, aprovações de desconto, cancelamentos ou emissões
                geram registros invioláveis na trilha de auditoria do Jetro, com usuário, data, IP,
                valores anteriores e justificativas.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5">
              <div className="p-3 rounded-xl bg-white border border-[#E4EAE6] text-xs text-[#202B28] flex items-center gap-2.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#116B50] shrink-0" />
                <span className="font-normal">Alçadas de aprovação para regras sensíveis</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E4EAE6] text-xs text-[#202B28] flex items-center gap-2.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#116B50] shrink-0" />
                <span className="font-normal">Reserva e baixa automática em estoque</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E4EAE6] text-xs text-[#202B28] flex items-center gap-2.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#116B50] shrink-0" />
                <span className="font-normal">Geração de financeiro vinculada à nota fiscal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
