import { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCeres } from '../hooks/useCeres'

const MAX_NODES = 24

const LEVEL_COLORS: Record<number, string> = {
  0: '#6B7280',
  1: '#CD7F32',
  2: '#C0C0C0',
  3: '#FFD700',
  4: '#A855F7',
  5: '#3B82F6',
}

interface GraphNode {
  tokenId: number
  name: string
  level: number
  inviterId: number
  x: number
  y: number
  radius: number
}

interface Particle {
  id: number
  fromX: number; fromY: number
  toX: number; toY: number
  progress: number
  speed: number
  color: string
  size: number
}

/** Fixed-count hooks — queries last N profiles and their inviters */
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
  const navigate = useNavigate()
  const { total, profiles, inviters } = useGlobalGraphData()
  const [tick, setTick] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const particleId = useRef(0)

  const nodes = useMemo((): GraphNode[] => {
    const result: GraphNode[] = []
    for (let i = 0; i < MAX_NODES; i++) {
      const tokenId = total - i
      if (tokenId <= 0) continue
      const p = profiles[i]?.data as any
      if (!p) continue
      const inv = inviters[i]?.data
      result.push({
        tokenId,
        name: p.name ?? '',
        level: p.level ?? 0,
        inviterId: inv != null ? Number(inv) : 0,
        x: 0, y: 0, radius: 0,
      })
    }
    return result
  }, [total, profiles, inviters])

  // Layout: spiral from center outward
  const layoutNodes = useMemo(() => {
    if (nodes.length === 0) return nodes
    const cx = 380, cy = 380
    return nodes.map((n, i) => {
      const angle = (i * 2.4) + 0.5 // golden-angle spacing
      const r = 60 + i * 32
      return {
        ...n,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        radius: n.tokenId === total ? 28 : 14,
      }
    })
  }, [nodes, total])

  // Edges: inviter → invitee
  const edges = useMemo(() => {
    const nodeMap = new Map(layoutNodes.map(n => [n.tokenId, n]))
    return layoutNodes
      .filter(n => n.inviterId > 0)
      .map(n => ({ from: nodeMap.get(n.inviterId), to: n }))
      .filter(e => e.from && e.to) as { from: GraphNode; to: GraphNode }[]
  }, [layoutNodes])

  // Animation tick
  useEffect(() => {
    let id: number
    const loop = () => { setTick(t => t + 1); id = requestAnimationFrame(loop) }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [])

  // Particles along edges
  const spawn = useCallback(() => {
    if (edges.length === 0) return
    const batch: Particle[] = []
    for (let i = 0; i < Math.min(edges.length * 3, 40); i++) {
      const e = edges[Math.floor(Math.random() * edges.length)]
      batch.push({
        id: particleId.current++,
        fromX: e.from.x, fromY: e.from.y,
        toX: e.to.x, toY: e.to.y,
        progress: 0,
        speed: 0.003 + Math.random() * 0.007,
        color: LEVEL_COLORS[e.to.level] ?? '#6B7280',
        size: 1.5 + Math.random() * 2.5,
      })
    }
    setParticles(prev => [...prev.filter(p => p.progress < 1).slice(-80), ...batch])
  }, [edges])

  useEffect(() => {
    spawn()
    const iv = setInterval(spawn, 2000)
    return () => clearInterval(iv)
  }, [spawn])

  // Move particles
  useEffect(() => {
    setParticles(prev =>
      prev.map(p => ({ ...p, progress: p.progress + p.speed })).filter(p => p.progress < 1)
    )
  }, [tick])

  if (nodes.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Global Network</h3>
        <div className="bg-[#0f172a] rounded-2xl border border-gray-800 p-4">
          <p className="text-center py-20 text-gray-500 text-sm">No DIDs yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Global Network</h3>
        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
          {total} DIDs · {edges.length} edges
        </span>
      </div>

      <div className="bg-[#0f172a] rounded-2xl border border-gray-800 p-4 overflow-hidden">
        <svg viewBox="0 0 760 760" className="w-full max-w-[760px] mx-auto">
          <defs>
            <filter id="gglow"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="gglow2"><feGaussianBlur stdDeviation="2"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            {edges.map((e, i) => (
              <linearGradient key={i} id={`ge-${i}`} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor={LEVEL_COLORS[e.from.level] ?? '#6B7280'} stopOpacity={0.6}/>
                <stop offset="100%" stopColor={LEVEL_COLORS[e.to.level] ?? '#6B7280'} stopOpacity={0.4}/>
              </linearGradient>
            ))}
          </defs>

          {/* Starfield */}
          {Array.from({length:50}, (_,i) => {
            const sx = 15 + ((i * 173 + 41) % 730)
            const sy = 15 + ((i * 241 + 79) % 730)
            return <circle key={i} cx={sx} cy={sy} r={0.7} fill="#64748b" opacity={Math.sin(tick * 0.04 + i) > 0 ? 0.12 : 0.04}/>
          })}

          {/* Edges */}
          {edges.map((e, i) => (
            <g key={i}>
              <line x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} stroke={`url(#ge-${i})`} strokeWidth={1.5} opacity={0.5}/>
              <line x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} stroke={`url(#ge-${i})`} strokeWidth={5} opacity={0.07} filter="url(#gglow2)"/>
            </g>
          ))}

          {/* Particles */}
          {particles.map(p => {
            const x = p.fromX + (p.toX - p.fromX) * p.progress
            const y = p.fromY + (p.toY - p.fromY) * p.progress
            const op = p.progress < 0.1 ? p.progress * 10 : p.progress > 0.9 ? (1 - p.progress) * 10 : 0.7
            return <circle key={p.id} cx={x} cy={y} r={p.size} fill={p.color} opacity={op}/>
          })}

          {/* Nodes */}
          {layoutNodes.map((n, i) => {
            const col = LEVEL_COLORS[n.level] ?? '#6B7280'
            const isLatest = n.tokenId === total
            const r = n.radius
            const breathe = 1 + 0.06 * Math.sin(tick * 0.04 + i)
            return (
              <g key={n.tokenId} onClick={() => navigate(`/profile/${n.tokenId}`)} className="cursor-pointer">
                {isLatest && (
                  <circle cx={n.x} cy={n.y} r={r + 12 + 4 * Math.sin(tick * 0.03)} fill={col} opacity={0.08}>
                    <animate attributeName="opacity" values="0.08;0.02;0.08" dur="3s" repeatCount="indefinite"/>
                  </circle>
                )}
                <circle cx={n.x} cy={n.y} r={r} fill="#1e293b" stroke={col} strokeWidth={isLatest ? 2.5 : 1.5}
                  filter={isLatest ? 'url(#gglow)' : undefined} opacity={breathe}/>
                <circle cx={n.x} cy={n.y} r={r - 3} fill="#334155"/>
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="central"
                  fill="#e2e8f0" fontSize={isLatest ? 11 : 9} fontWeight="bold">
                  {isLatest ? (n.name.slice(0,5) || `#${n.tokenId}`) : `#${n.tokenId}`}
                </text>
                {/* Labels — only for latest or nodes with names */}
                {(isLatest || n.name) && n.name && (
                  <text x={n.x} y={n.y + r + 14} textAnchor="middle" fill="#94a3b8" fontSize="9">
                    {n.name.length > 8 ? n.name.slice(0,8)+'…' : n.name}
                  </text>
                )}
              </g>
            )
          })}

          {/* Legend */}
          <g transform="translate(15, 740)">
            {[0,1,2,3,4,5].map(lv => (
              <g key={lv} transform={`translate(${lv * 22}, 0)`}>
                <circle cx={0} cy={-4} r={5} fill={LEVEL_COLORS[lv]} opacity={0.8}/>
                <text x={0} y={6} textAnchor="middle" fill="#64748b" fontSize="7">{['Sd','Br','Ag','Au','Cr','Dm'][lv]}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
