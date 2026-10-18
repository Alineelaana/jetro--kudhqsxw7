import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SlidersHorizontal, ShieldCheck, AlertCircle, Check } from 'lucide-react'
import {
  type RetentionPolicy,
  fetchRetentionPolicy,
  saveRetentionPolicy,
} from '@/services/user-audit-service'

interface RetentionPolicyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RetentionPolicyDialog({ open, onOpenChange }: RetentionPolicyDialogProps) {
  const [policy, setPolicy] = useState<RetentionPolicy>({
    retention_days: 365,
    anonymize_ip_after_days: 180,
    delete_precise_coords_after_days: 90,
    legal_basis:
      'LGPD Art. 7º IX - Legítimo Interesse para Prevenção à Fraude e Segurança de Redes',
    auto_purge_enabled: true,
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      setSavedSuccess(false)
      fetchRetentionPolicy()
        .then((data) => {
          if (data) setPolicy(data)
        })
        .finally(() => setLoading(false))
    }
  }, [open])

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveRetentionPolicy(policy)
      setSavedSuccess(true)
      setTimeout(() => {
        onOpenChange(false)
      }, 1000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <SlidersHorizontal className="w-5 h-5 text-[#005B2E]" />
            Política de Retenção de Dados & LGPD
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            Configure o período legal de guarda de logs de auditoria, IPs e coordenadas geográficas,
            assegurando a necessidade, proporcionalidade e segurança jurídica.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <Label className="font-semibold text-foreground text-xs">
              Período Geral de Retenção de Logs (dias)
            </Label>
            <Input
              type="number"
              min={30}
              max={1825}
              value={policy.retention_days}
              onChange={(e) =>
                setPolicy({ ...policy, retention_days: Number(e.target.value) || 365 })
              }
              className="text-xs h-8"
            />
            <p className="text-[11px] text-muted-foreground">
              Eventos de login anteriores a esse período são expurgados do banco de dados (padrão:
              365 dias / Marco Civil da Internet Art. 15).
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-foreground text-xs">
              Anonimização de IPs Públicos após (dias)
            </Label>
            <Input
              type="number"
              min={15}
              max={365}
              value={policy.anonymize_ip_after_days || 180}
              onChange={(e) =>
                setPolicy({ ...policy, anonymize_ip_after_days: Number(e.target.value) || 180 })
              }
              className="text-xs h-8"
            />
            <p className="text-[11px] text-muted-foreground">
              Substitui o último octeto por zeros (ex: 189.40.xxx.xxx) para reduzir o risco de
              reidentificação.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-foreground text-xs">
              Exclusão Automática de Coordenadas Precisas após (dias)
            </Label>
            <Input
              type="number"
              min={7}
              max={180}
              value={policy.delete_precise_coords_after_days || 90}
              onChange={(e) =>
                setPolicy({
                  ...policy,
                  delete_precise_coords_after_days: Number(e.target.value) || 90,
                })
              }
              className="text-xs h-8"
            />
            <p className="text-[11px] text-muted-foreground">
              Coordenadas de alta precisão (GPS) são removidas após este prazo, mantendo apenas a
              cidade/UF estimada.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-foreground text-xs">
              Base Legal LGPD Registrada
            </Label>
            <Input
              type="text"
              value={policy.legal_basis || ''}
              onChange={(e) => setPolicy({ ...policy, legal_basis: e.target.value })}
              className="text-xs h-8 font-mono"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/20">
            <div className="space-y-0.5">
              <span className="font-semibold text-foreground block text-xs">
                Purga Automática Periódica
              </span>
              <span className="text-[11px] text-muted-foreground block">
                Executar expurgo automático dos registros vencidos
              </span>
            </div>
            <Switch
              checked={policy.auto_purge_enabled !== false}
              onCheckedChange={(checked) => setPolicy({ ...policy, auto_purge_enabled: checked })}
            />
          </div>

          {savedSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs flex items-center gap-2 border border-emerald-300">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Política de retenção atualizada com sucesso!</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-[#005B2E] hover:bg-[#005B2E]/90 text-white font-bold"
          >
            {saving ? 'Salvando...' : 'Salvar Política'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
