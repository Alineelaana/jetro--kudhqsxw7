import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { b2bService } from '@/lib/b2b/b2b-service'
import { useB2B } from '@/lib/b2b/b2b-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { AlertCircle, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react'

export const B2BLoginScreen: React.FC = () => {
  const navigate = useNavigate()
  const { refreshProfile } = useB2B()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setIsLoading(true)

    try {
      await b2bService.login(email.trim().toLowerCase(), password)
      await refreshProfile()
      navigate('/portal/catalogo')
    } catch (err: unknown) {
      console.error(err)
      const message =
        err instanceof Error ? err.message : 'Credenciais inválidas. Verifique seu e-mail e senha.'
      setErrorMsg(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
            H
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">HURAM</span>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-800">
          Portal B2B • Área do Cliente
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Acesso exclusivo para parceiros comerciais e compradores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold text-slate-800">
              Entrar na sua conta
            </CardTitle>
            <CardDescription>Informe seu e-mail corporativo e senha cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail corporativo</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="compras@suaempresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium gap-2 mt-2"
              >
                {isLoading ? 'Autenticando...' : 'Acessar Catálogo B2B'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 border-t border-slate-100 pt-4 bg-slate-50/50 rounded-b-xl">
            <div className="text-sm text-center text-slate-600">
              Ainda não tem conta no Portal B2B?{' '}
              <Link
                to="/portal/cadastro"
                className="font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-4"
              >
                Cadastre sua empresa aqui
              </Link>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ambiente corporativo seguro com isolamento multitenancy</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
