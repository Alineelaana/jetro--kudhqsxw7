const PB_URL = import.meta.env.VITE_POCKETBASE_URL || ''

export function getFileUrl(recordId: string, filename: string, collection = 'partners') {
  return filename ? `${PB_URL}/api/files/${collection}/${recordId}/${filename}` : ''
}

export function formatCpf(cpf: string): string {
  const c = cpf.replace(/\D/g, '').slice(0, 11)
  return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatCnpj(cnpj: string): string {
  const c = cnpj.replace(/\D/g, '').slice(0, 14)
  return c.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatCep(cep: string): string {
  const c = cep.replace(/\D/g, '').slice(0, 8)
  return c.replace(/(\d{5})(\d{3})/, '$1-$2')
}

export function formatPhone(phone: string): string {
  const c = phone.replace(/\D/g, '').slice(0, 11)
  if (c.length <= 10) return c.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return c.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}

export async function lookupCep(cep: string) {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.erro) return null
    return data
  } catch {
    return null
  }
}

export async function lookupCnpj(cnpj: string) {
  const clean = cnpj.replace(/\D/g, '')
  if (clean.length !== 14) return null
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export const MARITAL_STATUS_OPTIONS = [
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'União Estável',
]
