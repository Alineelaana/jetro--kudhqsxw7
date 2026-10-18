import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  listCadastros,
  updateCadastro,
  deleteCadastro,
  exportCadastrosXls,
  importCsv,
} from '@/services/cadastros'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { CadastroFormDialog } from '@/components/cadastros/cadastro-form-dialog'
import { type CadastroConfig, type CadastroRecord } from '@/lib/cadastros-types'
import { JetroTable, type JetroColumnDef } from '@/components/jetro-table'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  Loader2,
  Eye,
  Copy,
  Upload,
  FileSpreadsheet,
  Package,
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Props {
  config: CadastroConfig
}

interface ConfirmState {
  type: 'delete' | 'activate' | 'inactivate'
  record: CadastroRecord
}

export function CadastroStandardScreen({ config }: Props) {
  const { user } = useAuth()
  const userName = (user?.name as string) || (user?.email as string) || 'Sistema'
  const [records, setRecords] = useState<CadastroRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CadastroRecord | null>(null)
  const [readOnly, setReadOnly] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    try {
      setRecords(await listCadastros(config.collection))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [config.collection])
  useRealtime(config.collection, () => load())

  const filtered = records.filter((r) => {
    const term = search.toLowerCase().trim()
    const matchSearch =
      !term ||
      (r.code || '').toLowerCase().includes(term) ||
      (r.name || '').toLowerCase().includes(term)
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && r.active !== false) ||
      (statusFilter === 'inactive' && r.active === false)
    return matchSearch && matchStatus
  })

  const handleNew = () => {
    setEditing(null)
    setReadOnly(false)
    setFormOpen(true)
  }
  const handleEdit = (r: CadastroRecord) => {
    setEditing(r)
    setReadOnly(false)
    setFormOpen(true)
  }
  const handleView = (r: CadastroRecord) => {
    setEditing(r)
    setReadOnly(true)
    setFormOpen(true)
  }
  const handleDuplicate = (r: CadastroRecord) => {
    setEditing({ ...r, id: '', code: '' })
    setReadOnly(false)
    setFormOpen(true)
  }

  const handleConfirm = async () => {
    if (!confirm) return
    setActionLoading(true)
    try {
      if (confirm.type === 'delete') {
        await deleteCadastro(config.collection, confirm.record.id)
        toast({ title: 'Registro excluído' })
      } else {
        await updateCadastro(config.collection, confirm.record.id, {
          active: confirm.type === 'activate',
        })
        toast({ title: confirm.type === 'activate' ? 'Ativado' : 'Inativado' })
      }
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setActionLoading(false)
    setConfirm(null)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const count = await importCsv(config.collection, await file.text(), userName)
      toast({ title: `${count} registro(s) importado(s)` })
      load()
    } catch {
      toast({ title: 'Erro ao importar', variant: 'destructive' })
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const fmtDate = (d: string) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—')

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-black text-foreground">{config.label}</h2>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImport}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <Upload className="w-4 h-4 mr-1.5" /> Importar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCadastrosXls(config.collection, filtered)}
            disabled={filtered.length === 0}
            className="border-[#005B2E] text-[#005B2E]"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" /> Exportar
          </Button>
          <Button
            onClick={handleNew}
            className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Cadastro
          </Button>
        </div>
      </div>
      <Card className="border-2 border-[#005B2E]/20">
        <CardContent className="py-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código ou nome..."
                className="pl-10 focus-visible:ring-[#005B2E]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 focus-visible:ring-[#005B2E]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">{filtered.length} registro(s)</p>
        </CardContent>
      </Card>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : (
        <JetroTable
          screenId={`cadastros.padrao.${config.collection}`}
          columns={[
            {
              id: 'code',
              header: 'Código',
              accessorKey: 'code',
              dataType: 'text',
              defaultWidth: 120,
              cell: ({ value }) => (
                <span className="text-xs font-mono font-bold text-[#C89B3C]">
                  {String(value || '—')}
                </span>
              ),
            },
            {
              id: 'name',
              header: 'Nome',
              accessorKey: 'name',
              dataType: 'text',
              defaultWidth: 260,
              cell: ({ value }) => <span className="font-medium">{String(value || '—')}</span>,
            },
            {
              id: 'created',
              header: 'Data de Cadastro',
              accessorKey: 'created',
              dataType: 'date',
              defaultWidth: 140,
              cell: ({ value }) => (
                <span className="text-muted-foreground text-xs">
                  {fmtDate(String(value || ''))}
                </span>
              ),
            },
            {
              id: 'active',
              header: 'Situação',
              accessorKey: 'active',
              dataType: 'boolean',
              defaultWidth: 110,
              getSortValue: (row) => (row.active !== false ? 'Ativo' : 'Inativo'),
              cell: ({ row }) => (
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${row.active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}
                >
                  {row.active !== false ? 'Ativo' : 'Inativo'}
                </span>
              ),
            },
            {
              id: 'responsible_user',
              header: 'Responsável',
              accessorKey: 'responsible_user',
              dataType: 'text',
              defaultWidth: 160,
              cell: ({ value }) => <span className="text-xs">{String(value || '—')}</span>,
            },
            {
              id: 'actions',
              header: 'Ações',
              align: 'center',
              sortable: false,
              hideable: false,
              resizable: false,
              draggable: false,
              defaultWidth: 180,
              cell: ({ row: r }) => (
                <div className="flex items-center justify-center gap-0.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleView(r)}
                    className="text-[#005B2E] hover:bg-[#005B2E]/10 h-7 w-7 p-0"
                    title="Visualizar"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(r)}
                    className="text-[#005B2E] hover:bg-[#005B2E]/10 h-7 w-7 p-0"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDuplicate(r)}
                    className="text-blue-600 hover:bg-blue-50 h-7 w-7 p-0"
                    title="Duplicar"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  {r.active !== false ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirm({ type: 'inactivate', record: r })}
                      className="text-orange-600 hover:bg-orange-50 h-7 w-7 p-0"
                      title="Inativar"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirm({ type: 'activate', record: r })}
                      className="text-emerald-600 hover:bg-emerald-50 h-7 w-7 p-0"
                      title="Ativar"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirm({ type: 'delete', record: r })}
                    className="text-red-600 hover:bg-red-50 h-7 w-7 p-0"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={filtered}
          emptyMessage="Nenhum registro encontrado. Clique em 'Novo Cadastro' para começar."
          exportTitle={`${config.label} — Cadastros Jetro`}
          exportFilename={`cadastro-${config.collection}.xlsx`}
        />
      )}
      <CadastroFormDialog
        config={config}
        open={formOpen}
        onOpenChange={setFormOpen}
        record={editing}
        readOnly={readOnly}
        onSuccess={load}
      />
      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.type === 'delete'
                ? 'Excluir'
                : confirm?.type === 'activate'
                  ? 'Ativar'
                  : 'Inativar'}{' '}
              Registro
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.type === 'delete'
                ? `Excluir "${confirm.record?.name || '—'}"? Esta ação não pode ser desfeita.`
                : `${confirm?.type === 'activate' ? 'Ativar' : 'Inativar'} "${confirm?.record?.name || '—'}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={actionLoading}
              className="bg-[#005B2E] hover:bg-[#01361D]"
            >
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
