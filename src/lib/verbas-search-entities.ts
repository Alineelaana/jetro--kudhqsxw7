export interface VerbasSearchEntity {
  collection: string
  label: string
  searchFields: string[]
  route: string
  titleField: string
  subtitleField: string
  module: string
  icon: string
}

export const VERBAS_SEARCH_ENTITIES: VerbasSearchEntity[] = [
  {
    collection: 'sa_agreements',
    label: 'Acordos',
    searchFields: ['name', 'partner_name', 'agreement_type', 'description'],
    route: '/admin/verbas/acordos',
    titleField: 'name',
    subtitleField: 'partner_name',
    module: 'Verbas de Fornecedores',
    icon: 'hand-coins',
  },
  {
    collection: 'sa_accounts',
    label: 'Conta Corrente',
    searchFields: ['partner_name', 'agreement_name', 'account_code'],
    route: '/admin/verbas/conta-corrente',
    titleField: 'partner_name',
    subtitleField: 'agreement_name',
    module: 'Verbas de Fornecedores',
    icon: 'wallet',
  },
  {
    collection: 'sa_movements',
    label: 'Movimentações',
    searchFields: ['description', 'partner_name', 'movement_type', 'document_number'],
    route: '/admin/verbas/movimentacoes',
    titleField: 'description',
    subtitleField: 'partner_name',
    module: 'Verbas de Fornecedores',
    icon: 'arrow-left-right',
  },
  {
    collection: 'sa_accruals',
    label: 'Apurações',
    searchFields: ['description', 'partner_name', 'period', 'status'],
    route: '/admin/verbas/apuracoes',
    titleField: 'description',
    subtitleField: 'partner_name',
    module: 'Verbas de Fornecedores',
    icon: 'calculator',
  },
  {
    collection: 'sa_settlements',
    label: 'Liquidações',
    searchFields: ['description', 'partner_name', 'settlement_type', 'status'],
    route: '/admin/verbas/liquidacoes',
    titleField: 'description',
    subtitleField: 'partner_name',
    module: 'Verbas de Fornecedores',
    icon: 'check-circle',
  },
]

export function getVerbasSearchCollections(): string[] {
  return VERBAS_SEARCH_ENTITIES.map((e) => e.collection)
}

export function findVerbasEntityByCollection(collection: string): VerbasSearchEntity | undefined {
  return VERBAS_SEARCH_ENTITIES.find((e) => e.collection === collection)
}
