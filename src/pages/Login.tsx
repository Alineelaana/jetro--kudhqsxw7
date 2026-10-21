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
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-white text-[#003D30] flex flex-col justify-between selection:bg-[#F27616]/20">
      {/* ========================================================
          CAMADA DE FUNDO LUMINOSA BRANCO COM CURVAS DECORATIVAS
          Paleta Oficial: Verde #003D30 | Laranja #F27616 | Dourado #D6A755 | Branco #FFFFFF
          Fundo branco puro com iluminação suave/gradiente sutil de branco (sem tons amarelados/creme)
          ======================================================== */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        {/* Iluminação de base branca pura com suaves halos tridimensionais */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 110% 90% at 50% 15%, #FFFFFF 0%, #FFFFFF 60%, #F8FAFA 100%)',
          }}
        />

        {/* Glows tridimensionais e reflexos suaves da paleta oficial (#D6A755, #003D30, #F27616) */}
        <div
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-[120px] opacity-35"
          style={{
            background:
              'radial-gradient(circle, rgba(214,167,85,0.30) 0%, rgba(242,118,22,0.12) 40%, rgba(255,255,255,0) 75%)',
          }}
        />
        <div
          className="absolute top-1/4 -left-36 w-[600px] h-[600px] rounded-full blur-[110px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #D6A755 0%, rgba(214,167,85,0) 70%)',
          }}
        />
        <div
          className="absolute bottom-12 -right-28 w-[620px] h-[620px] rounded-full blur-[120px] opacity-25"
          style={{
            background: 'radial-gradient(circle, #003D30 0%, rgba(0,61,48,0) 70%)',
          }}
        />

        {/* Curvas decorativas SVG 3D em Verde Profundo #003D30 e Dourado Metálico #D6A755 com toques sutis Laranja #F27616 */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1600 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Gradiente Dourado baseado em #D6A755 com relevo metálico */}
            <linearGradient id="goldRibbonOfficial" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9C7328" />
              <stop offset="25%" stopColor="#D6A755" />
              <stop offset="50%" stopColor="#FBE7BD" />
              <stop offset="72%" stopColor="#D6A755" />
              <stop offset="88%" stopColor="#E9C887" />
              <stop offset="100%" stopColor="#7E5813" />
            </linearGradient>

            <linearGradient id="goldRibbonBottomOfficial" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6F4D0F" />
              <stop offset="25%" stopColor="#D6A755" />
              <stop offset="50%" stopColor="#FFF2D6" />
              <stop offset="75%" stopColor="#C4933E" />
              <stop offset="100%" stopColor="#F5D79B" />
            </linearGradient>

            {/* Gradiente Verde Profundo #003D30 acetinado */}
            <linearGradient id="deepGreenRibbonTopRight" x1="100%" y1="0%" x2="30%" y2="100%">
              <stop offset="0%" stopColor="#00241C" />
              <stop offset="35%" stopColor="#003D30" />
              <stop offset="70%" stopColor="#0A4F40" />
              <stop offset="100%" stopColor="#003328" />
            </linearGradient>

            <linearGradient id="deepGreenRibbonBottom" x1="0%" y1="100%" x2="80%" y2="20%">
              <stop offset="0%" stopColor="#002018" />
              <stop offset="30%" stopColor="#003D30" />
              <stop offset="70%" stopColor="#074B3C" />
              <stop offset="100%" stopColor="#0F5B49" />
            </linearGradient>

            {/* Sombra 3D profunda para as curvas e fitas */}
            <filter id="goldShadow3D" x="-15%" y="-15%" width="135%" height="135%">
              <feDropShadow
                dx="0"
                dy="10"
                stdDeviation="14"
                floodColor="#3A2503"
                floodOpacity="0.22"
              />
            </filter>
            <filter id="greenShadow3D" x="-15%" y="-15%" width="135%" height="135%">
              <feDropShadow
                dx="-4"
                dy="14"
                stdDeviation="18"
                floodColor="#001813"
                floodOpacity="0.28"
              />
            </filter>
          </defs>

          {/* Canto superior esquerdo: fios dourados finos 3D */}
          <path
            d="M-60 240 C90 200 190 130 250 50 C275 10 288 -30 292 -70"
            stroke="url(#goldRibbonOfficial)"
            strokeWidth="10"
            strokeLinecap="round"
            filter="url(#goldShadow3D)"
            opacity="0.85"
          />
          <path
            d="M-80 300 C110 260 230 170 310 50 C345 0 360 -40 365 -80"
            stroke="url(#goldRibbonOfficial)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />
          {/* Filete sutil Laranja acento */}
          <path
            d="M-70 285 C100 248 215 165 295 55 C320 20 338 -20 345 -60"
            stroke="#F27616"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* Canto superior direito: fita verde #003D30 com borda dourada #D6A755 */}
          <path
            d="M1380 -60 C1400 80 1460 195 1550 270 C1610 320 1670 340 1730 350 L1730 -60 Z"
            fill="url(#deepGreenRibbonTopRight)"
            filter="url(#greenShadow3D)"
          />
          <path
            d="M1370 -60 C1390 90 1455 210 1550 285 C1615 335 1675 355 1735 365"
            stroke="url(#goldRibbonOfficial)"
            strokeWidth="7"
            strokeLinecap="round"
            filter="url(#goldShadow3D)"
          />
          <path
            d="M1340 -60 C1360 105 1430 230 1530 310 C1600 360 1670 385 1730 395"
            stroke="url(#goldRibbonOfficial)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Rodapé: grande curva Verde Profundo #003D30 e fita dourada transversal */}
          <path
            d="M-80 1060 L-80 850 C140 830 320 850 500 905 C680 960 880 990 1100 945 C1300 900 1480 810 1680 670 L1680 1060 Z"
            fill="url(#deepGreenRibbonBottom)"
            filter="url(#greenShadow3D)"
            opacity="0.95"
          />
          <path
            d="M-60 860 C180 820 360 850 520 900 C700 955 900 980 1100 940 C1300 890 1480 800 1660 665"
            stroke="url(#goldRibbonBottomOfficial)"
            strokeWidth="12"
            strokeLinecap="round"
            filter="url(#goldShadow3D)"
          />
          <path
            d="M-60 882 C190 842 370 870 530 922 C710 978 910 998 1100 958 C1295 912 1475 820 1650 690"
            stroke="url(#goldRibbonBottomOfficial)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>

        {/* Reflexo luminoso suave na base */}
        <div
          className="absolute bottom-0 inset-x-0 h-32 pointer-events-none opacity-50"
          style={{
            background:
              'linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
          }}
        />
      </div>

      {/* Topo / Header com Acesso ao Site Institucional */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-3 flex items-center justify-end">
        <Link
          to="/site"
          className="inline-flex items-center gap-2 border border-[#D6A755]/70 bg-white/95 hover:bg-white text-[#003D30] hover:text-[#00241C] font-semibold text-xs px-4 py-1.5 rounded-full shadow-[0_4px_14px_rgba(0,61,48,0.08)] hover:shadow-[0_6px_20px_rgba(214,167,85,0.25)] transition-all backdrop-blur-md cursor-pointer group shrink-0"
        >
          <Globe className="w-3.5 h-3.5 text-[#D6A755] group-hover:text-[#F27616] transition-colors" />
          <span className="hidden sm:inline">Acessar Site Institucional</span>
          <span className="sm:hidden">Site</span>
        </Link>
      </header>

      {/* Conteúdo Central Principal */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-2 sm:py-3">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
          {/* ===================================================
              1. LOGO HURAM ORIGINAL NO TOPO:
                 - Menor no topo (conforme pedido exato do usuário)
                 - Efeito 3D premium (sombras multicamada, halo suave, efeito flutuante)
                 - Subtítulo ABAIXO da logo, em corpo MAIOR, bem legível e destacado:
                   "SISTEMA INTELIGENTE DE GESTÃO"
              =================================================== */}
          <div className="w-full flex flex-col items-center justify-center text-center mb-5 sm:mb-6 lg:mb-7">
            <div className="relative inline-flex flex-col items-center group">
              {/* Pedestal / Halo de iluminação 3D sob a logo HURAM */}
              <div
                className="absolute -inset-3 rounded-3xl blur-2xl opacity-70 pointer-events-none transition-opacity duration-500 group-hover:opacity-95"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(214,167,85,0.35) 0%, rgba(242,118,22,0.18) 45%, rgba(0,61,48,0.12) 70%, transparent 85%)',
                }}
              />
              {/* Sombra de contato 3D projetada abaixo da logo (efeito flutuar) */}
              <div
                className="absolute -bottom-2 w-3/4 h-4 rounded-full blur-md opacity-40 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(0,61,48,0.6) 0%, transparent 80%)',
                }}
              />
              <img
                src={logoHuram}
                alt="HURAM — Sistema Inteligente de Gestão"
                className="relative z-10 w-auto h-16 sm:h-20 md:h-24 lg:h-28 max-w-[85vw] sm:max-w-[340px] md:max-w-[400px] object-contain rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
                style={{
                  filter:
                    'drop-shadow(0 14px 28px rgba(0,61,48,0.22)) drop-shadow(0 4px 10px rgba(214,167,85,0.35)) drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
                }}
                loading="eager"
              />
            </div>

            {/* Subtítulo ABAIXO da logo HURAM: maior, destacado e bem legível */}
            <div className="mt-3.5 sm:mt-4 flex flex-col items-center">
              <span
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-serif font-extrabold uppercase tracking-[0.16em] sm:tracking-[0.22em] text-center"
                style={{
                  background:
                    'linear-gradient(135deg, #00241C 0%, #003D30 30%, #D6A755 65%, #003D30 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 4px rgba(0,61,48,0.12))',
                }}
              >
                Sistema Inteligente de Gestão
              </span>

              {/* Linha decorativa tridimensional em Dourado #D6A755 e Laranja #F27616 */}
              <div className="flex items-center justify-center gap-2 mt-2 w-56 sm:w-72 md:w-96">
                <div
                  className="h-[2px] flex-1 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(214,167,85,0) 0%, rgba(214,167,85,0.85) 60%, rgba(242,118,22,0.9) 100%)',
                  }}
                />
                <span className="w-1.5 h-1.5 rounded-full bg-[#F27616] shadow-[0_0_8px_#F27616]" />
                <div
                  className="h-[2px] flex-1 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(242,118,22,0.9) 0%, rgba(214,167,85,0.85) 40%, rgba(214,167,85,0) 100%)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ===================================================
              2. GRID DE CONTEÚDO:
                 À ESQUERDA: Logos de empresa (deceldorado e Gran Romano)
                             com efeito 3D em camadas e divisor vertical dourado
                 À DIREITA:  Cartão de Login Premium adaptado à nova paleta
              =================================================== */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* --------------------------------------------------
                COLUNA ESQUERDA: AS DUAS LOGOS ORIGINAIS DE CLIENTE COM EFEITO 3D
                -------------------------------------------------- */}
            <div className="lg:col-span-6 flex items-center justify-center py-2 sm:py-4">
              <div className="flex items-center justify-center gap-5 sm:gap-8 md:gap-10 w-full max-w-xl">
                {/* 1) DEC ELDORADO — Logo Real Original com Efeito 3D */}
                <div className="flex-1 flex flex-col items-center justify-center text-center group">
                  <div className="relative">
                    {/* Sombra de profundidade 3D projetada */}
                    <div
                      className="absolute -bottom-3 inset-x-4 h-6 rounded-full blur-lg opacity-45 pointer-events-none transition-all duration-300 group-hover:opacity-70 group-hover:blur-xl"
                      style={{
                        background:
                          'radial-gradient(ellipse at center, rgba(0,61,48,0.5) 0%, rgba(214,167,85,0.3) 50%, transparent 80%)',
                      }}
                    />
                    {/* Moldura 3D branca com relevo e aro dourado #D6A755 */}
                    <div
                      className="relative p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1"
                      style={{
                        boxShadow:
                          '0 20px 38px -10px rgba(0,61,48,0.22), 0 10px 20px -8px rgba(214,167,85,0.30), 0 2px 6px rgba(0,0,0,0.06), inset 0 1px 2px rgba(255,255,255,1), inset 0 -2px 6px rgba(0,61,48,0.05)',
                        border: '1.5px solid rgba(214,167,85,0.7)',
                      }}
                    >
                      <img
                        src={logoDecEldorado}
                        alt="deceldorado"
                        className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 object-cover rounded-xl sm:rounded-2xl transition-transform duration-300"
                        style={{
                          filter:
                            'drop-shadow(0 6px 14px rgba(0,40,90,0.18)) drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
                        }}
                        loading="eager"
                      />
                    </div>
                  </div>
                  <span
                    className="mt-3.5 text-sm sm:text-base md:text-lg font-serif font-bold tracking-tight"
                    style={{
                      background:
                        'linear-gradient(135deg, #003D30 0%, #D6A755 45%, #F27616 80%, #003D30 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    deceldorado
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#003D30]/75">
                    Distribuição & Logística
                  </span>
                </div>

                {/* DIVISOR VERTICAL DOURADO 3D (#D6A755) */}
                <div
                  className="h-36 sm:h-48 md:h-56 w-[2.5px] rounded-full self-center shrink-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(214,167,85,0) 0%, rgba(214,167,85,0.85) 20%, rgba(251,231,189,1) 50%, rgba(214,167,85,0.85) 80%, rgba(214,167,85,0) 100%)',
                    boxShadow:
                      '0 0 12px rgba(214,167,85,0.65), 0 0 4px rgba(242,118,22,0.3)',
                  }}
                />

                {/* 2) GRAN ROMANO & GRfoods® — Logo Real Original com Efeito 3D */}
                <div className="flex-1 flex flex-col items-center justify-center text-center group">
                  <div className="relative">
                    {/* Sombra de profundidade 3D projetada */}
                    <div
                      className="absolute -bottom-3 inset-x-4 h-6 rounded-full blur-lg opacity-45 pointer-events-none transition-all duration-300 group-hover:opacity-70 group-hover:blur-xl"
                      style={{
                        background:
                          'radial-gradient(ellipse at center, rgba(0,61,48,0.5) 0%, rgba(214,167,85,0.3) 50%, transparent 80%)',
                      }}
                    />
                    {/* Moldura 3D branca com relevo e aro dourado #D6A755 */}
                    <div
                      className="relative p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1"
                      style={{
                        boxShadow:
                          '0 20px 38px -10px rgba(0,61,48,0.22), 0 10px 20px -8px rgba(214,167,85,0.30), 0 2px 6px rgba(0,0,0,0.06), inset 0 1px 2px rgba(255,255,255,1), inset 0 -2px 6px rgba(0,61,48,0.05)',
                        border: '1.5px solid rgba(214,167,85,0.7)',
                      }}
                    >
                      <img
                        src={logoGranRomano}
                        alt="Gran Romano — GRfoods"
                        className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 object-cover rounded-xl sm:rounded-2xl transition-transform duration-300"
                        style={{
                          filter:
                            'drop-shadow(0 6px 14px rgba(40,25,5,0.20)) drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
                        }}
                        loading="eager"
                      />
                    </div>
                  </div>
                  <span
                    className="mt-3.5 text-sm sm:text-base md:text-lg font-serif font-bold tracking-tight"
                    style={{
                      background:
                        'linear-gradient(135deg, #003D30 0%, #D6A755 45%, #F27616 80%, #003D30 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Gran Romano
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#003D30]/75">
                    GRfoods&reg; &bull; Indústria
                  </span>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------
                COLUNA DIREITA: CARTÃO DE LOGIN PREMIUM
                Fundo BRANCO #FFFFFF, bordas arredondadas, contorno
                dourado metálico #D6A755, acabamento 3D sofisticado e nova paleta
                -------------------------------------------------- */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[440px] rounded-[34px] p-[2.5px] transition-all duration-300"
                style={{
                  background:
                    'linear-gradient(145deg, #FFFFFF 0%, #D6A755 24%, #F27616 50%, #D6A755 78%, #7E5813 100%)',
                  boxShadow:
                    '0 28px 68px rgba(0,61,48,0.20), 0 10px 28px rgba(214,167,85,0.22), 0 2px 6px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,1)',
                }}
              >
                {/* Superfície interna BRANCA #FFFFFF luminosa */}
                <div className="relative w-full h-full rounded-[31.5px] px-6 sm:px-8 py-7 sm:py-8 overflow-hidden flex flex-col justify-between bg-white">
                  {/* Iluminação suave superior */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-36 opacity-75"
                    style={{
                      background:
                        'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,1) 0%, rgba(214,167,85,0.08) 50%, transparent 80%)',
                    }}
                  />

                  <div className="relative z-10 space-y-5">
                    {/* Títulos do Cartão */}
                    <div className="text-center space-y-1">
                      <p className="text-[#003D30] text-sm sm:text-base font-semibold tracking-tight flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#F27616]" />
                        <span>Acesse ao Sistema da</span>
                      </p>
                      <h2
                        className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight leading-snug"
                        style={{
                          background:
                            'linear-gradient(135deg, #003D30 0%, #00241C 20%, #D6A755 55%, #003D30 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          filter: 'drop-shadow(0 1px 1px rgba(0,61,48,0.08))',
                        }}
                      >
                        DEC Eldorado
                        <span className="block text-xl sm:text-2xl font-serif font-extrabold">
                          e Gran Romano
                        </span>
                      </h2>
                      <p className="text-[#003D30]/75 text-xs sm:text-[13px] font-medium pt-0.5 tracking-wide">
                        Sistema Inteligente de Gestão
                      </p>
                    </div>

                    {/* Formulário de Autenticação */}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                      {/* Campo: Usuário ou E-mail */}
                      <div className="space-y-1.5 text-left">
                        <Label
                          htmlFor="login-username"
                          className="text-xs sm:text-sm font-bold text-[#003D30]"
                        >
                          Usuário ou E-mail
                        </Label>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#003D30]/55 group-focus-within:text-[#D6A755] transition-colors" />
                          <Input
                            id="login-username"
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="Digite seu usuário ou e-mail"
                            className="pl-10 h-11 sm:h-12 rounded-xl bg-white border-[#D6A755]/50 text-[#003D30] placeholder:text-[#003D30]/45 focus-visible:border-[#D6A755] focus-visible:ring-[#D6A755]/30 shadow-sm text-sm transition-all"
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
                            className="text-xs sm:text-sm font-bold text-[#003D30]"
                          >
                            Senha
                          </Label>
                          <Link
                            to="/admin/recuperar-senha"
                            className="text-xs font-semibold text-[#F27616] hover:text-[#d4620f] hover:underline transition-colors cursor-pointer"
                          >
                            Esqueceu a senha?
                          </Link>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#003D30]/55 group-focus-within:text-[#D6A755] transition-colors" />
                          <Input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Digite sua senha"
                            className="pl-10 pr-10 h-11 sm:h-12 rounded-xl bg-white border-[#D6A755]/50 text-[#003D30] placeholder:text-[#003D30]/45 focus-visible:border-[#D6A755] focus-visible:ring-[#D6A755]/30 shadow-sm text-sm transition-all"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#003D30]/55 hover:text-[#003D30] p-1 rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D6A755] transition-colors cursor-pointer"
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
                        <div className="flex items-start gap-2.5 text-xs text-amber-900 bg-amber-50 rounded-xl p-3 border border-amber-300">
                          <Clock className="w-4 h-4 text-[#F27616] shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-medium">{inactivityNotice}</span>
                        </div>
                      )}

                      {/* Mensagem de Erro Geral */}
                      {error && !hasFieldError && (
                        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 rounded-xl p-3 border border-red-300">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                          <span className="font-medium">{error}</span>
                        </div>
                      )}

                      {/* Botão Dourado com Ícone de Cadeado: "Entrar no Sistema" */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-[#1A1203] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-[0_10px_24px_rgba(214,167,85,0.42),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:shadow-[0_12px_30px_rgba(214,167,85,0.55),inset_0_1px_1px_rgba(255,255,255,1)] hover:scale-[1.01] hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                          style={{
                            background:
                              'linear-gradient(180deg, #FBE6B8 0%, #E7BA65 24%, #D6A755 60%, #B8852B 100%)',
                            border: '1px solid #EAC070',
                          }}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#1A1203]" />
                              <span>Entrando no Sistema...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A1203]" />
                              <span>Entrar no Sistema</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Rodapé do Cartão com Ícone de Escudo */}
                    <div className="pt-3 border-t border-[#D6A755]/30 flex items-center justify-center gap-2 text-center">
                      <ShieldCheck className="w-4 h-4 text-[#003D30] shrink-0" />
                      <span className="text-[11px] sm:text-xs font-semibold text-[#003D30]/80 tracking-tight">
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
      <footer className="relative z-20 w-full px-4 py-2.5 sm:py-3.5 text-center text-[10px] sm:text-[11px] text-[#003D30]/75 space-y-0.5">
        <p>
          &copy; {new Date().getFullYear()} DEC Eldorado &bull; Gran Romano &mdash; Desenvolvido
          sobre a plataforma{' '}
          <span className="text-[#003D30] font-bold">
            HURAM &mdash; <span className="text-[#D6A755]">Sistema Inteligente de Gestão</span>
          </span>
          .
        </p>
      </footer>
    </div>
  )
}
