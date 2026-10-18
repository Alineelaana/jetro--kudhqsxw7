import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClientAuth } from '@/hooks/use-client-auth'
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react'
import logoJetro from '@/assets/whatsapp-image-2026-08-09-at-23.25.57-7232a.jpeg'

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
      <Card className="w-full max-w-md border-2 border-[#005B2E]/30 shadow-2xl">
        <CardHeader className="bg-[#01361D] text-white border-b border-[#C89B3C]/40 pb-6 rounded-t-lg text-center flex flex-col items-center">
          <img
            src={logoJetro}
            alt="Jetro - Área do Cliente"
            className="h-20 w-auto object-contain rounded-xl border border-[#C89B3C]/40 mb-3 shadow-lg"
          />
          <CardTitle className="text-xl font-black text-center text-white flex items-center justify-center gap-2">
            <Lock className="w-6 h-6 text-[#E4C46A]" /> Área do Cliente — Jetro
          </CardTitle>
          <p className="text-xs text-white/70 mt-1 font-medium">
            Plataforma Inteligente de Gestão Empresarial
          </p>
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
                  className="pl-10 focus-visible:ring-[#005B2E] border-border"
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
                  className="pl-10 focus-visible:ring-[#005B2E] border-border"
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
              to="/cliente/recuperar-senha"
              className="block text-center text-sm text-[#005B2E] hover:underline font-bold pt-2"
            >
              Esqueci minha senha
            </Link>
            <div className="border-t border-border pt-4 mt-4 space-y-3">
              <div className="text-center">
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-[#C89B3C]/70 hover:bg-[#C89B3C]/10 text-[#002817] font-bold text-sm rounded-xl"
                >
                  <Link to="/site">Acesse o site do Jetro</Link>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
