import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import type { AuditFilterState } from '@/lib/audit-helpers'
import {
  AUDIT_MODULE_OPTIONS,
  AUDIT_ACTION_OPTIONS,
  AUDIT_ROLE_OPTIONS,
  CRITICIDADE_OPTIONS,
  ORIGEM_OPTIONS,
  BROWSER_OPTIONS,
  OS_OPTIONS,
  DEVICE_OPTIONS,
} from '@/lib/audit-helpers'
import type { ReactNode } from 'react'

interface Props {
  filters: AuditFilterState
  onChange: (key: keyof AuditFilterState, value: string) => void
  onClear: () => void
  hasFilters: boolean
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function Sel({
  label,
  value,
  onChange,
  options,
  ph,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  ph: string
}) {
  return (
    <Field label={label}>
      <Select value={value || 'all'} onValueChange={(v) => onChange(v === 'all' ? '' : v)}>
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder={ph} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{ph}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}

export function AuditFilters({ filters, onChange, onClear, hasFilters }: Props) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Field label="Usuário">
          <Input
            value={filters.user}
            onChange={(e) => onChange('user', e.target.value)}
            placeholder="Nome ou e-mail"
            className="h-9 text-sm"
          />
        </Field>
        <Field label="Data inicial">
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            className="h-9 text-sm"
          />
        </Field>
        <Field label="Data final">
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange('endDate', e.target.value)}
            className="h-9 text-sm"
          />
        </Field>
        <Sel
          label="Módulo"
          value={filters.module}
          onChange={(v) => onChange('module', v)}
          options={AUDIT_MODULE_OPTIONS}
          ph="Todos"
        />
        <Sel
          label="Ação"
          value={filters.action}
          onChange={(v) => onChange('action', v)}
          options={AUDIT_ACTION_OPTIONS}
          ph="Todas"
        />
        <Sel
          label="Perfil"
          value={filters.role}
          onChange={(v) => onChange('role', v)}
          options={AUDIT_ROLE_OPTIONS}
          ph="Todos"
        />
        <Sel
          label="Criticidade"
          value={filters.criticidade}
          onChange={(v) => onChange('criticidade', v)}
          options={CRITICIDADE_OPTIONS}
          ph="Todas"
        />
        <Sel
          label="Origem"
          value={filters.origem}
          onChange={(v) => onChange('origem', v)}
          options={ORIGEM_OPTIONS}
          ph="Todas"
        />
        <Field label="Empresa">
          <Input
            value={filters.empresa}
            onChange={(e) => onChange('empresa', e.target.value)}
            placeholder="Empresa"
            className="h-9 text-sm"
          />
        </Field>
        <Field label="Filial">
          <Input
            value={filters.filial}
            onChange={(e) => onChange('filial', e.target.value)}
            placeholder="Filial"
            className="h-9 text-sm"
          />
        </Field>
        <Field label="Endereço IP">
          <Input
            value={filters.ipAddress}
            onChange={(e) => onChange('ipAddress', e.target.value)}
            placeholder="192.168.0.1"
            className="h-9 text-sm"
          />
        </Field>
        <Field label="ID da Sessão">
          <Input
            value={filters.sessionId}
            onChange={(e) => onChange('sessionId', e.target.value)}
            placeholder="ID da sessão"
            className="h-9 text-sm"
          />
        </Field>
        <Sel
          label="Navegador"
          value={filters.browser}
          onChange={(v) => onChange('browser', v)}
          options={BROWSER_OPTIONS}
          ph="Todos"
        />
        <Sel
          label="Sistema Operacional"
          value={filters.os}
          onChange={(v) => onChange('os', v)}
          options={OS_OPTIONS}
          ph="Todos"
        />
        <Sel
          label="Dispositivo"
          value={filters.device}
          onChange={(v) => onChange('device', v)}
          options={DEVICE_OPTIONS}
          ph="Todos"
        />
        <Field
          label={
            (
              <>
                <Search className="w-3 h-3 inline mr-1" />
                Palavra-chave
              </>
            ) as unknown as string
          }
        >
          <Input
            value={filters.keyword}
            onChange={(e) => onChange('keyword', e.target.value)}
            placeholder="Buscar em todos os campos"
            className="h-9 text-sm"
          />
        </Field>
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
          Limpar filtros
        </Button>
      )}
    </div>
  )
}
