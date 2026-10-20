/* Badge Component primitives - A component that displays a badge - from shadcn/ui (exposes Badge, badgeVariants) */
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-[#063D30] text-white hover:bg-[#042820]',
        secondary: 'border-transparent bg-[#C69B45] text-white hover:bg-[#ad8335]',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-[#202B28] border-[#E4EAE6]',
        gold: 'border-[#C69B45]/40 bg-[#C69B45]/15 text-[#916b1e] font-semibold',
        emerald: 'border-[#116B50]/30 bg-[#116B50]/15 text-[#116B50] font-semibold',
        orange: 'border-[#E87517]/30 bg-[#E87517]/15 text-[#E87517] font-semibold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
