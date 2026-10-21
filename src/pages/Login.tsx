import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
  Sparkles,
} from 'lucide-react'
import { MfaVerifyScreen } from '@/components/mfa-verify-screen'
import { useBrand } from '@/hooks/use-brand'

// Logos ORIGINAIS anexadas pelo usuário:
import logoDecEldorado from '@/assets/logotipo-dourado-deceeldorado-em-azul-royal-8cf58.png'
import logoHuram from '@/assets/imagem-do-chatgpt-21-de-out.de-2026-124755-b4d4e.png'
import logoGranRomano from '@/assets/rotulo-vintage-gran-romano-5bdf7.png'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, loading, mfaRequired, mfaLoginVerify, mfaCancel, user } =
    useAuth()
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

  // Redirecionamento pós-login respeitando permissões / obrigatoriedade de nova senha
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const u = user as Record<string, unknown> | null
      const mustChangePassword =
        u?.must_change_password === true ||
        u?.force_password_change === true ||
        u?.primeiro_acesso === true
      if (mustChangePassword) {
        navigate('/admin/recuperar-senha', {
          replace: true,
          state: { forcedNewPassword: true },
        })
      } else {
        navigate('/admin', { replace: true })
      }
    }
  }, [isAuthenticated, loading, navigate, user])

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
      // O useEffect cuidará do redirecionamento com base no estado de autenticação e no usuário autenticado
      navigate('/admin')
    }
  }

  const hasFieldError = !!fieldErrors.email || !!fieldErrors.username || !!fieldErrors.password

  if (mfaRequired) {
    return (
      <div className="min-h-screen bg-[#FBF8F2] flex items-center justify-center p-4">
        <MfaVerifyScreen onVerify={mfaLoginVerify} onCancel={mfaCancel} />
      </div>
    )
  }

  // Preserva compatibilidade do hook useBrand
  void loginBrand

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#FAF6EE] text-[#1D1B16] flex flex-col justify-between selection:bg-[#E8B84B]/30">
      {/* ========================================================
          CAMADA DE FUNDO LUMINOSA MARFIM / CREME COM ONDAS
          CURVAS DECORATIVAS VETORIAIS EM VERDE-ESMERALDA E DOURADO METÁLICO
          (Nunca utiliza a imagem estática de fundo inteiro)
          ======================================================== */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        {/* Iluminação de base suave perolada */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 100% 90% at 50% 20%, #FFFFFF 0%, #FDFBF7 35%, #F7F1E3 70%, #EEE4CF 100%)',
          }}
        />

        {/* Glows de luz e reflexos dourados difusos */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] rounded-full blur-[110px] opacity-75"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(254,247,230,0.8) 40%, rgba(243,225,180,0) 80%)',
          }}
        />
        <div
          className="absolute top-1/3 -left-32 w-[650px] h-[650px] rounded-full blur-[100px] opacity-30"
          style={{
            background: 'radial-gradient(circle, #F7DB91 0%, rgba(247,219,145,0) 70%)',
          }}
        />
        <div
          className="absolute bottom-10 -right-28 w-[600px] h-[600px] rounded-full blur-[120px] opacity-25"
          style={{
            background: 'radial-gradient(circle, #0F634A 0%, rgba(15,99,74,0) 70%)',
          }}
        />

        {/* Curvas decorativas SVG (verde-esmeralda acetinado e fitas metálicas douradas 3D) */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1600 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="goldRibbon1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C99834" />
              <stop offset="22%" stopColor="#FDE69E" />
              <stop offset="48%" stopColor="#FFF9DF" />
              <stop offset="70%" stopColor="#D8A23B" />
              <stop offset="88%" stopColor="#F8DA84" />
              <stop offset="100%" stopColor="#8C5C12" />
            </linearGradient>

            <linearGradient id="goldRibbonBottom" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7E520E" />
              <stop offset="25%" stopColor="#E5B54E" />
              <stop offset="50%" stopColor="#FFF9DE" />
              <stop offset="75%" stopColor="#CD9C36" />
              <stop offset="100%" stopColor="#FDE4A3" />
            </linearGradient>

            <linearGradient id="emeraldRibbonTopRight" x1="100%" y1="0%" x2="30%" y2="100%">
              <stop offset="0%" stopColor="#04271C" />
              <stop offset="30%" stopColor="#083E2F" />
              <stop offset="70%" stopColor="#0D5340" />
              <stop offset="100%" stopColor="#052D21" />
            </linearGradient>

            <linearGradient id="emeraldRibbonBottom" x1="0%" y1="100%" x2="80%" y2="20%">
              <stop offset="0%" stopColor="#031E16" />
              <stop offset="35%" stopColor="#073B2C" />
              <stop offset="70%" stopColor="#0C4F3D" />
              <stop offset="100%" stopColor="#146E56" />
            </linearGradient>

            <filter id="ribbonShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow
                dx="0"
                dy="12"
                stdDeviation="16"
                floodColor="#3A2807"
                floodOpacity="0.25"
              />
            </filter>
            <filter id="emeraldShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow
                dx="-4"
                dy="14"
                stdDeviation="20"
                floodColor="#011610"
                floodOpacity="0.30"
              />
            </filter>
          </defs>

          {/* Canto superior esquerdo: fios dourados finos */}
          <path
            d="M-60 240 C90 200 190 130 250 50 C275 10 288 -30 292 -70"
            stroke="url(#goldRibbon1)"
            strokeWidth="10"
            strokeLinecap="round"
            filter="url(#ribbonShadow)"
            opacity="0.8"
          />
          <path
            d="M-80 300 C110 260 230 170 310 50 C345 0 360 -40 365 -80"
            stroke="url(#goldRibbon1)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Canto superior direito: fita esmeralda acetinada com borda dourada */}
          <path
            d="M1380 -60 C1400 80 1460 195 1550 270 C1610 320 1670 340 1730 350 L1730 -60 Z"
            fill="url(#emeraldRibbonTopRight)"
            filter="url(#emeraldShadow)"
          />
          <path
            d="M1370 -60 C1390 90 1455 210 1550 285 C1615 335 1675 355 1735 365"
            stroke="url(#goldRibbon1)"
            strokeWidth="7"
            strokeLinecap="round"
            filter="url(#ribbonShadow)"
          />
          <path
            d="M1340 -60 C1360 105 1430 230 1530 310 C1600 360 1670 385 1730 395"
            stroke="url(#goldRibbon1)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Rodapé: grande curva esmeralda e fita dourada transversal */}
          <path
            d="M-80 1060 L-80 850 C140 830 320 850 500 905 C680 960 880 990 1100 945 C1300 900 1480 810 1680 670 L1680 1060 Z"
            fill="url(#emeraldRibbonBottom)"
            filter="url(#emeraldShadow)"
            opacity="0.92"
          />
          <path
            d="M-60 860 C180 820 360 850 520 900 C700 955 900 980 1100 940 C1300 890 1480 800 1660 665"
            stroke="url(#goldRibbonBottom)"
            strokeWidth="12"
            strokeLinecap="round"
            filter="url(#ribbonShadow)"
          />
          <path
            d="M-60 882 C190 842 370 870 530 922 C710 978 910 998 1100 958 C1295 912 1475 820 1650 690"
            stroke="url(#goldRibbonBottom)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>

        {/* Reflexo radial na base da tela */}
        <div
          className="absolute bottom-0 inset-x-0 h-40 pointer-events-none opacity-40"
          style={{
            background:
              'linear-gradient(to top, rgba(255,255,255,0.7) 0%, rgba(247,241,228,0.2) 60%, transparent 100%)',
          }}
        />
      </div>

      {/* Topo / Header com Acesso ao Site Institucional */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-3 flex items-center justify-end">
        <Link
          to="/site"
          className="inline-flex items-center gap-2 border border-[#D8B467]/70 bg-white/90 hover:bg-white text-[#4A3410] hover:text-[#1A1203] font-semibold text-xs px-4 py-1.5 rounded-full shadow-sm hover:shadow transition-all backdrop-blur-md cursor-pointer group shrink-0"
        >
          <Globe className="w-3.5 h-3.5 text-[#B88528] group-hover:text-[#805713] transition-colors" />
          <span className="hidden sm:inline">Acessar Site Institucional</span>
          <span className="sm:hidden">Site</span>
        </Link>
      </header>

      {/* Conteúdo Central Principal */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-2 sm:py-4">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
          {/* ===================================================
              1. LOGO HURAM ORIGINAL NO TOPO (CENTRALIZADA E EM DESTAQUE)
              Utiliza a imagem real enviada pelo usuário
              =================================================== */}
          <div className="w-full flex flex-col items-center justify-center text-center mb-6 sm:mb-8 lg:mb-10">
            <div className="relative inline-block group">
              {/* Brilho halo sutil sob a logo HURAM */}
              <div
                className="absolute -inset-4 rounded-3xl blur-2xl opacity-60 pointer-events-none transition-opacity duration-500 group-hover:opacity-90"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(245,212,124,0.45) 0%, rgba(14,88,68,0.15) 55%, transparent 75%)',
                }}
              />
              <img
                src={logoHuram}
                alt="HURAM — Sistema Inteligente de Gestão"
                className="relative z-10 w-auto h-28 sm:h-36 md:h-44 lg:h-48 max-w-[92vw] sm:max-w-[460px] md:max-w-[540px] object-contain rounded-2xl shadow-[0_12px_32px_rgba(40,28,8,0.14)] ring-1 ring-[#D8B467]/35 transition-transform duration-300 hover:scale-[1.01]"
                loading="eager"
              />
            </div>
            {/* Faixa decorativa sutil dourada abaixo da logo HURAM */}
            <div className="w-48 sm:w-64 md:w-80 h-[2px] mt-3 rounded-full overflow-hidden">
              <div
                className="w-full h-full"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(201,152,52,0) 0%, rgba(201,152,52,0.85) 25%, rgba(254,233,165,1) 50%, rgba(201,152,52,0.85) 75%, rgba(201,152,52,0) 100%)',
                }}
              />
            </div>
          </div>

          {/* ===================================================
              2. GRID DE CONTEÚDO:
                 À ESQUERDA: Logos de empresa (deceldorado e Gran Romano)
                             equilibradas e separadas por divisor dourado
                 À DIREITA:  Cartão de Login Premium refinado
              =================================================== */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* --------------------------------------------------
                COLUNA ESQUERDA: AS DUAS LOGOS ORIGINAIS DE CLIENTE
                -------------------------------------------------- */}
            <div className="lg:col-span-6 flex items-center justify-center py-2 sm:py-4">
              <div className="flex items-center justify-center gap-5 sm:gap-8 md:gap-10 w-full max-w-xl">
                {/* 1) DEC ELDORADO — Logo Real Original com moldura elegante */}
                <div className="flex-1 flex flex-col items-center justify-center text-center group">
                  <div className="relative p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFFDF8] via-[#FBF5E8] to-[#EFE2C6] shadow-[0_12px_28px_rgba(20,40,90,0.18)] ring-1 ring-[#DEC180]/60 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_16px_36px_rgba(20,40,90,0.26)]">
                    <img
                      src={logoDecEldorado}
                      alt="deceldorado"
                      className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover rounded-xl sm:rounded-2xl shadow-inner"
                      loading="eager"
                    />
                  </div>
                  <span
                    className="mt-3 text-sm sm:text-base md:text-lg font-serif font-bold tracking-tight"
                    style={{
                      background:
                        'linear-gradient(135deg, #7A5216 0%, #C49635 35%, #F7DF94 50%, #B88528 75%, #5E3C0B 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    deceldorado
                  </span>
                  <span className="text-[11px] sm:text-xs font-medium text-[#73634B]">
                    Distribuição & Logística
                  </span>
                </div>

                {/* DIVISOR VERTICAL DOURADO ELEGANTE */}
                <div
                  className="h-36 sm:h-48 md:h-56 w-[2px] rounded-full self-center shrink-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(201,152,52,0) 0%, rgba(201,152,52,0.85) 20%, rgba(255,237,163,1) 50%, rgba(201,152,52,0.85) 80%, rgba(201,152,52,0) 100%)',
                    boxShadow: '0 0 10px rgba(223,178,85,0.5)',
                  }}
                />

                {/* 2) GRAN ROMANO & GRfoods® — Logo Real Original com moldura elegante */}
                <div className="flex-1 flex flex-col items-center justify-center text-center group">
                  <div className="relative p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#FFFDF8] via-[#FBF5E8] to-[#EFE2C6] shadow-[0_12px_28px_rgba(30,20,5,0.20)] ring-1 ring-[#DEC180]/60 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_16px_36px_rgba(30,20,5,0.28)]">
                    <img
                      src={logoGranRomano}
                      alt="Gran Romano — GRfoods"
                      className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover rounded-xl sm:rounded-2xl shadow-inner"
                      loading="eager"
                    />
                  </div>
                  <span
                    className="mt-3 text-sm sm:text-base md:text-lg font-serif font-bold tracking-tight"
                    style={{
                      background:
                        'linear-gradient(135deg, #7A5216 0%, #C49635 35%, #F7DF94 50%, #B88528 75%, #5E3C0B 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Gran Romano
                  </span>
                  <span className="text-[11px] sm:text-xs font-medium text-[#73634B]">
                    GRfoods&reg; &bull; Indústria
                  </span>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------
                COLUNA DIREITA: CARTÃO DE LOGIN PREMIUM
                Fundo creme/marfim, bordas arredondadas, contorno
                dourado metálico, acabamento sofisticado e títulos exigidos
                -------------------------------------------------- */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[440px] rounded-[34px] p-[2.5px] transition-all duration-300"
                style={{
                  background:
                    'linear-gradient(145deg, #FFF6D8 0%, #DFB255 22%, #C49A45 52%, #FFEBA6 78%, #7E520E 100%)',
                  boxShadow:
                    '0 24px 64px rgba(95,65,12,0.18), 0 8px 24px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.95)',
                }}
              >
                {/* Superfície interna marfim luminoso */}
                <div
                  className="relative w-full h-full rounded-[31.5px] px-6 sm:px-8 py-7 sm:py-8 overflow-hidden flex flex-col justify-between"
                  style={{
                    background:
                      'linear-gradient(180deg, #FFFFFF 0%, #FDFBF7 40%, #F8F3E8 85%, #F4ECE0 100%)',
                  }}
                >
                  {/* Iluminação suave superior */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-36 opacity-70"
                    style={{
                      background:
                        'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 80%)',
                    }}
                  />

                  <div className="relative z-10 space-y-5">
                    {/* Títulos do Cartão conforme especificação estrita */}
                    <div className="text-center space-y-1">
                      <p className="text-[#3E3424] text-sm sm:text-base font-medium tracking-tight flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#B88528]" />
                        <span>Acesse ao Sistema da</span>
                      </p>
                      <h2
                        className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight leading-snug"
                        style={{
                          background:
                            'linear-gradient(135deg, #6B470E 0%, #B88528 35%, #DFB255 60%, #5E3C0B 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.9))',
                        }}
                      >
                        DEC Eldorado
                        <span className="block text-xl sm:text-2xl font-serif font-extrabold">
                          e Gran Romano
                        </span>
                      </h2>
                      <p className="text-[#6C5E47] text-xs sm:text-[13px] font-normal pt-0.5 tracking-wide">
                        Sistema Inteligente de Gestão
                      </p>
                    </div>

                    {/* Formulário de Autenticação */}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                      {/* Campo: Usuário ou E-mail */}
                      <div className="space-y-1.5 text-left">
                        <Label
                          htmlFor="login-username"
                          className="text-xs sm:text-sm font-bold text-[#1D1811]"
                        >
                          Usuário ou E-mail
                        </Label>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A5E] group-focus-within:text-[#B88528] transition-colors" />
                          <Input
                            id="login-username"
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="Digite seu usuário ou e-mail"
                            className="pl-10 h-11 sm:h-12 rounded-xl bg-white/95 border-[#DECFA9] text-[#1D1811] placeholder:text-[#9E8E73] focus-visible:border-[#C49635] focus-visible:ring-[#C49635]/25 shadow-sm text-sm transition-all"
                            autoComplete="username"
                          />
                        </div>
                        {(fieldErrors.email || fieldErrors.username) && (
                          <p className="text-xs text-red-600 font-medium pl-1">
                            {fieldErrors.email || fieldErrors.username}
                          </p>
                        )}
                      </div>

                      {/* Campo: Senha com link Esqueceu a senha? */}
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="login-password"
                            className="text-xs sm:text-sm font-bold text-[#1D1811]"
                          >
                            Senha
                          </Label>
                          <Link
                            to="/admin/recuperar-senha"
                            className="text-xs font-semibold text-[#8B6118] hover:text-[#5E410B] hover:underline transition-colors cursor-pointer"
                          >
                            Esqueceu a senha?
                          </Link>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7A5E] group-focus-within:text-[#B88528] transition-colors" />
                          <Input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Digite sua senha"
                            className="pl-10 pr-10 h-11 sm:h-12 rounded-xl bg-white/95 border-[#DECFA9] text-[#1D1811] placeholder:text-[#9E8E73] focus-visible:border-[#C49635] focus-visible:ring-[#C49635]/25 shadow-sm text-sm transition-all"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7A5E] hover:text-[#1D1811] p-1 rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C49635] transition-colors cursor-pointer"
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

                      {/* Aviso de Inatividade da Sessão */}
                      {inactivityNotice && (
                        <div className="flex items-start gap-2.5 text-xs text-amber-900 bg-amber-100/90 rounded-xl p-3 border border-amber-300">
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

                      {/* Botão Dourado com Ícone de Cadeado: "Entrar no Sistema" */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-[#1E1403] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-[0_8px_22px_rgba(180,128,32,0.36),inset_0_1px_1px_rgba(255,255,255,0.85)] hover:shadow-[0_10px_28px_rgba(180,128,32,0.48),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                          style={{
                            background:
                              'linear-gradient(180deg, #FDE8A5 0%, #E8B953 28%, #D49D2C 70%, #B37D15 100%)',
                            border: '1px solid #ECC466',
                          }}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#1E1403]" />
                              <span>Entrando no Sistema...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#1E1403]" />
                              <span>Entrar no Sistema</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Rodapé do Cartão com Ícone de Escudo */}
                    <div className="pt-3 border-t border-[#DFD1B6]/70 flex items-center justify-center gap-2 text-center">
                      <ShieldCheck className="w-4 h-4 text-[#7A5216] shrink-0" />
                      <span className="text-[11px] sm:text-xs font-medium text-[#564832] tracking-tight">
                        Ambiente Seguro com Criptografia de Ponta
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé Inferior Discreto com Assinatura da Plataforma HURAM */}
      <footer className="relative z-20 w-full px-4 py-2.5 sm:py-3.5 text-center text-[10px] sm:text-[11px] text-[#6E604A]/80 space-y-0.5">
        <p>
          &copy; {new Date().getFullYear()} DEC Eldorado &bull; Gran Romano &mdash; Desenvolvido
          sobre a plataforma{' '}
          <span className="text-[#8C5F1E] font-semibold">
            HURAM &mdash; Sistema Inteligente de Gestão
          </span>
          .
        </p>
      </footer>
    </div>
  )
}
