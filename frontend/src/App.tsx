import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

/**
 * After "Switch Account" triggers a page reload, sessionStorage holds the
 * chosen connector id. On mount, find it and auto-connect — the wallet
 * will show its account picker since this is a fresh page context.
 */
function WalletSync({ children }: { children: React.ReactNode }) {
  const { connectors, connect } = useConnect()
  const { isConnected } = useAccount()

  useEffect(() => {
    const storedId = sessionStorage.getItem('ceres_reconnect')
    if (!storedId || isConnected) return

    // Connectors may not be ready immediately after wagmi init
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

  // wagmi v3 handles accountsChanged / chainChanged / disconnect
  // internally via EIP-6963 connector providers. No need for manual listeners.

  return <>{children}</>
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <BrowserRouter>
            <WalletSync>
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
              </WalletSync>
          </BrowserRouter>
        </I18nProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
