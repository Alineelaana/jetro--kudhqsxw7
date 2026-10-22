export const EMPLOYEE_STATUS = [
  'Ativo',
  'Em Experiência',
  'Afastado',
  'Em Férias',
  'Desligado',
  'Inativo',
] as const
export const CONTRACT_TYPES = [
  'CLT',
  'Estágio',
  'Aprendiz',
  'Temporário',
  'Prestador de Serviço',
  'Outro',
] as const
export const TIME_RECORD_STATUS = [
  'Pendente',
  'Em Conferência',
  'Aprovado',
  'Com Divergência',
  'Fechado',
] as const
export const VACATION_STATUS = [
  'Disponível',
  'Programada',
  'Aguardando Aprovação',
  'Aprovada',
  'Em Andamento',
  'Concluída',
  'Cancelada',
  'Vencida',
] as const
export const PAYROLL_STATUS = [
  'Em Preparação',
  'Em Processamento',
  'Aguardando Conferência',
  'Aguardando Aprovação',
  'Fechada',
  'Paga',
  'Reaberta',
  'Cancelada',
] as const
export const PAYROLL_TYPES = [
  'Mensal',
  'Adiantamento',
  'Décimo Terceiro',
  'Férias',
  'Rescisão',
  'Complementar',
] as const
export const BENEFIT_TYPES = [
  'Vale Transporte',
  'Vale Alimentação',
  'Vale Refeição',
  'Plano de Saúde',
  'Plano Odontológico',
  'Seguro de Vida',
  'Auxílio Combustível',
  'Auxílio Educação',
  'Outros',
] as const
export const TRAINING_STATUS = [
  'Planejado',
  'Inscrições Abertas',
  'Em Andamento',
  'Concluído',
  'Cancelado',
] as const
export const TRAINING_MODALITIES = [
  'Presencial',
  'Online',
  'Híbrido',
  'Interno',
  'Externo',
] as const
export const DOCUMENT_CATEGORIES = [
  'Contrato de Trabalho',
  'Documentos Pessoais',
  'Atestados',
  'Exames',
  'Avisos de Férias',
  'Recibos',
  'Holerites',
  'Certificados',
  'Advertências',
  'Termos',
  'Documentos de Desligamento',
  'Outros',
] as const
export const APPROVAL_STATUS = ['Pendente', 'Aprovado', 'Reprovado'] as const
export const PAYROLL_EVENT_TYPES = [
  'Provento',
  'Desconto',
  'Encargo',
  'Base de cálculo',
  'Informativo',
] as const

export interface RhFieldDef {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  required?: boolean
  options?: readonly string[]
  span?: 1 | 2
}

export interface RhScreenConfig {
  collection: string
  title: string
  nameLabel?: string
  statusField?: string
  statusOptions?: readonly string[]
  fields: RhFieldDef[]
}

