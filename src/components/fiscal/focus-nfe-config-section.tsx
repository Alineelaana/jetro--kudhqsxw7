import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cloud, CheckCircle2, AlertTriangle, Info, Loader2 } from 'lucide-react'
import { useBrand } from '@/hooks/use-brand'
import pb from '@/lib/pocketbase/client'

interface FocusConfig {
  ambiente: string
  emitente_ref: string
  cnpj_emitente: string
  status_ultima_validacao: string
  auth_mode: string
}

export function FocusNfeConfigSection() {
  const { empresasDisponiveis, empresaAtivaId } = useBrand()
  const [ambiente, setAmbiente] = useState('homologacao')
  const [emitenteRef, setEmitenteRef] = useState('')
  const [credencialOk, setCredencialOk] = useState<boolean | null>(null)
  const [statusValidacao, setStatusValidacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')

  const carregar = useCallback(async () => {
    if (!empresaAtivaId) return
    try {
      const res = await pb.send<{
        success: boolean
        credencial_configurada: boolean
        config: FocusConfig | null
      }>(`/backend/v1/huram/fiscal/focus-nfe/config/${empresaAtivaId}`, { method: 'GET' })
      setCredencialOk(res?.credencial_configurada ?? false)
      if (res?.config) {
        setAmbiente(res.config.ambiente || 'homologacao')
        setEmitenteRef(res.config.emitente_ref || '')
        setStatusValidacao(res.config.status_ultima_validacao || '')
      }
    } catch {
      setCredencialOk(false)
    }
  }, [empresaAtivaId])

  useEffect(() => {
    void carregar()
  }, [carregar])

  const salvar = async () => {
    setLoading(true)
    setMsg('')
    setErro('')
    try {
      await pb.send('/backend/v1/huram/fiscal/focus-nfe/config', {
        method: 'POST',
        body: { empresa_id: empresaAtivaId, ambiente, emitente_ref: emitenteRef },
      })
      setMsg('Configuração salva para esta empresa.')
    } catch (err: unknown) {
      setErro((err as { message?: string })?.message || 'Falha ao salvar a configuração.')
    } finally {
      setLoading(false)
    }
  }

  const testar = async () => {
    setLoading(true)
    setMsg('')
    setErro('')
    try {
      const res = await pb.send<{
        success: boolean
        message: string
        credencial_configurada: boolean
      }>('/backend/v1/huram/fiscal/focus-nfe/test', {
        method: 'POST',
        body: { ambiente, empresa_id: empresaAtivaId },
      })
      setCredencialOk(res?.credencial_configurada ?? false)
      if (res?.success) setMsg(res.message)
      else setErro(res?.message || 'Credencial recusada.')
      await carregar()
    } catch (err: unknown) {
      setErro((err as { message?: string })?.message || 'Falha ao testar a credencial.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 border-[#005B2E]/25">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#005B2E]" />
            <div>
              <h2 className="text-sm font-black text-[#005B2E] uppercase tracking-wide">
                Focus NFe — Emissão Real de NF-e
              </h2>
              <p className="text-xs text-muted-foreground">
                Transmissão direta à SEFAZ via Focus NFe. O token é armazenado apenas no backend
                (variáveis de ambiente) e nunca é exibido nesta tela.
              </p>
            </div>
          </div>
          {credencialOk === null ? (
            <Badge variant="secondary" className="text-xs">
              Verificando…
            </Badge>
          ) : credencialOk ? (
            <Badge className="text-xs bg-green-100 text-green-800 border border-green-300">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Credencial configurada
            </Badge>
          ) : (
            <Badge className="text-xs bg-amber-100 text-amber-900 border border-amber-300">
              <AlertTriangle className="w-3 h-3 mr-1" /> Credencial não configurada
            </Badge>
          )}
        </div>

        {credencialOk === false && (
          <div className="text-xs rounded-lg bg-amber-50 border border-amber-300 px-3 py-2 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Como configurar:</strong> solicite ao administrador que defina as variáveis de
              ambiente do backend na Skip Cloud — <code>FOCUS_NFE_TOKEN_HOMOLOG</code> (homologação)
              e <code>FOCUS_NFE_TOKEN</code> (produção) — com o token da API fornecido pelo Focus
              NFe. Enquanto a credencial não estiver configurada, o fluxo fiscal segue funcionando
              em modo XML para download.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold">Ambiente</label>
            <select
              value={ambiente}
              onChange={(ev) => setAmbiente(ev.target.value)}
              className="w-full text-sm border rounded-lg px-3 py-2 bg-white"
            >
              <option value="homologacao">Homologação (tpAmb=2)</option>
              <option value="producao">Produção</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold">Identificador do emitente (ref)</label>
            <input
              value={emitenteRef}
              onChange={(ev) => setEmitenteRef(ev.target.value)}
              placeholder="Referência técnica do emitente no Focus NFe (opcional)"
              className="w-full text-sm border rounded-lg px-3 py-2"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold">Status da conexão</label>
            <div className="text-xs rounded-lg bg-muted/60 px-3 py-2 min-h-[38px]">
              {statusValidacao || 'Nunca validada — use "Testar credencial".'}
            </div>
          </div>
        </div>

        {msg && (
          <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {msg}
          </div>
        )}
        {erro && (
          <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {erro}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            disabled={loading || !empresaAtivaId}
            onClick={salvar}
            className="text-xs font-bold px-4 py-2 rounded-lg bg-[#005B2E] text-white disabled:opacity-50 flex items-center gap-1"
          >
            {loading && <Loader2 className="w-3 h-3 animate-spin" />} Salvar configuração
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={testar}
            className="text-xs font-bold px-4 py-2 rounded-lg border border-[#005B2E]/40 text-[#005B2E] bg-white"
          >
            Testar credencial
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          O ambiente escolhido é usado em todas as chamadas desta empresa (transmissão, consulta,
          DANFE, cancelamento e CCe). Homologação usa a base de homologação do Focus NFe com
          tpAmb=2.
          {empresasDisponiveis && empresasDisponiveis.length > 1
            ? ' Cada empresa tem sua própria configuração.'
            : ''}
        </p>
      </CardContent>
    </Card>
  )
}
