import { useState, useMemo } from 'react'
import {
  FolderGit2,
  FileText,
  AlertTriangle,
  Users,
  CheckCircle,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { SegundoCerebroDoc, SegundoCerebroDecision } from '@/types/segundo-cerebro'

interface ProjectsProps {
  documents: SegundoCerebroDoc[]
  decisions: SegundoCerebroDecision[]
  onOpenDoc: (doc: Partial<SegundoCerebroDoc>) => void
}

export function SegundoCerebroProjects({ documents, decisions, onOpenDoc }: ProjectsProps) {
  // Agrupar documentos e decisões por projeto registrado
  const projectsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string
        docs: SegundoCerebroDoc[]
        decisions: SegundoCerebroDecision[]
        areas: Set<string>
        tags: Set<string>
      }
    >()

    documents.forEach((doc) => {
      const projName = doc.project?.trim() || 'Sem Projeto Vinculado'
      if (!map.has(projName)) {
        map.set(projName, {
          name: projName,
          docs: [],
          decisions: [],
          areas: new Set(),
          tags: new Set(),
        })
      }
      const entry = map.get(projName)!
      entry.docs.push(doc)
      if (doc.area) entry.areas.add(doc.area)
      doc.tags?.forEach((t) => entry.tags.add(t))
    })

    decisions.forEach((dec) => {
      const projName = dec.project?.trim() || 'Sem Projeto Vinculado'
      if (!map.has(projName)) {
        map.set(projName, {
          name: projName,
          docs: [],
          decisions: [],
          areas: new Set(),
          tags: new Set(),
        })
      }
      map.get(projName)!.decisions.push(dec)
    })

    return Array.from(map.values())
  }, [documents, decisions])

  const [selectedProject, setSelectedProject] = useState<string>(
    projectsMap[0]?.name || 'Estratégia Comercial 2026',
  )

  const activeProject = projectsMap.find((p) => p.name === selectedProject) || projectsMap[0]

  return (
    <div className="space-y-4">
      {/* Aviso de fidelidade documental conforme requisito 5 */}
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
        <span>
          📌 <strong>Memória Fiel de Projetos:</strong> Todas as informações, marcos e decisões são
          construídos <em>exclusivamente</em> a partir de documentos indexados (frontmatter, tags e
          convenções). Nunca presumimos etapas não registradas.
        </span>
        <Badge variant="outline" className="border-amber-300 text-amber-800 text-[10px]">
          Fidelidade Documental 100%
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Lista Lateral de Projetos */}
        <Card className="p-3 bg-white border border-gray-200 shadow-2xs space-y-1 lg:col-span-1">
          <p className="text-xs font-bold text-gray-500 uppercase px-2 py-1">
            Projetos Documentados ({projectsMap.length})
          </p>
          {projectsMap.map((p) => {
            const isSelected = p.name === activeProject?.name
            return (
              <button
                key={p.name}
                onClick={() => setSelectedProject(p.name)}
                className={`w-full text-left p-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#005B2E] text-white shadow-xs'
                    : 'hover:bg-stone-100 text-gray-700'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="truncate">{p.name}</p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      isSelected ? 'text-white/80' : 'text-gray-400'
                    }`}
                  >
                    {p.docs.length} docs · {p.decisions.length} decisões
                  </p>
                </div>
                <ArrowRight
                  className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#E4C46A]' : 'text-gray-400'}`}
                />
              </button>
            )
          })}
        </Card>

        {/* Painel Central do Projeto Selecionado */}
        <div className="lg:col-span-3 space-y-4">
          {activeProject ? (
            <>
              {/* Header do Projeto */}
              <Card className="p-5 bg-white border border-gray-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#005B2E] tracking-wider block">
                      Memória Consolidada do Projeto
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 mt-0.5">{activeProject.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-stone-50 border-stone-200">
                      {Array.from(activeProject.areas).join(', ') || 'Corporativo'}
                    </Badge>
                  </div>
                </div>

                {/* Tags Registradas */}
                {activeProject.tags.size > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {Array.from(activeProject.tags).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>

              {/* Documentos Indexados Vinculados */}
              <Card className="p-4 bg-white border border-gray-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase text-gray-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#005B2E]" />
                  Documentos e Notas Vinculadas ({activeProject.docs.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {activeProject.docs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => onOpenDoc(doc)}
                      className="p-3 rounded-lg border border-gray-200 hover:border-[#005B2E] transition-colors cursor-pointer bg-stone-50/50 hover:bg-stone-50"
                    >
                      <p className="text-xs font-bold text-gray-900 truncate">{doc.title}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">
                        {doc.path}
                      </p>
                      <p className="text-[11px] text-gray-600 line-clamp-2 mt-1">
                        {doc.summary || doc.content}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Decisões Vinculadas ao Projeto */}
              <Card className="p-4 bg-white border border-gray-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold uppercase text-gray-700 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#C9A227]" />
                  Decisões Formais Registradas ({activeProject.decisions.length})
                </h3>
                {activeProject.decisions.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-2">
                    Nenhuma decisão formal associada a este projeto nos documentos indexados.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeProject.decisions.map((dec) => (
                      <div
                        key={dec.id}
                        className="p-3 rounded-lg border border-gray-200 bg-white space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900">{dec.subject}</span>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-[#005B2E] text-[#005B2E]"
                          >
                            {dec.classification}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed">{dec.decision}</p>
                        <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                          <span>Data: {dec.date}</span>
                          <span>Doc de Origem: {dec.document_source_title || 'Ata'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-200">
              Selecione um projeto para visualizar sua memória documental.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
