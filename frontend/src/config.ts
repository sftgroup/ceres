import { http, createConfig } from 'wagmi'
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
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC),
    [mainnet.id]: http('https://eth.merkle.io'),
  },
})
