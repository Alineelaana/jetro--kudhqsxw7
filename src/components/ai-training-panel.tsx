import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Trash2, Pencil, Save, X, GraduationCap, Loader2 } from 'lucide-react'
import {
  getTrainingItems,
  createTrainingItem,
  updateTrainingItem,
  deleteTrainingItem,
  type AiTrainingItem,
} from '@/services/ai-settings'
import { extractFieldErrors, type FieldErrors } from '@/lib/pocketbase/errors'

const TYPE_LABELS: Record<string, string> = {
  instruction: 'Instrução',
  qa: 'Pergunta & Resposta',
  template: 'Template de Resposta',
}

export function AiTrainingPanel() {
  const [items, setItems] = useState<AiTrainingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('instruction')
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const loadItems = useCallback(async () => {
    try {
      setItems(await getTrainingItems())
    } catch {
      /* intentionally ignored */
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const resetForm = () => {
    setTitle('')
    setContent('')
    setType('instruction')
    setEditingId(null)
    setShowForm(false)
    setFieldErrors({})
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    setFieldErrors({})
    try {
      const data = { title: title.trim(), content: content.trim(), type }
      if (editingId) {
        await updateTrainingItem(editingId, data)
      } else {
        await createTrainingItem(data)
      }
      resetForm()
      await loadItems()
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
    }
    setSaving(false)
  }

  const handleEdit = (item: AiTrainingItem) => {
    setEditingId(item.id)
    setTitle(item.title)
    setContent(item.content)
    setType(item.type)
    setShowForm(true)
    setFieldErrors({})
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTrainingItem(id)
      await loadItems()
    } catch {
      /* intentionally ignored */
    }
  }

  return (
    <Card className="border-2 border-[#C89B3C]/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[#C89B3C]" />
          Treinamento da Srta. Velora
        </CardTitle>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            size="sm"
            className="bg-[#C89B3C] hover:bg-[#b8881f] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-1" /> Adicionar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 p-4 rounded-lg border-2 border-[#005B2E]/20 bg-[#005B2E]/5">
            <div>
              <Input
                placeholder="Título do treinamento"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {fieldErrors.title && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.title}</p>
              )}
            </div>
            <div>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Textarea
                placeholder="Conteúdo do treinamento (instruções, Q&A, templates de resposta)..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
              />
              {fieldErrors.content && (
                <p className="text-sm text-red-500 mt-1">{fieldErrors.content}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                <Save className="w-4 h-4 mr-1" />
                {editingId ? 'Atualizar' : 'Salvar'}
              </Button>
              <Button onClick={resetForm} variant="outline">
                <X className="w-4 h-4 mr-1" /> Cancelar
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-[#C89B3C] animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Nenhum treinamento cadastrado. Adicione instruções para a Srta. Velora.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="p-3 rounded-lg border border-border bg-white">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#C89B3C]/15 text-[#C89B3C]">
                        {TYPE_LABELS[item.type] || item.type}
                      </span>
                      <p className="font-bold text-sm text-foreground">{item.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      onClick={() => handleEdit(item)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(item.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
