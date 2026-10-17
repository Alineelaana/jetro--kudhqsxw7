import { useState, useMemo } from 'react'
import { Network, ZoomIn, ZoomOut, Maximize2, FileText, Layers, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { SegundoCerebroDoc, SegundoCerebroDecision } from '@/types/segundo-cerebro'

interface GraphProps {
  documents: SegundoCerebroDoc[]
  decisions: SegundoCerebroDecision[]
  onOpenDoc: (doc: Partial<SegundoCerebroDoc>) => void
}

interface GraphNode {
  id: string
  label: string
  type: 'doc' | 'area' | 'project' | 'decision'
  x: number
  y: number
  docRef?: SegundoCerebroDoc
  decisionRef?: SegundoCerebroDecision
}

interface GraphLink {
  source: string
  target: string
}

export function SegundoCerebroKnowledgeMap({ documents, decisions, onOpenDoc }: GraphProps) {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [zoom, setZoom] = useState(1)

  // Construir nós e links com base em wikilinks e tags dos documentos
  const { nodes, links } = useMemo(() => {
    const nodeList: GraphNode[] = []
    const linkList: GraphLink[] = []

    const centerX = 400
    const centerY = 280
    const radiusArea = 160
    const radiusDoc = 230

    // Áreas únicas
    const areas = Array.from(new Set(documents.map((d) => d.area).filter(Boolean)))
    areas.forEach((area, i) => {
      const angle = (i / Math.max(areas.length, 1)) * 2 * Math.PI
      nodeList.push({
        id: 'area-' + area,
        label: area,
        type: 'area',
        x: centerX + Math.cos(angle) * radiusArea,
        y: centerY + Math.sin(angle) * radiusArea,
      })
    })

    // Documentos
    documents.forEach((doc, i) => {
      const angle = (i / Math.max(documents.length, 1)) * 2 * Math.PI + 0.3
      const docNodeId = 'doc-' + doc.id
      nodeList.push({
        id: docNodeId,
        label: doc.title,
        type: 'doc',
        x: centerX + Math.cos(angle) * radiusDoc,
        y: centerY + Math.sin(angle) * radiusDoc,
        docRef: doc,
      })

      // Link doc -> área
      if (doc.area) {
        linkList.push({
          source: docNodeId,
          target: 'area-' + doc.area,
        })
      }

      // Link doc -> wikilinks
      if (doc.wikilinks && doc.wikilinks.length > 0) {
        doc.wikilinks.forEach((targetTitle) => {
          const targetDoc = documents.find(
            (d) =>
              d.title.toLowerCase().includes(targetTitle.toLowerCase()) ||
              d.path.toLowerCase().includes(targetTitle.toLowerCase()),
          )
          if (targetDoc) {
            linkList.push({
              source: docNodeId,
              target: 'doc-' + targetDoc.id,
            })
          }
        })
      }
    })

    return { nodes: nodeList, links: linkList }
  }, [documents, decisions])

  const getNodeColor = (type: GraphNode['type']) => {
    switch (type) {
      case 'area':
        return '#005B2E' // Verde Jetro
      case 'doc':
        return '#C9A227' // Ouro Jetro
      case 'decision':
        return '#027A3D'
      default:
        return '#64748b'
    }
  }

  return (
    <div className="space-y-4">
      {/* Barra de Controles e Legenda */}
      <Card className="p-4 bg-white border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Network className="w-4 h-4 text-[#005B2E]" />
            <span className="text-xs font-bold text-gray-800 uppercase">
              Grafo Interativo de Conexões ([[Wikilinks]])
            </span>
          </div>
          <span className="text-[11px] text-gray-500">
            {nodes.length} nós e {links.length} conexões mapeadas
          </span>
        </div>

        {/* Legenda visual */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#005B2E]" />
            <span className="text-gray-600 text-[11px]">Áreas de Conhecimento</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#C9A227]" />
            <span className="text-gray-600 text-[11px]">Notas & Documentos</span>
          </div>
          <div className="flex items-center gap-1 border-l pl-3 border-gray-200">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
              className="p-1 rounded-sm hover:bg-gray-100 text-gray-600"
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.7))}
              className="p-1 rounded-sm hover:bg-gray-100 text-gray-600"
              title="Diminuir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 rounded-sm hover:bg-gray-100 text-gray-600"
              title="Resetar visualização"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Canvas SVG do Mapa de Conhecimento */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="lg:col-span-3 p-2 bg-stone-900 border border-stone-800 rounded-xl overflow-hidden relative shadow-inner min-h-[520px] flex items-center justify-center">
          <svg
            viewBox="0 0 800 560"
            className="w-full h-[520px] select-none"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out',
            }}
          >
            {/* Linhas de conexão */}
            {links.map((link, idx) => {
              const src = nodes.find((n) => n.id === link.source)
              const tgt = nodes.find((n) => n.id === link.target)
              if (!src || !tgt) return null
              return (
                <line
                  key={idx}
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
              )
            })}

            {/* Nós */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id
              const isArea = node.type === 'area'
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <circle
                    r={isArea ? 22 : 14}
                    fill={getNodeColor(node.type)}
                    stroke={isSelected ? '#ffffff' : '#1e293b'}
                    strokeWidth={isSelected ? 3 : 2}
                    className="shadow-md"
                  />
                  <text
                    y={isArea ? 32 : 24}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize={isArea ? '10px' : '9px'}
                    fontWeight={isArea ? 'bold' : 'normal'}
                    className="pointer-events-none drop-shadow-sm"
                  >
                    {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Dica de interação */}
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white/80 px-3 py-1 rounded-full text-[10px] flex items-center gap-1.5 border border-white/10">
            <Info className="w-3 h-3 text-[#E4C46A]" />
            Clique em qualquer nó para inspecionar documentos e conexões
          </div>
        </Card>

        {/* Detalhe do Nó Selecionado */}
        <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Detalhes da Conexão</span>
            {selectedNode && (
              <Badge variant="outline" className="text-[10px]">
                {selectedNode.type.toUpperCase()}
              </Badge>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-bold text-gray-900 leading-snug">
                  {selectedNode.label}
                </h4>
                {selectedNode.docRef?.path && (
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">
                    {selectedNode.docRef.path}
                  </p>
                )}
              </div>

              {selectedNode.docRef?.summary && (
                <p className="text-xs text-gray-600 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                  {selectedNode.docRef.summary}
                </p>
              )}

              {selectedNode.docRef?.wikilinks && selectedNode.docRef.wikilinks.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-gray-700 block mb-1">
                    Wikilinks ([[notas]]):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.docRef.wikilinks.map((wl, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-stone-100 text-[#005B2E] px-2 py-0.5 rounded-md font-medium"
                      >
                        [[{wl}]]
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode.docRef && (
                <Button
                  onClick={() => onOpenDoc(selectedNode.docRef!)}
                  className="w-full bg-[#005B2E] hover:bg-[#004724] text-white text-xs h-8 mt-2"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  Abrir Documento Completo
                </Button>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400 text-xs">
              Selecione um nó no mapa ao lado para visualizar os detalhes e documentos vinculados.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
