import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { listConfig, updateConfig, createConfig } from '@/services/configuracoes'
import { PARAMETER_MODULES } from '@/lib/configuracoes-config'
import { Loader2, Save, Plus, Settings } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export function ParametrosScreen() {
  const { user } = useAuth()
  const [activeModule, setActiveModule] = useState(PARAMETER_MODULES[0])
  const [params, setParams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [newParam, setNewParam] = useState({ key: '', label: '', value: '', value_type: 'text' })

  const load = async () => {
    setLoading(true)
    try {
      setParams(await listConfig('system_parameters'))
    } catch {
      setParams([])
    }
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useRealtime('system_parameters', () => load())

  const moduleParams = params.filter((p) => p.module === activeModule)

  const handleSave = async (p: any, newValue: string) => {
    setSaving(p.id)
    try {
      await updateConfig('system_parameters', p.id, {
        value: newValue,
        previous_value: p.value,
        changed_by: (user?.name as string) || (user?.email as string) || 'Sistema',
      })
      toast({ title: 'Parâmetro atualizado' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
    setSaving(null)
  }

  const handleAdd = async () => {
    if (!newParam.key || !newParam.label) {
      toast({ title: 'Preencha key e label', variant: 'destructive' })
      return
    }
    try {
      await createConfig('system_parameters', {
        module: activeModule,
        key: newParam.key,
        label: newParam.label,
        value: newParam.value,
        value_type: newParam.value_type,
        changed_by: (user?.name as string) || 'Sistema',
        active: true,
      })
      setNewParam({ key: '', label: '', value: '', value_type: 'text' })
      toast({ title: 'Parâmetro criado' })
      load()
    } catch {
      toast({ title: 'Erro', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-black text-foreground flex items-center gap-2">
        <Settings className="w-5 h-5 text-[#005B2E]" /> Parâmetros do Sistema
      </h2>
      <div className="flex gap-1 overflow-x-auto pb-2 border-b border-gray-200">
        {PARAMETER_MODULES.map((m) => (
          <button
            key={m}
            onClick={() => setActiveModule(m)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
              activeModule === m ? 'bg-[#005B2E] text-white' : 'text-gray-600 hover:bg-gray-100',
            )}
          >
            {m}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#005B2E] animate-spin" />
        </div>
      ) : (
        <>
          <Card className="border-2 border-[#005B2E]/20">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-sm">Adicionar Parâmetro em {activeModule}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <Input
                  placeholder="Chave"
                  value={newParam.key}
                  onChange={(e) => setNewParam((p) => ({ ...p, key: e.target.value }))}
                  className="focus-visible:ring-[#005B2E]"
                />
                <Input
                  placeholder="Label"
                  value={newParam.label}
                  onChange={(e) => setNewParam((p) => ({ ...p, label: e.target.value }))}
                  className="focus-visible:ring-[#005B2E]"
                />
                <Input
                  placeholder="Valor"
                  value={newParam.value}
                  onChange={(e) => setNewParam((p) => ({ ...p, value: e.target.value }))}
                  className="focus-visible:ring-[#005B2E]"
                />
                <Button onClick={handleAdd} className="bg-[#005B2E] hover:bg-[#01361D] text-white">
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>
            </CardContent>
          </Card>
          {moduleParams.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                Nenhum parâmetro neste módulo.
              </CardContent>
            </Card>
          ) : (
            moduleParams.map((p) => (
              <ParamRow key={p.id} param={p} onSave={handleSave} saving={saving === p.id} />
            ))
          )}
        </>
      )}
    </div>
  )
}

function ParamRow({
  param,
  onSave,
  saving,
}: {
  param: any
  onSave: (p: any, v: string) => void
  saving: boolean
}) {
  const [value, setValue] = useState(param.value || '')
  useEffect(() => {
    setValue(param.value || '')
  }, [param.value])
  const isBool = param.value_type === 'boolean'
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="flex-1">
          <Label className="text-sm font-semibold">{param.label}</Label>
          <p className="text-xs text-muted-foreground">
            Chave: {param.key} {param.previous_value && `| Anterior: ${param.previous_value}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isBool ? (
            <Switch
              checked={value === 'true'}
              onCheckedChange={(v) => setValue(v ? 'true' : 'false')}
              className="data-[state=checked]:bg-[#005B2E]"
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-48 focus-visible:ring-[#005B2E]"
            />
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSave(param, value)}
            disabled={saving}
            className="border-[#005B2E] text-[#005B2E]"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
