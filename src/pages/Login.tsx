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
import logoHuram from '@/assets/logo-huram-em-verde-e-dourado-1-6c1c1.png'
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
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-white text-[#0B3D2E] flex flex-col justify-between selection:bg-[#E87A16]/20">
      {/* ========================================================
          CAMADA DE FUNDO LUMINOSA BRANCA COM CURVAS DECORATIVAS 3D
          Paleta Oficial da Imagem HURAM:
          - Verde-esmeralda escuro profundo: #0B3D2E / #08291F / #14532D
          - Dourado metálico com brilho especular: #D4A537 / #E8C36A / #FBF0D2
          - Laranja vibrante: #E87A16 / #F97316
          - Fundo branco limpo com iluminação pura (#FFFFFF)
          ======================================================== */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        {/* Iluminação de base 100% branca e límpida com sutil vinheta branca */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 120% 100% at 50% 10%, #FFFFFF 0%, #FFFFFF 70%, #F5F7F6 100%)',
          }}
        />

        {/* Halos de iluminação 3D e reflexos especulares seguindo a paleta oficial */}
        <div
          className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1100px] h-[520px] rounded-full blur-[130px] opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(232,195,106,0.35) 0%, rgba(232,122,22,0.14) 40%, rgba(11,61,46,0.08) 65%, transparent 80%)',
          }}
        />
        <div
          className="absolute top-1/4 -left-36 w-[620px] h-[620px] rounded-full blur-[120px] opacity-25"
          style={{
            background: 'radial-gradient(circle, #D4A537 0%, rgba(212,165,55,0) 70%)',
          }}
        />
        <div
          className="absolute bottom-10 -right-28 w-[650px] h-[650px] rounded-full blur-[130px] opacity-30"
          style={{
            background: 'radial-gradient(circle, #0B3D2E 0%, rgba(11,61,46,0) 70%)',
          }}
        />

        {/* Curvas decorativas SVG 3D inspiradas na logomarca oficial HURAM
            (fitas curvas em verde-esmeralda escuro profundo, dourado metálico escovado e laranja vibrante com brilhos especulares) */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1600 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Gradiente Verde Profundo Oficial (#08291F -> #0B3D2E -> #14532D) */}
            <linearGradient id="huramDeepGreenTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#051C15" />
              <stop offset="35%" stopColor="#0B3D2E" />
              <stop offset="70%" stopColor="#14532D" />
              <stop offset="100%" stopColor="#08291F" />
            </linearGradient>

            <linearGradient id="huramDeepGreenBottom" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#051C15" />
              <stop offset="30%" stopColor="#0B3D2E" />
              <stop offset="65%" stopColor="#134E3C" />
              <stop offset="100%" stopColor="#14532D" />
            </linearGradient>

            {/* Gradiente Dourado Metálico Oficial (#D4A537 / #E8C36A / #FBF0D2) */}
            <linearGradient id="huramGoldMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8C6615" />
              <stop offset="22%" stopColor="#D4A537" />
              <stop offset="48%" stopColor="#FBF0D2" />
              <stop offset="72%" stopColor="#E8C36A" />
              <stop offset="88%" stopColor="#D4A537" />
              <stop offset="100%" stopColor="#6E4D0B" />
            </linearGradient>

            <linearGradient id="huramGoldBottom" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#634509" />
              <stop offset="25%" stopColor="#D4A537" />
              <stop offset="50%" stopColor="#FFF5DB" />
              <stop offset="75%" stopColor="#E8C36A" />
              <stop offset="100%" stopColor="#B38622" />
            </linearGradient>

            {/* Gradiente Laranja Vibrante Oficial (#B85808 -> #E87A16 -> #F97316 -> #FFA347) */}
            <linearGradient id="huramOrangeVibrant" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9C4505" />
              <stop offset="30%" stopColor="#E87A16" />
              <stop offset="60%" stopColor="#F97316" />
              <stop offset="85%" stopColor="#FFA64D" />
              <stop offset="100%" stopColor="#C85D08" />
            </linearGradient>

            {/* Filtros de sombra 3D profunda com relevo */}
            <filter id="ribbonShadow3D" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="12"
                stdDeviation="16"
                floodColor="#051C15"
                floodOpacity="0.26"
              />
            </filter>
            <filter id="goldGlow3D" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="6"
                stdDeviation="10"
                floodColor="#D4A537"
                floodOpacity="0.32"
              />
            </filter>
          </defs>

          {/* Canto Superior Esquerdo: fita curva em Verde Escuro, Dourado e Laranja com brilho especular */}
          <path
            d="M-80 -80 L360 -80 C320 60 220 180 80 270 C-10 330 -50 350 -80 360 Z"
            fill="url(#huramDeepGreenTop)"
            filter="url(#ribbonShadow3D)"
            opacity="0.95"
          />
          <path
            d="M-80 360 C-40 350 10 325 90 270 C230 175 330 55 370 -80"
            stroke="url(#huramGoldMetal)"
            strokeWidth="9"
            strokeLinecap="round"
            filter="url(#goldGlow3D)"
          />
          <path
            d="M-80 380 C-30 368 25 340 110 282 C250 185 350 62 390 -80"
            stroke="url(#huramOrangeVibrant)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path
            d="M-80 400 C-20 385 40 355 130 295 C270 195 370 70 410 -80"
            stroke="url(#huramGoldMetal)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Canto Superior Direito: fitas douradas finas com curva elegante */}
          <path
            d="M1360 -60 C1380 90 1450 215 1540 285 C1600 330 1665 355 1720 365"
            stroke="url(#huramGoldMetal)"
            strokeWidth="7"
            strokeLinecap="round"
            filter="url(#goldGlow3D)"
            opacity="0.85"
          />
          <path
            d="M1330 -60 C1355 105 1425 235 1520 310 C1585 360 1655 385 1715 395"
            stroke="url(#huramOrangeVibrant)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Canto Inferior Direito: grande curva em Verde Escuro com contorno dourado metálico e fita laranja */}
          <path
            d="M1680 620 C1480 770 1280 870 1060 920 C840 970 620 940 440 885 L440 1060 L1680 1060 Z"
            fill="url(#huramDeepGreenBottom)"
            filter="url(#ribbonShadow3D)"
            opacity="0.96"
          />
          <path
            d="M440 885 C620 940 840 970 1060 920 C1280 870 1480 770 1680 620"
            stroke="url(#huramGoldBottom)"
            strokeWidth="12"
            strokeLinecap="round"
            filter="url(#goldGlow3D)"
          />
          <path
            d="M450 908 C630 962 850 990 1070 940 C1290 890 1490 790 1680 642"
            stroke="url(#huramOrangeVibrant)"
            strokeWidth="4.5"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d="M465 925 C640 976 860 1004 1080 954 C1300 904 1500 804 1680 658"
            stroke="url(#huramGoldBottom)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Canto Inferior Esquerdo: filetes sutis dourado e laranja */}
          <path
            d="M-60 840 C120 810 260 840 380 890 C460 925 530 965 590 1010"
            stroke="url(#huramGoldBottom)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M-60 860 C110 832 245 860 365 910 C440 945 505 985 565 1030"
            stroke="url(#huramOrangeVibrant)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>

        {/* Reflexo luminoso suave na base para manter fundo límpido */}
        <div
          className="absolute bottom-0 inset-x-0 h-32 pointer-events-none opacity-60"
          style={{
            background:
              'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)',
          }}
        />
      </div>

      {/* Topo / Header com Acesso ao Site Institucional */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-3 flex items-center justify-end">
        <Link
          to="/site"
          className="inline-flex items-center gap-2 border border-[#D4A537]/75 bg-white/95 hover:bg-white text-[#0B3D2E] hover:text-[#051C15] font-semibold text-xs px-4 py-1.5 rounded-full shadow-[0_4px_14px_rgba(11,61,46,0.10)] hover:shadow-[0_6px_20px_rgba(212,165,55,0.30)] transition-all backdrop-blur-md cursor-pointer group shrink-0"
        >
          <Globe className="w-3.5 h-3.5 text-[#D4A537] group-hover:text-[#E87A16] transition-colors" />
          <span className="hidden sm:inline">Acessar Site Institucional</span>
          <span className="sm:hidden">Site</span>
        </Link>
      </header>

      {/* Conteúdo Central Principal */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-2 sm:py-3">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
          {/* ===================================================
              1. LOGO HURAM OFICIAL NO TOPO COM EFEITO 3D:
                 - Logo HURAM oficial menor no topo (símbolo/marca menor)
                 - Efeito tridimensional: profundidade, relevo e sombras suaves
                 - Subtítulo "Sistema Inteligente de Gestão" logo abaixo,
                   em corpo MAIOR e destacado (proporção símbolo menor, subtítulo em destaque)
              =================================================== */}
          <div className="w-full flex flex-col items-center justify-center text-center mb-4 sm:mb-5 lg:mb-6">
            <div className="relative inline-flex flex-col items-center group">
              {/* Pedestal / Halo de iluminação tridimensional sob a logo oficial */}
              <div
                className="absolute -inset-3 rounded-3xl blur-2xl opacity-75 pointer-events-none transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(232,195,106,0.40) 0%, rgba(232,122,22,0.20) 45%, rgba(11,61,46,0.15) 70%, transparent 85%)',
                }}
              />
              {/* Sombra de contato 3D suave projetada abaixo da logo (profundidade/efeito flutuar) */}
              <div
                className="absolute -bottom-2 w-3/4 h-4 rounded-full blur-md opacity-45 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(11,61,46,0.65) 0%, transparent 80%)',
                }}
              />
              {/* Imagem oficial HURAM menor com efeito 3D (sombra multicamada e relevo) */}
              <img
                src={logoHuram}
                alt="HURAM"
                className="relative z-10 w-auto h-14 sm:h-16 md:h-20 lg:h-22 max-w-[85vw] sm:max-w-[280px] md:max-w-[320px] object-contain rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
                style={{
                  filter:
                    'drop-shadow(0 14px 28px rgba(11,61,46,0.28)) drop-shadow(0 4px 12px rgba(212,165,55,0.40)) drop-shadow(0 1px 3px rgba(0,0,0,0.18))',
                }}
                loading="eager"
              />
            </div>

            {/* Subtítulo logo abaixo: proporção maior, destacado, legível e em harmonia com a nova paleta */}
            <div className="mt-3 sm:mt-3.5 flex flex-col items-center">
              <span
                className="text-lg sm:text-xl md:text-2xl lg:text-[26px] font-serif font-black uppercase tracking-[0.14em] sm:tracking-[0.20em] text-center"
                style={{
                  background:
                    'linear-gradient(135deg, #051C15 0%, #0B3D2E 28%, #D4A537 62%, #E87A16 85%, #0B3D2E 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 4px rgba(11,61,46,0.15))',
                }}
              >
                Sistema Inteligente de Gestão
              </span>

              {/* Linha decorativa tridimensional com reflexo especular dourado e laranja vibrante */}
              <div className="flex items-center justify-center gap-2 mt-2 w-64 sm:w-80 md:w-[420px]">
                <div
                  className="h-[2.5px] flex-1 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(212,165,55,0) 0%, rgba(212,165,55,0.9) 55%, rgba(232,122,22,0.95) 100%)',
                    boxShadow: '0 0 6px rgba(212,165,55,0.4)',
                  }}
                />
                <span className="w-2 h-2 rounded-full bg-[#E87A16] shadow-[0_0_10px_#E87A16,0_0_4px_#D4A537]" />
                <div
                  className="h-[2.5px] flex-1 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(232,122,22,0.95) 0%, rgba(212,165,55,0.9) 45%, rgba(212,165,55,0) 100%)',
                    boxShadow: '0 0 6px rgba(212,165,55,0.4)',
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
                {/* 1) DEC ELDORADO — Logo Real Original com Efeito 3D (profundidade, relevo, sombras suaves) */}
                <div className="flex-1 flex flex-col items-center justify-center text-center group">
                  <div className="relative">
                    {/* Sombra de profundidade 3D projetada suave */}
                    <div
                      className="absolute -bottom-3.5 inset-x-3 h-7 rounded-full blur-xl opacity-50 pointer-events-none transition-all duration-300 group-hover:opacity-75 group-hover:blur-2xl"
                      style={{
                        background:
                          'radial-gradient(ellipse at center, rgba(11,61,46,0.55) 0%, rgba(212,165,55,0.35) 50%, transparent 80%)',
                      }}
                    />
                    {/* Moldura 3D branca limpa com relevo bisotado e aro dourado metálico #D4A537 */}
                    <div
                      className="relative p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1"
                      style={{
                        boxShadow:
                          '0 22px 42px -10px rgba(11,61,46,0.26), 0 10px 22px -8px rgba(212,165,55,0.35), 0 2px 6px rgba(0,0,0,0.06), inset 0 2px 3px rgba(255,255,255,1), inset 0 -3px 8px rgba(11,61,46,0.07)',
                        border: '1.5px solid rgba(212,165,55,0.75)',
                      }}
                    >
                      <img
                        src={logoDecEldorado}
                        alt="deceldorado"
                        className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 object-cover rounded-xl sm:rounded-2xl transition-transform duration-300"
                        style={{
                          filter:
                            'drop-shadow(0 8px 16px rgba(0,40,90,0.22)) drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
                        }}
                        loading="eager"
                      />
                    </div>
                  </div>
                  <span
                    className="mt-3.5 text-sm sm:text-base md:text-lg font-serif font-bold tracking-tight"
                    style={{
                      background:
                        'linear-gradient(135deg, #0B3D2E 0%, #D4A537 45%, #E87A16 80%, #0B3D2E 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    deceldorado
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#0B3D2E]/80">
                    Distribuição & Logística
                  </span>
                </div>

                {/* DIVISOR VERTICAL DOURADO 3D (#D4A537 / #E8C36A) */}
                <div
                  className="h-36 sm:h-48 md:h-56 w-[2.5px] rounded-full self-center shrink-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(212,165,55,0) 0%, rgba(212,165,55,0.9) 20%, rgba(251,240,210,1) 50%, rgba(212,165,55,0.9) 80%, rgba(212,165,55,0) 100%)',
                    boxShadow: '0 0 14px rgba(212,165,55,0.70), 0 0 5px rgba(232,122,22,0.35)',
                  }}
                />

                {/* 2) GRAN ROMANO & GRfoods® — Logo Real Original com Efeito 3D (profundidade, relevo, sombras suaves) */}
                <div className="flex-1 flex flex-col items-center justify-center text-center group">
                  <div className="relative">
                    {/* Sombra de profundidade 3D projetada suave */}
                    <div
                      className="absolute -bottom-3.5 inset-x-3 h-7 rounded-full blur-xl opacity-50 pointer-events-none transition-all duration-300 group-hover:opacity-75 group-hover:blur-2xl"
                      style={{
                        background:
                          'radial-gradient(ellipse at center, rgba(11,61,46,0.55) 0%, rgba(212,165,55,0.35) 50%, transparent 80%)',
                      }}
                    />
                    {/* Moldura 3D branca limpa com relevo bisotado e aro dourado metálico #D4A537 */}
                    <div
                      className="relative p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1"
                      style={{
                        boxShadow:
                          '0 22px 42px -10px rgba(11,61,46,0.26), 0 10px 22px -8px rgba(212,165,55,0.35), 0 2px 6px rgba(0,0,0,0.06), inset 0 2px 3px rgba(255,255,255,1), inset 0 -3px 8px rgba(11,61,46,0.07)',
                        border: '1.5px solid rgba(212,165,55,0.75)',
                      }}
                    >
                      <img
                        src={logoGranRomano}
                        alt="Gran Romano — GRfoods"
                        className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 object-cover rounded-xl sm:rounded-2xl transition-transform duration-300"
                        style={{
                          filter:
                            'drop-shadow(0 8px 16px rgba(40,25,5,0.24)) drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
                        }}
                        loading="eager"
                      />
                    </div>
                  </div>
                  <span
                    className="mt-3.5 text-sm sm:text-base md:text-lg font-serif font-bold tracking-tight"
                    style={{
                      background:
                        'linear-gradient(135deg, #0B3D2E 0%, #D4A537 45%, #E87A16 80%, #0B3D2E 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Gran Romano
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#0B3D2E]/80">
                    GRfoods&reg; &bull; Indústria
                  </span>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------
                COLUNA DIREITA: CARTÃO DE LOGIN PREMIUM
                Fundo BRANCO #FFFFFF, bordas arredondadas, contorno
                dourado metálico #D4A537, acabamento 3D sofisticado e nova paleta
                -------------------------------------------------- */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[440px] rounded-[34px] p-[2.5px] transition-all duration-300"
                style={{
                  background:
                    'linear-gradient(145deg, #FFFFFF 0%, #D4A537 24%, #E87A16 50%, #D4A537 78%, #6E4D0B 100%)',
                  boxShadow:
                    '0 28px 68px rgba(11,61,46,0.22), 0 10px 28px rgba(212,165,55,0.25), 0 2px 6px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,1)',
                }}
              >
                {/* Superfície interna BRANCA #FFFFFF pura e luminosa */}
                <div className="relative w-full h-full rounded-[31.5px] px-6 sm:px-8 py-7 sm:py-8 overflow-hidden flex flex-col justify-between bg-white">
                  {/* Iluminação suave superior */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-36 opacity-70"
                    style={{
                      background:
                        'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,1) 0%, rgba(212,165,55,0.10) 50%, transparent 80%)',
                    }}
                  />

                  <div className="relative z-10 space-y-5">
                    {/* Títulos do Cartão */}
                    <div className="text-center space-y-1">
                      <p className="text-[#0B3D2E] text-sm sm:text-base font-semibold tracking-tight flex items-center justify-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#E87A16]" />
                        <span>Acesse ao Sistema da</span>
                      </p>
                      <h2
                        className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight leading-snug"
                        style={{
                          background:
                            'linear-gradient(135deg, #051C15 0%, #0B3D2E 25%, #D4A537 60%, #0B3D2E 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          filter: 'drop-shadow(0 1px 1px rgba(11,61,46,0.10))',
                        }}
                      >
                        DEC Eldorado
                        <span className="block text-xl sm:text-2xl font-serif font-extrabold">
                          e Gran Romano
                        </span>
                      </h2>
                      <p className="text-[#0B3D2E]/80 text-xs sm:text-[13px] font-medium pt-0.5 tracking-wide">
                        Sistema Inteligente de Gestão
                      </p>
                    </div>

                    {/* Formulário de Autenticação */}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                      {/* Campo: Usuário ou E-mail */}
                      <div className="space-y-1.5 text-left">
                        <Label
                          htmlFor="login-username"
                          className="text-xs sm:text-sm font-bold text-[#0B3D2E]"
                        >
                          Usuário ou E-mail
                        </Label>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B3D2E]/55 group-focus-within:text-[#D4A537] transition-colors" />
                          <Input
                            id="login-username"
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="Digite seu usuário ou e-mail"
                            className="pl-10 h-11 sm:h-12 rounded-xl bg-white border-[#D4A537]/50 text-[#0B3D2E] placeholder:text-[#0B3D2E]/45 focus-visible:border-[#D4A537] focus-visible:ring-[#D4A537]/30 shadow-sm text-sm transition-all"
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
                            className="text-xs sm:text-sm font-bold text-[#0B3D2E]"
                          >
                            Senha
                          </Label>
                          <Link
                            to="/admin/recuperar-senha"
                            className="text-xs font-semibold text-[#E87A16] hover:text-[#c4620a] hover:underline transition-colors cursor-pointer"
                          >
                            Esqueceu a senha?
                          </Link>
                        </div>
                        <div className="relative group">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B3D2E]/55 group-focus-within:text-[#D4A537] transition-colors" />
                          <Input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Digite sua senha"
                            className="pl-10 pr-10 h-11 sm:h-12 rounded-xl bg-white border-[#D4A537]/50 text-[#0B3D2E] placeholder:text-[#0B3D2E]/45 focus-visible:border-[#D4A537] focus-visible:ring-[#D4A537]/30 shadow-sm text-sm transition-all"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0B3D2E]/55 hover:text-[#0B3D2E] p-1 rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-[#D4A537] transition-colors cursor-pointer"
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
                          <Clock className="w-4 h-4 text-[#E87A16] shrink-0 mt-0.5" />
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
                          className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-[#1A1203] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-[0_10px_24px_rgba(212,165,55,0.45),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:shadow-[0_12px_30px_rgba(212,165,55,0.58),inset_0_1px_1px_rgba(255,255,255,1)] hover:scale-[1.01] hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                          style={{
                            background:
                              'linear-gradient(180deg, #FDF1D6 0%, #E8C36A 24%, #D4A537 60%, #B38622 100%)',
                            border: '1px solid #ECC974',
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
                    <div className="pt-3 border-t border-[#D4A537]/30 flex items-center justify-center gap-2 text-center">
                      <ShieldCheck className="w-4 h-4 text-[#0B3D2E] shrink-0" />
                      <span className="text-[11px] sm:text-xs font-semibold text-[#0B3D2E]/85 tracking-tight">
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
      <footer className="relative z-20 w-full px-4 py-2.5 sm:py-3.5 text-center text-[10px] sm:text-[11px] text-[#0B3D2E]/80 space-y-0.5">
        <p>
          &copy; {new Date().getFullYear()} DEC Eldorado &bull; Gran Romano &mdash; Desenvolvido
          sobre a plataforma{' '}
          <span className="text-[#0B3D2E] font-bold">
            HURAM &mdash; <span className="text-[#D4A537]">Sistema Inteligente de Gestão</span>
          </span>
          .
        </p>
      </footer>
    </div>
  )
}
