import React from 'react'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Bot } from 'lucide-react'

interface JehPageHeaderProps {
  title: string
  description: string
  action?: React.ReactNode
  badgeText?: string
}

export function JehPageHeader({
  title,
  description,
  action,
  badgeText = 'Assistente Institucional',
}: JehPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#005B2E]/10 border border-[#005B2E]/20 text-[#005B2E] flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-[#005B2E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h1>
              <Badge
                variant="outline"
                className="text-[11px] font-medium border-[#005B2E]/30 text-[#005B2E] bg-[#005B2E]/5"
              >
                {badgeText}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-start md:self-auto">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-800 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Acesso Restrito: Admins & Supervisores</span>
        </div>
        {action}
      </div>
    </div>
  )
}
