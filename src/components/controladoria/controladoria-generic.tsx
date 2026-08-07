import { useState, useEffect } from 'react'
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
} from '@/components/ui/dialog'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { ctrlGetList, ctrlCreate, ctrlDelete } from '@/services/controladoria'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import {
  canManageReclassifications,
  canManageMateriality,
  canManageConsolidation,
} from '@/lib/controladoria-permissions'
import {
  CTRL_SCREEN_CONFIGS,
  STATUS_COLORS,
  type CtrlScreenConfig,
} from '@/lib/controladoria-types'
import { cn } from '@/lib/utils'

export function ControladoriaGenericScreen({ configKey }: { configKey: string }) {
  const { user, userRole } = useAuth()
  const config: CtrlScreenConfig | undefined = CTRL_SCREEN_CONFIGS[configKey]
  const [records, setRecords] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  if (!config)
    return <p className="text-center py-6 text-muted-foreground">Configuração não encontrada.</p>

  const canManage =
    configKey === 'reclassifications'
      ? canManageReclassifications(userRole)
      : configKey === 'materiality'
        ? canManageMateriality(userRole)
        : canManageConsolidation(userRole)

  const load = async () => {
    try {
      setRecords((await ctrlGetList(config.collection)) as Record<string, unknown>[])
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime(config.collection, () => load())

  const handleCreate = async () => {
    const data: Record<string, unknown> = {}
    for (const f of config.fields) {
      if (f.type === 'switch') data[f.name] = form[f.name] === 'true'
      else data[f.name] = form[f.name] || ''
    }
    data['user_name'] = (user?.name as string) || 'Usuário'
    await ctrlCreate(config.collection, data)
    setOpen(false)
    setForm({})
    load()
  }

  const handleDelete = async (id: string) => {
    await ctrlDelete(config.collection, id)
    load()
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManage && (
          <Button
            size="sm"
            className="bg-[#005B2E] hover:bg-[#01361D]"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        )}
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                {config.fields.slice(0, 5).map((f) => (
                  <TableHead key={f.name}>{f.label}</TableHead>
                ))}
                {canManage && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id as string}>
                  {config.fields.slice(0, 5).map((f) => (
                    <TableCell key={f.name} className="text-sm">
                      {f.name === config.statusField && config.statusField ? (
                        <Badge
                          className={cn(
                            'text-xs',
                            STATUS_COLORS[r[f.name] as string] || 'bg-gray-100',
                          )}
                        >
                          {r[f.name] as string}
                        </Badge>
                      ) : (
                        String(r[f.name] || '—')
                      )}
                    </TableCell>
                  ))}
                  {canManage && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(r.id as string)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum registro
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{config.title}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {config.fields.map((f) => (
              <div key={f.name} className={cn('space-y-1', f.span === 2 && 'col-span-2')}>
                <Label className="text-xs">{f.label}</Label>
                {f.type === 'select' ? (
                  <select
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">—</option>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[60px]"
                  />
                ) : f.type === 'switch' ? (
                  <select
                    value={form[f.name] || 'false'}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="false">Não</option>
                    <option value="true">Sim</option>
                  </select>
                ) : (
                  <Input
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="focus-visible:ring-[#005B2E]"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} className="bg-[#005B2E] hover:bg-[#01361D]">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
