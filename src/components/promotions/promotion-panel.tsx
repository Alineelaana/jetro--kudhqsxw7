import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Tag, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { usePromotions } from '@/hooks/use-promotions'
import { PROMO_TYPE_LABELS, CUMULATIVITY_LABELS, PROMO_STATUS_LABELS } from '@/lib/promotion-types'

const EMPTY_FORM = {
  name: '',
  description: '',
  promo_type: 'percentage',
  cumulativity: 'non_cumulative',
  priority: '0',
  status: 'rascunho',
  start_date: '',
  end_date: '',
  benefits: '[{"type":"percentage","value":"10"}]',
  conditions: '[]',
}

export function PromotionPanel() {
  const { user } = useAuth()
  const { promotions, loading, create, delete: remove } = usePromotions()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const handleCreate = async () => {
    if (!form.name.trim()) return
    await create({
      ...form,
      priority: parseInt(form.priority) || 0,
      version: 1,
      is_active: form.status === 'ativo',
      benefits: form.benefits,
      conditions: form.conditions,
      limits: '{}',
      applicable_channels: '[]',
      campaign_id: '',
      company: '',
      branch: '',
      created_by: user?.id || '',
      created_by_name: (user?.name as string) || 'Usuário',
    })
    setOpen(false)
    setForm(EMPTY_FORM)
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-[#005B2E]" />
          <h3 className="text-lg font-bold">Motor Central de Promoções</h3>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#005B2E] hover:bg-[#01361D]">
              <Plus className="w-4 h-4 mr-1" /> Nova Promoção
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Promoção</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto">
              <div>
                <Label>Nome</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={form.promo_type}
                    onValueChange={(v) => setForm({ ...form, promo_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROMO_TYPE_LABELS).map(([v, l]) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cumulatividade</Label>
                  <Select
                    value={form.cumulativity}
                    onValueChange={(v) => setForm({ ...form, cumulativity: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CUMULATIVITY_LABELS).map(([v, l]) => (
                        <SelectItem key={v} value={v}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Prioridade</Label>
                  <Input
                    type="number"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Início</Label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Fim</Label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROMO_STATUS_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Benefícios (JSON)</Label>
                <Textarea
                  rows={3}
                  value={form.benefits}
                  onChange={(e) => setForm({ ...form, benefits: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
              <div>
                <Label>Condições (JSON)</Label>
                <Textarea
                  rows={3}
                  value={form.conditions}
                  onChange={(e) => setForm({ ...form, conditions: e.target.value })}
                  className="text-xs font-mono"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} className="bg-[#005B2E] hover:bg-[#01361D]">
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cumul.</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.length > 0 ? (
                promotions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <span className="font-medium">{p.name}</span>
                      {p.description && (
                        <p className="text-xs text-muted-foreground">{p.description}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {PROMO_TYPE_LABELS[p.promo_type] || p.promo_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CUMULATIVITY_LABELS[p.cumulativity] || p.cumulativity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={p.status === 'ativo' ? 'default' : 'secondary'}
                        className={p.status === 'ativo' ? 'bg-[#005B2E]' : ''}
                      >
                        {PROMO_STATUS_LABELS[p.status] || p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => remove(p.id, p.name)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma promoção cadastrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
