export const PARAMETER_MODULES = [
  'Cadastros',
  'Compras',
  'Vendas',
  'Estoque',
  'WMS',
  'Financeiro',
  'Fiscal',
  'Contábil',
  'RH',
  'CRM',
  'Logística',
  'Produção',
  'Relatórios',
  'BI e Indicadores',
]

export const INTEGRATION_TYPES = [
  'Bancos',
  'Gateways de Pagamento',
  'Boletos',
  'PIX',
  'ReceitaWS',
  'SEFAZ',
  'Prefeituras',
  'Transportadoras',
  'WhatsApp',
  'E-mail',
  'Marketplaces',
  'E-commerce',
  'ERPs Externos',
  'Contabilidade',
  'Plataformas de CRM',
  'Plataformas de Assinatura',
  'Serviços de Mapas',
  'Sistemas de Rastreamento',
  'Outros',
]

export const INTEGRATION_STATUSES = ['ativa', 'inativa', 'em_configuracao', 'com_erro', 'bloqueada']
export const API_STATUSES = ['ativa', 'inativa', 'expirada', 'revogada', 'bloqueada']
export const IMPORT_EXPORT_ENTITIES = [
  'Clientes',
  'Fornecedores',
  'Produtos',
  'Serviços',
  'Preços',
  'Estoque',
  'Vendedores',
  'Tabelas de preços',
  'Centros de custos',
  'Plano de contas',
  'Contas a pagar',
  'Contas a receber',
  'Outros',
]
export const IMPORT_EXPORT_FORMATS = ['excel', 'csv', 'pdf', 'xml']
export const NUMERATION_TYPES = [
  'clientes',
  'fornecedores',
  'produtos',
  'pedidos_venda',
  'pedidos_compra',
  'ordens_producao',
  'titulos_financeiros',
  'contratos',
  'propostas',
  'romaneios',
  'entregas',
  'chamados',
  'outros',
]
export const PERMISSION_ACTIONS = [
  'Visualizar',
  'Criar',
  'Editar',
  'Excluir',
  'Aprovar',
  'Reprovar',
  'Cancelar',
  'Estornar',
  'Exportar',
  'Imprimir',
  'Consultar custos',
  'Consultar margens',
  'Consultar dados financeiros',
  'Consultar dados fiscais',
  'Consultar dados salariais',
  'Alterar configurações',
]
export const CONFIG_SCREENS = [
  { key: 'dados-empresa', path: '/admin/configuracoes/dados-empresa', label: 'Dados da Empresa' },
  { key: 'parametros', path: '/admin/configuracoes/parametros', label: 'Parâmetros do Sistema' },
  { key: 'permissoes', path: '/admin/configuracoes/permissoes', label: 'Permissões' },
  { key: 'logs', path: '/admin/configuracoes/logs', label: 'Logs' },
  { key: 'integracoes', path: '/admin/configuracoes/integracoes', label: 'Integrações' },
  { key: 'apis', path: '/admin/configuracoes/apis', label: 'APIs' },
  {
    key: 'importacao-exportacao',
    path: '/admin/configuracoes/importacao-exportacao',
    label: 'Importação e Exportação',
  },
  { key: 'modelos-email', path: '/admin/configuracoes/modelos-email', label: 'Modelos de E-mail' },
  {
    key: 'modelos-documentos',
    path: '/admin/configuracoes/modelos-documentos',
    label: 'Modelos de Documentos',
  },
  { key: 'notificacoes', path: '/admin/configuracoes/notificacoes', label: 'Notificações' },
  { key: 'numeracoes', path: '/admin/configuracoes/numeracoes', label: 'Numerações' },
  { key: 'seguranca', path: '/admin/configuracoes/seguranca', label: 'Segurança' },
  { key: 'backup', path: '/admin/configuracoes/backup', label: 'Backup e Restauração' },
]

export interface ConfigField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'email'
  required?: boolean
  options?: string[]
  span?: 1 | 2
}
export interface ConfigCrudConfig {
  collection: string
  title: string
  nameField: string
  fields: ConfigField[]
  statusField?: string
}

