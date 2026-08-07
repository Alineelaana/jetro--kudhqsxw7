import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Layers, GitBranch, Check, X, ChevronDown, ChevronRight } from 'lucide-react'
import { getBomVersions, getBomComponents, getIndustrialItems } from '@/services/industry'
import { getBomExplosion, approveBomRevision } from '@/services/engineering'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import type { BomVersion, BomComponent } from '@/lib/industry-types'

const REV_STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-600',
  em_aprovacao: 'bg-amber-100 text-amber-700',
  aprovada: 'bg-emerald-100 text-emerald-700',
  rejeitada: 'bg-red-100 text-red-700',
  obsoleta: 'bg-gray-100 text-gray-500',
}

export function BomEngineeringPanel() {
  const { user } = useAuth()
  const [boms, setBoms] = useState<BomVersion[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBom, setSelectedBom] = useState<BomVersion | null>(null)
  const [components, setComponents] = useState<BomComponent[]>([])
  const [explosion, setExplosion] = useState<any>(null)
  const [showExplosion, setShowExplosion] = useState(false)
  const [exploading, setExploading] = useState(false)

  const load = async () => {
    try {
      const [b, i] = await Promise.all([getBomVersions(), getIndustrialItems()])
      setBoms(b)
      setItems(i as any[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('bom_versions', () => load())

  const loadComponents = async (bomId: string) => {
    try {
      setComponents(await getBomComponents(bomId))
    } catch {
      setComponents([])
    }
  }

  const handleExplosion = async (productId: string) => {
    setExploading(true)
    try {
      const result = await getBomExplosion(productId)
      setExplosion(result)
      setShowExplosion(true)
    } catch {
      toast({ title: 'Erro ao explodir BOM', variant: 'destructive' })
    }
    setExploading(false)
  }

  const handleApprove = async (bomId: string, action: 'approve' | 'reject') => {
    try {
      await approveBomRevision({ bom_id: bomId, action })
      toast({ title: action === 'approve' ? 'Revisao aprovada' : 'Revisao rejeitada' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Layers className="w-6 h-6 text-[#005B2E]" />
        <h2 className="text-xl font-black text-foreground">Engenharia de BOM Multinivel</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {boms.map((b) => (
          <Card
            key={b.id}
            className={`border-2 cursor-pointer transition-colors ${selectedBom?.id === b.id ? 'border-[#005B2E]' : 'border-[#005B2E]/20 hover:border-[#005B2E]/40'}`}
            onClick={() => {
              setSelectedBom(b)
              loadComponents(b.id)
              setShowExplosion(false)
            }}
          >
            <CardContent className="py-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="font-bold text-sm">{b.expand?.product_id?.name || '-'}</p>
                  <p className="text-xs text-muted-foreground">
                    v{b.version} {b.revision_number ? `- Rev ${b.revision_number}` : ''} -{' '}
                    {b.type === 'formulacao' ? 'Formulacao' : 'Estrutura'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Badge
                    className={REV_STATUS_COLORS[b.revision_status || b.status] || 'bg-gray-100'}
                  >
                    {b.revision_status || b.status}
                  </Badge>
                </div>
              </div>
              {(b.revision_status === 'rascunho' || b.revision_status === 'em_aprovacao') && (
                <div className="flex gap-1 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleApprove(b.id, 'approve')
                    }}
                  >
                    <Check className="w-3 h-3 mr-1" /> Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleApprove(b.id, 'reject')
                    }}
                  >
                    <X className="w-3 h-3 mr-1" /> Rejeitar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedBom && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#005B2E]">
                {selectedBom.expand?.product_id?.name} (v{selectedBom.version})
              </h3>
              <Button
                size="sm"
                variant="outline"
                disabled={exploading}
                onClick={() => handleExplosion(selectedBom.product_id)}
              >
                <GitBranch className="w-4 h-4 mr-1" />
                {exploading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Explodir BOM'}
              </Button>
            </div>
            {!showExplosion ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3 font-bold">Ordem</th>
                      <th className="text-left py-2 px-3 font-bold">Item</th>
                      <th className="text-left py-2 px-3 font-bold">Qtd</th>
                      <th className="text-left py-2 px-3 font-bold">Un</th>
                      <th className="text-left py-2 px-3 font-bold">Perda</th>
                    </tr>
                  </thead>
                  <tbody>
                    {components.map((c) => (
                      <tr key={c.id} className="border-b border-border">
                        <td className="py-2 px-3">{c.ordem}</td>
                        <td className="py-2 px-3 font-medium">
                          {c.expand?.item_id?.name || '-'}
                          {(c as any).is_obsolete && (
                            <Badge className="ml-2 bg-red-100 text-red-700">Obsoleto</Badge>
                          )}
                        </td>
                        <td className="py-2 px-3">{c.quantidade}</td>
                        <td className="py-2 px-3">{c.unidade}</td>
                        <td className="py-2 px-3">{c.perda_prevista}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : explosion ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#005B2E] mb-2">
                  Explosao Multinivel - {explosion.total_components} componentes
                </p>
                {explosion.components.map((c: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-1 text-sm"
                    style={{ paddingLeft: `${c.level * 20}px` }}
                  >
                    {c.level > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                    <span className="font-medium">{c.item_name}</span>
                    <span className="text-xs text-muted-foreground">{c.item_code}</span>
                    <Badge variant="outline" className="text-xs">
                      Nv{c.level}
                    </Badge>
                    <span className="text-xs">
                      Qtd: {c.total_quantity} {c.unit}
                    </span>
                    {c.is_obsolete && (
                      <Badge className="bg-red-100 text-red-700 text-xs">Obs</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
