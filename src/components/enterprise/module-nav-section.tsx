import { type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModuleNavSectionProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  children: ReactNode
}

export function ModuleNavSection({ title, isExpanded, onToggle, children }: ModuleNavSectionProps) {
  return (
    <div className="border-b border-border/40 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors"
      >
        {title}
        <ChevronDown
          className={cn('w-3.5 h-3.5 transition-transform', isExpanded && 'rotate-180')}
        />
      </button>
      {isExpanded && <div className="flex flex-col gap-0.5 pb-2">{children}</div>}
    </div>
  )
}
