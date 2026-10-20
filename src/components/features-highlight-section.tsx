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
    <section className="py-20 sm:py-28 bg-white text-[#202B28] border-b border-[#E4EAE6]">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-12">
        {/* Cabeçalho */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1F4F2] border border-[#063D30]/15 text-[#063D30] text-xs font-semibold tracking-wide">
            Recursos Operacionais em Destaque
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-heading text-[#063D30] tracking-tight">
            Tecnologia prática pensada para o <span className="text-[#116B50]">dia a dia.</span>
          </h2>
          <p className="text-[#66736D] text-sm sm:text-base leading-relaxed font-normal">
            Funcionalidades construídas para resolver gargalos reais de operação. Sem excesso de
            cliques, sem complexidade desnecessária.
          </p>
        </div>

        {/* Grid de Recursos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
          {features.map((f, i) => {
            const Icon = f.icon
            const iconBgStyles = [
              'bg-[#EBF3EF] border-[#116B50]/20 text-[#116B50]',
              'bg-[#FAF7F0] border-[#C69B45]/30 text-[#C69B45]',
              'bg-[#FDF4EC] border-[#E87517]/25 text-[#E87517]',
              'bg-[#F1F4F2] border-[#063D30]/15 text-[#063D30]',
              'bg-[#EBF3EF] border-[#116B50]/20 text-[#116B50]',
            ]
            const chosenStyle = iconBgStyles[i % iconBgStyles.length]

            return (
              <div
                key={i}
                className="rounded-xl bg-[#F8FAF9]/70 hover:bg-white border border-[#E4EAE6] p-4 sm:p-5 hover:border-[#116B50]/40 transition-all duration-300 flex flex-col justify-between group shadow-2xs hover:shadow-md"
              >
                <div className="space-y-3">
                  <div
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center group-hover:scale-105 transition-transform ${chosenStyle}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold font-heading text-[#063D30] group-hover:text-[#116B50] transition-colors leading-snug">
                    {f.title}
                  </h3>
                  <p className="text-[11px] text-[#66736D] leading-relaxed font-normal">
                    {f.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
