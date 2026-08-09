import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Save, Eye, FileText } from 'lucide-react'
import { getChapters, updateChapter } from '@/services/blueprint'
import type { BlueprintChapter } from '@/lib/blueprint-types'
import { useAuth } from '@/hooks/use-auth'
import { canEditBlueprint } from '@/lib/blueprint-permissions'
import { toast } from 'sonner'

function renderMarkdown(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.+<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
  return '<p>' + html + '</p>'
}

export function BlueprintEditor() {
  const { user } = useAuth()
  const [chapters, setChapters] = useState<BlueprintChapter[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const canEdit = canEditBlueprint(user?.role as string)

  useEffect(() => {
    getChapters()
      .then((chs) => {
        setChapters(chs.filter((c) => c.editorial_status !== 'Publicado' || canEdit))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [canEdit])

  const selected = chapters.find((c) => c.id === selectedId)

  const handleSelect = (id: string) => {
    setSelectedId(id)
    const ch = chapters.find((c) => c.id === id)
    setContent(ch?.content || '')
  }

  const handleSave = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      await updateChapter(selectedId, { content })
      toast.success('Conteúdo salvo')
    } catch {
      toast.error('Erro ao salvar')
    }
    setSaving(false)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-bold">Editor Corporativo</h3>
        <div className="flex items-center gap-2">
          <Select value={selectedId} onValueChange={handleSelect}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Selecionar capítulo..." />
            </SelectTrigger>
            <SelectContent>
              {chapters.map((ch) => (
                <SelectItem key={ch.id} value={ch.id}>
                  {ch.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-1" /> {showPreview ? 'Ocultar Preview' : 'Preview'}
          </Button>
          {canEdit && selected && (
            <Button
              size="sm"
              className="bg-[#005B2E] hover:bg-[#01361D] text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}{' '}
              Salvar
            </Button>
          )}
        </div>
      </div>
      {selected && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>
            {selected.code} · v{selected.version_number}
          </span>
          <Badge className="text-xs bg-[#005B2E]/10 text-[#005B2E]">
            {selected.editorial_status}
          </Badge>
          <Badge className="text-xs bg-blue-100 text-blue-700">{selected.technical_validity}</Badge>
        </div>
      )}
      {selectedId ? (
        <div className={`grid gap-4 ${showPreview ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-0">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[500px] border-0 rounded-none font-mono text-sm resize-none focus-visible:ring-0"
                placeholder="Escreva em Markdown..."
                disabled={!canEdit}
              />
            </CardContent>
          </Card>
          {showPreview && (
            <Card className="border-2 border-[#C89B3C]/20">
              <CardContent className="p-4 min-h-[500px] overflow-y-auto">
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(content || '*Nada para visualizar*'),
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Selecione um capítulo para editar</p>
            <p className="text-xs mt-1">
              Suporta: Markdown, tabelas, código, links internos, alertas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
