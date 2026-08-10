import { useState, useEffect } from 'react'
import {
  getVitrineItems,
  duplicateVitrineItem,
  updateVitrineItem,
  deleteVitrineItem,
} from '@/services/vitrine'
import {
  VITRINE_TYPES,
  VITRINE_STATUSES,
  VITRINE_DISPLAY_PAGES,
  type VitrineItem,
} from '@/lib/vitrine-types'
import { SERVICES } from '@/lib/constants'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Plus, Eye, Pencil, Copy, Trash2, Power } from 'lucide-react'
import { toast } from 'sonner'

export function CmsVitrineList({
  onEdit,
  onPreview,
  onCreate,
}: {
  onEdit: (id: string) => void
  onPreview: (item: VitrineItem) => void
  onCreate: () => void
}) {
  const [items, setItems] = useState<VitrineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    display_page: '',
    service: '',
    start_date: '',
    end_date: '',
  })

  const load = async () => {
    try {
      setItems(await getVitrineItems())
    } catch {
      /* ignore */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('vitrine_items', () => {
    load()
  })

  const filtered = items.filter(
    (i) =>
      (!filters.type || i.type === filters.type) &&
      (!filters.status || i.status === filters.status) &&
      (!filters.display_page || i.display_page === filters.display_page) &&
      (!filters.service || (i.linked_services || []).includes(filters.service)) &&
      (!filters.start_date || (i.start_date && i.start_date >= filters.start_date)) &&
      (!filters.end_date || (i.end_date && i.end_date <= filters.end_date)),
  )

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateVitrineItem(id)
      toast.success('Campanha duplicada!')
    } catch {
      toast.error('Erro ao duplicar.')
    }
  }
  const handleToggle = async (item: VitrineItem) => {
    try {
      await updateVitrineItem(item.id, {
        active: !item.active,
        status: item.active ? 'inativa' : 'rascunho',
      })
      toast.success(item.active ? 'Campanha inativada!' : 'Campanha ativada!')
    } catch {
      toast.error('Erro ao alterar status.')
    }
  }
  const handleDelete = async (item: VitrineItem) => {
    if (item.has_publish_history) {
      toast.error('Campanhas com histórico de publicação não podem ser excluídas.')
      return
    }
    if (!confirm('Tem certeza?')) return
    try {
      await deleteVitrineItem(item.id)
      toast.success('Campanha excluída!')
    } catch {
      toast.error('Erro ao excluir.')
    }
  }

  const getTypeLabel = (t: string) => VITRINE_TYPES.find((v) => v.id === t)?.label || t
  const getPageLabel = (p: string) => VITRINE_DISPLAY_PAGES.find((v) => v.id === p)?.label || p
  const getStatusInfo = (s: string) =>
    VITRINE_STATUSES.find((v) => v.id === s) || { label: s, color: 'bg-gray-100 text-gray-700' }
  const getServiceNames = (ids: string[]) =>
    (ids || [])
      .map((id) => SERVICES.find((s: { id: string; title: string }) => s.id === id)?.title)
      .filter(Boolean)
      .join(', ')
  const selClass = 'border border-border rounded-md px-3 py-1.5 text-sm bg-white'

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Campanhas e Banners</h3>
        <Button onClick={onCreate} className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold">
          <Plus className="w-4 h-4 mr-2" /> Criar Novo
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 p-3 bg-muted/30 rounded-lg">
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className={selClass}
        >
          <option value="">Todos os tipos</option>
          {VITRINE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className={selClass}
        >
          <option value="">Todos os status</option>
          {VITRINE_STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={filters.display_page}
          onChange={(e) => setFilters({ ...filters, display_page: e.target.value })}
          className={selClass}
        >
          <option value="">Todas as páginas</option>
          {VITRINE_DISPLAY_PAGES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          value={filters.service}
          onChange={(e) => setFilters({ ...filters, service: e.target.value })}
          className={selClass}
        >
          <option value="">Todos os serviços</option>
          {SERVICES.map((s: { id: string; title: string }) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filters.start_date}
          onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
          className={selClass}
        />
        <input
          type="date"
          value={filters.end_date}
          onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
          className={selClass}
        />
      </div>
      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">Nenhuma campanha encontrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 px-3 font-bold">Nome</th>
                <th className="py-2 px-3 font-bold">Tipo</th>
                <th className="py-2 px-3 font-bold">Página</th>
                <th className="py-2 px-3 font-bold">Serviço</th>
                <th className="py-2 px-3 font-bold">Início</th>
                <th className="py-2 px-3 font-bold">Fim</th>
                <th className="py-2 px-3 font-bold">Status</th>
                <th className="py-2 px-3 font-bold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const st = getStatusInfo(item.status)
                return (
                  <tr key={item.id} className="border-b hover:bg-muted/30">
                    <td className="py-2 px-3 font-medium">{item.name}</td>
                    <td className="py-2 px-3">{getTypeLabel(item.type)}</td>
                    <td className="py-2 px-3">{getPageLabel(item.display_page)}</td>
                    <td className="py-2 px-3 text-xs">
                      {getServiceNames(item.linked_services) || '—'}
                    </td>
                    <td className="py-2 px-3 text-xs">{item.start_date || '—'}</td>
                    <td className="py-2 px-3 text-xs">{item.end_date || '—'}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onPreview(item)}
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(item.id)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDuplicate(item.id)}
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggle(item)}
                          title={item.active ? 'Inativar' : 'Ativar'}
                        >
                          <Power className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDelete(item)}
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
