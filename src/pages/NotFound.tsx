import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Truck } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-white px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center">
            <Truck className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-bold text-foreground">Página não encontrada</h2>
        <p className="text-muted-foreground">A página que você procura não existe ou foi movida.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
            <Link to="/">Acessar o sistema</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
