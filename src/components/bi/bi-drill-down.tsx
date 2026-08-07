import { Link } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ArrowRight, Search } from 'lucide-react'

interface DrillDownLink {
  label: string
  to: string
}

const DRILL_LINKS: Record<string, DrillDownLink[]> = {
  default: [
    { label: 'Pedidos de Venda', to: '/admin/vendas/pedidos' },
    { label: 'Estoque', to: '/admin/estoque' },
    { label: 'Financeiro', to: '/admin/financeiro' },
    { label: 'Produção', to: '/admin/industria/ordens-producao' },
    { label: 'Compras', to: '/admin/cadastros' },
    { label: 'Logística', to: '/admin/logistica' },
    { label: 'CRM', to: '/admin/crm' },
    { label: 'Auditoria', to: '/admin/configuracoes/logs' },
  ],
  financeiro: [
    { label: 'Contas a Receber', to: '/admin/financeiro/contas-receber' },
    { label: 'Contas a Pagar', to: '/admin/financeiro/contas-pagar' },
    { label: 'Fluxo de Caixa', to: '/admin/financeiro/fluxo-caixa' },
    { label: 'Movimentações', to: '/admin/financeiro/movimentacoes' },
  ],
  comercial: [
    { label: 'Pedidos', to: '/admin/vendas/pedidos' },
    { label: 'Dashboard de Vendas', to: '/admin/vendas' },
    { label: 'CRM', to: '/admin/crm' },
    { label: 'Tabelas de Preço', to: '/admin/tabelas-precos' },
  ],
  industrial: [
    { label: 'Ordens de Produção', to: '/admin/industria/ordens-producao' },
    { label: 'Execução', to: '/admin/industria/execucao' },
    { label: 'Custos', to: '/admin/industria/custos' },
    { label: 'Qualidade', to: '/admin/industria/qualidade' },
  ],
  estoque: [
    { label: 'Dashboard de Estoque', to: '/admin/estoque' },
    { label: 'Movimentações', to: '/admin/estoque/movimentacoes' },
    { label: 'Produtos', to: '/admin/produtos' },
    { label: 'Inventário', to: '/admin/estoque/inventario' },
  ],
  logistica: [
    { label: 'Entregas', to: '/admin/logistica/entregas' },
    { label: 'Rotas', to: '/admin/logistica/rotas' },
    { label: 'Veículos', to: '/admin/logistica/veiculos' },
    { label: 'Fretes', to: '/admin/logistica/fretes' },
  ],
}

function getLinks(target: string | null): DrillDownLink[] {
  if (!target) return DRILL_LINKS.default
  const lower = target.toLowerCase()
  if (
    lower.includes('receb') ||
    lower.includes('pag') ||
    lower.includes('caixa') ||
    lower.includes('finance')
  )
    return [...DRILL_LINKS.financeiro, ...DRILL_LINKS.default]
  if (
    lower.includes('pedid') ||
    lower.includes('venda') ||
    lower.includes('client') ||
    lower.includes('comercial')
  )
    return [...DRILL_LINKS.comercial, ...DRILL_LINKS.default]
  if (
    lower.includes('produ') ||
    lower.includes('ordem') ||
    lower.includes('máquina') ||
    lower.includes('industrial')
  )
    return [...DRILL_LINKS.industrial, ...DRILL_LINKS.default]
  if (lower.includes('estoque') || lower.includes('produto'))
    return [...DRILL_LINKS.estoque, ...DRILL_LINKS.default]
  if (
    lower.includes('entreg') ||
    lower.includes('frete') ||
    lower.includes('rota') ||
    lower.includes('veículo')
  )
    return [...DRILL_LINKS.logistica, ...DRILL_LINKS.default]
  return DRILL_LINKS.default
}

export function BiDrillDown({ target, onClose }: { target: string | null; onClose: () => void }) {
  const links = getLinks(target)
  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#005B2E]" />
            {target ? `Drill-down: ${target}` : 'Drill-down'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-1 py-2">
          <p className="text-xs text-muted-foreground mb-3">
            Navegue até os registros de origem deste indicador:
          </p>
          {links.map((link) => (
            <Button
              key={link.to}
              variant="ghost"
              size="sm"
              asChild
              className="w-full justify-between"
            >
              <Link to={link.to} onClick={onClose}>
                {link.label}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
