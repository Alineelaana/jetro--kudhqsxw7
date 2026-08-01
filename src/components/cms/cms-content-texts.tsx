import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { searchContent, saveCmsDraft } from '@/services/cms'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Search, Loader2, Edit3, Save, X } from 'lucide-react'

export function CmsContentTexts() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ section: string; field: string; value: string }>>(
    [],
  )
  const [searching, setSearching] = useState(false)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const r = await searchContent(query)
      setResults(r)
    } catch {
      setResults([])
    }
    setSearching(false)
  }

  const handleSave = async (idx: number) => {
    const result = results[idx]
    try {
      const { getCmsSection } = await import('@/services/cms')
      const content = await getCmsSection(result.section)
      if (content) {
        const draft = content.draft_data as Record<string, unknown>
        draft[result.field] = editValue
        await saveCmsDraft(result.section, draft, (user?.id as string) || '')
        const newResults = [...results]
        newResults[idx] = { ...result, value: editValue }
        setResults(newResults)
        setEditingIdx(null)
        toast.success('Texto atualizado no rascunho!')
      }
    } catch {
      toast.error('Erro ao salvar.')
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <h3 className="text-base font-bold text-foreground">Busca de Conteúdos e Textos</h3>
          <p className="text-sm text-muted-foreground">
            Pesquise qualquer texto do site para encontrar e editar todas as ocorrências.
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ex: Operações Logísticas"
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={searching}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}{' '}
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="py-4">
            <p className="text-sm font-bold mb-3">{results.length} resultado(s) encontrado(s)</p>
            <div className="space-y-2">
              {results.map((r, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#005B2E]/10 text-[#005B2E]">
                        {r.section}
                      </span>
                      <span className="text-xs text-muted-foreground">{r.field}</span>
                    </div>
                    {editingIdx === idx ? (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => handleSave(idx)}
                        >
                          <Save className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => setEditingIdx(null)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditingIdx(idx)
                          setEditValue(r.value)
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {editingIdx === idx ? (
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-foreground">{r.value}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
