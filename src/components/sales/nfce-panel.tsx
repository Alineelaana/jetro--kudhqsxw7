import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProducts } from '@/services/products'
import { createNfceRecord, getNextSalesNumber, logSalesAudit } from '@/services/sales'
import { useAuth } from '@/hooks/use-auth'
import { PAYMENT_METHODS, type NfceRecord } from '@/lib/sales-types'
import { Loader2, Plus, X, ShoppingCart, Check } from 'lucide-react'
import { toast } from 'sonner'

interface CartItem {
  name: string
  quantity: string
  unit_price: string
  total: string
}

export function NfcePanel() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Array<Record<string, unknown>>>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [consumerName, setConsumerName] = useState('')
  const [consumerDoc, setConsumerDoc] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro')
  const [discount, setDiscount] = useState('0')
  const [received, setReceived] = useState('0')
  const [issuing, setIssuing] = useState(false)
  const [recent, setRecent] = useState<NfceRecord[]>([])

  useMemo(() => {
    getProducts()
      .then((p) => setProducts(p as unknown as Array<Record<string, unknown>>))
      .catch(() => {})
  }, [])

  const total = useMemo(
    () => cart.reduce((s, i) => s + (parseFloat(i.total) || 0), 0) - (parseFloat(discount) || 0),
    [cart, discount],
  )
  const change = useMemo(() => Math.max(0, (parseFloat(received) || 0) - total), [received, total])

  const addProduct = (name: string) => {
    const p = products.find((pr) => (pr.name as string) === name)
    if (!p) return
    const existing = cart.find((c) => c.name === name)
    if (existing) {
      setCart(
        cart.map((c) =>
          c.name === name
            ? {
                ...c,
                quantity: String(parseInt(c.quantity) + 1),
                total: String(((parseInt(c.quantity) + 1) * parseFloat(c.unit_price)).toFixed(2)),
              }
            : c,
        ),
      )
    } else {
      setCart([
        ...cart,
        {
          name,
          quantity: '1',
          unit_price: (p.price as string) || '0',
          total: (p.price as string) || '0',
        },
      ])
    }
  }

  const updateCart = (i: number, field: keyof CartItem, value: string) => {
    setCart(
      cart.map((c, idx) => {
        if (idx !== i) return c
        const updated = { ...c, [field]: value }
        const qty = parseFloat(updated.quantity) || 0
        const price = parseFloat(updated.unit_price) || 0
        updated.total = String((qty * price).toFixed(2))
        return updated
      }),
    )
  }

  const handleIssue = async () => {
    if (cart.length === 0) {
      toast.error('Adicione produtos ao carrinho')
      return
    }
    setIssuing(true)
    try {
      const userName = (user?.name as string) || 'Sistema'
      const { number } = await getNextSalesNumber('nfce')
      await createNfceRecord({
        nfce_number: number,
        status: 'Autorizada',
        consumer_name: consumerName || 'Consumidor',
        consumer_doc: consumerDoc,
        items: cart,
        total_value: String(total.toFixed(2)),
        discount_value: discount,
        payment_method: paymentMethod,
        change_amount: String(change.toFixed(2)),
        authorization_protocol: String(Date.now()),
        company: 'Velora Log',
        branch: 'Matriz',
        responsible_user: userName,
      })
      logSalesAudit('create', 'sales', '', `NFC-e ${number} emitida`)
      toast.success('NFC-e emitida com sucesso')
      setCart([])
      setConsumerName('')
      setConsumerDoc('')
      setDiscount('0')
      setReceived('0')
    } catch {
      toast.error('Erro ao emitir NFC-e')
    }
    setIssuing(false)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-[#005B2E]" /> Emissão de NFC-e
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Consumidor</Label>
                <Input
                  value={consumerName}
                  onChange={(e) => setConsumerName(e.target.value)}
                  placeholder="Nome (opcional)"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-xs">CPF/CNPJ</Label>
                <Input
                  value={consumerDoc}
                  onChange={(e) => setConsumerDoc(e.target.value)}
                  placeholder="Documento (opcional)"
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Adicionar Produto</Label>
              <Select
                value=""
                onValueChange={(v) => {
                  addProduct(v)
                }}
              >
                <SelectTrigger className="focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id as string} value={(p.name as string) || ''}>
                      {p.name as string} — R$ {p.price as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-2">Produto</th>
                    <th className="text-left p-2 w-16">Qtd</th>
                    <th className="text-left p-2 w-24">Vlr</th>
                    <th className="text-left p-2 w-24">Total</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((it, i) => (
                    <tr key={i}>
                      <td className="p-1 text-xs">{it.name}</td>
                      <td className="p-1">
                        <Input
                          type="number"
                          value={it.quantity}
                          onChange={(e) => updateCart(i, 'quantity', e.target.value)}
                          className="h-7 text-xs w-14"
                        />
                      </td>
                      <td className="p-1">
                        <Input
                          type="number"
                          value={it.unit_price}
                          onChange={(e) => updateCart(i, 'unit_price', e.target.value)}
                          className="h-7 text-xs w-20"
                        />
                      </td>
                      <td className="p-1 font-bold">{it.total}</td>
                      <td className="p-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCart(cart.filter((_, idx) => idx !== i))}
                          className="text-red-600 h-7 w-7 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-[#C89B3C]/30">
          <CardContent className="py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Desconto (R$)</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="focus-visible:ring-[#005B2E]"
                />
              </div>
              <div>
                <Label className="text-xs">Forma de Pagamento</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Valor Recebido (R$)</Label>
              <Input
                type="number"
                value={received}
                onChange={(e) => setReceived(e.target.value)}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="bg-[#005B2E]/5 rounded-lg p-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>R$ {(total + (parseFloat(discount) || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Desconto:</span>
                <span>R$ {(parseFloat(discount) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-[#005B2E]">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Troco:</span>
                <span>R$ {change.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={handleIssue}
              disabled={issuing || cart.length === 0}
              className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {issuing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}{' '}
              Emitir NFC-e
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
