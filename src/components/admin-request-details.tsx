import { Clock, Receipt, Mail, Phone, Tag } from 'lucide-react'
import { type BudgetRecord } from '@/lib/types'
import { getResponseTime } from '@/lib/response-time'

const SPECIAL_LABELS: Record<string, string> = {
  privacy_consent_accepted: 'Consentimento de Privacidade',
  privacy_consent_accepted_at: 'Consentimento aceito em',
  servicos_inclusos: 'Serviços Inclusos',
  necessita_seguro: 'Necessita Seguro',
  necessita_picking: 'Necessita Picking',
  necessita_cross_docking: 'Necessita Cross Docking',
  necessita_fracionamento: 'Necessita Fracionamento',
  necessita_distribuicao: 'Necessita Distribuição',
  valor_mercadoria: 'Valor da Mercadoria',
  tipo_carga: 'Tipo de Carga',
  prazo_desejado: 'Prazo Desejado',
  quantidade_volumes: 'Quantidade de Volumes',
  peso: 'Peso (kg)',
  cubagem: 'Cubagem (m³)',
  valor_seguro: 'Valor do Seguro',
  forma_pagamento: 'Forma de Pagamento',
  prazo: 'Prazo Comercial',
}

function formatValue(key: string, value: unknown): string {
  if (key === 'privacy_consent_accepted') {
    return value === true || value === 'true' ? 'Aceito' : 'Não aceito'
  }
  if (key === 'privacy_consent_accepted_at' && value) {
    return new Date(value as string).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  if (!value || value === 'null' || value === 'undefined') return '—'
  return String(value)
}

interface AdminRequestDetailsProps {
  data: Record<string, unknown>
  labelMap: Record<string, string>
  record: BudgetRecord
}

export function AdminRequestDetails({ data, labelMap, record }: AdminRequestDetailsProps) {
  const responseTime = getResponseTime(record.created, record.quote_created_at)
  const entries = Object.entries(data || {})

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="p-3 rounded-lg bg-[#005B2E]/5 border border-[#005B2E]/20">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-[#005B2E]" />
          <span className="text-sm font-bold text-[#005B2E]">
            Tempo de resposta: {responseTime.text}
          </span>
          {!responseTime.hasQuote && (
            <span className="text-xs text-amber-600 font-medium">
              (Aguardando geração de orçamento)
            </span>
          )}
        </div>
        {record.budget_number && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Receipt className="w-3 h-3" /> {record.budget_number}
            </span>
            {record.responsible_email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" /> {record.responsible_email}
              </span>
            )}
            {record.responsible_phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> {record.responsible_phone}
              </span>
            )}
            {record.sales_channel && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" /> {record.sales_channel}
              </span>
            )}
          </div>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem dados adicionais.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {entries.map(([key, value]) => {
            const label = labelMap[key] || SPECIAL_LABELS[key] || key
            return (
              <div key={key} className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-[#005B2E] uppercase tracking-wide">
                  {label}
                </span>
                <span className="text-sm text-foreground/90 break-words">
                  {formatValue(key, value)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
