import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Loader2, DollarSign, TrendingUp, Target, Percent, Users, Package } from 'lucide-react'
import { getCommercialIntelligence } from '@/services/bi-analytics-extended'
import { logBIAudit } from '@/services/bi'
import { useBIFilters } from '../bi-filters'
import { BiStatCard } from '../bi-stat-card'
import { BiDrillDown } from '../bi-drill-down'
import { useRealtime } from '@/hooks/use-realtime'
import type { CommercialIntelligenceData } from '@/lib/bi-types'

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function BiCommercial() {
  const { filters } = useBIFilters()
  const [data, setData] = useState<CommercialIntelligenceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [drillTarget, setDrillTarget] = useState<string | null>(null)

  const load = async () => {
    try {
      setData(await getCommercialIntelligence(filters))
    } catch {
      setData(null)
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [filters])
  useEffect(() => {
    logBIAudit('view', '', 'Visualizacao: Inteligencia Comercial BI')
  }, [])
  useRealtime('sales_orders', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  if (!data)
    return <p className="text-center py-6 text-muted-foreground">Erro ao carregar dados.</p>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <BiStatCard
          icon={DollarSign}
          label="Faturamento"
          value={`R$ ${fmt(data.faturamento)}`}
          color="text-[#005B2E]"
        />
        <BiStatCard
          icon={TrendingUp}
          label="Projeção"
          value={`R$ ${fmt(data.projecao)}`}
          color="text-blue-600"
        />
        <BiStatCard
          icon={Target}
          label="Meta"
          value={`R$ ${fmt(data.meta)}`}
          color="text-purple-600"
        />
        <BiStatCard
          icon={Percent}
          label="% Meta"
          value={`${fmt(data.percentualMeta)}%`}
          color="text-emerald-600"
        />
        <BiStatCard
          icon={Users}
          label="Positivação"
          value={String(data.positivacao)}
          color="text-cyan-600"
        />
        <BiStatCard
          icon={Percent}
          label="Conversão"
          value={`${fmt(data.conversao)}%`}
          color="text-amber-600"
        />
      </div>
      <Tabs defaultValue="projection">
        <TabsList className="flex-wrap">
          <TabsTrigger value="projection">Projeção de Vendas</TabsTrigger>
          <TabsTrigger value="sellers">Vendedores</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="regions">Regiões</TabsTrigger>
        </TabsList>
        <TabsContent value="projection" className="space-y-3">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4">
              <h3 className="font-bold text-[#005B2E] mb-3">Projeção de Vendas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Faturado</p>
                  <p className="font-bold">R$ {fmt(data.faturamento)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Projeção</p>
                  <p className="font-bold text-[#005B2E]">R$ {fmt(data.projecao)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Meta</p>
                  <p className="font-bold">R$ {fmt(data.meta)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">% Atingido</p>
                  <p className="font-bold text-emerald-600">{fmt(data.percentualMeta)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4">
              <h3 className="font-bold text-[#005B2E] mb-3">Breakdown por RCA</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RCA</TableHead>
                    <TableHead className="text-right">Faturado</TableHead>
                    <TableHead className="text-right">Projeção</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.breakdownRca.map((r, i) => (
                    <TableRow
                      key={i}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setDrillTarget('Pedido')}
                    >
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-right">R$ {fmt(r.value)}</TableCell>
                      <TableCell className="text-right text-[#005B2E]">
                        R$ {fmt(r.projecao)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sellers">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4">
              <h3 className="font-bold text-[#005B2E] mb-3">Ranking de Vendedores</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendedor</TableHead>
                    <TableHead className="text-right">Pedidos</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topVendedores.map((v, i) => (
                    <TableRow
                      key={i}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setDrillTarget('Pedido')}
                    >
                      <TableCell className="font-medium">{v.name}</TableCell>
                      <TableCell className="text-right">{v.count}</TableCell>
                      <TableCell className="text-right text-[#005B2E]">R$ {fmt(v.value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="clients" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-4">
                <h3 className="font-bold text-[#005B2E] mb-3">Clientes em Crescimento</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.clientesCrescimento.map((c, i) => (
                      <TableRow
                        key={i}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setDrillTarget('Cliente')}
                      >
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-right text-emerald-600">
                          R$ {fmt(c.value)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#005B2E]/20">
              <CardContent className="py-4">
                <h3 className="font-bold text-[#005B2E] mb-3">Clientes em Declínio</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.clientesDeclinio.map((c, i) => (
                      <TableRow
                        key={i}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setDrillTarget('Cliente')}
                      >
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-right text-red-600">R$ {fmt(c.value)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="products">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4">
              <h3 className="font-bold text-[#005B2E] mb-3">Produtos Mais Rentáveis</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.produtosRentaveis.map((p, i) => (
                    <TableRow
                      key={i}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setDrillTarget('Produto')}
                    >
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell className="text-right text-[#005B2E]">R$ {fmt(p.value)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="regions">
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4">
              <h3 className="font-bold text-[#005B2E] mb-3">Regiões Mais Lucrativas</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Região</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Projeção</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.breakdownRegiao.map((r, i) => (
                    <TableRow
                      key={i}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setDrillTarget('Pedido')}
                    >
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-right">R$ {fmt(r.value)}</TableCell>
                      <TableCell className="text-right text-[#005B2E]">
                        R$ {fmt(r.projecao)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <BiDrillDown target={drillTarget} onClose={() => setDrillTarget(null)} />
    </div>
  )
}
