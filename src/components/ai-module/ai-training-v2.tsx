import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getTrainingV2, createTrainingV2, updateTrainingV2 } from '@/services/ai-module'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { canTrainAi, canApproveTraining } from '@/lib/ai-permissions'
import { TRAINING_STATUS, type AiTrainingV2 } from '@/lib/ai-types'
import { Plus, GraduationCap, Loader2, Pencil, Check, X } from 'lucide-react'
import { toast } from 'sonner'

const STATUS_COLORS: Record<string, string> = {
  Aprovado: 'bg-green-100 text-green-700',
  'Aguardando Aprovação': 'bg-yellow-100 text-yellow-700',
  'Em Preparação': 'bg-blue-100 text-blue-700',
  Aplicado: 'bg-emerald-100 text-emerald-700',
  Rejeitado: 'bg-red-100 text-red-700',
  Inativo: 'bg-gray-100 text-gray-600',
}

export function AiTrainingV2Panel() {
  const { user } = useAuth()
  const [items, setItems] = useState<AiTrainingV2[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<AiTrainingV2 | null>(null)
  const [form, setForm] = useState({
    question: '',
    expected_answer: '',
    correct_example: '',
    incorrect_example: '',
    communication_tone: '',
    applicable_rule: '',
    departamento: '',
    source: 'Manual',
    status: 'Em Preparação',
  })

  const load = async () => {
    try {
      setItems(await getTrainingV2())
    } catch {
      setItems([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('ai_training_v2', () => load())

  const openCreate = () => {
    setEditing(null)
    setForm({
      question: '',
      expected_answer: '',
      correct_example: '',
      incorrect_example: '',
      communication_tone: '',
      applicable_rule: '',
      departamento: '',
      source: 'Manual',
      status: 'Em Preparação',
    })
    setOpen(true)
  }
  const openEdit = (t: AiTrainingV2) => {
    setEditing(t)
    setForm({
      question: t.question,
      expected_answer: t.expected_answer || '',
      correct_example: t.correct_example || '',
      incorrect_example: t.incorrect_example || '',
      communication_tone: t.communication_tone || '',
      applicable_rule: t.applicable_rule || '',
      departamento: t.departamento || '',
      source: t.source || 'Manual',
      status: t.status,
    })
    setOpen(true)
  }
  const handleSave = async () => {
    if (!form.question.trim()) {
      toast.error('Pergunta obrigatória')
      return
    }
    try {
      if (editing) await updateTrainingV2(editing.id, form)
      else
        await createTrainingV2({
          ...form,
          allowed_terms: [],
          forbidden_terms: [],
          agent_id: '',
          approver: '',
          rejection_reason: '',
        })
      toast.success('Treinamento salvo')
      setOpen(false)
      load()
    } catch {
      toast.error('Erro')
    }
  }
  const approve = async (t: AiTrainingV2) => {
    try {
      await updateTrainingV2(t.id, { status: 'Aprovado', approver: user?.name || '' })
      load()
      toast.success('Treinamento aprovado')
    } catch {
      toast.error('Erro')
    }
  }
  const reject = async (t: AiTrainingV2) => {
    try {
      await updateTrainingV2(t.id, {
        status: 'Rejeitado',
        approver: user?.name || '',
        rejection_reason: 'Reprovado pelo gestor',
      })
      load()
      toast.success('Treinamento rejeitado')
    } catch {
      toast.error('Erro')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      {canTrainAi(user?.role as string) && (
        <Button onClick={openCreate} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
          <Plus className="w-4 h-4 mr-2" /> Novo Treinamento
        </Button>
      )}
      {items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-bold">Nenhum treinamento cadastrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <Card key={t.id} className="border-2 border-[#005B2E]/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${STATUS_COLORS[t.status] || ''}`}
                      >
                        {t.status}
                      </span>
                      <p className="font-bold text-sm">{t.question}</p>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {t.expected_answer || '—'}
                    </p>
                    {t.departamento && (
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="font-bold">Depto:</span> {t.departamento}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {canTrainAi(user?.role as string) && (
                      <Button size="sm" variant="ghost" onClick={() => openEdit(t)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {canApproveTraining(user?.role as string) &&
                      t.status === 'Aguardando Aprovação' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => approve(t)}
                            className="text-green-600"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => reject(t)}
                            className="text-red-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Treinamento' : 'Novo Treinamento'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Pergunta *</Label>
              <Input
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
            </div>
            <div>
              <Label>Resposta Esperada</Label>
              <Textarea
                value={form.expected_answer}
                onChange={(e) => setForm({ ...form, expected_answer: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>Exemplo Correto</Label>
              <Textarea
                value={form.correct_example}
                onChange={(e) => setForm({ ...form, correct_example: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label>Exemplo Incorreto</Label>
              <Textarea
                value={form.incorrect_example}
                onChange={(e) => setForm({ ...form, incorrect_example: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label>Tom de Comunicação</Label>
              <Input
                value={form.communication_tone}
                onChange={(e) => setForm({ ...form, communication_tone: e.target.value })}
              />
            </div>
            <div>
              <Label>Regra Aplicável</Label>
              <Input
                value={form.applicable_rule}
                onChange={(e) => setForm({ ...form, applicable_rule: e.target.value })}
              />
            </div>
            <div>
              <Label>Departamento</Label>
              <Input
                value={form.departamento}
                onChange={(e) => setForm({ ...form, departamento: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRAINING_STATUS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
