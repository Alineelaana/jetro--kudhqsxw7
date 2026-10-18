import { useParams } from 'react-router-dom'
import { CadastrosPanel } from '@/components/cadastros/cadastros-panel'

// Mapeamento de segmento de URL para a key de cadastro em CADASTROS
const ROUTE_TO_CADASTRO_KEY: Record<string, string> = {
  bancos: 'bancos',
  categorias: 'categorias',
  'centros-custo': 'centros_custo',
  clientes: 'clientes',
  'condicoes-pagamento': 'condicoes_pagamento',
  'contas-bancarias': 'contas_bancarias',
  empresas: 'empresas',
  filiais: 'filiais',
  'formas-pagamento': 'formas_pagamento',
  fornecedores: 'fornecedores',
  marcas: 'marcas',
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
  const cadastroKey = ROUTE_TO_CADASTRO_KEY[resolvedScreen] || resolvedScreen

  return (
    <div className="p-4 sm:p-6">
      <CadastrosPanel cadastroKey={cadastroKey} />
    </div>
  )
}
