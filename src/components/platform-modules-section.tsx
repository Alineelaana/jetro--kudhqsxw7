import {
  TrendingUp,
  DollarSign,
  Receipt,
  Truck,
  Shield,
  Users,
  LineChart,
  Megaphone,
  Layers,
  FileSpreadsheet,
  Headphones,
  BrainCircuit,
  GraduationCap,
  CalendarDays,
  FileCheck2,
} from 'lucide-react'

interface ModuleItem {
  id: string
  title: string
  category: string
  icon: React.ElementType
  description: string
  status: 'Funcional' | 'Em desenvolvimento'
  highlights: string[]
}

export function PlatformModulesSection() {
  const modules: ModuleItem[] = [
    {
      id: 'comercial',
      title: 'Gestão Comercial & CRM',
      category: 'Vendas & Relacionamento',
      icon: TrendingUp,
      status: 'Funcional',
      description:
        'Ciclo comercial completo: cadastro qualificado de clientes PF/PJ, orçamentos, pedidos de venda com reserva de estoque, regras de comissionamento, múltiplos canais e funil de vendas integrado.',
      highlights: [
        'Pedidos de venda com status e histórico',
        'Controle de limites e regras de comissão',
        'Cotações e propostas com alçadas',
        'Funil CRM e histórico consolidado',
      ],
    },
    {
      id: 'financeiro',
      title: 'Gestão Financeira & Cobrança',
      category: 'Finanças & Controladoria',
      icon: DollarSign,
      status: 'Funcional',
      description:
        'Controle rigoroso de contas a pagar e a receber, conciliação bancária por extrato, fluxo de caixa diário/projetado, centro de cobrança ativo com réguas e liquidação via Pix, boletos e cartões.',
      highlights: [
        'Contas a pagar e receber com centros de custo',
        'Centro de cobrança executivo com régua de ações',
        'Fechamento e conciliação bancária',
        'Transferências, caixas e aprovações financeiras',
      ],
    },
    {
      id: 'fiscal',
      title: 'Gestão Fiscal & Tributária',
      category: 'Conformidade Fiscal',
      icon: Receipt,
      status: 'Funcional',
      description:
        'Emissão e controle de NF-e, NFS-e, CT-e e MDF-e, manifestação do destinatário, cartas de correção, apuração de impostos e simulações para a Reforma Tributária (IBS/CBS).',
      highlights: [
        'Emissão e gestão de NF-e e NFC-e',
        'Painel integrado para NFS-e, CT-e e MDF-e',
        'Manifestação e cartas de correção',
        'Simulador da Reforma Tributária (IBS/CBS)',
      ],
    },
    {
      id: 'logistica-wms',
      title: 'Operações, Logística & WMS',
      category: 'Cadeia de Suprimentos',
      icon: Truck,
      status: 'Funcional',
      description:
        'Orquestração logística de ponta a ponta: gestão de armazém (WMS com recebimento, putaway, ondas, separação e conferência cega), romaneios, frotas, motoristas, rastreamento de entregas e logística reversa.',
      highlights: [
        'WMS completo (recebimento, ondas, separação e conferência)',
        'Controle de frotas, motoristas e tabelas de frete',
        'Roteirização de entregas e comprovantes (POD)',
        'Logística reversa e ocorrências em trânsito',
      ],
    },
    {
      id: 'governanca-seguranca',
      title: 'Administração, Governança & Auditoria',
      category: 'Segurança & Governança',
      icon: Shield,
      status: 'Funcional',
      description:
        'Segurança corporativa em múltiplos níveis: matriz detalhada de permissões por perfil, autenticação multifator (MFA), trilha de auditoria completa (audit logs), sessões ativas e backups versionados.',
      highlights: [
        'Trilha de auditoria com criticidade e origem de ação',
        'Matriz de permissões por tela e perfil',
        'Autenticação multifator (MFA / 2FA)',
        'Backups do banco e exportação de dados',
      ],
    },
    {
      id: 'dp-rh',
      title: 'Departamento Pessoal & RH',
      category: 'Capital Humano',
      icon: Users,
      status: 'Funcional',
      description:
        'Gestão completa do ciclo do colaborador: admissões, contratos de trabalho, ponto eletrônico com banco de horas, férias, desligamentos, monitor eSocial, FGTS Digital e módulos de SST (NR-1, PGR, PCMSO e ASO).',
      highlights: [
        'Registro de ponto, banco de horas e extras',
        'Férias, afastamentos e cálculo rescisório',
        'Monitor eSocial e conformidade trabalhista',
        'Segurança do Trabalho: NR-1, PGR, PCMSO e ASO',
      ],
    },
    {
      id: 'bi-inteligencia',
      title: 'Inteligência & Análise de Dados (BI)',
      category: 'Visão Estratégica',
      icon: LineChart,
      status: 'Funcional',
      description:
        'Centro analítico multimodular com dashboards executivos, drill-down em tempo real, cruzamento entre vendas, estoque e margens, projeções com cenários e agendamento de relatórios periódicos por e-mail.',
      highlights: [
        'Dashboards executivo, comercial e financeiro',
        'Análises cruzadas de margem, custo e giro',
        'Agendamento automático de relatórios por e-mail',
        'Filtros salvos e exportação em Excel/CSV/PDF',
      ],
    },
    {
      id: 'marketing-enterprise',
      title: 'Marketing Enterprise & Criativo',
      category: 'Comunicação & Campanhas',
      icon: Megaphone,
      status: 'Funcional',
      description:
        'Gestão de demandas e ativos de marketing: central de briefings com templates padronizados, fluxo de aprovação de peças, calendário editorial integrado, biblioteca de marca e histórico de versões.',
      highlights: [
        'Templates de briefing e solicitações criativas',
        'Fluxo de aprovação de peças com anotações',
        'Calendário editorial de publicações',
        'Biblioteca de ativos e controle de versões',
      ],
    },
    {
      id: 'verbas',
      title: 'Gestão de Verbas & Acordos Comerciais',
      category: 'Trade & Comercial',
      icon: Layers,
      status: 'Funcional',
      description:
        'Controle rigoroso de verbas de fornecedores e acordos de trade marketing: acompanhamento de saldo disponível, apuração por produto/linha, comprovações e liquidação vinculada ao faturamento.',
      highlights: [
        'Contratos e saldos de verbas de fornecedores',
        'Apuração por campanha e período',
        'Comprovações de execução de mídia e trade',
        'Integração com contas a receber/pagar',
      ],
    },
    {
      id: 'planilhas-convertidas',
      title: 'Planilhas Convertidas & Jetro Table',
      category: 'Produtividade & Operação',
      icon: FileSpreadsheet,
      status: 'Funcional',
      description:
        'Transformação de planilhas operacionais e financeiras em telas estruturadas dentro do ERP, mantendo flexibilidade de cálculo com governança, histórico, permissões e componente Jetro Table.',
      highlights: [
        'Componente Jetro Table com ordenação e visibilidade de colunas',
        'Preservação de regras de negócio sem quebra de fórmulas',
        'Exportação rápida para Excel e relatórios formatados',
        'Controle de quem edita e quem apenas visualiza',
      ],
    },
    {
      id: 'chamados-atendimento',
      title: 'Central de Chamados & Atendimento',
      category: 'Suporte & SLA',
      icon: Headphones,
      status: 'Funcional',
      description:
        'Atendimento interno e suporte operacional organizado por setores, motivos de contato, fluxos com triagem automática, controle estrito de SLA e relatórios de tempo de resposta.',
      highlights: [
        'Abertura e tramitação com histórico de mensagens',
        'Controle de SLA por criticidade e setor',
        'Filas de atendimento e distribuição de responsáveis',
        'Relatórios de produtividade e resolutividade',
      ],
    },
    {
      id: 'ia-dupla',
      title: 'Arquitetura de Duas IAs (Jeh & Jetro On-line)',
      category: 'Inteligência Artificial Nativa',
      icon: BrainCircuit,
      status: 'Funcional',
      description:
        'Duas inteligências complementares: a assistente Jeh dedicada à recepção comercial, triagem e captação de leads, e o Jetro On-line como copiloto interno para consultas analíticas e navegação no ERP.',
      highlights: [
        'Jeh: triagem comercial e base de conhecimento no site',
        'Jetro On-line: copiloto em linguagem natural e gráficos',
        'Respeito rigoroso aos perfis e permissões internas',
        'Integração transparente ao fluxo de vendas e CRM',
      ],
    },
    {
      id: 'universidade-tours',
      title: 'Universidade Jetro & Tours Guiados',
      category: 'Capacitação & Adoção',
      icon: GraduationCap,
      status: 'Funcional',
      description:
        'Aceleração da curva de aprendizado da equipe com vídeos tutoriais divididos por módulo, manuais práticos e tours interativos passo a passo sobrepostos às telas reais do sistema.',
      highlights: [
        'Vídeos de capacitação organizados por módulo',
        'Tours interativos na própria interface do sistema',
        'Busca rápida de tutoriais e procedimentos padrão',
        'Orientação guiada para novos colaboradores',
      ],
    },
    {
      id: 'agenda-executiva',
      title: 'Agenda & Compromissos Corporativos',
      category: 'Produtividade & Gestão de Tempo',
      icon: CalendarDays,
      status: 'Funcional',
      description:
        'Agenda executiva centralizada para compromissos de negócios, reuniões comerciais, prazos de entrega e marcos operacionais, com lembretes automáticos e vinculação a clientes e parceiros.',
      highlights: [
        'Visão mensal, semanal e lista consolidada',
        'Lembretes vinculados a pedidos e cobranças',
        'Filtro por responsável e tipo de compromisso',
        'Registro de notas e encaminhamentos',
      ],
    },
    {
      id: 'pcp-industria',
      title: 'Planejamento e Controle da Produção (PCP)',
      category: 'Indústria & Manufatura',
      icon: FileCheck2,
      status: 'Em desenvolvimento',
      description:
        'Módulo industrial avançado em consolidação: estruturas de produto (BOM), rotas de fabricação, fases de produção, capacidade instalada, ordens de produção e rastreabilidade fabril.',
      highlights: [
        'Engenharia de produtos e listas técnicas (BOM)',
        'Ordens de produção com apontamentos parciais',
        'Cockpit fabril e capacidade de máquinas',
        'Previsão de conclusão conforme cronograma técnico',
      ],
    },
  ]

  return (
    <section
      id="solucoes"
      className="py-20 sm:py-28 bg-white text-[#202B28] border-b border-[#E4EAE6]"
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-12">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F1F4F2] border border-[#063D30]/15 text-[#063D30] text-xs font-semibold tracking-wide">
            Soluções & Módulos Integrados
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-heading text-[#063D30] tracking-tight">
            Uma plataforma. <span className="text-[#116B50]">Diferentes áreas da sua empresa.</span>
          </h2>
          <p className="text-[#66736D] text-sm sm:text-base leading-relaxed font-normal">
            O Jetro unifica os departamentos operacionais, administrativos e estratégicos da sua
            organização em um único sistema, eliminando controles isolados e retrabalho.
          </p>
        </div>

        {/* Grid de Módulos Reais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m) => {
            const Icon = m.icon
            const isDev = m.status === 'Em desenvolvimento'
            return (
              <div
                key={m.id}
                className="group relative rounded-2xl p-6 sm:p-7 bg-white border border-[#E4EAE6] hover:border-[#116B50]/40 transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md text-left"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6] flex items-center justify-center text-[#063D30] group-hover:scale-105 group-hover:border-[#116B50]/40 transition-all">
                      <Icon className="w-5 h-5 text-[#116B50]" />
                    </div>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                        isDev
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-[#063D30] border-emerald-200'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-[#C69B45] tracking-wider uppercase block">
                      {m.category}
                    </span>
                    <h3 className="text-lg font-semibold font-heading text-[#063D30] group-hover:text-[#116B50] transition-colors mt-0.5">
                      {m.title}
                    </h3>
                  </div>

                  <p className="text-[#66736D] text-xs sm:text-sm leading-relaxed font-normal">
                    {m.description}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-[#E4EAE6]">
                  <ul className="space-y-2">
                    {m.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="text-[11px] sm:text-xs text-[#202B28]/80 flex items-start gap-2 font-normal"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#116B50] mt-1.5 shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>

        {/* Nota de transparência técnica */}
        <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E4EAE6] text-center max-w-3xl mx-auto">
          <p className="text-xs text-[#66736D] leading-relaxed">
            <strong className="text-[#202B28] font-semibold">Compromisso com a realidade:</strong>{' '}
            todos os módulos classificados como funcionais estão ativos na base oficial do Jetro ERP
            na Skip Cloud, disponíveis para demonstração com dados homologados.
          </p>
        </div>
      </div>
    </section>
  )
}
