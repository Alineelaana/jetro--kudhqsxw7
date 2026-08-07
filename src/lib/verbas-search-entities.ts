import { SA_COLLECTIONS } from '@/services/supplier-allowance'

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
    collection: SA_COLLECTIONS.agreements,
    label: 'Acordos',
    searchFields: ['agreement_type', 'status', 'observations'],
    route: '/admin/verbas/acordos',
    titleField: 'agreement_type',
    subtitleField: 'status',
    module: 'Verbas de Fornecedores',
    icon: 'hand-coins',
  },
  {
    collection: SA_COLLECTIONS.accounts,
    label: 'Conta Corrente',
    searchFields: ['company', 'branch'],
    route: '/admin/verbas/conta-corrente',
    titleField: 'company',
    subtitleField: 'branch',
    module: 'Verbas de Fornecedores',
    icon: 'wallet',
  },
  {
    collection: SA_COLLECTIONS.movements,
    label: 'Movimentações',
    searchFields: ['movement_type', 'direction', 'document_number', 'observations'],
    route: '/admin/verbas/movimentacoes',
    titleField: 'movement_type',
    subtitleField: 'document_number',
    module: 'Verbas de Fornecedores',
    icon: 'arrow-left-right',
  },
  {
    collection: SA_COLLECTIONS.accruals,
    label: 'Apurações',
    searchFields: ['competence_period', 'status'],
    route: '/admin/verbas/apuracoes',
    titleField: 'competence_period',
    subtitleField: 'status',
    module: 'Verbas de Fornecedores',
    icon: 'calculator',
  },
  {
    collection: SA_COLLECTIONS.settlements,
    label: 'Liquidações',
    searchFields: ['settlement_type', 'status'],
    route: '/admin/verbas/liquidacoes',
    titleField: 'settlement_type',
    subtitleField: 'status',
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
