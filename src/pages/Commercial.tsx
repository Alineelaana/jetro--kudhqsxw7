import { useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AdminLogin } from '@/components/admin-login'
import { canViewSales } from '@/lib/permissions'
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

import {
  ScreenCentralComercial,
  ScreenClientes,
  ScreenComissoes,
  ScreenContratosDevolucoes,
  ScreenCRM,
  ScreenCotacoes,
  ScreenPedidosFaturamento,
  ScreenRelatoriosComerciais,
  ScreenRemuneracaoVariavel,
  ScreenTabelasPreco,
} from '@/components/commercial/screens'

export function Commercial() {
  const { pathname } = useLocation()
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) return <AdminLogin />

  if (!canViewSales(user?.role)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground">Acesso negado</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Você não tem permissão para acessar o módulo Comercial.
        </p>
        <Button variant="ghost" asChild className="mt-4 text-[#005B2E]">
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao painel
          </Link>
        </Button>
      </div>
    )
  }

  // 1. Central Comercial (rota raiz ou /central)
  if (
    pathname === '/admin/comercial' ||
    pathname === '/admin/comercial/' ||
    pathname === '/admin/comercial/central' ||
    pathname === '/admin/comercial/dashboard'
  ) {
    return <ScreenCentralComercial />
  }

  // 2. Clientes
  if (
    pathname === '/admin/comercial/clientes' ||
    pathname.startsWith('/admin/comercial/clientes/')
  ) {
    return <ScreenClientes />
  }

  // 3. Comissões
  if (
    pathname === '/admin/comercial/comissoes' ||
    pathname.startsWith('/admin/comercial/comissoes/')
  ) {
    return <ScreenComissoes />
  }

  // 4. Contratos e Devoluções
  if (
    pathname === '/admin/comercial/contratos-devolucoes' ||
    pathname.startsWith('/admin/comercial/contratos-devolucoes/') ||
    pathname === '/admin/comercial/contratos' ||
    pathname === '/admin/comercial/devolucoes'
  ) {
    return <ScreenContratosDevolucoes />
  }

  // 5. CRM
  if (pathname === '/admin/comercial/crm' || pathname.startsWith('/admin/comercial/crm/')) {
    return <ScreenCRM />
  }

  // 6. Cotações e Cotador
  if (
    pathname === '/admin/comercial/cotacoes-cotador' ||
    pathname.startsWith('/admin/comercial/cotacoes-cotador/') ||
    pathname === '/admin/comercial/cotacoes' ||
    pathname === '/admin/comercial/cotador'
  ) {
    return <ScreenCotacoes />
  }

  // 7. Pedidos e Faturamento
  if (
    pathname === '/admin/comercial/pedidos-faturamento' ||
    pathname.startsWith('/admin/comercial/pedidos-faturamento/') ||
    pathname === '/admin/comercial/pedidos' ||
    pathname === '/admin/comercial/faturamento' ||
    pathname === '/admin/comercial/orcamentos'
  ) {
    return <ScreenPedidosFaturamento />
  }

  // 8. Relatórios Comerciais
  if (
    pathname === '/admin/comercial/relatorios' ||
    pathname.startsWith('/admin/comercial/relatorios/') ||
    pathname === '/admin/comercial/relatorios-comerciais'
  ) {
    return <ScreenRelatoriosComerciais />
  }

  // 9. Remuneração Variável
  if (
    pathname === '/admin/comercial/remuneracao-variavel' ||
    pathname.startsWith('/admin/comercial/remuneracao-variavel/') ||
    pathname === '/admin/comercial/remuneracao' ||
    pathname === '/admin/comercial/metas'
  ) {
    return <ScreenRemuneracaoVariavel />
  }

  // 10. Tabelas de Preço e Descontos
  if (
    pathname === '/admin/comercial/tabelas-preco-descontos' ||
    pathname.startsWith('/admin/comercial/tabelas-preco-descontos/') ||
    pathname === '/admin/comercial/tabelas-preco' ||
    pathname === '/admin/comercial/descontos'
  ) {
    return <ScreenTabelasPreco />
  }

  // Fallback padrão: Central Comercial
  return <ScreenCentralComercial />
}

export default Commercial
