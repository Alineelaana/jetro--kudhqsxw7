import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, GitBranch, Plus, Calendar, User, Package } from 'lucide-react'
import { getADRs, createADR } from '@/services/blueprint'
import type { BlueprintADR } from '@/lib/blueprint-types'
import { parseJsonArray } from '@/lib/blueprint-types'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from 'sonner'
import { canEditBlueprint } from '@/lib/blueprint-permissions'
import { useAuth } from '@/hooks/use-auth'

const STATUS_COLOR: Record<string, string> = {
  proposta: 'bg-blue-100 text-blue-700',
  aceita: 'bg-emerald-100 text-emerald-700',
  rejeitada: 'bg-red-100 text-red-700',
  substituída: 'bg-purple-100 text-purple-700',
  obsoleta: 'bg-gray-100 text-gray-700',
  superseded: 'bg-orange-100 text-orange-700',
}

export function BlueprintDecisionCenter() {
  const { user } = useAuth()
  const [adrs, setAdrs] = useState<BlueprintADR[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    code: '',
    title: '',
    decision: '',
    motive: '',
    approver: '',
    effective_date: '',
  })
  const canEdit = canEditBlueprint(user?.role as string)

  const load = async () => {
    try {
      setAdrs(await getADRs())
    } catch {
      /* noop */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('blueprint_adrs', () => load())

  const handleCreate = async () => {
    try {
      await createADR({
        ...form,
        status: 'proposta',
        alternatives: [],
        impacted_modules: [],
        author: (user?.name as string) || 'Sistema',
        version: '1.0',
        relation_ids: [],
      } as Partial<BlueprintADR>)
      toast.success('ADR criado')
      setDialogOpen(false)
      setForm({ code: '', title: '', decision: '', motive: '', approver: '', effective_date: '' })
      load()
    } catch {
      toast.error('Erro ao criar ADR')
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  const sorted = [...adrs].sort((a, b) => {
    const da = new Date(a.effective_date || a.created).getTime()
    const db = new Date(b.effective_date || b.created).getTime()
    return db - da
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Centro de Decisão — ADRs</h3>
        {canEdit && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#005B2E] hover:bg-[#01361D] text-white">
                <Plus className="w-4 h-4 mr-1" /> Novo ADR
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Novo Architecture Decision Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Código</Label>
                    <Input
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Data Efetiva</Label>
                    <Input
                      type="date"
                      value={form.effective_date}
                      onChange={(e) => setForm({ ...form, effective_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Título *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Decisão</Label>
                  <Textarea
                    value={form.decision}
                    onChange={(e) => setForm({ ...form, decision: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Motivo</Label>
                  <Textarea
                    value={form.motive}
                    onChange={(e) => setForm({ ...form, motive: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Aprovador</Label>
                  <Input
                    value={form.approver}
                    onChange={(e) => setForm({ ...form, approver: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white"
                >
                  Criar ADR
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="relative pl-6">
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-[#005B2E]/20" />
        {sorted.map((adr) => {
          const modules = parseJsonArray(adr.impacted_modules)
          const alternatives = parseJsonArray(adr.alternatives)
          return (
            <div key={adr.id} className="relative mb-6">
              <div className="absolute -left-4 w-3 h-3 rounded-full bg-[#005B2E] border-2 border-white" />
              <Card className="border-2 border-[#005B2E]/15">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-[#005B2E]" />
                      <span className="font-bold">{adr.code}</span>
                      <Badge className={STATUS_COLOR[adr.status] || ''}>{adr.status}</Badge>
                    </div>
                    {adr.superseded_by && (
                      <Badge className="bg-orange-100 text-orange-700">Substituído</Badge>
                    )}
                  </div>
                  <h4 className="font-semibold">{adr.title}</h4>
                  <p className="text-sm text-muted-foreground">{adr.decision}</p>
                  {adr.motive && (
                    <p className="text-xs">
                      <span className="font-semibold">Motivo:</span> {adr.motive}
                    </p>
                  )}
                  {alternatives.length > 0 && (
                    <div className="text-xs">
                      <span className="font-semibold">Alternativas:</span> {alternatives.join(', ')}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1">
                    {adr.approver && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {adr.approver}
                      </span>
                    )}
                    {adr.effective_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{' '}
                        {new Date(adr.effective_date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                    {modules.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" /> {modules.join(', ')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
        {sorted.length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum ADR registrado
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
