import { useEffect, useState } from 'react'
import { Copy, Check, FileCode2, Download, Globe, MessageSquareWarning } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'

/**
 * Box de Diagnóstico de Envio (suporte Focus NFe) — usado no visualizador da NF-e.
 * Mostra o payload exato do POST /v2/nfe?ref= (MODELO DE CAMPOS: flat JSON com
 * emitente, destinatário, items e tributos — sem xml/xml_assinado), o XML
 * completo (apenas como referência/download), a URL do POST e a resposta da
 * última tentativa de transmissão, sempre com botão de copiar (ou download, no
 * caso do XML) — sem truncamento.
 */

type DebugPayload = Record<string, unknown>

interface DebugResponse {
  success: boolean
  chave_acesso: string
  xml_conteudo: string
  ambiente: string
  emitente_ref: string
  url_post: string
  payload: DebugPayload
  ultima_resposta: {
    status_sefaz?: string
    codigo_status?: string
    motivo?: string
    protocolo?: string
    data_hora?: string
    ambiente?: string
    ref?: string
  }
}

interface Props {
  chaveAcesso: string
  className?: string
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}

function downloadXml(xml: string, filename: string) {
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function CopyButton({
  label,
  getValue,
  className,
}: {
  label: string
  getValue: () => string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const value = getValue()
    if (!value) {
      toast({ title: 'Nada para copiar', description: 'Conteúdo indisponível para esta NF-e.' })
      return
    }
    const ok = await copyToClipboard(value)
    if (ok) {
      setCopied(true)
      toast({
        title: label,
        description: `Conteúdo copiado integralmente (${value.length.toLocaleString('pt-BR')} caracteres).`,
      })
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast({ title: 'Falha ao copiar', description: 'Tente novamente ou use o download.' })
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleCopy}
      className={cn('gap-1.5', className)}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copiado!' : label}
    </Button>
  )
}

function InfoRow({ label, value, copyLabel }: { label: string; value: string; copyLabel: string }) {
  return (
    <div className="rounded-lg border bg-background/60 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <CopyButton label={copyLabel} getValue={() => value} />
      </div>
      <code className="block text-xs font-mono break-all max-h-24 overflow-y-auto">{value}</code>
    </div>
  )
}

export function FocusNfeSendDebug({ chaveAcesso, className }: Props) {
  const [data, setData] = useState<DebugResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!chaveAcesso) return
    let active = true
    setLoading(true)
    setError('')
    pb.send<DebugResponse & { error?: string }>(
      `/backend/v1/huram/fiscal/focus-nfe/debug/${encodeURIComponent(chaveAcesso)}`,
      {},
    )
      .then((json) => {
        if (json?.error) throw new Error(json.error)
        if (active) setData(json)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar diagnóstico')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [chaveAcesso])

  // JSON do corpo do POST /v2/nfe?ref= — MODELO DE CAMPOS (flat JSON),
  // exatamente o que o backend transmite (sem xml/xml_assinado).
  const payloadJson = data ? JSON.stringify(data.payload, null, 2) : ''
  const ultimaRespostaJson = data?.ultima_resposta
    ? JSON.stringify(
        Object.fromEntries(Object.entries(data.ultima_resposta).filter(([, v]) => v)),
        null,
        2,
      )
    : ''
  const temUltimaResposta = Boolean(
    data?.ultima_resposta && Object.values(data.ultima_resposta).some((v) => v),
  )
  const temXml = Boolean(data?.xml_conteudo)

  return (
    <div
      className={cn('rounded-xl border-2 border-[#005B2E]/30 bg-white/70 p-4 space-y-3', className)}
    >
      <div>
        <h3 className="text-sm font-black text-[#005B2E] uppercase tracking-wide">
          Diagnóstico de Envio — Suporte Focus NFe
        </h3>
        <p className="text-xs text-muted-foreground">
          JSON de envio no modelo de campos (emitente, destinatário, items e tributos), URL do POST
          e XML de referência desta NF-e — para colar no chamado do suporte.
        </p>
      </div>

      {loading && <p className="text-xs text-muted-foreground">Carregando…</p>}
      {!loading && error && <p className="text-xs text-red-700">{error}</p>}

      {!loading && data && (
        <>
          <InfoRow label="URL completa do POST" value={data.url_post} copyLabel="Copiar URL" />

          <div className="rounded-lg border bg-background/60 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground inline-flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" /> JSON exato do envio (POST body)
              </span>
              <CopyButton label="Copiar JSON de envio" getValue={() => payloadJson} />
            </div>
            <pre className="text-[11px] font-mono bg-slate-900 text-slate-100 rounded-md p-3 max-h-48 overflow-auto whitespace-pre-wrap break-all">
              {payloadJson || '(sem payload)'}
            </pre>
          </div>

          <div className="rounded-lg border bg-background/60 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground inline-flex items-center gap-1.5">
                <FileCode2 className="h-3.5 w-3.5" /> XML completo ({data.xml_conteudo?.length || 0}{' '}
                caracteres)
              </span>
              <div className="flex gap-2">
                <CopyButton label="Copiar XML completo" getValue={() => data.xml_conteudo} />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!temXml) {
                      toast({
                        title: 'Nada para baixar',
                        description: 'XML indisponível para esta NF-e.',
                      })
                      return
                    }
                    downloadXml(data.xml_conteudo, `NFe-${chaveAcesso}.xml`)
                  }}
                  className="gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Baixar XML
                </Button>
              </div>
            </div>
            <pre className="text-[11px] font-mono bg-slate-900 text-slate-100 rounded-md p-3 max-h-40 overflow-auto whitespace-pre-wrap break-all">
              {data.xml_conteudo || '(XML não disponível para esta NF-e)'}
            </pre>
          </div>

          {temUltimaResposta && (
            <div className="rounded-lg border bg-background/60 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground inline-flex items-center gap-1.5">
                  <MessageSquareWarning className="h-3.5 w-3.5" /> Última resposta de transmissão
                </span>
                <CopyButton label="Copiar resposta" getValue={() => ultimaRespostaJson} />
              </div>
              <div className="text-xs space-y-1">
                {data.ultima_resposta.status_sefaz && (
                  <div>
                    <strong>Status:</strong> {data.ultima_resposta.status_sefaz}
                  </div>
                )}
                {data.ultima_resposta.codigo_status && (
                  <div>
                    <strong>Código:</strong> {data.ultima_resposta.codigo_status}
                  </div>
                )}
                {data.ultima_resposta.motivo && (
                  <div>
                    <strong>Motivo:</strong> {data.ultima_resposta.motivo}
                  </div>
                )}
                {data.ultima_resposta.protocolo && (
                  <div>
                    <strong>Protocolo:</strong> {data.ultima_resposta.protocolo}
                  </div>
                )}
                {data.ultima_resposta.data_hora && (
                  <div>
                    <strong>Data/Hora:</strong> {data.ultima_resposta.data_hora}
                  </div>
                )}
                {data.ultima_resposta.ref && (
                  <div>
                    <strong>Ref:</strong> {data.ultima_resposta.ref}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Re-export auxiliar para uso pontual fora do box (mantém o componente como fonte única)
export { InfoRow }
