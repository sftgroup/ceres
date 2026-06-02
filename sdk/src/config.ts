import { http, createConfig } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'

const SEPOLIA_RPC = 'https://sepolia.gateway.tenderly.co'

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

/**
 * Default wagmi config targeting Sepolia testnet (where Ceres is deployed)
 * with a fallback to Ethereum mainnet.
 *
 * Import and pass a custom `createConfig` to `CeresProvider` if
 * you need different chains or RPC endpoints.
 */
export const config = createConfig({
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC),
    [mainnet.id]: http('https://eth.merkle.io'),
  },
})
