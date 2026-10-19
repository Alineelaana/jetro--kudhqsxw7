import pb from '@/lib/pocketbase/client'

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: string
  cpf?: string
  avatar?: File | null
  active?: boolean
  empresa_id?: string
  filial_id?: string
  departamento?: string
  cargo?: string
  inactivity_timeout_minutes?: number
}

export async function getUsers() {
  return pb.collection('users').getFullList({ sort: 'created' })
}

export async function createUser(data: CreateUserData): Promise<void> {
  const recordData: Record<string, unknown> = {
    name: data.name,
    email: data.email,
    password: data.password,
    passwordConfirm: data.password,
    role: data.role,
    cpf: data.cpf || '',
    active: data.active !== undefined ? data.active : true,
    inactivity_timeout_minutes:
      typeof data.inactivity_timeout_minutes === 'number' && data.inactivity_timeout_minutes > 0
        ? data.inactivity_timeout_minutes
        : 480, // Padrão institucional Jetro: 8 horas (480 min)
  }
  if (data.avatar) {
    recordData.avatar = data.avatar
  }
  if (data.empresa_id !== undefined) recordData.empresa_id = data.empresa_id
  if (data.filial_id !== undefined) recordData.filial_id = data.filial_id
  if (data.departamento !== undefined) recordData.departamento = data.departamento
  if (data.cargo !== undefined) recordData.cargo = data.cargo
  await pb.collection('users').create(recordData)
}

export async function updateUserActiveStatus(userId: string, active: boolean): Promise<void> {
  await pb.collection('users').update(userId, { active })
}

export interface UpdateUserData {
  name?: string
  role?: string
  cpf?: string
  password?: string
  avatar?: File | null
  active?: boolean
  empresa_id?: string
  filial_id?: string
  departamento?: string
  cargo?: string
  inactivity_timeout_minutes?: number
}

export async function updateUser(userId: string, data: UpdateUserData): Promise<void> {
  const recordData: Record<string, unknown> = {}
  if (data.name !== undefined) recordData.name = data.name
  if (data.role !== undefined) recordData.role = data.role
  if (data.cpf !== undefined) recordData.cpf = data.cpf
  if (data.active !== undefined) recordData.active = data.active
  if (data.inactivity_timeout_minutes !== undefined) {
    recordData.inactivity_timeout_minutes = data.inactivity_timeout_minutes
  }
  if (data.password) {
    recordData.password = data.password
    recordData.passwordConfirm = data.password
  }
  if (data.avatar) {
    recordData.avatar = data.avatar
  }
  if (data.empresa_id !== undefined) recordData.empresa_id = data.empresa_id
  if (data.filial_id !== undefined) recordData.filial_id = data.filial_id
  if (data.departamento !== undefined) recordData.departamento = data.departamento
  if (data.cargo !== undefined) recordData.cargo = data.cargo
  await pb.collection('users').update(userId, recordData)
}

export async function resetUserPassword(userId: string, newPassword: string): Promise<void> {
  await pb.collection('users').update(userId, {
    password: newPassword,
    passwordConfirm: newPassword,
  })
}

export async function updateAttendantStatus(userId: string, status: string): Promise<void> {
  await pb.collection('users').update(userId, { attendant_status: status })
}

export async function deleteUser(id: string): Promise<void> {
  await pb.collection('users').delete(id)
}

export async function getEmpresas() {
  return pb.collection('empresas').getFullList({ sort: 'name' })
}

export async function getFiliais(empresaId?: string) {
  const filter = empresaId ? `empresa_id = "${empresaId}"` : undefined
  return pb.collection('filiais').getFullList({ sort: 'name', filter })
}
