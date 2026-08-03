import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { ProductsPanel } from '@/components/products-panel'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Products() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin />
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao painel
          </Link>
        </Button>
      </div>
      <ProductsPanel />
    </div>
  )
}
