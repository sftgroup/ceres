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
      <div className="min-h-screen bg-gradient-to-br from-[#0a2e1a] via-[#12121a] to-[#0a2e2a] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">🌱</div>
          <h2 className="text-2xl font-bold text-[#e0e0e8] mb-3">{t('mint.connectWallet')}</h2>
          <p className="text-[#6b6b80] mb-8">{t('mint.connectDesc')}</p>
          <ConnectButton variant="cta" />
        </div>
      </div>
    )
  }

  if (hasDID && userTokenId != null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a2e1a] via-[#12121a] to-[#0a2e2a] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-2xl font-bold text-[#e0e0e8] mb-3">{t('mint.alreadyHaveDID')}</h2>
          <p className="text-[#6b6b80] mb-4">
            {t('mint.alreadyHaveDesc')}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/profile/${userTokenId}`)}
              className="px-6 py-3 bg-gradient-to-r from-[#10b981] to-[#0a2e2a] text-[#e0e0e8] font-semibold rounded-xl hover:from-[#059669] hover:to-[#0a2e2a] transition-all shadow-glow-cyan"
            >
              {t('mint.viewProfile')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#16162a] text-[#a0a0b0] font-semibold rounded-xl hover:bg-[#1a1a2e] transition-all"
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
        <p className="text-[#6b6b80] mt-4">{t('mint.validating')}</p>
      </div>
    )
  }

  if (inviterFromUrl && !inviterValid) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-xl font-semibold text-[#e0e0e8] mb-2">{t('mint.invalidInvite')}</h2>
        <p className="text-[#6b6b80]">
          {t('mint.inviterNotFound', { id: inviterFromUrl })}
        </p>
      </div>
    )
  }

  if (successTokenId !== null) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-[#0f3d22] rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[#e0e0e8] mb-2">{t('create.success')}</h2>
        <p className="text-[#6b6b80] mb-6">{t('mint.successDesc')}</p>
        <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2e1a] via-[#12121a] to-[#0a2e2a]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🌾</div>
          <h1 className="text-3xl font-bold text-[#e0e0e8] mb-2">
            {t('mint.invitedTitle')}
          </h1>
          <p className="text-[#6b6b80]">
            {t('mint.invitedDesc')}
          </p>
        </div>

        {inviterName && (
          <div className="bg-[#12121a] rounded-2xl border border-emerald-100 shadow-glow-cyan p-5 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#10b981] to-[#0a2e2a] rounded-full flex items-center justify-center text-[#e0e0e8] font-bold text-lg">
              {inviterName.charAt(0)?.toUpperCase() ?? '#'}
            </div>
            <div>
              <p className="text-sm text-[#6b6b80]">{t('mint.invitedBy')}</p>
              <p className="font-semibold text-[#e0e0e8]">{inviterName}</p>
            </div>
            <div className="ml-auto text-xs bg-[#0a2e1a] text-emerald-700 px-3 py-1 rounded-full font-medium">
              DID #{inviterFromUrl}
            </div>
          </div>
        )}

        <div className="bg-[#12121a] rounded-2xl border border-gray-100 shadow-glow-cyan p-6 sm:p-8">
          <h2 className="text-xl font-bold text-[#e0e0e8] mb-6">{t('create.title')}</h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">
                {t('create.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-[#333355] rounded-xl focus:ring-2 focus:ring-[#0a2e1a]0 focus:border-emerald-500 outline-none transition-shadow"
                placeholder="Your display name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">{t('create.bio')}</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-[#333355] rounded-xl focus:ring-2 focus:ring-[#0a2e1a]0 focus:border-emerald-500 outline-none transition-shadow resize-none"
                placeholder="Tell others about yourself"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">{t('create.avatar')}</label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-4 py-3 border border-[#333355] rounded-xl focus:ring-2 focus:ring-[#0a2e1a]0 focus:border-emerald-500 outline-none transition-shadow"
                placeholder="https://your-avatar-url.com/photo.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a0a0b0] mb-1">{t('create.urls')}</label>
              <input
                type="text"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                className="w-full px-4 py-3 border border-[#333355] rounded-xl focus:ring-2 focus:ring-[#0a2e1a]0 focus:border-emerald-500 outline-none transition-shadow"
                placeholder="https://twitter.com/..., https://github.com/..."
              />
            </div>

            {inviterFromUrl && (
              <div className="p-4 bg-[#0a2e1a] rounded-xl">
                <label className="block text-sm font-medium text-emerald-800 mb-1">
                  {t('create.inviter')}
                </label>
                <p className="text-emerald-700 font-medium">DID #{inviterFromUrl}</p>
                <p className="text-xs text-[#10b981] mt-1">{t('mint.cannotChange')}</p>
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
            className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-[#10b981] to-[#0a2e2a] text-[#e0e0e8] font-semibold rounded-xl hover:from-[#059669] hover:to-[#0a2e2a] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-glow-cyan shadow-[#10b981]/20 hover:shadow-glow-cyan hover:shadow-[#34d399]/30 transform hover:-translate-y-0.5"
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

          <p className="text-xs text-[#555570] text-center mt-4">
            {t('mint.terms')}
          </p>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-[#555570] hover:text-[#10b981] transition-colors">
            {t('mint.backHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
