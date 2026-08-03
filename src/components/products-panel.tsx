import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  getProducts,
  deleteProduct,
  toggleProductActive,
  updateProduct,
  getProductPhotoUrl,
} from '@/services/products'
import { useRealtime } from '@/hooks/use-realtime'
import { ProductFormDialog } from '@/components/product-form-dialog'
import { exportProductsExcel, exportProductsPdf } from '@/lib/product-export'
import { type Product } from '@/lib/product-types'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  Loader2,
  Package,
  ImageIcon,
  FileSpreadsheet,
  FileText,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface ConfirmState {
  type: 'delete' | 'activate' | 'inactivate'
  product: Product
}

function StockCell({
  product,
  onUpdate,
}: {
  product: Product
  onUpdate: (id: string, stock: number) => void
}) {
  const [value, setValue] = useState(String(product.stock ?? 0))

  useEffect(() => {
    setValue(String(product.stock ?? 0))
  }, [product.stock])

  const handleBlur = () => {
    const num = parseInt(value, 10) || 0
    if (num !== (product.stock ?? 0)) {
      onUpdate(product.id, num)
    }
  }

  return (
    <Input
      type="number"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      placeholder="0"
      min="0"
      className="w-20 h-8 text-center focus-visible:ring-[#005B2E]"
    />
  )
}

