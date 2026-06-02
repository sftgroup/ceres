/** Raw profile data returned from the CeresDID contract */
export interface Profile {
  name: string
  bio: string
  avatar: string
  updatedAt: bigint
}

/** Full profile with on-chain ownership and level metadata */
export interface ProfileWithId extends Profile {
  tokenId: bigint
  owner: `0x${string}`
  level: number
  levelName: string
}

/** Human-readable level names mapped from contract uint8 values */
export const LEVEL_NAMES: Record<number, string> = {
  0: 'Seed',
  1: 'Bronze',
  2: 'Silver',
  3: 'Gold',
  4: 'Crystal',
  5: 'Diamond',
}

/** Level colours for UI rendering */
export const LEVEL_COLORS: Record<number, string> = {
  0: '#9CA3AF', // Gray
  1: '#CD7F32', // Bronze
  2: '#C0C0C0', // Silver
  3: '#FFD700', // Gold
  4: '#A855F7', // Crystal
  5: '#3B82F6', // Diamond
}

/** Return type for useProfile hook */
export interface UseProfileResult {
  data: ProfileWithId | undefined
  isLoading: boolean
  isError: boolean
}

/** Return type for useUserTokenId hook */
export type UseUserTokenIdResult = bigint | undefined
