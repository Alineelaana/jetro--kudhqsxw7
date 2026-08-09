import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getNetworks, type ClientNetwork } from '@/services/client-networks'
import { NetworkFormDialog } from '@/components/network-form-dialog'
import { NetworkConsolidatedView } from '@/components/network-consolidated-view'
import { Network, Plus, Eye } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
}

export function NetworkField({ value, onChange }: Props) {
  const [networks, setNetworks] = useState<ClientNetwork[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)

  const load = () => {
    getNetworks()
      .then(setNetworks)
      .catch(() => {})
  }
  useEffect(() => {
    load()
  }, [])

  const selected = networks.find((n) => n.id === value)

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">Rede / Grupo Econômico</Label>
      <div className="flex items-center gap-2">
        <Select value={value || 'none'} onValueChange={(v) => onChange(v === 'none' ? '' : v)}>
          <SelectTrigger className="focus-visible:ring-[#005B2E]">
            <SelectValue placeholder="Selecione uma rede" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            {networks.map((n) => (
              <SelectItem key={n.id} value={n.id}>
                {n.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFormOpen(true)}
          title="Criar nova rede"
          className="flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setViewOpen(true)}
            title="Ver visão consolidada"
            className="flex-shrink-0"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
      </div>
      {selected && (
        <p className="text-xs text-muted-foreground">
          <Network className="w-3 h-3 inline mr-1" />
          {selected.name} — {selected.status}
        </p>
      )}
      <NetworkFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        network={null}
        onSaved={(n) => {
          onChange(n.id)
          load()
        }}
      />
      {value && (
        <NetworkConsolidatedView open={viewOpen} onOpenChange={setViewOpen} networkId={value} />
      )}
    </div>
  )
}
