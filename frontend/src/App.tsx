import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount, useReconnect } from 'wagmi'
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

// Wallet event sync — watches for account/chain changes from wallet
function WalletSync({ children }: { children: React.ReactNode }) {
  const { reconnect } = useReconnect()
  const { isConnected } = useAccount()

  useEffect(() => {
    const ethereum = (window as any).ethereum
    if (!ethereum) return

    const handleAccountsChanged = () => {
      // Wagmi should handle this, but force reconnect to be safe
      if (isConnected) {
        reconnect()
      }
    }

    const handleChainChanged = () => {
      // Wagmi's syncConnectedChain should handle this
    }

    ethereum.on('accountsChanged', handleAccountsChanged)
    ethereum.on('chainChanged', handleChainChanged)
    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged)
      ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [reconnect, isConnected])

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
