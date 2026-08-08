import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FinancialEmptyState } from '@/components/financial/financial-shared'
import { searchPartnerByName } from '@/services/collection-center'
import {
  RISK_CLASSIFICATIONS,
  computeSaldo,
  computeAgingDays,
  computeTotalAtualizado,
  formatCurrency,
  type QueueItem,
} from '@/lib/collection-center-types'
import { Info, Phone, Mail, User, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CollectionClientPanel({
  client,
  selectedTitleIds,
  onToggleTitle,
}: {
  client: QueueItem | null
  selectedTitleIds: string[]
  onToggleTitle: (id: string) => void
}) {
  const [partner, setPartner] = useState<any | null>(null)

  useEffect(() => {
    if (client?.cliente) {
      searchPartnerByName(client.cliente)
        .then(setPartner)
        .catch(() => setPartner(null))
    } else {
      setPartner(null)
    }
  }, [client?.cliente])

  if (!client) {
    return <FinancialEmptyState message="Selecione um cliente na fila" />
  }

  const totalVencido = client.valorVencido
  const totalVencer = client.receivables
    .filter((r) => computeAgingDays(r.data_vencimento) <= 0)
    .reduce((s, r) => s + computeSaldo(r), 0)
  const atrasoMedio = Math.round(
    client.receivables.reduce((s, r) => s + computeAgingDays(r.data_vencimento), 0) /
      client.receivables.length,
  )
  const maiorAtraso = client.diasAtraso
  const risco = RISK_CLASSIFICATIONS.find((r) => r.key === client.risco)

  return (
    <div className="space-y-3">
      <Card className="border-2 border-[#005B2E]/20 shadow-md">
        <CardContent className="p-3 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-black text-[#005B2E]">{client.cliente}</h3>
              <div className="flex items-center gap-2 mt-1">
                {risco && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded cursor-pointer',
                          risco.className,
                        )}
                      >
                        {risco.emoji} {risco.label} <Info className="inline w-3 h-3" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 text-xs">
                      <p className="font-bold mb-1">Fatores de Risco:</p>
                      <ul className="space-y-0.5">
                        <li>Dias em atraso: {maiorAtraso}</li>
                        <li>Valor vencido: {formatCurrency(totalVencido)}</li>
                        <li>Qtd. títulos vencidos: {client.quantidadeTitulos}</li>
                        {client.collectionRecord?.promise_status === 'Quebrada' && (
                          <li>Promessa quebrada</li>
                        )}
                        {client.collectionRecord?.dispute_status === 'Aberta' && (
                          <li>Disputa em aberto</li>
                        )}
                      </ul>
                    </PopoverContent>
                  </Popover>
                )}
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                  {client.prioridade}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-muted-foreground" /> {partner?.phone || '—'}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-muted-foreground" /> {partner?.email || '—'}
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3 text-muted-foreground" />{' '}
              {partner?.full_name || partner?.trade_name || '—'}
            </div>
            <div className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-muted-foreground" />{' '}
              {partner?.cnpj || partner?.cpf || '—'}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1 pt-2 border-t border-[#005B2E]/10">
            <div>
              <p className="text-[10px] text-muted-foreground">Vencido</p>
              <p className="text-xs font-bold text-red-600">{formatCurrency(totalVencido)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">A Vencer</p>
              <p className="text-xs font-bold">{formatCurrency(totalVencer)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Atraso Méd.</p>
              <p className="text-xs font-bold">{atrasoMedio}d</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Maior Atraso</p>
              <p className="text-xs font-bold">{maiorAtraso}d</p>
            </div>
          </div>
          {client.collectionRecord?.promise_status &&
            client.collectionRecord.promise_status !== '' && (
              <div className="flex gap-1 flex-wrap">
                <Badge variant="outline" className="text-[10px]">
                  P: {client.collectionRecord.promise_status}
                </Badge>
                {client.collectionRecord.dispute_status === 'Aberta' && (
                  <Badge variant="outline" className="text-[10px] text-purple-600">
                    Disputa
                  </Badge>
                )}
              </div>
            )}
        </CardContent>
      </Card>

      <Card className="border-2 border-[#005B2E]/20 shadow-md overflow-hidden">
        <div className="bg-[#01361D] text-white px-3 py-2 text-xs font-bold">
          Títulos do Cliente
        </div>
        <div className="overflow-x-auto max-h-[40vh]">
          <table className="w-full text-xs">
            <thead className="bg-[#005B2E]/5 sticky top-0">
              <tr>
                <th className="px-1.5 py-1.5 text-left"></th>
                <th className="px-1.5 py-1.5 text-left font-bold">Título</th>
                <th className="px-1.5 py-1.5 text-left font-bold">Venc.</th>
                <th className="px-1.5 py-1.5 text-right font-bold">Dias</th>
                <th className="px-1.5 py-1.5 text-right font-bold">Orig.</th>
                <th className="px-1.5 py-1.5 text-right font-bold">Receb.</th>
                <th className="px-1.5 py-1.5 text-right font-bold">Saldo</th>
                <th className="px-1.5 py-1.5 text-right font-bold">Atual.</th>
                <th className="px-1.5 py-1.5 text-left font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {client.receivables.map((r) => {
                const saldo = computeSaldo(r)
                const dias = computeAgingDays(r.data_vencimento)
                const total = computeTotalAtualizado(r)
                return (
                  <tr key={r.id} className="border-b border-border hover:bg-[#005B2E]/5">
                    <td className="px-1.5 py-1.5">
                      <Checkbox
                        checked={selectedTitleIds.includes(r.id)}
                        onCheckedChange={() => onToggleTitle(r.id)}
                      />
                    </td>
                    <td className="px-1.5 py-1.5 font-mono font-bold text-[#C89B3C]">
                      {r.numero_titulo || '—'}
                    </td>
                    <td className="px-1.5 py-1.5">{r.data_vencimento || '—'}</td>
                    <td className="px-1.5 py-1.5 text-right font-bold text-red-600">{dias}</td>
                    <td className="px-1.5 py-1.5 text-right">{r.valor_original || '—'}</td>
                    <td className="px-1.5 py-1.5 text-right text-green-600">
                      {r.valor_recebido || '—'}
                    </td>
                    <td className="px-1.5 py-1.5 text-right font-bold">{formatCurrency(saldo)}</td>
                    <td className="px-1.5 py-1.5 text-right">{formatCurrency(total)}</td>
                    <td className="px-1.5 py-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                        {r.status || '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
