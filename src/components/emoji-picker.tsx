import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Smile } from 'lucide-react'

const EMOJIS = [
  '😊',
  '😂',
  '❤️',
  '👍',
  '👎',
  '🎉',
  '🔥',
  '✨',
  '⭐',
  '🙏',
  '😅',
  '😉',
  '😍',
  '🤔',
  '😎',
  '😇',
  '🤝',
  '💯',
  '📞',
  '📦',
  '🚚',
  '✅',
  '❌',
  '💡',
  '🙌',
  '🤗',
  '🙂',
  '😴',
  '🤐',
  '🤫',
  '🤩',
  '💪',
]

export function EmojiPicker({ onInsert }: { onInsert: (emoji: string) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="flex-shrink-0 h-9 w-9">
          <Smile className="w-5 h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <div className="grid grid-cols-8 gap-1">
          {EMOJIS.map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              onClick={() => onInsert(emoji)}
              className="text-lg hover:bg-muted rounded p-1 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
