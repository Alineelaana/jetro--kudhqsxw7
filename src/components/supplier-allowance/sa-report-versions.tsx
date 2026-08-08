import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  VR_COLLECTIONS,
  vrGetList,
  vrCreate,
  vrDelete,
  REPORT_VERSION_STATUS,
} from '@/services/verbas-roadmap'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { Plus, Search, Loader2, Trash2, RotateCcw, FileCheck } from 'lucide-react'
import { toast } from 'sonner'

export function SaReportVersions() {
  const { user } = useAuth()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  const load = async () => {
    try {
      setRecords(await vrGetList(VR_COLLECTIONS.reportVersions))
    } catch {
      setRecords([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime(VR_COLLECTIONS.reportVersions, () => load())

  const filtered = records.filter((r) => {
    const q = search.toLowerCase().trim()
    return (
      !q ||
      (r.report_type || '').toLowerCase().includes(q) ||
      (r.label || '').toLowerCase().includes(q)
    )
  })

  const nextVersion = (reportType: string) => {
    const typeRecords = records.filter((r) => r.report_type === reportType)
    return typeRecords.length > 0
      ? Math.max(...typeRecords.map((r) => r.version_number || 0)) + 1
      : 1
  }

  const handleSave = async () => {
    if (!form.report_type) {
      toast.error('Informe o tipo de relatório')
      return
    }
    try {
      await vrCreate(VR_COLLECTIONS.reportVersions, {
        ...form,
        version_number: nextVersion(form.report_type),
        published_at: new Date().toISOString(),
        status: 'publicado',
      })
      toast.success('Versão de relatório criada')
      setDialogOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar')
    }
  }

  const handleRestore = async (r: any) => {
    try {
      await vrCreate(VR_COLLECTIONS.reportVersions, {
        report_type: r.report_type,
        version_data: r.version_data,
        label: `Restauração de: ${r.label}`,
        published_at: new Date().toISOString(),
        status: 'publicado',
        description: `Versão restaurada a partir da versão #${r.version_number}`,
      })
      toast.success(`Versão #${r.version_number} restaurada`)
      load()
    } catch {
      toast.error('Erro ao restaurar')
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
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-lg font-bold">Versionamento de Relatórios</h3>
        <Button
          onClick={() => {
            setForm({})
            setDialogOpen(true)
          }}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Versão
        </Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar versões..."
          className="pl-10 focus-visible:ring-[#005B2E]"
        />
      </div>
      <Card className="border-2 border-[#005B2E]/20 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#01361D] text-white">
                <th className="text-left px-3 py-3 font-bold">Tipo</th>
                <th className="text-left px-3 py-3 font-bold">Versão</th>
                <th className="text-left px-3 py-3 font-bold">Label</th>
                <th className="text-left px-3 py-3 font-bold hidden sm:table-cell">Publicado em</th>
                <th className="text-left px-3 py-3 font-bold">Status</th>
                <th className="text-center px-3 py-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Nenhuma versão encontrada
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-3 py-3 font-medium">{r.report_type || '—'}</td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-bold text-[#C89B3C]">
                        v{r.version_number}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs">{r.label || '—'}</td>
                    <td className="px-3 py-3 hidden sm:table-cell text-xs">
                      {r.published_at ? new Date(r.published_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${r.status === 'publicado' ? 'bg-emerald-100 text-emerald-700' : r.status === 'arquivado' ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700'}`}
                      >
                        {r.status || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRestore(r)}
                          className="text-[#005B2E]"
                          title="Restaurar"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            await vrDelete(VR_COLLECTIONS.reportVersions, r.id)
                            load()
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Nova Versão de Relatório</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tipo de Relatório *</Label>
              <Input
                value={form.report_type || ''}
                onChange={(e) => setForm({ ...form, report_type: e.target.value })}
                placeholder="ex: conta_corrente, prestacao_contas"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Label</Label>
              <Input
                value={form.label || ''}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Descrição da versão"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
