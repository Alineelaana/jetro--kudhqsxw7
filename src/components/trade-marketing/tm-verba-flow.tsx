import { Card, CardContent } from '@/components/ui/card'
import { formatBRL } from '@/lib/supplier-allowance-types'
import type { TmVerbaRow } from '@/lib/tm-verbas-types'
import { HandCoins, Wallet, Lock, TrendingDown, Scale, FileCheck, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const STAGES = [
  { key: 'captacao', label: 'Captação', icon: HandCoins, field: 'value_original' as const },
  { key: 'disponivel', label: 'Disponível', icon: Wallet, field: 'current_balance' as const },
  { key: 'comprometido', label: 'Comprometido', icon: Lock, field: 'committed_total' as const },
  { key: 'gasto', label: 'Gasto', icon: TrendingDown, field: 'consumed_total' as const },
  { key: 'saldo', label: 'Saldo', icon: Scale, field: 'current_balance' as const },
  { key: 'prestacao', label: 'Prest. Contas', icon: FileCheck, field: 'settled_total' as const },
  { key: 'encerramento', label: 'Encerrado', icon: CheckCircle, field: null },
] as const

export function TmVerbaFlow({ verba }: { verba: TmVerbaRow }) {
  const isClosed = verba.status === 'encerrado'
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 flex-wrap">
        {STAGES.map((stage, idx) => {
          const value = stage.field ? verba[stage.field] : null
          const hasValue = value !== null && parseFloat(value) > 0
          const isCompleted = isClosed && idx === STAGES.length - 1
          return (
            <div key={stage.key} className="flex items-center">
              <Card
                className={cn(
                  'min-w-[110px] border-2 transition-colors',
                  isCompleted || hasValue
                    ? 'border-[#005B2E]/40 bg-[#005B2E]/5'
                    : 'border-gray-200',
                )}
              >
                <CardContent className="p-2.5 text-center">
                  <stage.icon
                    className={cn(
                      'w-5 h-5 mx-auto mb-1',
                      isCompleted || hasValue ? 'text-[#005B2E]' : 'text-gray-400',
                    )}
                  />
                  <p className="text-xs font-semibold text-muted-foreground">{stage.label}</p>
                  {value !== null && (
                    <p className="text-sm font-bold text-[#005B2E]">R$ {formatBRL(value)}</p>
                  )}
                  {isCompleted && <p className="text-xs font-bold text-green-600">Concluído</p>}
                </CardContent>
              </Card>
              {idx < STAGES.length - 1 && (
                <div className={cn('w-3 h-0.5', hasValue ? 'bg-[#005B2E]' : 'bg-gray-200')} />
              )}
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-muted rounded p-2">
          <p className="text-muted-foreground">Fornecedor</p>
          <p className="font-semibold truncate">{verba.supplier_name}</p>
        </div>
        <div className="bg-muted rounded p-2">
          <p className="text-muted-foreground">Validade</p>
          <p className="font-semibold">{verba.end_date || '—'}</p>
        </div>
        <div className="bg-muted rounded p-2">
          <p className="text-muted-foreground">Empresa / Filial</p>
          <p className="font-semibold truncate">
            {verba.company || '—'} / {verba.branch || '—'}
          </p>
        </div>
        <div className="bg-muted rounded p-2">
          <p className="text-muted-foreground">Responsável</p>
          <p className="font-semibold truncate">{verba.responsible_user || '—'}</p>
        </div>
      </div>
      {verba.brands.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {verba.brands.map((b) => (
            <span key={b} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {b}
            </span>
          ))}
        </div>
      )}
      {verba.campaigns.length > 0 && (
        <p className="text-xs">
          <span className="text-muted-foreground">Campanhas: </span>
          <span className="font-semibold">{verba.campaigns.join(', ')}</span>
        </p>
      )}
      <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-700">
        ⚠️ Verbas de fornecedor não podem ser aplicadas ao preço de produtos (regra do domínio de
        Verbas).
      </div>
    </div>
  )
}
