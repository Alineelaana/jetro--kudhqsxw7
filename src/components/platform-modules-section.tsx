import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  Factory,
  BarChart3,
  Users,
  UserCheck,
  ShieldCheck,
  Megaphone,
  Store,
  Headphones,
  LineChart,
  Bot,
  CheckCircle,
} from 'lucide-react'

export function PlatformModulesSection() {
  const pillars = [
    {
      title: 'Gestão Integrada',
      desc: 'Conexão ponta a ponta de todos os setores corporativos em tempo real.',
    },
    {
      title: 'Inteligência Empresarial',
      desc: 'Dashboards, BI executivo, projeções e indicadores para tomada de decisão.',
    },
    {
      title: 'Automação de Processos',
      desc: 'Workflows automáticos e eliminação de tarefas manuais repetitivas.',
    },
    {
      title: 'Gestão Financeira',
      desc: 'Fluxo de caixa, DRE, contas a pagar/receber, conciliação e crédito.',
    },
    {
      title: 'Gestão Comercial',
      desc: 'Funil de vendas, CRM, tabelas de preço, comissões e propostas.',
    },
    {
      title: 'Gestão de Pessoas',
      desc: 'RH, Departamento Pessoal, folha, ponto, SST e performance.',
    },
    {
      title: 'Operações & Logística',
      desc: 'Estoque, compras, produção, armazenagem, frota e expedição.',
    },
    {
      title: 'Governança & Segurança',
      desc: 'Matriz de permissões, auditoria corporativa e conformidade fiscal.',
    },
  ]

  const modules = [
    { name: 'Financeiro', icon: DollarSign },
    { name: 'Comercial / CRM', icon: TrendingUp },
    { name: 'Compras', icon: ShoppingCart },
    { name: 'Estoque', icon: Package },
    { name: 'Produção / Indústria', icon: Factory },
    { name: 'Controladoria', icon: BarChart3 },
    { name: 'RH', icon: Users },
    { name: 'DP', icon: UserCheck },
    { name: 'SST', icon: ShieldCheck },
    { name: 'Marketing', icon: Megaphone },
    { name: 'Trade Marketing', icon: Store },
    { name: 'Atendimento', icon: Headphones },
    { name: 'BI Executive', icon: LineChart },
    { name: 'IA Nine', icon: Bot },
  ]

  return (
    <section id="plataforma" className="py-16 sm:py-24 bg-white relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div id="solucoes" className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#C89B3C]/10 text-[#8F6A1E] text-xs sm:text-sm font-extrabold uppercase tracking-wider">
            Arquitetura de Soluções
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-foreground">
            Entregas e Pilares do Ecossistema Jetro
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Um ecossistema completo e modular, projetado para oferecer visibilidade total,
            eficiência operacional e previsibilidade financeira.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="p-5 rounded-xl border border-border bg-slate-50/80 hover:bg-white hover:border-[#005A36] transition-all space-y-2"
            >
              <div className="flex items-center gap-2 text-[#005A36] font-bold text-lg">
                <CheckCircle className="h-5 w-5 text-[#C89B3C] shrink-0" />
                <h3>{p.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-[#002817] via-[#004225] to-[#002817] rounded-2xl p-8 sm:p-12 text-white shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">Módulos e Áreas de Gestão</h3>
            <p className="text-sm text-gray-300">
              Ecossistema preparado para integrar gradualmente os setores da sua empresa de acordo
              com o seu ritmo de expansão.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {modules.map((m) => {
              const IconClass = m.icon
              return (
                <div
                  key={m.name}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
                >
                  <IconClass className="h-6 w-6 text-[#E5B85C] mb-2" />
                  <span className="text-xs font-semibold text-white">{m.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
