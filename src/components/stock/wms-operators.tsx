import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Loader2, Plus, Activity } from 'lucide-react'
import { getWmsOperators, createWmsOperator, updateWmsOperator } from '@/services/wms-management'
import { OPERATOR_SITUATIONS, type WmsOperator } from '@/lib/wms-management-types'
import { useRealtime } from '@/hooks/use-realtime'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function WmsOperators() {
  const [operators, setOperators] = useState<WmsOperator[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    operador: '',
    turno: 'Manhã',
    area: '',
    coletor_id: '',
    situacao: 'Ativo',
  })

  const load = useCallback(async () => {
    try {
      setOperators(await getWmsOperators())
    } catch {
      setOperators([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])
  useRealtime('wms_operators', () => load())

  const handleCreate = async () => {
    try {
      await createWmsOperator({
        ...form,
        tarefas_pendentes: 0,
        tarefas_concluidas: 0,
        produtividade: '0%',
        divergencias: 0,
        tempo_medio_tarefa: '0min',
      })
      toast({ title: 'Operador registrado' })
      setDialogOpen(false)
      setForm({ operador: '', turno: 'Manhã', area: '', coletor_id: '', situacao: 'Ativo' })
      load()
    } catch {
      toast({ title: 'Erro ao registrar', variant: 'destructive' })
    }
  }

  const handleDistribute = async () => {
    try {
      for (const op of operators.filter((o) => o.situacao === 'Ativo')) {
        await updateWmsOperator(op.id, { tarefas_pendentes: op.tarefas_pendentes + 1 })
      }
      toast({ title: 'Tarefas distribuídas' })
      load()
    } catch {
      toast({ title: 'Erro na distribuição', variant: 'destructive' })
    }
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
        <h2 className="text-xl font-black text-foreground">Gestão de Operadores</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDistribute}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <Activity className="w-4 h-4 mr-1" /> Distribuir Tarefas
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#005B2E] hover:bg-[#01361D] text-white">
                <Plus className="w-4 h-4 mr-1" /> Novo Operador
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Operador</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Nome do Operador</Label>
                  <Input
                    value={form.operador}
                    onChange={(e) => setForm({ ...form, operador: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Turno</Label>
                  <Select value={form.turno} onValueChange={(v) => setForm({ ...form, turno: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Área</Label>
                  <Input
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Coletor ID</Label>
                  <Input
                    value={form.coletor_id}
                    onChange={(e) => setForm({ ...form, coletor_id: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Situação</Label>
                  <Select
                    value={form.situacao}
                    onValueChange={(v) => setForm({ ...form, situacao: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATOR_SITUATIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreate}
                  className="bg-[#005B2E] hover:bg-[#01361D] text-white"
                >
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {operators.map((op) => (
          <Card key={op.id} className="border-2 border-[#005B2E]/10 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{op.operador}</span>
                <Badge
                  className={cn(
                    op.situacao === 'Ativo'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700',
                  )}
                >
                  {op.situacao}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Turno:</span> {op.turno}
                </div>
                <div>
                  <span className="text-muted-foreground">Área:</span> {op.area || '—'}
                </div>
                <div>
                  <span className="text-muted-foreground">Pendentes:</span>{' '}
                  <span className="font-bold text-amber-600">{op.tarefas_pendentes}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Concluídas:</span>{' '}
                  <span className="font-bold text-green-600">{op.tarefas_concluidas}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Produtividade:</span> {op.produtividade}
                </div>
                <div>
                  <span className="text-muted-foreground">Divergências:</span>{' '}
                  <span className="font-bold text-red-600">{op.divergencias}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tempo médio:</span>{' '}
                  {op.tempo_medio_tarefa}
                </div>
                <div>
                  <span className="text-muted-foreground">Coletor:</span> {op.coletor_id || '—'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {operators.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum operador cadastrado.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
