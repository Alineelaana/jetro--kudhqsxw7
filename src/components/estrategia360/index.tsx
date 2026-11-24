// Tipos e cliente React Query da tela "Visão estratégica em 360°".
import { useQuery } from '@tanstack/react-query'
import {
  fetchClientes,
  fetchEstoque,
  fetchFinanceiro,
  fetchFlashVendas,
  fetchFluxoCaixa,
  fetchFaturamento,
  fetchFornecedores,
  fetchMarcas,
  fetchObjetivo,
  fetchProdutos,
} from './data'
import type { GlobalFilters } from './types'

export type { GlobalFilters } from './types'
export { TAB_DEFS } from './types'
export * from './widgets'

export function useFlashVendas(f: GlobalFilters) {
  return useQuery({
    queryKey: ['estrategia360', 'flash-vendas', f],
    queryFn: () => fetchFlashVendas(f),
  })
}
export function useObjetivo(f: GlobalFilters) {
  return useQuery({ queryKey: ['estrategia360', 'objetivo', f], queryFn: () => fetchObjetivo(f) })
}
export function useFaturamento(f: GlobalFilters) {
  return useQuery({
    queryKey: ['estrategia360', 'faturamento', f],
    queryFn: () => fetchFaturamento(f),
  })
}
export function useMarcas(f: GlobalFilters) {
  return useQuery({ queryKey: ['estrategia360', 'marcas', f], queryFn: () => fetchMarcas(f) })
}
export function useProdutos(f: GlobalFilters) {
  return useQuery({ queryKey: ['estrategia360', 'produtos', f], queryFn: () => fetchProdutos(f) })
}
export function useEstoque(f: GlobalFilters) {
  return useQuery({ queryKey: ['estrategia360', 'estoque', f], queryFn: () => fetchEstoque(f) })
}
export function useFinanceiro(f: GlobalFilters) {
  return useQuery({
    queryKey: ['estrategia360', 'financeiro', f],
    queryFn: () => fetchFinanceiro(f),
  })
}
export function useFluxoCaixa(f: GlobalFilters) {
  return useQuery({
    queryKey: ['estrategia360', 'fluxo-caixa', f],
    queryFn: () => fetchFluxoCaixa(f),
  })
}
export function useClientes(f: GlobalFilters) {
  return useQuery({ queryKey: ['estrategia360', 'clientes', f], queryFn: () => fetchClientes(f) })
}
export function useFornecedores(f: GlobalFilters) {
  return useQuery({
    queryKey: ['estrategia360', 'fornecedores', f],
    queryFn: () => fetchFornecedores(f),
  })
}
