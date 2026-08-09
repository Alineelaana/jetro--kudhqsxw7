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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import pb from '@/lib/pocketbase/client'
import {
  getNetworks,
  linkPartnerToNetwork,
  unlinkPartnerFromNetwork,
  type ClientNetwork,
} from '@/services/client-networks'
import { NetworkFormDialog } from '@/components/network-form-dialog'
import { NetworkConsolidatedView } from '@/components/network-consolidated-view'
import { toast } from '@/hooks/use-toast'
import { Network, Plus, Eye, Loader2 } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  partnerId?: string
}

export function NetworkField({ value, onChange, partnerId }: Props) {
  const [networks, setNetworks] = useState<ClientNetwork[]>([])
  const [formOpen, setFormOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [justifyOpen, setJustifyOpen] = useState(false)
  const [pendingNetworkId, setPendingNetworkId] = useState('')
  const [justification, setJustification] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    getNetworks()
      .then(setNetworks)
      .catch(() => {})
  }
  useEffect(() => {
    load()
  }, [])

  const handleSelect = (v: string) => {
    const newId = v === 'none' ? '' : v
    if (newId === value) return

    if (partnerId && newId !== value) {
      setPendingNetworkId(newId)
      setJustification('')
      setJustifyOpen(true)
    } else {
      onChange(newId)
    }
  }

  const handleConfirmJustification = async () => {
    if (!justification.trim() || !partnerId) return
    setSaving(true)
    try {
      if (pendingNetworkId) {
        await linkPartnerToNetwork(partnerId, pendingNetworkId, justification.trim())
      } else {
        await unlinkPartnerFromNetwork(partnerId, justification.trim())
      }
      onChange(pendingNetworkId)
      setJustifyOpen(false)
      toast({ title: 'Rede atualizada com sucesso' })
    } catch {
      toast({ title: 'Erro ao atualizar rede', variant: 'destructive' })
    }
    setSaving(false)
  }

  const selected = networks.find((n) => n.id === value)
  const isUnlinking = pendingNetworkId === '' && value !== ''

  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">Rede / Grupo Econômico</Label>
      <div className="flex items-center gap-2">
        <Select value={value || 'none'} onValueChange={handleSelect}>
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
      <Dialog open={justifyOpen} onOpenChange={setJustifyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">
              {isUnlinking ? 'Desvincular Cliente' : 'Vincular Cliente'}
            </DialogTitle>
            <DialogDescription>
              {isUnlinking
                ? 'Desvincular cliente da Rede/Grupo Econômico. Informe o motivo desta ação.'
                : 'Vincular cliente a uma Rede/Grupo Econômico. Informe o motivo desta ação.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Justificativa *</Label>
            <Textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Descreva o motivo da ação..."
              rows={3}
              className="focus-visible:ring-[#005B2E]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJustifyOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmJustification}
              disabled={saving || !justification.trim()}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
