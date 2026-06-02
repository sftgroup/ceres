import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAccount, useSwitchChain, useChainId } from 'wagmi'
import { useI18n } from '../I18nContext'
import { ConnectButton } from './ConnectButton'

const CHAIN_LABELS: Record<number, string> = {
  11155111: 'Sepolia',
  1: 'Ethereum',
  17000: 'Holesky',
  31337: 'Hardhat',
}

const CHAIN_ICONS: Record<number, string> = {
  11155111: '🧪',
  1: '💎',
  17000: '🕳️',
  31337: '⚒️',
}

export function Navbar() {
  const { t, locale, setLocale } = useI18n()
  const { isConnected } = useAccount()
  const { chains, switchChain, isPending: isSwitching } = useSwitchChain()
  const chainId = useChainId()
  const navigate = useNavigate()
  const [chainMenuOpen, setChainMenuOpen] = useState(false)
  const [chainMsg, setChainMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (!chainMsg) return
    const t = setTimeout(() => setChainMsg(null), 2500)
    return () => clearTimeout(t)
  }, [chainMsg])

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-200 group-hover:shadow-lg transition-shadow">
              C
            </div>
            <span className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
              Ceres
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">
              {t('nav.home')}
            </Link>
            <Link to="/search" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">
              {t('nav.search')}
            </Link>
            <Link to="/invite" className="text-gray-600 hover:text-emerald-600 transition-colors font-medium">
              {t('nav.invite')}
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'zh-TW' : 'en')}
              className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
            >
              {locale === 'en' ? '中' : 'EN'}
            </button>

            {/* Chain Switcher */}
            {isConnected && (
              <div className="relative">
                <button
                  onClick={() => setChainMenuOpen(!chainMenuOpen)}
                  disabled={isSwitching}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:border-emerald-300 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>{CHAIN_ICONS[chainId] ?? '⛓️'}</span>
                  <span className="font-medium">
                    {isSwitching ? '...' : (CHAIN_LABELS[chainId] ?? `Chain ${chainId}`)}
                  </span>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {chainMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setChainMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[160px]">
                      {chains.map((c) => (
                        <button
                          key={c.id}
                          disabled={isSwitching}
                          onClick={async () => {
                            setChainMenuOpen(false)
                            try {
                              await switchChain({ chainId: c.id })
                              setChainMsg({ text: `Switched to ${CHAIN_LABELS[c.id] ?? c.name}`, ok: true })
                            } catch (e: any) {
                              const userRejected = e?.code === 4001 || e?.message?.includes('rejected') || e?.message?.includes('denied')
                              setChainMsg({
                                text: userRejected ? 'Request cancelled' : `Failed to switch: ${e?.message?.slice(0, 60) ?? 'Unknown error'}`,
                                ok: false,
                              })
                            }
                          }}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors disabled:opacity-50 ${
                            c.id === chainId
                              ? 'bg-emerald-50 text-emerald-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span>{CHAIN_ICONS[c.id] ?? '⛓️'}</span>
                          <span>{CHAIN_LABELS[c.id] ?? c.name}</span>
                          {c.id === chainId && (
                            <svg className="w-4 h-4 ml-auto text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Wallet */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/invite')}
                  className="text-sm px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium"
                >
                  {t('invite.title')}
                </button>
                <ConnectButton variant="header" />
              </div>
            ) : (
              <ConnectButton variant="header" />
            )}
          </div>
        </div>
      </div>

      {/* Chain switch toast */}
      {chainMsg && (
        <div
          className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium transition-all ${
            chainMsg.ok
              ? 'bg-emerald-600 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {chainMsg.ok ? '✅ ' : '❌ '}
          {chainMsg.text}
        </div>
      )}
    </nav>
  )
}
