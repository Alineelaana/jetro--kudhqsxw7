import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { MapPin, Plus, Edit2, Trash2, MousePointer2, ExternalLink } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { JetroTour, JetroTourStep } from '@/services/jetro-online'

export function JetroOnlineToursScreen() {
  const [tours, setTours] = useState<JetroTour[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [rota, setRota] = useState('')
  const [modulo, setModulo] = useState('Geral')
  const [etapas, setEtapas] = useState<JetroTourStep[]>([])
  const [ativo, setAtivo] = useState(true)
  const [saving, setSaving] = useState(false)

  // Sub-campos de etapa
  const [newStepTitulo, setNewStepTitulo] = useState('')
  const [newStepTexto, setNewStepTexto] = useState('')
  const [newStepSeletor, setNewStepSeletor] = useState('')

  const { toast } = useToast()

  const loadData = async () => {
    setLoading(true)
    try {
      const records = await pb.collection('jetro_tours').getFullList<JetroTour>({
        sort: 'ordem,rota',
      })
      setTours(records)
    } catch {
      toast({ title: 'Erro ao carregar tours guiados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingId(null)
    setTitulo('')
    setDescricao('')
    setRota('')
    setModulo('Geral')
    setEtapas([
      {
        titulo: 'Introdução à Tela',
        texto: 'Visão geral desta seção do ERP.',
        posicao: 'bottom',
      },
    ])
    setAtivo(true)
    setModalOpen(true)
  }

  const handleOpenEdit = (t: JetroTour) => {
    setEditingId(t.id)
    setTitulo(t.titulo)
    setDescricao(t.descricao || '')
    setRota(t.rota)
    setModulo(t.modulo || 'Geral')
    setEtapas(t.etapas || [])
    setAtivo(t.ativo)
    setModalOpen(true)
  }

  const handleAddStep = () => {
    if (!newStepTitulo.trim() || !newStepTexto.trim()) {
      toast({ title: 'Preencha o título e o texto da etapa', variant: 'destructive' })
      return
    }
    setEtapas((prev) => [
      ...prev,
      {
        titulo: newStepTitulo.trim(),
        texto: newStepTexto.trim(),
        seletor: newStepSeletor.trim() || undefined,
        posicao: 'bottom',
      },
    ])
    setNewStepTitulo('')
    setNewStepTexto('')
    setNewStepSeletor('')
  }

  const handleRemoveStep = (idx: number) => {
    setEtapas((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !rota.trim() || etapas.length === 0) {
      toast({ title: 'Preencha o título, rota e ao menos 1 etapa', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        rota: rota.trim(),
        modulo: modulo.trim(),
        etapas,
        ativo,
      }

      if (editingId) {
        await pb.collection('jetro_tours').update(editingId, payload)
        toast({ title: 'Tour guiado atualizado!' })
      } else {
        await pb.collection('jetro_tours').create(payload)
        toast({ title: 'Novo tour guiado cadastrado!' })
      }

      setModalOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar tour', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Deseja remover o tour "${name}"?`)) return
    try {
      await pb.collection('jetro_tours').delete(id)
      toast({ title: 'Tour excluído' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir tour', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border shadow-2xs">
        <CardHeader className="p-5 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#005B2E]" />
              Gestão de Tours Guiados por Tela
            </CardTitle>
            <CardDescription className="text-xs">
              Configure tutoriais interativos que são ativados pelo botão "Tour" no topo do chat
              quando o operador estiver na tela correspondente.
            </CardDescription>
          </div>
          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="bg-[#005B2E] hover:bg-[#004724] text-white text-xs font-semibold h-8"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Cadastrar Novo Tour
          </Button>
        </CardHeader>
        <CardContent className="p-5 pt-2">
          {loading ? (
            <div className="text-center py-8 text-xs text-gray-400">Carregando tours...</div>
          ) : tours.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 border border-dashed rounded-lg">
              Nenhum tour cadastrado. Cadastre o primeiro para habilitar o botão "Tour" no chat da
              tela correspondente.
            </div>
          ) : (
            <div className="divide-y border rounded-lg overflow-hidden">
              {tours.map((t) => (
                <div
                  key={t.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-gray-900">{t.titulo}</h4>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {t.rota}
                      </Badge>
                      <Badge className="text-[10px] bg-slate-100 text-slate-700">
                        Módulo: {t.modulo || 'Geral'}
                      </Badge>
                      <Badge
                        className={
                          t.ativo
                            ? 'bg-emerald-600 text-white text-[10px]'
                            : 'bg-gray-400 text-white text-[10px]'
                        }
                      >
                        {t.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>

                    {t.descricao && <p className="text-[11px] text-gray-500">{t.descricao}</p>}

                    <div className="text-[10px] text-gray-400 flex items-center gap-2">
                      <MousePointer2 className="w-3 h-3 text-[#005B2E]" />
                      <span>{t.etapas?.length || 0} etapa(s) configurada(s)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(t)}
                      className="h-7 w-7 p-0 text-gray-600 hover:text-[#005B2E]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(t.id, t.titulo)}
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

      {/* Modal de Cadastro/Edição de Tour */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="border-b pb-2">
            <DialogTitle className="text-sm font-bold">
              {editingId ? 'Editar Tour Guiado' : 'Novo Tour Guiado por Tela'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Título do Tour *</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Tour de Cadastro de Clientes"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Rota da Tela no ERP *</Label>
                <Input
                  value={rota}
                  onChange={(e) => setRota(e.target.value)}
                  placeholder="Ex: /admin/cadastros/clientes"
                  className="h-9 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Módulo</Label>
                <Input
                  value={modulo}
                  onChange={(e) => setModulo(e.target.value)}
                  placeholder="Ex: Cadastros"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">Descrição</Label>
              <Textarea
                rows={2}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Objetivo deste roteiro guiado..."
                className="text-xs leading-relaxed"
              />
            </div>

            {/* Lista de Etapas */}
            <div className="border rounded-xl p-3 bg-slate-50 space-y-3">
              <span className="text-xs font-bold text-gray-800 block">
                Etapas do Tutorial ({etapas.length})
              </span>

              <div className="space-y-2">
                {etapas.map((st, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-white border rounded-lg text-xs space-y-1 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800">
                        #{i + 1} - {st.titulo}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(i)}
                        className="text-red-500 hover:text-red-700 text-[11px]"
                      >
                        Remover
                      </button>
                    </div>
                    <p className="text-gray-600 text-[11px]">{st.texto}</p>
                    {st.seletor && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        Alvo: {st.seletor}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Adicionar Etapa */}
              <div className="pt-2 border-t space-y-2">
                <span className="text-[11px] font-semibold text-gray-700 block">
                  Adicionar Etapa:
                </span>
                <Input
                  placeholder="Título da etapa (ex: Filtro de Pedidos)"
                  value={newStepTitulo}
                  onChange={(e) => setNewStepTitulo(e.target.value)}
                  className="h-8 text-xs bg-white"
                />
                <Textarea
                  rows={2}
                  placeholder="Explicação do que o usuário deve observar ou fazer..."
                  value={newStepTexto}
                  onChange={(e) => setNewStepTexto(e.target.value)}
                  className="text-xs bg-white"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddStep}
                  className="h-7 text-xs border-[#005B2E]/40 text-[#005B2E]"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Incluir Etapa
                </Button>
              </div>
            </div>

            <DialogFooter className="border-t pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={saving} className="bg-[#005B2E] text-white">
                {saving ? 'Gravando...' : 'Salvar Tour'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
