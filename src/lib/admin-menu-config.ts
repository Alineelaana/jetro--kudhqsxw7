import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FileText,
  Tag,
  Users,
  DollarSign,
  Truck,
  Boxes,
  Factory,
  FileCheck,
  HeartPulse,
  BarChart3,
  Bot,
  Settings,
  Bell,
  TrendingUp,
  Layers,
  ShieldCheck,
  Headset,
  UserCog,
  HardHat,
  Percent,
  type LucideIcon,
} from 'lucide-react'
import {
  canViewSales,
  canViewStock,
  canViewConfiguracoes,
  canViewPurchasing,
  canViewFiscal,
  canViewAiModule,
  canManageUsers,
  canManageCms,
  canManageAiTraining,
  canViewAuditLogs,
  canManageBackups,
} from '@/lib/permissions'
import { canViewFinancial } from '@/lib/financial-permissions'
import { canViewLogistics } from '@/lib/logistics-permissions'
import { canViewIndustry } from '@/lib/industrial-permissions'
import { canViewCRM } from '@/lib/crm-permissions'
import { canViewPriceTables } from '@/lib/price-table-permissions'
import { canViewRH } from '@/lib/rh-permissions'

export interface MenuChild {
  label: string
  route: string
}
export interface MenuEntry {
  label: string
  icon: LucideIcon
  route: string
  perm?: (r: string | undefined) => boolean
  children?: MenuChild[]
}
export interface MenuGroup {
  title: string
  items: MenuEntry[]
}

export const ADMIN_MENU: MenuGroup[] = [
  {
    title: 'Principal',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, route: '/admin' },
      { label: 'Notificações', icon: Bell, route: '/admin/notificacoes' },
      { label: 'Atendimento', icon: Headset, route: '/admin/atendimento' },
    ],
  },
  {
    title: 'Comercial',
    items: [
      {
        label: 'Vendas',
        icon: ShoppingCart,
        route: '/admin/vendas',
        perm: canViewSales,
        children: [
          { label: 'Pedidos', route: '/admin/vendas/pedidos' },
          { label: 'Faturamento', route: '/admin/vendas/faturamento' },
          { label: 'NFe', route: '/admin/vendas/nfe' },
          { label: 'Contratos', route: '/admin/vendas/contratos' },
        ],
      },
      { label: 'Produtos', icon: Package, route: '/admin/produtos' },
      { label: 'Cadastros', icon: FileText, route: '/admin/cadastros', perm: canViewConfiguracoes },
      {
        label: 'Tabelas de Preços',
        icon: Tag,
        route: '/admin/tabelas-precos',
        perm: canViewPriceTables,
      },
      { label: 'CRM', icon: Users, route: '/admin/crm', perm: canViewCRM },
      { label: 'Promoções', icon: Percent, route: '/admin/promocoes', perm: canViewSales },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { label: 'Financeiro', icon: DollarSign, route: '/admin/financeiro', perm: canViewFinancial },
    ],
  },
  {
    title: 'Operação',
    items: [
      { label: 'Logística', icon: Truck, route: '/admin/logistica', perm: canViewLogistics },
      { label: 'Estoque', icon: Boxes, route: '/admin/estoque', perm: canViewStock },
      { label: 'Indústria', icon: Factory, route: '/admin/industria', perm: canViewIndustry },
    ],
  },
  {
    title: 'Fiscal & RH',
    items: [
      { label: 'Fiscal', icon: FileCheck, route: '/admin/fiscal', perm: canViewFiscal },
      { label: 'Conformidade', icon: ShieldCheck, route: '/admin/conformidade' },
      { label: 'Recursos Humanos', icon: HeartPulse, route: '/admin/rh', perm: canViewRH },
      { label: 'Departamento Pessoal', icon: UserCog, route: '/admin/dp', perm: canViewRH },
      { label: 'SST', icon: HardHat, route: '/admin/sst', perm: canViewRH },
    ],
  },
  {
    title: 'Inteligência',
    items: [
      { label: 'BI', icon: BarChart3, route: '/admin/bi' },
      {
        label: 'Inteligência Artificial',
        icon: Bot,
        route: '/admin/ia/dashboard',
        perm: canViewAiModule,
      },
      { label: 'Remuneração Variável', icon: TrendingUp, route: '/admin/remuneracao' },
    ],
  },
  {
    title: 'Administração',
    items: [
      {
        label: 'Configurações',
        icon: Settings,
        route: '/admin/configuracoes',
        perm: canViewConfiguracoes,
      },
      { label: 'Phase0 Foundation', icon: Layers, route: '/admin/phase0-foundation' },
      { label: 'Platform Layer', icon: Layers, route: '/admin/platform-layer' },
    ],
  },
]
