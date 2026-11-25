import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { canViewSecurityAccessLog } from '@/lib/permissions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle, ShieldCheck, LogIn, LogOut } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'

interface LoginLog {
  id: string
  usuario: string
  sucesso: boolean
  ip: string
  user_agent: string
  origem: string
  created: string
}

const PAGE_SIZE = 25

function formatDateTime(value: string): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function parseLogDate(value: string): number {
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? 0 : d.getTime()
}

export function SecurityAccessLogScreen() {
  const { user } = useAuth()
  const podeVer = canViewSecurityAccessLog((user as { role?: string } | undefined)?.role)

  const [logs, setLogs] = useState<LoginLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usuarioFiltro, setUsuarioFiltro] = useState('')
  const [resultadoFiltro, setResultadoFiltro] = useState('todos')

  // Janela de 15 minutos para destacar repetição de falhas
  const falhaRecentePorUsuario = useMemo(() => {
    const agora = Date.now()
    const mapa = new Map<string, number>()
    for (const log of logs) {
      if (log.sucesso) continue
      const t = parseLogDate(log.created)
      if (agora - t <= 15 * 60 * 1000) {
        mapa.set(log.usuario, (mapa.get(log.usuario) || 0) + 1)
      }
    }
    return mapa
  }, [logs])

  useEffect(() => {
    let cancel = false
    const carregar = async () => {
      setLoading(true)
      setError(null)
      try {
        const filtros: string[] = []
        if (usuarioFiltro.trim()) {
          const safe = usuarioFiltro.trim().replace(/"/g, '')
          filtros.push(`usuario ~ "${safe}"`)
        }
        if (resultadoFiltro === 'sucesso') filtros.push('sucesso = true')
        if (resultadoFiltro === 'falha') filtros.push('sucesso = false')

        const res = await pb.collection('security_login_logs').getList(page, PAGE_SIZE, {
          sort: '-created',
          filter: filtros.length > 0 ? filtros.join(' && ') : undefined,
          requestKey: null,
        })
        if (cancel) return
        setLogs(res.items as unknown as LoginLog[])
        setTotal(res.totalItems)
      } catch (err) {
        if (cancel) return
        setError(getErrorMessage(err))
      } finally {
        if (!cancel) setLoading(false)
      }
    }
    carregar()
    return () => {
      cancel = true
    }
  }, [page, usuarioFiltro, resultadoFiltro])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (!podeVer) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-10 text-center">
            <ShieldCheck
              className="mx-auto mb-3 h-10 w-10 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="font-medium">Acesso restrito</p>
            <p className="text-sm text-muted-foreground">
              Esta tela é visível apenas para administradores.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Segurança — Acessos</h1>
          <p className="text-sm text-muted-foreground">
            Log de acesso à tela de login: sucessos, falhas e bloqueios temporários por usuário.
          </p>
        </div>
        <ShieldCheck className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-xs">
            <Label htmlFor="filtro-usuario">Usuário</Label>
            <Input
              id="filtro-usuario"
              value={usuarioFiltro}
              onChange={(e) => {
                setUsuarioFiltro(e.target.value)
                setPage(1)
              }}
              placeholder="E-mail ou parte do nome"
            />
          </div>
          <div className="w-full sm:max-w-[200px]">
            <Label htmlFor="filtro-resultado">Resultado</Label>
            <Select
              value={resultadoFiltro}
              onValueChange={(v) => {
                setResultadoFiltro(v)
                setPage(1)
              }}
            >
              <SelectTrigger id="filtro-resultado">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sucesso">Apenas sucessos</SelectItem>
                <SelectItem value="falha">Apenas falhas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {falhaRecentePorUsuario.size > 0 && (
        <Card className="border-amber-500/50">
          <CardContent className="flex items-start gap-3 pt-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" aria-hidden="true" />
            <div>
              <p className="font-medium">Atenção: tentativas repetidas de senha errada</p>
              <p className="text-sm text-muted-foreground">
                Usuários com 3 ou mais falhas nos últimos 15 minutos:{' '}
                {[...falhaRecentePorUsuario.entries()]
                  .filter(([, n]) => n >= 3)
                  .map(([u, n]) => `${u} (${n} falhas)`)
                  .join(', ')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Acessos{' '}
            {total > 0 && (
              <span className="text-sm font-normal text-muted-foreground">({total} registros)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Carregando acessos…</p>
          ) : logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum registro de acesso encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Navegador</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const falhasRecentes = falhaRecentePorUsuario.get(log.usuario) || 0
                    const destaque = !log.sucesso && falhasRecentes >= 3
                    return (
                      <TableRow key={log.id} className={destaque ? 'bg-amber-500/10' : undefined}>
                        <TableCell className="whitespace-nowrap">
                          {formatDateTime(log.created)}
                        </TableCell>
                        <TableCell className="font-medium">{log.usuario}</TableCell>
                        <TableCell>
                          {log.sucesso ? (
                            <Badge className="bg-green-600 hover:bg-green-600">
                              <LogIn className="mr-1 h-3 w-3" aria-hidden="true" /> Sucesso
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <LogOut className="mr-1 h-3 w-3" aria-hidden="true" /> Falha
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{log.ip || '—'}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {log.origem === 'bloqueio_temporario'
                            ? 'Bloqueio temporário'
                            : 'Tela de login'}
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate" title={log.user_agent}>
                          {log.user_agent || '—'}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SecurityAccessLogScreen
