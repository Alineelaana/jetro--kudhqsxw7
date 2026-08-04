import { FiscalLayout } from '@/components/fiscal/fiscal-layout'
import { FiscalDashboard } from '@/components/fiscal/fiscal-dashboard'
import { NfsePanel } from '@/components/fiscal/nfse-panel'
import { CtePanel, MdfePanel } from '@/components/fiscal/cte-mdfe-panel'
import { ApuracaoPanel } from '@/components/fiscal/apuracao-panel'
import { ReformaDashboard } from '@/components/fiscal/reforma-dashboard'
import { ReformaSimulador } from '@/components/fiscal/reforma-simulador'
import { FiscalGenericScreen } from '@/components/fiscal/fiscal-generic-screen'
import { CartaCorrecao } from '@/components/fiscal/carta-correcao'
import { ManifestacaoDestinatario } from '@/components/fiscal/manifestacao'
import { DocumentosFiscais } from '@/components/fiscal/documentos-fiscais'
import { RelatoriosFiscais } from '@/components/fiscal/relatorios-fiscais'
import { NfePanel } from '@/components/sales/nfe-panel'
import { NfcePanel } from '@/components/sales/nfce-panel'
import { PurchaseInvoicesPanel } from '@/components/purchasing/purchase-invoices-panel'
import {
  REFORM_CONFIG_FIELDS,
  CERTIFICATE_FIELDS,
  INUT_FIELDS,
  type FiscalScreenConfig,
} from '@/lib/fiscal-types'

const SPED_CONFIG: FiscalScreenConfig = {
  collection: 'sped_records',
  title: 'SPED',
  nameLabel: 'Período',
  statusField: 'status',
  statusOptions: ['Gerado', 'Validado', 'Inconsistente', 'Corrigido', 'Transmitido', 'Retificado'],
  fields: [
    { name: 'periodo', label: 'Período', type: 'text', required: true },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: ['EFD_ICMS_IPI', 'EFD_Contribuicoes', 'ECD', 'ECF', 'Reinf', 'Outros'],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['Gerado', 'Validado', 'Inconsistente', 'Corrigido', 'Transmitido', 'Retificado'],
    },
    { name: 'recibo', label: 'Recibo', type: 'text' },
    { name: 'data_transmissao', label: 'Data Transmissão', type: 'date' },
    { name: 'versao', label: 'Versão', type: 'text' },
  ],
}

const LIVROS_CONFIG: FiscalScreenConfig = {
  collection: 'fiscal_books',
  title: 'Livro Fiscal',
  nameLabel: 'Período',
  statusField: 'tipo_livro',
  fields: [
    { name: 'periodo', label: 'Período', type: 'text', required: true },
    {
      name: 'tipo_livro',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: [
        'Entradas',
        'Saidas',
        'Apuracao_ICMS',
        'Apuracao_IPI',
        'Servicos_Prestados',
        'Servicos_Tomados',
        'CBS',
        'IBS',
        'Imposto_Seletivo',
        'Outros',
      ],
    },
    { name: 'total_debitos', label: 'Total Débitos', type: 'text' },
    { name: 'total_creditos', label: 'Total Créditos', type: 'text' },
    { name: 'saldo', label: 'Saldo', type: 'text' },
  ],
}

const REFORM_CONFIG_SCREEN: FiscalScreenConfig = {
  collection: 'reform_configs',
  title: 'Configuração CBS/IBS/Seletivo',
  nameLabel: 'Tributo',
  statusField: 'situacao',
  fields: REFORM_CONFIG_FIELDS,
}

const CERT_SCREEN: FiscalScreenConfig = {
  collection: 'fiscal_certificates',
  title: 'Certificado Digital',
  nameLabel: 'Titular',
  statusField: 'situacao',
  fields: CERTIFICATE_FIELDS,
}

const INUT_SCREEN: FiscalScreenConfig = {
  collection: 'fiscal_inutilizations',
  title: 'Inutilização',
  nameLabel: 'Tipo Doc',
  statusField: 'status',
  fields: INUT_FIELDS,
}

