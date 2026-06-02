import { useI18n } from '../I18nContext'

interface LevelBadgeProps {
  level: number
  size?: 'sm' | 'md' | 'lg'
}

const LEVEL_COLORS: Record<number, { bg: string; text: string; border: string; glow: string }> = {
  0: { bg: 'bg-[#16162a]', text: 'text-[#808090]', border: 'border-[#333355]', glow: '' },
  1: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', glow: '' },
  2: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-300', glow: '' },
  3: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-400', glow: 'shadow-[0_0_8px_rgba(255,215,0,0.3)]' },
  4: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-300', glow: 'shadow-[0_0_8px_rgba(168,85,247,0.3)]' },
  5: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-400', glow: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]' },
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
}

export function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
  const { t } = useI18n()
  const colors = LEVEL_COLORS[level] ?? LEVEL_COLORS[0]
  const levelKeys = ['seed', 'bronze', 'silver', 'gold', 'crystal', 'diamond']
  const levelName = t(`level.${levelKeys[level] ?? 'seed'}`)

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${colors.bg} ${colors.text} ${colors.border} ${colors.glow} ${SIZE_CLASSES[size]}`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full bg-current`} />
      {levelName} Lv.{level}
    </span>
  )
}
