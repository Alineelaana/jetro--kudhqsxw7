import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { type FieldErrors } from '@/lib/pocketbase/errors'
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react'

export function AdminLogin() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

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
    }
  }

  const hasFieldError = !!fieldErrors.email || !!fieldErrors.username || !!fieldErrors.password

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-2 border-[#005B2E]/30 shadow-2xl">
        <CardHeader className="bg-[#01361D] text-white border-b border-[#C89B3C]/40 pb-6 rounded-t-lg">
          <CardTitle className="text-xl sm:text-2xl font-black text-center text-white flex items-center justify-center gap-2">
            <Lock className="w-6 h-6 text-[#E4C46A]" />
            Área Restrita — Velora Log
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-semibold text-foreground">
                Usuário
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Digite seu usuário"
                  className="pl-10 focus-visible:ring-[#005B2E] border-border"
                  autoComplete="username"
                />
              </div>
              {(fieldErrors.email || fieldErrors.username) && (
                <p className="text-sm text-destructive font-medium">
                  {fieldErrors.email || fieldErrors.username}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Digite sua senha"
                  className="pl-10 focus-visible:ring-[#005B2E] border-border"
                  autoComplete="current-password"
                />
              </div>
              {fieldErrors.password && (
                <p className="text-sm text-destructive font-medium">{fieldErrors.password}</p>
              )}
            </div>
            {error && !hasFieldError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/30">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#005B2E] hover:bg-[#01361D] text-white font-extrabold text-base shadow-lg h-12 rounded-xl"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Entrar
                </>
              )}
            </Button>
            <Link
              to="/admin/recuperar-senha"
              className="block text-center text-sm text-[#005B2E] hover:underline font-bold pt-2"
            >
              Esqueci minha senha
            </Link>
            <Link
              to="/admin/cadastro"
              className="block text-center text-sm text-[#005B2E] hover:underline font-bold pt-1"
            >
              Cadastre-se
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
