import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useCeres } from '../hooks/useCeres'
import { useI18n } from '../I18nContext'
import { ConnectButton } from '../components/ConnectButton'

export function MintPage() {
  const { t } = useI18n()
  const { address, isConnected } = useAccount()
  const { createProfile, useProfile, useMintFee, useMintFeeEnabled, useBalanceOf, useUserTokenId, invalidateAll } = useCeres()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const inviterFromUrl = searchParams.get('ref') ?? ''
  const inviterTokenId = inviterFromUrl ? BigInt(inviterFromUrl) : undefined

  const { data: inviterProfile, isLoading: inviterLoading } = useProfile(inviterTokenId)

  const { data: mintFeeData } = useMintFee()
  const { data: mintFeeEnabledData } = useMintFeeEnabled()
  const { data: balanceData } = useBalanceOf(address as `0x${string}` | undefined)
  const userTokenId = useUserTokenId()

  const hasDID = (balanceData as bigint) != null && (balanceData as bigint) > 0n

  const mintFeeWei = (mintFeeData as bigint) ?? 0n
  const mintFeeEnabled = (mintFeeEnabledData as boolean) ?? false
  const mintFeeEth = mintFeeWei ? Number(mintFeeWei) / 1e18 : 0

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')
  const [urls, setUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successTokenId, setSuccessTokenId] = useState<bigint | null>(null)

  const inviterName = inviterProfile?.name ?? (inviterFromUrl ? `DID #${inviterFromUrl}` : null)
  const inviterValid = inviterFromUrl ? (inviterProfile != null) : true
  const inviterLoadingDone = !inviterFromUrl || !inviterLoading

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const urlList = urls.split(',').map((u) => u.trim()).filter(Boolean)
      const inviterId = inviterTokenId ?? 0n
      const feeValue = mintFeeEnabled ? mintFeeWei : undefined
      const hash = await createProfile(name, bio, avatar, urlList, inviterId, feeValue)
      invalidateAll()
      setSuccessTokenId(hash as unknown as bigint)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Transaction failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (successTokenId !== null) {
      const timer = setTimeout(() => {
        navigate('/invite')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [successTokenId, navigate])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">🌱</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('mint.connectWallet')}</h2>
          <p className="text-gray-500 mb-8">{t('mint.connectDesc')}</p>
          <ConnectButton variant="cta" />
        </div>
      </div>
    )
  }

  if (hasDID && userTokenId != null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('mint.alreadyHaveDID')}</h2>
          <p className="text-gray-500 mb-4">
            {t('mint.alreadyHaveDesc')}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/profile/${userTokenId}`)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-600 transition-all shadow-lg"
            >
              {t('mint.viewProfile')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              {t('mint.goHome')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (inviterFromUrl && inviterLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" />
        <p className="text-gray-500 mt-4">{t('mint.validating')}</p>
      </div>
    )
  }

  if (inviterFromUrl && !inviterValid) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('mint.invalidInvite')}</h2>
        <p className="text-gray-500">
          {t('mint.inviterNotFound', { id: inviterFromUrl })}
        </p>
      </div>
    )
  }

  if (successTokenId !== null) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('create.success')}</h2>
        <p className="text-gray-500 mb-6">{t('mint.successDesc')}</p>
        <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🌾</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('mint.invitedTitle')}
          </h1>
          <p className="text-gray-500">
            {t('mint.invitedDesc')}
          </p>
        </div>

        {inviterName && (
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-5 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {inviterName.charAt(0)?.toUpperCase() ?? '#'}
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('mint.invitedBy')}</p>
              <p className="font-semibold text-gray-900">{inviterName}</p>
            </div>
            <div className="ml-auto text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
              DID #{inviterFromUrl}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('create.title')}</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('create.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                placeholder="Your display name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.bio')}</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow resize-none"
                placeholder="Tell others about yourself"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.avatar')}</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                placeholder="https://your-avatar-url.com/photo.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('create.urls')}</label>
              <input
                type="text"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow"
                placeholder="https://twitter.com/..., https://github.com/..."
              />
            </div>

            {inviterFromUrl && (
              <div className="p-4 bg-emerald-50 rounded-xl">
                <label className="block text-sm font-medium text-emerald-800 mb-1">
                  {t('create.inviter')}
                </label>
                <p className="text-emerald-700 font-medium">DID #{inviterFromUrl}</p>
                <p className="text-xs text-emerald-600 mt-1">{t('mint.cannotChange')}</p>
              </div>
            )}

            {mintFeeEnabled && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="text-amber-600">💰</span>
                  <span className="text-sm font-medium text-amber-800">
                    {t('create.mintFee', { fee: mintFeeEth })}
                  </span>
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  This fee will be sent with your transaction.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !name || !inviterLoadingDone}
            className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                {t('create.processing')}
              </span>
            ) : (
              t('create.submit')
            )}
          </button>

          <p className="text-xs text-gray-400 text-center mt-4">
            {t('mint.terms')}
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-400 hover:text-emerald-600 transition-colors">
            {t('mint.backHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
