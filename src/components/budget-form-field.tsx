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
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name} className="text-sm font-medium text-foreground">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {field.type === 'textarea' ? (
        <Textarea
          id={field.name}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={cn(error && 'border-destructive')}
          rows={3}
        />
      ) : field.type === 'select' ? (
        <Select value={value} onValueChange={(v) => onChange(field.name, v)}>
          <SelectTrigger className={cn(error && 'border-destructive')}>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={field.name}
          type={field.type}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={cn(error && 'border-destructive')}
        />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
