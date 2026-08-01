import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationControlsProps {
  totalRecords: number
  pageSize: number
  currentPage: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function PaginationControls({
  totalRecords,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(totalRecords / pageSize))
  const startIdx = totalRecords === 0 ? 0 : (currentPage - 1) * (pageSize || totalRecords) + 1
  const endIdx = pageSize === 0 ? totalRecords : Math.min(currentPage * pageSize, totalRecords)

  const pages: (number | string)[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('…')
    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('…')
    pages.push(totalPages)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border bg-white">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="whitespace-nowrap">
          {totalRecords > 0 ? `${startIdx}–${endIdx} de ${totalRecords}` : 'Nenhum registro'}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs whitespace-nowrap">Por página:</span>
          <Select
            value={pageSize === 0 ? 'all' : String(pageSize)}
            onValueChange={(v) => onPageSizeChange(v === 'all' ? 0 : Number(v))}
          >
            <SelectTrigger className="w-[85px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="30">30</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {pages.map((p, idx) =>
            typeof p === 'number' ? (
              <Button
                key={idx}
                variant={p === currentPage ? 'default' : 'outline'}
                size="icon"
                className={cn(
                  'h-8 w-8 text-xs',
                  p === currentPage && 'bg-[#005B2E] hover:bg-[#01361D]',
                )}
                onClick={() => onPageChange(p)}
              >
                {p}
              </Button>
            ) : (
              <span key={idx} className="px-1 text-muted-foreground text-sm">
                {p}
              </span>
            ),
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
