import pb from '@/lib/pocketbase/client'

export interface CommercialUser {
  id: string
  name: string
  email: string
  role: string
  cargo: string
  departamento: string
}

export async function getCommercialUsers(): Promise<CommercialUser[]> {
  const users = await pb.collection('users').getFullList({
    filter: 'active = true',
    sort: 'name',
  })
  return users.map((u) => ({
    id: u.id,
    name: u.name || u.email || '',
    email: u.email || '',
    role: u.role || '',
    cargo: u.cargo || '',
    departamento: u.departamento || '',
  }))
}

export async function getUserById(id: string): Promise<CommercialUser | null> {
  try {
    const u = await pb.collection('users').getOne(id)
    return {
      id: u.id,
      name: u.name || u.email || '',
      email: u.email || '',
      role: u.role || '',
      cargo: u.cargo || '',
      departamento: u.departamento || '',
    }
  } catch {
    return null
  }
}
