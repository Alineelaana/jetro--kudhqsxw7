import { Building2, ShieldAlert, UserCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

interface MissingTenantNoticeProps {
  moduleName?: string
  compact?: boolean
}

/**
 * Aviso amigável e elegante para usuários não-SUP que ainda não possuem empresa vinculada no ERP HURAM.
 * Segue rigorosamente a identidade visual HURAM: verde escuro (#063D30 / #005B2E), branco e detalhes dourados (#C89B3C).
 */
export function MissingTenantNotice({ moduleName, compact = false }: MissingTenantNoticeProps) {
  const { user } = useAuth()
  const userName = (user?.name as string) || (user?.email as string) || 'Colaborador'

  if (compact) {
    return (
      <div className="rounded-lg border-2 border-[#C89B3C]/40 bg-gradient-to-r from-[#063D30]/5 via-amber-500/5 to-[#C89B3C]/10 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#063D30] text-[#C89B3C] flex items-center justify-center shrink-0 shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[#063D30]">Vínculo Organizacional Pendente</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Seu usuário não possui empresa vinculada (Dec Eldorado ou Gran Romano). Os registros
              operacionais estão restritos até a regularização pelo administrador.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      <Card className="border-2 border-[#C89B3C]/40 bg-gradient-to-br from-card via-[#F8FAF9] to-[#063D30]/5 shadow-md overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-[#063D30] via-[#005B2E] to-[#C89B3C]" />
        <CardContent className="pt-8 pb-8 px-6 sm:px-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#063D30] text-[#C89B3C] flex items-center justify-center shrink-0 shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C89B3C]/15 text-[#8A6715] border border-[#C89B3C]/30 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-[#C89B3C]" />
                ERP HURAM — Isolamento Multitenancy
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#063D30] tracking-tight">
                Vínculo Organizacional Pendente
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-sm text-foreground/80 leading-relaxed border-y border-[#005B2E]/10 py-4">
            <p>
              Olá, <strong className="text-[#063D30]">{userName}</strong>! Seu cadastro está ativo
              no sistema, mas ainda não foi associado a uma empresa (<strong>Dec Eldorado</strong>{' '}
              ou <strong>Gran Romano</strong>).
            </p>
            <p>
              Em conformidade com a política corporativa de multitenancy do ERP HURAM, o acesso aos
              módulos e registros operacionais {moduleName ? `(como ${moduleName})` : ''} é liberado
              exclusivamente após a vinculação da sua conta pelo administrador.
            </p>
          </div>

          <div className="bg-[#005B2E]/5 border border-[#005B2E]/15 rounded-xl p-4 flex items-start gap-3">
            <UserCheck className="w-5 h-5 text-[#005B2E] shrink-0 mt-0.5" />
            <div className="text-xs text-foreground/75 space-y-1">
              <p className="font-semibold text-[#005B2E]">O que você pode fazer agora?</p>
              <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                <li>
                  Suas telas institucionais, preferências e perfil continuam acessíveis normalmente.
                </li>
                <li>
                  Entre em contato com o suporte ou administrador do ERP para solicitar o vínculo
                  com sua empresa.
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Link to="/admin">
              <Button
                type="button"
                variant="outline"
                className="border-[#063D30]/30 text-[#063D30] hover:bg-[#063D30]/10 font-semibold"
              >
                Voltar ao Início
              </Button>
            </Link>
            <span className="text-[11px] text-muted-foreground">
              Ambiente de Segurança HURAM • Isolamento RLS Ativo
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
