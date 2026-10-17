import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DefaultFormField } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface BudgetFormFieldProps {
  field: DefaultFormField
  value: string
  onChange: (name: string, value: string) => void
  error?: string
}

export function BudgetFormField({ field, value, onChange, error }: BudgetFormFieldProps) {
  const fieldName = field.name || field.id
  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldName} className="text-xs sm:text-sm font-semibold text-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {field.type === 'textarea' ? (
        <Textarea
          id={fieldName}
          value={value}
          onChange={(e) => onChange(fieldName, e.target.value)}
          placeholder="Descreva detalhes como dimensões, peso, janela de entrega ou requisitos especiais..."
          className={cn(
            'focus-visible:ring-[#005B2E] border-border',
            error && 'border-destructive focus-visible:ring-destructive',
          )}
          rows={3}
        />
      ) : field.type === 'select' ? (
        <Select value={value} onValueChange={(v) => onChange(fieldName, v)}>
          <SelectTrigger
            className={cn(
              'focus:ring-[#005B2E] border-border bg-white',
              error && 'border-destructive focus:ring-destructive',
            )}
          >
            <SelectValue placeholder="Selecione uma opção..." />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            {field.options?.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={fieldName}
          type={field.type}
          value={value}
          onChange={(e) => onChange(fieldName, e.target.value)}
          placeholder={
            field.type === 'email'
              ? 'nome@empresa.com.br'
              : field.type === 'tel'
                ? '(27) 99999-9999'
                : ''
          }
          className={cn(
            'focus-visible:ring-[#005B2E] border-border',
            error && 'border-destructive focus-visible:ring-destructive',
          )}
        />
      )}

      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  )
}
