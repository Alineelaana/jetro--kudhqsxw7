import pb from '@/lib/pocketbase/client'

export const FINANCIAL_COLLECTIONS = {
  receivables: 'financial_receivables',
  payables: 'financial_payables',
  movements: 'financial_movements',
  transfers: 'financial_transfers',
  checks: 'financial_checks',
  cards: 'financial_cards',
  cardTransactions: 'financial_card_transactions',
  boletos: 'financial_boletos',
  pix: 'financial_pix',
  collections: 'financial_collections',
  cashRegisters: 'financial_cash_registers',
  cashMovements: 'financial_cash_movements',
  approvals: 'financial_approvals',
  closings: 'financial_closings',
  reconciliation: 'financial_reconciliation',
  bankStatements: 'financial_bank_statements',
} as const

export function finGetList(collection: string) {
  return pb.collection(collection).getFullList({ sort: '-created' })
}
export function finCreate(collection: string, data: Record<string, unknown>) {
  return pb.collection(collection).create(data)
}
export function finUpdate(collection: string, id: string, data: Record<string, unknown>) {
  return pb.collection(collection).update(id, data)
}
export function finDelete(collection: string, id: string) {
  return pb.collection(collection).delete(id)
}

export const getReceivables = () => finGetList(FINANCIAL_COLLECTIONS.receivables)
export const createReceivable = (d: Record<string, unknown>) =>
  finCreate(FINANCIAL_COLLECTIONS.receivables, d)
export const updateReceivable = (id: string, d: Record<string, unknown>) =>
  finUpdate(FINANCIAL_COLLECTIONS.receivables, id, d)

export const getPayables = () => finGetList(FINANCIAL_COLLECTIONS.payables)
export const createPayable = (d: Record<string, unknown>) =>
  finCreate(FINANCIAL_COLLECTIONS.payables, d)
export const updatePayable = (id: string, d: Record<string, unknown>) =>
  finUpdate(FINANCIAL_COLLECTIONS.payables, id, d)

export const getMovements = () => finGetList(FINANCIAL_COLLECTIONS.movements)
export const createMovement = (d: Record<string, unknown>) =>
  finCreate(FINANCIAL_COLLECTIONS.movements, d)

export const getTransfers = () => finGetList(FINANCIAL_COLLECTIONS.transfers)
export const createTransfer = (d: Record<string, unknown>) =>
  finCreate(FINANCIAL_COLLECTIONS.transfers, d)
export const updateTransfer = (id: string, d: Record<string, unknown>) =>
  finUpdate(FINANCIAL_COLLECTIONS.transfers, id, d)

export const getChecks = () => finGetList(FINANCIAL_COLLECTIONS.checks)
export const getCards = () => finGetList(FINANCIAL_COLLECTIONS.cards)
export const getCardTransactions = () => finGetList(FINANCIAL_COLLECTIONS.cardTransactions)
export const getBoletos = () => finGetList(FINANCIAL_COLLECTIONS.boletos)
export const getPix = () => finGetList(FINANCIAL_COLLECTIONS.pix)
export const getCollections = () => finGetList(FINANCIAL_COLLECTIONS.collections)
export const getCashRegisters = () => finGetList(FINANCIAL_COLLECTIONS.cashRegisters)
export const getCashMovements = () => finGetList(FINANCIAL_COLLECTIONS.cashMovements)
export const getApprovals = () => finGetList(FINANCIAL_COLLECTIONS.approvals)
export const getClosings = () => finGetList(FINANCIAL_COLLECTIONS.closings)
export const getReconciliation = () => finGetList(FINANCIAL_COLLECTIONS.reconciliation)
export const getBankStatements = () => finGetList(FINANCIAL_COLLECTIONS.bankStatements)
