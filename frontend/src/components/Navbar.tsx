import { Link, useNavigate } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useI18n } from '../I18nContext'

export function Navbar() {
  const { t, locale, setLocale } = useI18n()
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const navigate = useNavigate()

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

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

            {/* Wallet */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/invite')}
                  className="text-sm px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium"
                >
                  {t('invite.title')}
                </button>
                <button
                  onClick={() => disconnect()}
                  className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                >
                  {shortAddress}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (connectors[0]) connect({ connector: connectors[0] })
                }}
                className="text-sm px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium shadow-sm"
              >
                {t('common.connect')}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
