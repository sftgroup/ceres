import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useI18n } from '../I18nContext'

export function InvitePage() {
  const { t } = useI18n()
  const { isConnected } = useAccount()
  const [copied, setCopied] = useState(false)

  // Generate invite link — we need the user's tokenId, which we don't easily have here.
  // For now, we'll show the address-based link and let them enter their tokenId.
  const [tokenId, setTokenId] = useState('')

  const inviteUrl = tokenId
    ? `${window.location.origin}/invite?ref=${tokenId}`
    : null

  const handleCopy = async () => {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('invite.noProfile')}</h2>
        <p className="text-gray-500">{t('common.connect') + ' to get started'}</p>
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

      {/* Enter Token ID */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('invite.yourLink')}</h2>
        <p className="text-sm text-gray-500 mb-4">
          Enter your DID Token ID to generate your invite link:
        </p>
        <div className="flex gap-3">
          <input
            type="number"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-lg"
            placeholder="Your DID Token ID"
          />
        </div>

        {inviteUrl && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <code className="flex-1 text-sm text-gray-700 break-all font-mono">{inviteUrl}</code>
              <button
                onClick={handleCopy}
                className="shrink-0 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                {copied ? t('invite.copied') : t('invite.copyLink')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('invite.preview')}</h2>
        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            C
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Create your Ceres DID</h3>
          <p className="text-sm text-gray-500 mb-4">
            You were invited{tokenId ? ` by DID #${tokenId}` : ''}. Join the decentralized social graph.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">
            {t('home.hero.cta')}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
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
