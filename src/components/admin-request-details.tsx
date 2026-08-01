const SPECIAL_LABELS: Record<string, string> = {
  privacy_consent_accepted: 'Consentimento de Privacidade',
  privacy_consent_accepted_at: 'Consentimento aceito em',
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
}

export function AdminRequestDetails({ data, labelMap }: AdminRequestDetailsProps) {
  const entries = Object.entries(data || {})
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem dados adicionais.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
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
  )
}
