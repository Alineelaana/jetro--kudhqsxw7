import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, FolderOpen, FileImage } from 'lucide-react'
import { getMkBrandAssets, getMkList } from '@/services/marketing'
import { useRealtime } from '@/hooks/use-realtime'

export function MarketingLibrary() {
  const [brandAssets, setBrandAssets] = useState<Record<string, unknown>[]>([])
  const [materials, setMaterials] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [ba, mat] = await Promise.all([
        getMkBrandAssets().catch(() => []),
        getMkList('mk_materials').catch(() => []),
      ])
      setBrandAssets(ba as Record<string, unknown>[])
      setMaterials(mat as Record<string, unknown>[])
    } catch {
      setBrandAssets([])
      setMaterials([])
    }
    setLoading(false)
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useRealtime('mk_brand_assets', () => load())
  useRealtime('mk_materials', () => load())

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#005B2E]">Biblioteca Corporativa de Marketing</h2>
        <span className="text-xs text-muted-foreground">
          Biblioteca única — sem duplicação de arquivos
        </span>
      </div>
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-[#005B2E] mb-3 flex items-center gap-2">
            <FolderOpen className="w-4 h-4" /> Brand Assets ({brandAssets.length})
          </h3>
          {brandAssets.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum asset.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {brandAssets.map((a) => (
                <div key={a.id as string} className="border rounded p-2 hover:bg-[#005B2E]/5">
                  <FileImage className="w-6 h-6 text-[#005B2E]/40 mb-1" />
                  <p className="text-xs font-semibold truncate">{a.name as string}</p>
                  <p className="text-[10px] text-muted-foreground">{a.category as string}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-bold text-[#005B2E] mb-3 flex items-center gap-2">
            <FolderOpen className="w-4 h-4" /> Materiais de Marketing ({materials.length})
          </h3>
          {materials.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum material.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {materials.map((m) => (
                <div key={m.id as string} className="border rounded p-2 hover:bg-[#005B2E]/5">
                  <FileImage className="w-6 h-6 text-[#005B2E]/40 mb-1" />
                  <p className="text-xs font-semibold truncate">{m.name as string}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {(m.type as string) || '—'} • {(m.brand as string) || '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
