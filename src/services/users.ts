import pb from '@/lib/pocketbase/client'

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: string
}

export async function getUsers() {
  return pb.collection('users').getFullList({ sort: 'created' })
}

export async function createUser(data: CreateUserData): Promise<void> {
  await pb.collection('users').create({
    name: data.name,
    email: data.email,
    password: data.password,
    passwordConfirm: data.password,
    role: data.role,
  })
}

export async function deleteUser(id: string): Promise<void> {
  await pb.collection('users').delete(id)
}
