import { useNavigate } from 'react-router-dom'
import { useCeres } from '../hooks/useCeres'
import { useI18n } from '../I18nContext'
import { LevelBadge } from './LevelBadge'

interface ProfileCardProps {
  tokenId: bigint
  onClose?: () => void  // optional — when omitted, renders as inline card
  onNavigate?: (tokenId: bigint) => void
}

/** Fetches the name of a DID by tokenId and renders it as a clickable button. */
function InviterName({ tokenId, onClick }: { tokenId: bigint; onClick: () => void }) {
  const { useProfile } = useCeres()
  const { data: inviterProfile } = useProfile(tokenId)
  if (!inviterProfile?.name) return <span>DID #{String(tokenId)}</span>
  return (
    <button
      onClick={onClick}
      className="font-medium text-[#10b981] hover:text-emerald-700 hover:underline transition-colors"
    >
      {inviterProfile.name}
    </button>
  )
}

/** Helper to render row label + value consistently */
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#12121a] rounded-xl">
      <span className="text-sm text-[#6b6b80]">{label}</span>
      <span className="text-sm text-right max-w-[55%]">{children}</span>
    </div>
  )
}

export function ProfileCard({ tokenId, onClose, onNavigate }: ProfileCardProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const { useProfile, useInviter, useDescendantCount } = useCeres()

  const { data: profile, isLoading, isError } = useProfile(tokenId)
  const { data: inviterTokenIdRaw } = useInviter(tokenId)
  const { data: descendantCountRaw } = useDescendantCount(tokenId)

  const inviterVal = inviterTokenIdRaw != null ? Number(inviterTokenIdRaw as bigint) : 0
  const inviterId = inviterVal > 0 ? BigInt(inviterVal) : undefined
  const descendantCount =
    descendantCountRaw != null ? Number(descendantCountRaw as bigint) : undefined

  const handleViewFullProfile = () => {
    navigate(`/profile/${String(tokenId)}`)
  }

  const handleInviterClick = () => {
    if (inviterId && onNavigate) {
      onNavigate(inviterId)
    }
  }

  const truncateAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatDate = (timestamp: bigint) => {
    const ms = Number(timestamp) * 1000
    return new Date(ms).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  /* ── Loading state ── */
  if (isLoading) {
    const inner = (
      <div className="bg-[#12121a] rounded-2xl shadow-glow-cyan max-w-sm w-full mx-4 p-8 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-[#6b6b80] text-sm">{t('common.loading')}</p>
      </div>
    )
    if (!onClose) return inner
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()}>{inner}</div>
      </div>
    )
  }

  /* ── Error / not-found state ── */
  if (isError || !profile) {
    const inner = (
      <div className="bg-[#12121a] rounded-2xl shadow-glow-cyan max-w-sm w-full mx-4 p-8">
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-[#6b6b80] font-medium mb-1">{t('profile.notFound')}</h3>
          <p className="text-xs text-[#555570]">DID #{String(tokenId)} — {t('profile.notFoundDesc')}</p>
        </div>
      </div>
    )
    if (!onClose) return inner
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()}>{inner}</div>
      </div>
    )
  }

  /* ── Normal card ── */
  const inner = (
    <div className="bg-[#12121a] rounded-2xl shadow-glow-cyan max-w-sm w-full mx-4 overflow-hidden">
      {/* Header gradient */}
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-[#10b981] to-[#0a2e2a]" />
        {onClose && (
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-[#12121a]/20 backdrop-blur-sm rounded-full flex items-center justify-center text-[#e0e0e8] hover:bg-[#12121a]/40 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="px-6 pb-6">
        {/* Avatar circle */}
        <div className="flex justify-center -mt-12 mb-4">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-glow-cyan flex items-center justify-center text-[#e0e0e8] text-2xl font-bold bg-gradient-to-br from-[#10b981] to-[#0a2e2a] shrink-0">
            {profile.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
        </div>

        {/* Name + DID number */}
        <div className="text-center mb-3">
          <h2 className="text-xl font-bold text-[#e0e0e8]">{profile.name}</h2>
          <p className="text-sm text-[#555570] mt-0.5">DID #{String(tokenId)}</p>
        </div>

        {/* Level badge */}
        <div className="flex justify-center mb-4">
          <LevelBadge level={profile.level} size="md" />
        </div>

        {/* Info rows */}
        <div className="space-y-2.5">
          <InfoRow label={t('profile.inviter')}>
            {inviterId ? (
              <InviterName tokenId={inviterId} onClick={handleInviterClick} />
            ) : (
              <span className="text-[#555570]">{t('profile.noInviter')}</span>
            )}
          </InfoRow>

          <InfoRow label={t('profile.bio')}>
            <span className="text-[#a0a0b0] truncate block">
              {profile.bio || <span className="text-[#555570]">{t('profile.noBio')}</span>}
            </span>
          </InfoRow>

          <InfoRow label={t('profile.owner')}>
            <span className="font-mono text-[#a0a0b0]">
              {profile.owner ? truncateAddress(profile.owner) : '—'}
            </span>
          </InfoRow>

          {profile.updatedAt && Number(profile.updatedAt) > 0 && (
            <InfoRow label={t('profileCard.mintDate')}>
              <span className="text-[#a0a0b0]">{formatDate(profile.updatedAt)}</span>
            </InfoRow>
          )}

          {descendantCount != null && (
            <InfoRow label={t('profile.totalDescendants')}>
              <span className="font-medium text-[#a0a0b0]">{descendantCount}</span>
            </InfoRow>
          )}
        </div>

        {/* View Full Profile → button */}
        <button onClick={handleViewFullProfile}
          className="mt-5 w-full py-3 bg-gradient-to-r from-[#10b981] to-[#0a2e2a] text-[#e0e0e8] font-semibold rounded-xl hover:from-[#059669] hover:to-[#0a2e2a] transition-all shadow-glow-cyan hover:shadow-glow-cyan hover:-translate-y-0.5 transform">
          {t('profileCard.viewFullProfile')}
        </button>
      </div>
    </div>
  )

  if (!onClose) return inner
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{inner}</div>
    </div>
  )
}
