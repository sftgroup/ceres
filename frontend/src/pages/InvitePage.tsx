import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useCeres } from '../hooks/useCeres'
import { useI18n } from '../I18nContext'
import { ConnectButton } from '../components/ConnectButton'
import { NetworkGraph } from '../components/NetworkGraph'
import { ErrorBoundary } from '../components/ErrorBoundary'

export function InvitePage() {
  const { t } = useI18n()
  const { address, isConnected } = useAccount()
  const { useBalanceOf, useUserTokenId } = useCeres()
  const [copied, setCopied] = useState(false)

  const { data: balance } = useBalanceOf(address as `0x${string}` | undefined)
  const hasCeresDID = balance != null && Number(balance) > 0
  const userTokenId = useUserTokenId()

  const inviteUrl = userTokenId
    ? `${window.location.origin}/mint?ref=${String(userTokenId)}`
    : null

  const handleCopy = async () => {
    if (!inviteUrl) return
    try {
      // HTTPS: use Clipboard API
      await navigator.clipboard.writeText(inviteUrl)
    } catch {
      // HTTP fallback
      const ta = document.createElement('textarea')
      ta.value = inviteUrl
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-6">🔗</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Connect Your Wallet</h2>
          <p className="text-gray-500 mb-8">Connect your wallet to view your invite link and grow your network.</p>
          <ConnectButton variant="cta" />
        </div>
      </div>
    )
  }

  // User does NOT have a DID — prompt to create one
  if (!hasCeresDID) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🌱</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('invite.noProfile')}</h2>
        <p className="text-gray-500 mb-6">
          You need a DID profile before you can invite others. Create one now to get your invite link!
        </p>
        <Link
          to="/mint"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-lg shadow-emerald-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('invite.createFirst')}
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">🔗</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('invite.title')}</h1>
        <p className="text-gray-500">{t('invite.description')}</p>
      </div>

      {/* Your Invite Link */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-emerald-500">✅</span>
          <h2 className="text-lg font-semibold text-gray-900">{t('invite.yourLink')}</h2>
          {userTokenId && (
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-medium ml-1">
              DID #{String(userTokenId)}
            </span>
          )}
        </div>

        {userTokenId ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Share this link with friends to grow your network:
            </p>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <code className="flex-1 text-sm text-gray-700 break-all font-mono">
                  {inviteUrl}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('invite.copied')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {t('invite.copyLink')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" />
            <p className="text-sm text-gray-400 mt-2">Detecting your DID...</p>
          </div>
        )}
      </div>

      {/* Network Graph */}
      {userTokenId && (
        <ErrorBoundary>
          <NetworkGraph tokenId={userTokenId} />
        </ErrorBoundary>
      )}

      {/* Tips */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tips</h2>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            Share your invite link on social media to grow your network
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            Each person you invite becomes part of your descendant tree
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            Your level increases as your descendant count grows
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5">✓</span>
            DID NFTs are transferable — relationships follow the NFT
          </li>
        </ul>
      </div>
    </div>
  )
}
