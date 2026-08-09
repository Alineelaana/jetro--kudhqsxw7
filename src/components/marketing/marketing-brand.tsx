import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Loader2, Plus, Palette, FileImage } from 'lucide-react'
import { getMkBrandAssets, createMkBrandAsset } from '@/services/marketing'
import { MK_BRAND_CATEGORIES } from '@/lib/marketing-types'
import type { MkBrandAsset } from '@/lib/marketing-types'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { canManageBrand } from '@/lib/marketing-permissions'
import { toast } from 'sonner'

export function MarketingBrand() {
  const { user, userRole } = useAuth()
  const [items, setItems] = useState<MkBrandAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({
    name: '',
    brand: '',
    category: 'logo',
    version: '',
    validity: '',
    file_url: '',
    description: '',
  })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    try {
      setItems(await getMkBrandAssets())
    } catch {
      setItems([])
    }
    setLoading(false)
  }, [])
  useEffect(() => {
    load()
  }, [load])
  useRealtime('mk_brand_assets', () => load())

  const handleSave = async () => {
    if (!form.name?.trim()) {
      toast.error('Informe o nome')
      return
    }
    setSaving(true)
    try {
      await createMkBrandAsset({
        ...form,
        tags: [],
        permissions: {},
        active: true,
        responsible_name: (user?.name as string) || '',
      })
      toast.success('Asset de marca criado')
      setDialogOpen(false)
      setForm({
        name: '',
        brand: '',
        category: 'logo',
        version: '',
        validity: '',
        file_url: '',
        description: '',
      })
      load()
    } catch {
      toast.error('Erro')
    }
    setSaving(false)
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
        <h2 className="text-lg font-bold text-[#005B2E]">Brand Management</h2>
        {canManageBrand(userRole) && (
          <Button onClick={() => setDialogOpen(true)} className="bg-[#005B2E] hover:bg-[#01361D]">
            <Plus className="w-4 h-4 mr-1" /> Novo Asset
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Palette className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum asset de marca cadastrado.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {items.map((a) => (
            <Card key={a.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                {a.file_url ? (
                  <FileImage className="w-8 h-8 text-[#005B2E]/40 mb-2" />
                ) : (
                  <Palette className="w-8 h-8 text-[#005B2E]/40 mb-2" />
                )}
                <p className="font-semibold text-sm">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {MK_BRAND_CATEGORIES.find((c) => c.value === a.category)?.label || a.category}
                </p>
                {a.brand && (
                  <Badge variant="outline" className="mt-1 text-xs">
                    {a.brand}
                  </Badge>
                )}
                {a.version && <p className="text-xs text-muted-foreground mt-1">v{a.version}</p>}
                {a.validity && <p className="text-xs text-amber-600">Validade: {a.validity}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#005B2E]">Novo Asset de Marca</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Nome *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Marca</Label>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MK_BRAND_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Versão</Label>
                <Input
                  value={form.version}
                  onChange={(e) => setForm({ ...form, version: e.target.value })}
                />
              </div>
              <div>
                <Label>Validade</Label>
                <Input
                  type="date"
                  value={form.validity}
                  onChange={(e) => setForm({ ...form, validity: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>URL do Arquivo</Label>
              <Input
                value={form.file_url}
                onChange={(e) => setForm({ ...form, file_url: e.target.value })}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#005B2E] hover:bg-[#01361D]"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
