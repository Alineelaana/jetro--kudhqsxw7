import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  LogOut,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useBrand } from '@/hooks/use-brand'
import { registerAuditLog } from '@/services/audit-logs'
import logoHuram from '@/assets/logo-huram-em-verde-e-dourado-1-6c1c1.png'
import logoDecEldorado from '@/assets/logotipo-dourado-deceeldorado-em-azul-royal-8cf58.png'
import logoGranRomano from '@/assets/rotulo-vintage-gran-romano-5bdf7.png'

interface ForcePasswordResetScreenProps {
  onSuccess?: () => void
}

export function ForcePasswordResetScreen({ onSuccess }: ForcePasswordResetScreenProps) {
  const { user, clearMustChangePassword, signOut } = useAuth()
  const { brand } = useBrand()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Respeita a identidade da marca ativa (Dec Eldorado, Gran Romano ou HURAM padrão)
  const brandName = brand?.nomeExibicao || 'HURAM ERP'
  const brandLogo =
    brand?.logoUrl ||
    (brandName.toLowerCase().includes('eldorado')
      ? logoDecEldorado
      : brandName.toLowerCase().includes('romano')
        ? logoGranRomano
        : logoHuram)

  const corPrimaria = brand?.corPrimaria || '#0B3D2E'
  const corSecundaria = brand?.corSecundaria || '#D4A537'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validações
    if (!newPassword.trim()) {
      setError('Por favor, digite a nova senha.')
      return
    }

    if (newPassword.length < 8) {
      setError('A nova senha deve possuir no mínimo 8 caracteres.')
      return
    }

    if (!confirmPassword.trim()) {
      setError('Por favor, confirme a nova senha.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem. Digite a mesma senha nos dois campos.')
      return
    }

    if (!user?.id) {
      setError('Sessão inválida. Por favor, saia e entre novamente.')
      return
    }

    setSubmitting(true)
    try {
      // 1. Atualizar a senha e desativar as flags de redefinição obrigatória
      await pb.collection('users').update(user.id, {
        password: newPassword,
        passwordConfirm: confirmPassword,
        force_password_change: false,
        must_change_password: false,
      })

      // 2. Registrar evento de auditoria: redefinição de senha pelo próprio usuário
      try {
        await registerAuditLog({
          action: 'user_password_reset_forced',
          module: 'usuarios',
          target_collection: 'users',
          target_id: user.id,
          target_summary: `Usuário ${(user.name as string) || (user.email as string) || (user.login as string)} redefiniu sua senha obrigatória com sucesso no primeiro acesso`,
          criticidade: 'Alta',
          new_value: {
            force_password_change: false,
            must_change_password: false,
            changed_at: new Date().toISOString(),
          },
        })
      } catch (auditErr) {
        // Log de erro sem quebrar o fluxo de login
        console.warn('Falha ao gravar auditoria da troca de senha:', auditErr)
      }

      // 3. Atualizar estado local de autenticação
      clearMustChangePassword()
      setSuccess(true)

      // Aguarda feedback visual antes de liberar
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        }
      }, 900)
    } catch (err: unknown) {
      console.error('Erro ao redefinir nova senha:', err)
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível salvar a nova senha. Verifique se atende aos critérios do sistema e tente novamente.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const passwordsMatch = !!newPassword && !!confirmPassword && newPassword === confirmPassword
  const hasMinLength = newPassword.length >= 8

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden antialiased selection:bg-[#D4A537]/20 selection:text-[#0B3D2E] p-4 sm:p-6"
      style={{
        background:
          'radial-gradient(circle at 10% 20%, #F5F9F7 0%, #FFFFFF 35%, #F0F6F3 70%, #E6EFEA 100%)',
      }}
    >
      {/* Topo: Logo e opção de Sair */}
      <header className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <img
            src={brandLogo}
            alt={brandName}
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-sm"
          />
          <div className="hidden sm:block">
            <span className="block text-xs uppercase tracking-wider font-bold text-[#0B3D2E]/70">
              Segurança & Acesso
            </span>
            <span className="text-sm font-bold text-[#0B3D2E]">{brandName}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={signOut}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0B3D2E]/80 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
          title="Encerrar sessão"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair</span>
        </button>
      </header>

      {/* Conteúdo Central: Card de Redefinição de Senha */}
      <main className="relative z-10 w-full max-w-md mx-auto my-auto py-6">
        <div
          className="relative rounded-[28px] p-[2.5px] shadow-2xl transition-all"
          style={{
            background:
              'linear-gradient(145deg, #FFFFFF 0%, #D4A537 24%, #0B3D2E 60%, #D4A537 100%)',
            boxShadow:
              '0 24px 60px rgba(0,0,0,0.10), 0 10px 26px rgba(212,165,55,0.20), inset 0 1px 2px rgba(255,255,255,1)',
          }}
        >
          <div className="relative w-full rounded-[25.5px] bg-white px-6 sm:px-8 py-7 sm:py-8 overflow-hidden">
            {/* Ícone de Destaque */}
            <div className="flex justify-center mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner"
                style={{
                  background: 'linear-gradient(135deg, #0B3D2E 0%, #116B50 100%)',
                  color: '#FFFFFF',
                }}
              >
                <KeyRound className="w-7 h-7 text-[#D4A537]" />
              </div>
            </div>

            {/* Título e orientações */}
            <div className="text-center space-y-1.5 mb-6">
              <h1
                className="text-xl sm:text-2xl font-serif font-extrabold tracking-tight"
                style={{
                  background:
                    'linear-gradient(135deg, #051C15 0%, #0B3D2E 40%, #D4A537 80%, #0B3D2E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Criar Nova Senha
              </h1>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                Por motivos de segurança corporativa, foi solicitada a criação de uma nova senha
                para o seu próximo acesso. Defina sua nova senha para continuar.
              </p>
              {user?.email && (
                <div className="pt-1">
                  <span className="inline-block text-[11px] font-semibold text-[#0B3D2E] bg-[#0B3D2E]/5 border border-[#0B3D2E]/15 px-2.5 py-0.5 rounded-full">
                    Usuário: {(user.name as string) || (user.email as string)}
                  </span>
                </div>
              )}
            </div>

            {/* Sucesso */}
            {success ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
                <h2 className="text-lg font-bold text-emerald-800">Senha alterada com sucesso!</h2>
                <p className="text-xs text-muted-foreground">
                  Acessando o sistema agora. Aguarde um instante...
                </p>
              </div>
            ) : (
              /* Formulário com os campos solicitados */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Campo: Nova senha */}
                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="reset-new-password"
                    className="text-xs sm:text-sm font-bold text-[#0B3D2E] flex items-center justify-between"
                  >
                    <span>Nova senha</span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                      Mínimo 8 dígitos
                    </span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B3D2E]/55 group-focus-within:text-[#D4A537] transition-colors" />
                    <input
                      id="reset-new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        setError(null)
                      }}
                      placeholder="Digite sua nova senha"
                      className="w-full pl-10 pr-10 h-11 sm:h-12 rounded-xl bg-white border border-[#D4A537]/50 text-[#0B3D2E] placeholder:text-[#0B3D2E]/40 focus:outline-none focus:border-[#D4A537] focus:ring-2 focus:ring-[#D4A537]/25 text-sm transition-all"
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0B3D2E]/55 hover:text-[#0B3D2E] p-1 rounded-md focus:outline-none transition-colors cursor-pointer"
                      aria-label={showNewPassword ? 'Ocultar nova senha' : 'Visualizar nova senha'}
                      title={showNewPassword ? 'Ocultar' : 'Visualizar'}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. Campo: Confirmar nova senha */}
                <div className="space-y-1.5 text-left">
                  <label
                    htmlFor="reset-confirm-password"
                    className="text-xs sm:text-sm font-bold text-[#0B3D2E]"
                  >
                    Confirmar nova senha
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B3D2E]/55 group-focus-within:text-[#D4A537] transition-colors" />
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        setError(null)
                      }}
                      placeholder="Repita sua nova senha"
                      className="w-full pl-10 pr-10 h-11 sm:h-12 rounded-xl bg-white border border-[#D4A537]/50 text-[#0B3D2E] placeholder:text-[#0B3D2E]/40 focus:outline-none focus:border-[#D4A537] focus:ring-2 focus:ring-[#D4A537]/25 text-sm transition-all"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0B3D2E]/55 hover:text-[#0B3D2E] p-1 rounded-md focus:outline-none transition-colors cursor-pointer"
                      aria-label={
                        showConfirmPassword
                          ? 'Ocultar confirmação de senha'
                          : 'Visualizar confirmação de senha'
                      }
                      title={showConfirmPassword ? 'Ocultar' : 'Visualizar'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Indicadores de requisitos de senha */}
                <div className="bg-[#0B3D2E]/5 rounded-xl p-3 text-xs space-y-1 border border-[#0B3D2E]/10">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        hasMinLength ? 'bg-emerald-600' : 'bg-muted-foreground/40'
                      }`}
                    />
                    <span
                      className={
                        hasMinLength ? 'text-emerald-700 font-semibold' : 'text-muted-foreground'
                      }
                    >
                      Mínimo de 8 caracteres
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        passwordsMatch ? 'bg-emerald-600' : 'bg-muted-foreground/40'
                      }`}
                    />
                    <span
                      className={
                        passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-muted-foreground'
                      }
                    >
                      Senhas digitadas são idênticas
                    </span>
                  </div>
                </div>

                {/* Mensagem de Erro */}
                {error && (
                  <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 rounded-xl p-3 border border-red-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                    <span className="font-medium leading-relaxed">{error}</span>
                  </div>
                )}

                {/* Botão: Confirmar */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !newPassword || !confirmPassword}
                    className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-[#1A1203] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-[0_10px_24px_rgba(212,165,55,0.45),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:shadow-[0_12px_30px_rgba(212,165,55,0.58)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background:
                        'linear-gradient(180deg, #FDF1D6 0%, #E8C36A 24%, #D4A537 60%, #B38622 100%)',
                      border: '1px solid #ECC974',
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#1A1203]" />
                        <span>Salvando nova senha...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A1203]" />
                        <span>Confirmar</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Rodapé de segurança */}
            <div className="mt-5 pt-3 border-t border-[#D4A537]/30 text-center">
              <span className="text-[11px] font-semibold text-[#0B3D2E]/80 tracking-tight">
                Ambiente Corporativo Seguro &bull; ERP HURAM
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé com assinatura institucional */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto py-2 text-center text-[11px] text-[#0B3D2E]/70">
        &copy; {new Date().getFullYear()} {brandName} &bull; Desenvolvido sobre a plataforma HURAM
      </footer>
    </div>
  )
}