const CLASS_SCREEN: FiscalScreenConfig = {
  collection: 'reform_classifications',
  title: 'Classificação Tributária',
  nameLabel: 'Produto/Serviço',
  statusField: 'situacao',
  fields: [
    { name: 'produto_name', label: 'Produto', type: 'text' },
    { name: 'servico_name', label: 'Serviço', type: 'text' },
    { name: 'codigo', label: 'Código', type: 'text' },
    { name: 'ncm', label: 'NCM', type: 'text' },
    { name: 'cest', label: 'CEST', type: 'text' },
    { name: 'classificacao_atual', label: 'Classificação Atual', type: 'text' },
    { name: 'classificacao_reforma', label: 'Classificação Reforma', type: 'text' },
    { name: 'cbs', label: 'CBS (%)', type: 'text' },
    { name: 'ibs', label: 'IBS (%)', type: 'text' },
    { name: 'imposto_seletivo', label: 'Imposto Seletivo (%)', type: 'text' },
    { name: 'regime_aplicavel', label: 'Regime', type: 'text' },
    { name: 'data_vigencia', label: 'Data Vigência', type: 'date' },
    {
      name: 'situacao',
      label: 'Situação',
      type: 'select',
      options: [
        'Nao Classificado',
        'Em Analise',
        'Classificado',
        'Aguardando Aprovacao',
        'Com Pendencia',
        'Inativo',
      ],
    },
  ],
}

const RULES_SCREEN: FiscalScreenConfig = {
  collection: 'reform_rules',
  title: 'Regras Tributárias',
  nameLabel: 'Regra',
  statusField: 'situacao',
  fields: [
    {
      name: 'tipo_regra',
      label: 'Tipo',
      type: 'select',
      required: true,
      options: ['produto', 'servico', 'operacao', 'cliente', 'fornecedor'],
    },
    { name: 'ref_name', label: 'Referência', type: 'text' },
    { name: 'operacao', label: 'Operação', type: 'text' },
    { name: 'tributacao_padrao', label: 'Tributação Padrão', type: 'text' },
    { name: 'aliquota', label: 'Alíquota', type: 'text' },
    { name: 'reducao', label: 'Redução', type: 'text' },
    { name: 'credito', label: 'Crédito', type: 'text' },
    { name: 'imposto_seletivo', label: 'Imposto Seletivo', type: 'text' },
    { name: 'vigencia_inicial', label: 'Vigência Inicial', type: 'date' },
    { name: 'vigencia_final', label: 'Vigência Final', type: 'date' },
    { name: 'situacao', label: 'Situação', type: 'select', options: ['Ativa', 'Inativa'] },
  ],
}

const TRANSITION_SCREEN: FiscalScreenConfig = {
  collection: 'reform_transition',
  title: 'Transição Tributária',
  nameLabel: 'Ano/Período',
  fields: [
    { name: 'ano', label: 'Ano', type: 'text', required: true },
    { name: 'periodo', label: 'Período', type: 'text' },
    { name: 'tributos_atuais', label: 'Tributos Atuais', type: 'textarea', span: 2 },
    { name: 'cbs_aplicavel', label: 'CBS Aplicável', type: 'text' },
    { name: 'ibs_aplicavel', label: 'IBS Aplicável', type: 'text' },
    { name: 'imposto_seletivo_aplicavel', label: 'Imposto Seletivo', type: 'text' },
    { name: 'regra_convivencia', label: 'Regra de Convivência', type: 'textarea', span: 2 },
    { name: 'data_inicial', label: 'Data Inicial', type: 'date' },
    { name: 'data_final', label: 'Data Final', type: 'date' },
  ],
}

const CREDITS_SCREEN: FiscalScreenConfig = {
  collection: 'reform_credits',
  title: 'Créditos e Débitos',
  nameLabel: 'Documento',
  statusField: 'situacao',
  fields: [
    { name: 'documento', label: 'Documento', type: 'text', required: true },
    { name: 'cliente_fornecedor', label: 'Cliente/Fornecedor', type: 'text' },
    { name: 'tipo_operacao', label: 'Tipo Operação', type: 'text' },
    { name: 'cbs', label: 'CBS', type: 'text' },
    { name: 'ibs', label: 'IBS', type: 'text' },
    { name: 'imposto_seletivo', label: 'Imposto Seletivo', type: 'text' },
    { name: 'credito_permitido', label: 'Crédito Permitido', type: 'text' },
    { name: 'credito_utilizado', label: 'Crédito Utilizado', type: 'text' },
    { name: 'debito_gerado', label: 'Débito Gerado', type: 'text' },
    { name: 'saldo', label: 'Saldo', type: 'text' },
    {
      name: 'situacao',
      label: 'Situação',
      type: 'select',
      options: ['Disponivel', 'Utilizado', 'Bloqueado', 'Compensado'],
    },
  ],
}

const VAL_SCREEN: FiscalScreenConfig = {
  collection: 'reform_validations',
  title: 'Validação de Documentos',
  nameLabel: 'Documento',
  statusField: 'status',
  fields: [
    { name: 'documento_numero', label: 'Número Documento', type: 'text', required: true },
    { name: 'documento_tipo', label: 'Tipo', type: 'text' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: ['Validado', 'Com Alerta', 'Com Erro', 'Aguardando Correcao', 'Corrigido'],
    },
  ],
}

