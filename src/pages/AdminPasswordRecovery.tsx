import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import pb from '@/lib/pocketbase/client'
import { Mail, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'

export default function AdminPasswordRecovery() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Digite seu e-mail.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await pb.collection('users').requestPasswordReset(email.trim())
      setSuccess(true)
    } catch {
      setError('Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-2 border-[#D6A755]/40 shadow-2xl bg-white">
        <CardHeader className="bg-[#003D30] text-white border-b border-[#D6A755]/40 pb-6 rounded-t-lg">
          <CardTitle className="text-xl sm:text-2xl font-black text-center text-white flex items-center justify-center gap-2">
            <Mail className="w-6 h-6 text-[#D6A755]" /> Recuperar Senha — HURAM
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {success ? (
            <div className="space-y-4 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <p className="text-sm text-foreground">
                Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa
                de entrada.
              </p>
              <Button asChild variant="outline" className="border-[#003D30] text-[#003D30]">
                <Link to="/admin">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Digite seu e-mail cadastrado e enviaremos um link para redefinir sua senha no
                sistema HURAM.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="admin-recovery-email" className="text-sm font-semibold">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-recovery-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10 focus-visible:ring-[#003D30] border-border"
                    autoComplete="email"
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
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enviando...
                  </>
                ) : (
                  'Enviar link de recuperação'
                )}
              </Button>
              <Link
                to="/admin"
                className="block text-center text-sm text-[#003D30] hover:underline font-bold pt-2"
              >
                Voltar ao login
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
