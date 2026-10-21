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
          CAMADA DE FUNDO PREMIUM MARFIM/CREME + ONDAS METÁLICAS
          Predominantemente marfim/creme luminoso, com ondas sinuosas
          em verde-esmeralda acetinado e fitas com gradientes dourados
          metálicos e reflexos especulares conforme a imagem de referência.
          ======================================================== */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
        {/* Fundo base marfim/creme acetinado com iluminação difusa */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 95% 85% at 50% 25%, #FFFFFF 0%, #FDFBF7 35%, #F7F1E4 70%, #EFE5D3 100%)',
          }}
        />

        {/* Hotspots de luz e brilho perolado */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[100px] opacity-70 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(254,249,235,0.7) 45%, rgba(245,230,195,0) 80%)',
          }}
        />
        <div
          className="absolute top-1/4 -left-40 w-[600px] h-[600px] rounded-full blur-[90px] opacity-35 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #FBE09A 0%, rgba(251,224,154,0) 70%)',
          }}
        />

        {/* SVG de Ondas Sinuosas: Verde-Esmeralda Nobre e Dourado Metálico 3D */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1600 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {/* Gradiente Dourado Metálico Brilhante 1 */}
            <linearGradient id="goldRibbonTopLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C99834" />
              <stop offset="22%" stopColor="#F9DF92" />
              <stop offset="48%" stopColor="#FFF7D1" />
              <stop offset="68%" stopColor="#DCA842" />
              <stop offset="88%" stopColor="#F5D47C" />
              <stop offset="100%" stopColor="#8C5C12" />
            </linearGradient>

            {/* Gradiente Dourado Metálico Brilhante 2 (Curva Inferior) */}
            <linearGradient id="goldRibbonBottom" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7E520E" />
              <stop offset="25%" stopColor="#E2B148" />
              <stop offset="50%" stopColor="#FFF8D6" />
              <stop offset="75%" stopColor="#C89632" />
              <stop offset="100%" stopColor="#FCE39E" />
            </linearGradient>

            {/* Gradiente Dourado Metálico 3 (Onda Superior Direita) */}
            <linearGradient id="goldRibbonTopRight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E8B84B" />
              <stop offset="35%" stopColor="#FFF6CE" />
              <stop offset="65%" stopColor="#B38020" />
              <stop offset="100%" stopColor="#6C430B" />
            </linearGradient>

            {/* Fita Esmeralda Profunda e Rica Superior Direita */}
            <linearGradient id="emeraldRibbonRight" x1="100%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#04261C" />
              <stop offset="30%" stopColor="#093F30" />
              <stop offset="70%" stopColor="#0E5441" />
              <stop offset="100%" stopColor="#052E22" />
            </linearGradient>

            {/* Fita Esmeralda Inferior Esquerda com textura acetinada */}
            <linearGradient id="emeraldRibbonBottom" x1="0%" y1="100%" x2="80%" y2="30%">
              <stop offset="0%" stopColor="#031E16" />
              <stop offset="35%" stopColor="#073B2D" />
              <stop offset="70%" stopColor="#0B4D3C" />
              <stop offset="100%" stopColor="#126851" />
            </linearGradient>

            {/* Filtro de sombra suave para as fitas 3D */}
            <filter id="softRibbonShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow
                dx="0"
                dy="12"
                stdDeviation="16"
                floodColor="#3A2807"
                floodOpacity="0.28"
              />
            </filter>
            <filter id="emeraldShadow" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow
                dx="-4"
                dy="14"
                stdDeviation="18"
                floodColor="#011610"
                floodOpacity="0.32"
              />
            </filter>
          </defs>

          {/* ================= ONDAS CANTO SUPERIOR ESQUERDO ================= */}
          {/* Fita curva dourada superior esquerda esvoaçante */}
          <path
            d="M-60 260 C80 220 180 150 240 60 C270 15 285 -40 290 -80"
            stroke="url(#goldRibbonTopLeft)"
            strokeWidth="12"
            strokeLinecap="round"
            filter="url(#softRibbonShadow)"
            opacity="0.85"
          />
          <path
            d="M-80 320 C120 280 240 180 320 60 C360 0 375 -50 380 -90"
            stroke="url(#goldRibbonTopLeft)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* ================= ONDAS CANTO SUPERIOR DIREITO ================= */}
          {/* Fita Esmeralda larga do canto superior direito entrando na tela */}
          <path
            d="M1360 -60 C1380 90 1440 210 1540 290 C1600 340 1660 360 1720 370 L1720 -60 Z"
            fill="url(#emeraldRibbonRight)"
            filter="url(#emeraldShadow)"
          />
          {/* Filete Dourado contornando a fita esmeralda superior direita */}
          <path
            d="M1350 -60 C1370 100 1435 225 1540 305 C1605 355 1665 375 1725 385"
            stroke="url(#goldRibbonTopRight)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="url(#softRibbonShadow)"
          />
          {/* Fio dourado secundário paralelo com brilho */}
          <path
            d="M1320 -60 C1340 115 1410 245 1520 330 C1590 385 1660 410 1720 420"
            stroke="url(#goldRibbonTopRight)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* ================= ONDAS CANTO INFERIOR (ESMERALDA + DOURADO) ================= */}
          {/* Grande onda esmeralda inferior contínua e suave */}
          <path
            d="M-80 1060 L-80 840 C140 820 320 840 500 900 C680 960 880 990 1100 940 C1300 895 1480 800 1680 660 L1680 1060 Z"
            fill="url(#emeraldRibbonBottom)"
            filter="url(#emeraldShadow)"
            opacity="0.92"
          />

          {/* Fita dourada grossa e proeminente cruzando o rodapé como na referência */}
          <path
            d="M-60 850 C180 810 360 840 520 895 C700 955 900 980 1100 935 C1300 885 1480 790 1660 655"
            stroke="url(#goldRibbonBottom)"
            strokeWidth="14"
            strokeLinecap="round"
            filter="url(#softRibbonShadow)"
          />

          {/* Fio dourado duplo com reflexo cintilante */}
          <path
            d="M-60 875 C190 835 370 865 530 918 C710 978 910 998 1100 955 C1295 910 1475 815 1650 685"
            stroke="url(#goldRibbonBottom)"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* Traço dourado superior de acabamento para a onda esmeralda */}
          <path
            d="M-60 830 C170 790 350 820 510 875 C690 935 890 960 1100 915 C1300 865 1480 770 1670 630"
            stroke="url(#goldRibbonTopLeft)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>

        {/* Reflexo radial de chão de mármore claro / espelho suave na base do card */}
        <div
          className="absolute bottom-0 inset-x-0 h-48 pointer-events-none opacity-45"
          style={{
            background:
              'linear-gradient(to top, rgba(255,255,255,0.7) 0%, rgba(247,241,228,0.2) 60%, transparent 100%)',
          }}
        />
      </div>

      {/* Botão Superior Discreto para Site Institucional */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-3.5 flex items-center justify-end">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-[#D8B467]/60 bg-white/85 hover:bg-white text-[#4A3410] hover:text-[#211603] font-semibold text-xs px-3.5 py-1.5 rounded-full transition-all shadow-sm backdrop-blur-md cursor-pointer group shrink-0"
        >
          <Link to="/site" className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#B88528] group-hover:text-[#805713] transition-colors" />
            <span className="hidden sm:inline">Site Institucional</span>
            <span className="sm:hidden">Site</span>
          </Link>
        </Button>
      </header>

      {/* ========================================================
          CONTEÚDO PRINCIPAL (EXATAMENTE PROPORCIONADO CONFORME A REFERÊNCIA):
          1) TOPO: Logomarca HURAM Nobre Tridimensional
             - Símbolo H esculpido em dourado metálico, fita esmeralda acetinada
               e dobra âmbar/laranja luminosa
             - Nome "HURAM" com tipografia encorpada verde-esmeralda e detalhe
               triangular laranja no "A"
             - Linha dourada com o subtítulo "SISTEMA INTELIGENTE DE GESTÃO"
          2) MEIO / GRID:
             - ESQUERDA: Logomarcas DEC ELDORADO e GRAN ROMANO
               com o divisor dourado vertical no centro
             - DIREITA: Card de Login Premium com moldura dourada metálica
               e cantos arredondados generosos
          ======================================================== */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-2 sm:py-5">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
          {/* ----------------------------------------------------
              1. LOGOMARCA HURAM NO TOPO (CENTRALIZADA)
              ---------------------------------------------------- */}
          <div className="w-full flex flex-col items-center justify-center text-center mb-6 sm:mb-8 lg:mb-10">
            <div className="inline-flex items-center justify-center gap-3 sm:gap-4 md:gap-5">
              {/* Símbolo "H" 3D em Dourado Metálico, Fita Verde-Esmeralda e Dobra Laranja */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 shrink-0 drop-shadow-[0_10px_22px_rgba(50,35,10,0.22)]">
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <defs>
                    {/* Haste Dourada Esquerda com Chanfro e Brilho 3D */}
                    <linearGradient id="huramGoldLeft3D" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#DFB255" />
                      <stop offset="26%" stopColor="#FFF4D0" />
                      <stop offset="58%" stopColor="#C69B45" />
                      <stop offset="85%" stopColor="#8C5C12" />
                      <stop offset="100%" stopColor="#5E3E0B" />
                    </linearGradient>

                    {/* Haste Dourada Direita com Iluminação */}
                    <linearGradient id="huramGoldRight3D" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F5D076" />
                      <stop offset="30%" stopColor="#FFF9E6" />
                      <stop offset="65%" stopColor="#B88A30" />
                      <stop offset="100%" stopColor="#6C450C" />
                    </linearGradient>

                    {/* Fita Esmeralda Tridimensional cruzando o H */}
                    <linearGradient id="huramEmeraldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0E5844" />
                      <stop offset="35%" stopColor="#04271D" />
                      <stop offset="70%" stopColor="#094A38" />
                      <stop offset="100%" stopColor="#042017" />
                    </linearGradient>

                    {/* Fita de Reflexo Verde-Esmeralda Claro */}
                    <linearGradient id="huramEmeraldGloss" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0B4D3C" />
                      <stop offset="50%" stopColor="#198263" />
                      <stop offset="100%" stopColor="#0B4D3C" />
                    </linearGradient>

                    {/* Dobra Interna Âmbar / Laranja Luminosa */}
                    <linearGradient id="huramAmberFold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFB347" />
                      <stop offset="45%" stopColor="#F57C00" />
                      <stop offset="80%" stopColor="#D85A00" />
                      <stop offset="100%" stopColor="#8F3500" />
                    </linearGradient>

                    {/* Sombra interna do H */}
                    <filter id="hShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow
                        dx="1"
                        dy="3"
                        stdDeviation="2.5"
                        floodColor="#1A1203"
                        floodOpacity="0.4"
                      />
                    </filter>
                  </defs>

                  {/* Haste Esquerda com chanfro */}
                  <path
                    d="M16 10 L38 10 L38 90 L16 90 Z"
                    fill="url(#huramGoldLeft3D)"
                    filter="url(#hShadow)"
                  />
                  {/* Chanfro de brilho vertical na haste esquerda */}
                  <path d="M18 10 L22 10 L22 90 L18 90 Z" fill="#FFF9E6" opacity="0.65" />

                  {/* Haste Direita com chanfro */}
                  <path
                    d="M62 10 L84 10 L84 90 L62 90 Z"
                    fill="url(#huramGoldRight3D)"
                    filter="url(#hShadow)"
                  />
                  <path d="M64 10 L68 10 L68 90 L64 90 Z" fill="#FFF9E6" opacity="0.75" />

                  {/* Fita Curva Tridimensional Esmeralda cruzando a diagonal */}
                  <path
                    d="M16 14 C36 18 52 42 82 88 L84 84 C56 36 40 14 18 10 Z"
                    fill="url(#huramEmeraldRibbon)"
                    filter="url(#hShadow)"
                  />
                  <path
                    d="M22 14 C40 26 54 52 82 86 L76 90 C50 54 38 28 18 16 Z"
                    fill="url(#huramEmeraldGloss)"
                    opacity="0.9"
                  />

                  {/* Fita Âmbar/Laranja da dobra curva inferior */}
                  <path
                    d="M34 52 C44 60 56 72 68 86 C58 83 48 74 36 62 Z"
                    fill="url(#huramAmberFold)"
                    filter="url(#hShadow)"
                  />
                  {/* Brilho da borda da fita âmbar */}
                  <path
                    d="M35 52 C45 61 57 73 68 86"
                    stroke="#FFE082"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                </svg>
              </div>

              {/* Nome HURAM com A estilizado e Subtítulo Nobre */}
              <div className="flex flex-col text-left">
                <div className="flex items-center tracking-tight leading-none">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-sans tracking-[0.05em] text-[#053226] drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                    HUR
                    {/* Letra A com detalhe geométrico em triângulo laranja na abertura */}
                    <span className="relative inline-block">
                      A
                      <span
                        className="absolute bottom-[27%] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] sm:border-l-[6px] md:border-l-[7px] lg:border-l-[8px] border-l-transparent border-r-[4px] sm:border-r-[6px] md:border-r-[7px] lg:border-r-[8px] border-r-transparent border-b-[6px] sm:border-b-[10px] md:border-b-[12px] lg:border-b-[14px] border-b-[#E87517]"
                        style={{
                          filter: 'drop-shadow(0 1px 2px rgba(232,117,23,0.5))',
                        }}
                      />
                    </span>
                    M
                  </h1>
                </div>

                {/* Subtítulo: SISTEMA INTELIGENTE DE GESTÃO com linha dourada refinada */}
                <div className="w-full pt-1 sm:pt-1.5">
                  <p className="text-[9px] sm:text-[11px] md:text-xs lg:text-[13px] font-semibold tracking-[0.24em] sm:tracking-[0.3em] text-[#142620] uppercase whitespace-nowrap">
                    SISTEMA INTELIGENTE DE GESTÃO
                  </p>
                  <div
                    className="w-full h-[1.5px] mt-1 sm:mt-1.5"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(201,152,52,0) 0%, rgba(201,152,52,0.85) 25%, rgba(245,212,124,1) 50%, rgba(201,152,52,0.85) 75%, rgba(201,152,52,0) 100%)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------
              2. GRID DE CONTEÚDO:
              ESQUERDA: DEC Eldorado | Divisor Dourado | Gran Romano
              DIREITA: Card de Login Premium com Moldura Dourada
              ---------------------------------------------------- */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* ===================================================
                COLUNA ESQUERDA: AS DUAS LOGOMARCAS COM DETALHES 3D
                E O DIVISOR DOURADO VERTICAL
                =================================================== */}
            <div className="lg:col-span-6 flex items-center justify-center py-2 sm:py-6">
              <div className="flex items-center justify-center gap-6 sm:gap-8 md:gap-10 w-full max-w-xl">
                {/* 1) DEC ELDORADO — Símbolo Dourado Metálico 3D e Nome */}
                <div className="flex-1 flex flex-col items-center justify-center text-center group transition-transform duration-300 hover:scale-[1.02]">
                  {/* Símbolo circular metálico 3D esculpido com camadas concêntricas e letra 'e' */}
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 flex items-center justify-center drop-shadow-[0_12px_24px_rgba(180,128,32,0.38)]">
                    <svg
                      viewBox="0 0 160 160"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full"
                    >
                      <defs>
                        {/* Gradiente Dourado Metálico Rico com Brilho Especular */}
                        <linearGradient id="decGoldMetal1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#DFB255" />
                          <stop offset="18%" stopColor="#FFF6DA" />
                          <stop offset="42%" stopColor="#C89737" />
                          <stop offset="68%" stopColor="#F9E29D" />
                          <stop offset="88%" stopColor="#9E6D1C" />
                          <stop offset="100%" stopColor="#5E3D0A" />
                        </linearGradient>

                        {/* Gradiente de Destaque para o miolo */}
                        <linearGradient id="decGoldMetal2" x1="10%" y1="0%" x2="90%" y2="100%">
                          <stop offset="0%" stopColor="#FCE4A2" />
                          <stop offset="35%" stopColor="#FFFBF0" />
                          <stop offset="60%" stopColor="#D5A542" />
                          <stop offset="100%" stopColor="#7F5311" />
                        </linearGradient>

                        <filter id="decGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow
                            dx="0"
                            dy="4"
                            stdDeviation="4"
                            floodColor="#8B5B12"
                            floodOpacity="0.45"
                          />
                        </filter>
                      </defs>

                      {/* Brilho de fundo perolado */}
                      <circle cx="80" cy="80" r="70" fill="#FFF9ED" opacity="0.4" />

                      {/* Anel Externo Dourado com Chanfro */}
                      <circle
                        cx="80"
                        cy="80"
                        r="66"
                        stroke="url(#decGoldMetal1)"
                        strokeWidth="7"
                        strokeDasharray="320 30"
                        strokeLinecap="round"
                        filter="url(#decGlow)"
                      />
                      {/* Nó superior do anel externo */}
                      <circle cx="128" cy="38" r="4.5" fill="url(#decGoldMetal2)" />
                      {/* Nó inferior do anel externo */}
                      <circle cx="32" cy="122" r="4.5" fill="url(#decGoldMetal2)" />

                      {/* Anel Intermediário Dourado */}
                      <circle
                        cx="80"
                        cy="80"
                        r="52"
                        stroke="url(#decGoldMetal1)"
                        strokeWidth="7"
                        strokeDasharray="230 40"
                        strokeLinecap="round"
                        filter="url(#decGlow)"
                      />
                      <circle cx="44" cy="48" r="4" fill="url(#decGoldMetal2)" />

                      {/* Núcleo Central: O 'e' tridimensional estilizado */}
                      {/* Corpo circular do 'e' */}
                      <circle
                        cx="80"
                        cy="80"
                        r="34"
                        fill="url(#decGoldMetal1)"
                        filter="url(#decGlow)"
                      />
                      {/* Furo superior do 'e' */}
                      <ellipse cx="80" cy="73" rx="19" ry="14" fill="#FAF5EB" />
                      {/* Barra horizontal do 'e' */}
                      <rect
                        x="58"
                        y="76"
                        width="44"
                        height="8.5"
                        rx="4"
                        fill="url(#decGoldMetal2)"
                      />
                      {/* Abertura inferior direita do 'e' */}
                      <path d="M80 84 L106 84 L106 104 L80 104 Z" fill="#FAF5EB" />
                      {/* Arco inferior arredondado do 'e' */}
                      <path
                        d="M60 81 C60 93 69 103 81 103 C90 103 97 97 101 90"
                        stroke="url(#decGoldMetal1)"
                        strokeWidth="8.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </div>

                  {/* Nome deceldorado em tipografia serifada nobre com gradiente dourado */}
                  <span
                    className="mt-2.5 text-xl sm:text-2xl md:text-3xl font-serif font-bold tracking-tight lowercase"
                    style={{
                      background:
                        'linear-gradient(135deg, #7A5216 0%, #D4A23B 30%, #FFF2BE 50%, #B88528 75%, #5E3C0B 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.8))',
                    }}
                  >
                    deceldorado
                  </span>
                </div>

                {/* DIVISOR VERTICAL DOURADO ELEGANTE */}
                <div
                  className="h-36 sm:h-44 md:h-52 w-[2px] rounded-full self-center shrink-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(201,152,52,0) 0%, rgba(201,152,52,0.85) 20%, rgba(255,237,163,1) 50%, rgba(201,152,52,0.85) 80%, rgba(201,152,52,0) 100%)',
                    boxShadow: '0 0 8px rgba(223,178,85,0.45)',
                  }}
                />

                {/* 2) GRAN ROMANO & GRfoods® — Rótulo Tridimensional com Chapéu e Moldura Dourada */}
                <div className="flex-1 flex flex-col items-center justify-center text-center group transition-transform duration-300 hover:scale-[1.02]">
                  {/* Bloco Gran Romano 3D */}
                  <div className="relative flex flex-col items-center drop-shadow-[0_12px_24px_rgba(30,20,5,0.22)]">
                    {/* Chapéu de Chef no Topo com Contorno Dourado 3D */}
                    <div className="relative -mb-1 w-14 h-10 sm:w-16 sm:h-11 md:w-20 md:h-13">
                      <svg
                        viewBox="0 0 100 70"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full"
                      >
                        <defs>
                          <linearGradient id="chefHatGold" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#DFB255" />
                            <stop offset="35%" stopColor="#FFF6D8" />
                            <stop offset="70%" stopColor="#C69B45" />
                            <stop offset="100%" stopColor="#805612" />
                          </linearGradient>
                        </defs>
                        {/* Corpo do Chapéu de Chef */}
                        <path
                          d="M20 54 C12 48 8 36 14 26 C20 16 32 16 38 22 C44 10 60 8 70 18 C78 14 88 20 90 30 C92 40 86 50 78 54 Z"
                          fill="#FFFDF7"
                          stroke="url(#chefHatGold)"
                          strokeWidth="4"
                        />
                        {/* Linhas de dobra do chapéu */}
                        <path
                          d="M38 23 C42 34 45 44 48 54"
                          stroke="url(#chefHatGold)"
                          strokeWidth="2.5"
                          opacity="0.8"
                        />
                        <path
                          d="M62 18 C64 30 66 42 68 54"
                          stroke="url(#chefHatGold)"
                          strokeWidth="2.5"
                          opacity="0.8"
                        />
                        {/* Faixa da Base do Chapéu */}
                        <rect x="22" y="54" width="56" height="8" rx="2" fill="url(#chefHatGold)" />
                      </svg>
                    </div>

                    {/* Moldura Preta com Duplo Filete Dourado Metálico */}
                    <div
                      className="relative px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border-2 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(180deg, #1A1612 0%, #0D0A08 100%)',
                        borderColor: '#E2B148',
                        boxShadow:
                          'inset 0 0 0 2px #FCE4A2, inset 0 0 0 3.5px #7E520E, 0 8px 18px rgba(0,0,0,0.35)',
                      }}
                    >
                      <span
                        className="text-lg sm:text-2xl md:text-3xl font-serif font-extrabold tracking-wide text-white whitespace-nowrap"
                        style={{
                          textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 2px rgba(255,255,255,0.4)',
                        }}
                      >
                        Gran Romano
                      </span>
                      <span className="text-[9px] sm:text-[10px] font-sans text-[#FCE4A2] font-bold ml-1 self-start">
                        &reg;
                      </span>
                    </div>

                    {/* Base Dourada com Acabamento 3D */}
                    <div
                      className="w-[88%] h-2 -mt-0.5 rounded-b-md shadow-sm"
                      style={{
                        background:
                          'linear-gradient(90deg, #7A5216 0%, #E8B953 25%, #FFF6D8 50%, #C49A45 75%, #5E3C0B 100%)',
                      }}
                    />
                  </div>

                  {/* Identificação GRfoods® com Chapéu Dourado ao lado */}
                  <div className="mt-3.5 sm:mt-4 flex items-center justify-center gap-2">
                    <div className="w-7 h-5 sm:w-8 sm:h-6 shrink-0">
                      <svg
                        viewBox="0 0 100 70"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-full h-full"
                      >
                        <path
                          d="M20 54 C12 48 8 36 14 26 C20 16 32 16 38 22 C44 10 60 8 70 18 C78 14 88 20 90 30 C92 40 86 50 78 54 Z"
                          fill="none"
                          stroke="#7A5216"
                          strokeWidth="6"
                        />
                        <rect x="22" y="54" width="56" height="8" rx="2" fill="#7A5216" />
                      </svg>
                    </div>

                    <span
                      className="text-xl sm:text-2xl font-sans font-black tracking-tight"
                      style={{
                        background:
                          'linear-gradient(135deg, #7A5216 0%, #B88528 35%, #5E3C0B 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      GR<span className="font-semibold">foods</span>
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-[#7A5216] -mt-2">
                      &reg;
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ===================================================
                COLUNA DIREITA: CARTÃO DE LOGIN PREMIUM
                Fundo marfim/creme, moldura dourada metálica arredondada,
                sombras suaves e botão dourado 3D com cadeado
                =================================================== */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div
                className="relative w-full max-w-[440px] rounded-[34px] p-[2.5px] transition-all duration-300"
                style={{
                  background:
                    'linear-gradient(145deg, #FFF6D8 0%, #DFB255 20%, #C49A45 50%, #FFEBA6 78%, #7E520E 100%)',
                  boxShadow:
                    '0 24px 60px rgba(100,68,14,0.18), 0 6px 20px rgba(0,0,0,0.06), inset 0 1px 1px rgba(255,255,255,0.9)',
                }}
              >
                {/* Superfície interna marfim / creme luminoso */}
                <div
                  className="relative w-full h-full rounded-[31.5px] px-6 sm:px-8 py-7 sm:py-8 overflow-hidden flex flex-col justify-between"
                  style={{
                    background:
                      'linear-gradient(180deg, #FFFFFF 0%, #FCF9F3 40%, #F8F2E6 85%, #F4ECE0 100%)',
                  }}
                >
                  {/* Iluminação suave superior do card */}
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-36 opacity-60"
                    style={{
                      background:
                        'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 80%)',
                    }}
                  />

                  {/* Conteúdo do Card */}
                  <div className="relative z-10 space-y-5">
                    {/* Topo do Card: Hierarquia visual da referência */}
                    <div className="text-center space-y-1">
                      <p className="text-[#3E3424] text-sm sm:text-base font-medium tracking-tight">
                        Acesse ao Sistema da
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

                    {/* Formulário de Login */}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-1">
                      {/* Campo Usuário ou E-mail */}
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

                      {/* Campo Senha com link Esqueceu a senha? no cabeçalho */}
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

                      {/* Botão "Entrar no Sistema" Dourado com Acabamento 3D Metálico e Ícone de Cadeado */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full h-11 sm:h-12 rounded-xl font-bold text-sm sm:text-base text-[#1E1403] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-[0_8px_22px_rgba(180,128,32,0.36),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:shadow-[0_10px_28px_rgba(180,128,32,0.48),inset_0_1px_1px_rgba(255,255,255,0.95)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                          style={{
                            background:
                              'linear-gradient(180deg, #FDE8A5 0%, #E8B953 28%, #D49D2C 70%, #B37D15 100%)',
                            border: '1px solid #ECC466',
                          }}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#1E1403]" />
                              <span>Entrando...</span>
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

                    {/* Rodapé do cartão com ícone de segurança */}
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

      {/* ========================================================
          RODAPÉ INFERIOR DISCRETO COM ASSINATURA DA PLATAFORMA HURAM
          ======================================================== */}
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
