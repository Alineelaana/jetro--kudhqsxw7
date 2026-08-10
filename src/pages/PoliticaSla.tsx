import { PolicyLayout } from '@/components/policy-layout'
import { ShieldAlert, ShieldX, ShieldCheck, Shield } from 'lucide-react'

const SLA_TIERS = [
  {
    icon: ShieldX,
    name: 'Crítico',
    description: 'Sistema indisponível.',
    response: 'Primeira resposta: 1 hora.',
    color: 'text-red-600 bg-red-50 border-red-200',
  },
  {
    icon: ShieldAlert,
    name: 'Alto',
    description: 'Funcionalidade essencial.',
    response: 'Resposta: 4 horas.',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  {
    icon: ShieldCheck,
    name: 'Médio',
    description: 'Erro operacional.',
    response: 'Resposta: 1 dia útil.',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  },
  {
    icon: Shield,
    name: 'Baixo',
    description: 'Melhorias.',
    response: 'Resposta: 3 dias úteis.',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
]

export default function PoliticaSla() {
  return (
    <PolicyLayout
      title="Política de SLA (Acordo de Nível de Serviço)"
      lastUpdated="10 de agosto de 2026"
    >
      <h2 className="text-xl font-bold text-[#005B2E] pt-4">1. Objetivo</h2>
      <p>Definir disponibilidade e suporte.</p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">2. Disponibilidade</h2>
      <p>
        A plataforma <strong className="text-[#005B2E]">Jetro</strong> compromete-se com uma meta de
        disponibilidade de <strong>99,5% mensal</strong> (exceto manutenções programadas).
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">3. Horário de suporte</h2>
      <p>
        O suporte técnico está disponível de <strong>segunda a sexta</strong>, das{' '}
        <strong>08:00 às 18:00</strong> (exceto feriados).
      </p>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">4. Classificação</h2>
      <p>
        Os chamados de suporte são classificados em quatro níveis de prioridade, cada um com seu
        respectivo tempo de resposta:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 not-prose">
        {SLA_TIERS.map((tier) => {
          const Icon = tier.icon
          return (
            <div key={tier.name} className={`rounded-xl border p-5 space-y-2 ${tier.color}`}>
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 shrink-0" />
                <h3 className="text-lg font-bold">{tier.name}</h3>
              </div>
              <p className="text-sm text-foreground/80">{tier.description}</p>
              <p className="text-sm font-semibold">{tier.response}</p>
            </div>
          )
        })}
      </div>

      <h2 className="text-xl font-bold text-[#005B2E] pt-4">5. Manutenções</h2>
      <p>Serão comunicadas previamente sempre que possível.</p>

      <div className="border-t border-[#C89B3C]/30 pt-6 mt-8">
        <p className="text-sm text-muted-foreground">
          Jetro — Plataforma Inteligente de Gestão Empresarial.
        </p>
      </div>
    </PolicyLayout>
  )
}
