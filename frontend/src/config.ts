import { http, createConfig, injected } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

const SEPOLIA_RPC = 'https://sepolia.gateway.tenderly.co'

export const config = createConfig({
  chains: [sepolia, mainnet],
  syncConnectedChain: true,
  ssr: false,
  multiInjectedProviderDiscovery: true,
  connectors: [
    // Generic injected — EIP-6963 multi-provider discovery auto-detects all wallets
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC),
    [mainnet.id]: http('https://eth.merkle.io'),
  },
})
