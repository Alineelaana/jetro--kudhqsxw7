import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'

export interface FocusNfeRegistro {
  chave_acesso?: string
  status_sefaz?: string
  codigo_status?: string
  motivo?: string
  protocolo?: string
  data_hora?: string
  ambiente?: string
  ref?: string
  cce_historico?: Array<Record<string, unknown>>
}

interface Props {
  chaveAcesso: string
  empresaId?: string
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  autorizado: {
    label: 'Autorizado pela SEFAZ',
    cls: 'bg-green-100 text-green-800 border-green-300',
  },
  rejeitado: { label: 'Rejeitado pela SEFAZ', cls: 'bg-red-100 text-red-800 border-red-300' },
  denegado: {
    label: 'Denegado pela SEFAZ',
    cls: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  cancelado: { label: 'Cancelado', cls: 'bg-gray-200 text-gray-800 border-gray-400' },
  processando: { label: 'Em processamento', cls: 'bg-blue-100 text-blue-800 border-blue-300' },
}

function baixarPdf(base64: string, filename: string) {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function FocusNfePanel({ chaveAcesso, empresaId }: Props) {
  const [registro, setRegistro] = useState<FocusNfeRegistro | null>(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')
  const [dialog, setDialog] = useState<'cancel' | 'cce' | null>(null)
  const [motivo, setMotivo] = useState('')
  const [texto, setTexto] = useState('')

  const carregar = async () => {
    try {
      const res = await pb.send<{ success: boolean; registro: FocusNfeRegistro }>(
        `/backend/v1/huram/fiscal/focus-nfe/registro/${chaveAcesso}`,
        { method: 'GET' },
      )
      setRegistro(res?.registro || null)
    } catch {
      /* sem registro ainda */
    }
  }

  useEffect(() => {
    if (chaveAcesso) void carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaveAcesso])

  // Polling enquanto em processamento
  useEffect(() => {
    if (registro?.status_sefaz !== 'processando') return
    let tentativas = 0
    const id = setInterval(async () => {
      tentativas++
      if (tentativas > 40) {
        clearInterval(id)
        return
      }
      await consultar(true)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 6000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registro?.status_sefaz])

  const run = async (action: string, payload: Record<string, unknown>) => {
    setLoading(true)
    setErro('')
    setMsg('')
    try {
      const res = await pb.send<{
        success: boolean
        message?: string
        registro?: FocusNfeRegistro
        error?: string
      }>(`/backend/v1/huram/fiscal/focus-nfe/${action}`, { method: 'POST', body: payload })
      if (res?.registro) setRegistro(res.registro)
      setMsg(res?.message || 'Operação concluída.')
      if (res?.error) setErro(res.error)
      return res
    } catch (err: unknown) {
      const errObj = err as {
        response?: Record<string, unknown>
        data?: Record<string, unknown>
        message?: string
      }
      const rawData =
        (errObj?.response?.data as Record<string, unknown> | undefined) ||
        (errObj?.response as Record<string, unknown> | undefined) ||
        (errObj?.data as Record<string, unknown> | undefined)

      const serverError =
        (typeof rawData?.error === 'string' && rawData.error) ||
        (typeof rawData?.message === 'string' && rawData.message) ||
        (typeof errObj?.response?.message === 'string' && errObj.response.message) ||
        (typeof errObj?.message === 'string' &&
          errObj.message !== 'Something went wrong.' &&
          errObj.message) ||
        ''

      setErro(serverError || 'Falha na comunicação com o servidor fiscal.')
      return null
    } finally {
      setLoading(false)
    }
  }

  const transmitir = () => run('transmit', { chave_acesso: chaveAcesso, empresa_id: empresaId })
  const consultar = async (silencioso = false) => {
    const res = await run('consult', { chave_acesso: chaveAcesso })
    if (!silencioso && res) setMsg(res.message || 'Recibo consultado.')
  }

  const baixarDanfe = async () => {
    setLoading(true)
    setErro('')
    try {
      const res = await pb.send<{ success: boolean; pdf_base64: string; filename: string }>(
        `/backend/v1/huram/fiscal/focus-nfe/danfe/${chaveAcesso}`,
        { method: 'GET' },
      )
      if (res?.pdf_base64) baixarPdf(res.pdf_base64, res.filename || `DANFE-${chaveAcesso}.pdf`)
      else setErro('PDF do DANFE indisponível.')
    } catch (err: unknown) {
      setErro((err as { message?: string })?.message || 'Falha ao obter o DANFE.')
    } finally {
      setLoading(false)
    }
  }

  const cancelar = async () => {
    if (motivo.trim().length < 15) {
      setErro('Motivo do cancelamento deve ter no mínimo 15 caracteres.')
      return
    }
    const res = await run('cancel', { chave_acesso: chaveAcesso, motivo: motivo.trim() })
    if (res) {
      setDialog(null)
      setMotivo('')
    }
  }

  const enviarCce = async () => {
    if (!texto.trim()) {
      setErro('Texto da carta de correção é obrigatório.')
      return
    }
    const res = await run('cce', { chave_acesso: chaveAcesso, texto: texto.trim() })
    if (res) {
      setDialog(null)
      setTexto('')
    }
  }

  const status = registro?.status_sefaz || ''
  const badge = STATUS_LABEL[status]
  const autorizado = status === 'autorizado'
  const cces = (registro?.cce_historico || []).filter((h) => h?.tipo === 'cce').length

  return (
    <div className="rounded-xl border-2 border-[#005B2E]/30 bg-white/70 p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-black text-[#005B2E] uppercase tracking-wide">
            Transmissão Focus NFe
          </h3>
          <p className="text-xs text-muted-foreground">
            Emissão real da NF-e (Modelo 55) via API Focus NFe
            {registro?.ambiente ? ` · ambiente: ${registro.ambiente}` : ''}
          </p>
        </div>
        {badge ? (
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${badge.cls}`}>
            {badge.label}
          </span>
        ) : (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full border bg-amber-100 text-amber-800 border-amber-300">
            Não transmitida
          </span>
        )}
      </div>

      {registro?.motivo && (
        <div className="text-xs rounded-lg bg-muted/60 px-3 py-2">
          <strong>SEFAZ:</strong> {registro.codigo_status ? `[${registro.codigo_status}] ` : ''}
          {registro.motivo}
          {registro.protocolo ? ` · Protocolo: ${registro.protocolo}` : ''}
          {registro.data_hora ? ` · ${registro.data_hora}` : ''}
        </div>
      )}

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

      <div className="flex flex-wrap gap-2">
        {!autorizado && status !== 'cancelado' && (
          <button
            type="button"
            disabled={loading}
            onClick={transmitir}
            className="text-xs font-bold px-3 py-2 rounded-lg bg-[#005B2E] text-white disabled:opacity-50"
          >
            {loading ? 'Enviando…' : 'Transmitir NF-e'}
          </button>
        )}
        {status && status !== 'processando' && (
          <button
            type="button"
            disabled={loading}
            onClick={() => void consultar(false)}
            className="text-xs font-bold px-3 py-2 rounded-lg border border-[#005B2E]/40 text-[#005B2E] bg-white"
          >
            Consultar recibo
          </button>
        )}
        {autorizado && (
          <>
            <button
              type="button"
              disabled={loading}
              onClick={baixarDanfe}
              className="text-xs font-bold px-3 py-2 rounded-lg border border-[#005B2E]/40 text-[#005B2E] bg-white"
            >
              Baixar DANFE (PDF)
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => setDialog('cancel')}
              className="text-xs font-bold px-3 py-2 rounded-lg border border-red-300 text-red-700 bg-white"
            >
              Cancelar NF-e
            </button>
            <button
              type="button"
              disabled={loading || cces >= 20}
              onClick={() => setDialog('cce')}
              className="text-xs font-bold px-3 py-2 rounded-lg border border-blue-300 text-blue-700 bg-white"
            >
              Carta de Correção ({cces}/20)
            </button>
          </>
        )}
      </div>

      {registro?.cce_historico && registro.cce_historico.length > 0 && (
        <div className="text-xs border rounded-lg divide-y">
          {registro.cce_historico.map((h, i) => (
            <div key={i} className="px-3 py-1.5 flex justify-between gap-2">
              <span className="font-bold">
                {(h as { tipo?: string }).tipo === 'cancelamento'
                  ? 'Cancelamento'
                  : `CCe #${(h as { sequencia?: number }).sequencia ?? i + 1}`}
              </span>
              <span className="text-muted-foreground truncate max-w-[60%]">
                {(h as { motivo?: string; texto?: string }).motivo ||
                  (h as { texto?: string }).texto}
              </span>
              <span>{(h as { protocolo?: string }).protocolo || '—'}</span>
            </div>
          ))}
        </div>
      )}

      {dialog === 'cancel' && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setDialog(null)}
        >
          <div
            className="bg-white rounded-xl p-5 max-w-md w-full space-y-3"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h4 className="font-bold text-sm">Cancelar NF-e</h4>
            <textarea
              value={motivo}
              onChange={(ev) => setMotivo(ev.target.value)}
              rows={3}
              placeholder="Motivo do cancelamento (mínimo 15 caracteres)"
              className="w-full text-sm border rounded-lg p-2"
            />
            <div className="text-xs text-muted-foreground">
              {motivo.trim().length}/15 caracteres mínimos
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="text-xs px-3 py-2 rounded-lg border"
                onClick={() => setDialog(null)}
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={cancelar}
                className="text-xs px-3 py-2 rounded-lg bg-red-600 text-white font-bold"
              >
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {dialog === 'cce' && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setDialog(null)}
        >
          <div
            className="bg-white rounded-xl p-5 max-w-md w-full space-y-3"
            onClick={(ev) => ev.stopPropagation()}
          >
            <h4 className="font-bold text-sm">Carta de Correção ({cces}/20)</h4>
            <textarea
              value={texto}
              onChange={(ev) => setTexto(ev.target.value)}
              rows={3}
              placeholder="Texto da correção"
              className="w-full text-sm border rounded-lg p-2"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="text-xs px-3 py-2 rounded-lg border"
                onClick={() => setDialog(null)}
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={enviarCce}
                className="text-xs px-3 py-2 rounded-lg bg-blue-600 text-white font-bold"
              >
                Enviar CCe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
