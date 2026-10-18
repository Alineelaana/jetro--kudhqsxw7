import { Card } from '@/components/ui/card'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { formatCurrency } from '@/lib/collection-center-types'
import { useAuth } from '@/hooks/use-auth'
import { canManagePartners } from '@/lib/permissions'

interface Props {
  networkName: string
  originName: string
  originCnpj: string
  overdueAmount: string
  overdueDays: string
}

export function CollectionRestrictionCause({
  networkName,
  originName,
  originCnpj,
  overdueAmount,
  overdueDays,
}: Props) {
  const { user } = useAuth()
  const role = (user as any)?.role
  const canViewOrigin = canManagePartners(role)

  const amount = parseFloat(overdueAmount) || 0
  const days = parseInt(overdueDays, 10) || 0

  return (
    <Card className="border-2 border-red-300 shadow-md p-3 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-4 h-4 text-red-600" />
        <p className="text-sm font-bold text-red-600">Restrição por Grupo Econômico</p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">Cliente de Origem</p>
          <p className="font-bold">{originName || '—'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">CNPJ de Origem</p>
          <p className="font-bold">{originCnpj || '—'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Valor em Atraso</p>
          <p className="font-bold text-red-600">{formatCurrency(amount)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Dias de Atraso</p>
          <p className="font-bold text-red-600">{days} dias</p>
        </div>
        <div className="col-span-2">
          <p className="text-muted-foreground">Rede / Grupo Econômico</p>
          <p className="font-bold text-[#005B2E]">{networkName || '—'}</p>
        </div>
      </div>
      {canViewOrigin && originName && (
        <a
          href={`/admin/cadastros/clientes?search=${encodeURIComponent(originName)}`}
          className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-2"
        >
          <ExternalLink className="w-3 h-3" /> Ver cliente de origem
        </a>
      )}
    </Card>
  )
}
