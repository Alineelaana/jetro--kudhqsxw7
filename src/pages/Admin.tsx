import { Component, type ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { AdminDashboard } from '@/components/admin-dashboard'
import { Loader2, RefreshCw, LogOut } from 'lucide-react'

class AdminDashboardErrorBoundary extends Component<
  { children: ReactNode; onSignOut: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error): void {
    console.error('AdminDashboard error:', error)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-muted-foreground">Erro ao carregar o dashboard.</p>
          <div className="flex gap-2">
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-[#005B2E] text-white rounded-lg font-bold hover:bg-[#01361D] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
            <button
              onClick={this.props.onSignOut}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-600 rounded-lg font-bold hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function Admin() {
  const { isAuthenticated, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <AdminDashboardErrorBoundary onSignOut={signOut}>
      <AdminDashboard />
    </AdminDashboardErrorBoundary>
  )
}
