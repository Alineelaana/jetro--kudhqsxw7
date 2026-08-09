import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { creditCheck, type CreditCheckResult } from '@/services/client-networks'
import { ShieldAlert, ShieldCheck, Loader2, AlertCircle, Network } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CreditNetworkDisplay({ partnerId }: { partnerId: string }) {
  const [result, setResult] = useState<CreditCheckResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!partnerId) {
      setLoading(false)
      return
    }
    setLoading(true)
    creditCheck(partnerId)
      .then((res) => setResult(res as CreditCheckResult))
      .catch(() => setResult(null))
      .finally(() => setLoading(false))
  }, [partnerId])

  if (loading) {
    return (
      <Card className="border-2 border-[#005B2E]/20 p-3 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#005B2E]" />
        <span className="text-xs text-muted-foreground">Verificando crédito...</span>
      </Card>
    )
  }

  if (!result) return null

  const isBlocked = result.decision === 'blocked'
  const requiresApproval = result.decision === 'requires_approval'

  const fmtCurrency = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <Card
      className={cn(
        'border-2 shadow-md',
        isBlocked
          ? 'border-red-300'
          : requiresApproval
            ? 'border-amber-300'
            : 'border-[#005B2E]/20',
      )}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          {isBlocked ? (
            <ShieldAlert className="w-5 h-5 text-red-600" />
          ) : requiresApproval ? (
            <AlertCircle className="w-5 h-5 text-amber-600" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-green-600" />
          )}
          <p className="text-sm font-bold">
            {isBlocked
              ? 'Crédito Bloqueado'
              : requiresApproval
                ? 'Requer Aprovação'
                : 'Crédito Aprovado'}
          </p>
        </div>

        {(result.own_delinquency || result.network_delinquency) && (
          <div className="text-xs text-red-600 font-medium">
            {result.own_delinquency && 'Cliente possui inadimplência própria. '}
            {result.network_delinquency && 'Inadimplência na Rede/Grupo Econômico.'}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Vencido Próprio</p>
            <p className="font-bold text-red-600">{fmtCurrency(result.own_overdue_amount)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Vencido da Rede</p>
            <p className="font-bold text-red-600">{fmtCurrency(result.network_overdue_amount)}</p>
          </div>
          {result.network_limit > 0 && (
            <>
              <div>
                <p className="text-muted-foreground">Limite da Rede</p>
                <p className="font-bold">{fmtCurrency(result.network_limit)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Crédito Disponível</p>
                <p className="font-bold text-green-600">
                  {fmtCurrency(Math.max(0, result.network_limit - result.network_overdue_amount))}
                </p>
              </div>
            </>
          )}
          <div>
            <p className="text-muted-foreground">Política</p>
            <p className="font-bold">{result.restriction_policy}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Membros</p>
            <p className="font-bold">{result.members_count}</p>
          </div>
        </div>

        {result.network_name && (
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Network className="w-3 h-3" />
            Rede: <span className="font-bold text-[#005B2E]">{result.network_name}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
