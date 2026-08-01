import pb from '@/lib/pocketbase/client'

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: string
  cpf?: string
  avatar?: File | null
  active?: boolean
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
  }
  if (data.avatar) {
    recordData.avatar = data.avatar
  }
  await pb.collection('users').create(recordData)
}

export async function updateUserActiveStatus(userId: string, active: boolean): Promise<void> {
  await pb.collection('users').update(userId, { active })
}

export async function updateAttendantStatus(userId: string, status: string): Promise<void> {
  await pb.collection('users').update(userId, { attendant_status: status })
}

export async function deleteUser(id: string): Promise<void> {
  await pb.collection('users').delete(id)
}
