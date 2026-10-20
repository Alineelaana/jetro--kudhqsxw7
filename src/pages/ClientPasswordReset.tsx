import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import pbClient from '@/lib/pocketbase/client-client'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

function getTokenFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search)
  const queryToken = params.get('token')
  if (queryToken) return queryToken

  const hash = window.location.hash
  if (hash) {
    const match = hash.match(/confirm-password-reset\/([^/?#]+)/)
    if (match) return decodeURIComponent(match[1])
  }

  const path = window.location.pathname
  const pathMatch = path.match(/confirm-password-reset\/([^/?#]+)/)
  if (pathMatch) return decodeURIComponent(pathMatch[1])

  return null
}

export default function ClientPasswordReset() {
  const navigate = useNavigate()
  const [token] = useState<string | null>(() => getTokenFromUrl())
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setConfirmError('')
    setGeneralError('')

    let hasError = false
    if (!password.trim()) {
      setPasswordError('A senha é obrigatória.')
      hasError = true
    } else if (password.length < 8) {
      setPasswordError('A senha deve ter no mínimo 8 caracteres.')
      hasError = true
    }
    if (!confirmPassword.trim()) {
      setConfirmError('A confirmação de senha é obrigatória.')
      hasError = true
    } else if (password !== confirmPassword) {
      setConfirmError('As senhas não coincidem.')
      hasError = true
    }
    if (hasError) return
    if (!token) {
      setGeneralError('Token de redefinição inválido ou expirado.')
      return
    }

    setSubmitting(true)
    try {
      await pbClient.collection('clients').confirmPasswordReset(token, password, confirmPassword)
      pbClient.authStore.clear()
      setSuccess(true)
      setTimeout(() => navigate('/cliente/login'), 3000)
    } catch {
      setGeneralError('Não foi possível redefinir a senha. O link pode ter expirado.')
    }
    setSubmitting(false)
  }

  if (!token) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-2 border-[#C69B45]/40 shadow-2xl bg-white">
          <CardHeader className="bg-[#063D30] text-white border-b border-[#C69B45]/40 pb-6 rounded-t-lg">
            <CardTitle className="text-xl font-black text-center text-white flex items-center justify-center gap-2">
              <Lock className="w-6 h-6 text-[#C69B45]" /> Link Inválido
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">
              O link de redefinição é inválido ou expirou. Solicite um novo link.
            </p>
            <Button
              asChild
              className="w-full bg-[#063D30] hover:bg-[#042820] text-white font-bold h-12 rounded-xl"
            >
              <Link to="/cliente/recuperar-senha">Solicitar novo link</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-2 border-[#C69B45]/40 shadow-2xl bg-white">
          <CardHeader className="bg-[#063D30] text-white border-b border-[#C69B45]/40 pb-6 rounded-t-lg">
            <CardTitle className="text-xl font-black text-center text-white flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 text-[#C69B45]" /> Senha Redefinida!
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Sua senha foi redefinida com sucesso no portal HURAM! Redirecionando para o login...
            </p>
            <Button
              asChild
              className="w-full bg-[#063D30] hover:bg-[#042820] text-white font-bold h-12 rounded-xl"
            >
              <Link to="/cliente/login">Ir para o login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-2 border-[#C69B45]/40 shadow-2xl bg-white">
        <CardHeader className="bg-[#063D30] text-white border-b border-[#C69B45]/40 pb-6 rounded-t-lg">
          <CardTitle className="text-xl sm:text-2xl font-black text-center text-white flex items-center justify-center gap-2">
            <Lock className="w-6 h-6 text-[#C69B45]" /> Redefinir Senha — HURAM
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-sm font-semibold">
                Nova Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  className={`pl-10 pr-10 focus-visible:ring-[#063D30] ${passwordError ? 'border-destructive' : 'border-border'}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-sm text-destructive font-medium">{passwordError}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-sm font-semibold">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  className={`pl-10 pr-10 focus-visible:ring-[#063D30] ${confirmError ? 'border-destructive' : 'border-border'}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmError && (
                <p className="text-sm text-destructive font-medium">{confirmError}</p>
              )}
            </div>
            {generalError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/30">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{generalError}</span>
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#063D30] hover:bg-[#042820] text-white font-extrabold h-12 rounded-xl"
              disabled={submitting}
            >
              {' '}
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Redefinindo...
                </>
              ) : (
                'Redefinir senha'
              )}
            </Button>
            <Link
              to="/cliente/login"
              className="block text-center text-sm text-[#063D30] hover:underline font-bold pt-2"
            >
              Voltar ao login
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
