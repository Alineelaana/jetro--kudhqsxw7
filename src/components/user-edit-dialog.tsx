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
import { updateUser, getEmpresas, getFiliais } from '@/services/users'
import { Loader2, Upload, KeyRound } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface UserEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: {
    id: string
    name: string
    email: string
    role: string
    cpf: string
    empresa_id?: string
    filial_id?: string
    cargo?: string
    departamento?: string
    inactivity_timeout_minutes?: number
  } | null
  onSuccess: () => void
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

export function UserEditDialog({ open, onOpenChange, user, onSuccess }: UserEditDialogProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('PADRAO')
  const [cpf, setCpf] = useState('')
  const [cpfError, setCpfError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [empresaId, setEmpresaId] = useState('')
  const [filialId, setFilialId] = useState('')
  const [cargo, setCargo] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [inactivityTimeout, setInactivityTimeout] = useState('480')
  const [empresas, setEmpresas] = useState<{ id: string; name: string }[]>([])
  const [filiais, setFiliais] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setRole(user.role || 'PADRAO')
      setCpf(user.cpf ? formatCPF(user.cpf) : '')
      setCpfError('')
      setNewPassword('')
      setAvatar(null)
      setError('')
      setEmpresaId(user.empresa_id || '')
      setFilialId(user.filial_id || '')
      setCargo(user.cargo || '')
      setDepartamento(user.departamento || '')
      setInactivityTimeout(
        user.inactivity_timeout_minutes !== undefined && user.inactivity_timeout_minutes !== null
          ? String(user.inactivity_timeout_minutes)
          : '480',
      )
    }
  }, [user])

  useEffect(() => {
    getEmpresas()
      .then((data) => setEmpresas(data as unknown as { id: string; name: string }[]))
      .catch(() => {})
  }, [])

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
    const parsedTimeout = parseInt(inactivityTimeout, 10)
    if (isNaN(parsedTimeout) || parsedTimeout < 1 || parsedTimeout > 480) {
      setError('O tempo de inatividade deve ser um número inteiro entre 1 e 480 minutos.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await updateUser(user.id, {
        name: name.trim(),
        role,
        cpf: cpf.replace(/\D/g, ''),
        password: newPassword || undefined,
        avatar,
        empresa_id: empresaId,
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
      if (err?.response?.data?.cpf) setError('CPF já cadastrado.')
      else if (err?.response?.data?.email) setError('E-mail já cadastrado.')
      else setError('Erro ao atualizar usuário. Tente novamente.')
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
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Função</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PADRAO">Gestão</SelectItem>
                  <SelectItem value="SUP">SUP (Administrador)</SelectItem>
                  <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
                  <SelectItem value="COMERCIAL">Comercial</SelectItem>
                  <SelectItem value="SDR">SDR</SelectItem>
                  <SelectItem value="Vendedor">Vendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Empresa</Label>
              <Select
                value={empresaId}
                onValueChange={(v) => {
                  setEmpresaId(v)
                  setFilialId('')
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as empresas</SelectItem>
                  {empresas.map((em) => (
                    <SelectItem key={em.id} value={em.id}>
                      {em.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Filial</Label>
              <Select value={filialId} onValueChange={setFilialId} disabled={!empresaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as filiais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as filiais</SelectItem>
                  {filiais.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Cargo</Label>
              <Input
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Cargo do funcionário"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">Departamento</Label>
              <Input
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                placeholder="Departamento"
                className="focus-visible:ring-[#005B2E]"
              />
            </div>
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
