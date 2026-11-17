import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getPriceTablesList } from '@/services/price-tables'
import { formatCurrency, parseItems, type PriceTableItem } from '@/lib/price-table-types'
import type { Product } from '@/lib/product-types'
import {
  useProductServiceOptions,
  useFilteredProducts,
  useSupplierOptions,
} from '@/components/pricing/rule-options'
import {
  Percent,
  DollarSign,
  Download,
  Copy,
  Trash2,
  AlertTriangle,
  Search,
  Package,
  Wrench,
} from 'lucide-react'

interface Props {
  items: PriceTableItem[]
  setItems: (items: PriceTableItem[]) => void
  canViewCosts: boolean
}

const toItem = (
  p: {
    id: string
    code?: string
    name?: string
    cost_price?: string
    price?: string
    max_discount?: string
    main_supplier?: string
  },
  kind: 'produto' | 'servico',
): PriceTableItem => ({
  product_id: p.id,
  code: p.code || '',
  name: p.name || '',
  kind,
  supplier: p.main_supplier || '',
  cost_price: p.cost_price || '0',
  current_price: p.price || '0',
  new_price: p.price || '0',
  min_price: '0',
  margin: '',
  max_discount: p.max_discount || '0',
  start_date: '',
  end_date: '',
  status: 'ativo',
})

/**
 * Aba Produtos e Serviços: produtos e serviços reais do sistema em seções
 * separadas, com busca por fornecedor e seleção em massa ("Selecionar todos").
 */
