import { useState } from 'react'
import { useAccount } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { useCeres } from '../hooks/useCeres'
import { useI18n } from '../I18nContext'

export function AdminPage() {
  const { t } = useI18n()
  const { isConnected } = useAccount()
  const {
    useIsOwner,
    useMintFee,
    useMintFeeEnabled,
    useContractBalance,
    setMintFee,
    toggleMintFee,
    withdrawFees,
  } = useCeres()

  const isOwner = useIsOwner()
  const { data: mintFeeData, refetch: refetchMintFee } = useMintFee()
  const { data: mintFeeEnabledData, refetch: refetchMintFeeEnabled } = useMintFeeEnabled()
  const { data: balanceData, refetch: refetchBalance } = useContractBalance()

  const mintFeeWei = (mintFeeData as bigint) ?? 0n
  const mintFeeEnabled = (mintFeeEnabledData as boolean) ?? false
  const contractBalance = balanceData?.value ?? 0n

  const [feeInput, setFeeInput] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleToggleMintFee = async () => {
    setError('')
    setLoading('toggle')
    try {
      await toggleMintFee(!mintFeeEnabled)
      await refetchMintFeeEnabled()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.toggleFailed'))
    } finally {
      setLoading(null)
    }
  }

  const handleSetFee = async () => {
    if (!feeInput || Number(feeInput) <= 0) {
      setError(t('admin.invalidFee'))
      return
    }
    setError('')
    setLoading('setFee')
    try {
      const weiAmount = parseEther(feeInput)
      await setMintFee(weiAmount)
      setFeeInput('')
      await refetchMintFee()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.setFeeFailed'))
    } finally {
      setLoading(null)
    }
  }

  const handleWithdraw = async () => {
    if (contractBalance === 0n) {
      setError(t('admin.noBalanceToWithdraw'))
      return
    }
    setError('')
    setLoading('withdraw')
    try {
      await withdrawFees()
      await refetchBalance()
    } catch (e) {
      setError(e instanceof Error ? e.message : t('admin.withdrawFailed'))
    } finally {
      setLoading(null)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-[#e0e0e8] mb-2">{t('admin.connectWallet')}</h2>
        <p className="text-[#6b6b80]">{t('admin.connectDesc')}</p>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-xl font-semibold text-[#e0e0e8] mb-2">{t('admin.accessDenied')}</h2>
        <p className="text-[#6b6b80]">
          {t('admin.notOwner')}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">⚙️</div>
        <h1 className="text-3xl font-bold text-[#e0e0e8] mb-2">{t('admin.title')}</h1>
        <p className="text-[#6b6b80]">{t('admin.desc')}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Mint Fee Toggle */}
      <div className="bg-[#12121a] rounded-2xl border border-gray-100 shadow-glow-cyan p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#e0e0e8] mb-4">{t('admin.mintFee')}</h2>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[#808090]">{t('admin.status')}</span>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${mintFeeEnabled ? 'text-[#10b981]' : 'text-[#555570]'}`}>
              {mintFeeEnabled ? t('admin.enabled') : t('admin.disabled')}
            </span>
            <button
              onClick={handleToggleMintFee}
              disabled={loading === 'toggle'}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                mintFeeEnabled ? 'bg-[#10b981]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#12121a] transition-transform ${
                  mintFeeEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-[#6b6b80]">{t('admin.currentFee')}</span>
          <span className="font-semibold text-[#e0e0e8]">
            {formatEther(mintFeeWei)} ETH
          </span>
        </div>
      </div>

      {/* Set Fee Amount */}
      <div className="bg-[#12121a] rounded-2xl border border-gray-100 shadow-glow-cyan p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#e0e0e8] mb-4">{t('admin.setFee')}</h2>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="number"
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
              className="w-full px-4 py-3 pr-16 border border-[#333355] rounded-xl focus:ring-2 focus:ring-[#0a2e1a]0 focus:border-emerald-500 outline-none text-lg"
              placeholder="0.001"
              step="0.001"
              min="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555570] font-medium">ETH</span>
          </div>
          <button
            onClick={handleSetFee}
            disabled={loading === 'setFee' || !feeInput}
            className="px-6 py-3 bg-[#10b981] text-[#e0e0e8] rounded-xl hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap"
          >
            {loading === 'setFee' ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                {t('admin.setting')}
              </span>
            ) : (
              t('admin.setFeeBtn')
            )}
          </button>
        </div>
      </div>

      {/* Withdraw */}
      <div className="bg-[#12121a] rounded-2xl border border-gray-100 shadow-glow-cyan p-6">
        <h2 className="text-lg font-semibold text-[#e0e0e8] mb-4">{t('admin.withdraw')}</h2>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-[#6b6b80]">{t('admin.contractBalance')}</span>
          <span className="text-lg font-bold text-[#e0e0e8]">
            {formatEther(contractBalance)} ETH
          </span>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={loading === 'withdraw' || contractBalance === 0n}
          className="w-full px-6 py-3 bg-amber-600 text-[#e0e0e8] rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading === 'withdraw' ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              {t('admin.withdrawing')}
            </span>
          ) : (
            t('admin.withdrawAll')
          )}
        </button>

        {contractBalance === 0n && (
          <p className="text-xs text-[#555570] text-center mt-3">
            {t('admin.noBalance')}
          </p>
        )}
      </div>
    </div>
  )
}
