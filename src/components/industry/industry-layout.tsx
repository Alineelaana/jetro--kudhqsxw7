import { Outlet } from 'react-router-dom'
import { type ReactNode } from 'react'
import { Factory } from 'lucide-react'
import { AdminBackButton } from '@/components/admin-back-button'

export function IndustryLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <AdminBackButton fallback="/admin" />
        <Factory className="w-7 h-7 text-[#005B2E]" />
        <div>
          <h1 className="text-2xl font-black text-foreground">Industrial</h1>
          <p className="text-sm text-muted-foreground">Módulo Industrial</p>
        </div>
      </div>
      <div className="w-full min-w-0">{children || <Outlet />}</div>
    </div>
  )
}
