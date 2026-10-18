import {
  Link2,
  Bot,
  SlidersHorizontal,
  Table,
  MailCheck,
  ShieldAlert,
  Headset,
  FileCode2,
  GraduationCap,
  History,
} from 'lucide-react'

export function FeaturesHighlightSection() {
  const features = [
    {
      title: 'Jetro Table: Ordenação & Visibilidade',
      icon: Table,
      description:
        'Personalize colunas, ordene múltiplos campos, salve preferências por usuário e oculte dados não essenciais para uma navegação ágil.',
    },
    {
      title: 'Filtros Multidimensionais Avançados',
      icon: SlidersHorizontal,
      description:
        'Pesquise pedidos, notas, títulos e clientes combinando múltiplos critérios simultâneos (data, filial, status, valor, canal e vendedor).',
    },
    {
      title: 'Agendamento de Relatórios por E-mail',
      icon: MailCheck,
      description:
        'Configure o envio automático de relatórios consolidados em horários pré-definidos para a diretoria e gestores de departamento.',
    },
    {
      title: 'Assistência por Inteligência Artificial',
      icon: Bot,
      description:
        'Consulte indicadores e tire dúvidas em linguagem natural com o Jetro On-line e faça triagem inicial de visitantes com a assistente Jeh.',
    },
    {
      title: 'Trilha de Auditoria & Histórico de Logs',
      icon: History,
      description:
        'Registro detalhado de cada ação no sistema com identificação de usuário, IP, dados alterados, horário e criticidade da ocorrência.',
    },
    {
      title: 'Matriz Granular de Permissões',
      icon: ShieldAlert,
      description:
        'Defina exatamente quem pode visualizar, criar, editar ou excluir registros em cada tela e módulo por meio de perfis customizados.',
    },
    {
      title: 'Central de Chamados com SLA',
      icon: Headset,
      description:
        'Canal estruturado de chamados internos e suporte por setor, com cronômetro de SLA, histórico de mensagens e relatórios de resolução.',
    },
    {
      title: 'Tours Guiados na Própria Interface',
      icon: GraduationCap,
      description:
        'Passo a passo interativo diretamente sobre a tela de uso, ensinando rotinas sem depender de apresentações longas ou apostilas.',
    },
    {
      title: 'Documentação Técnica de Telas',
      icon: FileCode2,
      description:
        'Manual descritivo integrado a cada tela do ERP, detalhando o propósito operacional, regras de negócio e validações dos campos.',
    },
    {
      title: 'Base Única & Integração Contínua',
      icon: Link2,
      description:
        'Banco de dados relacional unificado na nuvem que mantém vendas, financeiro, fiscal e estoque sincronizados a cada segundo.',
    },
  ]

  return (
    <section className="py-20 sm:py-28 bg-[#001c10] text-white border-t border-white/5">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-12">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-[#C9A227]/30 text-[#f6d77c] text-xs font-bold uppercase tracking-wider">
            Recursos Operacionais em Destaque
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Tecnologia prática pensada para o <span className="text-[#C9A227]">dia a dia.</span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Funcionalidades construídas para resolver gargalos reais de operação. Sem excesso de
            cliques, sem complexidade desnecessária.
          </p>
        </div>

        {/* Grid de Recursos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <div
                key={i}
                className="rounded-xl bg-slate-950/70 border border-white/10 p-4 hover:border-[#C9A227]/40 transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-500/20 flex items-center justify-center text-[#C9A227] group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#f6d77c] transition-colors leading-snug">
                    {f.title}
                  </h3>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{f.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
