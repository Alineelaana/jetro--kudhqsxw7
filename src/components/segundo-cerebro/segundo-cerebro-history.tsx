import { useState } from 'react'
import {
  MessageSquare,
  Search,
  Bookmark,
  BookmarkCheck,
  Plus,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { SegundoCerebroChat } from '@/types/segundo-cerebro'

interface HistoryProps {
  chats: SegundoCerebroChat[]
  isLoading: boolean
  onSelectChat: (chat: SegundoCerebroChat) => void
  onNewChat: () => void
  onToggleFavorite: (chatId: string, current: boolean) => void
}

export function SegundoCerebroHistory({
  chats,
  isLoading,
  onSelectChat,
  onNewChat,
  onToggleFavorite,
}: HistoryProps) {
  const [search, setSearch] = useState('')
  const [onlyFavorites, setOnlyFavorites] = useState(false)

  const filtered = chats.filter((c) => {
    if (onlyFavorites && !c.is_favorite) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const titleMatch = c.title.toLowerCase().includes(q)
      const lastMsgMatch = c.last_message?.toLowerCase().includes(q)
      if (!titleMatch && !lastMsgMatch) return false
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Topo com Ações e Busca */}
      <Card className="p-4 bg-white border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#005B2E]/10 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-[#005B2E]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Histórico Privado de Consultas e Conversas
            </h3>
            <p className="text-xs text-gray-500">
              Suas análises, perguntas anteriores e respostas salvas com fontes documentais.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={onlyFavorites ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`h-8 text-xs ${
              onlyFavorites ? 'bg-[#C9A227] hover:bg-[#b08d20] text-gray-900 font-bold' : ''
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 mr-1" />
            Favoritas ({chats.filter((c) => c.is_favorite).length})
          </Button>
          <Button
            onClick={onNewChat}
            size="sm"
            className="bg-[#005B2E] hover:bg-[#004724] text-white text-xs h-8"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Nova Análise
          </Button>
        </div>
      </Card>

      {/* Input de Busca */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por assunto ou pergunta anterior…"
          className="pl-9 h-10 text-sm bg-white border-gray-300 focus-visible:ring-[#005B2E]"
        />
      </div>

      {/* Lista de Conversas */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200 text-gray-500">
          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold">Nenhuma conversa encontrada</p>
          <p className="text-xs text-gray-400 mt-1">
            Inicie uma nova consulta na aba "Assistente IA" para registrar seu histórico privado.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((chat) => (
            <Card
              key={chat.id}
              className="p-4 bg-white border border-gray-200 hover:border-[#005B2E] transition-all rounded-xl shadow-2xs flex items-center justify-between gap-3 group"
            >
              <div onClick={() => onSelectChat(chat)} className="flex-1 cursor-pointer min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900 group-hover:text-[#005B2E] truncate">
                    {chat.title}
                  </span>
                  {chat.mode && (
                    <Badge variant="outline" className="text-[10px] text-gray-500">
                      {chat.mode}
                    </Badge>
                  )}
                </div>
                {chat.last_message && (
                  <p className="text-xs text-gray-500 truncate">{chat.last_message}</p>
                )}
                <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(chat.created).toLocaleDateString('pt-BR')}</span>
                  <span>· {chat.message_count || 1} mensagens</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onToggleFavorite(chat.id, Boolean(chat.is_favorite))}
                  className="p-1.5 rounded-lg hover:bg-stone-100 text-gray-400 hover:text-[#C9A227] transition-colors"
                  title="Favoritar conversa"
                >
                  {chat.is_favorite ? (
                    <BookmarkCheck className="w-4 h-4 text-[#C9A227]" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectChat(chat)}
                  className="h-8 text-xs text-[#005B2E]"
                >
                  Continuar <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