export const RH_SCREEN_CONFIGS: Record<string, RhScreenConfig> = {
  positions: {
    collection: 'rh_positions',
    title: 'Cargos',
    nameLabel: 'Nome do Cargo',
    statusField: 'situacao',
    statusOptions: ['Ativo', 'Inativo'],
    fields: [
      { name: 'code', label: 'Código', type: 'text', required: true },
      { name: 'name', label: 'Nome do Cargo', type: 'text', required: true },
      { name: 'departamento', label: 'Departamento', type: 'text' },
      { name: 'gestor_cargo', label: 'Gestor do Cargo', type: 'text' },
      { name: 'faixa_salarial_inicial', label: 'Faixa Salarial Inicial', type: 'text' },
      { name: 'faixa_salarial_final', label: 'Faixa Salarial Final', type: 'text' },
      { name: 'jornada_padrao', label: 'Jornada Padrão', type: 'text' },
      { name: 'escolaridade_minima', label: 'Escolaridade Mínima', type: 'text' },
      { name: 'responsabilidades', label: 'Responsabilidades', type: 'textarea', span: 2 },
      { name: 'competencias', label: 'Competências Necessárias', type: 'textarea', span: 2 },
      { name: 'centro_custo', label: 'Centro de Custo', type: 'text' },
    ],
  },
  departments: {
    collection: 'rh_departments',
    title: 'Departamentos',
    nameLabel: 'Nome',
    statusField: 'situacao',
    statusOptions: ['Ativo', 'Inativo'],
    fields: [
      { name: 'code', label: 'Código', type: 'text', required: true },
      { name: 'name', label: 'Nome', type: 'text', required: true },
      { name: 'empresa', label: 'Empresa', type: 'text' },
      { name: 'filial', label: 'Filial', type: 'text' },
      { name: 'departamento_superior', label: 'Departamento Superior', type: 'text' },
      { name: 'gestor_responsavel', label: 'Gestor Responsável', type: 'text' },
      { name: 'centro_custo', label: 'Centro de Custo', type: 'text' },
      { name: 'description', label: 'Descrição', type: 'textarea', span: 2 },
    ],
  },
  benefits: {
    collection: 'rh_benefits',
    title: 'Benefícios',
    nameLabel: 'Nome do Benefício',
    statusField: 'situacao',
    statusOptions: ['Ativo', 'Inativo'],
    fields: [
      { name: 'name', label: 'Nome do Benefício', type: 'text', required: true },
      {
        name: 'tipo_beneficio',
        label: 'Tipo',
        type: 'select',
        options: [...BENEFIT_TYPES],
        required: true,
      },
      { name: 'fornecedor', label: 'Fornecedor', type: 'text' },
      { name: 'valor', label: 'Valor', type: 'text', required: true },
      { name: 'participacao_empresa', label: 'Participação Empresa', type: 'text' },
      { name: 'participacao_colaborador', label: 'Participação Colaborador', type: 'text' },
      { name: 'forma_desconto', label: 'Forma de Desconto', type: 'text' },
      { name: 'cargo_elegivel', label: 'Cargo Elegível', type: 'text' },
      { name: 'departamento_elegivel', label: 'Departamento Elegível', type: 'text' },
      { name: 'data_inicio', label: 'Data Início', type: 'date' },
      { name: 'data_termino', label: 'Data Término', type: 'date' },
    ],
  },
  trainings: {
    collection: 'rh_trainings',
    title: 'Treinamentos',
    nameLabel: 'Nome do Treinamento',
    statusField: 'situacao',
    statusOptions: [...TRAINING_STATUS],
    fields: [
      { name: 'name', label: 'Nome do Treinamento', type: 'text', required: true },
      { name: 'categoria', label: 'Categoria', type: 'text' },
      { name: 'instrutor', label: 'Instrutor', type: 'text' },
      { name: 'instituicao', label: 'Instituição', type: 'text' },
      {
        name: 'modalidade',
        label: 'Modalidade',
        type: 'select',
        options: [...TRAINING_MODALITIES],
      },
      { name: 'data', label: 'Data', type: 'date' },
      { name: 'horario', label: 'Horário', type: 'text' },
      { name: 'carga_horaria', label: 'Carga Horária', type: 'text' },
      { name: 'local', label: 'Local', type: 'text' },
      { name: 'valor', label: 'Valor', type: 'text' },
      { name: 'validade_certificado', label: 'Validade do Certificado', type: 'text' },
      { name: 'description', label: 'Descrição', type: 'textarea', span: 2 },
    ],
  },
  documents: {
    collection: 'rh_documents',
    title: 'Documentos dos Colaboradores',
    nameLabel: 'Documento',
    statusField: 'situacao',
    statusOptions: ['Válido', 'Vencido', 'Próximo do Vencimento', 'Arquivado'],
    fields: [
      { name: 'employee_name', label: 'Colaborador', type: 'text', required: true },
      {
        name: 'categoria',
        label: 'Categoria',
        type: 'select',
        options: [...DOCUMENT_CATEGORIES],
        required: true,
      },
      { name: 'documento', label: 'Documento', type: 'text', required: true },
      { name: 'numero', label: 'Número', type: 'text' },
      { name: 'data_emissao', label: 'Data Emissão', type: 'date' },
      { name: 'data_validade', label: 'Data Validade', type: 'date' },
      { name: 'orgao_emissor', label: 'Órgão Emissor', type: 'text' },
    ],
  },
  approvals: {
    collection: 'rh_approvals',
    title: 'Aprovações de RH',
    nameLabel: 'Solicitação',
    statusField: 'situacao',
    statusOptions: [...APPROVAL_STATUS],
    fields: [
      { name: 'tipo_solicitacao', label: 'Tipo', type: 'text', required: true },
      { name: 'employee_name', label: 'Colaborador', type: 'text' },
      { name: 'solicitante', label: 'Solicitante', type: 'text' },
      { name: 'aprovador', label: 'Aprovador', type: 'text' },
      { name: 'data_hora', label: 'Data/Hora', type: 'date' },
      { name: 'valor_anterior', label: 'Valor Anterior', type: 'text' },
      { name: 'valor_novo', label: 'Valor Novo', type: 'text' },
      { name: 'justificativa', label: 'Justificativa', type: 'textarea', span: 2 },
    ],
  },
}
