import { useLocation } from 'react-router-dom'
import {
  ScreenCentralFiscal,
  ScreenDocumentosFiscais,
  ScreenEscrituracaoObrigacoes,
  ScreenReformaTributaria,
  ScreenCertificadosConfiguracoes,
  ScreenComprasEntradas,
  ScreenRelatoriosFiscais,
  ScreenOperacoesCgo,
  ScreenMatrizCfop,
  ScreenSimuladorCfop,
  ScreenCteEmissao,
  ScreenMdfeEmissao,
  ScreenCteMdfeConfiguracao,
} from '@/components/fiscal/screens'

export function Fiscal() {
  const { pathname } = useLocation()

  // 1. Central Fiscal (rota raiz ou /central)
  if (
    pathname === '/admin/fiscal' ||
    pathname === '/admin/fiscal/' ||
    pathname === '/admin/fiscal/central' ||
    pathname === '/admin/fiscal/dashboard'
  ) {
    return <ScreenCentralFiscal />
  }

  // 2. Documentos Fiscais (NF-e emitidas, NF-e de entrada XML, NFC-e, NFS-e, CT-e/MDF-e, CC-e, Inutilização)
  if (
    pathname === '/admin/fiscal/documentos' ||
    pathname.startsWith('/admin/fiscal/documentos/') ||
    pathname === '/admin/fiscal/nfe' ||
    pathname === '/admin/fiscal/nfce' ||
    pathname === '/admin/fiscal/nfse' ||
    pathname === '/admin/fiscal/cte-mdfe' ||
    pathname === '/admin/fiscal/carta-correcao' ||
    pathname === '/admin/fiscal/manifestacao' ||
    pathname === '/admin/fiscal/inutilizacao'
  ) {
    return <ScreenDocumentosFiscais />
  }

  // 3. Escrituração e Obrigações (SPED, Livros Fiscais, Apuração)
  if (
    pathname === '/admin/fiscal/escrituracao' ||
    pathname.startsWith('/admin/fiscal/escrituracao/') ||
    pathname === '/admin/fiscal/sped' ||
    pathname === '/admin/fiscal/livros' ||
    pathname === '/admin/fiscal/apuracao'
  ) {
    return <ScreenEscrituracaoObrigacoes />
  }

  // 4. Reforma Tributária (Visão geral, IBS/CBS, cClassTrib, Transição, Impactos)
  if (
    pathname === '/admin/fiscal/reforma' ||
    pathname.startsWith('/admin/fiscal/reforma/') ||
    pathname === '/admin/fiscal/reforma-dashboard' ||
    pathname === '/admin/fiscal/reforma-simulador' ||
    pathname === '/admin/fiscal/reforma-config' ||
    pathname === '/admin/fiscal/reforma-classificacao' ||
    pathname === '/admin/fiscal/reforma-transicao' ||
    pathname === '/admin/fiscal/reforma-regras' ||
    pathname === '/admin/fiscal/reforma-creditos' ||
    pathname === '/admin/fiscal/reforma-validacao'
  ) {
    return <ScreenReformaTributaria />
  }

  // 5. Certificados e Configurações (Certificado A1, Parâmetros por Empresa, Séries/Numeração)
  if (
    pathname === '/admin/fiscal/certificados-configuracoes' ||
    pathname.startsWith('/admin/fiscal/certificados-configuracoes/') ||
    pathname === '/admin/fiscal/certificados' ||
    pathname === '/admin/fiscal/configuracoes'
  ) {
    return <ScreenCertificadosConfiguracoes />
  }

  // 6. Compras e Entradas (Notas de Compra, Confronto, Pendências de Vinculação)
  if (
    pathname === '/admin/fiscal/compras-entradas' ||
    pathname.startsWith('/admin/fiscal/compras-entradas/') ||
    pathname === '/admin/fiscal/compras' ||
    pathname === '/admin/fiscal/entradas' ||
    pathname === '/admin/fiscal/xml-import'
  ) {
    return <ScreenComprasEntradas />
  }

  // 7. Relatórios Fiscais (Livros e Registros, Comparativos, Exportações)
  if (pathname === '/admin/fiscal/relatorios' || pathname.startsWith('/admin/fiscal/relatorios/')) {
    return <ScreenRelatoriosFiscais />
  }

  // 8. Operações Comerciais & Fiscais (CGO)
  if (pathname === '/admin/fiscal/operacoes' || pathname.startsWith('/admin/fiscal/operacoes/')) {
    return <ScreenOperacoesCgo />
  }

  // 9. Matriz de CFOP
  if (
    pathname === '/admin/fiscal/matriz-cfop' ||
    pathname.startsWith('/admin/fiscal/matriz-cfop/')
  ) {
    return <ScreenMatrizCfop />
  }

  // 10. Simulador de CFOP por Item
  if (
    pathname === '/admin/fiscal/simulador-cfop' ||
    pathname.startsWith('/admin/fiscal/simulador-cfop/')
  ) {
    return <ScreenSimuladorCfop />
  }

  // 11. Emissão de CT-e (Conhecimento de Transporte Eletrônico - Modelo 57)
  if (pathname === '/admin/fiscal/cte' || pathname.startsWith('/admin/fiscal/cte/')) {
    return <ScreenCteEmissao />
  }

  // 12. Emissão de MDF-e (Manifesto Eletrônico de Documentos Fiscais - Modelo 58)
  if (pathname === '/admin/fiscal/mdfe' || pathname.startsWith('/admin/fiscal/mdfe/')) {
    return <ScreenMdfeEmissao />
  }

  // 13. Configuração CT-e/MDF-e (Séries, sequenciais, ANTT, regime de transporte)
  if (
    pathname === '/admin/fiscal/cte-mdfe-configuracao' ||
    pathname.startsWith('/admin/fiscal/cte-mdfe-configuracao/')
  ) {
    return <ScreenCteMdfeConfiguracao />
  }

  // Fallback padrão: Central Fiscal
  return <ScreenCentralFiscal />
}

export default Fiscal
