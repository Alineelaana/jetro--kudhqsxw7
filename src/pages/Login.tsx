import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { type FieldErrors } from '@/lib/pocketbase/errors'
import { Lock, User, AlertCircle, Loader2, Globe, ShieldCheck, ChevronRight } from 'lucide-react'
import { MfaVerifyScreen } from '@/components/mfa-verify-screen'
import logoJetro from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-7232a.jpeg'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, loading, mfaRequired, mfaLoginVerify, mfaCancel } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/admin', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  const clearErrors = () => {
    if (error) setError('')
    if (Object.keys(fieldErrors).length > 0) setFieldErrors({})
  }

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value)
    clearErrors()
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    clearErrors()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Preencha todos os campos.')
      setFieldErrors({})
      return
    }
    setSubmitting(true)
    setError('')
    setFieldErrors({})
    const { error: loginError, fieldErrors: fErrors } = await login(username.trim(), password)
    setSubmitting(false)
    if (loginError) {
      setError(loginError)
      setFieldErrors(fErrors || {})
    } else {
      navigate('/admin')
    }
  }

  const hasFieldError = !!fieldErrors.email || !!fieldErrors.username || !!fieldErrors.password

  if (mfaRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#001c10] via-[#002817] to-[#00140b] flex items-center justify-center p-4">
        <MfaVerifyScreen onVerify={mfaLoginVerify} onCancel={mfaCancel} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#001c10] via-[#002817] to-[#00140b] flex flex-col justify-between relative overflow-hidden text-white">
      {/* Elementos visuais decorativos de fundo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#005B2E]/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#C89B3C]/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,155,60,0.06)_0%,transparent_70%)]" />
      </div>

      {/* Topo com botão de acesso institucional */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between border-b border-[#C89B3C]/20 bg-[#001c10]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            src={logoJetro}
            alt="Jetro"
            className="h-9 sm:h-11 w-auto object-contain rounded-lg border border-[#C89B3C]/30 shadow-md"
          />
          <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-[#E5B85C] font-extrabold">
            Acesso ao Sistema
          </span>
        </div>

        <Button
          asChild
          variant="outline"
          className="border-[#C89B3C] bg-[#002817]/80 hover:bg-[#C89B3C] text-[#E5B85C] hover:text-[#002817] font-bold text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-xl transition-all shadow-md group"
        >
          <Link to="/site" className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#E5B85C] group-hover:text-[#002817] transition-colors" />
            <span>Acesse o site do Jetro</span>
            <ChevronRight className="w-4 h-4 text-[#E5B85C] group-hover:text-[#002817] transition-colors" />
          </Link>
        </Button>
      </header>

      {/* Área central com Card de Login */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <Card className="w-full max-w-md border-2 border-[#C89B3C]/40 bg-white/95 backdrop-blur-xl shadow-2xl text-foreground rounded-2xl overflow-hidden animate-fade-in">
          <CardHeader className="bg-gradient-to-b from-[#002817] to-[#01361D] text-white border-b border-[#C89B3C]/40 pb-6 pt-7 px-6 text-center flex flex-col items-center relative">
            <div className="relative mb-3 group">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#C89B3C] to-[#E5B85C] opacity-75 blur-sm group-hover:opacity-100 transition duration-500" />
              <img
                src={logoJetro}
                alt="Jetro - Plataforma Inteligente de Gestão Empresarial"
                className="relative h-20 sm:h-24 w-auto object-contain rounded-2xl border-2 border-[#C89B3C]/60 p-1.5 bg-[#002817] shadow-xl"
              />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black text-center text-white flex items-center justify-center gap-2 mt-1">
              <Lock className="w-5 h-5 text-[#E4C46A]" />
              Acesso ao Sistema Jetro
            </CardTitle>
            <p className="text-xs text-white/80 mt-1.5 font-medium max-w-xs mx-auto">
              Plataforma Inteligente de Gestão Empresarial
            </p>
          </CardHeader>

          <CardContent className="pt-6 pb-6 px-6 sm:px-8 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="system-username" className="text-sm font-semibold text-foreground">
                  Usuário ou E-mail
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="system-username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Digite seu usuário ou e-mail"
                    className="pl-10 h-11 border-border focus-visible:ring-[#005B2E]"
                    autoComplete="username"
                  />
                </div>
                {(fieldErrors.email || fieldErrors.username) && (
                  <p className="text-xs text-destructive font-medium">
                    {fieldErrors.email || fieldErrors.username}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="system-password"
                    className="text-sm font-semibold text-foreground"
                  >
                    Senha
                  </Label>
                  <Link
                    to="/admin/recuperar-senha"
                    className="text-xs text-[#005B2E] hover:underline font-semibold"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="system-password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Digite sua senha"
                    className="pl-10 h-11 border-border focus-visible:ring-[#005B2E]"
                    autoComplete="current-password"
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-destructive font-medium">{fieldErrors.password}</p>
                )}
              </div>

              {error && !hasFieldError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/30">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium text-xs sm:text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-extrabold text-base shadow-lg h-12 rounded-xl transition-all duration-200 hover:shadow-emerald-900/40"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Entrando no sistema...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Entrar no Sistema
                  </>
                )}
              </Button>
            </form>

            <div className="pt-3 border-t border-border flex flex-col gap-2.5 text-center text-xs">
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ambiente Seguro com Criptografia de Ponta</span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <Link to="/admin/cadastro" className="text-[#005B2E] hover:underline font-bold">
                  Solicitar novo cadastro
                </Link>
                <Link
                  to="/cliente/login"
                  className="text-muted-foreground hover:text-[#005B2E] font-medium transition-colors"
                >
                  Portal do Cliente
                </Link>
              </div>

              {/* Botão em destaque no card também para fácil acesso */}
              <div className="pt-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#C89B3C]/60 hover:bg-[#C89B3C]/10 text-[#002817] font-bold text-xs sm:text-sm py-2 rounded-xl"
                >
                  <Link to="/site" className="flex items-center justify-center gap-2">
                    <Globe className="w-4 h-4 text-[#C89B3C]" />
                    <span>Acesse o site do Jetro</span>
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Rodapé discreto da tela de login */}
      <footer className="relative z-10 w-full px-4 py-4 text-center text-xs text-white/60 border-t border-white/10 bg-[#001c10]/70 backdrop-blur-sm">
        <p>
          © {new Date().getFullYear()} Jetro — Plataforma Inteligente de Gestão Empresarial. Todos
          os direitos reservados.
        </p>
      </footer>
    </div>
  )
}
