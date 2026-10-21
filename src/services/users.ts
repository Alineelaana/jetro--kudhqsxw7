import pb from '@/lib/pocketbase/client'

export interface CreateUserData {
  name: string
  email: string
  login?: string
  password: string
  role: string
  codigo?: number
  perfil_id?: string
  perfil_acesso?: string
  cpf?: string
  avatar?: File | null
  active?: boolean
  empresa_id?: string
  empresas_ids?: string[]
  filial_id?: string
  departamento?: string
  cargo?: string
  inactivity_timeout_minutes?: number
}

export async function getUsers() {
  return pb.collection('users').getFullList({
    sort: 'codigo,created',
    expand: 'perfil_id',
  })
}

export async function getNextUserCodigo(): Promise<number> {
  try {
    const list = await pb.collection('users').getList(1, 1, {
      sort: '-codigo',
      filter: 'codigo > 0',
      fields: 'codigo',
    })
    if (list.items.length > 0 && typeof list.items[0].codigo === 'number') {
      return list.items[0].codigo + 1
    }
  } catch (err) {
    console.warn('Erro ao obter próximo código de usuário:', err)
  }
  return 8
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
    verified: true, // Usuários criados pelo gestor já nascem verificados
    inactivity_timeout_minutes:
      typeof data.inactivity_timeout_minutes === 'number' && data.inactivity_timeout_minutes > 0
        ? data.inactivity_timeout_minutes
        : 480, // Padrão institucional Jetro: 8 horas (480 min)
  }
  if (typeof data.codigo === 'number' && data.codigo > 0) {
    recordData.codigo = data.codigo
  } else {
    recordData.codigo = await getNextUserCodigo()
  }
  if (data.login) {
    const cleanLogin = data.login.trim().toLowerCase()
    recordData.login = cleanLogin
  }
  if (data.avatar) {
    recordData.avatar = data.avatar
  }
  if (data.perfil_id !== undefined) recordData.perfil_id = data.perfil_id
  if (data.perfil_acesso !== undefined) recordData.perfil_acesso = data.perfil_acesso
  if (data.empresa_id !== undefined) recordData.empresa_id = data.empresa_id
  if (data.empresas_ids !== undefined) recordData.empresas_ids = data.empresas_ids
  if (data.filial_id !== undefined) recordData.filial_id = data.filial_id
  if (data.departamento !== undefined) recordData.departamento = data.departamento
  if (data.cargo !== undefined) recordData.cargo = data.cargo
  const createdRecord = await pb.collection('users').create(recordData)

  // Sincronizar collection 'usuarios_empresas' caso exista
  const targetEmpresas =
    data.empresas_ids && data.empresas_ids.length > 0
      ? data.empresas_ids
      : data.empresa_id
        ? [data.empresa_id]
        : []

  for (const empId of targetEmpresas) {
    try {
      await pb.collection('usuarios_empresas').create({
        usuario: createdRecord.id,
        empresa: empId,
        filial_padrao: data.filial_id || '',
        ativo: true,
      })
    } catch {
      /* intentionally ignored */
    }
  }
}

export async function updateUserActiveStatus(userId: string, active: boolean): Promise<void> {
  await pb.collection('users').update(userId, { active })
}

export interface UpdateUserData {
  name?: string
  email?: string
  login?: string
  role?: string
  codigo?: number
  perfil_id?: string
  perfil_acesso?: string
  cpf?: string
  password?: string
  avatar?: File | null
  active?: boolean
  empresa_id?: string
  empresas_ids?: string[]
  filial_id?: string
  departamento?: string
  cargo?: string
  inactivity_timeout_minutes?: number
}

export async function updateUser(userId: string, data: UpdateUserData): Promise<void> {
  const recordData: Record<string, unknown> = {}
  if (data.name !== undefined) recordData.name = data.name
  if (data.email !== undefined) recordData.email = data.email
  if (data.login !== undefined) {
    const cleanLogin = data.login.trim().toLowerCase()
    recordData.login = cleanLogin
  }
  if (data.role !== undefined) recordData.role = data.role
  if (data.perfil_id !== undefined) recordData.perfil_id = data.perfil_id
  if (data.perfil_acesso !== undefined) recordData.perfil_acesso = data.perfil_acesso
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
  if (data.empresas_ids !== undefined) recordData.empresas_ids = data.empresas_ids
  if (data.filial_id !== undefined) recordData.filial_id = data.filial_id
  if (data.departamento !== undefined) recordData.departamento = data.departamento
  if (data.cargo !== undefined) recordData.cargo = data.cargo
  await pb.collection('users').update(userId, recordData)

  // Sincronizar collection 'usuarios_empresas' se empresas_ids foi informado
  if (data.empresas_ids !== undefined) {
    try {
      const existing = await pb.collection('usuarios_empresas').getFullList({
        filter: `usuario = "${userId}"`,
      })
      const existingEmpresas = existing.map((r) => r.empresa as string)

      // Criar novos vínculos
      for (const empId of data.empresas_ids) {
        if (!existingEmpresas.includes(empId)) {
          await pb.collection('usuarios_empresas').create({
            usuario: userId,
            empresa: empId,
            filial_padrao: data.filial_id || '',
            ativo: true,
          })
        }
      }

      // Desvincular empresas removidas
      for (const rec of existing) {
        if (!data.empresas_ids.includes(rec.empresa as string)) {
          await pb.collection('usuarios_empresas').delete(rec.id)
        }
      }
    } catch {
      /* intentionally ignored */
    }
  }
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
