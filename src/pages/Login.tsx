import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { type FieldErrors } from '@/lib/pocketbase/errors'
import {
  Lock,
  User,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  Clock,
  Globe,
} from 'lucide-react'
import { MfaVerifyScreen } from '@/components/mfa-verify-screen'
import {
  logoHuramOfficial,
  logoDecEldoradoOfficial,
  logoGranRomanoOfficial,
} from '@/lib/brand-assets'
import { useBrand } from '@/hooks/use-brand'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, loading, mfaRequired, mfaLoginVerify, mfaCancel } = useAuth()
  const { loginBrand } = useBrand()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [inactivityNotice, setInactivityNotice] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // Captura mensagem de inatividade se redirecionado pelo InactivityTracker
  useEffect(() => {
    const state = location.state as { inactivityMessage?: string } | null
    if (state?.inactivityMessage) {
      setInactivityNotice(state.inactivityMessage)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

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
      <div className="min-h-screen bg-gradient-to-b from-[#0a0703] via-[#120d06] to-[#050302] flex items-center justify-center p-4">
        <MfaVerifyScreen onVerify={mfaLoginVerify} onCancel={mfaCancel} />
      </div>
    )
  }

  // Permite verificar se o hook useBrand está ativo (preservando o hook e compatibilidade)
  void loginBrand

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0c0905] text-[#241c10] flex flex-col justify-between selection:bg-[#d4a446]/30 select-none">
      {/* ========================================================
          CAMADA DE FUNDO PREMIUM ESCURA COM ONDAS E FORMAS METÁLICAS DOURADAS
          ======================================================== */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Gradiente radial de profundidade e brilhos quentes */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 18% 28%, rgba(220, 168, 62, 0.16) 0%, transparent 45%), ' +
              'radial-gradient(circle at 85% 75%, rgba(212, 164, 70, 0.14) 0%, transparent 50%), ' +
              'radial-gradient(circle at 50% 50%, rgba(30, 20, 10, 0.95) 0%, #0c0905 100%)',
          }}
        />

        {/* Silhueta de fachada corporativa estilizada / vidro moderno ao fundo à esquerda */}
        <div
          className="absolute -bottom-10 -left-12 w-[340px] sm:w-[460px] lg:w-[540px] h-[580px] sm:h-[680px] opacity-25 mix-blend-screen pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(212,164,70,0.3) 0%, rgba(140,95,20,0.05) 60%, transparent 85%), ' +
              'repeating-linear-gradient(0deg, rgba(230,180,80,0.18) 0px, rgba(230,180,80,0.18) 2px, transparent 2px, transparent 28px), ' +
              'repeating-linear-gradient(90deg, rgba(230,180,80,0.22) 0px, rgba(230,180,80,0.22) 2px, transparent 2px, transparent 48px)',
            transform: 'perspective(600px) rotateY(18deg) rotateX(6deg) skewY(-8deg)',
            maskImage:
              'linear-gradient(to top right, black 35%, rgba(0,0,0,0.7) 65%, transparent 95%)',
            WebkitMaskImage:
              'linear-gradient(to top right, black 35%, rgba(0,0,0,0.7) 65%, transparent 95%)',
          }}
        />

        {/* Fachada corporativa iluminada secundária (luzes douradas de escritórios modernos) */}
        <div
          className="hidden sm:block absolute bottom-0 left-0 w-[420px] h-[340px] opacity-20 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(0deg, rgba(245,210,120,0.35) 0px, rgba(245,210,120,0.35) 4px, transparent 4px, transparent 18px), ' +
              'repeating-linear-gradient(90deg, rgba(245,210,120,0.25) 0px, rgba(245,210,120,0.25) 3px, transparent 3px, transparent 32px)',
            transform: 'perspective(450px) rotateY(24deg) skewY(-4deg)',
            maskImage: 'linear-gradient(to top, black 20%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 90%)',
          }}
        />

        {/* Grandes Ondas Metálicas Douradas em SVG com gradientes metálicos hiper-refinados */}
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradiente Ouro Metálico Primário */}
            <linearGradient id="goldMetallicMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6E4D1B" />
              <stop offset="20%" stopColor="#C49A45" />
              <stop offset="42%" stopColor="#F5D888" />
              <stop offset="58%" stopColor="#DFB255" />
              <stop offset="80%" stopColor="#8C5F1E" />
              <stop offset="100%" stopColor="#F9E6A5" />
            </linearGradient>

            {/* Gradiente Ouro Metálico Secundário / Brilho Alto */}
            <linearGradient id="goldMetallicLight" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8A6020" />
              <stop offset="25%" stopColor="#D8AC52" />
              <stop offset="48%" stopColor="#FFF2BF" />
              <stop offset="70%" stopColor="#B88628" />
              <stop offset="100%" stopColor="#4A310C" />
            </linearGradient>

            {/* Gradiente Metálico Suave com Sombras */}
            <linearGradient id="goldRibbonDark" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E1408" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#6E4A19" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#BE923D" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#140D05" stopOpacity="0.95" />
            </linearGradient>

            {/* Filtro de Glow / Brilho Suave */}
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Onda Metálica Superior Esquerda (swoop dourado amplo) */}
          <path
            d="M-80 -40 C120 180 320 120 460 -60 L-80 -60 Z"
            fill="url(#goldRibbonDark)"
            opacity="0.6"
          />
          <path
            d="M-60 -40 C140 160 300 110 440 -60"
            stroke="url(#goldMetallicLight)"
            strokeWidth="3.5"
            opacity="0.75"
          />
          <path
            d="M-50 -30 C130 145 280 100 420 -60"
            stroke="url(#goldMetallicMain)"
            strokeWidth="1.5"
            opacity="0.9"
          />

          {/* Onda Metálica Superior Direita que abraça o topo do card */}
          <path
            d="M1020 -60 C1080 140 1240 220 1520 140 L1520 -60 Z"
            fill="url(#goldRibbonDark)"
            opacity="0.7"
          />
          <path
            d="M1020 -60 C1080 140 1240 220 1520 140"
            stroke="url(#goldMetallicMain)"
            strokeWidth="4"
            opacity="0.85"
            filter="url(#goldGlow)"
          />
          <path
            d="M1035 -60 C1095 130 1250 208 1520 132"
            stroke="url(#goldMetallicLight)"
            strokeWidth="1.5"
            opacity="0.95"
          />

          {/* Faixa metálica dourada inferior maciça (curva sinuosa que atravessa a base da tela de ponta a ponta) */}
          <path
            d="M-60 880 C260 840 480 810 740 850 C1040 896 1260 860 1520 780 L1520 960 L-60 960 Z"
            fill="url(#goldRibbonDark)"
            opacity="0.85"
          />
          <path
            d="M-60 880 C260 840 480 810 740 850 C1040 896 1260 860 1520 780"
            stroke="url(#goldMetallicMain)"
            strokeWidth="6"
            opacity="0.9"
            filter="url(#goldGlow)"
          />
          <path
            d="M-60 872 C260 832 480 802 740 842 C1040 888 1260 852 1520 772"
            stroke="url(#goldMetallicLight)"
            strokeWidth="2.5"
            opacity="0.95"
          />

          {/* Eixo de luz metálica dourada cruzando a lateral direita */}
          <path
            d="M1480 420 C1380 560 1370 700 1520 860"
            stroke="url(#goldMetallicLight)"
            strokeWidth="3"
            opacity="0.6"
          />
          <path
            d="M1495 440 C1400 570 1390 690 1520 840"
            stroke="url(#goldMetallicMain)"
            strokeWidth="1.5"
            opacity="0.8"
          />
        </svg>

        {/* Textura sutil de partículas/brilhos dourados */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-color-dodge"
          style={{
            backgroundImage:
              'radial-gradient(1.5px 1.5px at 120px 80px, #FFF0B2, transparent), ' +
              'radial-gradient(2px 2px at 280px 240px, #E8B953, transparent), ' +
              'radial-gradient(1px 1px at 450px 140px, #FFFFFF, transparent), ' +
              'radial-gradient(2px 2px at 620px 320px, #F0C466, transparent), ' +
              'radial-gradient(1.5px 1.5px at 800px 90px, #FFEB9C, transparent), ' +
              'radial-gradient(2px 2px at 980px 260px, #E0AC42, transparent), ' +
              'radial-gradient(1.5px 1.5px at 1150px 180px, #FFF4CE, transparent), ' +
              'radial-gradient(2px 2px at 1340px 380px, #D89F34, transparent), ' +
              'radial-gradient(1.5px 1.5px at 200px 600px, #F5CC75, transparent), ' +
              'radial-gradient(2px 2px at 700px 720px, #E5B247, transparent), ' +
              'radial-gradient(1px 1px at 1220px 640px, #FFF8DC, transparent)',
            backgroundRepeat: 'repeat',
            backgroundSize: '1440px 900px',
          }}
        />

        {/* Brilhos estelares / flares dourados pontuais */}
        <div className="absolute top-[8%] left-[16%] w-2 h-2 rounded-full bg-amber-100 shadow-[0_0_24px_8px_rgba(255,220,130,0.6)] animate-pulse" />
        <div className="absolute top-[22%] right-[12%] w-1.5 h-1.5 rounded-full bg-amber-50 shadow-[0_0_20px_6px_rgba(255,215,110,0.5)] animate-pulse" />
        <div className="absolute bottom-[28%] left-[38%] w-1 h-1 rounded-full bg-yellow-100 shadow-[0_0_16px_5px_rgba(240,190,80,0.45)]" />
      </div>

      {/* ========================================================
          CABEÇALHO SUPERIOR ELEGANTE COM ASSINATURA HURAM & LINK INSTITUCIONAL
          ======================================================== */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-3">
        {/* Assinatura Oficial HURAM — cápsula refinada em tons creme/dourado harmonizada com a identidade visual */}
        <div className="flex items-center gap-2.5 sm:gap-3 group">
          <div
            className="relative flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(212,164,70,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.7),0_0_18px_rgba(212,164,70,0.35)]"
            style={{
              background:
                'linear-gradient(135deg, rgba(253, 247, 231, 0.96) 0%, rgba(245, 236, 218, 0.92) 100%)',
              border: '1px solid #d4a748',
            }}
          >
            <div className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden shrink-0 shadow-sm border border-[#c99b45]/60 bg-[#FDFBF5] flex items-center justify-center p-0.5">
              <img
                src={logoHuramOfficial}
                alt="Logomarca Oficial HURAM"
                className="w-full h-full object-cover scale-[1.35] transition-transform duration-300 group-hover:scale-[1.45]"
                loading="eager"
              />
            </div>
            <div className="flex flex-col text-left leading-none pr-1">
              <span
                className="text-[11px] sm:text-xs font-black tracking-wider uppercase font-serif"
                style={{
                  background:
                    'linear-gradient(135deg, #063D30 0%, #116B50 40%, #5C3D0C 75%, #A6731B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                HURAM
              </span>
              <span className="text-[8px] sm:text-[9px] font-semibold text-[#6e5f49] tracking-tight hidden xs:inline sm:inline">
                Sistema Inteligente de Gestão
              </span>
            </div>
          </div>

          <span className="hidden md:inline-block w-1 h-1 rounded-full bg-[#c89b3c]/50" />
          <span className="hidden md:inline-block text-[11px] tracking-widest uppercase font-medium text-[#c89b3c]/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            DEC Eldorado &bull; Gran Romano
          </span>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-[#c4983e]/50 bg-black/40 hover:bg-[#c4983e]/20 text-[#edd59a] hover:text-white font-medium text-xs px-3.5 py-1.5 rounded-full transition-all shadow-lg backdrop-blur-md cursor-pointer group shrink-0"
        >
          <Link to="/site" className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#d9a845] group-hover:text-white transition-colors" />
            <span className="hidden sm:inline">Site Institucional</span>
            <span className="sm:hidden">Site</span>
          </Link>
        </Button>
      </header>

      {/* ========================================================
          CONTEÚDO PRINCIPAL: 2 COLUNAS (LOGOMARCAS À ESQUERDA, CARD À DIREITA)
          ======================================================== */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-4 sm:py-8">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ----------------------------------------------------
              COLUNA ESQUERDA: AS DUAS LOGOMARCAS OFICIAIS EMPILHADAS
              1) deceldorado (dourado circular em cima)
              2) Gran Romano (rótulo vintage com selo GRfoods® embaixo)
              ---------------------------------------------------- */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center text-center space-y-6 sm:space-y-8 py-2 lg:py-6">
            {/* 1) Logomarca DEC Eldorado */}
            <div className="relative group transition-transform duration-300 hover:scale-[1.02]">
              {/* Glow dourado suave ao redor */}
              <div
                className="absolute inset-0 rounded-3xl opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-70"
                style={{
                  background:
                    'radial-gradient(circle, rgba(230,180,75,0.45) 0%, rgba(180,130,40,0.1) 70%, transparent 100%)',
                }}
              />
              <div className="relative p-2 sm:p-3 flex items-center justify-center">
                <img
                  src={logoDecEldoradoOfficial}
                  alt="DEC Eldorado — Logotipo Oficial Dourado"
                  className="h-28 sm:h-36 md:h-40 lg:h-44 w-auto max-w-[280px] sm:max-w-[340px] md:max-w-[380px] object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)] filter brightness-[1.08] contrast-[1.05]"
                  loading="eager"
                />
              </div>
            </div>

            {/* Divisor metálico fino entre as marcas */}
            <div className="w-48 sm:w-64 h-[1px] bg-gradient-to-r from-transparent via-[#d8a848]/60 to-transparent" />

            {/* 2) Logomarca Gran Romano (Rótulo Vintage Oficial + GRfoods®) */}
            <div className="relative group transition-transform duration-300 hover:scale-[1.02]">
              {/* Glow dourado suave ao redor */}
              <div
                className="absolute inset-0 rounded-3xl opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-70"
                style={{
                  background:
                    'radial-gradient(circle, rgba(230,180,75,0.4) 0%, rgba(180,130,40,0.1) 70%, transparent 100%)',
                }}
              />
              <div className="relative p-2 sm:p-3 flex items-center justify-center">
                <img
                  src={logoGranRomanoOfficial}
                  alt="Gran Romano — Rótulo Vintage Oficial com Selo GRfoods®"
                  className="h-28 sm:h-36 md:h-40 lg:h-44 w-auto max-w-[280px] sm:max-w-[340px] md:max-w-[380px] object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)] filter brightness-[1.06] contrast-[1.04]"
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------
              COLUNA DIREITA: CARD CLARO (CREME / OFF-WHITE) COM BORDA DOURADA
              Fiel à imagem de referência
              ---------------------------------------------------- */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end select-text">
            <div
              className="relative w-full max-w-[460px] rounded-[28px] p-[2px] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.9),0_0_40px_rgba(212,164,70,0.25)] transition-all duration-300"
              style={{
                background:
                  'linear-gradient(145deg, #FDF7E7 0%, #E6BF68 30%, #C99635 60%, #F5DE9B 85%, #8B611C 100%)',
              }}
            >
              {/* Superfície interna do Card: Creme / Off-white sofisticado */}
              <div
                className="relative w-full h-full rounded-[26px] px-6 sm:px-9 py-8 sm:py-9 overflow-hidden flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(180deg, #FDFBF5 0%, #F8F4E8 50%, #F3ECDA 100%)',
                }}
              >
                {/* Textura sutil de fundo do card */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-30 mix-blend-multiply"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 50% 0%, rgba(212,164,70,0.25) 0%, transparent 60%)',
                  }}
                />

                {/* Conteúdo do Card */}
                <div className="relative z-10 space-y-6">
                  {/* Cabeçalho do Card */}
                  <div className="text-center space-y-1">
                    <p className="text-[#3a3020] text-base sm:text-lg font-normal tracking-tight">
                      Acesse ao Sistema da
                    </p>
                    <h1
                      className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight uppercase font-serif"
                      style={{
                        background:
                          'linear-gradient(135deg, #5C3D0C 0%, #A6731B 25%, #7C5110 50%, #B88528 75%, #4A2E05 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 1px 1px rgba(255,255,255,0.6)',
                      }}
                    >
                      DEC Eldorado
                      <span className="block text-xl sm:text-2xl font-serif font-extrabold normal-case tracking-normal">
                        e Gran Romano
                      </span>
                    </h1>
                    <p className="text-[#6d5e46] text-xs sm:text-sm font-medium pt-1 tracking-wide">
                      Sistema Inteligente de Gestão
                    </p>
                  </div>

                  {/* Formulário de Login */}
                  <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                    {/* Campo Usuário ou E-mail */}
                    <div className="space-y-1.5 text-left">
                      <Label
                        htmlFor="login-username"
                        className="text-xs sm:text-sm font-semibold text-[#2f271a]"
                      >
                        Usuário ou E-mail
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7b62] group-focus-within:text-[#a5741b] transition-colors" />
                        <Input
                          id="login-username"
                          type="text"
                          value={username}
                          onChange={handleUsernameChange}
                          placeholder="Digite seu usuário ou e-mail"
                          className="pl-10 h-12 rounded-xl bg-white/90 border-[#d9cca8] text-[#241c10] placeholder:text-[#9e8f76] focus-visible:border-[#c49635] focus-visible:ring-[#c49635]/30 shadow-inner text-sm transition-all"
                          autoComplete="username"
                        />
                      </div>
                      {(fieldErrors.email || fieldErrors.username) && (
                        <p className="text-xs text-red-600 font-medium pl-1">
                          {fieldErrors.email || fieldErrors.username}
                        </p>
                      )}
                    </div>

                    {/* Campo Senha com Link Esqueceu a Senha alinhado à direita */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="login-password"
                          className="text-xs sm:text-sm font-semibold text-[#2f271a]"
                        >
                          Senha
                        </Label>
                        <Link
                          to="/admin/recuperar-senha"
                          className="text-xs font-semibold text-[#8b6118] hover:text-[#5e410b] hover:underline transition-colors cursor-pointer"
                        >
                          Esqueceu a senha?
                        </Link>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7b62] group-focus-within:text-[#a5741b] transition-colors" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={handlePasswordChange}
                          placeholder="Digite sua senha"
                          className="pl-10 pr-10 h-12 rounded-xl bg-white/90 border-[#d9cca8] text-[#241c10] placeholder:text-[#9e8f76] focus-visible:border-[#c49635] focus-visible:ring-[#c49635]/30 shadow-inner text-sm transition-all"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a7b62] hover:text-[#2f271a] p-1 rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c49635] transition-colors cursor-pointer"
                          aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {fieldErrors.password && (
                        <p className="text-xs text-red-600 font-medium pl-1">
                          {fieldErrors.password}
                        </p>
                      )}
                    </div>

                    {/* Aviso de Inatividade se aplicável */}
                    {inactivityNotice && (
                      <div className="flex items-start gap-2.5 text-xs text-amber-900 bg-amber-100/80 rounded-xl p-3 border border-amber-300">
                        <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-medium">{inactivityNotice}</span>
                      </div>
                    )}

                    {/* Mensagem de Erro Geral */}
                    {error && !hasFieldError && (
                      <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100/90 rounded-xl p-3 border border-red-300">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                        <span className="font-medium">{error}</span>
                      </div>
                    )}

                    {/* Botão Dourado Grande com Efeito Metálico "Entrar no Sistema" */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full h-12 sm:h-13 rounded-xl font-bold text-base text-[#241704] flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_6px_20px_rgba(180,128,32,0.35),inset_0_1px_1px_rgba(255,255,255,0.7)] hover:shadow-[0_8px_26px_rgba(180,128,32,0.5),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                        style={{
                          background:
                            'linear-gradient(180deg, #FDE69E 0%, #E8B953 35%, #D49D2C 70%, #B88118 100%)',
                          border: '1px solid #E5BA55',
                        }}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin text-[#241704]" />
                            <span>Entrando...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 text-[#241704]" />
                            <span>Entrar no Sistema</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Rodapé do Card com selo HURAM e garantia de ambiente seguro */}
                  <div className="pt-2 border-t border-[#dfcfb0]/60 flex flex-col items-center gap-2 text-center">
                    <div className="flex items-center justify-center gap-2 text-xs text-[#6e5f49]">
                      <ShieldCheck className="w-4 h-4 text-[#8a6018] shrink-0" />
                      <span className="font-medium tracking-tight">
                        Ambiente Seguro com Criptografia de Ponta
                      </span>
                    </div>

                    {/* Assinatura discreta HURAM dentro do card creme */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-[#dfcfb0] shadow-sm">
                      <img
                        src={logoHuramOfficial}
                        alt="HURAM"
                        className="w-5 h-5 object-contain rounded-full"
                        loading="lazy"
                      />
                      <span className="text-[10px] sm:text-[11px] font-semibold text-[#5a4c36] tracking-wide">
                        Powered by <strong className="font-bold text-[#116B50]">HURAM</strong>{' '}
                        &bull; Gestão Inteligente
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================
          RODAPÉ INFERIOR DISCRETO COM MARCA HURAM
          ======================================================== */}
      <footer className="relative z-10 w-full px-4 py-3 sm:py-4 text-center text-[11px] sm:text-xs text-[#a89066] space-y-1">
        <p>
          &copy; {new Date().getFullYear()} DEC Eldorado &bull; Gran Romano &mdash; Desenvolvido
          sobre a plataforma{' '}
          <span className="text-[#dfb255] font-semibold">
            HURAM &mdash; Sistema Inteligente de Gestão
          </span>
          .
        </p>
      </footer>
    </div>
  )
}
