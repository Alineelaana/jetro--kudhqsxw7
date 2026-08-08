import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileCheck, Loader2 } from 'lucide-react'
import { mkGetList } from '@/services/mk'

export function TmAccountability() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      setItems(await mkGetList('mk_accountability'))
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
        <h2 className="text-lg font-bold text-[#005B2E]">Prestação de Contas</h2>
        <Button size="sm" className="bg-[#005B2E] hover:bg-[#01361D]">
          <Plus className="w-4 h-4 mr-1" /> Nova Prestação
        </Button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#005B2E] animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="border-2 border-dashed border-[#005B2E]/30">
          <CardContent className="py-12 text-center">
            <FileCheck className="w-10 h-10 text-[#005B2E]/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma prestação de contas cadastrada.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Vincule ações, verbas, evidências e ROI para gerar apresentações profissionais
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-[#005B2E]">{item.objective || '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.supplier || '—'} • {item.status || '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Investimento</p>
                  <p className="text-sm font-semibold text-[#005B2E]">
                    R$ {item.investment || '0'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
