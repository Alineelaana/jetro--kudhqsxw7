import React, { useEffect, useState } from 'react'
import { b2bService } from '@/lib/b2b/b2b-service'
import { useB2B } from '@/lib/b2b/b2b-context'
import { B2BProductItem } from '@/lib/b2b/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, ShoppingCart, Check, PackageOpen, Layers } from 'lucide-react'

export const B2BCatalogScreen: React.FC = () => {
  const { addToCart, cart } = useB2B()
  const [products, setProducts] = useState<B2BProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [addedIds, setAddedIds] = useState<{ [id: string]: boolean }>({})

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const items = await b2bService.getCatalog()
        setProducts(items)
      } catch (err) {
        console.error('Erro ao carregar catálogo B2B:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAdd = (product: B2BProductItem) => {
    addToCart(product, 1)
    setAddedIds((prev) => ({ ...prev, [product.id]: true }))
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }))
    }, 1500)
  }

  const getProductCartQty = (id: string) => {
    const found = cart.find((i) => i.product.id === id)
    return found ? found.quantity : 0
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Busca e Categorias */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Catálogo de Produtos B2B
            </h1>
            <p className="text-sm text-slate-500">
              Produtos com disponibilidade para faturamento e suprimento corporativo
            </p>
          </div>
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Buscar por nome, código ou marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </div>
        </div>

        {/* Filtros de Categoria */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5" /> Categorias:
            </span>
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={`text-xs h-7 rounded-full ${
                selectedCategory === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600'
              }`}
            >
              Todas ({products.length})
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs h-7 rounded-full ${
                  selectedCategory === cat ? 'bg-indigo-600 text-white' : 'text-slate-600'
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Grid de Produtos */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-3 text-slate-500 text-sm font-medium">Carregando catálogo B2B...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <PackageOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">Nenhum produto encontrado</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Tente ajustar o termo de pesquisa ou selecionar outra categoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const inCart = getProductCartQty(product.id)
            const isAddedJustNow = addedIds[product.id]

            return (
              <Card
                key={product.id}
                className="flex flex-col justify-between hover:shadow-md transition-shadow duration-200 border-slate-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Cód: {product.code || product.id.slice(0, 8)}
                    </span>
                    {product.brand && (
                      <Badge variant="outline" className="text-xs text-slate-600 border-slate-200">
                        {product.brand}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-800 text-base mt-2 line-clamp-2">
                    {product.name}
                  </h3>
                  {product.category && (
                    <p className="text-xs text-indigo-600 font-medium">{product.category}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-3 pb-3">
                  {product.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-500">
                        Preço B2B / {product.unit || 'un'}
                      </span>
                      <p className="text-xl font-bold text-slate-900 tracking-tight">
                        R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    {product.b2b_min_order_qty > 1 && (
                      <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Mín: {product.b2b_min_order_qty} {product.unit}
                      </span>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-0 border-t border-slate-50 mt-auto">
                  <div className="w-full flex items-center gap-2 pt-3">
                    <Button
                      onClick={() => handleAdd(product)}
                      disabled={isAddedJustNow}
                      className={`w-full font-medium transition-colors ${
                        isAddedJustNow
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isAddedJustNow ? (
                        <>
                          <Check className="w-4 h-4 mr-1.5" />
                          Adicionado!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-1.5" />
                          {inCart > 0
                            ? `Adicionar mais (${inCart} no carrinho)`
                            : 'Adicionar ao Pedido'}
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
