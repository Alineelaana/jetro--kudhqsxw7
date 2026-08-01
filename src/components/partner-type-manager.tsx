import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  getAllPartnerTypeRecords,
  createPartnerType,
  deletePartnerType,
} from '@/services/partner-types'
import { Plus, Trash2, Tag } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface TypeRecord {
  id: string
  name: string
}

export function PartnerTypeManager({ onTypesChange }: { onTypesChange: () => void }) {
  const [types, setTypes] = useState<TypeRecord[]>([])
  const [newType, setNewType] = useState('')
  const [show, setShow] = useState(false)

  const loadTypes = async () => {
    try {
      const records = await getAllPartnerTypeRecords()
      setTypes(records as unknown as TypeRecord[])
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    loadTypes()
  }, [])

  const handleAdd = async () => {
    if (!newType.trim()) return
    try {
      await createPartnerType(newType.trim())
      setNewType('')
      loadTypes()
      onTypesChange()
      toast({ title: 'Tipo adicionado' })
    } catch {
      toast({ title: 'Erro', description: 'Tipo já existe ou falhou.', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePartnerType(id)
      loadTypes()
      onTypesChange()
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  if (!show) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShow(true)}
        className="text-[#005B2E] font-bold"
      >
        <Tag className="w-4 h-4 mr-1" /> Gerenciar tipos de parceiro
      </Button>
    )
  }

  return (
    <div className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-[#005B2E]">Tipos de Parceiro</p>
        <Button type="button" variant="ghost" size="sm" onClick={() => setShow(false)}>
          Fechar
        </Button>
      </div>
      <div className="flex gap-2">
        <Input
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          placeholder="Novo tipo"
          className="h-9"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAdd}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {types.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-1 bg-white border border-border rounded-full px-3 py-1 text-sm"
          >
            <span>{t.name}</span>
            <button
              onClick={() => handleDelete(t.id)}
              className="text-destructive hover:text-red-700 ml-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
