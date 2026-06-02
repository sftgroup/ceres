import { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCeres } from '../hooks/useCeres'

interface NetworkGraphProps {
  tokenId: bigint
  depth?: number
}

const LEVEL_COLORS: Record<number, string> = {
  0: '#6B7280',
  1: '#CD7F32',
  2: '#C0C0C0',
  3: '#FFD700',
  4: '#A855F7',
  5: '#3B82F6',
}

const LEVEL_GLOW_COLORS: Record<number, string> = {
  0: 'rgba(107,114,128,0.5)',
  1: 'rgba(205,127,50,0.5)',
  2: 'rgba(192,192,192,0.5)',
  3: 'rgba(255,215,0,0.5)',
  4: 'rgba(168,85,247,0.5)',
  5: 'rgba(59,130,246,0.5)',
}

interface AnimatedNode {
  tokenId: bigint
  name: string
  level: number
  x: number
  y: number
  targetX: number
  targetY: number
  radius: number
  isCenter: boolean
}

interface Particle {
  id: number
  fromX: number
  fromY: number
  toX: number
  toY: number
  progress: number
  speed: number
  color: string
  size: number
}

// Fixed-size profile queries to avoid Rules-of-Hooks violation
// when the number of invitees changes between renders
const MAX_GRAPH_INVITEES = 20

function useInviteeProfilesSafe(inviteeIds: bigint[]) {
  const { useProfile } = useCeres()
  // Always call hooks for all slots (fixed count — avoids changing hook count)
  const results: ReturnType<typeof useProfile>[] = []
  for (let i = 0; i < MAX_GRAPH_INVITEES; i++) {
    const id = i < inviteeIds.length ? inviteeIds[i] : undefined
    results.push(useProfile(id))
  }
  return results.slice(0, inviteeIds.length)
}

