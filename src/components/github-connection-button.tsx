import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'
import { toast } from 'sonner'

export function GitHubConnectionButton() {
  const handleClick = () => {
    toast.info(
      'A integração com GitHub não está disponível para este projeto. Acesse as configurações da plataforma Skip Cloud para ativar a conexão com o repositório.',
      {
        duration: 6000,
      },
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      title="Conexão GitHub"
      className="text-white/60 hover:text-[#E4C46A] relative"
    >
      <Github className="w-5 h-5" />
      <span
        className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400"
        title="Indisponível"
      />
    </Button>
  )
}
