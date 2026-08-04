export const ROUTE_STATUS = [
  'Ativa',
  'Inativa',
  'Em Planejamento',
  'Temporariamente Bloqueada',
] as const

export const DELIVERY_STATUS = [
  'Aguardando Planejamento',
  'Programada',
  'Aguardando Carregamento',
  'Em Carregamento',
  'Em Trânsito',
  'Saiu para Entrega',
  'Entregue',
  'Entrega Parcial',
  'Não Entregue',
  'Reagendada',
  'Devolvida',
  'Cancelada',
] as const

export const VEHICLE_STATUS = [
  'Disponível',
  'Em Rota',
  'Em Carregamento',
  'Em Manutenção',
  'Bloqueado',
  'Inativo',
] as const

export const VEHICLE_OWNERSHIP = ['Próprio', 'Agregado', 'Terceirizado', 'Alugado'] as const

export const DRIVER_STATUS = [
  'Disponível',
  'Em Rota',
  'Em Descanso',
  'Afastado',
  'Bloqueado',
  'Inativo',
] as const

export const DRIVER_VINCULO = ['Colaborador', 'Agregado', 'Terceirizado', 'Prestador'] as const

export const FREIGHT_STATUS = [
  'Em Cotação',
  'Cotado',
  'Aguardando Aprovação',
  'Aprovado',
  'Contratado',
  'Em Transporte',
  'Finalizado',
  'Cancelado',
] as const

export const FREIGHT_TYPE = [
  'Próprio',
  'Terceirizado',
  'Por conta do remetente',
  'Por conta do destinatário',
  'Por conta de terceiros',
] as const

export const OCCURRENCE_TYPES = [
  'Cliente Ausente',
  'Endereço Não Localizado',
  'Endereço Incorreto',
  'Cliente Recusou',
  'Produto Avariado',
  'Produto Faltante',
  'Entrega Parcial',
  'Veículo com Problema',
  'Atraso',
  'Acidente',
  'Restrição de Acesso',
  'Nota Fiscal Incorreta',
  'Outro',
] as const

export const OCCURRENCE_STATUS = [
  'Aberta',
  'Em Análise',
  'Aguardando Solução',
  'Resolvida',
  'Cancelada',
] as const

export const COST_TYPES = [
  'Frete',
  'Combustível',
  'Pedágio',
  'Seguro',
  'Manutenção',
  'Diárias',
  'Alimentação',
  'Hospedagem',
  'Terceirização',
  'Reentrega',
  'Devolução',
  'Avaria',
  'Outras despesas',
] as const

export const TRACKING_STATUS = [
  'Pedido Liberado',
  'Em Separação',
  'Conferido',
  'Em Carregamento',
  'Saiu para Entrega',
  'Em Trânsito',
  'Chegou ao Destino',
  'Entregue',
  'Ocorrência Registrada',
] as const

export interface LogisticsRoute {
  id: string
  codigo_rota: string
  nome_rota: string
  empresa: string
  filial: string
  regiao: string
  cidade_origem: string
  cidades_atendidas: string
  estado: string
  distancia_estimada: string
  tempo_estimado: string
  pedagios: string
  custo_estimado: string
  dias_operacao: string
  horario_saida: string
  responsavel: string
  situacao: string
  veiculo_padrao: string
  motorista_padrao: string
  capacidade_maxima_peso: number
  capacidade_maxima_volume: number
  clientes_vinculados: string[]
  sequencia_entregas: unknown[]
  historico: unknown[]
  created: string
  updated: string
}

export interface LogisticsDelivery {
  id: string
  numero_entrega: string
  pedido: string
  nota_fiscal: string
  cliente: string
  endereco: string
  cidade: string
  rota: string
  transportadora: string
  veiculo: string
  motorista: string
  data_prevista: string
  data_realizada: string
  valor_mercadoria: string
  status: string
  empresa: string
  filial: string
  prioridade: string
  peso: string
  volume: string
  quantidade_volumes: number
  recebedor_nome: string
  recebedor_documento: string
  created: string
  updated: string
}

export interface LogisticsVehicle {
  id: string
  codigo: string
  tipo_propriedade: string
  proprietario: string
  placa: string
  renavam: string
  marca: string
  modelo: string
  ano: string
  cor: string
  tipo_veiculo: string
  capacidade_peso: number
  capacidade_volume: number
  quantidade_eixos: number
  tipo_carroceria: string
  empresa: string
  filial: string
  unidade_operacao: string
  data_aquisicao: string
  vencimento_licenciamento: string
  vencimento_seguro: string
  situacao: string
  created: string
  updated: string
}

export interface LogisticsDriver {
  id: string
  nome: string
  cpf: string
  rg: string
  data_nascimento: string
  telefone: string
  email: string
  endereco: string
  numero_cnh: string
  categoria_cnh: string
  validade_cnh: string
  empresa: string
  filial: string
  transportadora: string
  tipo_vinculo: string
  veiculo_padrao: string
  situacao: string
  created: string
  updated: string
}

export interface LogisticsFreight {
  id: string
  numero_frete: string
  documento_origem: string
  pedido: string
  nota_fiscal: string
  cliente: string
  transportadora: string
  origem: string
  destino: string
  peso: string
  volume: string
  valor_mercadoria: string
  tipo_frete: string
  tabela_frete: string
  valor_calculado: string
  valor_negociado: string
  pedagio: string
  seguro: string
  taxas: string
  adicionais: string
  valor_total: string
  prazo_entrega: string
  responsavel: string
  situacao: string
  cte: string
  created: string
  updated: string
}

export interface LogisticsOccurrence {
  id: string
  entrega: string
  pedido: string
  cliente: string
  motorista: string
  veiculo: string
  data_hora: string
  tipo_ocorrencia: string
  descricao: string
  responsavel: string
  acao_necessaria: string
  nova_data_prevista: string
  situacao: string
  created: string
  updated: string
}
