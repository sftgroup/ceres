import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useCeres } from '../hooks/useCeres'
import { useI18n } from '../I18nContext'
import { GlobalNetworkGraph } from '../components/GlobalNetworkGraph'
import { LevelBadge } from '../components/LevelBadge'
import { CreateProfileModal } from '../components/CreateProfileModal'
import { ProfileCard } from '../components/ProfileCard'

const LEVELS = [
  { level: 0, icon: '🌱', descKey: 'home.levels.seed' },
  { level: 1, icon: '🥉', descKey: 'home.levels.bronze' },
  { level: 2, icon: '🥈', descKey: 'home.levels.silver' },
  { level: 3, icon: '🥇', descKey: 'home.levels.gold' },
  { level: 4, icon: '💎', descKey: 'home.levels.crystal' },
  { level: 5, icon: '🔷', descKey: 'home.levels.diamond' },
]

/** Query the most recent N profiles by tokenId — always calls hooks fixed N times */
const RECENT_COUNT = 6

function useRecentProfiles() {
  const { useProfile, useTotalProfiles } = useCeres()
  const { data: totalProfiles } = useTotalProfiles()
  const totalProf = totalProfiles != null ? Number(totalProfiles) : 0
  const results = []
  for (let i = 0; i < RECENT_COUNT; i++) {
    const tokenId = RECENT_COUNT - i
    const enabled = tokenId <= totalProf
    results.push(useProfile(enabled ? BigInt(tokenId) : undefined))
  }
  return results
}

export function HomePage() {
  const { t } = useI18n()
  const { isConnected } = useAccount()
  const { useTotalProfiles, useTotalSupply, useProfileCount } = useCeres()
  const { data: totalProfiles } = useTotalProfiles()
  const { data: totalSupply } = useTotalSupply()
  const { data: profileCount } = useProfileCount()

  const [showCreate, setShowCreate] = useState(false)
  const [profileCardTokenId, setProfileCardTokenId] = useState<bigint | null>(null)

  const totalProf = totalProfiles != null ? Number(totalProfiles) : 0
  const totalSup = totalSupply != null ? Number(totalSupply) : 0
  const hasProfile = profileCount != null && Number(profileCount) > 0

  // Recent profiles — show latest 6
  const recentQueries = useRecentProfiles()
  const recentProfiles = useMemo(() => {
    return recentQueries
      .map((q) => q.data)
      .filter(Boolean)
      .filter((p: any) => p?.name)
      .slice(0, 6)
  }, [recentQueries])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-20 right-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100/80 rounded-full text-emerald-700 text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {t('app.beta')}
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                {t('home.hero.title')}
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-4">{t('home.hero.subtitle')}</p>
            <p className="text-gray-500 mb-8">{t('app.description')}</p>
            {isConnected && hasProfile ? (
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {t('nav.search')}
              </Link>
            ) : (
              <button
                onClick={() => isConnected ? setShowCreate(true) : null}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('home.hero.cta')}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">{totalProf.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">{t('home.stats.profiles')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600">{totalSup.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">{t('home.stats.connections')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600">6</div>
              <div className="text-sm text-gray-500 mt-1">{t('home.stats.levels')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">Sepolia</div>
              <div className="text-sm text-gray-500 mt-1">{t('home.stats.network')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌐 Global Network Graph */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <GlobalNetworkGraph />
      </section>

      {/* 🌐 All Networks Module */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">🌐 {t('home.network.title')}</h2>
          <p className="text-gray-500">{t('home.network.desc')}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Network Overview Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('home.network.overview')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-lg">🌱</div>
                  <div>
                    <p className="text-sm text-gray-500">{t('home.network.totalDids')}</p>
                    <p className="text-xl font-bold text-emerald-700">{totalProf.toLocaleString()}</p>
                  </div>
                </div>
                <Link to="/search" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                  {t('home.network.searchArrow')}
                </Link>
              </div>

              <div className="flex items-center justify-between p-4 bg-teal-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-lg">🔗</div>
                  <div>
                    <p className="text-sm text-gray-500">{t('home.network.totalInvites')}</p>
                    <p className="text-xl font-bold text-teal-700">{totalSup.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-lg">📊</div>
                  <div>
                    <p className="text-sm text-gray-500">{t('home.network.density')}</p>
                    <p className="text-xl font-bold text-amber-700">
                      {totalProf > 0 ? ((totalSup / totalProf)).toFixed(1) : '—'}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-amber-500">{t('home.network.connPerDid')}</span>
              </div>
            </div>
          </div>

          {/* Recent Members Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('home.network.recentMembers')}</h3>
              <Link to="/search" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                {t('home.network.viewAll')}
              </Link>
            </div>

            {recentProfiles.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">🌾</div>
                <p className="text-sm">{t('home.network.noProfiles')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProfiles.map((p: any, i: number) => {
                  const memberTokenId = BigInt(totalProf - recentProfiles.length + i + 1)
                  return (
                    <div
                      key={i}
                      onClick={() => setProfileCardTokenId(memberTokenId)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {p.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm group-hover:text-emerald-600 transition-colors truncate">
                          {p.name || t('home.network.unknown')}
                        </p>
                        <p className="text-xs text-gray-400">
                          DID #{String(memberTokenId)}
                        </p>
                      </div>
                      <LevelBadge level={p.level ?? 0} size="sm" />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Level Distribution */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('home.levels.distribution')}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {LEVELS.map((l) => (
              <div key={l.level} className="text-center p-4 rounded-xl bg-gray-50 hover:bg-emerald-50 transition-colors group">
                <div className="text-2xl mb-2">{l.icon}</div>
                <LevelBadge level={l.level} size="sm" />
                <p className="text-[10px] text-gray-400 mt-1 leading-tight">{t(l.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('home.cta.title')}</h2>
          <p className="text-emerald-100 mb-8 max-w-lg mx-auto">
            {t('home.cta.desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowCreate(true)}
              className="px-8 py-3 bg-white text-emerald-700 font-semibold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
            >
              {t('home.hero.cta')}
            </button>
            <Link
              to="/search"
              className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              {t('nav.search')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded flex items-center justify-center text-white font-bold text-xs">C</div>
              {t('app.footer.tagline')}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{t('app.network')}</span>
              <span>·</span>
              <a href="https://github.com/sftgroup/ceres" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

      <CreateProfileModal open={showCreate} onClose={() => setShowCreate(false)} />

      {profileCardTokenId != null && (
        <ProfileCard
          tokenId={profileCardTokenId}
          onClose={() => setProfileCardTokenId(null)}
          onNavigate={(nextId) => setProfileCardTokenId(nextId)}
        />
      )}
    </div>
  )
}