export const EMAIL_TEMPLATE_CONFIG: ConfigCrudConfig = {
  collection: 'email_templates',
  title: 'Modelo de E-mail',
  nameField: 'name',
  fields: [
    { name: 'name', label: 'Nome do Modelo', type: 'text', required: true },
    {
      name: 'category',
      label: 'Categoria',
      type: 'select',
      required: true,
      options: [
        'pedido_venda',
        'pedido_compra',
        'proposta',
        'boleto',
        'pix',
        'cobranca',
        'nota_fiscal',
        'contrato',
        'entrega',
        'aprovacao',
        'rh',
        'suporte',
        'outros',
      ],
    },
    { name: 'subject', label: 'Assunto', type: 'text', span: 2 },
    { name: 'sender', label: 'Remetente', type: 'email' },
    { name: 'company', label: 'Empresa', type: 'text' },
    { name: 'body', label: 'Corpo do E-mail', type: 'textarea', span: 2 },
    { name: 'signature', label: 'Assinatura', type: 'textarea', span: 2 },
    { name: 'default_attachments', label: 'Anexos Padrão', type: 'text' },
    { name: 'branch', label: 'Filial', type: 'text' },
  ],
}
export const DOC_TEMPLATE_CONFIG: ConfigCrudConfig = {
  collection: 'document_templates',
  title: 'Modelo de Documento',
  nameField: 'name',
  fields: [
    { name: 'name', label: 'Nome do Modelo', type: 'text', required: true },
    {
      name: 'category',
      label: 'Categoria',
      type: 'select',
      required: true,
      options: [
        'propostas',
        'pedidos',
        'contratos',
        'recibos',
        'orcamentos',
        'relatorios',
        'declaracoes',
        'termos',
        'avisos',
        'rh',
        'romaneios',
        'etiquetas',
        'outros',
      ],
    },
    { name: 'company', label: 'Empresa', type: 'text' },
    { name: 'branch', label: 'Filial', type: 'text' },
    { name: 'header', label: 'Cabeçalho', type: 'textarea', span: 2 },
    { name: 'body', label: 'Corpo', type: 'textarea', span: 2 },
    { name: 'footer', label: 'Rodapé', type: 'textarea', span: 2 },
    { name: 'orientation', label: 'Orientação', type: 'select', options: ['retrato', 'paisagem'] },
    {
      name: 'paper_size',
      label: 'Tamanho do Papel',
      type: 'select',
      options: ['a4', 'a3', 'carta', 'oficio'],
    },
    { name: 'page_numbering', label: 'Numeração de Páginas', type: 'boolean' },
    { name: 'is_default', label: 'Definir como Padrão', type: 'boolean' },
  ],
}
export const NOTIFICATION_CONFIG: ConfigCrudConfig = {
  collection: 'notification_configs',
  title: 'Notificação',
  nameField: 'event',
  fields: [
    {
      name: 'event',
      label: 'Evento',
      type: 'select',
      required: true,
      options: [
        'approval_pending',
        'account_due',
        'stock_low',
        'document_expiring',
        'order_delayed',
        'delivery_delayed',
        'negative_margin',
        'integration_error',
        'certificate_expiring',
        'processing_failure',
        'other',
      ],
    },
    { name: 'module', label: 'Módulo', type: 'text' },
    {
      name: 'recipient_type',
      label: 'Tipo Destinatário',
      type: 'select',
      options: ['user', 'profile'],
    },
    { name: 'recipient_profile', label: 'Perfil Destinatário', type: 'text' },
    {
      name: 'channel',
      label: 'Canal',
      type: 'select',
      required: true,
      options: ['internal', 'email', 'whatsapp', 'dashboard'],
    },
    {
      name: 'frequency',
      label: 'Frequência',
      type: 'select',
      options: ['immediate', 'hourly', 'daily', 'weekly'],
    },
    { name: 'company', label: 'Empresa', type: 'text' },
    { name: 'branch', label: 'Filial', type: 'text' },
  ],
}
export const NUMERATION_CONFIG: ConfigCrudConfig = {
  collection: 'numerations',
  title: 'Numeração',
  nameField: 'document_type',
  fields: [
    {
      name: 'document_type',
      label: 'Documento',
      type: 'select',
      required: true,
      options: NUMERATION_TYPES,
    },
    { name: 'company', label: 'Empresa', type: 'text' },
    { name: 'branch', label: 'Filial', type: 'text' },
    { name: 'prefix', label: 'Prefixo', type: 'text' },
    { name: 'next_number', label: 'Próximo Número', type: 'number', required: true },
    { name: 'digit_count', label: 'Qtd. Dígitos', type: 'number' },
    { name: 'annual_reset', label: 'Reinício Anual', type: 'boolean' },
  ],
}

export const PERMISSOES_CONFIG: ConfigCrudConfig = {
  collection: 'perfis_permissoes',
  title: 'Perfil de Permissão',
  nameField: 'name',
  fields: [
    { name: 'name', label: 'Nome do Perfil', type: 'text', required: true },
    { name: 'code', label: 'Código', type: 'text', required: true },
    { name: 'description', label: 'Descrição', type: 'textarea', span: 2 },
    { name: 'permissions', label: 'Permissões (JSON)', type: 'textarea', span: 2 },
  ],
}

export const INTEGRATIONS_CONFIG: ConfigCrudConfig = {
  collection: 'integrations',
  title: 'Integração',
  nameField: 'name',
  fields: [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    { name: 'type', label: 'Tipo', type: 'text' },
    {
      name: 'environment',
      label: 'Ambiente',
      type: 'select',
      options: ['producao', 'homologacao', 'sandbox'],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: INTEGRATION_STATUSES,
    },
    { name: 'company', label: 'Empresa', type: 'text' },
    { name: 'branch', label: 'Filial', type: 'text' },
    { name: 'responsible', label: 'Responsável', type: 'text' },
    { name: 'observations', label: 'Observações', type: 'textarea', span: 2 },
    { name: 'credentials', label: 'Credenciais (JSON)', type: 'textarea', span: 2 },
  ],
}
