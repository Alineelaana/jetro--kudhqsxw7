import { Link } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface ConsentCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

export function ConsentCheckbox({ checked, onChange, error }: ConsentCheckboxProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-start gap-2.5">
        <Checkbox
          id="privacy-consent"
          checked={checked}
          onCheckedChange={(v) => onChange(v === true)}
          className={cn(
            'mt-0.5 border-border data-[state=checked]:bg-[#005B2E] data-[state=checked]:border-[#005B2E]',
            error && 'border-destructive',
          )}
        />
        <label
          htmlFor="privacy-consent"
          className="text-xs sm:text-sm text-foreground/80 cursor-pointer leading-relaxed"
        >
          Li e aceito a{' '}
          <Link
            to="/politica-de-privacidade"
            target="_blank"
            className="font-bold text-[#005B2E] underline hover:text-[#01361D] transition-colors"
          >
            Política de Privacidade
          </Link>
          <span className="text-destructive ml-1">*</span>
        </label>
      </div>
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
    </div>
  )
}
