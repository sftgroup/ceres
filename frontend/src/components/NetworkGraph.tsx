import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCeres } from '../hooks/useCeres'
import { useI18n } from '../I18nContext'

interface NetworkGraphProps {
  tokenId: bigint
  depth?: number
}

interface GraphNode {
  tokenId: bigint
  x: number
  y: number
  level: number
  name: string
}

function radialLayout(centerId: bigint, children: bigint[], childrenLevels: (number | undefined)[]): GraphNode[] {
  const results: GraphNode[] = []
  const centerX = 250
  const centerY = 250

  // Load children data with levels from contract
  results.push({ tokenId: centerId, x: centerX, y: centerY, level: 0, name: '' })

  const radius = 120
  const n = children.length
  children.forEach((id, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2
    results.push({
      tokenId: id,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      level: childrenLevels[i] ?? 0,
      name: '',
    })
  })

  return results
}

const LEVEL_COLORS: Record<number, string> = {
  0: '#9CA3AF',
  1: '#CD7F32',
  2: '#C0C0C0',
  3: '#FFD700',
  4: '#A855F7',
  5: '#3B82F6',
}

export function NetworkGraph({ tokenId, depth: _depth = 1 }: NetworkGraphProps) {
  const { useDirectInvitees } = useCeres()
  const { data: inviteeIds } = useDirectInvitees(tokenId)
  const { t } = useI18n()
  const navigate = useNavigate()

  const invitees = (inviteeIds as bigint[] | undefined) ?? []

  // Build a simple query for each invitee level — pass through as numbers
  const graphNodes = useMemo(() => {
    if (!invitees.length) {
      return [{ tokenId, x: 250, y: 250, level: 0, name: `#${String(tokenId)}` }]
    }
    return radialLayout(tokenId, invitees, invitees.map(() => 0))
  }, [invitees, tokenId])

  const handleNodeClick = (id: bigint) => {
    navigate(`/profile/${String(id)}`)
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('invitees')}</h3>
      <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl border border-gray-100 p-4">
        {invitees.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            No invitees yet
          </div>
        ) : (
          <svg viewBox="0 0 500 500" className="w-full max-w-[500px] mx-auto">
            <defs>
              <filter id="nodeGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {graphNodes.slice(1).map((node) => (
              <line
                key={`edge-${String(node.tokenId)}`}
                x1={graphNodes[0].x}
                y1={graphNodes[0].y}
                x2={node.x}
                y2={node.y}
                stroke="#D1D5DB"
                strokeWidth={1.5}
                strokeDasharray="4 2"
              />
            ))}

            {/* Edges glow */}
            {graphNodes.slice(1).map((node) => (
              <line
                key={`edge-glow-${String(node.tokenId)}`}
                x1={graphNodes[0].x}
                y1={graphNodes[0].y}
                x2={node.x}
                y2={node.y}
                stroke={LEVEL_COLORS[node.level] ?? '#9CA3AF'}
                strokeWidth={0.5}
                opacity={0.3}
              />
            ))}

            {/* Nodes */}
            {graphNodes.map((node) => (
              <g
                key={`node-${String(node.tokenId)}`}
                onClick={() => handleNodeClick(node.tokenId)}
                className="cursor-pointer"
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.tokenId === tokenId ? 22 : 16}
                  fill={LEVEL_COLORS[node.level] ?? '#9CA3AF'}
                  opacity={0.15}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.tokenId === tokenId ? 22 : 16}
                  fill="none"
                  stroke={LEVEL_COLORS[node.level] ?? '#9CA3AF'}
                  strokeWidth={node.tokenId === tokenId ? 3 : 2}
                  filter={node.tokenId === tokenId ? 'url(#nodeGlow)' : undefined}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.tokenId === tokenId ? 14 : 10}
                  fill="white"
                  stroke={LEVEL_COLORS[node.level] ?? '#9CA3AF'}
                  strokeWidth={1.5}
                />
                <text
                  x={node.x}
                  y={node.tokenId === tokenId ? node.y + 36 : node.y + 28}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 font-medium"
                >
                  #{String(node.tokenId)}
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
    </div>
  )
}
