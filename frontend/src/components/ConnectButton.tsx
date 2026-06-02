import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useI18n } from '../I18nContext'
import { useCeres } from '../hooks/useCeres'

interface ConnectButtonProps {
  variant?: 'header' | 'cta'
  className?: string
}

export function ConnectButton({ variant = 'header', className = '' }: ConnectButtonProps) {
  const { t } = useI18n()
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { useUserTokenId } = useCeres()
  const navigate = useNavigate()

  const [openModal, setOpenModal] = useState<'connect' | 'switch' | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''
  const userTokenId = useUserTokenId()

  const copyAddress = async () => {
    if (!address) return
    try {
      await navigator.clipboard.writeText(address)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = address
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    setDropdownOpen(false)
  }

  const handleViewProfile = () => {
    if (userTokenId != null) navigate(`/profile/${userTokenId}`)
    setDropdownOpen(false)
  }

  const handleDisconnect = () => {
    disconnect()
    setDropdownOpen(false)
  }

  const doSwitchAccount = (c: (typeof connectors)[number]) => {
    setOpenModal(null)
    sessionStorage.setItem('ceres_reconnect', c.id || c.uid || c.name)
    disconnect()
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('wagmi')) localStorage.removeItem(k)
    })
    window.location.reload()
  }

  const showModal = openModal !== null
  const modalTitle = openModal === 'connect' ? t('common.connect') : t('common.switchAccount')
  const modalHint =
    openModal === 'connect'
      ? t('common.chooseWallet')
      : t('common.chooseNewAccount')

  return (
    <>
      {/* ── Connected state ── */}
      {isConnected ? (
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`text-sm px-3 py-1.5 rounded-lg bg-[#16162a] text-[#a0a0b0] hover:bg-[#1a1a2e] transition-colors font-medium flex items-center gap-1.5 ${className}`}
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
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1 bg-[#12121a] border border-[#2a2a40] rounded-xl shadow-glow-cyan z-50 py-1 min-w-[180px]">
                <button
                  onClick={copyAddress}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#a0a0b0] hover:bg-[#12121a] transition-colors text-left"
                >
                  <CopyIcon />
                  {copied ? t('common.copied') : t('common.copyAddress')}
                </button>

                {userTokenId != null && (
                  <button
                    onClick={handleViewProfile}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#a0a0b0] hover:bg-[#12121a] transition-colors text-left"
                  >
                    <ProfileIcon />
                    {t('common.viewProfile')}
                  </button>
                )}

                <div className="border-t border-gray-100 my-1" />

                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    setOpenModal('switch')
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#a0a0b0] hover:bg-[#12121a] transition-colors text-left"
                >
                  <SwitchIcon />
                  {t('common.switchAccount')}
                </button>

                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogoutIcon />
                  {t('common.disconnect')}
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        /* ── Disconnected state ── */
        <button
          onClick={() => setOpenModal('connect')}
          className={`${
            variant === 'cta'
              ? 'px-8 py-4 text-lg font-semibold rounded-2xl shadow-glow-cyan hover:shadow-glow-cyan transform hover:-translate-y-0.5 transition-all'
              : 'text-sm px-4 py-2 rounded-lg font-medium shadow-glow-cyan transition-colors'
          } bg-[#10b981] text-[#e0e0e8] hover:bg-[#059669] ${className}`}
        >
          {variant === 'cta' ? `🔗 ${t('common.connect')}` : t('common.connect')}
        </button>
      )}

      {/* ── Wallet Selector Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setOpenModal(null)}
        >
          <div
            className="bg-[#12121a] rounded-2xl shadow-glow-cyan max-w-sm w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#e0e0e8]">{modalTitle}</h2>
              <button
                onClick={() => setOpenModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#16162a] text-[#555570] hover:text-[#808090]"
              >
                <XIcon />
              </button>
            </div>
            <p className="text-sm text-[#6b6b80] mb-4">{modalHint}</p>

            <div className="space-y-2">
              {connectors.map((c) => (
                <button
                  key={c.uid ?? c.id}
                  onClick={() => {
                    if (openModal === 'connect') {
                      setOpenModal(null)
                      connect({ connector: c })
                    } else {
                      doSwitchAccount(c)
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#2a2a40] hover:border-[#10b981]/40 hover:bg-[#0a2e1a] transition-all text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f3d22] to-[#0f3d38] flex items-center justify-center shrink-0 overflow-hidden">
                    {c.icon ? (
                      <img src={c.icon} alt="" className="w-6 h-6" />
                    ) : (
                      <span className="text-lg">🦊</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#e0e0e8] text-sm">{c.name}</p>
                    <p className="text-xs text-[#555570]">{t('common.detected')}</p>
                  </div>
                  <ArrowRightIcon />
                </button>
              ))}

              {connectors.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🦊</div>
                  <p className="text-sm font-medium text-[#a0a0b0] mb-1">{t('common.noWallet')}</p>
                  <p className="text-xs text-[#555570]">
                    {t('common.installWallet')}
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-[#555570] text-center mt-6">
              {openModal === 'connect'
                ? t('common.agreeConnect')
                : t('common.reloadHint')}
            </p>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Inline SVG helpers ── */

function CopyIcon() {
  return (
    <svg className="w-4 h-4 text-[#555570]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg className="w-4 h-4 text-[#555570]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function SwitchIcon() {
  return (
    <svg className="w-4 h-4 text-[#555570]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}
