import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { Sparkles, Plus, Edit2, Trash2, CheckCircle2, ArrowUpDown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { getJetroOnlineSugestoes, type JetroOnlineSugestao } from '@/services/jetro-online'

export function JetroOnlineSugestoesScreen() {
  const [sugestoes, setSugestoes] = useState<JetroOnlineSugestao[]>([])
  const [loading, setLoading] = useState(true)

  // Form dialog
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [texto, setTexto] = useState('')
  const [descricao, setDescricao] = useState('')
  const [modulo, setModulo] = useState('Comercial')
  const [ordem, setOrdem] = useState(1)
  const [ativo, setAtivo] = useState(true)
  const [saving, setSaving] = useState(false)

  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const records = await pb
        .collection('jetro_online_sugestoes')
        .getFullList<JetroOnlineSugestao>({
          sort: 'ordem',
        })
      setSugestoes(records)
    } catch {
      toast({ title: 'Erro ao carregar sugestões', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setTexto('')
    setDescricao('')
    setModulo('Comercial')
    setOrdem((sugestoes.length || 0) + 1)
    setAtivo(true)
    setModalOpen(true)
  }

  const handleOpenEdit = (sug: JetroOnlineSugestao) => {
    setEditingId(sug.id)
    setTexto(sug.texto)
    setDescricao(sug.descricao || '')
    setModulo(sug.modulo || 'Comercial')
    setOrdem(sug.ordem || 1)
    setAtivo(sug.ativo)
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!texto.trim()) return

    setSaving(true)
    try {
      const payload = {
        texto: texto.trim(),
        descricao: descricao.trim(),
        modulo,
        ordem: Number(ordem) || 1,
        ativo,
      }

      if (editingId) {
        await pb.collection('jetro_online_sugestoes').update(editingId, payload)
        toast({ title: 'Sugestão atualizada!' })
      } else {
        await pb.collection('jetro_online_sugestoes').create({
          ...payload,
          cliques_count: 0,
        })
        toast({ title: 'Nova sugestão cadastrada!' })
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar sugestão', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, txt: string) => {
    if (!window.confirm(`Deseja remover a sugestão "${txt}"?`)) return
    try {
      await pb.collection('jetro_online_sugestoes').delete(id)
      toast({ title: 'Sugestão excluída!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border shadow-2xs">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C9A227]" />
              Sugestões Inteligentes (Cards & Pills do Chat)
            </CardTitle>
            <CardDescription className="text-xs">
              Cards pequenos e discretos exibidos na abertura do chat flutuante, direcionando os
              operadores para análises frequentes.
            </CardDescription>
          </div>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="bg-[#005B2E] hover:bg-[#004724] text-white text-xs font-semibold h-8"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Nova Sugestão
          </Button>
        </CardHeader>
        <CardContent className="p-5 pt-2">
          {loading ? (
            <div className="text-center py-8 text-xs text-gray-400">Carregando sugestões...</div>
          ) : sugestoes.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 border border-dashed rounded-lg">
              Nenhuma sugestão cadastrada.
            </div>
          ) : (
            <div className="divide-y border rounded-lg overflow-hidden">
              {sugestoes.map((sug) => (
                <div
                  key={sug.id}
                  className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                        #{sug.ordem || 0}
                      </span>
                      <span className="text-xs font-bold text-gray-900">{sug.texto}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {sug.modulo || 'Geral'}
                      </Badge>
                      <Badge
                        className={
                          sug.ativo
                            ? 'bg-emerald-600 text-white text-[10px]'
                            : 'bg-gray-400 text-white text-[10px]'
                        }
                      >
                        {sug.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    {sug.descricao && (
                      <p className="text-[11px] text-gray-500 truncate">{sug.descricao}</p>
                    )}
                    <span className="text-[10px] text-gray-400 block">
                      Cliques realizados pelos operadores: <strong>{sug.cliques_count || 0}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(sug)}
                      className="h-7 w-7 p-0 text-gray-600 hover:text-[#005B2E]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(sug.id, sug.texto)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold">
              {editingId ? 'Editar Sugestão' : 'Nova Sugestão Inteligente'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Texto do Card / Pill *</Label>
              <Input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Ex: Quais clientes não compram há mais de 30 dias?"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Descrição / Finalidade</Label>
              <Textarea
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Explicação do que a consulta analisa..."
                className="text-xs leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Módulo</Label>
                <Input
                  value={modulo}
                  onChange={(e) => setModulo(e.target.value)}
                  placeholder="Ex: Comercial"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Ordem de Exibição</Label>
                <Input
                  type="number"
                  value={ordem}
                  onChange={(e) => setOrdem(Number(e.target.value))}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Status</Label>
              <select
                value={ativo ? 'true' : 'false'}
                onChange={(e) => setAtivo(e.target.value === 'true')}
                className="w-full h-9 px-3 text-xs rounded-lg border border-gray-200 bg-white"
              >
                <option value="true">Ativo (visível no chat)</option>
                <option value="false">Inativo</option>
              </select>
            </div>

            <DialogFooter className="border-t pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={saving} className="bg-[#005B2E] text-white">
                {saving ? 'Gravando...' : 'Salvar Sugestão'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
