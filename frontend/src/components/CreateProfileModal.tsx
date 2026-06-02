import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useCeres } from '../hooks/useCeres'
import { useI18n } from '../I18nContext'
import { useSearchParams } from 'react-router-dom'

interface CreateProfileModalProps {
  open: boolean
  onClose: () => void
  onCreated?: (tokenId: bigint) => void
}

export function CreateProfileModal({ open, onClose, onCreated }: CreateProfileModalProps) {
  const { t } = useI18n()
  const { address } = useAccount()
  const { createProfile, useMintFee, useMintFeeEnabled, useProfileCount, invalidateAll } = useCeres()
  const [searchParams] = useSearchParams()

  const { data: mintFeeData } = useMintFee()
  const { data: mintFeeEnabledData } = useMintFeeEnabled()
  const { data: profileCount } = useProfileCount()
  const mintFeeWei = (mintFeeData as bigint) ?? 0n
  const mintFeeEnabled = (mintFeeEnabledData as boolean) ?? false
  const mintFeeEth = mintFeeWei ? Number(mintFeeWei) / 1e18 : 0
  const hasProfile = profileCount != null && Number(profileCount) > 0

  const inviterFromUrl = searchParams.get('ref') ?? ''

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [urls, setUrls] = useState('')
  const [inviter, setInviter] = useState(inviterFromUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<bigint | null>(null)

  if (!open) return null

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const urlList = urls.split(',').map((u) => u.trim()).filter(Boolean)
      const inviterId = inviter ? BigInt(inviter) : 0n
      const feeValue = mintFeeEnabled ? mintFeeWei : undefined
      const hash = await createProfile(name, bio, avatar, urlList, inviterId, feeValue)
      // Refresh all cached data so UI updates without manual refresh
      invalidateAll()
      setSuccess(hash as unknown as bigint)
      onCreated?.(hash as unknown as bigint)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('create.title')}</h2>
        <p className="text-sm text-gray-500 mb-6">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
        </p>

        {hasProfile ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">You already have a DID</h3>
            <p className="text-sm text-gray-500 mt-2">Each address can only create one DID profile.</p>
            <div className="mt-6 flex gap-3 justify-center">
              <Link
                to="/search"
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Search Profiles
              </Link>
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        ) : success !== null ? (
          /* Compact success — gets dismissed automatically */
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto mb-3 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Profile Created!</h3>
            <p className="text-sm text-gray-500 mt-1">
              DID #<span className="font-mono text-emerald-600">{String(success)}</span>
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-8 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.bio')}</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow resize-none"
                  placeholder="Tell others about yourself"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.avatar')}</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.urls')}</label>
                <input
                  type="text"
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                  placeholder="https://twitter.com/..., https://github.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.inviter')}</label>
                <input
                  type="number"
                  value={inviter}
                  onChange={(e) => setInviter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                  placeholder="0"
                />
              </div>
            </div>

            {mintFeeEnabled && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2">
                  <span>💰</span>
                  <span className="text-sm font-medium text-amber-800">
                    Mint Fee: {mintFeeEth} ETH
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {t('profile.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !name}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? t('create.processing') : t('create.submit')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
