import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClientAuth } from '@/hooks/use-client-auth'
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react'
import { logoHuramDark } from '@/lib/brand-assets'

export default function ClientLogin() {
  const navigate = useNavigate()
  const { clientLogin, isClientAuthenticated } = useClientAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (isClientAuthenticated) return <Navigate to="/cliente" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Preencha todos os campos.')
      return
    }
    setSubmitting(true)
    setError('')
    const { error } = await clientLogin(email.trim(), password)
    setSubmitting(false)
    if (error) setError(error)
    else navigate('/cliente')
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-2 border-[#D6A755]/40 shadow-2xl bg-white">
        <CardHeader className="bg-[#003D30] text-white border-b border-[#D6A755]/40 pb-6 rounded-t-lg text-center flex flex-col items-center">
          <img
            src={logoHuramDark}
            alt="HURAM - Área do Cliente"
            className="h-24 w-auto object-contain rounded-xl border border-[#D6A755]/40 mb-3 shadow-lg bg-[#003D30] p-1"
          />
          <CardTitle className="text-xl font-black text-center text-white flex items-center justify-center gap-2">
            <Lock className="w-6 h-6 text-[#D6A755]" /> Área do Cliente — HURAM
          </CardTitle>
          <p className="text-xs text-white/80 mt-1 font-medium">Sistema Inteligente de Gestão</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="client-email" className="text-sm font-semibold">
                Usuário
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="client-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 focus-visible:ring-[#003D30] border-border"
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-password" className="text-sm font-semibold">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="client-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="pl-10 focus-visible:ring-[#003D30] border-border"
                  autoComplete="current-password"
                />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 border border-destructive/30">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-[#003D30] hover:bg-[#002820] text-white font-extrabold text-base shadow-lg h-12 rounded-xl"
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
              to="/cliente/recuperar-senha"
              className="block text-center text-sm text-[#003D30] hover:underline font-bold pt-2"
            >
              Esqueci minha senha
            </Link>
            <div className="border-t border-border pt-4 mt-4 space-y-3">
              <div className="text-center">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#D6A755]/70 hover:bg-[#D6A755]/15 text-[#003D30] font-bold text-sm rounded-xl"
                >
                  <Link to="/site">Acesse o site da HURAM</Link>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
