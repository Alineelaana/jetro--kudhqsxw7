import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getCommercialUsers, type CommercialUser } from '@/services/commercial-users'
import { canEditCommercialResponsibles } from '@/lib/commercial-responsibles-permissions'
import { canEditPartners } from '@/lib/permissions'
import { useAuth } from '@/hooks/use-auth'
import { Users, Lock } from 'lucide-react'

interface Props {
  rcaId: string
  televendasId: string
  responsavelDigitalId: string
  onRcaChange: (v: string) => void
  onTelevendasChange: (v: string) => void
  onDigitalChange: (v: string) => void
}

export function PartnerResponsiblesSection({
  rcaId,
  televendasId,
  responsavelDigitalId,
  onRcaChange,
  onTelevendasChange,
  onDigitalChange,
}: Props) {
  const { user } = useAuth()
  const [users, setUsers] = useState<CommercialUser[]>([])
  const canEdit =
    canEditCommercialResponsibles(user?.role as string) && canEditPartners(user?.role as string)

  useEffect(() => {
    getCommercialUsers()
      .then(setUsers)
      .catch(() => {})
  }, [])

  const renderSelect = (label: string, value: string, onChange: (v: string) => void) => (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">{label}</Label>
      <Select
        value={value || 'none'}
        onValueChange={(v) => onChange(v === 'none' ? '' : v)}
        disabled={!canEdit}
      >
        <SelectTrigger className="focus-visible:ring-[#005B2E]">
          <SelectValue placeholder="Selecione um responsável" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhum</SelectItem>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name}
              {u.role ? ` (${u.role})` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-center gap-2">
        {canEdit ? (
          <Users className="w-5 h-5 text-[#005B2E]" />
        ) : (
          <Lock className="w-5 h-5 text-muted-foreground" />
        )}
        <h3 className="text-sm font-bold text-foreground">Responsáveis Comerciais</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {renderSelect('RCA', rcaId, onRcaChange)}
        {renderSelect('Televendas', televendasId, onTelevendasChange)}
        {renderSelect(
          'Responsável Comercial Digital (B2B/B2C)',
          responsavelDigitalId,
          onDigitalChange,
        )}
      </div>
      {!canEdit && (
        <p className="text-xs text-muted-foreground">
          Você não tem permissão para editar os responsáveis comerciais.
        </p>
      )}
    </div>
  )
}
