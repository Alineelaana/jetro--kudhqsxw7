import { cn } from '@/lib/utils'

interface AttributionFooterProps {
  className?: string
  variant?: 'light' | 'dark' | 'muted' | 'inline'
}

/**
 * Rodapé obrigatório de atribuição institucional:
 * "Site criado e gerenciado por SAF TECNOLOGIA E GESTAO LTDA — CNPJ 65.768.215/0001-00"
 */
export function AttributionFooter({ className, variant = 'muted' }: AttributionFooterProps) {
  const textColor =
    variant === 'dark'
      ? 'text-white/70 hover:text-white/90'
      : variant === 'light'
        ? 'text-emerald-950/70 hover:text-emerald-950'
        : 'text-muted-foreground/80 hover:text-foreground'

  const borderClass =
    variant === 'dark'
      ? 'border-white/10 bg-[#001c10]/80'
      : variant === 'light'
        ? 'border-[#005B2E]/15 bg-white/70'
        : 'border-border/60 bg-background/60'

  if (variant === 'inline') {
    return (
      <p
        className={cn(
          'text-[11px] sm:text-xs font-normal tracking-tight select-text transition-colors',
          textColor,
          className,
        )}
      >
        Site criado e gerenciado por SAF TECNOLOGIA E GESTAO LTDA — CNPJ 65.768.215/0001-00
      </p>
    )
  }

  return (
    <footer
      aria-label="Atribuição de criação e gestão"
      className={cn(
        'w-full py-1.5 px-4 text-center shrink-0 border-t backdrop-blur-xs transition-colors',
        borderClass,
        className,
      )}
    >
      <p
        className={cn(
          'text-[10px] sm:text-[11px] font-medium leading-none tracking-tight select-text transition-colors',
          textColor,
        )}
      >
        Site criado e gerenciado por SAF TECNOLOGIA E GESTAO LTDA — CNPJ 65.768.215/0001-00
      </p>
    </footer>
  )
}
