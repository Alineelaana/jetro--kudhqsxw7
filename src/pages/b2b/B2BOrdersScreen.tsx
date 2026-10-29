import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { b2bService } from '@/lib/b2b/b2b-service'
import { B2BOrderListItem, B2BOrderDetail } from '@/lib/b2b/types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ShoppingBag,
  FileText,
  Calendar,
  AlertTriangle,
} from 'lucide-react'

export const B2BOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<B2BOrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<B2BOrderDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const loadOrders = async () => {
    try {
      setLoading(true)
      const list = await b2bService.getMyOrders()
      setOrders(list)
    } catch (err) {
      console.error('Erro ao listar pedidos do cliente:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleOpenDetail = async (orderId: string) => {
    try {
      setLoadingDetail(true)
      setDetailModalOpen(true)
      const detail = await b2bService.getOrderDetail(orderId)
      setSelectedOrder(detail)
    } catch (err) {
      console.error('Erro ao carregar detalhes do pedido:', err)
    } finally {
      setLoadingDetail(false)
    }
  }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Meus Pedidos B2B</h1>
          <p className="text-sm text-slate-500">
            Acompanhe o status de aprovação, faturamento e histórico dos seus pedidos
          </p>
        </div>
        <Link to="/portal/catalogo">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            <ShoppingBag className="w-4 h-4" />
            Novo Pedido
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-3 text-slate-500 text-sm font-medium">Buscando seus pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-6 shadow-sm">
          <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-800">Você ainda não possui pedidos</h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Acesse nosso catálogo para selecionar produtos e submeter seu primeiro pedido B2B.
          </p>
          <Link to="/portal/catalogo">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Explorar Catálogo B2B
            </Button>
          </Link>
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800">
              Histórico de Pedidos de Venda ({orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº do Pedido</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status / Aprovação</TableHead>
                    <TableHead className="text-center">Itens</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id} className="hover:bg-slate-50/70">
                      <TableCell className="font-mono font-bold text-indigo-700">
                        {o.order_number}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {o.created ? new Date(o.created).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(o.status)}</TableCell>
                      <TableCell className="text-center text-sm text-slate-700 font-medium">
                        {o.items_count}
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-900">
                        R${' '}
                        {parseFloat(o.total_value || '0').toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(o.id)}
                          className="h-8 gap-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Detalhes</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Detalhes do Pedido */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between gap-3">
              <span>Detalhes do Pedido {selectedOrder?.order_number}</span>
              {selectedOrder && getStatusBadge(selectedOrder.status)}
            </DialogTitle>
            <DialogDescription>
              Dados completos dos itens, endereço e trilha de aprovação do pedido
            </DialogDescription>
          </DialogHeader>

          {loadingDetail || !selectedOrder ? (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
              <p className="mt-2 text-xs text-slate-500">Carregando detalhes...</p>
            </div>
          ) : (
            <div className="space-y-6 pt-2">
              {/* Motivo de Cancelamento / Rejeição se houver */}
              {selectedOrder.cancellation_reason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" />
                  <div>
                    <span className="font-semibold block">Motivo da Rejeição / Cancelamento:</span>
                    <span className="text-xs">{selectedOrder.cancellation_reason}</span>
                  </div>
                </div>
              )}

              {/* Grid Resumo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Data de Criação</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(selectedOrder.created).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Condição Pagamento</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {selectedOrder.payment_condition || 'A Combinar'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Canal</span>
                  <span className="font-semibold text-slate-800 block mt-0.5">Portal B2B</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Valor Total</span>
                  <span className="font-bold text-sm text-indigo-700 block mt-0.5">
                    R${' '}
                    {parseFloat(selectedOrder.total_value || '0').toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Endereço e Observações */}
              {(selectedOrder.delivery_address || selectedOrder.internal_notes) && (
                <div className="space-y-2 text-xs text-slate-700 bg-white border border-slate-200 p-3 rounded-lg">
                  {selectedOrder.delivery_address && (
                    <p>
                      <strong>Local de Entrega:</strong> {selectedOrder.delivery_address}
                    </p>
                  )}
                  {selectedOrder.internal_notes && (
                    <p>
                      <strong>Observações:</strong> {selectedOrder.internal_notes}
                    </p>
                  )}
                </div>
              )}

              {/* Itens do Pedido */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Itens Faturáveis ({selectedOrder.items.length})
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="text-xs">Item</TableHead>
                        <TableHead className="text-center text-xs">Qtd</TableHead>
                        <TableHead className="text-right text-xs">Unitário</TableHead>
                        <TableHead className="text-right text-xs">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((it, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-xs">
                            <div className="font-medium text-slate-800">{it.name}</div>
                            {it.code && (
                              <div className="text-slate-400 font-mono">Cód: {it.code}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-center text-xs font-semibold">
                            {it.quantity} {it.unit || 'un'}
                          </TableCell>
                          <TableCell className="text-right text-xs text-slate-600">
                            R${' '}
                            {(it.unit_price || 0).toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-right text-xs font-bold text-slate-900">
                            R${' '}
                            {(it.total_price || it.quantity * it.unit_price || 0).toLocaleString(
                              'pt-BR',
                              { minimumFractionDigits: 2 },
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Trilha de Aprovação / Histórico */}
              {selectedOrder.history && selectedOrder.history.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Trilha de Acompanhamento
                  </h4>
                  <div className="space-y-2 border-l-2 border-indigo-200 pl-3 ml-2">
                    {selectedOrder.history.map((h, i) => (
                      <div key={i} className="text-xs relative pb-2">
                        <div className="font-semibold text-slate-800">{h.action}</div>
                        <div className="text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{h.user || 'Sistema'}</span>
                          <span>•</span>
                          <span>{h.date ? new Date(h.date).toLocaleString('pt-BR') : ''}</span>
                        </div>
                        {h.notes && <div className="text-slate-600 italic mt-0.5">{h.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
