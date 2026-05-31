import { Link } from 'react-router-dom'
import { useCeres, type ProfileWithId } from '../hooks/useCeres'
import { LevelBadge } from './LevelBadge'
import { useI18n } from '../I18nContext'

interface ProfileCardProps {
  tokenId: bigint
}

export function ProfileCard({ tokenId }: ProfileCardProps) {
  const { useProfile } = useCeres()
  const { data: profile, isLoading } = useProfile(tokenId)

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-100 rounded w-32" />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return <ProfileCardView profile={profile} />
}

export function ProfileCardView({ profile }: { profile: ProfileWithId }) {
  const { t } = useI18n()

  return (
    <Link
      to={`/profile/${String(profile.tokenId)}`}
      className="block bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-4 group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            profile.name?.charAt(0)?.toUpperCase() ?? '?'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 truncate">{profile.name || `DID #${String(profile.tokenId)}`}</h3>
            <LevelBadge level={profile.level} size="sm" />
          </div>
          <p className="text-sm text-gray-500 truncate">
            {profile.bio || t('profile.tokenId') + ': #' + String(profile.tokenId)}
          </p>
        </div>
        <div className="text-gray-300 group-hover:text-emerald-500 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
