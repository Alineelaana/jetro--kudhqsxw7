import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Cpu,
  Sliders,
  Users2,
  Database,
  TrendingUp,
} from 'lucide-react'

export function WhyJetroSection() {
  const differentiators = [
    {
      title: 'Gestão Verdadeiramente Integrada',
      icon: Database,
      description:
        'Elimine a colcha de retalhos de planilhas e softwares que não conversam. Vendas, estoque, expedição, notas fiscais e financeiro operam sobre o mesmo banco de dados.',
    },
    {
      title: 'Inteligência Artificial Aplicada ao Negócio',
      icon: Cpu,
      description:
        'Não usamos IA como modismo: a Jeh atende e qualifica visitantes no site, enquanto o Jetro On-line atua dentro do ERP respondendo perguntas gerenciais e gerando gráficos.',
    },
    {
      title: 'Visibilidade Executiva & BI Nativo',
      icon: TrendingUp,
      description:
        'Tenha acesso instantâneo aos indicadores de margem real, fluxo de caixa diário, curva ABC de clientes e cumprimento de prazos sem depender de relatórios demorados.',
    },
    {
      title: 'Experiência Personalizada de Navegação',
      icon: Sliders,
      description:
        'Com o componente Jetro Table, cada usuário adapta as colunas, filtros e visualizações da tela ao seu formato de trabalho, salvando preferências individuais.',
    },
    {
      title: 'Segurança, Permissões & Auditoria',
      icon: ShieldCheck,
      description:
        'Controle granular de acesso por perfil, suporte a autenticação de dois fatores (MFA) e histórico completo de alterações (quem fez, quando, o quê e de onde).',
    },
    {
      title: 'Capacitação Contínua Integrada',
      icon: Users2,
      description:
        'Universidade corporativa integrada com vídeos e tours passo a passo que reduzem o atrito de implantação e tornam o treinamento de novos membros imediato.',
    },
  ]

  return (
    <section
      id="diferenciais"
      className="py-20 sm:py-28 bg-[#00140b] text-white border-t border-white/5"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-12">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-[#C9A227]/30 text-[#f6d77c] text-xs font-bold uppercase tracking-wider">
            Diferenciais de Arquitetura
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Por que conhecer o <span className="text-[#C9A227]">Jetro?</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Uma plataforma de gestão empresarial desenvolvida para integrar processos, organizar
            informações, acompanhar operações e transformar dados em conhecimento para decisões mais
            inteligentes.
          </p>
        </div>

        {/* Grid de 6 Diferenciais Estruturados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentiators.map((diff, i) => {
            const Icon = diff.icon
            return (
              <div
                key={i}
                className="rounded-2xl bg-slate-950/70 border border-white/10 p-6 flex flex-col justify-between hover:border-[#C9A227]/50 transition-all duration-300 group shadow-lg"
              >
                <div className="space-y-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-[#C9A227] group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#f6d77c] transition-colors">
                    {diff.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {diff.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-2 text-xs text-[#f6d77c] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
                  <span>Disponível e testado no ERP real</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Compromisso de integridade da comunicação */}
        <div className="rounded-2xl bg-slate-950 border border-white/10 p-6 sm:p-8 text-center max-w-4xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C9A227] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Transparência Absoluta
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Não anunciamos números fictícios de clientes, cases inventados ou certificações não
            oficiais. Apresentamos exatamente o produto que você e sua equipe irão operar no dia a
            dia.
          </p>
        </div>
      </div>
    </section>
  )
}
