import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProducts } from '@/services/products'
import { getPriceTablesList } from '@/services/price-tables'
import { formatCurrency, type PriceTableItem } from '@/lib/price-table-types'
import type { Product } from '@/lib/product-types'
import { Plus, Trash2, Percent, DollarSign, Download, Copy, AlertTriangle } from 'lucide-react'

interface Props {
  items: PriceTableItem[]
  setItems: (items: PriceTableItem[]) => void
  canViewCosts: boolean
}

export function PriceTableItemsTab({ items, setItems, canViewCosts }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [tables, setTables] = useState<{ id: string; table_name: string }[]>([])
  const [selProduct, setSelProduct] = useState('')
  const [batchPct, setBatchPct] = useState('')
  const [batchFixed, setBatchFixed] = useState('')
  const [copyTableId, setCopyTableId] = useState('')
  const [warnings, setWarnings] = useState<Record<string, boolean>>({})

  useEffect(() => {
    getProducts()
      .then((p) => setProducts(p as unknown as Product[]))
      .catch(() => {})
    getPriceTablesList()
      .then((t) => setTables(t.map((x) => ({ id: x.id, table_name: x.table_name }))))
      .catch(() => {})
  }, [])

  const addItem = () => {
    const prod = products.find((p) => p.id === selProduct)
    if (!prod) return
    const newItem: PriceTableItem = {
      product_id: prod.id,
      code: prod.code || '',
      name: prod.name || '',
      cost_price: prod.cost_price || '0',
      current_price: prod.price || '0',
      new_price: prod.price || '0',
      min_price: '0',
      margin: '',
      max_discount: prod.max_discount || '0',
      start_date: '',
      end_date: '',
      status: 'ativo',
    }
    setItems([...items, newItem])
    setSelProduct('')
  }

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const updateItem = (idx: number, field: keyof PriceTableItem, value: string) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [field]: value }
    if (field === 'new_price' || field === 'cost_price') {
      const cost = parseFloat(String(updated[idx].cost_price || '0').replace(',', '.')) || 0
      const price = parseFloat(String(updated[idx].new_price || '0').replace(',', '.')) || 0
      updated[idx].margin = price > 0 ? (((price - cost) / price) * 100).toFixed(2) : '0'
      const min = parseFloat(String(updated[idx].min_price || '0').replace(',', '.')) || 0
      setWarnings((p) => ({ ...p, [idx]: min > 0 && price < min }))
    }
    setItems(updated)
  }

  const applyBatchPercent = () => {
    const pct = parseFloat(batchPct.replace(',', '.')) || 0
    setItems(
      items.map((it) => {
        const base = parseFloat(String(it.current_price || '0').replace(',', '.')) || 0
        const newPrice = base * (1 + pct / 100)
        const cost = parseFloat(String(it.cost_price || '0').replace(',', '.')) || 0
        return {
          ...it,
          new_price: newPrice.toFixed(2),
          margin: newPrice > 0 ? (((newPrice - cost) / newPrice) * 100).toFixed(2) : '0',
        }
      }),
    )
    setBatchPct('')
  }

  const applyBatchFixed = () => {
    const val = parseFloat(batchFixed.replace(',', '.')) || 0
    setItems(
      items.map((it) => {
        const cost = parseFloat(String(it.cost_price || '0').replace(',', '.')) || 0
        return {
          ...it,
          new_price: val.toFixed(2),
          margin: val > 0 ? (((val - cost) / val) * 100).toFixed(2) : '0',
        }
      }),
    )
    setBatchFixed('')
  }

  const importAllProducts = () => {
    const newItems: PriceTableItem[] = products
      .filter((p) => p.active !== false && !items.some((it) => it.product_id === p.id))
      .map((p) => ({
        product_id: p.id,
        code: p.code || '',
        name: p.name || '',
        cost_price: p.cost_price || '0',
        current_price: p.price || '0',
        new_price: p.price || '0',
        min_price: '0',
        margin: '',
        max_discount: p.max_discount || '0',
        start_date: '',
        end_date: '',
        status: 'ativo',
      }))
    setItems([...items, ...newItems])
  }

  const copyFromTable = async () => {
    if (!copyTableId) return
    try {
      const t = await getPriceTablesList()
      const src = t.find((x) => x.id === copyTableId)
      if (src && Array.isArray(src.items)) {
        setItems([...items, ...(src.items as PriceTableItem[])])
      }
      setCopyTableId('')
    } catch {
      /* noop */
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex items-center gap-1">
          <Input
            value={batchPct}
            onChange={(e) => setBatchPct(e.target.value)}
            placeholder="%"
            className="h-8 w-20 text-sm focus-visible:ring-[#005B2E]"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={applyBatchPercent}
            className="h-8"
          >
            <Percent className="w-3 h-3 mr-1" /> Reajuste %
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Input
            value={batchFixed}
            onChange={(e) => setBatchFixed(e.target.value)}
            placeholder="0,00"
            className="h-8 w-24 text-sm focus-visible:ring-[#005B2E]"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={applyBatchFixed}
            className="h-8"
          >
            <DollarSign className="w-3 h-3 mr-1" /> Valor Fixo
          </Button>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={importAllProducts}
          className="h-8"
        >
          <Download className="w-3 h-3 mr-1" /> Importar Produtos
        </Button>
        <div className="flex items-center gap-1">
          <Select value={copyTableId} onValueChange={setCopyTableId}>
            <SelectTrigger className="h-8 w-40 text-sm focus-visible:ring-[#005B2E]">
              <SelectValue placeholder="Copiar de..." />
            </SelectTrigger>
            <SelectContent>
              {tables.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.table_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={copyFromTable}
            className="h-8"
            disabled={!copyTableId}
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">
          Nenhum produto adicionado. Use os botões acima para adicionar.
        </p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-2 py-2">Código</th>
                <th className="text-left px-2 py-2">Produto/Serviço</th>
                {canViewCosts && <th className="text-right px-2 py-2">Custo</th>}
                <th className="text-right px-2 py-2">Atual</th>
                <th className="text-right px-2 py-2">Novo Preço</th>
                <th className="text-right px-2 py-2">Mínimo</th>
                <th className="text-right px-2 py-2">Margem</th>
                <th className="text-right px-2 py-2">Desc. Máx</th>
                <th className="text-center px-2 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-[#005B2E]/5">
                  <td className="px-2 py-1">{it.code}</td>
                  <td className="px-2 py-1 font-medium">{it.name}</td>
                  {canViewCosts && (
                    <td className="text-right px-2 py-1">{formatCurrency(it.cost_price)}</td>
                  )}
                  <td className="text-right px-2 py-1">{formatCurrency(it.current_price)}</td>
                  <td className="text-right px-2 py-1">
                    <Input
                      value={it.new_price}
                      onChange={(e) => updateItem(idx, 'new_price', e.target.value)}
                      className="h-7 w-24 text-xs text-right focus-visible:ring-[#005B2E]"
                    />
                    {warnings[idx] && (
                      <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1" />
                    )}
                  </td>
                  <td className="text-right px-2 py-1">
                    <Input
                      value={it.min_price}
                      onChange={(e) => updateItem(idx, 'min_price', e.target.value)}
                      className="h-7 w-20 text-xs text-right focus-visible:ring-[#005B2E]"
                    />
                  </td>
                  <td className="text-right px-2 py-1">{it.margin || '0'}%</td>
                  <td className="text-right px-2 py-1">
                    <Input
                      value={it.max_discount}
                      onChange={(e) => updateItem(idx, 'max_discount', e.target.value)}
                      className="h-7 w-16 text-xs text-right focus-visible:ring-[#005B2E]"
                    />
                  </td>
                  <td className="text-center px-2 py-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(idx)}
                      className="text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Select value={selProduct} onValueChange={setSelProduct}>
          <SelectTrigger className="focus-visible:ring-[#005B2E]">
            <SelectValue placeholder="Selecione um produto para adicionar" />
          </SelectTrigger>
          <SelectContent>
            {products
              .filter((p) => p.active !== false)
              .map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} — {p.code}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          onClick={addItem}
          disabled={!selProduct}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          <Plus className="w-4 h-4 mr-1" /> Adicionar
        </Button>
      </div>
    </div>
  )
}
