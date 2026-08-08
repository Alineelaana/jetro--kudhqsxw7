import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Loader2 } from 'lucide-react'
import { mkGetList } from '@/services/mk'

export function TmMaterials() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      setItems(await mkGetList('mk_materials'))
    } catch {
      setItems([])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-[#005B2E]">Biblioteca de Materiais</h2>
        <Button size="sm" className="bg-[#005B2E] hover:bg-[#01361D]">
          <Plus className="w-4 h-4 mr-1" /> Novo Material
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#005B2E] animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="border-2 border-dashed border-[#005B2E]/30">
          <CardContent className="py-12 text-center">
            <FileText className="w-10 h-10 text-[#005B2E]/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum material cadastrado.</p>
            <p className="text-xs text-muted-foreground mt-1">
              logos, banners, folders, catálogos, vídeos, fotos, apresentações, PDFs, materiais de
              PDV
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((m) => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <p className="font-semibold text-sm text-[#005B2E]">{m.name}</p>
                <p className="text-xs text-muted-foreground">
                  {m.type || '—'} • {m.brand || '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{m.category || '—'}</p>
                {m.year && (
                  <span className="inline-block mt-1 text-[10px] bg-[#005B2E]/10 text-[#005B2E] px-2 py-0.5 rounded">
                    {m.year}
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
