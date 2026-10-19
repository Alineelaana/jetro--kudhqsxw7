import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getUsers,
  createUser,
  deleteUser,
  updateUserActiveStatus,
  getEmpresas,
  getFiliais,
} from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { UserEditDialog } from '@/components/user-edit-dialog'
import { Loader2, UserPlus, Trash2, Shield, User, AlertCircle, Upload, Pencil } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || ''
const getAvatarUrl = (id: string, avatar: string) =>
  avatar ? `${PB_URL}/api/files/users/${id}/${avatar}` : ''

function validateCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return false
  if (/^(\d)\1{10}$/.test(clean)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i)
  let d = 11 - (sum % 11)
  if (d >= 10) d = 0
  if (d !== parseInt(clean[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i)
  d = 11 - (sum % 11)
  if (d >= 10) d = 0
  return d === parseInt(clean[10])
}

function formatCPF(cpf: string): string {
  const c = cpf.replace(/\D/g, '').slice(0, 11)
  return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

interface UserRecord {
  id: string
  name: string
  email: string
  role: string
  cpf: string
  avatar: string
  created: string
  active?: boolean
  empresa_id?: string
  filial_id?: string
  mfa_enabled?: boolean
  cargo?: string
  departamento?: string
  inactivity_timeout_minutes?: number
}

export function UserManagement() {
  const { isAdmin, user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('PADRAO')
  const [cpf, setCpf] = useState('')
  const [inactivityTimeout, setInactivityTimeout] = useState('480')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [cpfError, setCpfError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')
  const [empresas, setEmpresas] = useState<{ id: string; name: string }[]>([])
  const [filiais, setFiliais] = useState<{ id: string; name: string }[]>([])
  const [editUser, setEditUser] = useState<UserRecord | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const loadUsers = async () => {
    try {
      setUsers((await getUsers()) as unknown as UserRecord[])
    } catch {
      setError('Erro ao carregar usuários.')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
    getEmpresas()
      .then((data) => setEmpresas(data as unknown as { id: string; name: string }[]))
      .catch(() => {})
  }, [])
  useRealtime('users', () => loadUsers())

  useEffect(() => {
    if (empresaId) {
      getFiliais(empresaId)
        .then((data) => setFiliais(data as unknown as { id: string; name: string }[]))
        .catch(() => setFiliais([]))
    } else {
      setFiliais([])
    }
  }, [empresaId])

  const handleCpfChange = (v: string) => {
    const formatted = formatCPF(v)
    setCpf(formatted)
    if (formatted && !validateCPF(formatted)) setCpfError('CPF inválido')
    else setCpfError('')
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Preencha todos os campos.')
      return
    }
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (cpf && !validateCPF(cpf)) {
      setError('CPF inválido.')
      return
    }
    const parsedTimeout = parseInt(inactivityTimeout, 10)
    if (isNaN(parsedTimeout) || parsedTimeout < 1 || parsedTimeout > 480) {
      setError('O tempo de inatividade deve ser um número inteiro entre 1 e 480 minutos.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await createUser({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        cpf: cpf.replace(/\D/g, ''),
        avatar,
        active: true,
        inactivity_timeout_minutes: parsedTimeout,
        empresa_id: empresaId || undefined,
        filial_id: filialId || undefined,
      })
      setName('')
      setEmail('')
      setPassword('')
      setRole('PADRAO')
      setCpf('')
      setInactivityTimeout('480')
      setEmpresaId('')
      setFilialId('')
      setAvatar(null)
      setCpfError('')
      toast({
        title: 'Usuário Criado',
        description: 'Novo usuário cadastrado com sucesso como Ativo.',
      })
    } catch (err: any) {
      if (err?.response?.data?.cpf) setError('CPF já cadastrado.')
      else if (err?.response?.data?.email) setError('E-mail já cadastrado.')
      else setError('Erro ao criar usuário. Tente novamente.')
    }
    setSubmitting(false)
  }

  const handleToggleActive = async (u: UserRecord) => {
    if (!isAdmin) {
      toast({
        title: 'Acesso negado',
        description: 'Apenas usuários com a função SUP podem alterar o status de acesso.',
        variant: 'destructive',
      })
      return
    }

    const nextState = u.active === false ? true : false
    setUpdatingId(u.id)
    try {
      await updateUserActiveStatus(u.id, nextState)
      toast({
        title: 'Status atualizado',
        description: `Usuário ${u.name || u.email} agora está ${nextState ? 'Ativo' : 'Inativo'}.`,
      })
      await loadUsers()
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status do usuário.',
        variant: 'destructive',
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id)
      toast({
        title: 'Usuário Removido',
        description: 'O usuário foi removido com sucesso.',
      })
    } catch {
      setError('Erro ao excluir usuário.')
    }
  }

  const handleEdit = (u: UserRecord) => {
    setEditUser(u)
    setEditOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-[#C89B3C]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5 text-[#005B2E]" /> Criar Novo Usuário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do funcionário"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@empresa.com"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Senha</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">CPF</Label>
              <Input
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder="000.000.000-00"
                className="focus-visible:ring-[#005B2E]"
              />
              {cpfError && <p className="text-xs text-destructive">{cpfError}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Função</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PADRAO">PADRÃO (Funcionário)</SelectItem>
                  <SelectItem value="SUP">SUP (Gestão)</SelectItem>
                  <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
                  <SelectItem value="COMERCIAL">Comercial</SelectItem>
                  <SelectItem value="SDR">SDR</SelectItem>
                  <SelectItem value="Vendedor">Vendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Empresa Vinculada</Label>
              <Select
                value={empresaId}
                onValueChange={(v) => {
                  setEmpresaId(v === '_none_' ? '' : v)
                  setFilialId('')
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      empresas.length ? 'Selecione a empresa' : 'Sem empresas cadastradas (Geral)'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">Sem empresa (Acesso geral / Global)</SelectItem>
                  {empresas.map((em) => (
                    <SelectItem key={em.id} value={em.id}>
                      {em.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Filial Vinculada</Label>
              <Select
                value={filialId}
                onValueChange={(v) => setFilialId(v === '_none_' ? '' : v)}
                disabled={!empresaId}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={!empresaId ? 'Selecione a empresa primeiro' : 'Todas as filiais'}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">Todas as filiais da empresa</SelectItem>
                  {filiais.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                Tempo de inatividade para deslogar (minutos)
              </Label>
              <Input
                type="number"
                min={1}
                max={480}
                value={inactivityTimeout}
                onChange={(e) => setInactivityTimeout(e.target.value)}
                placeholder="Ex: 480"
                className="focus-visible:ring-[#005B2E]"
              />
              <p className="text-[11px] text-muted-foreground">
                Padrão corporativo Jetro: 480 minutos (8 horas). Mínimo 1, máximo 480 min.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Foto de Perfil</Label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-muted/50 transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  {avatar ? avatar.name : 'Escolher arquivo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                  />
                </label>
                {avatar && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setAvatar(null)}>
                    Remover
                  </Button>
                )}
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive col-span-full flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            )}
            <div className="col-span-full">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando...
                  </>
                ) : (
                  'Criar Usuário'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 border-[#005B2E]/20">
        <CardHeader>
          <CardTitle className="text-lg">Usuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((u) => {
                const isActive = u.active !== false
                return (
                  <div
                    key={u.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border hover:bg-[#005B2E]/5 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img
                          src={getAvatarUrl(u.id, u.avatar)}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : u.role === 'SUP' ? (
                        <Shield className="w-5 h-5 text-[#C89B3C]" />
                      ) : (
                        <User className="w-5 h-5 text-[#005B2E]" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{u.name || '—'}</p>
                          {u.mfa_enabled && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                              MFA
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                        <div className="flex flex-wrap gap-x-3">
                          {u.cpf && (
                            <p className="text-xs text-muted-foreground">CPF: {formatCPF(u.cpf)}</p>
                          )}
                          {u.empresa_id && (
                            <p className="text-xs text-muted-foreground">Empresa: {u.empresa_id}</p>
                          )}
                          {u.filial_id && (
                            <p className="text-xs text-muted-foreground">Filial: {u.filial_id}</p>
                          )}
                          {u.cargo && (
                            <p className="text-xs text-muted-foreground">Cargo: {u.cargo}</p>
                          )}
                          <p className="text-xs text-emerald-800 dark:text-emerald-400 font-medium">
                            Inatividade: {u.inactivity_timeout_minutes ?? 480} min
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                      {/* Active / Inactive Status Switch */}
                      <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-full border border-border">
                        <span
                          className={`text-xs font-bold ${
                            isActive
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isActive ? 'Ativo' : 'Inativo'}
                        </span>
                        {isAdmin ? (
                          <Switch
                            checked={isActive}
                            disabled={updatingId === u.id || u.id === (currentUser?.id as string)}
                            onCheckedChange={() => handleToggleActive(u)}
                            className="data-[state=checked]:bg-[#005B2E]"
                          />
                        ) : (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isActive ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                        )}
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded ${
                          u.role === 'SUP'
                            ? 'bg-[#C89B3C]/20 text-[#C89B3C]'
                            : 'bg-[#005B2E]/10 text-[#005B2E]'
                        }`}
                      >
                        {u.role}
                      </span>

                      {isAdmin && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-[#005B2E] hover:bg-[#005B2E]/10"
                          onClick={() => handleEdit(u)}
                          title="Editar usuário"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(u.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <UserEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={editUser}
        onSuccess={loadUsers}
      />
    </div>
  )
}
