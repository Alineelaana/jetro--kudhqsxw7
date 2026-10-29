import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useB2B } from '@/lib/b2b/b2b-context'
import {
  ShoppingBag,
  Package,
  User,
  LogOut,
  Building2,
  CreditCard,
  ShoppingCart,
  Menu,
  X,
  FileCheck2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const B2BPortalLayout: React.FC = () => {
  const { client, partner, logout, cartCount } = useB2B()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  // Se não autenticado e não está em telas públicas, redireciona
  React.useEffect(() => {
    if (!client && !location.pathname.includes('/portal/login') && !location.pathname.includes('/portal/cadastro')) {
      // Deixar a rota protegida tratar ou redirecionar
    }
  }, [client, location.pathname])

  const navItems = [
    { label: 'Catálogo de Produtos', path: '/portal/catalogo', icon: ShoppingBag },
    { label: 'Meus Pedidos', path: '/portal/pedidos', icon: Package },
    { label: 'Dados da Empresa', path: '/portal/perfil', icon: User },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar Corporativa */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Marca */}
            <div className="flex items-center gap-3">
              <Link to="/portal/catalogo" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  H
                </div>
                <div>
                  <span className="font-bold text-slate-900 tracking-tight text-lg">HURAM</span>
                  <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    PORTAL B2B
                  </span>
                </div>
              </Link>
            </div>

            {/* Links Centrais (Desktop) */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Informações da Conta e Carrinho */}
            <div className="flex items-center gap-3">
              {/* Botão Carrinho */}
              <Link to="/portal/carrinho">
                <Button variant="outline" size="sm" className="relative gap-2 border-slate-300">
                  <ShoppingCart className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline font-medium">Carrinho</span>
                  {cartCount > 0 && (
                    <Badge className="bg-indigo-600 text-white hover:bg-indigo-700 px-1.5 py-0.2 text-xs">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Informações do Cliente */}
              {client && (
                <div className="hidden lg:flex flex-col text-right text-xs">
                  <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                    {client.company_name || client.name}
                  </span>
                  <span className="text-slate-500 font-mono">
                    CNPJ: {client.cnpj || 'Cadastrado'}
                  </span>
                </div>
              )}

              {/* Botão Logout */}
              {client && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                  title="Sair do Portal"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Banner Condicional de Limite de Crédito (DECISÃO 3: só exibe se exibir_limite_credito === true) */}
        {partner && partner.exibir_limite_credito && (
          <div className="bg-emerald-50 border-t border-emerald-200 px-4 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-xs sm:text-sm text-emerald-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">
                  Limite de Crédito Disponível:{' '}
                  <strong className="text-emerald-950 font-semibold">
                    {partner.limite_credito_disponivel
                      ? `R$ ${partner.limite_credito_disponivel}`
                      : partner.limite_credito
                      ? `R$ ${partner.limite_credito}`
                      : 'R$ 0,00'}
                  </strong>
                </span>
                {partner.limite_credito && (
                  <span className="text-emerald-600 text-xs hidden md:inline">
                    (Limite Total: R$ {partner.limite_credito})
                  </span>
                )}
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                Crédito Aprovado
              </span>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
            {client && (
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 font-medium px-3">Logado como</p>
                <p className="text-sm font-semibold text-slate-800 px-3 truncate">
                  {client.company_name}
                </p>
                <button
                  onClick={logout}
                  className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-md text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sair do Portal B2B
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Rodapé B2B */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>HURAM ERP • Portal de Autosserviço B2B para Clientes e Parceiros</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              Pedidos integrados à Central de Aprovações
            </span>
            <span>Versão Portal 1.0</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
