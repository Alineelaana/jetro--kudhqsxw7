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
  type FilialRecord,
  getNextUserCodigo,
} from '@/services/users'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { UserEditDialog } from '@/components/user-edit-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getPerfisPermissoes, type PerfilPermissaoRecord } from '@/lib/profile-permissions'
import {
  Loader2,
  UserPlus,
  Trash2,
  Shield,
  User,
  AlertCircle,
  Upload,
  Pencil,
  Plus,
} from 'lucide-react'
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
  login?: string
  role: string
  codigo?: number
  perfil_id?: string
  perfil_acesso?: string
  cpf: string
  avatar: string
  created: string
  active?: boolean
  empresa_id?: string
  filial_id?: string
  empresas_ids?: string[]
  mfa_enabled?: boolean
  cargo?: string
  departamento?: string
  inactivity_timeout_minutes?: number
  expand?: {
    perfil_id?: {
      id: string
      code: string
      name: string
      active?: boolean
    }
  }
}

export function UserManagement() {
  const { isAdmin, user: currentUser } = useAuth()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [nextCodigo, setNextCodigo] = useState<number>(1)
  const [name, setName] = useState('')
  const [loginField, setLoginField] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('PADRAO')
  const [perfilId, setPerfilId] = useState('')
  const [cargo, setCargo] = useState('')
  const [cpf, setCpf] = useState('')
  const [inactivityTimeout, setInactivityTimeout] = useState('480')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [cpfError, setCpfError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [empresaId, setEmpresaId] = useState('')
  const [empresasIds, setEmpresasIds] = useState<string[]>([])
  const [filialId, setFilialId] = useState('')
  const [empresas, setEmpresas] = useState<{ id: string; name: string }[]>([])
  const [filiais, setFiliais] = useState<FilialRecord[]>([])
  const [perfis, setPerfis] = useState<PerfilPermissaoRecord[]>([])
  const [loadingPerfis, setLoadingPerfis] = useState(true)
  const [editUser, setEditUser] = useState<UserRecord | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')

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

    setLoadingPerfis(true)
    getPerfisPermissoes()
      .then((data) => {
        setPerfis(data)
        // Se ainda não selecionou perfil, pré-selecionar PADRAO / Gestão
        const defaultProfile = data.find((p) => p.code?.toUpperCase() === 'PADRAO') || data[0]
        if (defaultProfile) {
          setPerfilId(defaultProfile.id)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPerfis(false))
  }, [])
  useRealtime('users', () => loadUsers())

  useEffect(() => {
    const activeEmpresas = empresasIds.length > 0 ? empresasIds : empresaId ? [empresaId] : []

    if (activeEmpresas.length > 0) {
      getFiliais(activeEmpresas)
        .then((data) => setFiliais(data))
        .catch(() => setFiliais([]))
    } else {
      setFiliais([])
    }
  }, [empresaId, empresasIds])

  const handleCpfChange = (v: string) => {
    const formatted = formatCPF(v)
    setCpf(formatted)
    if (formatted && !validateCPF(formatted)) setCpfError('CPF inválido')
    else setCpfError('')
  }

  const handleOpenNewUser = async () => {
    try {
      const code = await getNextUserCodigo()
      setNextCodigo(code)
    } catch {
      setNextCodigo(8)
    }
    setName('')
    setLoginField('')
    setEmail('')
    setPassword('')
    setRole('PADRAO')
    const defaultProfile = perfis.find((p) => p.code?.toUpperCase() === 'PADRAO') || perfis[0]
    if (defaultProfile) {
      setPerfilId(defaultProfile.id)
    }
    setCargo('')
    setCpf('')
    setInactivityTimeout('480')
    setEmpresaId('')
    setEmpresasIds([])
    setFilialId('')
    setAvatar(null)
    setCpfError('')
    setError('')
    setCreateModalOpen(true)
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
      // Identificar o perfil selecionado
      const selectedPerfil = perfis.find((p) => p.id === perfilId)
      const perfilCode = selectedPerfil?.code || role || 'PADRAO'

      // Se perfil for SUP, o papel legado também é SUP.
      // Se o código for um dos valores do select nativo, replica; senão guarda PADRAO para retrocompatibilidade
      const validRoles = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']
      const effectiveRole = validRoles.includes(perfilCode)
        ? perfilCode
        : validRoles.includes(role)
          ? role
          : 'PADRAO'

      const cleanLogin = loginField.trim().toLowerCase()
      await createUser({
        name: name.trim(),
        email: email.trim(),
        login: cleanLogin || undefined,
        password,
        role: effectiveRole,
        codigo: nextCodigo,
        perfil_id: selectedPerfil?.id || undefined,
        perfil_acesso: perfilCode,
        cargo: cargo.trim() || undefined,
        cpf: cpf.replace(/\D/g, ''),
        avatar,
        active: true,
        inactivity_timeout_minutes: parsedTimeout,
        empresa_id: empresaId || empresasIds[0] || undefined,
        empresas_ids: empresasIds.length > 0 ? empresasIds : empresaId ? [empresaId] : [],
        filial_id: filialId || undefined,
      })
      setCreateModalOpen(false)
      setName('')
      setLoginField('')
      setEmail('')
      setPassword('')
      setRole('PADRAO')
      const defaultProfile = perfis.find((p) => p.code?.toUpperCase() === 'PADRAO') || perfis[0]
      if (defaultProfile) {
        setPerfilId(defaultProfile.id)
      }
      setCargo('')
      setCpf('')
      setInactivityTimeout('480')
      setEmpresaId('')
      setEmpresasIds([])
      setFilialId('')
      setAvatar(null)
      setCpfError('')
      toast({
        title: 'Usuário Criado',
        description: `Novo usuário (Código ${nextCodigo}) cadastrado com sucesso.`,
      })
      await loadUsers()
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
      {/* Top Header com Botão + Novo Cadastro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Gestão de Usuários</h2>
          <p className="text-xs text-muted-foreground">
            Gerencie os usuários do sistema, perfis de acesso, credenciais e empresas vinculadas.
          </p>
        </div>
        <Button
          onClick={handleOpenNewUser}
          className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Cadastro
        </Button>
      </div>

      {/* Lista de Usuários Cadastrados (Aparece aberta como solicitado no Pedido 3) */}
      <Card className="border-2 border-[#005B2E]/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>Usuários Cadastrados</span>
              <span className="text-xs font-normal text-muted-foreground">
                ({users.length} usuário{users.length !== 1 ? 's' : ''})
              </span>
            </CardTitle>
            <div className="w-full sm:w-72">
              <Input
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Buscar por código, login, nome, e-mail..."
                className="h-8 text-xs focus-visible:ring-[#005B2E]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {users
                .filter((u) => {
                  if (!userSearchTerm.trim()) return true
                  const q = userSearchTerm.toLowerCase().trim()
                  const matchCode = u.codigo !== undefined && String(u.codigo).includes(q)
                  const matchLogin = (u.login || '').toLowerCase().includes(q)
                  const matchName = (u.name || '').toLowerCase().includes(q)
                  const matchEmail = (u.email || '').toLowerCase().includes(q)
                  const matchCargo = (u.cargo || '').toLowerCase().includes(q)
                  return matchCode || matchLogin || matchName || matchEmail || matchCargo
                })
                .map((u) => {
                  const isActive = u.active !== false
                  // Determinar nomes das empresas vinculadas
                  const userEmpresasIds: string[] = []
                  if (Array.isArray(u.empresas_ids)) {
                    for (const id of u.empresas_ids) {
                      if (id && !userEmpresasIds.includes(id)) userEmpresasIds.push(id)
                    }
                  } else if (typeof u.empresas_ids === 'string' && u.empresas_ids) {
                    userEmpresasIds.push(u.empresas_ids)
                  }
                  if (u.empresa_id && !userEmpresasIds.includes(u.empresa_id)) {
                    userEmpresasIds.unshift(u.empresa_id)
                  }

                  const empNames = userEmpresasIds
                    .map((id) => empresas.find((e) => e.id === id)?.name || id)
                    .filter(Boolean)

                  return (
                    <div
                      key={u.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border hover:bg-[#005B2E]/5 transition-colors gap-3"
                    >
                      <div className="flex items-center gap-3">
                        {/* Coluna / Badge de Código */}
                        <div className="flex flex-col items-center justify-center min-w-[50px] px-2 py-1 bg-[#C89B3C]/10 border border-[#C89B3C]/30 rounded-md">
                          <span className="text-[10px] uppercase font-bold text-[#8a681c] dark:text-[#E4C46A]">
                            Cód.
                          </span>
                          <span className="text-sm font-mono font-bold text-[#005B2E]">
                            {u.codigo !== undefined && u.codigo !== null ? u.codigo : '—'}
                          </span>
                        </div>

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
                            {u.login && (
                              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                                @{u.login}
                              </span>
                            )}
                            {u.mfa_enabled && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                MFA
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                            {u.cpf && <span>CPF: {formatCPF(u.cpf)}</span>}
                            {empNames.length > 0 ? (
                              <span className="inline-flex items-center gap-1">
                                <span className="font-medium text-foreground">Empresas:</span>
                                {empNames.map((name, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-emerald-50 dark:bg-emerald-950/60 text-[#005B2E] dark:text-emerald-300 font-semibold px-1.5 py-0.5 rounded text-[11px] border border-emerald-200 dark:border-emerald-800"
                                  >
                                    {name}
                                  </span>
                                ))}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">Geral / Global</span>
                            )}
                            {u.cargo && <span>Cargo: {u.cargo}</span>}
                            <span className="text-emerald-800 dark:text-emerald-400 font-medium">
                              Inatividade: {u.inactivity_timeout_minutes ?? 480} min
                            </span>
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

                        {(() => {
                          const displayPerfil =
                            u.expand?.perfil_id?.name ||
                            perfis.find((p) => p.id === u.perfil_id || p.code === u.perfil_acesso)
                              ?.name ||
                            u.perfil_acesso ||
                            (u.role === 'PADRAO' ? 'Gestão' : u.role)
                          const isSup = (u.perfil_acesso || u.role) === 'SUP'
                          return (
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded ${
                                isSup
                                  ? 'bg-[#C69B45]/20 text-[#063D30] border border-[#C69B45]/40 font-black'
                                  : 'bg-[#063D30]/10 text-[#063D30]'
                              }`}
                              title={`Perfil: ${displayPerfil}`}
                            >
                              {displayPerfil}
                            </span>
                          )
                        })()}
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

      {/* Diálogo / Modal de Criação de Usuário (Pedido 1 e 3) */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="w-5 h-5 text-[#005B2E]" /> Criar Novo Usuário
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Campo CÓDIGO: Numérico, automático e sequencial, NÃO editável (somente leitura) */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold flex items-center justify-between">
                <span>Código</span>
                <span className="text-[11px] text-[#C89B3C] font-semibold">
                  Automático e Sequencial
                </span>
              </Label>
              <Input
                value={nextCodigo}
                readOnly
                disabled
                className="bg-muted/70 font-mono font-bold text-[#005B2E] cursor-not-allowed select-none"
              />
              <p className="text-[11px] text-muted-foreground">
                Identificador numérico do usuário (somente leitura).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Nome (Saudação)</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do funcionário (ex.: Patrícia Brum)"
                className="focus-visible:ring-[#005B2E]"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Usado para a saudação da página inicial (&quot;Bom dia, [Nome]&quot;).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Login do Usuário</Label>
              <Input
                value={loginField}
                onChange={(e) =>
                  setLoginField(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))
                }
                placeholder="login (ex.: patricia ou patricia.dec)"
                className="focus-visible:ring-[#005B2E]"
                autoCapitalize="none"
              />
              <p className="text-[11px] text-muted-foreground">
                Identificador de acesso (sem espaços, aceita pontos para sobrenomes/empresa).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@empresa.com"
                className="focus-visible:ring-[#005B2E]"
                required
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
                required
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

            {/* Perfil de Acesso */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-sm font-semibold flex items-center justify-between">
                <span>Perfil de Acesso (Perfis e Permissões)</span>
                <span className="text-[11px] text-[#C69B45] font-medium">
                  Delimita telas & menus
                </span>
              </Label>
              <Select
                value={perfilId}
                onValueChange={(val) => {
                  setPerfilId(val)
                  const chosen = perfis.find((p) => p.id === val)
                  if (chosen) {
                    const c = chosen.code?.toUpperCase()
                    if (
                      ['SUP', 'PADRAO', 'FINANCEIRO', 'COMERCIAL', 'SDR', 'Vendedor'].includes(c)
                    ) {
                      setRole(c)
                    }
                  }
                }}
                disabled={loadingPerfis}
              >
                <SelectTrigger className="border-2 border-[#063D30]/30 focus:ring-[#063D30]">
                  <SelectValue
                    placeholder={
                      loadingPerfis ? 'Carregando perfis...' : 'Selecione o perfil de acesso'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {perfis.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{p.name || p.code}</span>
                        <span className="text-xs text-muted-foreground font-mono">({p.code})</span>
                        {p.active === false && (
                          <span className="text-[10px] text-destructive bg-destructive/10 px-1 py-0.2 rounded font-medium">
                            Inativo
                          </span>
                        )}
                        {p.code?.toUpperCase() === 'SUP' && (
                          <span className="text-[10px] text-[#C69B45] font-bold">
                            (Acesso Total)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Setor</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PADRAO">Gestão / Administrativo</SelectItem>
                  <SelectItem value="SUP">SUP (Administrador Geral)</SelectItem>
                  <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
                  <SelectItem value="COMERCIAL">Comercial</SelectItem>
                  <SelectItem value="SDR">SDR / Pré-Vendas</SelectItem>
                  <SelectItem value="Vendedor">Vendas / Campo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Cargo / Função</Label>
              <Input
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex.: Analista Financeiro, Gerente de Vendas..."
                className="focus-visible:ring-[#005B2E]"
              />
            </div>

            {/* Bloco Multiempresa: Seleção Múltipla */}
            <div className="space-y-2 sm:col-span-2 rounded-lg border p-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Empresas Vinculadas (Multiempresa)</Label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {empresasIds.length} selecionada(s)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Marque todas as empresas em que o usuário terá acesso (ex.: Dec Eldorado e Gran
                Romano).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {empresas.map((em) => {
                  const checked = empresasIds.includes(em.id)
                  const isPrimary = (empresaId || empresasIds[0]) === em.id
                  return (
                    <label
                      key={em.id}
                      className={`flex items-center justify-between p-2 rounded-md border text-sm cursor-pointer transition-colors ${
                        checked
                          ? 'border-[#005B2E]/50 bg-[#005B2E]/5 font-medium'
                          : 'border-border/60 hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const next = [...empresasIds, em.id]
                              setEmpresasIds(next)
                              if (!empresaId) setEmpresaId(em.id)
                            } else {
                              const next = empresasIds.filter((id) => id !== em.id)
                              setEmpresasIds(next)
                              if (empresaId === em.id) {
                                setEmpresaId(next[0] || '')
                              }
                            }
                          }}
                          className="rounded border-border text-[#005B2E] focus:ring-[#005B2E]"
                        />
                        <span>{em.name}</span>
                      </div>
                      {checked && isPrimary && (
                        <span className="text-[10px] bg-[#005B2E]/10 text-[#005B2E] font-bold px-1.5 py-0.5 rounded uppercase">
                          Padrão
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>

              {empresasIds.length > 0 && (
                <div className="pt-2 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Empresa Padrão / Principal</Label>
                    <Select
                      value={empresaId || empresasIds[0]}
                      onValueChange={(v) => {
                        setEmpresaId(v)
                        setFilialId('')
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Selecione a empresa padrão" />
                      </SelectTrigger>
                      <SelectContent>
                        {empresas
                          .filter((em) => empresasIds.includes(em.id))
                          .map((em) => (
                            <SelectItem key={em.id} value={em.id} className="text-xs">
                              {em.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Filial Padrão</Label>
                    <Select
                      value={filialId || '_none_'}
                      onValueChange={(v) => setFilialId(v === '_none_' ? '' : v)}
                      disabled={!empresaId && empresasIds.length === 0}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Todas as filiais" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none_" className="text-xs">
                          Todas as filiais
                        </SelectItem>
                        {filiais.map((f) => {
                          const prefix = f.empresa_name ? `[${f.empresa_name}] ` : ''
                          return (
                            <SelectItem key={f.id} value={f.id} className="text-xs">
                              {prefix}
                              {f.name}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
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
                Padrão corporativo: 480 min (8 horas).
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

            <div className="col-span-full flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancelar
              </Button>
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
                  'Salvar Usuário'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <UserEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        user={editUser}
        onSuccess={loadUsers}
        onError={(err) => {
          toast({
            title: 'Erro ao atualizar usuário',
            description: err.message || 'Erro ao atualizar usuário. Tente novamente.',
            variant: 'destructive',
          })
        }}
      />
    </div>
  )
}
