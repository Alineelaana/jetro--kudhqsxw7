import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Search,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Target,
  Megaphone,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { analyzeEntity, type EntityAnalysis } from '@/services/strategic-entity'
import { StrategicBiButton } from './strategic-bi-button'

export function DecisionRoom() {
  const [query, setQuery] = useState('')
  const [entity, setEntity] = useState<EntityAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    pb.collection('partners')
      .getFullList({ fields: 'id,name,company_name,full_name', filter: 'active = true' })
      .then((r) =>
        setPartners(
          r.map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name:
              (p.name as string) || (p.company_name as string) || (p.full_name as string) || 'N/A',
          })),
        ),
      )
      .catch(() => {})
  }, [])

  const analyze = async (name: string) => {
    if (!name.trim()) return
    setLoading(true)
    setEntity(null)
    try {
      setEntity(await analyzeEntity(name))
    } catch {
      setEntity(null)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar entidade (cliente, empresa...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && analyze(query)}
          />
        </div>
        <Button
          onClick={() => analyze(query)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          Analisar
        </Button>
        {entity && <StrategicBiButton entity={entity.name} />}
      </div>
      {partners.length > 0 && !entity && (
        <div className="flex flex-wrap gap-2">
          {partners.slice(0, 8).map((p) => (
            <Button
              key={p.id}
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery(p.name)
                analyze(p.name)
              }}
            >
              {p.name}
            </Button>
          ))}
        </div>
      )}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      )}
      {entity && (
        <div className="space-y-4">
          <Card className="border-2 border-[#005B2E]">
            <CardContent className="py-4">
              <h2 className="text-xl font-black text-[#005B2E] mb-3">{entity.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  icon={ShoppingCart}
                  label="Pedidos"
                  value={String(entity.orders)}
                  color="text-blue-600"
                />
                <StatCard
                  icon={DollarSign}
                  label="Receita"
                  value={`R$ ${entity.revenue.toFixed(2)}`}
                  color="text-[#005B2E]"
                />
                <StatCard
                  icon={TrendingUp}
                  label="Margem"
                  value={`${entity.margin.toFixed(1)}%`}
                  color="text-emerald-600"
                />
                <StatCard
                  icon={Users}
                  label="Recebíveis"
                  value={String(entity.pending)}
                  color="text-purple-600"
                />
                <StatCard
                  icon={Package}
                  label="Produtos"
                  value={String(entity.productsCount)}
                  color="text-cyan-600"
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Vencidos"
                  value={String(entity.overdue)}
                  color="text-red-600"
                />
                <StatCard
                  icon={Target}
                  label="Oportunidades"
                  value={String(entity.opportunities)}
                  color="text-indigo-600"
                />
                <StatCard
                  icon={Megaphone}
                  label="Campanhas"
                  value={String(entity.campaigns)}
                  color="text-pink-600"
                />
                <StatCard
                  icon={DollarSign}
                  label="Verbas"
                  value={`R$ ${entity.verbas.toFixed(2)}`}
                  color="text-orange-600"
                />
                <StatCard
                  icon={ShoppingCart}
                  label="Compras"
                  value={String(entity.purchases)}
                  color="text-teal-600"
                />
                <StatCard
                  icon={AlertTriangle}
                  label="Inadimplência"
                  value={String(entity.inadimplencia)}
                  color="text-red-600"
                />
                <StatCard
                  icon={Users}
                  label="Leads"
                  value={String(entity.leads)}
                  color="text-blue-600"
                />
              </div>
              {(entity.wonOpps > 0 || entity.lostOpps > 0) && (
                <div className="mt-3 flex gap-4 text-sm">
                  <span className="text-emerald-600 font-bold">Ganhas: {entity.wonOpps}</span>
                  <span className="text-red-600 font-bold">Perdidas: {entity.lostOpps}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      {!entity && !loading && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-lg font-bold">Sala de Decisão 360°</p>
            <p className="text-sm text-muted-foreground">
              Selecione uma entidade para ver dados consolidados de Financeiro, Comercial, CRM,
              Estoque, Campanhas, Verbas e mais.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof DollarSign
  label: string
  value: string
  color: string
}) {
  return (
    <Card className="border-2 border-[#005B2E]/10">
      <CardContent className="py-3 flex items-center gap-2">
        <Icon className={`w-6 h-6 ${color} shrink-0`} />
        <div>
          <p className="text-lg font-black">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
