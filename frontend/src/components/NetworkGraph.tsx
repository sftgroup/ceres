import { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCeres } from '../hooks/useCeres'

const LEVEL_COLORS: Record<number, string> = {
  0: '#6B7280',
  1: '#CD7F32',
  2: '#C0C0C0',
  3: '#FFD700',
  4: '#A855F7',
  5: '#3B82F6',
}

const LEVEL_GLOW: Record<number, string> = {
  0: 'rgba(107,114,128,0.5)',
  1: 'rgba(205,127,50,0.5)',
  2: 'rgba(192,192,192,0.5)',
  3: 'rgba(255,215,0,0.5)',
  4: 'rgba(168,85,247,0.5)',
  5: 'rgba(59,130,246,0.5)',
}

interface NodePos {
  tokenId: bigint
  name: string
  level: number
  x: number
  y: number
  radius: number
  isCenter: boolean
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

const MAX_INVITEES = 20

function useInviteeProfilesSafe(inviteeIds: bigint[]) {
  const { useProfile } = useCeres()
  // Always call hooks MAX_INVITEES times (fixed count — React rules)
  const results: ReturnType<typeof useProfile>[] = []
  for (let i = 0; i < MAX_INVITEES; i++) {
    const id = i < inviteeIds.length ? inviteeIds[i] : undefined
    results.push(useProfile(id))
  }
  return results.slice(0, inviteeIds.length)
}

export function NetworkGraph({ tokenId }: { tokenId: bigint; depth?: number }) {
  const { useDirectInvitees, useProfile, useLevel, getLevelName } = useCeres()
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const particleId = useRef(0)

  const { data: inviteeIds } = useDirectInvitees(tokenId)
  const { data: centerProfile } = useProfile(tokenId)
  const { data: centerLevel } = useLevel(tokenId)

  const invitees = (inviteeIds as bigint[] | undefined) ?? []
  const centerLevelVal = (centerLevel as number | undefined) ?? 0
  const centerName = centerProfile?.name ?? `DID #${String(tokenId)}`
  const inviteeProfiles = useInviteeProfilesSafe(invitees)

  const nodes = useMemo((): NodePos[] => {
    const result: NodePos[] = [{ tokenId, name: centerName, level: centerLevelVal, x: 260, y: 260, radius: 30, isCenter: true }]
    const r = 145
    const n = invitees.length
    invitees.forEach((id, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2
      const q = inviteeProfiles[i]
      result.push({ tokenId: id, name: q?.data?.name ?? '', level: q?.data?.level ?? 0, x: 260 + r * Math.cos(angle), y: 260 + r * Math.sin(angle), radius: 17, isCenter: false })
    })
    return result
  }, [tokenId, invitees, inviteeProfiles, centerName, centerLevelVal])

  // Continuous animation tick
  useEffect(() => {
    let id: number
    const loop = () => { setTick(t => t + 1); id = requestAnimationFrame(loop) }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [])

  // Particle generation
  const spawn = useCallback(() => {
    const center = nodes[0]
    const kids = nodes.slice(1)
    if (kids.length === 0) return
    const batch: Particle[] = []
    for (let i = 0; i < Math.min(kids.length * 4, 30); i++) {
      const k = kids[Math.floor(Math.random() * kids.length)]
      batch.push({
        id: particleId.current++,
        fromX: center.x, fromY: center.y,
        toX: k.x, toY: k.y,
        progress: 0,
        speed: 0.004 + Math.random() * 0.008,
        color: LEVEL_COLORS[k.level] ?? '#6B7280',
        size: 2 + Math.random() * 3,
      })
    }
    setParticles(prev => [...prev.filter(p => p.progress < 1).slice(-80), ...batch])
  }, [nodes])

  useEffect(() => {
    spawn()
    const iv = setInterval(spawn, 2500)
    return () => clearInterval(iv)
  }, [spawn])

  // Particle movement
  useEffect(() => {
    setParticles(prev =>
      prev.map(p => ({ ...p, progress: p.progress + p.speed })).filter(p => p.progress < 1)
    )
  }, [tick])

  const center = nodes[0]
  const cc = LEVEL_COLORS[centerLevelVal] ?? '#6B7280'
  const orbitRadius = 145
  const orbitPhase = (tick * 0.003) % (Math.PI * 2)

  if (!center) return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Graph</h3>
      <div className="bg-[#0f172a] rounded-2xl border border-gray-800 p-4">
        <p className="text-center py-20 text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  )

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Network Graph</h3>
        {invitees.length > 0 && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
            {invitees.length} node{invitees.length !== 1 ? 's' : ''} →
          </span>
        )}
      </div>

      <div className="bg-[#0f172a] rounded-2xl border border-gray-800 p-4 overflow-hidden">
        {invitees.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <p className="text-sm">No connections yet</p>
            <p className="text-xs text-gray-600 mt-1">Share your invite link</p>
          </div>
        ) : (
          <svg ref={undefined as any} viewBox="0 0 520 520" className="w-full max-w-[520px] mx-auto">
            <defs>
              {/* Glow filters */}
              <filter id="cg"><feGaussianBlur stdDeviation="5"/><feMerge><feMergeNode in="blur"/><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <filter id="ng"><feGaussianBlur stdDeviation="3"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>

              {nodes.slice(1).map(n => (
                <linearGradient key={String(n.tokenId)} id={`g-${n.tokenId}`} x1={center.x} y1={center.y} x2={n.x} y2={n.y} gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor={cc} stopOpacity={0.9}/>
                  <stop offset="100%" stopColor={LEVEL_COLORS[n.level] ?? '#6B7280'} stopOpacity={0.7}/>
                </linearGradient>
              ))}
              <radialGradient id="cpulse" cx="50%" cy="50%">
                <animate attributeName="r" values="30%;55%;30%" dur="2.5s" repeatCount="indefinite"/>
                <stop offset="0%" stopColor={cc} stopOpacity={0.25}/>
                <stop offset="100%" stopColor={cc} stopOpacity={0}/>
              </radialGradient>
            </defs>

            {/* Starfield background */}
            {Array.from({length:40}, (_,i) => {
              const sx = 20 + ((i * 137 + 53) % 480)
              const sy = 20 + ((i * 251 + 97) % 480)
              const blink = Math.sin(tick * 0.05 + i) > 0 ? 0.15 : 0.05
              return <circle key={`star-${i}`} cx={sx} cy={sy} r={0.8} fill="#94a3b8" opacity={blink}/>
            })}

            {/* Rotating orbit ring */}
            <g opacity={0.08}>
              <circle cx={center.x} cy={center.y} r={orbitRadius} fill="none" stroke={cc} strokeWidth={1.5}
                strokeDasharray="6 4" transform={`rotate(${orbitPhase * 180 / Math.PI}, ${center.x}, ${center.y})`}>
                <animateTransform attributeName="transform" type="rotate"
                  from={`0 ${center.x} ${center.y}`} to={`360 ${center.x} ${center.y}`}
                  dur="20s" repeatCount="indefinite"/>
              </circle>
            </g>

            {/* Pulse ring */}
            <circle cx={center.x} cy={center.y} r={38} fill="url(#cpulse)"/>

            {/* Edges */}
            {nodes.slice(1).map(n => (
              <g key={`e-${n.tokenId}`}>
                <line x1={center.x} y1={center.y} x2={n.x} y2={n.y} stroke={`url(#g-${n.tokenId})`} strokeWidth={2} strokeLinecap="round" opacity={0.5}/>
                <line x1={center.x} y1={center.y} x2={n.x} y2={n.y} stroke={`url(#g-${n.tokenId})`} strokeWidth={6} strokeLinecap="round" opacity={0.08} filter="url(#ng)"/>
              </g>
            ))}

            {/* Particles */}
            {particles.map(p => {
              const x = p.fromX + (p.toX - p.fromX) * p.progress
              const y = p.fromY + (p.toY - p.fromY) * p.progress
              const op = p.progress < 0.1 ? p.progress * 10 : p.progress > 0.9 ? (1 - p.progress) * 10 : 0.8
              return <circle key={p.id} cx={x} cy={y} r={p.size} fill={p.color} opacity={op}/>
            })}

            {/* Child nodes */}
            {nodes.slice(1).map(n => {
              const col = LEVEL_COLORS[n.level] ?? '#6B7280'
              const gl = LEVEL_GLOW[n.level] ?? 'rgba(107,114,128,0.4)'
              const breathe = 1 + 0.08 * Math.sin(tick * 0.04 + Number(n.tokenId))
              return (
                <g key={n.tokenId.toString()} onClick={() => navigate(`/profile/${n.tokenId}`)} className="cursor-pointer">
                  <circle cx={n.x} cy={n.y} r={n.radius + 5} fill={gl} opacity={0.35 * breathe}/>
                  <circle cx={n.x} cy={n.y} r={n.radius} fill="#1e293b" stroke={col} strokeWidth={2}/>
                  <circle cx={n.x} cy={n.y} r={n.radius - 4} fill="#334155"/>
                  <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="central" fill="#cbd5e1" fontSize="10" fontWeight="bold">
                    {n.name ? n.name.slice(0,3).toUpperCase() : `#${n.tokenId}`}
                  </text>
                  <text x={n.x} y={n.y + n.radius + 16} textAnchor="middle" fill="#94a3b8" fontSize="10">
                    {n.name || `#${n.tokenId}`}
                  </text>
                </g>
              )
            })}

            {/* Center node */}
            <g onClick={() => navigate(`/profile/${tokenId}`)} className="cursor-pointer">
              {/* Breathe ring */}
              <circle cx={center.x} cy={center.y} r={center.radius + 8 + 4 * Math.sin(tick * 0.03)} fill={LEVEL_GLOW[centerLevelVal] ?? 'rgba(107,114,128,0.5)'} opacity={0.3}>
                <animate attributeName="opacity" values="0.25;0.08;0.25" dur="3s" repeatCount="indefinite"/>
              </circle>
              <circle cx={center.x} cy={center.y} r={center.radius + 3} fill="none" stroke={cc} strokeWidth={3} opacity={0.5} filter="url(#cg)"/>
              <circle cx={center.x} cy={center.y} r={center.radius} fill="#1e293b" stroke={cc} strokeWidth={3}/>
              <circle cx={center.x} cy={center.y} r={center.radius - 5} fill={cc} opacity={0.12}/>
              <text x={center.x} y={center.y - 5} textAnchor="middle" fill="#f1f5f9" fontSize="12" fontWeight="bold">{centerName.slice(0,8)}</text>
              <text x={center.x} y={center.y + 10} textAnchor="middle" fill={cc} fontSize="9" fontWeight="bold">{getLevelName(centerLevelVal)}</text>
              <text x={center.x} y={center.y + center.radius + 22} textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="bold">{centerName.length > 12 ? centerName.slice(0,12)+'...' : centerName}</text>
              <text x={center.x} y={center.y + center.radius + 36} textAnchor="middle" fill="#64748b" fontSize="9">#{tokenId}</text>
            </g>
          </svg>
        )}
      </div>
    </div>
  )
}
