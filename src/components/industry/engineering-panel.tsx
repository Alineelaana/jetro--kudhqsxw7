import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { GitBranch, Plus, Loader2, FileText, Check, X } from 'lucide-react'
import {
  getECRs,
  getECOs,
  getEngineeringDocuments,
  createEngineeringChange,
  approveEngineeringChange,
} from '@/services/engineering'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'

const STATUS_COLORS: Record<string, string> = {
  rascunho: 'bg-gray-100 text-gray-600',
  em_analise: 'bg-amber-100 text-amber-700',
  em_aprovacao: 'bg-amber-100 text-amber-700',
  aprovado: 'bg-emerald-100 text-emerald-700',
  rejeitado: 'bg-red-100 text-red-700',
  implementado: 'bg-blue-100 text-blue-700',
  cancelado: 'bg-gray-100 text-gray-600',
}

export function EngineeringPanel() {
  const { user } = useAuth()
  const [ecrs, setEcrs] = useState<any[]>([])
  const [ecos, setEcos] = useState<any[]>([])
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tab, setTab] = useState<'ecr' | 'eco' | 'docs'>('ecr')

  const load = async () => {
    try {
      const [e, o, d] = await Promise.all([getECRs(), getECOs(), getEngineeringDocuments()])
      setEcrs(e)
      setEcos(o)
      setDocs(d)
    } catch {
      /* ignore */
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])
  useRealtime('engineering_change_requests', () => load())
  useRealtime('engineering_change_orders', () => load())

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await createEngineeringChange({
        change_type: 'ecr',
        title: String(fd.get('title') || ''),
        description: String(fd.get('description') || ''),
        type: String(fd.get('type') || 'melhoria'),
        priority: String(fd.get('priority') || 'media'),
        reason: String(fd.get('reason') || ''),
        impact_assessment: String(fd.get('impact_assessment') || ''),
      })
      toast({ title: 'ECR criado' })
      setDialogOpen(false)
      load()
    } catch {
      toast({ title: 'Erro ao criar ECR', variant: 'destructive' })
    }
  }

  const handleApprove = async (
    id: string,
    changeType: 'ecr' | 'eco',
    action: 'approve' | 'reject',
  ) => {
    try {
      await approveEngineeringChange({ id, change_type: changeType, action })
      toast({ title: action === 'approve' ? 'Aprovado' : 'Rejeitado' })
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

  const items = tab === 'ecr' ? ecrs : tab === 'eco' ? ecos : docs

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="w-6 h-6 text-[#005B2E]" />
          <h2 className="text-xl font-black text-foreground">Engenharia do Produto</h2>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo ECR
        </Button>
      </div>
      <div className="flex gap-2">
        {(['ecr', 'eco', 'docs'] as const).map((t) => (
          <Button
            key={t}
            variant={tab === t ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTab(t)}
            className={tab === t ? 'bg-[#005B2E] text-white' : ''}
          >
            {t === 'ecr' ? 'ECRs' : t === 'eco' ? 'ECOs' : 'Documentos'}
            <span className="ml-1 text-xs opacity-70">
              ({t === 'ecr' ? ecrs.length : t === 'eco' ? ecos.length : docs.length})
            </span>
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tab !== 'docs' &&
          items.map((item: any) => (
            <Card key={item.id} className="border-2 border-[#005B2E]/20">
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm">
                      {item.ecr_number || item.eco_number} - {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Badge className={STATUS_COLORS[item.status] || 'bg-gray-100'}>
                    {item.status}
                  </Badge>
                </div>
                {item.reason && (
                  <p className="text-xs text-muted-foreground mb-1">Motivo: {item.reason}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {tab === 'ecr' && (
                    <>
                      <Badge variant="outline">{item.type}</Badge>
                      <Badge variant="outline">{item.priority}</Badge>
                    </>
                  )}
                  {(item.status === 'rascunho' ||
                    item.status === 'em_analise' ||
                    item.status === 'em_aprovacao') && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => handleApprove(item.id, tab, 'approve')}
                      >
                        <Check className="w-3 h-3 mr-1" /> Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-red-600"
                        onClick={() => handleApprove(item.id, tab, 'reject')}
                      >
                        <X className="w-3 h-3 mr-1" /> Rejeitar
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        {tab === 'docs' &&
          items.map((doc: any) => (
            <Card key={doc.id} className="border-2 border-[#005B2E]/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-[#005B2E]" />
                  <div>
                    <p className="font-bold text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.doc_type} - v{doc.version}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo ECR</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <Label className="text-sm font-semibold">Titulo *</Label>
              <Input name="title" required className="focus-visible:ring-[#005B2E]" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Descricao</Label>
              <Textarea name="description" rows={2} className="focus-visible:ring-[#005B2E]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold">Tipo</Label>
                <Select name="type" defaultValue="melhoria">
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'melhoria',
                      'correcao',
                      'novo_produto',
                      'obsolescencia',
                      'seguranca',
                      'custo',
                    ].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">Prioridade</Label>
                <Select name="priority" defaultValue="media">
                  <SelectTrigger className="focus-visible:ring-[#005B2E]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['baixa', 'media', 'alta', 'critica'].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold">Motivo</Label>
              <Textarea name="reason" rows={2} className="focus-visible:ring-[#005B2E]" />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
