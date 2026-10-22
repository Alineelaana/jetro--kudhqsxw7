import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  Layers,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Boxes,
} from 'lucide-react'
import { ProductFormDialog } from '@/components/product-form-dialog'
import {
  getProducts,
  deleteProduct,
  toggleProductActive,
  getProductPhotoUrl,
} from '@/services/products'
import type { Product } from '@/lib/product-types'
import { evaluateProductFiscalReadiness } from '@/lib/fiscal-validations'
import { useBrand } from '@/hooks/use-brand'
import { toast } from '@/hooks/use-toast'

export function ProductsPanel() {
  const { brand, empresasDisponiveis } = useBrand()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterFinalidade, setFilterFinalidade] = useState<string>('all')
  const [filterFiscalStatus, setFilterFiscalStatus] = useState<string>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getProducts()
      setProducts(data)
    } catch {
      toast({
        title: 'Erro ao carregar lista de produtos.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (prod: Product) => {
    setSelectedProduct(prod)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${name}"?`)) return
    try {
      await deleteProduct(id)
      toast({ title: 'Produto excluído com sucesso.' })
      await loadData()
    } catch {
      toast({ title: 'Erro ao excluir produto.', variant: 'destructive' })
    }
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await toggleProductActive(id, !current)
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: !current } : p)))
    } catch {
      toast({ title: 'Erro ao alterar status do produto.', variant: 'destructive' })
    }
  }

  // Categorias únicas
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))

  // Filtros combinados
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchTerm === '' ||
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ncm?.includes(searchTerm) ||
      p.ean?.includes(searchTerm) ||
      p.brand?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory === 'all' || p.category === filterCategory

    const matchesFinalidade =
      filterFinalidade === 'all' || (p.tipo_finalidade || 'revenda') === filterFinalidade

    const fiscalCheck = evaluateProductFiscalReadiness({
      name: p.name,
      ncm: p.ncm,
      unit: p.unit,
      tipo_finalidade: p.tipo_finalidade,
      origin: p.origin,
      ean: p.ean,
      cest: p.cest,
      cfop: p.cfop,
      cst_csosn: p.cst_csosn,
    })

    const isFiscalReady = p.fiscal_status === 'validado_fiscal' || fiscalCheck.isReadyForFiscal

    const matchesFiscalStatus =
      filterFiscalStatus === 'all' ||
      (filterFiscalStatus === 'pronto' && isFiscalReady) ||
      (filterFiscalStatus === 'rascunho' && !isFiscalReady)

    return matchesSearch && matchesCategory && matchesFinalidade && matchesFiscalStatus
  })

  // Contadores para os cartões executivos
  const totalProducts = products.length
  const totalActive = products.filter((p) => p.active !== false).length
  const totalFabricacaoPropria = products.filter(
    (p) => p.tipo_finalidade === 'fabricacao_propria',
  ).length
  const totalFiscalReady = products.filter((p) => {
    return (
      p.fiscal_status === 'validado_fiscal' ||
      evaluateProductFiscalReadiness({
        name: p.name,
        ncm: p.ncm,
        unit: p.unit,
        origin: p.origin,
        ean: p.ean,
      }).isReadyForFiscal
    )
  }).length

  return (
    <div className="space-y-5">
      {/* Banner de Contexto de Estabelecimento */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-emerald-950/10 via-emerald-900/5 to-transparent border border-[#005B2E]/20 rounded-lg">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#005B2E] text-white hover:bg-[#005B2E] font-bold text-xs uppercase tracking-wide">
              {brand.nomeExibicao || brand.empresaNome || 'DEC Eldorado'}
            </Badge>
            <span className="text-xs text-muted-foreground">Unidade Ativa</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mt-1">
            Catálogo e Cadastro de Produtos (NF-e mod 55)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cadastro mestre compartilhado com parametrização fiscal e de estoque independente por
            estabelecimento (DEC Eldorado e Gran Romano).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setSelectedProduct(null)
              setIsFormOpen(true)
            }}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Novo Produto
          </Button>
        </div>
      </div>

      {/* Cartões Executivos de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Total de Itens
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{totalProducts}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {totalActive} ativos no ERP
              </p>
            </div>
            <div className="p-2.5 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Prontos p/ NF-e
              </p>
              <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                {totalFiscalReady}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                NCM e parâmetros fiscais validados
              </p>
            </div>
            <div className="p-2.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Fabricação Própria
              </p>
              <h3 className="text-2xl font-bold text-[#C89B3C] mt-1">{totalFabricacaoPropria}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                CFOP 5101/6101 (Gran Romano)
              </p>
            </div>
            <div className="p-2.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-lg">
              <Boxes className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Rascunhos / Pendentes
              </p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {totalProducts - totalFiscalReady}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Permitidos, bloqueados p/ emissão
              </p>
            </div>
            <div className="p-2.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros e Busca */}
      <Card className="border border-border">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por descrição, código interno, NCM, GTIN/EAN ou marca..."
                className="pl-9 h-9 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
              <Select value={filterFinalidade} onValueChange={setFilterFinalidade}>
                <SelectTrigger className="h-9 text-xs w-44">
                  <SelectValue placeholder="Tipo / Finalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Finalidades</SelectItem>
                  <SelectItem value="revenda">Revenda</SelectItem>
                  <SelectItem value="fabricacao_propria">Fabricação Própria</SelectItem>
                  <SelectItem value="materia_prima">Matéria-Prima (Gran)</SelectItem>
                  <SelectItem value="embalagem">Embalagem</SelectItem>
                  <SelectItem value="ativo_imobilizado">Ativo Imobilizado</SelectItem>
                  <SelectItem value="uso_consumo">Uso / Consumo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterFiscalStatus} onValueChange={setFilterFiscalStatus}>
                <SelectTrigger className="h-9 text-xs w-44">
                  <SelectValue placeholder="Status Fiscal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pronto">Pronto p/ NF-e</SelectItem>
                  <SelectItem value="rascunho">Rascunho Pendente</SelectItem>
                </SelectContent>
              </Select>

              {categories.length > 0 && (
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-9 text-xs w-36">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Categorias</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Produtos */}
      <Card className="border border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#005B2E]" />
              Carregando catálogo de produtos...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground space-y-2">
              <Package className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="font-semibold text-foreground">Nenhum produto encontrado</p>
              <p className="text-xs">
                {searchTerm
                  ? 'Tente ajustar os termos da busca ou filtros.'
                  : 'Clique em "Novo Produto" para iniciar um cadastro mestre.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] font-bold border-b">
                  <tr>
                    <th className="py-3 px-4 text-left w-12">Foto</th>
                    <th className="py-3 px-4 text-left">Código / Descrição</th>
                    <th className="py-3 px-4 text-left">Tipo / Finalidade</th>
                    <th className="py-3 px-4 text-left">NCM / Origem</th>
                    <th className="py-3 px-4 text-left">Unidade Base</th>
                    <th className="py-3 px-4 text-right">Preço de Venda</th>
                    <th className="py-3 px-4 text-center">Status Fiscal</th>
                    <th className="py-3 px-4 text-center">Ativo</th>
                    <th className="py-3 px-4 text-center w-16">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((p) => {
                    const fiscalCheck = evaluateProductFiscalReadiness({
                      name: p.name,
                      ncm: p.ncm,
                      unit: p.unit,
                      tipo_finalidade: p.tipo_finalidade,
                      origin: p.origin,
                      ean: p.ean,
                      cest: p.cest,
                      cfop: p.cfop,
                      cst_csosn: p.cst_csosn,
                    })

                    const isFiscalReady =
                      p.fiscal_status === 'validado_fiscal' || fiscalCheck.isReadyForFiscal

                    return (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        {/* Foto */}
                        <td className="py-2.5 px-4">
                          {p.main_photo ? (
                            <img
                              src={getProductPhotoUrl(p.id, p.main_photo, '100x100')}
                              alt={p.name}
                              className="w-8 h-8 rounded object-cover border border-border"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground border border-border">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                        </td>

                        {/* Código e Descrição */}
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                            {p.name}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            <span className="font-mono text-[#005B2E] font-bold">{p.code}</span>
                            {p.brand && <span>• {p.brand}</span>}
                            {p.ean && p.ean !== 'SEM GTIN' && (
                              <span className="font-mono">• EAN: {p.ean}</span>
                            )}
                            {p.ean === 'SEM GTIN' && (
                              <span className="text-[10px] text-muted-foreground">
                                • (Sem GTIN)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Tipo / Finalidade */}
                        <td className="py-2.5 px-4">
                          <Badge
                            variant="outline"
                            className={`text-[10px] py-0 font-medium ${
                              p.tipo_finalidade === 'fabricacao_propria'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                                : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300'
                            }`}
                          >
                            {p.tipo_finalidade === 'fabricacao_propria'
                              ? 'Fabricação Própria'
                              : p.tipo_finalidade === 'materia_prima'
                                ? 'Matéria-Prima'
                                : p.tipo_finalidade === 'embalagem'
                                  ? 'Embalagem'
                                  : 'Revenda'}
                          </Badge>
                        </td>

                        {/* NCM e Origem */}
                        <td className="py-2.5 px-4 font-mono">
                          <div className="font-bold text-foreground">{p.ncm || '—'}</div>
                          <div className="text-[10px] text-muted-foreground">
                            Origem {p.origin ?? '0'}
                          </div>
                        </td>

                        {/* Unidade */}
                        <td className="py-2.5 px-4 font-mono font-bold text-[#005B2E]">
                          {p.unit || 'UN'}
                        </td>

                        {/* Preço de Venda */}
                        <td className="py-2.5 px-4 text-right font-mono font-bold">
                          {p.price
                            ? `R$ ${parseFloat(p.price).toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : '—'}
                        </td>

                        {/* Status Fiscal */}
                        <td className="py-2.5 px-4 text-center">
                          {isFiscalReady ? (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-300 text-[10px] py-0.5">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Pronto p/ NF-e
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-300 text-[10px] py-0.5">
                              <AlertTriangle className="w-3 h-3 mr-1" /> Rascunho
                            </Badge>
                          )}
                        </td>

                        {/* Ativo */}
                        <td className="py-2.5 px-4 text-center">
                          <Switch
                            checked={p.active !== false}
                            onCheckedChange={() => handleToggleActive(p.id, p.active !== false)}
                            className="scale-75"
                          />
                        </td>

                        {/* Ações */}
                        <td className="py-2.5 px-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 text-xs">
                              <DropdownMenuItem
                                onClick={() => handleEdit(p)}
                                className="cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 mr-2 text-[#005B2E]" /> Editar / Fiscal
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(p.id, p.name)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Cadastro / Edição Mestre e Fiscal */}
      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        product={selectedProduct}
        onSuccess={() => {
          loadData()
          setIsFormOpen(false)
        }}
      />
    </div>
  )
}
