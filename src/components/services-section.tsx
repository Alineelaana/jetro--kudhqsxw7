import {
  Briefcase,
  Truck,
  Building2,
  Factory,
  Store,
  Network,
  BarChart3,
  Brain,
  DollarSign,
  Users,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ServicesSectionProps {
  onSelectService?: (serviceTitle: string) => void
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const segments = [
    {
      id: 'servicos',
      title: 'Prestadoras de Serviços',
      icon: Briefcase,
      badge: 'Serviços & B2B',
      description:
        'Gestão comercial, contratos, equipes, financeiro, atendimento, indicadores e performance.',
      features: [
        'Gestão de Contratos e Medições',
        'Financeiro & Contas a Receber',
        'Atendimento e SLA de Chamados',
        'Performance e Produtividade de Equipes',
      ],
    },
    {
      id: 'distribuidoras',
      title: 'Distribuidoras',
      icon: Truck,
      badge: 'Distribuição & Logística',
      description:
        'Compras, vendas, estoque, fornecedores, verbas, crédito, cobrança, logística, financeiro e inteligência comercial.',
      features: [
        'Controle WMS e Armazenagem',
        'Gestão de Verbas de Fornecedor',
        'Análise de Crédito e Cobrança',
        'Logística e Roteirização',
      ],
    },
    {
      id: 'atacadistas',
      title: 'Atacadistas',
      icon: Building2,
      badge: 'Atacado & B2B',
      description:
        'Gestão de clientes, preços, margens, estoque, compras, vendas, crédito e rentabilidade.',
      features: [
        'Tabelas de Preços e Margens Flexíveis',
        'Aprovação de Alçadas de Desconto',
        'Limites de Crédito e Risco',
        'Rentabilidade por Canal e Cliente',
      ],
    },
    {
      id: 'industrias',
      title: 'Indústrias',
      icon: Factory,
      badge: 'Manufatura & Produção',
      description:
        'Planejamento, produção, custos, estoque, compras, qualidade, manutenção, vendas e indicadores.',
      features: [
        'PCP, Apontamentos e APS',
        'Estrutura BOM & Engenharia',
        'Custos Industriais e Absorção',
        'Rastreabilidade e Qualidade',
      ],
    },
    {
      id: 'comerciais',
      title: 'Empresas Comerciais',
      icon: Store,
      badge: 'Varejo & Comercial',
      description:
        'CRM, vendas, metas, clientes, propostas, faturamento, financeiro e performance.',
      features: [
        'CRM de Vendas e Oportunidades',
        'Metas Comerciais e Rankings',
        'Propostas e Orçamentos Rápidos',
        'Faturamento e Financeiro Integrado',
      ],
    },
    {
      id: 'multicompanhia',
      title: 'Operações Multicompanhia',
      icon: Network,
      badge: 'Corporativo & Filiais',
      description:
        'Gestão de empresas, filiais, unidades e operações com governança e visão consolidada.',
      features: [
        'Consolidação de DRE e Balanço',
        'Matriz de Permissões e Alçadas',
        'Transações Intercompany',
        'Trilhas de Auditoria e Governança',
      ],
    },
  ]

  const modulesGrid = [
    {
      name: 'Gestão Financeira',
      icon: DollarSign,
      desc: 'Contas a pagar/receber, fluxo de caixa, tesouraria e conciliação',
    },
    {
      name: 'Comercial & CRM',
      icon: Store,
      desc: 'Funil de vendas, pedidos, faturamento, contratos e metas',
    },
    {
      name: 'Compras & Suprimentos',
      icon: Package,
      desc: 'Cotações, ordens de compra, homologação e suprimentos',
    },
    {
      name: 'Estoque & WMS',
      icon: Layers,
      desc: 'Armazenagem, inventário, lotes, validade e movimentações',
    },
    {
      name: 'Produção & Indústria',
      icon: Factory,
      desc: 'PCP, ordens de produção, custos absorvidos e qualidade',
    },
    {
      name: 'Controladoria',
      icon: BarChart3,
      desc: 'DRE analítica, DFC, balanço, orçado x realizado e KPI',
    },
    {
      name: 'RH & Pessoas',
      icon: Users,
      desc: 'Cargos, salários, treinamentos, avaliações e engajamento',
    },
    {
      name: 'Departamento Pessoal',
      icon: Users,
      desc: 'Folha de pagamento, eSocial, férias, rescisões e ponto',
    },
    {
      name: 'SST & Segurança',
      icon: ShieldCheck,
      desc: 'GRO, PGR, PCMSO, ASO, EPIs e exames ocupacionais',
    },
    {
      name: 'Marketing Enterprise',
      icon: Sparkles,
      desc: 'Briefings, aprovação de peças, campanhas e mídia',
    },
    {
      name: 'Trade Marketing',
      icon: BarChart3,
      desc: 'Verbas de fornecedores, campanhas promocionais e acordos',
    },
    {
      name: 'Central de Atendimento',
      icon: Briefcase,
      desc: 'Chamados, tickets, SLA e satisfação do cliente',
    },
    {
      name: 'BI & Analytics',
      icon: BarChart3,
      desc: 'Dashboards executivos, visões cruzadas e projeções',
    },
    {
      name: 'Inteligência Artificial (Nine)',
      icon: Brain,
      desc: 'Assistente inteligente para dados, consultas e suporte',
    },
  ]

  const deliverablesPillars = [
    {
      title: 'Gestão Integrada',
      desc: 'Conecte todos os departamentos do seu negócio sem duplicar digitações ou criar ilhas de informação.',
    },
    {
      title: 'Inteligência Empresarial',
      desc: 'Cruze dados financeiros, operacionais e comerciais em dashboards claros para decisões estratégicas.',
    },
    {
      title: 'Automação de Processos',
      desc: 'Workflows inteligentes que reduzem trabalhos manuais, eliminam gargalos e evitam erros operacionais.',
    },
    {
      title: 'Gestão Financeira Avançada',
      desc: 'Controle total de caixa, inadimplência, conciliação bancária, DRE real e gestão de centro de custos.',
    },
    {
      title: 'Gestão Comercial Estruturada',
      desc: 'Funil de vendas transparente, limites de crédito, tabelas de preço flexíveis e comissionamento.',
    },
    {
      title: 'Gestão de Pessoas & Compliance',
      desc: 'Módulos completos de RH, Departamento Pessoal com eSocial e Saúde e Segurança do Trabalho (SST).',
    },
    {
      title: 'Operações Eficientes',
      desc: 'Controle de estoque, compras, produção industrial, expedição e entregas com rastreabilidade.',
    },
    {
      title: 'Governança & Segurança',
      desc: 'Controle de acessos por alçadas, trilha de auditoria completa e conformidade com LGPD.',
    },
  ]

  return (
    <div className="space-y-24 py-16 sm:py-24 bg-slate-50 dark:bg-slate-900/40">
      {/* SECTION 1: DELIVERABLES & PILLARS */}
      <section id="plataforma" className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 px-4 py-1.5 text-xs uppercase font-extrabold tracking-wider">
            Arquitetura de Gestão 360°
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            Entregáveis da Plataforma Jetro
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto">
            Ecossistema preparado para integrar, automatizar e potencializar os resultados da sua
            empresa com controle rigoroso e tecnologia de ponta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {deliverablesPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-background border border-border/60 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg mb-4 group-hover:scale-110 transition-transform">
                0{idx + 1}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{pillar.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: BUSINESS SEGMENTS PORTFOLIO */}
      <section id="segmentos" className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="text-center space-y-4 mb-14">
          <Badge className="bg-[#C89B3C]/10 text-[#8F6A1E] dark:text-[#E2B755] border-[#C89B3C]/30 px-4 py-1.5 text-xs uppercase font-extrabold tracking-wider">
            Segmentos Atendidos
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            Um sistema preparado para diferentes modelos de negócio
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto">
            O Jetro adapta suas funcionalidades às especificidades de cada segmento, garantindo a
            aderência operacional necessária para o sucesso da sua empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {segments.map((seg) => {
            const IconComp = seg.icon
            return (
              <div
                key={seg.id}
                className="flex flex-col justify-between p-8 rounded-2xl bg-background border border-border hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

                <div>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                    >
                      {seg.badge}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-emerald-600 transition-colors">
                    {seg.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {seg.description}
                  </p>

                  <div className="space-y-2 pt-4 border-t border-border/60">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                      Destaques Mapeados:
                    </p>
                    {seg.features.map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 mt-6">
                  <Button
                    onClick={() => onSelectService && onSelectService(seg.title)}
                    variant="outline"
                    className="w-full justify-between border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
                  >
                    <span>Solicitar demonstração</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* SECTION 3: VISUAL MODULE GRID */}
      <section id="solucoes" className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl border border-slate-800">
          <div className="max-w-3xl mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              Ecossistema Modular
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Módulos Integrados da Plataforma Jetro
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Todos os módulos operam conectados, compartilhando a mesma base de dados, garantindo
              rastreabilidade e controle total em tempo real.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modulesGrid.map((mod, idx) => {
              const IconM = mod.icon
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-start gap-3.5"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                    <IconM className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{mod.name}</h4>
                    <p className="text-xs text-slate-400 leading-normal">{mod.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