export function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getProducts()
      setProducts(Array.isArray(data) ? (data as unknown as Product[]) : [])
    } catch {
      setError('Não foi possível carregar os produtos.')
      setProducts([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('products', () => load())

  const categories = useMemo(() => {
    const cats = (products || []).map((p) => p?.category).filter(Boolean)
    return [...new Set(cats)].sort()
  }, [products])

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim()
    return (products || []).filter(Boolean).filter((p) => {
      const matchesSearch =
        !term ||
        p?.name?.toLowerCase()?.includes(term) ||
        p?.code?.toLowerCase()?.includes(term) ||
        p?.ean?.toLowerCase()?.includes(term) ||
        p?.ncm?.toLowerCase()?.includes(term)
      const matchesCategory = categoryFilter === 'all' || p?.category === categoryFilter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p?.active !== false) ||
        (statusFilter === 'inactive' && p?.active === false)
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, search, categoryFilter, statusFilter])

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const handleEdit = (p: Product) => {
    setEditing(p)
    setFormOpen(true)
  }

  const handleStockUpdate = async (id: string, stock: number) => {
    try {
      await updateProduct(id, { stock } as Record<string, unknown>)
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock } : p)))
      toast({ title: 'Estoque atualizado' })
    } catch {
      toast({ title: 'Erro ao atualizar estoque', variant: 'destructive' })
    }
  }

  const handleConfirm = async () => {
    if (!confirm) return
    setActionLoading(true)
    try {
      if (confirm.type === 'delete') {
        await deleteProduct(confirm.product.id)
        toast({ title: 'Produto excluído' })
      } else {
        const active = confirm.type === 'activate'
        await toggleProductActive(confirm.product.id, active)
        toast({ title: active ? 'Produto ativado' : 'Produto inativado' })
      }
      load()
    } catch (err: unknown) {
      const e = err as { response?: { message?: string }; message?: string }
      toast({
        title: e?.response?.message || e?.message || 'Erro.',
        variant: 'destructive',
      })
    }
    setActionLoading(false)
    setConfirm(null)
  }

  const isEmpty = !loading && !error && (products || []).length === 0
  const confirmTitle = !confirm
    ? ''
    : confirm.type === 'delete'
      ? 'Excluir Produto'
      : confirm.type === 'activate'
        ? 'Ativar Produto'
        : 'Inativar Produto'
  const confirmDesc = !confirm
    ? ''
    : confirm.type === 'delete'
      ? `Excluir "${confirm.product?.name || '—'}"? Esta ação não pode ser desfeita.`
      : confirm.type === 'activate'
        ? `Ativar "${confirm.product?.name || '—'}"?`
        : `Inativar "${confirm.product?.name || '—'}"? Produtos inativos não aparecerão em novos orçamentos.`

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-black text-foreground">Cadastro de Produtos</h2>
        <Button
          onClick={handleNew}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Cadastrar novo produto
        </Button>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Package className="w-16 h-16 text-[#005B2E]/30 mb-6" />
          <p className="text-lg font-bold text-foreground mb-6">Nenhum produto cadastrado</p>
          <Button
            onClick={handleNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold text-base h-14 px-8 rounded-xl shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" /> Cadastrar produto
          </Button>
        </div>
      ) : (
        <>
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="py-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Pesquisar por nome, código ou EAN"
                  className="pl-10 focus-visible:ring-[#005B2E]"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48 focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 focus-visible:ring-[#005B2E]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2 sm:ml-auto">
                  <Button
                    variant="outline"
                    onClick={() => exportProductsExcel(filtered)}
                    disabled={filtered.length === 0}
                    className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/5"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => exportProductsPdf(filtered)}
                    disabled={filtered.length === 0}
                    className="border-[#005B2E] text-[#005B2E] hover:bg-[#005B2E]/5"
                  >
                    <FileText className="w-4 h-4 mr-2" /> PDF
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {filtered.length} produto(s) encontrado(s)
              </p>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
            </div>
          ) : error ? (
            <Card className="border-2 border-dashed border-destructive/30">
              <CardContent className="py-16 text-center">
                <Package className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-lg font-bold mb-1">{error}</p>
                <Button
                  onClick={load}
                  variant="outline"
                  className="mt-3 border-[#005B2E] text-[#005B2E]"
                >
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="border-2 border-dashed border-border">
              <CardContent className="py-16 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-bold mb-1">Nenhum produto encontrado.</p>
                <p className="text-sm text-muted-foreground">
                  Ajuste a busca ou cadastre um novo produto.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#01361D] text-white">
                      <th className="text-left px-4 py-3 font-bold hidden md:table-cell">Código</th>
                      <th className="text-left px-4 py-3 font-bold">Nome</th>
                      <th className="text-left px-4 py-3 font-bold hidden sm:table-cell">EAN</th>
                      <th className="text-left px-4 py-3 font-bold hidden lg:table-cell">NCM</th>
                      <th className="text-left px-4 py-3 font-bold hidden sm:table-cell">Preço</th>
                      <th className="text-left px-4 py-3 font-bold">Estoque</th>
                      <th className="text-left px-4 py-3 font-bold hidden lg:table-cell">Fotos</th>
                      <th className="text-left px-4 py-3 font-bold">Status</th>
                      <th className="text-center px-4 py-3 font-bold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => (
                      <tr
                        key={p?.id || Math.random()}
                        className="border-b border-border hover:bg-[#005B2E]/5 transition-colors"
                      >
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-xs font-mono font-bold text-[#C89B3C]">
                            {p?.code || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {p?.name || '—'}
                          {p?.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {p.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">{p?.ean || '—'}</td>
                        <td className="px-4 py-3 hidden lg:table-cell">{p?.ncm || '—'}</td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {p?.price ? `R$ ${p.price}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <StockCell product={p} onUpdate={handleStockUpdate} />
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            {(p?.photos || []).length > 0 && (
                              <img
                                src={getProductPhotoUrl(p.id, p.photos[0], '100x100')}
                                alt={p.name}
                                className="w-8 h-8 rounded object-cover border border-border"
                              />
                            )}
                            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <ImageIcon className="w-3 h-3" />
                              {(p?.photos || []).length}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-bold px-2 py-1 rounded ${
                              p?.active !== false
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {p?.active !== false ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(p)}
                              className="text-[#005B2E] hover:bg-[#005B2E]/10"
                              title="Editar"
                              disabled={!p}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            {p?.active !== false ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setConfirm({ type: 'inactivate', product: p })}
                                className="text-orange-600 hover:bg-orange-50"
                                title="Inativar"
                                disabled={!p}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setConfirm({ type: 'activate', product: p })}
                                className="text-emerald-600 hover:bg-emerald-50"
                                title="Ativar"
                                disabled={!p}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setConfirm({ type: 'delete', product: p })}
                              className="text-red-600 hover:bg-red-50"
                              title="Excluir"
                              disabled={!p}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        onSuccess={load}
      />

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={actionLoading}
              className="bg-[#005B2E] hover:bg-[#01361D]"
            >
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
