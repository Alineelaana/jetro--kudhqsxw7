import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Loader2, Plus, Trash2, LayoutDashboard, Share2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getBIDashboards, createBIDashboard, deleteBIDashboard, logBIAudit } from '@/services/bi'
import { canManageCustomDashboards } from '@/lib/bi-permissions'
import type { BIDashboard } from '@/lib/bi-types'

const CENTERS = [
  { value: 'executive', label: 'Executiva' },
  { value: 'commercial', label: 'Comercial' },
  { value: 'financial', label: 'Financeira' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'logistics', label: 'Logística' },
  { value: 'stock', label: 'Estoque' },
  { value: 'fiscal', label: 'Fiscal' },
  { value: 'purchasing', label: 'Compras' },
  { value: 'crm', label: 'CRM' },
  { value: 'trade', label: 'Trade Marketing' },
  { value: 'rh', label: 'RH' },
  { value: 'quality', label: 'Qualidade' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'vr', label: 'Remuneração Variável' },
]

export function BiCustomDashboards() {
  const { user, userRole } = useAuth()
  const [dashboards, setDashboards] = useState<BIDashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [center, setCenter] = useState('executive')
  const [isShared, setIsShared] = useState(false)

  const load = async () => {
    try {
      setDashboards(await getBIDashboards())
    } catch {
      setDashboards([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useEffect(() => {
    logBIAudit('view', '', 'Visualizacao: Dashboards Personalizados BI')
  }, [])
  useRealtime('bi_dashboards', () => load())

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      await createBIDashboard({
        name: name.trim(),
        description: desc.trim(),
        center,
        owner: user?.id || '',
        owner_name: (user?.name as string) || 'Usuário',
        is_shared: isShared,
        shared_users: [],
        company: '',
        branch: '',
        layout: JSON.stringify({ columns: 3 }),
        widgets: JSON.stringify([]),
        saved_filters: JSON.stringify({}),
        favorite_indicators: JSON.stringify([]),
      })
      logBIAudit('create', '', `Criou dashboard: ${name.trim()}`)
      setName('')
      setDesc('')
      setCenter('executive')
      setIsShared(false)
      setOpen(false)
      load()
    } catch {
      /* ignore */
    }
  }

  const handleDelete = async (id: string, dashName: string) => {
    try {
      await deleteBIDashboard(id)
      logBIAudit('delete', id, `Excluiu dashboard: ${dashName}`)
      load()
    } catch {
      /* ignore */
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
      <div className="flex justify-end">
        {canManageCustomDashboards(userRole) && (
          <>
            <Button
              size="sm"
              className="bg-[#005B2E] hover:bg-[#01361D]"
              onClick={() => setOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" /> Novo Dashboard
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Dashboard Personalizado</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome do dashboard"
                    />
                  </div>
                  <div>
                    <Label>Descrição</Label>
                    <Input
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="Descrição opcional"
                    />
                  </div>
                  <div>
                    <Label>Centro de Inteligência</Label>
                    <Select value={center} onValueChange={setCenter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CENTERS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={isShared} onCheckedChange={setIsShared} />
                    <Label>Compartilhado com outros usuários</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreate} className="bg-[#005B2E] hover:bg-[#01361D]">
                    Criar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <LayoutDashboard className="w-4 h-4 text-[#005B2E]" />
            <h3 className="font-bold text-[#005B2E]">Dashboards Personalizados</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Centro</TableHead>
                <TableHead>Criado por</TableHead>
                <TableHead className="text-center">Compartilhado</TableHead>
                {canManageCustomDashboards(userRole) && (
                  <TableHead className="text-right">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboards.length > 0 ? (
                dashboards.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{d.name}</span>
                        {d.description && (
                          <p className="text-xs text-muted-foreground">{d.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {CENTERS.find((c) => c.value === d.center)?.label || d.center}
                      </Badge>
                    </TableCell>
                    <TableCell>{d.owner_name || '—'}</TableCell>
                    <TableCell className="text-center">
                      {d.is_shared ? <Share2 className="w-4 h-4 text-[#005B2E] mx-auto" /> : '—'}
                    </TableCell>
                    {canManageCustomDashboards(userRole) && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(d.id, d.name)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum dashboard personalizado criado
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
