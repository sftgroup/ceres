import { useState, useMemo } from 'react'
import { useI18n } from '../I18nContext'
import { useCeres } from '../hooks/useCeres'
import { ProfileCard } from '../components/ProfileCard'

const RECENT_TOKEN_IDS = [1n, 2n, 3n, 4n, 5n]

export function SearchPage() {
  const { t } = useI18n()
  const { useTotalProfiles } = useCeres()
  const { data: totalProfiles } = useTotalProfiles()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<bigint[]>([])

  const handleSearch = () => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      return
    }
    try {
      const id = BigInt(trimmed)
      if (id > 0n) {
        setResults([id])
        return
      }
    } catch {
      // Not a valid number — try address lookup (simplified for now)
    }
    setResults([])
  }

  const maxProfiles = totalProfiles != null ? Number(totalProfiles) : 0
  const recentIds = useMemo(() => {
    return RECENT_TOKEN_IDS.filter((id) => maxProfiles === 0 || id <= BigInt(maxProfiles))
  }, [maxProfiles])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-[#e0e0e8] mb-2">{t('search.title')}</h1>
        <p className="text-[#6b6b80]">
          {maxProfiles > 0 ? t('search.profileCount', { count: maxProfiles }) : t('search.explore')}
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-xl mx-auto mb-10">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555570]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-11 pr-4 py-3 border border-[#333355] rounded-xl focus:ring-2 focus:ring-[#0a2e1a]0 focus:border-emerald-500 outline-none text-base"
              placeholder={t('search.placeholder')}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-[#10b981] text-[#e0e0e8] rounded-xl hover:bg-[#059669] transition-colors font-medium"
          >
            {t('search.button')}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-[#e0e0e8] mb-4">
            {t('search.results', { count: results.length })}
          </h2>
          <div className="space-y-3">
            {results.map((id) => (
              <ProfileCard key={String(id)} tokenId={id} />
            ))}
          </div>
        </div>
      )}

      {query.trim() && results.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-[#6b6b80]">{t('search.noResults')}</p>
          <p className="text-sm text-[#555570] mt-1">
            {t('search.hint')}
          </p>
        </div>
      )}

      {/* Recent Profiles */}
      {!query.trim() && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#e0e0e8]">{t('search.recent')}</h2>
          </div>
          <div className="space-y-3">
            {recentIds.map((id) => (
              <ProfileCard key={String(id)} tokenId={id} />
            ))}
          </div>
          {maxProfiles > 5 && (
            <p className="text-center text-sm text-[#555570] mt-6">
              {t('search.moreProfiles', { count: maxProfiles - 5 })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