const FISCAL_CONFIG_SCREEN: FiscalScreenConfig = {
  collection: 'fiscal_configurations',
  title: 'Configuração Fiscal',
  nameLabel: 'Empresa',
  fields: [
    { name: 'company', label: 'Empresa', type: 'text', required: true },
    { name: 'regime_tributario', label: 'Regime Tributário', type: 'text' },
    { name: 'crt', label: 'CRT', type: 'text' },
    { name: 'inscricao_estadual', label: 'Insc. Estadual', type: 'text' },
    { name: 'inscricao_municipal', label: 'Insc. Municipal', type: 'text' },
    { name: 'ambiente', label: 'Ambiente', type: 'select', options: ['homologacao', 'producao'] },
    { name: 'serie_nfe', label: 'Série NF-e', type: 'text' },
    { name: 'serie_nfce', label: 'Série NFC-e', type: 'text' },
    { name: 'vigencia_inicial', label: 'Vigência Inicial', type: 'date' },
  ],
}

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard Fiscal',
  entrada: 'Entrada de Notas',
  nfe: 'Emissão de NF-e',
  nfse: 'Emissão de NFS-e',
  nfce: 'NFC-e',
  cte: 'CT-e',
  mdfe: 'MDF-e',
  apuracao: 'Apuração de Impostos',
  reforma_dashboard: 'Dashboard da Reforma',
  reforma_cbs_ibs: 'Configuração CBS/IBS',
  reforma_seletivo: 'Configuração Imposto Seletivo',
  reforma_classificacao: 'Classificação Tributária',
  reforma_regras: 'Regras Tributárias',
  reforma_transicao: 'Transição Tributária',
  reforma_creditos: 'Créditos e Débitos',
  reforma_simulador: 'Simulador Tributário',
  reforma_validacao: 'Validação de Documentos',
  sped: 'SPED',
  livros: 'Livros Fiscais',
  correcao: 'Carta de Correção',
  manifestacao: 'Manifestação do Destinatário',
  documentos: 'Documentos Fiscais',
  inutilizacao: 'Inutilização de Numeração',
  certificados: 'Certificados Digitais',
  configuracoes: 'Configurações Fiscais',
  relatorios: 'Relatórios Fiscais',
}

export default function Fiscal({ screen = 'dashboard' }: { screen?: string }) {
  const title = TITLES[screen] || 'Fiscal'
  return (
    <FiscalLayout title={title}>
      {screen === 'dashboard' && <FiscalDashboard />}
      {screen === 'entrada' && <PurchaseInvoicesPanel />}
      {screen === 'nfe' && <NfePanel />}
      {screen === 'nfse' && <NfsePanel />}
      {screen === 'nfce' && <NfcePanel />}
      {screen === 'cte' && <CtePanel />}
      {screen === 'mdfe' && <MdfePanel />}
      {screen === 'apuracao' && <ApuracaoPanel />}
      {screen === 'reforma_dashboard' && <ReformaDashboard />}
      {screen === 'reforma_cbs_ibs' && <FiscalGenericScreen config={REFORM_CONFIG_SCREEN} />}
      {screen === 'reforma_seletivo' && <FiscalGenericScreen config={REFORM_CONFIG_SCREEN} />}
      {screen === 'reforma_classificacao' && <FiscalGenericScreen config={CLASS_SCREEN} />}
      {screen === 'reforma_regras' && <FiscalGenericScreen config={RULES_SCREEN} />}
      {screen === 'reforma_transicao' && <FiscalGenericScreen config={TRANSITION_SCREEN} />}
      {screen === 'reforma_creditos' && <FiscalGenericScreen config={CREDITS_SCREEN} />}
      {screen === 'reforma_simulador' && <ReformaSimulador />}
      {screen === 'reforma_validacao' && <FiscalGenericScreen config={VAL_SCREEN} />}
      {screen === 'sped' && <FiscalGenericScreen config={SPED_CONFIG} />}
      {screen === 'livros' && <FiscalGenericScreen config={LIVROS_CONFIG} />}
      {screen === 'correcao' && <CartaCorrecao />}
      {screen === 'manifestacao' && <ManifestacaoDestinatario />}
      {screen === 'documentos' && <DocumentosFiscais />}
      {screen === 'inutilizacao' && <FiscalGenericScreen config={INUT_SCREEN} />}
      {screen === 'certificados' && <FiscalGenericScreen config={CERT_SCREEN} />}
      {screen === 'configuracoes' && <FiscalGenericScreen config={FISCAL_CONFIG_SCREEN} />}
      {screen === 'relatorios' && <RelatoriosFiscais />}
    </FiscalLayout>
  )
}
