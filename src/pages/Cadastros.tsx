import { useParams } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { CadastrosPanel } from '@/components/cadastros/cadastros-panel'
import { PerfisPermissoesUnifiedScreen } from '@/components/configuracoes/perfis-permissoes-unified-screen'

// Rotas antigas de Clientes/Fornecedores redirecionam para a base unificada Parceiros
const LEGACY_PARTNER_ROUTES: Record<string, string> = {
  clientes: 'parceiros',
  fornecedores: 'parceiros',
}

// Mapeamento de segmento de URL para a key de cadastro em CADASTROS
const ROUTE_TO_CADASTRO_KEY: Record<string, string> = {
  bancos: 'bancos',
  categorias: 'categorias',
  'centros-custo': 'centros_custo',
  'condicoes-pagamento': 'condicoes_pagamento',
  'contas-bancarias': 'contas_bancarias',
  empresas: 'empresas',
  filiais: 'filiais',
  'formas-pagamento': 'formas_pagamento',
  marcas: 'marcas',
  parceiros: 'parceiros',
  'perfis-permissoes': 'perfis_permissoes',
  'plano-contas': 'plano_contas',
  produtos: 'produtos',
  representantes: 'representantes',
  servicos: 'servicos',
  subcategorias: 'subcategorias',
  'tabelas-precos': 'tabelas_precos',
  transportadoras: 'transportadoras',
  'unidades-medida': 'unidades_medida',
  usuarios: 'usuarios',
  vendedores: 'vendedores',
}

interface CadastrosProps {
  screen?: string
}

export default function Cadastros({ screen }: CadastrosProps) {
  const params = useParams<{ screen?: string }>()
  const resolvedScreen = screen || params.screen || 'empresas'

  if (LEGACY_PARTNER_ROUTES[resolvedScreen]) {
    return <Navigate to="/admin/cadastros/parceiros" replace />
  }

  const cadastroKey = ROUTE_TO_CADASTRO_KEY[resolvedScreen] || resolvedScreen

  if (cadastroKey === 'perfis_permissoes') {
    return (
      <div className="p-4 sm:p-6">
        <PerfisPermissoesUnifiedScreen />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <CadastrosPanel cadastroKey={cadastroKey} />
    </div>
  )
}
