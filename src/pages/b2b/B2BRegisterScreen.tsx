import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { b2bService } from '@/lib/b2b/b2b-service'
import { useB2B } from '@/lib/b2b/b2b-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { AlertCircle, Building, CheckCircle2, Lock, Mail, Phone, User, MapPin } from 'lucide-react'

export const B2BRegisterScreen: React.FC = () => {
  const navigate = useNavigate()
  const { refreshProfile } = useB2B()

  const [companyName, setCompanyName] = useState('')
  const [tradeName, setTradeName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [ie, setIe] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Endereço
  const [cep, setCep] = useState('')
  const [address, setAddress] = useState('')
  const [addressNumber, setAddressNumber] = useState('')
  const [addressDistrict, setAddressDistrict] = useState('')
  const [addressCity, setAddressCity] = useState('')
  const [addressState, setAddressState] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Formatar CNPJ
  const handleCnpjChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 14)
    if (raw.length <= 2) {
      setCnpj(raw)
    } else if (raw.length <= 5) {
      setCnpj(`${raw.slice(0, 2)}.${raw.slice(2)}`)
    } else if (raw.length <= 8) {
      setCnpj(`${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5)}`)
    } else if (raw.length <= 12) {
      setCnpj(`${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8)}`)
    } else {
      setCnpj(`${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12)}`)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('A senha precisa ter no mínimo 6 caracteres.')
      return
    }

    setIsLoading(true)

    try {
      await b2bService.signup({
        company_name: companyName,
        trade_name: tradeName || companyName,
        cnpj,
        state_registration: ie,
        contact_name: contactName,
        email: email.trim().toLowerCase(),
        phone,
        password,
        cep,
        address,
        address_number: addressNumber,
        address_district: addressDistrict,
        address_city: addressCity,
        address_state: addressState,
      })

      // Auto login após cadastro bem-sucedido
      await b2bService.login(email.trim().toLowerCase(), password)
      await refreshProfile()

      setSuccessMsg('Cadastro realizado com sucesso! Redirecionando para o catálogo...')
      setTimeout(() => {
        navigate('/portal/catalogo')
      }, 1500)
    } catch (err: unknown) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'Falha ao processar o cadastro. Verifique os dados informados.'
      setErrorMsg(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
            H
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">HURAM</span>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-800">
          Auto-Cadastro no Portal B2B
        </h2>
        <p className="mt-1 text-center text-sm text-slate-600">
          Cadastre sua empresa e faça pedidos com condições e faturamento empresarial
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4 sm:px-0">
        <Card className="shadow-lg border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-800">Ficha Cadastral da Empresa</CardTitle>
            <CardDescription>
              Preencha os dados da pessoa jurídica e o contato do responsável por compras
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              {/* Seção 1: Dados Jurídicos */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-600" />
                  Dados da Empresa (Pessoa Jurídica)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="companyName">Razão Social *</Label>
                    <Input
                      id="companyName"
                      required
                      placeholder="Ex: Comercial de Alimentos e Bebidas Ltda"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tradeName">Nome Fantasia</Label>
                    <Input
                      id="tradeName"
                      placeholder="Ex: Alimentos ABC"
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      required
                      placeholder="00.000.000/0000-00"
                      value={cnpj}
                      onChange={(e) => handleCnpjChange(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ie">Inscrição Estadual (IE)</Label>
                    <Input
                      id="ie"
                      placeholder="Isento ou nº da IE"
                      value={ie}
                      onChange={(e) => setIe(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Telefone / WhatsApp *</Label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <Input
                        id="phone"
                        required
                        placeholder="(11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Localização e Entrega */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  Endereço Principal de Faturamento / Entrega
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address">Logradouro / Rua</Label>
                    <Input
                      id="address"
                      placeholder="Avenida / Rua / Rodovia"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="addressNumber">Número</Label>
                    <Input
                      id="addressNumber"
                      placeholder="123"
                      value={addressNumber}
                      onChange={(e) => setAddressNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="addressDistrict">Bairro</Label>
                    <Input
                      id="addressDistrict"
                      placeholder="Centro / Industrial"
                      value={addressDistrict}
                      onChange={(e) => setAddressDistrict(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="addressCity">Cidade / UF</Label>
                    <div className="flex gap-2">
                      <Input
                        id="addressCity"
                        placeholder="São Paulo"
                        value={addressCity}
                        onChange={(e) => setAddressCity(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        id="addressState"
                        placeholder="SP"
                        maxLength={2}
                        value={addressState}
                        onChange={(e) => setAddressState(e.target.value.toUpperCase())}
                        className="w-16 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 3: Acesso e Usuário */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  Contato Responsável e Credenciais de Acesso
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contactName">Nome do Responsável / Comprador *</Label>
                    <Input
                      id="contactName"
                      required
                      placeholder="João da Silva"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">E-mail para Login e Notificações *</Label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="compras@suaempresa.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Criar Senha de Acesso *</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <Input
                        id="password"
                        type="password"
                        required
                        placeholder="Mínimo 6 dígitos"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        placeholder="Repita sua senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 text-base"
              >
                {isLoading ? 'Cadastrando empresa...' : 'Concluir Cadastro e Acessar Portal B2B'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-100 pt-4 bg-slate-50/50 rounded-b-xl">
            <div className="text-sm text-slate-600">
              Já possui cadastro corporativo?{' '}
              <Link
                to="/portal/login"
                className="font-semibold text-indigo-600 hover:text-indigo-800 underline underline-offset-4"
              >
                Faça login aqui
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
