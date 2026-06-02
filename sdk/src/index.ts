// ── ABIs ──────────────────────────────────────────────
export { CeresDID_ABI, CeresRegistry_ABI } from './abis'

// ── Contract Addresses ──────────────────────────────
export {
  CERES_DID_ADDRESS,
  CERES_REGISTRY_ADDRESS,
  didContract,
  registryContract,
} from './addresses'

// ── Types & Constants ──────────────────────────────
export type { Profile, ProfileWithId, UseProfileResult, UseUserTokenIdResult } from './types'
export { LEVEL_NAMES, LEVEL_COLORS } from './types'

// ── React Hooks ────────────────────────────────────
export {
  useProfile,
  useInviter,
  useDescendantCount,
  useBalanceOf,
  useTotalProfiles,
  useUserTokenId,
  useTotalSupply,
  useProfileCount,
  useMintFee,
  useMintFeeEnabled,
  useContractBalance,
  useOwner,
  useIsOwner,
  useLevel,
  useAncestors,
  useDirectInvitees,
  useCreateProfile,
  useUpdateProfile,
  useSetMintFee,
  useToggleMintFee,
  useWithdrawFees,
  useInvalidateProfile,
  useInvalidateAll,
  getLevelName,
  getLevelColor,
} from './hooks'

// ── Pure Read Functions (no React) ────────────────
export {
  getProfile,
  getInviter,
  getDescendantCount,
  getBalanceOf,
  getTotalProfiles,
  getUserTokenId,
} from './read'

// ── Provider ────────────────────────────────────────
export { CeresProvider } from './context'
export type { CeresProviderProps } from './context'

// ── Wagmi Config ────────────────────────────────────
export { config } from './config'
