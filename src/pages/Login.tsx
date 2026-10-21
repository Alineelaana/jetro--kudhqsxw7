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
      <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-4">
        <MfaVerifyScreen onVerify={mfaLoginVerify} onCancel={mfaCancel} />
      </div>
    )
  }

  // Preserva compatibilidade do hook useBrand
  void loginBrand

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#F7F2EA] text-[#221B13] flex flex-col justify-between selection:bg-[#d4a446]/30">
      {/* ========================================================
          CAMADA DE FUNDO LUMINOSA PREMIUM — ONDAS METÁLICAS E DECORAÇÃO
          Creme/marfim luminoso com ondas orgânicas em verde-esmeralda e dourado metálico,
          sem sobreposição com a imagem de composição/mockup para evitar duplicidade.
          ======================================================== */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        {/* Fundo base em degradê creme / marfim luminoso */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 70% at 50% -10%, #FFFFFF 0%, #FAF4EB 40%, #F5EDE0 75%, #ECE2D0 100%)',
          }}
        />

        {/* SVG de Ondas Metálicas Nobres (Verde-Esmeralda e Dourado) */}
        <svg
          className="absolute inset-0 w-full h-full preserve-3d"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Gradiente Dourado Metálico 1 */}
            <linearGradient id="waveGoldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DFB255" stopOpacity="0.45" />
              <stop offset="35%" stopColor="#FFF2BF" stopOpacity="0.6" />
              <stop offset="65%" stopColor="#C49A45" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#8C5F1E" stopOpacity="0.35" />
            </linearGradient>

            {/* Gradiente Dourado Brilhante Intenso */}
            <linearGradient id="waveGoldHighlight" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#D4A446" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#FFECA8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#A87922" stopOpacity="0.5" />
            </linearGradient>

            {/* Gradiente Verde-Esmeralda Profundo */}
            <linearGradient id="waveEmeraldGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#04271D" stopOpacity="0.3" />
              <stop offset="45%" stopColor="#094A3A" stopOpacity="0.22" />
              <stop offset="80%" stopColor="#116B50" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#1E8264" stopOpacity="0.05" />
            </linearGradient>

            {/* Gradiente Esmeralda com reflexo acetinado */}
            <linearGradient id="waveEmeraldGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#063D30" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#0B4D3C" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#D4A446" stopOpacity="0.08" />
            </linearGradient>
          </defs>

          {/* Onda Orgânica Suave Esmeralda Superior Esquerda */}
          <path
            d="M-80 -40 C180 80 320 220 380 440 C440 660 260 840 -60 940 L-100 -40 Z"
            fill="url(#waveEmeraldGrad1)"
          />

          {/* Filete Dourado Curvo Acentuando a Onda Esquerda */}
          <path
            d="M-50 20 C220 120 350 260 395 470 C435 660 300 810 -30 920"
            stroke="url(#waveGoldHighlight)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* Onda Esmeralda Inferior Direita */}
          <path
            d="M1520 960 C1280 840 1140 700 1100 480 C1060 260 1220 80 1520 -40 L1560 960 Z"
            fill="url(#waveEmeraldGrad2)"
          />

          {/* Filete Dourado Curvo na Onda Direita */}
          <path
            d="M1500 900 C1240 790 1120 640 1085 450 C1050 250 1180 90 1480 0"
            stroke="url(#waveGoldGrad1)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.65"
          />

          {/* Fita Dinâmica Ondulada Flutuante Dourada no Fundo */}
          <path
            d="M-40 760 Q380 580 720 720 T1480 640"
            stroke="url(#waveGoldGrad1)"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            opacity="0.35"
          />
        </svg>

        {/* Brilho radial no topo para iluminação cinematográfica */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 50% 15%, rgba(255,255,255,0.75) 0%, rgba(247,242,234,0) 60%)',
          }}
        />
      </div>

      {/* Botão Superior Discreto para Site Institucional */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-3 flex items-center justify-end">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-[#c4983e]/50 bg-white/80 hover:bg-white text-[#5c4015] hover:text-[#2a1d08] font-medium text-xs px-3.5 py-1.5 rounded-full transition-all shadow-sm backdrop-blur-md cursor-pointer group shrink-0"
        >
          <Link to="/site" className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#b88528] group-hover:text-[#8a5d14] transition-colors" />
            <span className="hidden sm:inline">Site Institucional</span>
            <span className="sm:hidden">Site</span>
          </Link>
        </Button>
      </header>

      {/* ========================================================
          CONTEÚDO PRINCIPAL:
          1) TOPO: Logomarca HURAM centralizada (H estilizado, verde-esmeralda,
             detalhe laranja na letra A, subtítulo SISTEMA INTELIGENTE DE GESTÃO)
          2) GRID:
             - Esquerda: DEC Eldorado (símbolo dourado circular e nome) +
               divisor dourado vertical +
               Gran Romano (chapéu de chef, moldura preta/dourada e GRfoods)
             - Direita: Cartão de Login com moldura dourada metálica arredondada
          ======================================================== */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-3 sm:py-6">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
          {/* ----------------------------------------------------
              1. LOGOMARCA HURAM NO TOPO (CENTRALIZADA)
              Conforme especificação:
              - Símbolo H estilizado em dourado, verde e laranja
              - Nome HURAM em verde-esmeralda
              - Detalhe laranja na letra A
              - Subtítulo "SISTEMA INTELIGENTE DE GESTÃO"
              ---------------------------------------------------- */}
          <div className="w-full flex flex-col items-center justify-center text-center mb-6 sm:mb-9 lg:mb-12">
            <div className="inline-flex items-center justify-center gap-3 sm:gap-4 md:gap-5">
              {/* Símbolo H estilizado tridimensional em dourado, verde e laranja */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-[88px] lg:h-[88px] shrink-0 drop-shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <defs>
                    {/* Haste Esquerda Dourada Metálica com chanfro tridimensional */}
                    <linearGradient id="huramHGoldLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#DFB255" />
                      <stop offset="28%" stopColor="#FFF2BF" />
                      <stop offset="60%" stopColor="#C49A45" />
                      <stop offset="100%" stopColor="#7A5216" />
                    </linearGradient>
                    {/* Haste Direita Dourada Metálica com chanfro tridimensional */}
                    <linearGradient id="huramHGoldRight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#DFB255" />
                      <stop offset="35%" stopColor="#FFF4CE" />
                      <stop offset="70%" stopColor="#B58933" />
                      <stop offset="100%" stopColor="#694511" />
                    </linearGradient>
                    {/* Fita Diagonal Esmeralda Curva */}
                    <linearGradient id="huramHEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0B4D3C" />
                      <stop offset="30%" stopColor="#032119" />
                      <stop offset="70%" stopColor="#063D30" />
                      <stop offset="100%" stopColor="#0B4D3C" />
                    </linearGradient>
                    {/* Dobra Interna Âmbar Laranja */}
                    <linearGradient id="huramHAmber" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFA633" />
                      <stop offset="50%" stopColor="#E87517" />
                      <stop offset="100%" stopColor="#A84C05" />
                    </linearGradient>
                  </defs>

                  {/* Haste Vertical Esquerda Dourada */}
                  <path d="M16 10 L38 10 L38 90 L16 90 Z" fill="url(#huramHGoldLeft)" />
                  {/* Haste Vertical Direita Dourada */}
                  <path d="M62 10 L84 10 L84 90 L62 90 Z" fill="url(#huramHGoldRight)" />
                  {/* Fita Curva Tridimensional Esmeralda cruzando como no H original */}
                  <path
                    d="M18 12 C34 16 48 38 78 88 L84 86 C62 38 46 14 24 10 Z"
                    fill="url(#huramHEmerald)"
                  />
                  <path
                    d="M24 12 C42 26 54 50 82 88 L74 90 C48 52 38 30 18 14 Z"
                    fill="url(#huramHEmerald)"
                    opacity="0.92"
                  />
                  {/* Fita Âmbar/Laranja da dobra */}
                  <path
                    d="M36 50 C46 58 56 70 66 84 C56 81 46 72 36 62 Z"
                    fill="url(#huramHAmber)"
                  />
                </svg>
              </div>

              {/* Nome HURAM em verde-esmeralda e detalhe laranja no A */}
              <div className="flex flex-col text-left">
                <div className="flex items-center tracking-tight leading-none">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-sans tracking-[0.06em] text-[#063529] drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]">
                    HUR
                    {/* Letra A com detalhe geométrico em triângulo laranja na abertura */}
                    <span className="relative inline-block">
                      A
                      <span
                        className="absolute bottom-[28%] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] sm:border-l-[6px] md:border-l-[7px] border-l-transparent border-r-[4px] sm:border-r-[6px] md:border-r-[7px] border-r-transparent border-b-[6px] sm:border-b-[10px] md:border-b-[12px] border-b-[#E87517]"
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(232,117,23,0.5))',
                        }}
                      />
                    </span>
                    M
                  </h1>
                </div>

                {/* Subtítulo: SISTEMA INTELIGENTE DE GESTÃO */}
                <div className="w-full pt-1 sm:pt-1.5">
                  <p className="text-[9px] sm:text-[11px] md:text-xs lg:text-[13px] font-semibold tracking-[0.26em] sm:tracking-[0.32em] text-[#1c2e28] uppercase whitespace-nowrap">
                    SISTEMA INTELIGENTE DE GESTÃO
                  </p>
                  <div className="w-full h-[1px] mt-1 sm:mt-1.5 bg-gradient-to-r from-transparent via-[#c69b45] to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------
              2. GRID DE CONTEÚDO:
              Esquerda: Marcas DEC Eldorado | Gran Romano com divisor dourado
              Direita: Cartão de Login com moldura dourada e campos funcionais
              ---------------------------------------------------- */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* COLUNA ESQUERDA: AS DUAS LOGOMARCAS COM O DIVISOR DOURADO VERTICAL */}
            <div className="lg:col-span-6 flex items-center justify-center py-2 sm:py-6">
              <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-12">
                {/* 1) DEC ELDORADO */}
                <div className="flex flex-col items-center justify-center text-center group transition-transform duration-300 hover:scale-[1.03]">
                  {/* Símbolo circular em dourado metálico tridimensional com efeito concêntrico */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 drop-shadow-[0_8px_20px_rgba(180,128,32,0.38)] flex items-center justify-center">
                    <svg
                      viewBox="0 0 120 120"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full"
                    >
                      <defs>
                        <linearGradient id="goldCircleDecGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#DFB255" />
                          <stop offset="25%" stopColor="#FFF2BF" />
                          <stop offset="50%" stopColor="#C49A45" />
                          <stop offset="75%" stopColor="#F9E6A5" />
                          <stop offset="100%" stopColor="#8C5F1E" />
                        </linearGradient>
                      </defs>

                      {/* Anéis externos concêntricos estilizados com nós */}
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        stroke="url(#goldCircleDecGrad)"
                        strokeWidth="5"
                        strokeDasharray="240 25"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="42"
                        stroke="url(#goldCircleDecGrad)"
                        strokeWidth="5.5"
                        strokeDasharray="180 35"
                        strokeLinecap="round"
                      />

                      {/* Núcleo central: Letra "e" dourada */}
                      <circle cx="60" cy="60" r="28" fill="url(#goldCircleDecGrad)" />
                      {/* Corte interior */}
                      <circle cx="60" cy="60" r="18" fill="#F7F2EA" />
                      {/* Barra horizontal do "e" */}
                      <rect
                        x="42"
                        y="56"
                        width="36"
                        height="7"
                        rx="3"
                        fill="url(#goldCircleDecGrad)"
                      />
                      {/* Abertura inferior do "e" */}
                      <path d="M60 60 L78 60 L78 78 L60 78 Z" fill="#F7F2EA" />
                      {/* Arco inferior do "e" */}
                      <path
                        d="M44 60 C44 69 51 76 60 76 C67 76 72 72 75 67"
                        stroke="url(#goldCircleDecGrad)"
                        strokeWidth="7"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </div>

                  {/* Nome deceldorado abaixo do símbolo */}
                  <span
                    className="mt-2 text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-tight lowercase"
                    style={{
                      background:
                        'linear-gradient(135deg, #7A5216 0%, #C49A45 35%, #9E7422 70%, #5E3C0B 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.7))',
                    }}
                  >
                    deceldorado
                  </span>
                </div>

                {/* DIVISOR VERTICAL DOURADO ELEGANTE */}
                <div
                  className="h-32 sm:h-40 md:h-48 w-[1.5px] rounded-full self-center"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(198,155,69,0) 0%, rgba(198,155,69,0.85) 25%, rgba(223,178,85,1) 50%, rgba(198,155,69,0.85) 75%, rgba(198,155,69,0) 100%)',
                  }}
                />

                {/* 2) GRAN ROMANO & GRfoods® */}
                <div className="flex flex-col items-center justify-center text-center group transition-transform duration-300 hover:scale-[1.03]">
                  {/* Rótulo tradicional com chapéu de chef e moldura dourada */}
                  <div className="relative flex flex-col items-center drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
                    {/* Chapéu de chef no topo */}
                    <div className="relative -mb-1 w-12 h-9 sm:w-14 sm:h-10 md:w-16 md:h-11">
                      <svg
                        viewBox="0 0 100 70"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full"
                      >
                        <path
                          d="M20 54 C12 48 8 36 14 26 C20 16 32 16 38 22 C44 10 60 8 70 18 C78 14 88 20 90 30 C92 40 86 50 78 54 Z"
                          fill="#FFF9E6"
                          stroke="#C69B45"
                          strokeWidth="4"
                        />
                        <path d="M22 54 L76 54 L74 62 L24 62 Z" fill="#C69B45" />
                      </svg>
                    </div>

                    {/* Moldura característica preta com contorno dourado */}
                    <div
                      className="relative px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg border-2 shadow-md flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(180deg, #1C1917 0%, #0F0E0D 100%)',
                        borderColor: '#C69B45',
                        boxShadow: 'inset 0 0 0 2px #E8C16D, 0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      <span className="text-lg sm:text-2xl md:text-3xl font-serif font-extrabold tracking-wide text-white whitespace-nowrap drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        Gran Romano
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-sans text-[#E8C16D] font-bold ml-1 self-start">
                        &reg;
                      </span>
                    </div>

                    {/* Base dourada */}
                    <div
                      className="w-[85%] h-1.5 -mt-0.5 rounded-b"
                      style={{
                        background: 'linear-gradient(90deg, #9E7422 0%, #F5DE9B 50%, #9E7422 100%)',
                      }}
                    />
                  </div>

                  {/* Identificação GRfoods® abaixo */}
                  <div className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5">
                    <div className="w-6 h-5 sm:w-7 sm:h-6 text-[#7A5216]">
                      <svg
                        viewBox="0 0 100 70"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full"
                      >
                        <path
                          d="M20 54 C12 48 8 36 14 26 C20 16 32 16 38 22 C44 10 60 8 70 18 C78 14 88 20 90 30 C92 40 86 50 78 54 Z"
                          stroke="#7A5216"
                          strokeWidth="6"
                        />
                        <path d="M22 54 L76 54 L74 62 L24 62 Z" fill="#7A5216" />
                      </svg>
                    </div>

                    <span
                      className="text-lg sm:text-2xl font-sans font-black tracking-tight"
                      style={{
                        background:
                          'linear-gradient(135deg, #7A5216 0%, #C49A45 50%, #5E3C0B 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      GR<span className="font-medium">foods</span>
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-[#7A5216] -mt-2">
                      &reg;
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA: CARTÃO DE LOGIN COM MOLDURA DOURADA METÁLICA */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[440px] rounded-[32px] p-[2.5px] shadow-[0_20px_50px_rgba(92,61,12,0.18),0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300"
                style={{
                  background:
                    'linear-gradient(145deg, #FDE69E 0%, #DFB255 25%, #C49A45 55%, #F9E6A5 80%, #8C5F1E 100%)',
                }}
              >
                {/* Superfície interna branca-creme / marfim luminoso */}
                <div
                  className="relative w-full h-full rounded-[30px] px-6 sm:px-8 py-7 sm:py-8 overflow-hidden flex flex-col justify-between"
                  style={{
                    background: 'linear-gradient(180deg, #FDFBF7 0%, #FAF5EC 50%, #F5EDE0 100%)',
                  }}
                >
                  {/* Brilho interior suave */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.95) 0%, transparent 70%)',
                    }}
                  />

                  {/* Conteúdo do Card */}
                  <div className="relative z-10 space-y-5">
                    {/* Topo do Card: textos exatamente como na imagem */}
                    <div className="text-center space-y-0.5">
                      <p className="text-[#332a1e] text-sm sm:text-base font-normal tracking-tight">
                        Acesse ao Sistema da
                      </p>
                      <h2
                        className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight leading-tight"
                        style={{
                          background:
                            'linear-gradient(135deg, #6B470E 0%, #B88528 35%, #8C5F1E 70%, #5E3C0B 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.8))',
                        }}
                      >
                        DEC Eldorado
                        <span className="block text-xl sm:text-2xl font-serif font-extrabold">
                          e Gran Romano
                        </span>
                      </h2>
                      <p className="text-[#6d5e46] text-xs sm:text-[13px] font-normal pt-0.5 tracking-wide">
                        Sistema Inteligente de Gestão
                      </p>
                    </div>

                    {/* Formulário de Login */}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                      {/* Campo Usuário ou E-mail */}
                      <div className="space-y-1.5 text-left">
                        <Label
                          htmlFor="login-username"
                          className="text-xs sm:text-sm font-bold text-[#1f1a14]"
                        >
                          Usuário ou E-mail
                        </Label>
                        <div className="relative group">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7b62] group-focus-within:text-[#b88528] transition-colors" />
                          <Input
                            id="login-username"
                            type="text"
                            value={username}
                            onChange={handleUsernameChange}
                            placeholder="Digite seu usuário ou e-mail"
                            className="pl-10 h-11 sm:h-12 rounded-xl bg-white/95 border-[#d9cca8] text-[#1f1a14] placeholder:text-[#9e8f76] focus-visible:border-[#c49635] focus-visible:ring-[#c49635]/25 shadow-sm text-sm transition-all"
                            autoComplete="username"
                          />
                        </div>
                        {(fieldErrors.email || fieldErrors.username) && (
                          <p className="text-xs text-red-600 font-medium pl-1">
                            {fieldErrors.email || fieldErrors.username}
                          </p>
                        )}
                      </div>

                      {/* Campo Senha com link Esqueceu a senha? visível ao lado do título */}
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor="login-password"
                            className="text-xs sm:text-sm font-bold text-[#1f1a14]"
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
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a7b62] group-focus-within:text-[#b88528] transition-colors" />
                          <Input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="Digite sua senha"
                            className="pl-10 pr-10 h-11 sm:h-12 rounded-xl bg-white/95 border-[#d9cca8] text-[#1f1a14] placeholder:text-[#9e8f76] focus-visible:border-[#c49635] focus-visible:ring-[#c49635]/25 shadow-sm text-sm transition-all"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a7b62] hover:text-[#1f1a14] p-1 rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-[#c49635] transition-colors cursor-pointer"
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

                      {/* Aviso de Inatividade */}
                      {inactivityNotice && (
                        <div className="flex items-start gap-2.5 text-xs text-amber-900 bg-amber-100/90 rounded-xl p-3 border border-amber-300">
                          <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-medium">{inactivityNotice}</span>
                        </div>
                      )}

                      {/* Erro geral */}
                      {error && !hasFieldError && (
                        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100/90 rounded-xl p-3 border border-red-300">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                          <span className="font-medium">{error}</span>
                        </div>
                      )}

                      {/* Botão "Entrar no Sistema" em dourado metálico com ícone de cadeado */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-[#241704] flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_6px_18px_rgba(180,128,32,0.32),inset_0_1px_1px_rgba(255,255,255,0.7)] hover:shadow-[0_8px_24px_rgba(180,128,32,0.45),inset_0_1px_1px_rgba(255,255,255,0.85)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                          style={{
                            background:
                              'linear-gradient(180deg, #FDE69E 0%, #E8B953 30%, #D49D2C 70%, #B88118 100%)',
                            border: '1px solid #E5BA55',
                          }}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#241704]" />
                              <span>Entrando...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#241704]" />
                              <span>Entrar no Sistema</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Rodapé do cartão com ícone de segurança */}
                    <div className="pt-3 border-t border-[#dccfb4]/70 flex items-center justify-center gap-2 text-center">
                      <ShieldCheck className="w-4 h-4 text-[#7A5216] shrink-0" />
                      <span className="text-[11px] sm:text-xs font-medium text-[#5c4d36] tracking-tight">
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

      {/* ========================================================
          RODAPÉ INFERIOR DISCRETO COM ASSINATURA DA PLATAFORMA HURAM
          ======================================================== */}
      <footer className="relative z-20 w-full px-4 py-2 sm:py-3 text-center text-[10px] sm:text-[11px] text-[#7d6f58]/80 space-y-0.5">
        <p>
          &copy; {new Date().getFullYear()} DEC Eldorado &bull; Gran Romano &mdash; Desenvolvido
          sobre a plataforma{' '}
          <span className="text-[#8c5f1e] font-semibold">
            HURAM &mdash; Sistema Inteligente de Gestão
          </span>
          .
        </p>
      </footer>
    </div>
  )
}
