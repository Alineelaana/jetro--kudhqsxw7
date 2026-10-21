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
          CAMADA DE FUNDO LUMINOSA BRANCA E CLEAN (SEM ELEMENTOS VERDES)
          - Fundo branco limpo, límpido e minimalista
          - Halos de luz muito sutis e discretos exclusivamente em dourado e laranja
          - Sem curvas, fitas ou elementos decorativos que chamem a atenção
          ======================================================== */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none bg-white">
        {/* Iluminação de base 100% branca límpida com sutil brilho quente suave */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 120% 90% at 50% 0%, #FFFFFF 0%, #FFFFFF 75%, #FDFBF7 100%)',
          }}
        />

        {/* Halo superior muito sutil e discreto em dourado suave e toque de laranja */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[460px] rounded-full blur-[140px] opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(232,195,106,0.30) 0%, rgba(232,122,22,0.08) 50%, transparent 75%)',
          }}
        />

        {/* Halo discreto no canto inferior direito em dourado metálico sutil */}
        <div
          className="absolute -bottom-24 -right-24 w-[520px] h-[520px] rounded-full blur-[130px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(212,165,55,0.22) 0%, transparent 70%)',
          }}
        />

        {/* Halo discreto no canto superior esquerdo em dourado claro */}
        <div
          className="absolute top-1/4 -left-28 w-[420px] h-[420px] rounded-full blur-[120px] opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(232,195,106,0.25) 0%, transparent 70%)',
          }}
        />
      </div>

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
              {/* Pedestal / Halo de iluminação tridimensional sob a logo oficial (suave em dourado e laranja) */}
              <div
                className="absolute -inset-3 rounded-3xl blur-2xl opacity-65 pointer-events-none transition-opacity duration-500 group-hover:opacity-90"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(232,195,106,0.38) 0%, rgba(232,122,22,0.14) 50%, transparent 80%)',
                }}
              />
              {/* Sombra de contato suave projetada abaixo da logo (profundidade/efeito flutuar) */}
              <div
                className="absolute -bottom-2 w-3/4 h-3 rounded-full blur-md opacity-25 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center, rgba(0,0,0,0.35) 0%, transparent 80%)',
                }}
              />
              {/* Imagem oficial HURAM menor com efeito 3D (sombra multicamada e relevo) */}
              <img
                src={logoHuram}
                alt="HURAM"
                className="relative z-10 w-auto h-14 sm:h-16 md:h-20 lg:h-22 max-w-[85vw] sm:max-w-[280px] md:max-w-[320px] object-contain rounded-2xl transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
                style={{
                  filter:
                    'drop-shadow(0 10px 20px rgba(0,0,0,0.10)) drop-shadow(0 3px 8px rgba(212,165,55,0.32)) drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
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
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
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
              2. GRID DE CONTEÚDO (INVERTIDO CONFORME SOLICITADO):
                 À ESQUERDA (DESKTOP) / PRIMEIRO (MOBILE):
                   Cartão de Login Premium (Usuário, Senha, Link, Botão, Rodapé Seguro)
                 À DIREITA (DESKTOP) / DEPOIS (MOBILE):
                   Logos de empresa (deceldorado e Gran Romano) com moldura 3D bisotada
                   e divisor vertical dourado metálico entre elas
              =================================================== */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* --------------------------------------------------
                COLUNA ESQUERDA (DESKTOP) / 1º (MOBILE): CARTÃO DE LOGIN PREMIUM
                Fundo BRANCO #FFFFFF, bordas arredondadas, contorno
                dourado metálico #D4A537, acabamento 3D sofisticado e limpo
                -------------------------------------------------- */}
            <div className="lg:col-span-6 flex justify-center lg:justify-start">
              <div
                className="relative w-full max-w-[440px] rounded-[34px] p-[2.5px] transition-all duration-300"
                style={{
                  background:
                    'linear-gradient(145deg, #FFFFFF 0%, #D4A537 24%, #E87A16 50%, #D4A537 78%, #B38622 100%)',
                  boxShadow:
                    '0 24px 60px rgba(0,0,0,0.08), 0 10px 26px rgba(212,165,55,0.20), 0 2px 6px rgba(0,0,0,0.04), inset 0 1px 2px rgba(255,255,255,1)',
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
                          filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.06))',
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

            {/* --------------------------------------------------
                COLUNA DIREITA (DESKTOP) / 2º (MOBILE): AS DUAS LOGOS ORIGINAIS COM EFEITO 3D
                Moldura 3D bisotada, sombra suave limpa e divisor vertical dourado
                -------------------------------------------------- */}
            <div className="lg:col-span-6 flex items-center justify-center py-2 sm:py-4">
              <div className="flex items-center justify-center gap-5 sm:gap-8 md:gap-10 w-full max-w-xl">
                {/* 1) DEC ELDORADO — Logo Real Original com Efeito 3D (profundidade, relevo, sombras suaves) */}
                <div className="flex-1 flex flex-col items-center justify-center text-center group">
                  <div className="relative">
                    {/* Sombra de profundidade suave limpa */}
                    <div
                      className="absolute -bottom-3.5 inset-x-3 h-7 rounded-full blur-xl opacity-40 pointer-events-none transition-all duration-300 group-hover:opacity-65 group-hover:blur-2xl"
                      style={{
                        background:
                          'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(212,165,55,0.30) 50%, transparent 80%)',
                      }}
                    />
                    {/* Moldura 3D branca limpa com relevo bisotado e aro dourado metálico #D4A537 */}
                    <div
                      className="relative p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1"
                      style={{
                        boxShadow:
                          '0 20px 40px -10px rgba(0,0,0,0.12), 0 10px 22px -8px rgba(212,165,55,0.30), 0 2px 6px rgba(0,0,0,0.04), inset 0 2px 3px rgba(255,255,255,1), inset 0 -3px 8px rgba(212,165,55,0.08)',
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
                    {/* Sombra de profundidade suave limpa */}
                    <div
                      className="absolute -bottom-3.5 inset-x-3 h-7 rounded-full blur-xl opacity-40 pointer-events-none transition-all duration-300 group-hover:opacity-65 group-hover:blur-2xl"
                      style={{
                        background:
                          'radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(212,165,55,0.30) 50%, transparent 80%)',
                      }}
                    />
                    {/* Moldura 3D branca limpa com relevo bisotado e aro dourado metálico #D4A537 */}
                    <div
                      className="relative p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-white transition-all duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1"
                      style={{
                        boxShadow:
                          '0 20px 40px -10px rgba(0,0,0,0.12), 0 10px 22px -8px rgba(212,165,55,0.30), 0 2px 6px rgba(0,0,0,0.04), inset 0 2px 3px rgba(255,255,255,1), inset 0 -3px 8px rgba(212,165,55,0.08)',
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
