import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useB2B } from '@/lib/b2b/b2b-context'
import { b2bService } from '@/lib/b2b/b2b-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileCheck2,
} from 'lucide-react'

export const B2BCartScreen: React.FC = () => {
  const navigate = useNavigate()
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, partner, client } = useB2B()

  const [notes, setNotes] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState(
    partner?.address
      ? `${partner.address}, ${partner.address_number || 'S/N'} - ${partner.address_district || ''}, ${partner.address_city || ''}/${partner.address_state || ''}`
      : '',
  )
  const [paymentCondition, setPaymentCondition] = useState('Boleto Bancário 28 DDL (Faturamento B2B)')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string | null>(null)

  const handleSubmitOrder = async () => {
    if (cart.length === 0) return
    setErrorMsg(null)
    setIsSubmitting(true)

    try {
      const res = await b2bService.submitOrder({
        items: cart,
        notes,
        delivery_address: deliveryAddress,
        payment_condition: paymentCondition,
      })

      clearCart()
      setCreatedOrderNumber(res.order_number)
    } catch (err: unknown) {
      console.error(err)
      const msg = err instanceof Error ? err.message : 'Falha ao finalizar o pedido.'
      setErrorMsg(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Se acabou de enviar com sucesso
  if (createdOrderNumber) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <Card className="border-emerald-200 shadow-md">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Pedido B2B Enviado com Sucesso!</h2>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-w-sm mx-auto">
              <span className="text-xs text-slate-500 uppercase tracking-wider block">Número do Pedido</span>
              <span className="text-xl font-mono font-bold text-indigo-700">{createdOrderNumber}</span>
            </div>
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-800 text-left max-w-lg mx-auto flex items-start gap-3">
              <FileCheck2 className="w-5 h-5 mt-0.5 text-indigo-600 shrink-0" />
              <div>
                <p className="font-semibold">Submetido para a Central de Aprovações</p>
                <p className="text-xs mt-1 text-indigo-700">
                  Seu pedido foi registrado no sistema e encaminhado diretamente para aprovação da equipe comercial e financeira. Você pode acompanhar cada etapa do faturamento em tempo real na aba &quot;Meus Pedidos&quot;.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-4 pb-8">
            <Button
              variant="outline"
              onClick={() => navigate('/portal/pedidos')}
              className="w-full sm:w-auto"
            >
              Ver Meus Pedidos
            </Button>
            <Button
              onClick={() => navigate('/portal/catalogo')}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Continuar Comprando
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12 shadow-sm">
        <ShoppingCart className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-800">Seu carrinho B2B está vazio</h3>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Navegue pelo nosso catálogo corporativo para adicionar produtos e montar sua cotação/pedido.
        </p>
        <Link to="/portal/catalogo">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Explorar Catálogo de Produtos
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Carrinho de Compras B2B</h1>
          <p className="text-sm text-slate-500">
            Revise as quantidades e condições comerciais antes de submeter o pedido
          </p>
        </div>
        <Link to="/portal/catalogo">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Adicionar Mais Itens
          </Button>
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela de Itens (2 colunas) */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-800">
                Itens Selecionados ({cart.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Limpar Carrinho
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-center">Quantidade</TableHead>
                      <TableHead className="text-right">Unitário</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => {
                      const totalItem = item.quantity * item.unit_price
                      return (
                        <TableRow key={item.product.id}>
                          <TableCell className="max-w-xs">
                            <div className="font-semibold text-slate-800 text-sm">
                              {item.product.name}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">
                              Cód: {item.product.code || item.product.id.slice(0, 8)} • Un: {item.product.unit}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="h-7 w-7 p-0 text-slate-600 hover:bg-white"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-12 text-center text-sm font-semibold text-slate-800">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="h-7 w-7 p-0 text-slate-600 hover:bg-white"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm text-slate-600 font-medium whitespace-nowrap">
                            R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right text-sm font-bold text-slate-900 whitespace-nowrap">
                            R$ {totalItem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.product.id)}
                              className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Dados de Entrega e Observações */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-800">
                Instruções de Faturamento e Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="deliveryAddress">Local de Entrega</Label>
                <Input
                  id="deliveryAddress"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Endereço completo para entrega da mercadoria"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentCondition">Condição de Pagamento Solicitada</Label>
                <Input
                  id="paymentCondition"
                  value={paymentCondition}
                  onChange={(e) => setPaymentCondition(e.target.value)}
                  placeholder="Ex: Boleto 28 dias, À Vista ou conforme cadastro"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Observações do Pedido (Opcional)</Label>
                <Textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Instruções de recebimento, número do pedido de compra do cliente (PO), horários para descarregamento..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo do Pedido (1 coluna) */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm sticky top-20">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900">Resumo da Compra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Subtotal dos itens:</span>
                <span className="font-semibold text-slate-800">
                  R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Frete:</span>
                <span className="font-semibold text-slate-800">A Combinar (FOB/CIF)</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-base font-bold text-slate-900 block">Total do Pedido</span>
                  <span className="text-xs text-slate-500">Impostos inclusos conforme regime</span>
                </div>
                <span className="text-2xl font-extrabold text-indigo-700">
                  R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Informações da Empresa Compradora */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{partner?.company_name || client?.company_name}</span>
                </div>
                <p>CNPJ: {partner?.cnpj || client?.cnpj}</p>
                <p>Canal: Portal B2B Digital</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800">
                <strong>Atenção:</strong> Ao finalizar, seu pedido será submetido à Central de Aprovações para análise de crédito, estoque e faturamento comercial.
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 text-base shadow-sm"
              >
                {isSubmitting ? 'Submetendo Pedido...' : 'Finalizar e Enviar Pedido'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
