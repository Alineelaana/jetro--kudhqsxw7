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
  const linkColor =
    variant === 'dark'
      ? 'text-white/70 hover:text-[#E4C46A] underline decoration-white/20 hover:decoration-[#E4C46A] underline-offset-2'
      : variant === 'light'
        ? 'text-emerald-950/70 hover:text-[#005B2E] underline decoration-emerald-950/20 hover:decoration-[#005B2E] underline-offset-2'
        : 'text-muted-foreground/80 hover:text-[#005B2E] dark:hover:text-[#E4C46A] underline decoration-border/60 hover:decoration-[#005B2E] dark:hover:decoration-[#E4C46A] underline-offset-2'

  const borderClass =
    variant === 'dark'
      ? 'border-white/10 bg-[#001c10]/80'
      : variant === 'light'
        ? 'border-[#005B2E]/15 bg-white/70'
        : 'border-border/60 bg-background/60'

  const content = (
    <a
      href="https://wa.me/5531991297619"
      target="_blank"
      rel="noopener noreferrer"
      className={cn('inline-block transition-colors cursor-pointer select-text', linkColor)}
      title="Falar no WhatsApp: (31) 99129-7619"
    >
      Site criado e gerenciado por SAF TECNOLOGIA E GESTAO LTDA — CNPJ 65.768.215/0001-00
    </a>
  )

  if (variant === 'inline') {
    return (
      <p className={cn('text-[11px] sm:text-xs font-normal tracking-tight', className)}>
        {content}
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
          'text-[10px] sm:text-[11px] font-medium leading-none tracking-tight',
          className,
        )}
      >
        {content}
      </p>
    </footer>
  )
}
