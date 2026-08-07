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
import { Loader2, Plus, Trash2, Bookmark } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getBIReports, createBIReport, deleteBIReport, logBIAudit } from '@/services/bi'
import { useBIFilters } from './bi-filters'
import { canCreateBIReport, canDeleteBIReport } from '@/lib/bi-permissions'
import type { BIReport } from '@/lib/bi-types'

const REPORT_TYPES = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'sales', label: 'Vendas' },
  { value: 'stock', label: 'Estoque' },
  { value: 'financial', label: 'Financeiro' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'cross_module', label: 'Visão Cruzada' },
]

export function BiSavedViews() {
  const { user, userRole } = useAuth()
  const { filters } = useBIFilters()
  const [reports, setReports] = useState<BIReport[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [reportType, setReportType] = useState('dashboard')
  const [isShared, setIsShared] = useState(true)

  const load = async () => {
    try {
      setReports(await getBIReports())
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useEffect(() => {
    logBIAudit('view', '', 'Visualizacao: Relatorios Salvos BI')
  }, [])
  useRealtime('bi_reports', () => load())

  const handleCreate = async () => {
    if (!name.trim()) return
    try {
      await createBIReport({
        name: name.trim(),
        description: desc.trim(),
        report_type: reportType,
        configuration: JSON.stringify({ source: 'bi_module' }),
        filters: JSON.stringify(filters),
        company: filters.empresa || '',
        branch: filters.filial || '',
        created_by: user?.id || '',
        created_by_name: (user?.name as string) || 'Usuário',
        is_shared: isShared,
      })
      logBIAudit('create', '', `Criou relatório BI: ${name.trim()}`)
      setName('')
      setDesc('')
      setReportType('dashboard')
      setIsShared(true)
      setOpen(false)
      load()
    } catch {
      /* ignore */
    }
  }

  const handleDelete = async (id: string, reportName: string) => {
    try {
      await deleteBIReport(id)
      logBIAudit('delete', id, `Excluiu relatório BI: ${reportName}`)
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
        {canCreateBIReport(userRole) && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-[#005B2E] hover:bg-[#01361D]">
                <Plus className="w-4 h-4 mr-1" /> Novo Relatório
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Salvar Relatório BI</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div>
                  <Label>Nome</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome do relatório"
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
                  <Label>Tipo</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
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
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark className="w-4 h-4 text-[#005B2E]" />
            <h3 className="font-bold text-[#005B2E]">Relatórios Salvos</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Criado por</TableHead>
                <TableHead className="text-center">Compartilhado</TableHead>
                {canDeleteBIReport(userRole) && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length > 0 ? (
                reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{r.name}</span>
                        {r.description && (
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {REPORT_TYPES.find((t) => t.value === r.report_type)?.label ||
                          r.report_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{r.created_by_name || '—'}</TableCell>
                    <TableCell className="text-center">{r.is_shared ? 'Sim' : 'Não'}</TableCell>
                    {canDeleteBIReport(userRole) && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(r.id, r.name)}
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
                    Nenhum relatório salvo
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
