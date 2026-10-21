import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  updateUser,
  getEmpresas,
  getFiliais,
  UserUpdateError,
  type FilialRecord,
} from '@/services/users'
import { getPerfisPermissoes, type PerfilPermissaoRecord } from '@/lib/profile-permissions'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { Loader2, Upload, KeyRound } from 'lucide-react'

interface UserEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    id: string
    name: string
    email: string
    codigo?: number
    login?: string
    username?: string
    role: string
    perfil_id?: string
    perfil_acesso?: string
    cpf: string
    empresa_id?: string
    empresas_ids?: string[]
    filial_id?: string
    cargo?: string
    departamento?: string
    inactivity_timeout_minutes?: number
  } | null
  onSuccess: () => void
  onError?: (err: Error) => void
}

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

export function UserEditDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
  onError,
}: UserEditDialogProps) {
  const { user: currentUser } = useAuth()
  const [name, setName] = useState('')
  const [loginField, setLoginField] = useState('')
  const [role, setRole] = useState('PADRAO')
  const [perfilId, setPerfilId] = useState('')
  const [cpf, setCpf] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [empresaId, setEmpresaId] = useState('')
  const [empresasIds, setEmpresasIds] = useState<string[]>([])
  const [filialId, setFilialId] = useState('')
  const [cargo, setCargo] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [inactivityTimeout, setInactivityTimeout] = useState('480')
  const [empresas, setEmpresas] = useState<{ id: string; name: string }[]>([])
  const [filiais, setFiliais] = useState<FilialRecord[]>([])
  const [perfis, setPerfis] = useState<PerfilPermissaoRecord[]>([])
  const [loadingPerfis, setLoadingPerfis] = useState(false)

  useEffect(() => {
    setLoadingPerfis(true)
    getPerfisPermissoes()
      .then((data) => setPerfis(data))
      .catch(() => {})
      .finally(() => setLoadingPerfis(false))
  }, [])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setLoginField(user.login || user.username || (user.email ? user.email.split('@')[0] : ''))
      const userRoleCode = user.role || 'PADRAO'
      setRole(userRoleCode)
      setCpf(user.cpf ? formatCPF(user.cpf) : '')
      setCpfError('')
      setNewPassword('')
      setOldPassword('')
      setAvatar(null)
      setError('')
      const singleEmpresa = user.empresa_id || ''
      setEmpresaId(singleEmpresa)

      // Extrair lista de empresasIds do usuário
      const rawIds = (user.empresas_ids as unknown) || []
      const initialIds: string[] = []
      if (Array.isArray(rawIds)) {
        for (const it of rawIds) {
          const s = String(it || '').trim()
          if (s && !initialIds.includes(s)) initialIds.push(s)
        }
      } else if (typeof rawIds === 'string' && rawIds.trim()) {
        initialIds.push(rawIds.trim())
      }
      if (singleEmpresa && !initialIds.includes(singleEmpresa)) {
        initialIds.push(singleEmpresa)
      }
      setEmpresasIds(initialIds)

      setFilialId(user.filial_id || '')
      setCargo(user.cargo || '')
      setDepartamento(user.departamento || '')
      setInactivityTimeout(
        user.inactivity_timeout_minutes !== undefined && user.inactivity_timeout_minutes !== null
          ? String(user.inactivity_timeout_minutes)
          : '480',
      )

      if (user.perfil_id) {
        setPerfilId(user.perfil_id)
      } else if (perfis.length > 0) {
        const found = perfis.find(
          (p) =>
            p.id === user.perfil_id ||
            p.code?.toUpperCase() === (user.perfil_acesso || userRoleCode).toUpperCase() ||
            p.name?.toUpperCase() === (user.perfil_acesso || userRoleCode).toUpperCase(),
        )
        if (found) setPerfilId(found.id)
      }
    }
  }, [user, perfis])

  useEffect(() => {
    getEmpresas()
      .then((data) => setEmpresas(data as unknown as { id: string; name: string }[]))
      .catch(() => {})
  }, [])

  useEffect(() => {
    // Determinar quais empresas estão selecionadas (multiempresa ou empresa padrão)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!name.trim()) {
      setError('Nome é obrigatório.')
      return
    }
    if (cpf && !validateCPF(cpf)) {
      setError('CPF inválido.')
      return
    }
    if (newPassword && newPassword.length < 8) {
      setError('A nova senha deve ter no mínimo 8 caracteres.')
      return
    }
    const isSelfEdit = !!(user && currentUser?.id && user.id === currentUser.id)
    if (isSelfEdit && newPassword && !oldPassword) {
      setError('Informe a senha atual para confirmar a alteração de senha.')
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
      const selectedPerfil = perfis.find((p) => p.id === perfilId)
      const perfilCode = selectedPerfil?.code || role || 'PADRAO'

      const validRoles = ['SUP', 'PADRAO', 'SDR', 'Vendedor', 'FINANCEIRO', 'COMERCIAL']
      const effectiveRole = validRoles.includes(perfilCode)
        ? perfilCode
        : validRoles.includes(role)
          ? role
          : 'PADRAO'

      const cleanLogin = loginField.trim().toLowerCase()
      await updateUser(user.id, {
        name: name.trim(),
        login: cleanLogin || undefined,
        role: effectiveRole,
        perfil_id: selectedPerfil?.id || undefined,
        perfil_acesso: perfilCode,
        cpf: cpf.replace(/\D/g, ''),
        password: newPassword || undefined,
        passwordConfirm: newPassword || undefined,
        oldPassword: isSelfEdit && newPassword && oldPassword ? oldPassword : undefined,
        avatar,
        empresa_id: empresaId || empresasIds[0] || undefined,
        empresas_ids: empresasIds,
        filial_id: filialId,
        cargo: cargo.trim() || undefined,
        departamento: departamento.trim() || undefined,
        inactivity_timeout_minutes: parsedTimeout,
      })
      toast({
        title: 'Usuário Atualizado',
        description: 'Os dados do usuário foram salvos com sucesso.',
      })
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      let finalMessage = 'Erro ao atualizar usuário. Tente novamente.'
      if (err instanceof UserUpdateError) {
        finalMessage = err.message
      } else if (err?.response?.data?.cpf) {
        finalMessage = 'CPF já cadastrado.'
      } else if (err?.response?.data?.email) {
        finalMessage = 'E-mail já cadastrado.'
      } else if (err?.message) {
        finalMessage = err.message
      }
      setError(finalMessage)
      if (onError && err instanceof Error) {
        onError(err)
      } else {
        toast({
          title: 'Erro ao atualizar usuário',
          description: finalMessage,
          variant: 'destructive',
        })
      }
    }
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#005B2E]" /> Editar Usuário
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo CÓDIGO - Somente Leitura (Pedido 1) */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold flex items-center justify-between">
              <span>Código do Usuário</span>
              <span className="text-[11px] text-[#C89B3C] font-semibold">Somente Leitura</span>
            </Label>
            <Input
              value={user?.codigo !== undefined && user?.codigo !== null ? user.codigo : '—'}
              readOnly
              disabled
              className="bg-muted/70 font-mono font-bold text-[#005B2E] cursor-not-allowed select-none"
            />
            <p className="text-[11px] text-muted-foreground">
              Identificador numérico do usuário no sistema.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Nome (Saudação)</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do funcionário (ex.: Patrícia Brum)"
              className="focus-visible:ring-[#005B2E]"
            />
            <p className="text-[11px] text-muted-foreground">
              Usado exclusivamente para a saudação da página inicial (&quot;Bom dia, [Nome]&quot;).
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Login do Usuário</Label>
            <Input
              value={loginField}
              onChange={(e) =>
                setLoginField(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))
              }
              placeholder="login (ex.: patricia ou patricia.brum)"
              className="focus-visible:ring-[#005B2E]"
              autoCapitalize="none"
            />
            <p className="text-[11px] text-muted-foreground">
              Identificador único para entrar no sistema (sem espaços, aceita pontos para
              sobrenomes).
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-muted-foreground">
              E-mail (não editável)
            </Label>
            <Input value={user?.email || ''} disabled className="bg-muted/50" />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            {/* Campo Perfil de Acesso (Perfis e Permissões) */}
            <div className="space-y-1.5">
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
                    placeholder={loadingPerfis ? 'Carregando perfis...' : 'Selecione o perfil'}
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
              <p className="text-[11px] text-muted-foreground">
                Define exatamente quais telas e menus o usuário poderá visualizar e operar no ERP.
              </p>
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
          {/* Seção Multiempresa */}
          <div className="space-y-3 rounded-lg border p-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <span>Empresas Vinculadas (Multiempresa)</span>
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono">
                {empresasIds.length} selecionada(s)
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Marque as empresas às quais o usuário terá permissão de acesso simultâneo.
            </p>
            <div className="space-y-2">
              {empresas.map((em) => {
                const checked = empresasIds.includes(em.id)
                const isPrimary = (empresaId || empresasIds[0]) === em.id
                return (
                  <label
                    key={em.id}
                    className={`flex items-center justify-between p-2 rounded-md border text-sm cursor-pointer transition-colors ${
                      checked
                        ? 'border-[#005B2E]/40 bg-[#005B2E]/5'
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
                      <span className="font-medium text-foreground">{em.name}</span>
                    </div>
                    {checked && isPrimary && (
                      <span className="text-[10px] bg-[#005B2E]/10 text-[#005B2E] font-bold px-1.5 py-0.5 rounded uppercase">
                        Primária
                      </span>
                    )}
                  </label>
                )
              })}
            </div>

            <div className="pt-2 border-t border-border/50 grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Empresa Padrão / Principal</Label>
                <Select
                  value={empresaId || empresasIds[0] || ''}
                  onValueChange={(v) => {
                    setEmpresaId(v)
                    if (v && !empresasIds.includes(v)) {
                      setEmpresasIds([...empresasIds, v])
                    }
                  }}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Selecione a padrão" />
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
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Departamento (opcional)</Label>
            <Input
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              placeholder="Departamento / Área interna"
              className="focus-visible:ring-[#005B2E]"
            />
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
            <p className="text-xs text-muted-foreground">
              Define quanto tempo o usuário pode permanecer ocioso antes de ser deslogado
              automaticamente (1 a 480 min). Padrão corporativo Jetro: 480 minutos (8 horas).
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Nova Senha (opcional)</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Deixe em branco para manter a atual"
              className="focus-visible:ring-[#005B2E]"
            />
            <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
          </div>
          {/* Campo Senha Atual: aparece APENAS quando o usuário sendo editado é o próprio usuário logado E o campo "Nova senha (opcional)" estiver preenchido */}
          {user && currentUser?.id && user.id === currentUser.id && newPassword.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Senha Atual (confirmação)</Label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                className="focus-visible:ring-[#005B2E]"
              />
              <p className="text-xs text-muted-foreground">
                Exigida pelo sistema de segurança para confirmar a alteração da sua própria senha.
              </p>
            </div>
          )}
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
          {error && <p className="text-sm text-destructive flex items-center gap-1">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-[#005B2E] hover:bg-[#01361D] text-white font-bold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