export function NetworkGraph({ tokenId, depth: _depth = 1 }: NetworkGraphProps) {
  const { useDirectInvitees, useProfile, useLevel, getLevelName } = useCeres()
  const navigate = useNavigate()
  const svgRef = useRef<SVGSVGElement>(null)
  const animRef = useRef<number>(0)

  const { data: inviteeIds } = useDirectInvitees(tokenId)
  const { data: centerProfile } = useProfile(tokenId)
  const { data: centerLevel } = useLevel(tokenId)

  const invitees = (inviteeIds as bigint[] | undefined) ?? []
  const centerLevelVal = (centerLevel as number | undefined) ?? 0
  const centerName = centerProfile?.name ?? `DID #${String(tokenId)}`

  // Get invitee profiles — safe fixed-size hook version
  const inviteeProfilesQueries = useInviteeProfilesSafe(invitees)

  const [particles, setParticles] = useState<Particle[]>([])

  const graphNodes = useMemo((): AnimatedNode[] => {
    const nodes: AnimatedNode[] = []
    const cx = 260
    const cy = 260

    nodes.push({
      tokenId,
      name: centerName,
      level: centerLevelVal,
      x: cx,
      y: cy,
      targetX: cx,
      targetY: cy,
      radius: 28,
      isCenter: true,
    })

    const radius = 140
    const n = invitees.length
    invitees.forEach((id, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2
      const q = inviteeProfilesQueries[i]
      const name = q?.data?.name ?? ''
      const level = q?.data?.level ?? 0
      nodes.push({
        tokenId: id,
        name,
        level,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        targetX: cx + radius * Math.cos(angle),
        targetY: cy + radius * Math.sin(angle),
        radius: 16,
        isCenter: false,
      })
    })

    return nodes
  }, [tokenId, invitees, inviteeProfilesQueries, centerName, centerLevelVal])

  // Particle generator
  const generateParticles = useCallback(() => {
    if (graphNodes.length < 2) return
    const center = graphNodes.find(n => n.isCenter) ?? graphNodes[0]
    const children = graphNodes.slice(1)
    const newParticles: Particle[] = []

    for (let i = 0; i < Math.min(children.length * 3, 24); i++) {
      const child = children[Math.floor(Math.random() * children.length)]
      const level = child.level
      newParticles.push({
        id: Date.now() + i,
        fromX: center.x,
        fromY: center.y,
        toX: child.x,
        toY: child.y,
        progress: 0,
        speed: 0.003 + Math.random() * 0.007,
        color: LEVEL_COLORS[level] ?? '#6B7280',
        size: 2 + Math.random() * 3,
      })
    }

    setParticles((prev) => {
      const filtered = prev.filter((p) => p.progress < 1)
      return [...filtered, ...newParticles].slice(-60)
    })
  }, [graphNodes])

  // Animation loop
  useEffect(() => {
    if (graphNodes.length < 2) return

    let running = true

    const animate = () => {
      if (!running) return
      setParticles((prev) => {
        const updated = prev
          .map((p) => ({
            ...p,
            progress: p.progress + p.speed,
          }))
          .filter((p) => p.progress < 1)
        return updated
      })
      animRef.current = requestAnimationFrame(animate)
    }

    // Generate initial particles
    generateParticles()

    // Periodic regeneration
    const interval = setInterval(() => {
      generateParticles()
    }, 3000)

    animRef.current = requestAnimationFrame(animate)

    return () => {
      running = false
      cancelAnimationFrame(animRef.current)
      clearInterval(interval)
    }
  }, [graphNodes, generateParticles])

  const handleNodeClick = (id: bigint) => {
    navigate(`/profile/${String(id)}`)
  }

  const centerNode = graphNodes.find(n => n.isCenter)
  const centerColor = LEVEL_COLORS[centerLevelVal] ?? '#6B7280'
  const centerGlow = LEVEL_GLOW_COLORS[centerLevelVal] ?? 'rgba(107,114,128,0.5)'

  if (!centerNode) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Graph</h3>
        <div className="bg-[#0f172a] rounded-2xl border border-gray-800 p-4 overflow-hidden">
          <div className="text-center py-20 text-gray-500">
            <p className="text-sm">Loading network data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Network Graph
        </h3>
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
            <p className="text-xs text-gray-600 mt-1">Share your invite link to build your network</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox="0 0 520 520"
            className="w-full max-w-[520px] mx-auto"
          >
            <defs>
              {/* Center glow filter */}
              <filter id="centerGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Node glow filter */}
              <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Gradients for each edge */}
              {graphNodes.slice(1).map((node) => {
                const childColor = LEVEL_COLORS[node.level] ?? '#6B7280'
                return (
                  <linearGradient
                    key={`grad-${String(node.tokenId)}`}
                    id={`gradient-${String(node.tokenId)}`}
                    x1={centerNode.x}
                    y1={centerNode.y}
                    x2={node.x}
                    y2={node.y}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor={centerColor} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={childColor} stopOpacity={0.6} />
                  </linearGradient>
                )
              })}

              {/* Pulse animation radial gradient */}
              <radialGradient id="centerPulse" cx="50%" cy="50%" r="50%">
                <animate attributeName="r" values="40%;60%;40%" dur="2s" repeatCount="indefinite" />
                <stop offset="0%" stopColor={centerColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={centerColor} stopOpacity={0} />
              </radialGradient>
            </defs>

            {/* Background grid dots */}
            <g opacity={0.06}>
              {Array.from({ length: 13 }, (_, x) =>
                Array.from({ length: 13 }, (_, y) => (
                  <circle
                    key={`grid-${x}-${y}`}
                    cx={x * 43 + 2}
                    cy={y * 43 + 2}
                    r={1}
                    fill="#64748b"
                  />
                )),
              )}
            </g>

            {/* Pulse ring around center */}
            <circle
              cx={centerNode.x}
              cy={centerNode.y}
              r={35}
              fill="url(#centerPulse)"
            />

            {/* Edges (gradient lines) */}
            {graphNodes.slice(1).map((node) => (
              <g key={`edge-group-${String(node.tokenId)}`}>
                <line
                  x1={centerNode.x}
                  y1={centerNode.y}
                  x2={node.x}
                  y2={node.y}
                  stroke={`url(#gradient-${String(node.tokenId)})`}
                  strokeWidth={2}
                  strokeLinecap="round"
                  opacity={0.6}
                />
                {/* Subtle edge glow */}
                <line
                  x1={centerNode.x}
                  y1={centerNode.y}
                  x2={node.x}
                  y2={node.y}
                  stroke={`url(#gradient-${String(node.tokenId)})`}
                  strokeWidth={5}
                  strokeLinecap="round"
                  opacity={0.1}
                  filter="url(#nodeGlow)"
                />
              </g>
            ))}

            {/* Particles on edges */}
            {particles.map((p) => {
              const x = p.fromX + (p.toX - p.fromX) * p.progress
              const y = p.fromY + (p.toY - p.fromY) * p.progress
              const opacity = p.progress < 0.1
                ? p.progress * 10
                : p.progress > 0.9
                  ? (1 - p.progress) * 10
                  : 0.8
              return (
                <circle
                  key={`particle-${p.id}`}
                  cx={x}
                  cy={y}
                  r={p.size}
                  fill={p.color}
                  opacity={opacity}
                />
              )
            })}

            {/* Child nodes */}
            {graphNodes.slice(1).map((node) => {
              const color = LEVEL_COLORS[node.level] ?? '#6B7280'
              const glColor = LEVEL_GLOW_COLORS[node.level] ?? 'rgba(107,114,128,0.4)'
              return (
                <g
                  key={`child-${String(node.tokenId)}`}
                  onClick={() => handleNodeClick(node.tokenId)}
                  className="cursor-pointer"
                >
                  {/* Outer glow */}
                  <circle cx={node.x} cy={node.y} r={node.radius + 4} fill={glColor} opacity={0.4} />
                  {/* Outer ring */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.radius}
                    fill="#1e293b"
                    stroke={color}
                    strokeWidth={2}
                  />
                  {/* Inner circle */}
                  <circle cx={node.x} cy={node.y} r={node.radius - 4} fill="#334155" />
                  {/* Text */}
                  <text
                    x={node.x}
                    y={node.y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-xs font-bold"
                    fill="#cbd5e1"
                    fontSize="10"
                  >
                    {node.name
                      ? node.name.slice(0, 3).toUpperCase()
                      : `#${String(node.tokenId)}`}
                  </text>
                  {/* Label below */}
                  <text
                    x={node.x}
                    y={node.y + node.radius + 16}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    className="font-medium"
                  >
                    {node.name || `#${String(node.tokenId)}`}
                  </text>
                </g>
              )
            })}

            {/* Center node */}
            <g
              onClick={() => handleNodeClick(tokenId)}
              className="cursor-pointer"
            >
              {/* Expanding ring */}
              <circle cx={centerNode.x} cy={centerNode.y} r={centerNode.radius + 8} fill={centerGlow} opacity={0.3}>
                <animate attributeName="r" values={`${centerNode.radius + 6};${centerNode.radius + 14};${centerNode.radius + 6}`} dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.05;0.3" dur="3s" repeatCount="indefinite" />
              </circle>
              {/* Outer ring */}
              <circle
                cx={centerNode.x}
                cy={centerNode.y}
                r={centerNode.radius + 3}
                fill="none"
                stroke={centerColor}
                strokeWidth={3}
                opacity={0.6}
                filter="url(#centerGlow)"
              />
              {/* Main circle */}
              <circle
                cx={centerNode.x}
                cy={centerNode.y}
                r={centerNode.radius}
                fill="#1e293b"
                stroke={centerColor}
                strokeWidth={3}
              />
              {/* Inner fill */}
              <circle
                cx={centerNode.x}
                cy={centerNode.y}
                r={centerNode.radius - 5}
                fill={centerColor}
                opacity={0.15}
              />
              {/* Name */}
              <text
                x={centerNode.x}
                y={centerNode.y - 4}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#f1f5f9"
                fontSize="11"
                fontWeight="bold"
              >
                {centerName.slice(0, 8)}
              </text>
              {/* Level */}
              <text
                x={centerNode.x}
                y={centerNode.y + 10}
                textAnchor="middle"
                dominantBaseline="central"
                fill="currentColor"
                style={{ color: centerColor }}
                fontSize="9"
                fontWeight="bold"
              >
                {getLevelName(centerLevelVal)}
              </text>
              {/* Label below */}
              <text
                x={centerNode.x}
                y={centerNode.y + centerNode.radius + 20}
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="11"
                fontWeight="bold"
              >
                {centerName.length > 12 ? centerName.slice(0, 12) + '...' : centerName}
              </text>
              {/* Token ID label */}
              <text
                x={centerNode.x}
                y={centerNode.y + centerNode.radius + 34}
                textAnchor="middle"
                fill="#64748b"
                fontSize="9"
              >
                #{String(tokenId)}
              </text>
            </g>
          </svg>
        )}
      </div>
    </div>
  )
}
