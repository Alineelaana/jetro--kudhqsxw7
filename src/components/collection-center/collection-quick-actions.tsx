import { Button } from '@/components/ui/button'
import { QUICK_ACTIONS } from '@/lib/collection-center-types'
import {
  Phone,
  CalendarClock,
  Handshake,
  Send,
  MessageCircle,
  Mail,
  Files,
  Copy,
  AlertTriangle,
  CheckSquare,
  ArrowUp,
  History,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS: Record<string, any> = {
  contact: Phone,
  promise: CalendarClock,
  negotiate: Handshake,
  send: Send,
  whatsapp: MessageCircle,
  email: Mail,
  second_copy: Files,
  copy_pix: Copy,
  dispute: AlertTriangle,
  task: CheckSquare,
  escalate: ArrowUp,
  history: History,
}

export function CollectionQuickActions({
  onAction,
  disabled,
}: {
  onAction: (key: string) => void
  disabled?: boolean
}) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {QUICK_ACTIONS.map((action) => {
        const Icon = ICONS[action.key] || Phone
        return (
          <Button
            key={action.key}
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onAction(action.key)}
            className={cn(
              'h-auto py-1.5 px-1 text-[10px] font-semibold flex flex-col items-center gap-0.5 border-[#005B2E]/20 hover:bg-[#005B2E]/5 hover:border-[#005B2E]/40',
            )}
          >
            <Icon className="w-3.5 h-3.5 text-[#005B2E]" />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
