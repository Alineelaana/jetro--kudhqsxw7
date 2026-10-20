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
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-md border border-[#E4EAE6] shadow-xl bg-white rounded-2xl overflow-hidden">
        <CardHeader className="bg-[#063D30] text-white border-b border-[#C69B45]/30 pb-6 rounded-t-2xl text-center flex flex-col items-center">
          <img
            src={logoHuramDark}
            alt="HURAM - Área do Cliente"
            className="h-20 w-auto object-contain rounded-xl border border-[#C69B45]/40 mb-3 shadow-md bg-[#042820] p-1.5"
          />
          <CardTitle className="text-xl font-bold text-center text-white flex items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-[#C69B45]" /> Área do Cliente — HURAM
          </CardTitle>
          <p className="text-xs text-white/80 mt-1 font-medium">Sistema Inteligente de Gestão</p>
        </CardHeader>
        <CardContent className="pt-6 px-6 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="client-email" className="text-sm font-semibold text-[#202B28]">
                Usuário / E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736D]" />
                <Input
                  id="client-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 focus-visible:ring-[#063D30] border-[#E4EAE6] bg-white text-[#202B28]"
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-password" className="text-sm font-semibold text-[#202B28]">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736D]" />
                <Input
                  id="client-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="pl-10 focus-visible:ring-[#063D30] border-[#E4EAE6] bg-white text-[#202B28]"
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
              className="w-full bg-[#063D30] hover:bg-[#042820] text-white font-bold text-base shadow-md h-11 rounded-xl cursor-pointer"
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
              className="block text-center text-sm text-[#063D30] hover:underline font-semibold pt-1"
            >
              Esqueci minha senha
            </Link>
            <div className="border-t border-[#E4EAE6] pt-4 mt-4 space-y-3">
              <div className="text-center">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#063D30]/30 hover:bg-[#063D30]/5 text-[#063D30] font-semibold text-sm rounded-xl cursor-pointer"
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
