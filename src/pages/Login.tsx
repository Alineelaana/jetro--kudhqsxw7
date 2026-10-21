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
import { logoHuramOfficial } from '@/lib/brand-assets'
import loginBgImage from '@/assets/login-huram-sistema-inteligente-de-gestao-bf410.png'
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
      <div className="min-h-screen bg-[#F4EFE6] flex items-center justify-center p-4">
        <MfaVerifyScreen onVerify={mfaLoginVerify} onCancel={mfaCancel} />
      </div>
    )
  }

  // Permite verificar se o hook useBrand está ativo (preservando o hook e compatibilidade)
  void loginBrand

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden overflow-y-auto bg-[#F4EFE6] text-[#241c10] flex flex-col justify-between selection:bg-[#d4a446]/30 select-none">
      {/* ========================================================
          CAMADA DE FUNDO LUMINOSA PREMIUM (SEGUINDO A IMAGEM DE REFERÊNCIA)
          Creme/off-white luminoso, ondas metálicas esmeralda e douradas,
          brilhos dourados suaves e folhagem verde desfocada no canto inferior esquerdo.
          ======================================================== */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Imagem de composição renderizada completa como base ultra-fiel */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
          style={{
            backgroundImage: `url(${loginBgImage})`,
          }}
        />

        {/* Gradiente sutil superior para suavidade se tela for maior que a proporção */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            background:
              'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.7) 0%, rgba(244,239,230,0) 70%)',
          }}
        />
      </div>

      {/* Link Discreto Superior para Site Institucional */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3 flex items-center justify-end">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-[#c4983e]/40 bg-white/70 hover:bg-white text-[#5c4015] hover:text-[#2a1d08] font-medium text-xs px-3.5 py-1.5 rounded-full transition-all shadow-sm backdrop-blur-md cursor-pointer group shrink-0"
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
          1) Topo Central: HURAM — SISTEMA INTELIGENTE DE GESTÃO
          2) Grid Central: Marcas parceiras à esquerda e Card de Login à direita
          ======================================================== */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 py-2 sm:py-6">
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
          {/* ----------------------------------------------------
              CABEÇALHO CENTRAL SUPERIOR: LOGO HURAM
              Símbolo "N" metálico à esquerda, texto HURAM verde esmeralda
              com detalhe âmbar no "A", subtítulo com linha fina dourada
              ---------------------------------------------------- */}
          <div className="w-full flex flex-col items-center justify-center text-center mb-4 sm:mb-8 md:mb-10 lg:mb-12">
            <div className="inline-flex items-center justify-center gap-3 sm:gap-4 md:gap-5">
              {/* Símbolo "N" metálico HURAM com gradiente verde/dourado/laranja */}
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 shrink-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]">
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <defs>
                    {/* Haste Esquerda Dourada Metálica */}
                    <linearGradient id="huramGoldLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#DFB255" />
                      <stop offset="30%" stopColor="#FFF2BF" />
                      <stop offset="60%" stopColor="#C49A45" />
                      <stop offset="100%" stopColor="#7A5216" />
                    </linearGradient>
                    {/* Haste Direita Dourada Metálica */}
                    <linearGradient id="huramGoldRight" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#DFB255" />
                      <stop offset="40%" stopColor="#FFF4CE" />
                      <stop offset="75%" stopColor="#B58933" />
                      <stop offset="100%" stopColor="#694511" />
                    </linearGradient>
                    {/* Diagonal Esmeralda Metálica Curva */}
                    <linearGradient id="huramEmeraldDiagonal" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0B4D3C" />
                      <stop offset="35%" stopColor="#04261D" />
                      <stop offset="70%" stopColor="#063D30" />
                      <stop offset="100%" stopColor="#0B4D3C" />
                    </linearGradient>
                    {/* Brilho da Fita / Laranja Âmbar na Curva */}
                    <linearGradient id="huramAmberRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFA633" />
                      <stop offset="50%" stopColor="#E87517" />
                      <stop offset="100%" stopColor="#A84C05" />
                    </linearGradient>
                  </defs>

                  {/* Haste Vertical Esquerda (facetada dourada) */}
                  <path d="M18 10 L40 10 L40 90 L18 90 Z" fill="url(#huramGoldLeft)" />
                  {/* Haste Vertical Direita (facetada dourada) */}
                  <path d="M60 10 L82 10 L82 90 L60 90 Z" fill="url(#huramGoldRight)" />
                  {/* Fita Diagonal Esmeralda Tridimensional que cruza o N */}
                  <path
                    d="M20 12 C35 15 50 35 78 88 L82 86 C60 40 45 15 24 10 Z"
                    fill="url(#huramEmeraldDiagonal)"
                  />
                  <path
                    d="M26 12 C44 26 56 50 82 88 L72 90 C48 52 38 30 20 14 Z"
                    fill="url(#huramEmeraldDiagonal)"
                    opacity="0.9"
                  />
                  {/* Arco/Faixa Âmbar Dourada Metálica de dobra interior */}
                  <path
                    d="M38 52 C48 60 58 72 66 84 C56 81 46 72 38 64 Z"
                    fill="url(#huramAmberRibbon)"
                  />
                </svg>
              </div>

              {/* Texto "HURAM" com "A" em triângulo laranja / esmeralda */}
              <div className="flex flex-col text-left">
                <div className="flex items-center tracking-tight leading-none">
                  <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-sans tracking-[0.06em] text-[#063529] drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]">
                    HUR
                    {/* Letra "A" com detalhe geométrico em triângulo âmbar */}
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

                {/* Subtítulo: SISTEMA INTELIGENTE DE GESTÃO com linha dourada */}
                <div className="w-full pt-1.5 sm:pt-2">
                  <p className="text-[9px] sm:text-[11px] md:text-xs lg:text-[13px] font-semibold tracking-[0.26em] sm:tracking-[0.32em] text-[#1a2c26] uppercase whitespace-nowrap">
                    SISTEMA INTELIGENTE DE GESTÃO
                  </p>
                  <div className="w-full h-[1px] mt-1 sm:mt-1.5 bg-gradient-to-r from-transparent via-[#c69b45] to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------------
              GRID DE 2 COLUNAS:
              Coluna Esquerda: As 2 marcas parceiras lado a lado com divisor vertical dourado
              Coluna Direita: Card de Login com moldura dourada arredondada
              ---------------------------------------------------- */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* COLUNA ESQUERDA: AS DUAS MARCAS PARCEIRAS LADO A LADO */}
            <div className="lg:col-span-6 flex items-center justify-center py-2 sm:py-6">
              <div className="flex items-center justify-center gap-6 sm:gap-10 md:gap-12">
                {/* 1) DEC ELDORADO (Símbolo "e" dourado circular concêntrico + nome embaixo) */}
                <div className="flex flex-col items-center justify-center text-center group transition-transform duration-300 hover:scale-[1.03]">
                  {/* Ícone concêntrico metálico dourado "e" */}
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 drop-shadow-[0_8px_20px_rgba(180,128,32,0.35)] flex items-center justify-center">
                    <svg
                      viewBox="0 0 120 120"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full"
                    >
                      <defs>
                        <linearGradient id="goldCircleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#DFB255" />
                          <stop offset="25%" stopColor="#FFF2BF" />
                          <stop offset="50%" stopColor="#C49A45" />
                          <stop offset="75%" stopColor="#F9E6A5" />
                          <stop offset="100%" stopColor="#8C5F1E" />
                        </linearGradient>
                      </defs>

                      {/* Anéis externos concêntricos estilizados */}
                      <circle
                        cx="60"
                        cy="60"
                        r="52"
                        stroke="url(#goldCircleGrad)"
                        strokeWidth="5"
                        strokeDasharray="240 25"
                        strokeLinecap="round"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="42"
                        stroke="url(#goldCircleGrad)"
                        strokeWidth="5.5"
                        strokeDasharray="180 35"
                        strokeLinecap="round"
                      />

                      {/* Núcleo central: Letra "e" dourada em anel sólido */}
                      <circle cx="60" cy="60" r="28" fill="url(#goldCircleGrad)" />
                      {/* Corte central vazado do "e" */}
                      <circle cx="60" cy="60" r="18" fill="#F5EFE4" />
                      {/* Barra horizontal do "e" */}
                      <rect
                        x="42"
                        y="56"
                        width="36"
                        height="7"
                        rx="3"
                        fill="url(#goldCircleGrad)"
                      />
                      {/* Abertura inferior do "e" */}
                      <path d="M60 60 L78 60 L78 78 L60 78 Z" fill="#F5EFE4" />
                      {/* Arco inferior do "e" */}
                      <path
                        d="M44 60 C44 69 51 76 60 76 C67 76 72 72 75 67"
                        stroke="url(#goldCircleGrad)"
                        strokeWidth="7"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </div>

                  {/* Nome deceldorado em dourado metálico serifado/elegante */}
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

                {/* DIVISOR VERTICAL DOURADO FINO */}
                <div
                  className="h-32 sm:h-40 md:h-48 w-[1.5px] rounded-full self-center"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(198,155,69,0) 0%, rgba(198,155,69,0.85) 25%, rgba(223,178,85,1) 50%, rgba(198,155,69,0.85) 75%, rgba(198,155,69,0) 100%)',
                  }}
                />

                {/* 2) GRAN ROMANO & GRfoods® */}
                <div className="flex flex-col items-center justify-center text-center group transition-transform duration-300 hover:scale-[1.03]">
                  {/* Rótulo Vintage Gran Romano (placa preta com moldura dourada e chapéu de chef no topo) */}
                  <div className="relative flex flex-col items-center drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
                    {/* Chapéu de Chef Dourado no Topo */}
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

                    {/* Placa Vintage Preta com Moldura Dourada */}
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

                    {/* Sub-base dourada da placa vintage */}
                    <div
                      className="w-[85%] h-1.5 -mt-0.5 rounded-b"
                      style={{
                        background: 'linear-gradient(90deg, #9E7422 0%, #F5DE9B 50%, #9E7422 100%)',
                      }}
                    />
                  </div>

                  {/* Marca GRfoods® com o símbolo do chapéu de chef */}
                  <div className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5">
                    {/* Chapéu de chef fino estilizado do GRfoods */}
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

            {/* COLUNA DIREITA: CARD DE LOGIN À DIREITA
                Cartão creme/off-white com moldura dourada metálica arredondada e sombra suave */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end select-text">
              <div
                className="relative w-full max-w-[440px] rounded-[32px] p-[2.5px] shadow-[0_20px_50px_rgba(92,61,12,0.18),0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300"
                style={{
                  background:
                    'linear-gradient(145deg, #FDE69E 0%, #DFB255 25%, #C49A45 55%, #F9E6A5 80%, #8C5F1E 100%)',
                }}
              >
                {/* Superfície interna do Card: Creme / Off-white luminoso */}
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
                        'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.9) 0%, transparent 70%)',
                    }}
                  />

                  {/* Conteúdo do Card */}
                  <div className="relative z-10 space-y-5">
                    {/* Cabeçalho do Card */}
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

                      {/* Campo Senha com Link Esqueceu a Senha alinhado à direita */}
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

                      {/* Aviso de Inatividade se aplicável */}
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

                      {/* Botão Dourado Grande com Efeito Metálico "Entrar no Sistema" */}
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

                    {/* Divisor fino e rodapé do card: ícone de escudo + Ambiente Seguro */}
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
      <footer className="relative z-10 w-full px-4 py-2 sm:py-3 text-center text-[10px] sm:text-[11px] text-[#7d6f58]/80 space-y-0.5">
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
