import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { pb } from '@/lib/pocketbase/client'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'

interface B2BAdminOrder {
  id: string
  order_number: string
  client_name: string
  customer_cnpj: string
  sales_channel: string
  status: string
  order_stage: string
  gross_value: string
  total_value: string
  payment_condition: string
  created: string
}

export const AdminB2BOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<B2BAdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadOrders = async () => {
    try {
      setLoading(true)
      // Buscar pedidos de venda originados do Portal B2B
      const records = await pb.collection('sales_orders').getFullList({
        filter: 'sales_channel = "Portal B2B" || b2b_client_id != ""',
        sort: '-created',
      })

      const mapped: B2BAdminOrder[] = records.map((r) => ({
        id: r.id,
        order_number: r.order_number || r.id,
        client_name: r.client_name || 'Cliente B2B',
        customer_cnpj: r.customer_cnpj || '',
        sales_channel: r.sales_channel || 'Portal B2B',
        status: r.status || 'Aguardando Aprovação',
        order_stage: r.order_stage || '',
        gross_value: r.gross_value || '0.00',
        total_value: r.total_value || '0.00',
        payment_condition: r.payment_condition || '',
        created: r.created,
      }))

      setOrders(mapped)
    } catch (err) {
      console.error('Erro ao listar pedidos B2B:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s.includes('aguardando') || s.includes('pendente')) {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300 gap-1 hover:bg-amber-100 font-medium">
          <Clock className="w-3 h-3" />
          Aguardando Aprovação
        </Badge>
      )
    }
    if (s.includes('aprovado') || s.includes('faturado') || s.includes('concl')) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 gap-1 hover:bg-emerald-100 font-medium">
          <CheckCircle className="w-3 h-3" />
          {status}
        </Badge>
      )
    }
    if (s.includes('rejeit') || s.includes('cancel')) {
      return (
        <Badge className="bg-rose-100 text-rose-800 border-rose-300 gap-1 hover:bg-rose-100 font-medium">
          <XCircle className="w-3 h-3" />
          {status}
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="text-slate-700 font-medium">
        {status || 'Em Processamento'}
      </Badge>
    )
  }

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase()
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.client_name.toLowerCase().includes(q) ||
      o.customer_cnpj.includes(q) ||
      o.status.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
            Portal B2B • Pedidos Recebidos
          </h1>
          <p className="text-sm text-slate-500">
            Acompanhamento dos pedidos montados pelos clientes no Portal B2B e fluxo de aprovação
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadOrders} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Link to="/admin/aprovacoes/pedidos">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              Central de Aprovações
            </Button>
          </Link>
        </div>
      </div>

      {/* Informativo da Central de Aprovações (DECISÃO 2) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 flex items-start gap-3">
        <Clock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-900">Fluxo Integrado de Aprovação (Decisão 2)</p>
          <p className="text-slate-600 text-xs mt-1">
            Todo pedido gerado pelo cliente no Portal B2B nasce automaticamente com status &quot;Aguardando Aprovação&quot; e entra na fila da Central de Aprovações (/admin/aprovacoes/pedidos) para deliberação das alçadas comerciais e financeiras.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold text-slate-800">
            Pedidos B2B Registrados ({orders.length})
          </CardTitle>
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Buscar por Nº, Cliente ou CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº do Pedido</TableHead>
                  <TableHead>Cliente / CNPJ</TableHead>
                  <TableHead>Data de Entrada</TableHead>
                  <TableHead>Condição Pagamento</TableHead>
                  <TableHead>Status Atual</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                      Carregando pedidos B2B...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                      Nenhum pedido B2B recebido até o momento.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-slate-50/70">
                      <TableCell className="font-mono font-bold text-indigo-700">
                        {order.order_number}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900 text-sm">
                          {order.client_name}
                        </div>
                        {order.customer_cnpj && (
                          <div className="text-xs font-mono text-slate-500">
                            {order.customer_cnpj}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {order.created ? new Date(order.created).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-700">
                        {order.payment_condition || 'Padrão B2B'}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right font-bold text-slate-900">
                        R$ {parseFloat(order.total_value || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to="/admin/aprovacoes/pedidos">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                          >
                            <span>Aprovar</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
