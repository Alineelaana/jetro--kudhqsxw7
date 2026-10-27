import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Calendar, FileText, UserCheck, ShieldCheck } from 'lucide-react'

export interface StandardOrderHeaderProps {
  orderType: 'Venda' | 'Compra'
  orderNumber: string
  companyName: string
  companyCnpj?: string
  operationType: string
  emissionDate: string
  expectedDeliveryDate: string
  status: string
  statusBadgeVariant?: 'default' | 'outline' | 'secondary' | 'destructive'
  responsibleUser: string
  partnerLabel: 'Cliente' | 'Fornecedor'
  partnerName: string
  partnerDoc?: string
  paymentCondition: string
  notes?: string
}

export function StandardOrderHeader({
  orderType,
  orderNumber,
  companyName,
  companyCnpj,
  operationType,
  emissionDate,
  expectedDeliveryDate,
  status,
  responsibleUser,
  partnerLabel,
  partnerName,
  partnerDoc,
  paymentCondition,
  notes,
}: StandardOrderHeaderProps) {
  const getStatusColor = (st: string) => {
    const s = st?.toLowerCase() || ''
    if (s.includes('cancel'))
      return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200'
    if (s.includes('confirm') || s.includes('aprov'))
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
    if (s.includes('fatur') || s.includes('receb'))
      return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-200'
    if (s.includes('aguard'))
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
    return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200'
  }

  return (
    <Card className="border-2 border-[#005B2E]/25 shadow-sm bg-gradient-to-r from-card via-card to-muted/20">
      <CardContent className="p-4 space-y-3">
        {/* Linha superior: Identificação do Pedido, Tipo e Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 border-border/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#005B2E] text-white flex items-center justify-center font-black shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pedido de {orderType}
                </span>
                <span className="text-sm font-mono font-black text-[#C89B3C]">
                  {orderNumber || 'NOVO (Gerado automaticamente)'}
                </span>
              </div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#005B2E]" />
                {companyName || 'Empresa Padrão'}
                {companyCnpj && (
                  <span className="text-xs font-normal text-muted-foreground">({companyCnpj})</span>
                )}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-primary/30 text-xs px-2.5 py-1">
              Operação:{' '}
              <strong className="ml-1 text-foreground">{operationType || 'Padrão'}</strong>
            </Badge>
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(status)}`}
            >
              {status || 'Rascunho'}
            </div>
          </div>
        </div>

        {/* Linha intermediária: Dados essenciais padronizados */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground block text-[11px] font-medium">
              Data de Emissão
            </span>
            <div className="font-semibold flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              {emissionDate || new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px] font-medium">
              {orderType === 'Venda' ? 'Previsão de Entrega' : 'Previsão de Recebimento'}
            </span>
            <div className="font-semibold flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              {expectedDeliveryDate || '—'}
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px] font-medium">Responsável</span>
            <div className="font-semibold flex items-center gap-1 mt-0.5 truncate">
              <UserCheck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{responsibleUser || 'Sistema'}</span>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block text-[11px] font-medium">
              {partnerLabel}
            </span>
            <div className="font-semibold truncate mt-0.5" title={partnerName}>
              {partnerName || `Selecione o ${partnerLabel}`}
            </div>
            {partnerDoc && (
              <span className="text-[10px] text-muted-foreground font-mono">{partnerDoc}</span>
            )}
          </div>

          <div className="col-span-2 md:col-span-1">
            <span className="text-muted-foreground block text-[11px] font-medium">
              Condição Pagamento
            </span>
            <div className="font-semibold truncate mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{paymentCondition || 'À Vista / Padrão'}</span>
            </div>
          </div>
        </div>

        {notes && (
          <div className="text-[11px] text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded border border-border/50 truncate">
            <strong className="text-foreground">Obs gerais:</strong> {notes}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
