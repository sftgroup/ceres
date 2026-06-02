import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useCeres } from '../hooks/useCeres'
import { useI18n } from '../I18nContext'
import { LevelBadge } from '../components/LevelBadge'
import { NetworkGraph } from '../components/NetworkGraph'
import { ProfileCard } from '../components/ProfileCard'

export function ProfilePage() {
  const { tokenId: tokenIdParam } = useParams<{ tokenId: string }>()
  const tokenId = tokenIdParam ? BigInt(tokenIdParam) : undefined
  const { t } = useI18n()
  const { address } = useAccount()
  const {
    useProfile,
    useInviter,
    useAncestors,
    useDirectInvitees,
    useDescendantCount,
    useLevel,
    updateProfile,
    invalidateProfile,
  } = useCeres()

  const { data: profile, isLoading } = useProfile(tokenId)
  const { data: inviter } = useInviter(tokenId)
  const { data: ancestors } = useAncestors(tokenId)
  const { data: inviteeIds } = useDirectInvitees(tokenId)
  const { data: descendantCount } = useDescendantCount(tokenId)
  const { data: level } = useLevel(tokenId)

  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [editUrls, setEditUrls] = useState('')
  const [saving, setSaving] = useState(false)

  const invites = (inviteeIds as bigint[] | undefined) ?? []
  const ancestorList = (ancestors as bigint[] | undefined) ?? []
  const levelVal = (level as number | undefined) ?? 0
  const isOwner = address && profile?.owner ? address.toLowerCase() === profile.owner.toLowerCase() : false
  const inviterId = inviter != null ? (inviter as bigint) : undefined

  const startEdit = () => {
    if (!profile) return
    setEditName(profile.name)
    setEditBio(profile.bio)
    setEditAvatar(profile.avatar)
    setEditUrls('')
    setEditing(true)
  }

  const saveEdit = async () => {
    if (!tokenId || !profile) return
    setSaving(true)
    try {
      const urlList = editUrls.split(',').map((u) => u.trim()).filter(Boolean)
      await updateProfile(tokenId, editName, editBio, editAvatar, urlList)
      invalidateProfile(tokenId)
      setEditing(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (!tokenId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">{t('profile.notFound')}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-500 mt-4">{t('profile.loading')}</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('profile.notFound')}</h2>
        <p className="text-gray-500">{t('profile.notFoundDesc').replace('#', `#${tokenIdParam}`)}</p>
        <Link to="/" className="inline-block mt-6 text-emerald-600 hover:text-emerald-700 font-medium">
          {t('profile.backHome')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold shrink-0 overflow-hidden ring-4 ring-emerald-50">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              profile.name?.charAt(0)?.toUpperCase() ?? '#'
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {editing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1 text-2xl font-bold"
                  />
                ) : (
                  profile.name || `DID #${tokenIdParam}`
                )}
              </h1>
              <LevelBadge level={levelVal} size="lg" />
            </div>

            {editing ? (
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                placeholder="Bio"
              />
            ) : (
              <p className="text-gray-600 mb-3">{profile.bio || t('profile.noBio')}</p>
            )}

            <p className="text-sm text-gray-400">
              {t('profile.tokenId')}: #{tokenIdParam}
              {profile.owner && (
                <>
                  {' · '}
                  {t('profile.owner')}: {profile.owner.slice(0, 6)}...{profile.owner.slice(-4)}
                </>
              )}
            </p>

            {editing && (
              <div className="mt-3 space-y-2">
                <label className="block text-sm font-medium text-gray-700">{t('profile.avatar')}</label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="https://..."
                />
                <label className="block text-sm font-medium text-gray-700 mt-2">{t('profile.urls')}</label>
                <input
                  type="text"
                  value={editUrls}
                  onChange={(e) => setEditUrls(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="https://twitter.com/..., https://github.com/..."
                />
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-4">
              {isOwner && !editing && (
                <button
                  onClick={startEdit}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  {t('profile.edit')}
                </button>
              )}
              {editing && (
                <>
                  <button
                    onClick={saveEdit}
                    disabled={saving}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    {saving ? t('create.processing') : t('profile.save')}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    {t('profile.cancel')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {!editing && profile.avatar && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {[profile.avatar].filter(Boolean).map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {url.length > 40 ? url.slice(0, 40) + '...' : url}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Ancestor Chain */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.ancestors')}</h3>
            {inviterId && inviterId !== 0n ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">{t('profile.inviter')}:</span>
                <Link
                  to={`/profile/${String(inviterId)}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-emerald-50 rounded-lg text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  <span className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xs font-bold">
                    {String(inviterId)}
                  </span>
                  DID #{String(inviterId)}
                </Link>
                {ancestorList.length > 1 && (
                  <>
                    <span className="text-gray-300">›</span>
                    {ancestorList.slice(1, 5).map((anc, i) => (
                      <Link
                        key={i}
                        to={`/profile/${String(anc)}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-emerald-50 rounded-lg text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
                      >
                        #{String(anc)}
                      </Link>
                    ))}
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">{t('profile.noInviter')}</p>
            )}
          </div>

          {/* Network Graph */}
          <NetworkGraph tokenId={tokenId} />

          {/* Invitees List */}
          {invites.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.invitees')} ({invites.length})</h3>
              <div className="space-y-2">
                {invites.map((id) => (
                  <ProfileCard key={String(id)} tokenId={id} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.stats')}</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('profile.directInvites')}</span>
                <span className="font-semibold text-gray-900">{invites.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('profile.totalDescendants')}</span>
                <span className="font-semibold text-gray-900">{String(descendantCount ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{t('profile.level')}</span>
                <LevelBadge level={levelVal} size="sm" />
              </div>
            </div>
          </div>

          {/* Level Info */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6">
            <h3 className="text-sm font-semibold text-emerald-800 mb-2">{t('profile.levelUp')}</h3>
            <p className="text-xs text-emerald-700 leading-relaxed">
              {t('profile.levelUpDesc')}
            </p>
            <div className="mt-3 space-y-1 text-xs text-emerald-600">
              <div>🌱 {t('level.seed')} → 0</div>
              <div>🥉 {t('level.bronze')} → ≥ 3</div>
              <div>🥈 {t('level.silver')} → ≥ 10</div>
              <div>🥇 {t('level.gold')} → ≥ 50</div>
              <div>💎 {t('level.crystal')} → ≥ 200</div>
              <div>🔷 {t('level.diamond')} → ≥ 1000</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
