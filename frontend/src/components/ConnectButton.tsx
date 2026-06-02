import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useI18n } from '../I18nContext'
import { useCeres } from '../hooks/useCeres'

interface ConnectButtonProps {
  /** Render as a large CTA button (centered, full-width) */
  variant?: 'header' | 'cta'
  className?: string
}

export function ConnectButton({ variant = 'header', className = '' }: ConnectButtonProps) {
  const { t } = useI18n()
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { useUserTokenId } = useCeres()
  const navigate = useNavigate()

  const [modalOpen, setModalOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
  const userTokenId = useUserTokenId()

  const copyAddress = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = address
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    setDropdownOpen(false)
  }

  const handleViewProfile = () => {
    if (userTokenId != null) {
      navigate(`/profile/${userTokenId}`)
    }
    setDropdownOpen(false)
  }

  const handleSwitchAccount = () => {
    setDropdownOpen(false)
    disconnect()
    // Clear wagmi's cached connection state from localStorage
    const wagmiKeys = Object.keys(localStorage).filter(k => k.startsWith('wagmi'))
    wagmiKeys.forEach(k => localStorage.removeItem(k))
    // Force page reload to pick up the new OKX account
    window.location.reload()
  }

  const handleDisconnect = () => {
    disconnect()
    setDropdownOpen(false)
  }

  if (isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium flex items-center gap-1.5 ${className}`}
        >
          {shortAddress}
          <svg
            className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <>
            {/* Click-outside backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[180px]">
              {/* Copy Address */}
              <button
                onClick={copyAddress}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied ? '✓ Copied!' : 'Copy Address'}
              </button>

              {/* View Profile (if user has a DID) */}
              {userTokenId != null && (
                <button
                  onClick={handleViewProfile}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </button>
              )}

              {/* Divider */}
              <div className="border-t border-gray-100 my-1" />

              {/* Switch Account */}
              <button
                onClick={handleSwitchAccount}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Switch Account
              </button>

              {/* Disconnect */}
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  const baseButtonClasses = variant === 'cta'
    ? 'px-8 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all'
    : 'text-sm px-4 py-2 rounded-lg font-medium shadow-sm transition-colors'

  const availableConnectors = connectors.filter((c) => c.type !== 'injected' || !!c.name)

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`${baseButtonClasses} bg-emerald-600 text-white hover:bg-emerald-700 ${className}`}
      >
        {variant === 'cta' ? `🔗 ${t('common.connect')}` : t('common.connect')}
      </button>

      {/* Wallet Selector Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Connect Wallet</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">Choose your wallet to connect to Ceres on Sepolia.</p>

            <div className="space-y-2">
              {availableConnectors.map((connector) => (
                <button
                  key={connector.uid ?? connector.id}
                  onClick={() => {
                    connect({ connector })
                    setModalOpen(false)
                  }}
                  disabled={isPending}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Wallet icon */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shrink-0">
                    {connector.icon ? (
                      <img src={connector.icon} alt="" className="w-6 h-6" />
                    ) : (
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{connector.name}</p>
                    <p className="text-xs text-gray-400">Detected</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}

              {availableConnectors.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🦊</div>
                  <p className="text-sm font-medium text-gray-700 mb-1">No wallet detected</p>
                  <p className="text-xs text-gray-400">
                    Please install MetaMask or another wallet extension and refresh the page.
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center mt-6">
              By connecting, you agree to use Sepolia testnet.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
