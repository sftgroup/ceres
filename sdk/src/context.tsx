import { type ReactNode, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config as defaultConfig } from './config'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WagmiConfig = any

export interface CeresProviderProps {
  children: ReactNode
  /**
   * Optional wagmi config override. Defaults to the built-in Sepolia config.
   * Pass a custom config to use a different chain, transport, or multi-chain setup.
   */
  wagmiConfig?: WagmiConfig
  /**
   * Optional QueryClient override for shared cache across providers.
   */
  queryClient?: QueryClient
}

/**
 * Top-level provider that wraps your app with:
 * 1. `WagmiProvider` (with the Ceres Sepolia wagmi config)
 * 2. `QueryClientProvider` (for react-query cache used by wagmi read hooks)
 *
 * @example
 * ```tsx
 * import { CeresProvider } from '@ceres/sdk'
 *
 * function App() {
 *   return (
 *     <CeresProvider>
 *       <YourApp />
 *     </CeresProvider>
 *   )
 * }
 * ```
 */
export function CeresProvider({
  children,
  wagmiConfig = defaultConfig,
  queryClient: externalQueryClient,
}: CeresProviderProps) {
  const [internalQueryClient] = useState(() => new QueryClient())
  const queryClient = externalQueryClient ?? internalQueryClient

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
