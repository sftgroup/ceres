import { useState } from 'react'
import { useAccount } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { useCeres } from '../hooks/useCeres'

export function AdminPage() {
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
      setError(e instanceof Error ? e.message : 'Toggle failed')
    } finally {
      setLoading(null)
    }
  }

  const handleSetFee = async () => {
    if (!feeInput || Number(feeInput) <= 0) {
      setError('Please enter a valid fee amount')
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
      setError(e instanceof Error ? e.message : 'Set fee failed')
    } finally {
      setLoading(null)
    }
  }

  const handleWithdraw = async () => {
    if (contractBalance === 0n) {
      setError('No balance to withdraw')
      return
    }
    setError('')
    setLoading('withdraw')
    try {
      await withdrawFees()
      await refetchBalance()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Withdraw failed')
    } finally {
      setLoading(null)
    }
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
        <p className="text-gray-500">Connect your wallet to access the admin dashboard.</p>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500">
          You are not the contract owner. Only the owner of the CeresRegistry contract can access this page.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">⚙️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500">Manage CeresRegistry contract settings</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Mint Fee Toggle */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mint Fee</h2>

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Status</span>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${mintFeeEnabled ? 'text-emerald-600' : 'text-gray-400'}`}>
              {mintFeeEnabled ? 'Enabled' : 'Disabled'}
            </span>
            <button
              onClick={handleToggleMintFee}
              disabled={loading === 'toggle'}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                mintFeeEnabled ? 'bg-emerald-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  mintFeeEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Current Fee</span>
          <span className="font-semibold text-gray-900">
            {formatEther(mintFeeWei)} ETH
          </span>
        </div>
      </div>

      {/* Set Fee Amount */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Set Fee Amount</h2>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="number"
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
              className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-lg"
              placeholder="0.001"
              step="0.001"
              min="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">ETH</span>
          </div>
          <button
            onClick={handleSetFee}
            disabled={loading === 'setFee' || !feeInput}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium whitespace-nowrap"
          >
            {loading === 'setFee' ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Setting...
              </span>
            ) : (
              'Set Fee'
            )}
          </button>
        </div>
      </div>

      {/* Withdraw */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Withdraw</h2>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Contract Balance</span>
          <span className="text-lg font-bold text-gray-900">
            {formatEther(contractBalance)} ETH
          </span>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={loading === 'withdraw' || contractBalance === 0n}
          className="w-full px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading === 'withdraw' ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Withdrawing...
            </span>
          ) : (
            'Withdraw All'
          )}
        </button>

        {contractBalance === 0n && (
          <p className="text-xs text-gray-400 text-center mt-3">
            No ETH available to withdraw
          </p>
        )}
      </div>
    </div>
  )
}