export function PriceTableItemsTab({ items, setItems, canViewCosts }: Props) {
  const { products, services, loading } = useProductServiceOptions()
  const [supplierFilter, setSupplierFilter] = useState('')
  const [prodSearch, setProdSearch] = useState('')
  const [servSearch, setServSearch] = useState('')
  const [batchPct, setBatchPct] = useState('')
  const [batchFixed, setBatchFixed] = useState('')
  const [copyTableId, setCopyTableId] = useState('')
  const [tables, setTables] = useState<{ id: string; table_name: string }[]>([])
  const [warnings, setWarnings] = useState<Record<number, boolean>>({})

  useEffect(() => {
    getPriceTablesList()
      .then((t) => setTables(t.map((x) => ({ id: x.id, table_name: x.table_name }))))
      .catch(() => {})
  }, [])

  const supplierOptions = useSupplierOptions(products)
  const filteredProducts = useFilteredProducts(products, supplierFilter, prodSearch)
  const filteredServices = useMemo(() => {
    const t = servSearch.trim().toLowerCase()
    return services.filter(
      (s) =>
        s.active !== false && (!t || `${s.name || ''} ${s.code || ''}`.toLowerCase().includes(t)),
    )
  }, [services, servSearch])

  const toggleItem = (
    p: { id: string; code?: string; name?: string },
    kind: 'produto' | 'servico',
  ) => {
    if (items.some((it) => it.product_id === p.id)) {
      setItems(items.filter((it) => it.product_id !== p.id))
    } else {
      const full =
        kind === 'produto'
          ? products.find((x) => x.id === p.id)
          : services.find((x) => x.id === p.id)
      if (full) setItems([...items, toItem(full as never, kind)])
    }
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

  /** Seleção em massa: produtos (respeitando fornecedor/busca) e serviços */
  const selectAll = (kind: 'produto' | 'servico') => {
    const pool = kind === 'produto' ? filteredProducts : filteredServices
    const newItems = pool
      .filter((p) => !items.some((it) => it.product_id === p.id))
      .map((p) => toItem(p as never, kind))
    setItems([...items, ...newItems])
  }

  const importAllProducts = () => selectAll('produto')

  const copyFromTable = async () => {
    if (!copyTableId) return
    try {
      const t = await getPriceTablesList()
      const src = t.find((x) => x.id === copyTableId)
      if (src) {
        const srcItems = parseItems(src.items)
        if (srcItems.length > 0) setItems([...items, ...srcItems])
      }
      setCopyTableId('')
    } catch {
      /* noop */
    }
  }

  const rowCell = (it: PriceTableItem, idx: number) => (
    <tr key={idx} className="border-b border-border hover:bg-[#005B2E]/5">
      <td className="px-2 py-1">{it.code || '—'}</td>
      <td className="px-2 py-1 font-medium">
        {it.kind === 'servico' && <Wrench className="w-3 h-3 inline mr-1 text-muted-foreground" />}
        {it.name}
      </td>
      {canViewCosts && (
        <td className="text-right px-2 py-1 font-mono text-muted-foreground">
          {formatCurrency(it.cost_price)}
        </td>
      )}
      <td className="text-right px-2 py-1">{formatCurrency(it.current_price)}</td>
      <td className="text-right px-2 py-1">
        <Input
          value={it.new_price}
          onChange={(e) => updateItem(idx, 'new_price', e.target.value)}
          className="h-7 w-24 text-xs text-right focus-visible:ring-[#005B2E]"
        />
        {warnings[idx] && <AlertTriangle className="w-3 h-3 text-red-500 inline ml-1" />}
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
          onClick={() => setItems(items.filter((_, i) => i !== idx))}
          className="text-red-600 hover:bg-red-50 h-7 w-7 p-0"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </td>
    </tr>
  )

  const hasItems = items.length > 0

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

      {hasItems ? (
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
            <tbody>{items.map((it, idx) => rowCell(it, idx))}</tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground py-4">
          Nenhum item adicionado. Use "Selecionar todos" ou o seletor individual abaixo.
        </p>
      )}

      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-4">
          Carregando produtos e serviços...
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* PRODUTOS */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-[#005B2E]" /> Produtos
                <span className="ml-auto flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => selectAll('produto')}
                    disabled={filteredProducts.length === 0}
                  >
                    <Download className="w-3 h-3 mr-1" /> Selecionar todos
                  </Button>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  placeholder="Buscar por nome ou código..."
                  className="h-8 pl-7 text-sm focus-visible:ring-[#005B2E]"
                />
              </div>
              <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                <SelectTrigger className="h-8 text-sm focus-visible:ring-[#005B2E]">
                  <SelectValue placeholder="Buscar por fornecedor..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fornecedores</SelectItem>
                  {supplierOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="max-h-64 overflow-y-auto rounded-md border divide-y">
                {filteredProducts.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    Nenhum produto encontrado
                  </p>
                ) : (
                  filteredProducts.map((p) => {
                    const checked = items.some((it) => it.product_id === p.id)
                    return (
                      <label
                        key={p.id}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer hover:bg-[#005B2E]/5"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleItem(p as never, 'produto')}
                          className="data-[state=checked]:bg-[#005B2E] data-[state=checked]:border-[#005B2E]"
                        />
                        <span className="truncate flex-1">{p.name}</span>
                        <span className="text-muted-foreground">{p.code}</span>
                        {(p as { main_supplier?: string }).main_supplier && (
                          <span className="text-[10px] text-muted-foreground truncate max-w-[90px]">
                            {(p as { main_supplier?: string }).main_supplier}
                          </span>
                        )}
                      </label>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* SERVIÇOS */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-[#005B2E]" /> Serviços
                <span className="ml-auto">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => selectAll('servico')}
                    disabled={filteredServices.length === 0}
                  >
                    Selecionar todos
                  </Button>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  value={servSearch}
                  onChange={(e) => setServSearch(e.target.value)}
                  placeholder="Buscar por nome ou código..."
                  className="h-8 pl-7 text-sm focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="max-h-64 overflow-y-auto rounded-md border divide-y">
                {filteredServices.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    Nenhum serviço cadastrado
                  </p>
                ) : (
                  filteredServices.map((s) => {
                    const checked = items.some((it) => it.product_id === s.id)
                    return (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer hover:bg-[#005B2E]/5"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleItem(s as never, 'servico')}
                          className="data-[state=checked]:bg-[#005B2E] data-[state=checked]:border-[#005B2E]"
                        />
                        <span className="truncate flex-1">{s.name}</span>
                        <span className="text-muted-foreground">{s.code}</span>
                      </label>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
