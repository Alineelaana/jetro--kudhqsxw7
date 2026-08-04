import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { getProductFileUrl } from '@/services/products'
import type { Product } from '@/lib/product-types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
}

function F({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-sm">{value || '—'}</p>
    </div>
  )
}

export function ProductViewDialog({ open, onOpenChange, product }: Props) {
  if (!product) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#005B2E]">{product.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[#005B2E] mb-2 border-b-2 border-[#C89B3C] pb-1">
                Dados Gerais
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <F label="Código" value={product.code} />
                <F label="EAN" value={product.ean} />
                <F label="Cód. Fabricante" value={product.manufacturer_code} />
                <F label="Descrição Resumida" value={product.description} />
                <F label="Marca" value={product.brand} />
                <F label="Categoria" value={product.category} />
                <F label="Subcategoria" value={product.subcategory} />
                <F label="Unidade" value={product.unit} />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Situação</p>
                  <Badge
                    variant="outline"
                    className={product.active !== false ? 'text-emerald-600' : 'text-gray-500'}
                  >
                    {product.active !== false ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#005B2E] mb-2 border-b-2 border-[#C89B3C] pb-1">
                Comercial
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <F label="Preço de Custo" value={product.cost_price} />
                <F label="Preço de Venda" value={product.price} />
                <F label="Margem de Lucro" value={product.profit_margin} />
                <F label="Comissão" value={product.commission} />
                <F label="Desconto Máximo" value={product.max_discount} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#005B2E] mb-2 border-b-2 border-[#C89B3C] pb-1">
                Fiscal
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <F label="NCM" value={product.ncm} />
                <F label="CEST" value={product.cest} />
                <F label="CFOP" value={product.cfop} />
                <F label="Origem" value={product.origin} />
                <F label="CST/CSOSN" value={product.cst_csosn} />
                <F label="ICMS" value={product.icms_aliquot} />
                <F label="IPI" value={product.ipi} />
                <F label="PIS" value={product.pis} />
                <F label="COFINS" value={product.cofins} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#005B2E] mb-2 border-b-2 border-[#C89B3C] pb-1">
                Estoque
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <F label="Estoque Atual" value={String(product.stock ?? 0)} />
                <F label="Estoque Mínimo" value={String(product.min_stock ?? 0)} />
                <F label="Estoque Máximo" value={String(product.max_stock ?? 0)} />
                <F label="Localização" value={product.location} />
                <F label="Lote" value={product.lot} />
                <F label="Validade" value={product.validity} />
                <F label="Controle de Lote" value={product.allow_lot_control ? 'Sim' : 'Não'} />
                <F
                  label="Controle de Validade"
                  value={product.allow_validity_control ? 'Sim' : 'Não'}
                />
                <F label="Número de Série" value={product.allow_serial_number ? 'Sim' : 'Não'} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#005B2E] mb-2 border-b-2 border-[#C89B3C] pb-1">
                Compras
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <F label="Fornecedor" value={product.main_supplier} />
                <F label="Cód. no Fornecedor" value={product.supplier_product_code} />
                <F label="Último Custo" value={product.last_cost} />
                <F label="Última Compra" value={product.last_purchase} />
                <F label="Prazo Reposição" value={product.replenishment_time} />
              </div>
            </div>
            {product.internal_observations && (
              <div>
                <h3 className="text-sm font-bold text-[#005B2E] mb-2 border-b-2 border-[#C89B3C] pb-1">
                  Observações
                </h3>
                <p className="text-sm whitespace-pre-wrap">{product.internal_observations}</p>
              </div>
            )}
            {product.photos?.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-[#005B2E] mb-2 border-b-2 border-[#C89B3C] pb-1">
                  Fotos
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.photos.map((p) => (
                    <img
                      key={p}
                      src={getProductFileUrl(product.id, p, '200x200')}
                      alt={product.name}
                      className="w-20 h-20 rounded-lg object-cover border border-border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
