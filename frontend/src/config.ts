import { http, createConfig } from 'wagmi'
import { sepolia, mainnet, holesky, hardhat } from 'wagmi/chains'

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

export const config = createConfig({
  chains: [sepolia, mainnet, holesky, hardhat],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [holesky.id]: http(),
    [hardhat.id]: http(),
  },
})
