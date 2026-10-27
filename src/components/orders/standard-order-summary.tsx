import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, Percent, TrendingUp, Truck, ShieldAlert } from 'lucide-react'

export interface StandardOrderSummaryProps {
  grossValue: number
  discountsValue: number
  additionsValue?: number
  freightValue?: number
  insuranceValue?: number
  expensesValue?: number
  taxesValue?: number
  totalValue: number
  // Campos específicos de Venda (opcionais e condicionais)
  estimatedMarginPercent?: number
  estimatedMarginValue?: number
  showMargin?: boolean
  creditLimitAvailable?: number
  // Campos específicos de Compra (opcionais)
  budgetAvailable?: number
  quotationDiffPercent?: number
}

export function StandardOrderSummary({
  grossValue,
  discountsValue,
  additionsValue = 0,
  freightValue = 0,
  insuranceValue = 0,
  expensesValue = 0,
  taxesValue = 0,
  totalValue,
  estimatedMarginPercent,
  estimatedMarginValue,
  showMargin = false,
  creditLimitAvailable,
  budgetAvailable,
  quotationDiffPercent,
}: StandardOrderSummaryProps) {
  const formatMoney = (val: number) => {
    return Number(val || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  return (
    <Card className="border-2 border-[#005B2E]/30 bg-muted/20 shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-[#005B2E]" />
            Resumo Financeiro Consolidado
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground">
            Cálculo em Tempo Real
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-background p-2 rounded-md border">
            <span className="text-muted-foreground text-[11px] block">Subtotal Itens</span>
            <span className="font-bold text-foreground text-sm">{formatMoney(grossValue)}</span>
          </div>

          <div className="bg-background p-2 rounded-md border">
            <span className="text-muted-foreground text-[11px] block">Descontos (-)</span>
            <span className="font-bold text-rose-600 text-sm">-{formatMoney(discountsValue)}</span>
          </div>

          <div className="bg-background p-2 rounded-md border">
            <span className="text-muted-foreground text-[11px] block flex items-center gap-1">
              <Truck className="w-3 h-3 text-muted-foreground" /> Frete / Seguro
            </span>
            <span className="font-semibold text-foreground text-sm">
              {formatMoney((freightValue || 0) + (insuranceValue || 0))}
            </span>
          </div>

          <div className="bg-background p-2 rounded-md border">
            <span className="text-muted-foreground text-[11px] block">Outras Desp. / Acrésc.</span>
            <span className="font-semibold text-foreground text-sm">
              {formatMoney((expensesValue || 0) + (additionsValue || 0))}
            </span>
          </div>

          {taxesValue > 0 && (
            <div className="bg-background p-2 rounded-md border">
              <span className="text-muted-foreground text-[11px] block">Impostos Estimados</span>
              <span className="font-semibold text-foreground text-sm">
                {formatMoney(taxesValue)}
              </span>
            </div>
          )}

          {/* Destaque do Total Líquido */}
          <div className="bg-[#005B2E]/10 border-2 border-[#005B2E] p-2 rounded-md col-span-2 sm:col-span-2 flex flex-col justify-center">
            <span className="text-[#005B2E] text-[11px] font-black uppercase tracking-wider block">
              Valor Total do Pedido
            </span>
            <span className="text-xl font-black text-[#005B2E]">{formatMoney(totalValue)}</span>
          </div>
        </div>

        {/* Indicadores complementares de governança (Margem, Crédito, Orçamento) */}
        {(showMargin ||
          creditLimitAvailable !== undefined ||
          budgetAvailable !== undefined ||
          quotationDiffPercent !== undefined) && (
          <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-4 text-xs">
            {showMargin && estimatedMarginPercent !== undefined && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Margem de Contribuição:</span>
                <span
                  className={`font-bold ${estimatedMarginPercent < 10 ? 'text-amber-600' : 'text-emerald-700'}`}
                >
                  {estimatedMarginPercent.toFixed(1)}%{' '}
                  {estimatedMarginValue ? `(${formatMoney(estimatedMarginValue)})` : ''}
                </span>
              </div>
            )}

            {creditLimitAvailable !== undefined && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Percent className="w-3.5 h-3.5 text-blue-600" />
                <span>Saldo Limite Crédito:</span>
                <span className="font-bold text-foreground">
                  {formatMoney(creditLimitAvailable)}
                </span>
              </div>
            )}

            {budgetAvailable !== undefined && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ShieldAlert className="w-3.5 h-3.5 text-[#C89B3C]" />
                <span>Orçamento Disponível:</span>
                <span className="font-bold text-foreground">{formatMoney(budgetAvailable)}</span>
              </div>
            )}

            {quotationDiffPercent !== undefined && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                <span>Variação vs Cotação:</span>
                <span
                  className={`font-bold ${quotationDiffPercent > 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                >
                  {quotationDiffPercent > 0
                    ? `+${quotationDiffPercent.toFixed(1)}%`
                    : `${quotationDiffPercent.toFixed(1)}%`}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
