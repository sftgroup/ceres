import { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { useCeres } from '../hooks/useCeres'
import { useI18n } from '../I18nContext'
import { ProfileCard } from './ProfileCard'

const MAX_NODES = 24

const LEVEL_COLORS: Record<number, string> = {
  0: '#6B7280', 1: '#CD7F32', 2: '#C0C0C0',
  3: '#FFD700', 4: '#A855F7', 5: '#3B82F6',
}

interface GraphNode {
  tokenId: number; name: string; level: number
  inviterId: number; x: number; y: number; radius: number
}

interface Particle {
  id: number; fromX: number; fromY: number
  toX: number; toY: number; progress: number
  speed: number; color: string; size: number
}

/** Fixed-count hooks — always calls MAX_NODES times */
function useGlobalGraphData() {
  const { useTotalProfiles, useProfile, useInviter } = useCeres()
  const { data: totalProfiles } = useTotalProfiles()
  const total = totalProfiles != null ? Number(totalProfiles) : 0

  const profiles: (ReturnType<typeof useProfile>)[] = []
  const inviters: (ReturnType<typeof useInviter>)[] = []

  for (let i = 0; i < MAX_NODES; i++) {
    const tokenId = total - i
    const enabled = tokenId > 0
    // eslint-disable-next-line react-hooks/rules-of-hooks
    profiles.push(useProfile(enabled ? BigInt(tokenId) : undefined))
    // eslint-disable-next-line react-hooks/rules-of-hooks
    inviters.push(useInviter(enabled ? BigInt(tokenId) : undefined))
  }

  return { total, profiles, inviters }
}

export function GlobalNetworkGraph() {
  const { t } = useI18n()
  const { total, profiles, inviters } = useGlobalGraphData()
  const [tick, setTick] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [profileCardTokenId, setProfileCardTokenId] = useState<bigint | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const particleId = useRef(0)

  // Build graph nodes from query results
  const { nodes, layoutNodes, edges } = useMemo(() => {
    try {
      const raw: GraphNode[] = []
      for (let i = 0; i < MAX_NODES; i++) {
        const tokenId = total - i
        if (tokenId <= 0) continue
        const p = profiles[i]?.data as any
        if (!p) continue
        const inv = inviters[i]?.data
        raw.push({ tokenId, name: p.name ?? '', level: p.level ?? 0, inviterId: inv != null ? Number(inv) : 0, x: 0, y: 0, radius: 0 })
      }

      // Golden-spiral layout
      const cx = 380; const cy = 380
      const laid = raw.map((n, i) => {
        const angle = (i * 2.4) + 0.5
        const r = 60 + i * 32
        return { ...n, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), radius: n.tokenId === total ? 28 : 14 }
      })

      const nodeMap = new Map(laid.map(n => [n.tokenId, n]))
      const e = laid
        .filter(n => n.inviterId > 0)
        .map(n => ({ from: nodeMap.get(n.inviterId), to: n }))
        .filter(e => e.from && e.to) as { from: GraphNode; to: GraphNode }[]

      return { nodes: raw, layoutNodes: laid, edges: e }
    } catch (err) {
      setError(String(err))
      return { nodes: [] as GraphNode[], layoutNodes: [] as GraphNode[], edges: [] }
    }
  }, [total, profiles, inviters])

  // Animation
  useEffect(() => {
    let id: number
    const loop = () => { setTick(t => t + 1); id = requestAnimationFrame(loop) }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [])

  // Particles
  const spawn = useCallback(() => {
    if (edges.length === 0) return
    const batch: Particle[] = []
    for (let i = 0; i < Math.min(edges.length * 3, 40); i++) {
      const e = edges[Math.floor(Math.random() * edges.length)]
      batch.push({
        id: particleId.current++, fromX: e.from.x, fromY: e.from.y,
        toX: e.to.x, toY: e.to.y, progress: 0,
        speed: 0.003 + Math.random() * 0.007,
        color: LEVEL_COLORS[e.to.level] ?? '#6B7280',
        size: 1.5 + Math.random() * 2.5,
      })
    }
    setParticles(prev => [...prev.filter(p => p.progress < 1).slice(-80), ...batch])
  }, [edges])

  useEffect(() => { spawn(); const iv = setInterval(spawn, 2000); return () => clearInterval(iv) }, [spawn])
  useEffect(() => { setParticles(prev => prev.map(p => ({ ...p, progress: p.progress + p.speed })).filter(p => p.progress < 1)) }, [tick])

  const handleNodeClick = (n: GraphNode) => {
    const alreadySelected = selectedNode?.tokenId === n.tokenId
    setSelectedNode(alreadySelected ? null : n)
  }

  const handleViewProfile = () => {
    if (selectedNode) {
      setProfileCardTokenId(BigInt(selectedNode.tokenId))
    }
  }

  if (error) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-[#e0e0e8] mb-4">{t('graph.globalTitle')}</h3>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-600 text-sm font-medium">{t('graph.error')}</p>
          <p className="text-red-400 text-xs mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#e0e0e8]">{t('graph.globalTitle')}</h3>
        </div>
        <div className="bg-[#0f172a] rounded-2xl border border-gray-800 p-4">
          <p className="text-center py-20 text-[#6b6b80] text-sm">{t('graph.noDids')}</p>
        </div>
      </div>
    )
  }

  const containerClass = isFullscreen
    ? 'fixed inset-0 z-[200] bg-[#0f172a] flex flex-col'
    : 'relative bg-[#0f172a] rounded-2xl border border-gray-800 p-4'

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#e0e0e8]">{t('graph.globalTitle')}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#16162a] text-[#808090] px-2.5 py-1 rounded-full font-medium">
            {t('graph.stats', { dids: total, edges: edges.length })}
          </span>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-xs px-2 py-1 rounded border border-[#2a2a40] text-[#6b6b80] hover:border-[#10b981]/40 hover:text-[#10b981] transition-colors"
          >
            {isFullscreen ? t('graph.closeFullscreen') : t('graph.fullscreen')}
          </button>
        </div>
      </div>

      {/* Graph container */}
      <div className={containerClass} style={{ position: isFullscreen ? 'fixed' : 'relative' }}>

        <svg viewBox="0 0 760 760" className={isFullscreen ? 'flex-1 w-full h-full' : 'w-full max-w-[760px] mx-auto'}>
          <defs>
            {edges.map((e, i) => (
              <linearGradient key={i} id={`ge-${i}`} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={LEVEL_COLORS[e.from.level] ?? '#6B7280'} stopOpacity={0.6} />
                <stop offset="100%" stopColor={LEVEL_COLORS[e.to.level] ?? '#6B7280'} stopOpacity={0.4} />
              </linearGradient>
            ))}
          </defs>

          {/* Starfield */}
          {Array.from({ length: 50 }, (_, i) => {
            const sx = 15 + ((i * 173 + 41) % 730)
            const sy = 15 + ((i * 241 + 79) % 730)
            return <circle key={i} cx={sx} cy={sy} r={0.7} fill="#64748b" opacity={Math.sin(tick * 0.04 + i) > 0 ? 0.12 : 0.04} />
          })}

          {/* Edges */}
          {edges.map((e, i) => (
            <g key={i}>
              <line x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} stroke={`url(#ge-${i})`} strokeWidth={1.5} opacity={0.5} />
              <line x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} stroke={`url(#ge-${i})`} strokeWidth={5} opacity={0.07} />
            </g>
          ))}

          {/* Particles */}
          {particles.map(p => {
            const x = p.fromX + (p.toX - p.fromX) * p.progress
            const y = p.fromY + (p.toY - p.fromY) * p.progress
            const op = p.progress < 0.1 ? p.progress * 10 : p.progress > 0.9 ? (1 - p.progress) * 10 : 0.7
            return <circle key={p.id} cx={x} cy={y} r={p.size} fill={p.color} opacity={op} />
          })}

          {/* Nodes */}
          {layoutNodes.map((n) => {
            const col = LEVEL_COLORS[n.level] ?? '#6B7280'
            const isLatest = n.tokenId === total
            const isSel = selectedNode?.tokenId === n.tokenId
            const r = n.radius
            return (
              <g key={n.tokenId} style={{ cursor: 'pointer' }}
                onClick={(e) => { e.preventDefault(); handleNodeClick(n) }}
              >
                {isSel && (
                  <circle cx={n.x} cy={n.y} r={r + 8} fill="none" stroke="#10b981" strokeWidth={2} opacity={0.8}>
                    <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}
                {isLatest && !isSel && (
                  <circle cx={n.x} cy={n.y} r={r + 12 + 4 * Math.sin(tick * 0.03)} fill={col} opacity={0.08}>
                    <animate attributeName="opacity" values="0.08;0.02;0.08" dur="3s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle cx={n.x} cy={n.y} r={r} fill={isSel ? '#1a2e1a' : '#1e293b'}
                  stroke={isSel ? '#10b981' : col} strokeWidth={isSel ? 2.5 : (isLatest ? 2.5 : 1.5)} />
                <circle cx={n.x} cy={n.y} r={r - 3} fill={isSel ? '#1a3a1a' : '#334155'} />
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="central"
                  fill="#e2e8f0" fontSize={isLatest ? 11 : 9} fontWeight="bold">
                  {isLatest ? (n.name.slice(0, 5) || `#${n.tokenId}`) : `#${n.tokenId}`}
                </text>
                {(isLatest || n.name) && n.name && (
                  <text x={n.x} y={n.y + r + 14} textAnchor="middle" fill="#94a3b8" fontSize="9">
                    {n.name.length > 8 ? n.name.slice(0, 8) + '\u2026' : n.name}
                  </text>
                )}
              </g>
            )
          })}

          {/* Legend */}
          <g transform="translate(15, 740)">
            {[0, 1, 2, 3, 4, 5].map(lv => (
              <g key={lv} transform={`translate(${lv * 22}, 0)`}>
                <circle cx={0} cy={-4} r={5} fill={LEVEL_COLORS[lv]} opacity={0.8} />
                <text x={0} y={6} textAnchor="middle" fill="#64748b" fontSize="7">{['Sd', 'Br', 'Ag', 'Au', 'Cr', 'Dm'][lv]}</text>
              </g>
            ))}
          </g>
        </svg>

        {/* Fullscreen close button */}
        {isFullscreen && (
          <button onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-30 px-3 py-1.5 bg-[#12121a]/10 text-[#e0e0e8] border border-white/20 rounded-lg hover:bg-[#12121a]/20 transition-colors text-sm">
            {t('graph.exitFullscreen')}
          </button>
        )}

        {/* Selected node indicator bar + View Profile button */}
        {selectedNode && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[#0a0a0f]/95 backdrop-blur border border-[#555570] rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-glow-cyan">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#e0e0e8] font-bold text-xs shrink-0"
              style={{ background: LEVEL_COLORS[selectedNode.level] ?? '#6B7280' }}>
              {selectedNode.name?.charAt(0)?.toUpperCase() ?? '#'}
            </div>
            <div className="text-left leading-tight min-w-0">
              <p className="text-[#e0e0e8] text-xs font-medium truncate">{selectedNode.name || `DID #${selectedNode.tokenId}`}</p>
              <p className="text-[#555570] text-[10px]">DID #{selectedNode.tokenId}</p>
            </div>
            <button onClick={handleViewProfile}
              className="ml-2 px-3 py-1 bg-[#10b981] text-[#e0e0e8] text-xs rounded-lg hover:bg-[#059669] transition-colors font-medium whitespace-nowrap">
              {t('graph.viewProfile')}
            </button>
            <button onClick={() => setSelectedNode(null)}
              className="text-[#555570] hover:text-[#e0e0e8] transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* ProfileCard popover */}
      {profileCardTokenId && (
        <ProfileCard
          tokenId={profileCardTokenId}
          onClose={() => setProfileCardTokenId(null)}
          onNavigate={(nextId) => setProfileCardTokenId(nextId)}
        />
      )}
    </div>
  )
}
