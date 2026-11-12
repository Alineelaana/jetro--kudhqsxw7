import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  PackageCheck,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { pb } from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import type { Product, Empresa } from '@/lib/product-types'
import { recordProductAuditLog } from '@/services/products'

interface ProductCompanyLinkRecord {
  id?: string
  product_id: string
  empresa_id: string
  active: boolean
  status: 'ativo' | 'inativo' | 'bloqueado'
  allow_purchase: boolean
  allow_sale: boolean
  allow_stock: boolean
  block_reason?: string
}

interface Props {
  product: Product | null
  companies: Empresa[]
  currentCompanyId?: string
}

export function ProductTabCompanyLinks({ product, companies, currentCompanyId }: Props) {
  const { toast } = useToast()
  const [links, setLinks] = useState<Record<string, ProductCompanyLinkRecord>>({})
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)

  const loadLinks = useCallback(async () => {
    if (!product?.id) {
      // Produto novo ainda não salvo: inicializa em memória com status padrão
      const initial: Record<string, ProductCompanyLinkRecord> = {}
      companies.forEach((c) => {
        initial[c.id] = {
          product_id: '',
          empresa_id: c.id,
          active: true,
          status: 'ativo',
          allow_purchase: true,
          allow_sale: true,
          allow_stock: true,
        }
      })
      setLinks(initial)
      return
    }

    setLoading(true)
    try {
      const records = await pb
        .collection('product_company_links')
        .getFullList<ProductCompanyLinkRecord>({
          filter: `product_id = '${product.id}'`,
        })
      const map: Record<string, ProductCompanyLinkRecord> = {}
      records.forEach((r) => {
        map[r.empresa_id] = r
      })

      // Se houver empresa sem registro cadastrado, inicializa estado padrão
      companies.forEach((c) => {
        if (!map[c.id]) {
          map[c.id] = {
            product_id: product.id,
            empresa_id: c.id,
            active: false,
            status: 'inativo',
            allow_purchase: false,
            allow_sale: false,
            allow_stock: false,
          }
        }
      })
      setLinks(map)
    } catch (err: any) {
      console.error('Erro ao carregar vínculos produto-empresa:', err)
      toast({
        title: 'Aviso',
        description: 'Não foi possível carregar os vínculos com empresas deste produto.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [product?.id, companies, toast])

  useEffect(() => {
    loadLinks()
  }, [loadLinks])

  const handleToggle = async (
    empresaId: string,
    field: 'active' | 'allow_purchase' | 'allow_sale' | 'allow_stock',
    value: boolean,
  ) => {
    const current = links[empresaId]
    if (!current) return

    const updated: ProductCompanyLinkRecord = {
      ...current,
      [field]: value,
      // Se desativar 'active', ajusta status para inativo
      ...(field === 'active' ? { status: value ? 'ativo' : 'inativo' } : {}),
    }

    setLinks((prev) => ({ ...prev, [empresaId]: updated }))

    if (!product?.id) {
      // Produto ainda não salvo: apenas atualiza o estado local
      return
    }

    setSavingId(empresaId)
    try {
      if (current.id) {
        await pb.collection('product_company_links').update(current.id, {
          [field]: value,
          ...(field === 'active' ? { status: value ? 'ativo' : 'inativo' } : {}),
        })
      } else {
        const created = await pb.collection('product_company_links').create({
          product_id: product.id,
          empresa_id: empresaId,
          active: field === 'active' ? value : true,
          status: field === 'active' && !value ? 'inativo' : 'ativo',
          allow_purchase: field === 'allow_purchase' ? value : true,
          allow_sale: field === 'allow_sale' ? value : true,
          allow_stock: field === 'allow_stock' ? value : true,
        })
        setLinks((prev) => ({ ...prev, [empresaId]: { ...updated, id: created.id } }))
      }

      // Auditoria
      await recordProductAuditLog({
        productId: product.id,
        empresaId,
        scope: 'empresa',
        action: 'update',
        field: `link_${field}`,
        oldValue: String(current[field]),
        newValue: String(value),
        description: `Vínculo com empresa atualizado: ${field} = ${value}`,
      })

      toast({
        title: 'Vínculo atualizado',
        description: 'Permissões operacionais salvas com sucesso.',
      })
    } catch (err: any) {
      console.error('Erro ao atualizar vínculo:', err)
      toast({
        title: 'Erro ao salvar',
        description: err?.message || 'Falha ao salvar permissões da empresa.',
        variant: 'destructive',
      })
      // Reverte
      setLinks((prev) => ({ ...prev, [empresaId]: current }))
    } finally {
      setSavingId(null)
    }
  }

  const handleStatusChange = async (
    empresaId: string,
    status: 'ativo' | 'inativo' | 'bloqueado',
  ) => {
    const current = links[empresaId]
    if (!current) return

    const updated: ProductCompanyLinkRecord = {
      ...current,
      status,
      active: status === 'ativo',
    }
    setLinks((prev) => ({ ...prev, [empresaId]: updated }))

    if (!product?.id) return

    setSavingId(empresaId)
    try {
      if (current.id) {
        await pb.collection('product_company_links').update(current.id, {
          status,
          active: status === 'ativo',
        })
      } else {
        const created = await pb.collection('product_company_links').create({
          product_id: product.id,
          empresa_id: empresaId,
          status,
          active: status === 'ativo',
          allow_purchase: status === 'ativo',
          allow_sale: status === 'ativo',
          allow_stock: status === 'ativo',
        })
        setLinks((prev) => ({ ...prev, [empresaId]: { ...updated, id: created.id } }))
      }

      await recordProductAuditLog({
        productId: product.id,
        empresaId,
        scope: 'empresa',
        action: 'update',
        field: 'link_status',
        oldValue: current.status,
        newValue: status,
        description: `Status do produto na empresa alterado para ${status}`,
      })

      toast({
        title: 'Status atualizado',
        description: `Produto definido como ${status} para esta empresa.`,
      })
    } catch (err: any) {
      console.error('Erro ao alterar status:', err)
      toast({
        title: 'Erro ao salvar',
        description: err?.message || 'Falha ao atualizar status.',
        variant: 'destructive',
      })
      setLinks((prev) => ({ ...prev, [empresaId]: current }))
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-muted/40 rounded-lg border border-border">
        <div>
          <h4 className="text-sm font-bold text-[#005B2E] flex items-center gap-1.5">
            <Building2 className="w-4 h-4" /> Vínculos e Permissões Operacionais por Empresa
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Defina em quais empresas este produto mestre está ativo e autorizado a ser comprado,
            vendido e estocado.
          </p>
        </div>
        {product?.id && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadLinks}
            disabled={loading}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Vínculos
          </Button>
        )}
      </div>

      {loading && !Object.keys(links).length ? (
        <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#005B2E]" /> Carregando empresas
          vinculadas...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {companies.map((company) => {
            const link = links[company.id] || {
              product_id: product?.id || '',
              empresa_id: company.id,
              active: false,
              status: 'inativo',
              allow_purchase: false,
              allow_sale: false,
              allow_stock: false,
            }
            const isSaving = savingId === company.id
            const isCurrent = currentCompanyId === company.id

            return (
              <Card
                key={company.id}
                className={`border transition-all ${
                  link.active
                    ? 'border-[#005B2E]/30 bg-card'
                    : 'border-border/70 bg-muted/20 opacity-80'
                }`}
              >
                <CardContent className="p-3.5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-[#005B2E]/10 text-[#005B2E]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                            {company.razao_social || company.nome_fantasia}
                          </span>
                          {isCurrent && (
                            <Badge
                              variant="outline"
                              className="text-[10px] bg-[#005B2E]/10 text-[#005B2E] border-[#005B2E]/30"
                            >
                              Empresa Atual
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          CNPJ: {company.cnpj || '—'} {company.sigla ? `(${company.sigla})` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#005B2E]" />}
                      <Select
                        value={link.status || (link.active ? 'ativo' : 'inativo')}
                        onValueChange={(val: any) => handleStatusChange(company.id, val)}
                      >
                        <SelectTrigger className="h-8 w-32 text-xs focus-visible:ring-[#005B2E]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo" className="text-emerald-700 font-medium">
                            ● Ativo
                          </SelectItem>
                          <SelectItem value="inativo" className="text-muted-foreground">
                            ○ Inativo
                          </SelectItem>
                          <SelectItem value="bloqueado" className="text-destructive font-medium">
                            ✕ Bloqueado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Toggles operacionais: Comprar / Vender / Estocar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-border/60">
                    <div className="flex items-center justify-between p-2 rounded bg-background border border-border/60">
                      <div className="flex items-center gap-1.5">
                        <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-medium">Permite Compra</span>
                      </div>
                      <Switch
                        checked={link.allow_purchase}
                        onCheckedChange={(v) => handleToggle(company.id, 'allow_purchase', v)}
                        disabled={link.status === 'bloqueado'}
                      />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-background border border-border/60">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-xs font-medium">Permite Venda</span>
                      </div>
                      <Switch
                        checked={link.allow_sale}
                        onCheckedChange={(v) => handleToggle(company.id, 'allow_sale', v)}
                        disabled={link.status === 'bloqueado'}
                      />
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-background border border-border/60">
                      <div className="flex items-center gap-1.5">
                        <PackageCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-xs font-medium">Controla Estoque</span>
                      </div>
                      <Switch
                        checked={link.allow_stock}
                        onCheckedChange={(v) => handleToggle(company.id, 'allow_stock', v)}
                        disabled={link.status === 'bloqueado'}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
