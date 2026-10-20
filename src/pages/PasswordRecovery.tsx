import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import pbClient from '@/lib/pocketbase/client-client'
import { Mail, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function PasswordRecovery() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')

    if (!email.trim()) {
      setEmailError('O e-mail é obrigatório.')
      return
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError('Digite um e-mail válido.')
      return
    }

    setSubmitting(true)
    try {
      await pbClient.collection('clients').requestPasswordReset(email.trim())
    } catch {
      // Silently ignore — show neutral message regardless
    }
    setSubmitting(false)
    setSuccess(true)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-2 border-[#C69B45]/40 shadow-2xl bg-white">
        <CardHeader className="bg-[#063D30] text-white border-b border-[#C69B45]/40 pb-6 rounded-t-lg">
          <CardTitle className="text-xl sm:text-2xl font-black text-center text-white flex items-center justify-center gap-2">
            <Mail className="w-6 h-6 text-[#C69B45]" /> Recuperar Senha — HURAM
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {success ? (
            <div className="space-y-4 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <p className="text-sm text-foreground">
                Se o e-mail existir, você receberá um link de redefinição de senha.
              </p>
              <Button asChild variant="outline" className="border-[#063D30] text-[#063D30]">
                <Link to="/cliente/login">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Digite seu e-mail cadastrado e enviaremos um link para redefinir sua senha no portal
                HURAM.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="recovery-email" className="text-sm font-semibold">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="recovery-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (emailError) setEmailError('')
                    }}
                    placeholder="seu@email.com"
                    className={`pl-10 focus-visible:ring-[#063D30] ${emailError ? 'border-destructive' : 'border-border'}`}
                    autoComplete="email"
                  />
                </div>
                {emailError && <p className="text-sm text-destructive font-medium">{emailError}</p>}
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-[#063D30] hover:bg-[#042820] text-white font-extrabold h-12 rounded-xl"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Enviando...
                  </>
                ) : (
                  'Enviar link de redefinição'
                )}
              </Button>
              <Link
                to="/cliente/login"
                className="block text-center text-sm text-[#063D30] hover:underline font-bold pt-2"
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
