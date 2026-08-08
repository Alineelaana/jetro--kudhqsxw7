import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Loader2, Plus, Trash2, Trophy } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { canManageGamification } from '@/lib/performance-permissions'
import {
  getGamification,
  createGamification,
  deleteGamification,
  getConfig,
  saveConfig,
} from '@/services/performance'
import type { PerformanceGamification, PerformanceConfig } from '@/lib/performance-types'

const TYPES = [
  'medalha',
  'conquista',
  'nivel',
  'campanha',
  'desafio',
  'ranking',
  'reconhecimento_equipe',
  'reconhecimento_individual',
]

export function PerformanceGamification() {
  const { userRole } = useAuth()
  const canEdit = canManageGamification(userRole)
  const [items, setItems] = useState<PerformanceGamification[]>([])
  const [configs, setConfigs] = useState<PerformanceConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', type: 'medalha', icon: '🏆' })

  const load = async () => {
    try {
      const [g, c] = await Promise.all([getGamification(), getConfig()])
      setItems(g)
      setConfigs(c)
    } catch {
      /* empty */
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    try {
      await createGamification({
        ...form,
        active: true,
        rules: {},
        entity_type: 'empresa',
      } as Partial<PerformanceGamification>)
      setForm({ name: '', description: '', type: 'medalha', icon: '🏆' })
      setShowForm(false)
      load()
    } catch {
      /* empty */
    }
  }

  const handleToggle = async (configId: string, current: boolean) => {
    try {
      await saveConfig(configId, { gamification_enabled: !current })
      load()
    } catch {
      /* empty */
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
      </div>
    )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#005B2E] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#C89B3C]" /> Gamificação Corporativa
        </h2>
        {canEdit && (
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="bg-[#005B2E] hover:bg-[#01361D]"
          >
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        )}
      </div>

      {configs.length > 0 && canEdit && (
        <Card className="border-2 border-[#005B2E]/20">
          <CardContent className="pt-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Gamificação Ativa</p>
              <p className="text-xs text-muted-foreground">Ativar ou desativar globalmente</p>
            </div>
            <Switch
              checked={configs[0]?.gamification_enabled || false}
              onCheckedChange={() => handleToggle(configs[0].id, configs[0].gamification_enabled)}
            />
          </CardContent>
        </Card>
      )}

      {showForm && canEdit && (
        <Card className="border-2 border-[#C89B3C]/30">
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Nome</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Tipo</Label>
                <select
                  className="w-full h-9 rounded border border-input px-2 text-sm"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <Button onClick={handleCreate} size="sm" className="bg-[#005B2E] hover:bg-[#01361D]">
              Criar
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <Card key={item.id} className="border border-border">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.icon || '🏆'}</span>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  </div>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={async () => {
                      await deleteGamification(item.id)
                      load()
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                )}
              </div>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-2">{item.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {items.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          Nenhum item de gamificação cadastrado
        </p>
      )}
    </div>
  )
}
