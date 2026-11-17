import { useEffect, useMemo, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { listCadastros } from '@/services/cadastros'

export interface SelectOption {
  value: string
  label: string
}

type Row = Record<string, unknown>

const str = (v: unknown): string => String(v ?? '').trim()

function uniqueSorted(values: string[]): SelectOption[] {
  const set = new Set<string>()
  values.forEach((v) => {
    const t = str(v)
    if (t) set.add(t)
  })
  return Array.from(set)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((v) => ({ value: v, label: v }))
}

/** Nome de exibição de um cadastro padrão (campo name com fallback para código/id) */
function cadastroOptions(rows: Row[]): SelectOption[] {
  return rows
    .map((r) => ({
      value: str(r.name) || str(r.code) || str(r.id),
      label: str(r.name) || str(r.code) || str(r.id),
    }))
    .filter((o) => o.value)
}

/**
 * Fontes de opções das Regras de Aplicação — todos os valores vêm dos cadastros
 * reais do sistema (mesmas coleções/telas do menu lateral).
 */
export function useRuleOptions() {
  const [options, setOptions] = useState<Record<string, SelectOption[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const acc: Record<string, SelectOption[]> = {}
      const safe = async (key: string, fn: () => Promise<SelectOption[]>) => {
        try {
          acc[key] = await fn()
        } catch {
          acc[key] = []
        }
      }

      const [empresas, filiais, clientes] = await Promise.all([
        listCadastros('empresas').catch(() => [] as Row[]),
        listCadastros('filiais').catch(() => [] as Row[]),
        listCadastros('clients').catch(() => [] as Row[]),
      ])

      await Promise.all([
        safe('empresas', async () => cadastroOptions(empresas)),
        safe('filiais', async () => cadastroOptions(filiais)),
        safe('clientes', async () =>
          cadastroOptions(
            clientes.map((c) => ({ ...c, name: str(c.name) || str(c.company_name) })),
          ),
        ),
        // Grupos de clientes, regiões, cidades e estados derivam dos cadastros reais
        safe('grupos_clientes', async () =>
          uniqueSorted(
            clientes.map((c) => str(c.grupo) || str(c.grupo_economico) || str(c.segmento)),
          ),
        ),
        safe('regioes', async () =>
          uniqueSorted([
            ...filiais.map((f) => str(f.regiao) || str(f.regioes)),
            ...clientes.map((c) => str(c.regiao) || str(c.regioes)),
          ]),
        ),
        safe('cidades', async () =>
          uniqueSorted([
            ...filiais.map((f) => str(f.cidade) || str(f.address_city)),
            ...clientes.map((c) => str(c.cidade) || str(c.address_city)),
          ]),
        ),
        safe('estados', async () =>
          uniqueSorted(
            [
              ...filiais.map((f) => str(f.estado) || str(f.uf) || str(f.address_state)),
              ...clientes.map((c) => str(c.estado) || str(c.uf) || str(c.address_state)),
            ].map((uf) => uf.toUpperCase()),
          ),
        ),
        safe('canais', async () => {
          const orders = await pb
            .collection('sales_orders')
            .getFullList({ filter: "sales_channel != ''" })
            .catch(() => [] as Row[])
          return uniqueSorted(orders.map((o) => str(o.sales_channel) || str(o.canal_comercial)))
        }),
        safe('vendedores', async () => cadastroOptions(await listCadastros('vendedores'))),
        safe('representantes', async () => cadastroOptions(await listCadastros('representantes'))),
        safe('contratos', async () => {
          const contratos = await pb
            .collection('contracts_operations')
            .getFullList()
            .catch(() => [] as Row[])
          return uniqueSorted(
            contratos.map(
              (c) => str(c.contract_name) || str(c.name) || str(c.title) || str(c.code),
            ),
          )
        }),
        safe('campanhas', async () => {
          const campanhas = await pb
            .collection('services_offered')
            .getFullList()
            .catch(() => [] as Row[])
          return uniqueSorted(campanhas.map((c) => str(c.name) || str(c.title)))
        }),
        safe('formas_pagamento', async () =>
          cadastroOptions(await listCadastros('formas_pagamento')),
        ),
        safe('condicoes_pagamento', async () =>
          cadastroOptions(await listCadastros('condicoes_pagamento')),
        ),
      ])

      if (!cancelled) {
        setOptions(acc)
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { options, loading }
}

export type ProductLite = {
  id: string
  code?: string
  name: string
  active?: boolean
  main_supplier?: string
  cost_price?: string
  price?: string
  max_discount?: string
}

export type ServiceLite = { id: string; name: string; code?: string; active?: boolean }

/** Produtos e serviços reais do sistema para a aba Produtos e Serviços */
export function useProductServiceOptions() {
  const [products, setProducts] = useState<ProductLite[]>([])
  const [services, setServices] = useState<ServiceLite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [prods, servs] = await Promise.all([
          pb
            .collection('products')
            .getFullList({ sort: 'name' })
            .catch(() => [] as Row[]),
          pb
            .collection('services_offered')
            .getFullList({ sort: 'name' })
            .catch(() => [] as Row[]),
        ])
        if (cancelled) return
        setProducts(prods as unknown as ProductLite[])
        setServices(servs as unknown as ServiceLite[])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return { products, services, loading }
}

/** Filtro combinado por fornecedor e termo de busca */
export function useFilteredProducts(
  products: ProductLite[],
  supplierFilter: string,
  searchTerm: string,
): ProductLite[] {
  return useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return products
      .filter((p) => p.active !== false)
      .filter((p) => !supplierFilter || str(p.main_supplier) === supplierFilter)
      .filter((p) => !term || `${str(p.name)} ${str(p.code)}`.toLowerCase().includes(term))
  }, [products, supplierFilter, searchTerm])
}

/** Fornecedores distintos a partir dos produtos reais (campo main_supplier) */
export function useSupplierOptions(products: ProductLite[]): SelectOption[] {
  return useMemo(() => uniqueSorted(products.map((p) => str(p.main_supplier))), [products])
}
