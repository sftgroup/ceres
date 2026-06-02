import { CeresDID_ABI, CeresRegistry_ABI } from './abis'

/** CeresDID NFT contract address on Sepolia testnet */
export const CERES_DID_ADDRESS = '0x159f4001C8692A777A842f3F0A76f268aF1A8F39' as const

/** CeresRegistry contract address on Sepolia testnet */
export const CERES_REGISTRY_ADDRESS = '0x9043489CFFe56C1C5b5E1b8Fb1E4bc384B575116' as const

/** Pre-built wagmi/viem contract config for CeresDID */
export const didContract = {
  address: CERES_DID_ADDRESS,
  abi: CeresDID_ABI,
} as const

/** Pre-built wagmi/viem contract config for CeresRegistry */
export const registryContract = {
  address: CERES_REGISTRY_ADDRESS,
  abi: CeresRegistry_ABI,
} as const
