import { useEffect, Component } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useConnect, useAccount } from 'wagmi'
import { config } from './config'
import { I18nProvider } from './I18nContext'
import { Navbar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { InvitePage } from './pages/InvitePage'
import { MintPage } from './pages/MintPage'
import { SearchPage } from './pages/SearchPage'
import { AdminPage } from './pages/AdminPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

class AppErrorBoundary extends Component<{ children: React.ReactNode }, { error: string | null }> {
  state = { error: null as string | null }
  static getDerivedStateFromError(e: Error) { return { error: e.message } }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 mb-4">{this.state.error}</p>
            <button onClick={() => { this.setState({ error: null }); window.location.reload() }}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

/** Auto-connects after "Switch Account" page reload */
function WalletSync({ children }: { children: React.ReactNode }) {
  const { connectors, connect } = useConnect()
  const { isConnected } = useAccount()

  useEffect(() => {
    const storedId = sessionStorage.getItem('ceres_reconnect')
    if (!storedId || isConnected) return

    const timer = setInterval(() => {
      const c = connectors.find(
        (x: any) => x.id === storedId || x.uid === storedId || x.name === storedId,
      )
      if (c) {
        clearInterval(timer)
        sessionStorage.removeItem('ceres_reconnect')
        connect({ connector: c })
      }
    }, 100)

    const timeout = setTimeout(() => clearInterval(timer), 8000)
    return () => {
      clearInterval(timer)
      clearTimeout(timeout)
    }
  }, [isConnected, connectors, connect])

  return <>{children}</>
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <AppErrorBoundary>
            <WalletSync>
              <HashRouter>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/profile/:tokenId" element={<ProfilePage />} />
                      <Route path="/invite" element={<InvitePage />} />
                      <Route path="/mint" element={<MintPage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                  </main>
                </div>
              </HashRouter>
            </WalletSync>
          </AppErrorBoundary>
        </I18nProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
